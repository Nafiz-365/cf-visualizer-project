import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-codeforces-key-12345";
const geminiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

// ─── AI helpers ───────────────────────────────────────────────────────────────
function getAIProvider(key?: string) {
    if (!key?.trim()) return "none";
    if (key.trim().startsWith("sk-or-")) return "openrouter";
    if (key.trim().startsWith("AIza")) return "gemini";
    return "none";
}
function getAIModel(key?: string) {
    return getAIProvider(key) === "openrouter" ? "openai/gpt-4o-mini" : "gemini-2.5-flash";
}
function getGeminiApiKeyError(key?: string) {
    if (!key?.trim()) return "AI API key is not configured.";
    if (getAIProvider(key) === "none") return 'Use a Google AI Studio key starting with "AIza" or an OpenRouter key starting with "sk-or-".';
    return null;
}
function extractAIText(content: unknown): string {
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) return content.map(extractAIText).filter(Boolean).join("\n").trim();
    if (content && typeof content === "object") {
        const r = content as Record<string, unknown>;
        if (typeof r.text === "string") return r.text.trim();
        if (typeof r.content === "string") return r.content.trim();
        if (typeof r.message === "string") return r.message.trim();
        if (Array.isArray(r.content)) return extractAIText(r.content);
        if (r.parts && Array.isArray(r.parts)) return extractAIText(r.parts);
        if (r.message && typeof r.message === "object") return extractAIText(r.message);
        if (r.choices && Array.isArray(r.choices)) {
            const first = r.choices[0] as Record<string, unknown> | undefined;
            if (first?.message && typeof first.message === "object") return extractAIText(first.message);
            if (typeof first?.text === "string") return (first.text as string).trim();
        }
    }
    return "";
}
function safeParseJSON(text: string) {
    try { return JSON.parse(text.trim()); } catch {
        const m = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (m) return JSON.parse(m[0].trim());
        throw new Error("Invalid JSON");
    }
}

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ─── Database ─────────────────────────────────────────────────────────────────
let dbClient: ReturnType<typeof createClient> | null = null;
try {
    const dbUrl = process.env.TURSO_DATABASE_URL;
    if (dbUrl) {
        dbClient = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });
    }
} catch (e) {
    console.warn("Failed to create Turso client:", e);
}

const db = {
    exec: async (sql: string) => dbClient ? dbClient.executeMultiple(sql) : null,
    run: async (sql: string, params: any[] = []) => dbClient ? dbClient.execute({ sql, args: params }) : null,
    get: async (sql: string, params: any[] = []) => dbClient ? (await dbClient.execute({ sql, args: params })).rows[0] || null : null,
    all: async (sql: string, params: any[] = []) => dbClient ? (await dbClient.execute({ sql, args: params })).rows : [],
};

if (dbClient) {
    (async () => {
        try {
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (handle TEXT PRIMARY KEY, password_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
                CREATE TABLE IF NOT EXISTS friends (id INTEGER PRIMARY KEY AUTOINCREMENT, user_handle TEXT, friend_handle TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_handle, friend_handle));
                CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, handle TEXT, role TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
                CREATE TABLE IF NOT EXISTS bookmarks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_handle TEXT, problem_id TEXT, problem_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_handle, problem_id));
                CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_handle TEXT, problem_id TEXT, note TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_handle, problem_id));
                CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_handle);
                CREATE INDEX IF NOT EXISTS idx_chat_handle ON chat_history(handle);
                CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_handle);
                CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_handle);
            `);
        } catch (err) { console.error("DB init error:", err); }
    })();
}

// ─── Codeforces Proxy ─────────────────────────────────────────────────────────
const MAX_CACHE_SIZE = 500;
const cfCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
let lastCfRequestTime = 0;
const MIN_CF_INTERVAL = 250;

function evictCache(cache: Map<string, any>) {
    if (cache.size > MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
    }
}

app.get("/api/codeforces/:method", async (req, res) => {
    const { method } = req.params;
    const cacheKey = `${method}:${JSON.stringify(req.query)}`;
    let ttl = 1000 * 60 * 2;
    if (method === "problemset.problems") ttl = 1000 * 60 * 60 * 6;
    if (method === "contest.list") ttl = 1000 * 60 * 30;
    if (method === "user.info") ttl = 1000 * 60 * 10;
    if (method === "user.ratedList") ttl = 1000 * 60 * 15;

    const cached = cfCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) return res.json(cached.data);

    const now = Date.now();
    const waitTime = Math.max(0, lastCfRequestTime + MIN_CF_INTERVAL - now);
    lastCfRequestTime = now + waitTime;
    if (waitTime > 0) await new Promise(r => setTimeout(r, waitTime));

    try {
        const response = await axios.get(`https://codeforces.com/api/${method}`, {
            params: req.query, timeout: 60000,
        });
        if (response.data.status === "OK") {
            cfCache.set(cacheKey, { data: response.data, timestamp: Date.now(), ttl });
            evictCache(cfCache);
        }
        res.json(response.data);
    } catch (error: any) {
        if (error.response?.status === 429) {
            if (cached) return res.json(cached.data);
            return res.status(429).json({ status: "FAILED", comment: "Rate limited. Please wait and retry." });
        }
        res.status(error.response?.status || 500).json({
            status: "FAILED", comment: error.response?.data?.comment || error.message,
        });
    }
});

