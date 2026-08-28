import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {
    extractAIText,
    getAIModel,
    getGeminiApiKeyError,
} from "./src/lib/geminiConfig.js";

const JWT_SECRET =
    process.env.JWT_SECRET || "super-secret-codeforces-key-12345";

dotenv.config();

const geminiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

// Helper for robust JSON parsing

function safeParseJSON(text: string) {
    try {
        return JSON.parse(text.trim());
    } catch (e) {
        // Look for the first JSON-like block [ ... ] or { ... }

        const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

        if (match) {
            try {
                return JSON.parse(match[0].trim());
            } catch (err) {
                console.error("Failed to parse extracted JSON block:", err);
            }
        }

        throw e;
    }
}

const app = express();

    const configuredPort = Number(process.env.PORT);

    const PORT =
        Number.isInteger(configuredPort) && configuredPort > 0
            ? configuredPort
            : 3000;

    app.use(express.json({ limit: "1mb" }));

    app.use(express.urlencoded({ extended: true, limit: "1mb" }));

    app.use(cookieParser());

    // Initialize SQLite Database (Turso / libSQL)
    const dbClient = createClient({
        url: process.env.TURSO_DATABASE_URL || "file:database.sqlite",
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const db = {
        exec: async (sql: string) => dbClient.executeMultiple(sql),
        run: async (sql: string, params: any[] = []) => dbClient.execute({ sql, args: params }),
        get: async (sql: string, params: any[] = []) => (await dbClient.execute({ sql, args: params })).rows[0] || null,
        all: async (sql: string, params: any[] = []) => (await dbClient.execute({ sql, args: params })).rows
    };

    (async () => {
        try {
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    handle TEXT PRIMARY KEY,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS friends (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_handle TEXT,
                    friend_handle TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_handle, friend_handle)
                );

                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    handle TEXT,
                    role TEXT,
                    content TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS bookmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_handle TEXT,
                    problem_id TEXT,
                    problem_name TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_handle, problem_id)
                );

                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_handle TEXT,
                    problem_id TEXT,
                    note TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_handle, problem_id)
                );

                -- Query indexes for performance
                CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_handle);
                CREATE INDEX IF NOT EXISTS idx_chat_handle ON chat_history(handle);
                CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_handle);
                CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_handle);
            `);

            console.log("SQLite Database initialized successfully.");
        } catch (err) {
            console.error("Failed to initialize database:", err);
        }
    })();

    // API Route for Codeforces Proxy
    // Bounded LRU cache — evicts oldest entries when max size is reached
    const MAX_CACHE_SIZE = 500;
    const cfCache = new Map<
        string,
        { data: any; timestamp: number; ttl: number }
    >();

    function evictCache(cache: Map<string, any>) {
        if (cache.size > MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey !== undefined) cache.delete(firstKey);
        }
    }

    let lastCfRequestTime = 0;

    const MIN_CF_INTERVAL = 250; // 250ms between requests to Codeforces

    app.get("/api/codeforces/:method", async (req, res) => {
        const { method } = req.params;

        const cacheKey = `${method}:${JSON.stringify(req.query)}`;

        // Determine TTL based on method
        let ttl = 1000 * 60 * 2; // Default 2 minutes

        if (method === "problemset.problems") ttl = 1000 * 60 * 60 * 6; // 6 hours

        if (method === "contest.list") ttl = 1000 * 60 * 30; // 30 minutes

        if (method === "user.info") ttl = 1000 * 60 * 10; // 10 minutes

        // Check cache
        const cached = cfCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return res.json(cached.data);
        }

        // Rate limiting / Sequencing
        const now = Date.now();

        const waitTime = Math.max(0, lastCfRequestTime + MIN_CF_INTERVAL - now);

        lastCfRequestTime = now + waitTime;

        if (waitTime > 0) {
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        try {
            const response = await axios.get(
                `https://codeforces.com/api/${method}`,
                {
                    params: req.query,
                    timeout: 60000,
                },
            );

            // Store in cache if successful
            if (response.data.status === "OK") {
                cfCache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now(),
                    ttl,
                });
                evictCache(cfCache);
            }

            res.json(response.data);
        } catch (error: any) {
            if (error.response?.status === 429) {
                console.log(`Codeforces 429 Limited - ${method}`);
                // If we have stale cache, serve it during 429
                if (cached) {
                    return res.json(cached.data);
                }
                return res.status(429).json({
                    status: "FAILED",
                    comment:
                        "Codeforces is currently limiting requests. Please wait a few seconds and refresh.",
                });
            }

            if (error.response?.status && error.response.status < 500) {
                console.log(
                    `Codeforces API client status info (${method}, Status ${error.response.status}):`,
                    error.message,
                );
            } else {
                console.log(
                    `Codeforces API status info (${method}):`,
                    error.message,
                );
            }

            // Handle Gateway Timeout specifically with a more helpful message
            if (
                error.code === "ECONNABORTED" ||
                error.response?.status === 504
            ) {
                return res.status(504).json({
                    status: "FAILED",
                    comment:
                        "Codeforces API is currently slow or overloaded. Please try again in a moment.",
                });
            }

            res.status(error.response?.status || 500).json({
                status: "FAILED",
                comment: error.response?.data?.comment || error.message,
            });
        }
    });

    // API route for AI coaching
    const aiCache = new Map<string, { data: any; timestamp: number }>();
    const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache
    const MAX_AI_CACHE_SIZE = 200;

    app.post("/api/ai/generate", async (req, res) => {
        const keyError = getGeminiApiKeyError(geminiKey);
        if (keyError) {
            return res.status(500).json({
                error: keyError,
            });
        }

        const body = req.body ?? {};
        const prompt = typeof body.prompt === "string" ? body.prompt : "";
        const raw = body.raw === true;

        if (typeof prompt !== "string" || !prompt.trim()) {
            return res
                .status(400)
                .json({ error: "A non-empty prompt is required." });
        }
        if (prompt.length > 30_000) {
            return res.status(413).json({ error: "Prompt is too long." });
        }

        const model = getAIModel(geminiKey);

        // For raw (chat) mode, skip cache to keep conversation fresh
        const cacheKey = `${model}:${raw}:${prompt}`;
        if (!raw) {
            const cached = aiCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                return res.json(cached.data);
            }
        }

        try {
            let text = "";

            if (geminiKey?.startsWith("sk-or-")) {
                const response = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.8,
                        max_tokens: 1800,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${geminiKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://cf-visualizer.netlify.app",
                            "X-Title": "CF Visualizer",
                        },
                        timeout: 120000,
                    },
                );
                text = extractAIText(
                    response.data?.choices?.[0]?.message?.content ?? "",
                );
            } else {
                const { GoogleGenAI } = await import("@google/genai");
                const ai = new GoogleGenAI({ apiKey: geminiKey });
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: { maxOutputTokens: 1800 },
                });
                text = response.text ?? "";
            }

            if (!text) throw new Error("Empty response from AI");

            if (raw) {
                return res.json({ text: text.trim() });
            } else {
                try {
                    const data = safeParseJSON(text);
                    aiCache.set(cacheKey, { data, timestamp: Date.now() });
                    if (aiCache.size > MAX_AI_CACHE_SIZE) {
                        const firstKey = aiCache.keys().next().value;
                        if (firstKey !== undefined) aiCache.delete(firstKey);
                    }
                    res.json(data);
                } catch (parseError: any) {
                    console.error(
                        "AI JSON Parse Error:",
                        parseError.message,
                        "Raw text:",
                        text,
                    );
                    res.status(500).json({
                        error: "Failed to parse AI response as JSON",
                        details: parseError.message,
                        raw: text,
                    });
                }
            }
        } catch (error: any) {
            if (error.response?.status === 429 || error.status === 429) {
                return res.status(429).json({
                    error: "AI Quota Exceeded",
                    message:
                        "The AI coach is currently resting. Heuristic analysis is being used as a fallback.",
                    retryAfter: 60,
                });
            }

            console.error(
                "Gemini API unusual error:",
                error.response?.data || error.message,
            );
            res.status(500).json({
                error:
                    error.message ||
                    "An unexpected error occurred during AI analysis.",
            });
        }
    });

    // API route for chat history database
    app.get("/api/chat/:handle", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = req.params.handle;
            const messages = await db.all(
                "SELECT role, content FROM chat_history WHERE handle = ? ORDER BY id ASC",
                [handle],
            );
            res.json({ success: true, messages });
        } catch (error) {
            console.error("Error fetching chat:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.post("/api/chat/:handle", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = req.params.handle;
            const { role, content } = req.body;
            if (!role || !content)
                return res.status(400).json({
                    success: false,
                    error: "Role and content are required",
                });

            await db.run(
                "INSERT INTO chat_history (handle, role, content) VALUES (?, ?, ?)",
                [handle, role, content],
            );
            res.json({ success: true });
        } catch (error) {
            console.error("Error saving chat:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.delete("/api/chat/:handle", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = req.params.handle;
            await db.run("DELETE FROM chat_history WHERE handle = ?", [handle]);
            res.json({ success: true });
        } catch (error) {
            console.error("Error clearing chat:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    // --- Auth API ---
    const generateToken = (handle: string) => {
        return jwt.sign({ handle }, JWT_SECRET, { expiresIn: "7d" });
    };

    const verifyToken = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const token = req.cookies.token;
        if (!token)
            return res
                .status(401)
                .json({ success: false, error: "Unauthorized" });
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { handle: string };
            (req as any).userHandle = decoded.handle;
            next();
        } catch (e) {
            return res
                .status(401)
                .json({ success: false, error: "Invalid token" });
        }
    };

    app.post("/api/auth/register", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const { handle, password } = req.body;
            if (!handle || !password)
                return res.status(400).json({
                    success: false,
                    error: "Handle and password required",
                });

            const existing = await db.get(
                "SELECT handle FROM users WHERE handle = ?",
                [handle],
            );
            if (existing)
                return res.status(400).json({
                    success: false,
                    error: "Handle already registered",
                });

            try {
                await axios.get(
                    `https://codeforces.com/api/user.info?handles=${handle}`,
                );
            } catch (err: any) {
                return res.status(400).json({
                    success: false,
                    error: "User not found on Codeforces",
                });
            }

            const hash = await bcrypt.hash(password, 10);
            await db.run(
                "INSERT INTO users (handle, password_hash) VALUES (?, ?)",
                [handle, hash],
            );

            const token = generateToken(handle);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({
                success: true,
                message: "Registration successful",
                handle,
            });
        } catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.post("/api/auth/login", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const { handle, password } = req.body;
            if (!handle || !password)
                return res.status(400).json({
                    success: false,
                    error: "Handle and password required",
                });

            const user = await db.get(
                "SELECT password_hash FROM users WHERE handle = ?",
                [handle],
            );
            if (!user)
                return res.status(401).json({
                    success: false,
                    error: "Invalid handle or password",
                });

            const isValid = await bcrypt.compare(password, user.password_hash as string);
            if (!isValid)
                return res.status(401).json({
                    success: false,
                    error: "Invalid handle or password",
                });

            const token = generateToken(handle);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.json({ success: true, message: "Login successful", handle });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.get("/api/auth/me", verifyToken, (req, res) => {
        res.json({ success: true, handle: (req as any).userHandle });
    });

    app.post("/api/auth/logout", (req, res) => {
        res.clearCookie("token");
        res.json({ success: true });
    });

    // --- Friends API ---
    app.get("/api/friends/:handle", async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = req.params.handle;
            const friends = await db.all(
                "SELECT friend_handle FROM friends WHERE user_handle = ? ORDER BY created_at DESC",
                [handle],
            );
            res.json({
                success: true,
                friends: friends.map((f) => f.friend_handle),
            });
        } catch (error) {
            console.error("Error fetching friends:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.post("/api/friends/:handle", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = req.params.handle;
            const authHandle = (req as any).userHandle;
            if (handle.toLowerCase() !== authHandle.toLowerCase())
                return res
                    .status(403)
                    .json({ success: false, error: "Forbidden" });

            const { friendHandle } = req.body;
            if (!friendHandle)
                return res
                    .status(400)
                    .json({ success: false, error: "Friend handle required" });

            try {
                await axios.get(
                    `https://codeforces.com/api/user.info?handles=${friendHandle}`,
                );
            } catch (err: any) {
                return res.status(400).json({
                    success: false,
                    error: "User not found on Codeforces",
                });
            }

            await db.run(
                "INSERT OR IGNORE INTO friends (user_handle, friend_handle) VALUES (?, ?)",
                [handle, friendHandle],
            );
            res.json({ success: true });
        } catch (error) {
            console.error("Error adding friend:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.delete(
        "/api/friends/:handle/:friend",
        verifyToken,
        async (req, res) => {
            try {
                if (!db)
                    return res.status(500).json({
                        success: false,
                        error: "Database not initialized",
                    });
                const handle = req.params.handle;
                const friend = req.params.friend;
                await db.run(
                    "DELETE FROM friends WHERE user_handle = ? AND friend_handle = ?",
                    [handle, friend],
                );
                res.json({ success: true });
            } catch (error) {
                console.error("Error removing friend:", error);
                res.status(500).json({
                    success: false,
                    error: "Internal Server Error",
                });
            }
        },
    );

    // --- Bookmarks API ---
    app.get("/api/bookmarks", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = (req as any).userHandle;
            const bookmarks = await db.all(
                "SELECT * FROM bookmarks WHERE user_handle = ? ORDER BY created_at DESC",
                [handle],
            );
            res.json({ success: true, bookmarks });
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.post("/api/bookmarks", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = (req as any).userHandle;
            const { problemId, problemName } = req.body;
            if (!problemId || !problemName)
                return res.status(400).json({
                    success: false,
                    error: "Problem ID and Name required",
                });

            await db.run(
                "INSERT OR IGNORE INTO bookmarks (user_handle, problem_id, problem_name) VALUES (?, ?, ?)",
                [handle, problemId, problemName],
            );
            res.json({ success: true });
        } catch (error) {
            console.error("Error adding bookmark:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.delete("/api/bookmarks/:problemId", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = (req as any).userHandle;
            const problemId = req.params.problemId;
            await db.run(
                "DELETE FROM bookmarks WHERE user_handle = ? AND problem_id = ?",
                [handle, problemId],
            );
            await db.run(
                "DELETE FROM notes WHERE user_handle = ? AND problem_id = ?",
                [handle, problemId],
            );
            res.json({ success: true });
        } catch (error) {
            console.error("Error removing bookmark:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    // --- Notes API ---
    app.get("/api/notes", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = (req as any).userHandle;
            const notes = await db.all(
                "SELECT * FROM notes WHERE user_handle = ?",
                [handle],
            );
            res.json({ success: true, notes });
        } catch (error) {
            console.error("Error fetching notes:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    app.post("/api/notes", verifyToken, async (req, res) => {
        try {
            if (!db)
                return res.status(500).json({
                    success: false,
                    error: "Database not initialized",
                });
            const handle = (req as any).userHandle;
            const { problemId, note } = req.body;
            if (!problemId || note === undefined)
                return res.status(400).json({
                    success: false,
                    error: "Problem ID and note required",
                });

            await db.run(
                `
                INSERT INTO notes (user_handle, problem_id, note) VALUES (?, ?, ?)
                ON CONFLICT(user_handle, problem_id) DO UPDATE SET note=excluded.note
            `,
                [handle, problemId, note],
            );
            res.json({ success: true });
        } catch (error) {
            console.error("Error adding/updating note:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const isApiOnly = process.argv.includes("--api-only");
        if (!isApiOnly) {
            (async () => {
                const vite = await createViteServer({
                    server: { middlewareMode: true },
                    appType: "spa",
                });
                app.use(vite.middlewares);
            })();
        }
        
        // Start server locally if not on Vercel
        if (!process.env.VERCEL) {
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`Server running at http://0.0.0.0:${PORT}`);
            });
        }
    } else {
        // Vercel will handle static files in production, but if running locally via `npm run start`
        if (!process.env.VERCEL) {
            const distPath = path.join(process.cwd(), "dist");
            app.use(express.static(distPath));
            app.get("*", (req, res) => {
                res.sendFile(path.join(distPath, "index.html"));
            });
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`Server running at http://0.0.0.0:${PORT}`);
            });
        }
    }

export default app;