// ─── AI Route ─────────────────────────────────────────────────────────────────
const aiCache = new Map<string, { data: any; timestamp: number }>();
const AI_CACHE_TTL = 1000 * 60 * 60;

app.post("/api/ai/generate", async (req, res) => {
    const keyError = getGeminiApiKeyError(geminiKey);
    if (keyError) return res.status(500).json({ error: keyError });

    const { prompt, raw } = req.body ?? {};
    if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "A non-empty prompt is required." });
    if (prompt.length > 30_000) return res.status(413).json({ error: "Prompt too long." });

    const model = getAIModel(geminiKey);
    const cacheKey = `${model}:${raw}:${prompt}`;
    if (!raw) {
        const c = aiCache.get(cacheKey);
        if (c && Date.now() - c.timestamp < AI_CACHE_TTL) return res.json(c.data);
    }

    try {
        let text = "";
        if (geminiKey?.startsWith("sk-or-")) {
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model, messages: [{ role: "user", content: prompt }], temperature: 0.8, max_tokens: 1800,
            }, {
                headers: { Authorization: `Bearer ${geminiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://cf-visualizer-project.vercel.app", "X-Title": "CF Visualizer" },
                timeout: 120000,
            });
            text = extractAIText(response.data?.choices?.[0]?.message?.content ?? "");
        } else {
            const { GoogleGenAI } = await import("@google/genai");
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const response = await ai.models.generateContent({ model, contents: prompt, config: { maxOutputTokens: 1800 } });
            text = response.text ?? "";
        }
        if (!text) throw new Error("Empty response from AI");

        if (raw) return res.json({ text: text.trim() });
        const data = safeParseJSON(text);
        aiCache.set(cacheKey, { data, timestamp: Date.now() });
        if (aiCache.size > 200) { const k = aiCache.keys().next().value; if (k) aiCache.delete(k); }
        res.json(data);
    } catch (error: any) {
        if (error.response?.status === 429 || error.status === 429) return res.status(429).json({ error: "AI Quota Exceeded" });
        res.status(500).json({ error: error.message || "AI error" });
    }
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
const generateToken = (handle: string) => jwt.sign({ handle }, JWT_SECRET, { expiresIn: "7d" });
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { handle: string };
        (req as any).userHandle = decoded.handle;
        next();
    } catch { return res.status(401).json({ success: false, error: "Invalid token" }); }
};

app.post("/api/auth/register", async (req, res) => {
    try {
        if (!dbClient) return res.status(500).json({ success: false, error: "Database not configured" });
        const { handle, password } = req.body;
        if (!handle || !password) return res.status(400).json({ success: false, error: "Handle and password required" });
        const existing = await db.get("SELECT handle FROM users WHERE handle = ?", [handle]);
        if (existing) return res.status(400).json({ success: false, error: "Handle already registered" });
        try { await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 10000 }); }
        catch { return res.status(400).json({ success: false, error: "User not found on Codeforces" }); }
        const hash = await bcrypt.hash(password, 10);
        await db.run("INSERT INTO users (handle, password_hash) VALUES (?, ?)", [handle, hash]);
        const token = generateToken(handle);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, message: "Registration successful", handle });
    } catch (error) { console.error("Register error:", error); res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        if (!dbClient) return res.status(500).json({ success: false, error: "Database not configured" });
        const { handle, password } = req.body;
        if (!handle || !password) return res.status(400).json({ success: false, error: "Handle and password required" });
        const user = await db.get("SELECT password_hash FROM users WHERE handle = ?", [handle]);
        if (!user) return res.status(401).json({ success: false, error: "Invalid handle or password" });
        const isValid = await bcrypt.compare(password, user.password_hash as string);
        if (!isValid) return res.status(401).json({ success: false, error: "Invalid handle or password" });
        const token = generateToken(handle);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, message: "Login successful", handle });
    } catch (error) { console.error("Login error:", error); res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.get("/api/auth/me", verifyToken, (req, res) => res.json({ success: true, handle: (req as any).userHandle }));
app.post("/api/auth/logout", (req, res) => { res.clearCookie("token", { secure: true, sameSite: "none" }); res.json({ success: true }); });

// ─── Friends ──────────────────────────────────────────────────────────────────
app.get("/api/friends/:handle", async (req, res) => {
    try {
        const friends = await db.all("SELECT friend_handle FROM friends WHERE user_handle = ? ORDER BY created_at DESC", [req.params.handle]);
        res.json({ success: true, friends: friends.map((f: any) => f.friend_handle) });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.post("/api/friends/:handle", verifyToken, async (req, res) => {
    try {
        if (!dbClient) return res.status(500).json({ success: false, error: "Database not configured" });
        const handle = req.params.handle;
        if (handle.toLowerCase() !== (req as any).userHandle.toLowerCase()) return res.status(403).json({ success: false, error: "Forbidden" });
        const { friendHandle } = req.body;
        if (!friendHandle) return res.status(400).json({ success: false, error: "Friend handle required" });
        try { await axios.get(`https://codeforces.com/api/user.info?handles=${friendHandle}`, { timeout: 10000 }); }
        catch { return res.status(400).json({ success: false, error: "User not found on Codeforces" }); }
        await db.run("INSERT OR IGNORE INTO friends (user_handle, friend_handle) VALUES (?, ?)", [handle, friendHandle]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.delete("/api/friends/:handle/:friend", verifyToken, async (req, res) => {
    try {
        await db.run("DELETE FROM friends WHERE user_handle = ? AND friend_handle = ?", [req.params.handle, req.params.friend]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

// ─── Bookmarks ────────────────────────────────────────────────────────────────
app.get("/api/bookmarks", verifyToken, async (req, res) => {
    try {
        const bookmarks = await db.all("SELECT * FROM bookmarks WHERE user_handle = ? ORDER BY created_at DESC", [(req as any).userHandle]);
        res.json({ success: true, bookmarks });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.post("/api/bookmarks", verifyToken, async (req, res) => {
    try {
        const { problemId, problemName } = req.body;
        if (!problemId || !problemName) return res.status(400).json({ success: false, error: "Problem ID and Name required" });
        await db.run("INSERT OR IGNORE INTO bookmarks (user_handle, problem_id, problem_name) VALUES (?, ?, ?)", [(req as any).userHandle, problemId, problemName]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.delete("/api/bookmarks/:problemId", verifyToken, async (req, res) => {
    try {
        const handle = (req as any).userHandle;
        await db.run("DELETE FROM bookmarks WHERE user_handle = ? AND problem_id = ?", [handle, req.params.problemId]);
        await db.run("DELETE FROM notes WHERE user_handle = ? AND problem_id = ?", [handle, req.params.problemId]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

// ─── Notes ────────────────────────────────────────────────────────────────────
app.get("/api/notes", verifyToken, async (req, res) => {
    try {
        const notes = await db.all("SELECT * FROM notes WHERE user_handle = ?", [(req as any).userHandle]);
        res.json({ success: true, notes });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.post("/api/notes", verifyToken, async (req, res) => {
    try {
        const { problemId, note } = req.body;
        if (!problemId || note === undefined) return res.status(400).json({ success: false, error: "Problem ID and note required" });
        await db.run("INSERT INTO notes (user_handle, problem_id, note) VALUES (?, ?, ?) ON CONFLICT(user_handle, problem_id) DO UPDATE SET note=excluded.note", [(req as any).userHandle, problemId, note]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

// ─── Chat History ─────────────────────────────────────────────────────────────
app.get("/api/chat/:handle", async (req, res) => {
    try {
        const messages = await db.all("SELECT role, content FROM chat_history WHERE handle = ? ORDER BY id ASC", [req.params.handle]);
        res.json({ success: true, messages });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.post("/api/chat/:handle", async (req, res) => {
    try {
        const { role, content } = req.body;
        if (!role || !content) return res.status(400).json({ success: false, error: "Role and content required" });
        await db.run("INSERT INTO chat_history (handle, role, content) VALUES (?, ?, ?)", [req.params.handle, role, content]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

app.delete("/api/chat/:handle", async (req, res) => {
    try {
        await db.run("DELETE FROM chat_history WHERE handle = ?", [req.params.handle]);
        res.json({ success: true });
    } catch { res.status(500).json({ success: false, error: "Internal Server Error" }); }
});

export default app;
