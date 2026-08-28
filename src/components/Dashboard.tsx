import React, {
    useState,
    useEffect,
    useMemo,
    useDeferredValue,
    lazy,
    Suspense,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    Trophy,
    TrendingUp,
    Users,
    XCircle,
    Code2,
    ExternalLink,
    Share2,
    Search,
    Zap,
    BarChart3,
    Bookmark,
    Download,
    Target,
    LayoutList,
    Menu,
    X,
    AlertTriangle,
    Activity,
} from "lucide-react";
import { format } from "date-fns";
import { CodeforcesService } from "../services/codeforces";
import { Button } from "./ui/Button";
import { GeminiService, AIInsight } from "../services/geminiService";
import { cn } from "../lib/utils";
import { ErrorState } from "./ErrorState";
import { Milestone } from "lucide-react";

import { User, RatingChange, Submission, Problem, Contest } from "../types";
import { getRankBg } from "../lib/utils";
import {
    generateFallbackUser,
    generateFallbackRatingHistory,
    generateFallbackSubmissions,
} from "../lib/fallbackData";
import { DetailItem } from "./DetailItem";
import { DashboardSkeleton } from "./ui/DashboardSkeleton";

const OverviewTab = lazy(() =>
    import("./dashboard/OverviewTab").then((m) => ({ default: m.OverviewTab })),
);
const AnalyticsTab = lazy(() =>
    import("./dashboard/AnalyticsTab").then((m) => ({
        default: m.AnalyticsTab,
    })),
);
const AiTab = lazy(() =>
    import("./dashboard/AiTab").then((m) => ({ default: m.AiTab })),
);
const PrepTab = lazy(() =>
    import("./dashboard/PrepTab").then((m) => ({ default: m.PrepTab })),
);
const SubmissionsTab = lazy(() =>
    import("./dashboard/SubmissionsTab").then((m) => ({
        default: m.SubmissionsTab,
    })),
);
const SocialTab = lazy(() =>
    import("./dashboard/SocialTab").then((m) => ({ default: m.SocialTab })),
);
const BookmarksAndNotes = lazy(() =>
    import("./BookmarksAndNotes").then((m) => ({
        default: m.BookmarksAndNotes,
    })),
);
const Timeline = lazy(() =>
    import("./Timeline").then((m) => ({ default: m.Timeline })),
);
const RatingPredictor = lazy(() =>
    import("./RatingPredictor").then((m) => ({ default: m.RatingPredictor })),
);
const ContestAnalyzer = lazy(() =>
    import("./ContestAnalyzer").then((m) => ({ default: m.ContestAnalyzer })),
);

export function Dashboard() {
    const { handle } = useParams<{ handle: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [ratingHistory, setRatingHistory] = useState<RatingChange[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [problemset, setProblemset] = useState<Problem[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] =
        useState<Submission | null>(null);
    const [copied, setCopied] = useState(false);
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Tablet/Desktop specific state
    const [sortKey, setSortKey] = useState<string>("creationTimeSeconds");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [searchQuery, setSearchQuery] = useState("");
    // Deferred value: the input stays instant, the heavy filter runs at lower priority
    const deferredSearch = useDeferredValue(searchQuery);
    const [verdictFilter, setVerdictFilter] = useState("ALL");
    const [languageFilter, setLanguageFilter] = useState("ALL");

    useEffect(() => {
        if (handle) {
            loadData(handle);
            saveToRecent(handle);
        }
    }, [handle]);

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    const exportSubmissionsToCSV = () => {
        const dataToExport = processedSubmissions.length
            ? processedSubmissions
            : submissions;
        if (!dataToExport.length) return;

        const headers = [
            "Problem Name",
            "Verdict",
            "Language",
            "Time Consumed (ms)",
            "Memory Consumed (MB)",
        ];
        const rows = dataToExport.map((sub) => [
            `"${sub.problem.name.replace(/"/g, '""')}"`, // Handle quotes in names
            sub.verdict,
            sub.programmingLanguage,
            sub.timeConsumedMillis.toString(),
            (sub.memoryConsumedBytes / 1024 / 1024).toFixed(2),
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `cf_submissions_${handle}_${format(new Date(), "yyyy-MM-dd")}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveToRecent = (h: string) => {
        const recent = JSON.parse(
            localStorage.getItem("recent_handles") || "[]",
        );
        const updated = [
            h,
            ...recent.filter((item: string) => item !== h),
        ].slice(0, 5);
        localStorage.setItem("recent_handles", JSON.stringify(updated));
    };

    const loadData = async (h: string) => {
        setLoading(true);
        setError(null);
        setIsOfflineMode(false);
        setAiInsights([]);

        const safeFetch = async <T,>(
            promise: Promise<T>,
            defaultValue: T,
        ): Promise<T> => {
            try {
                return await promise;
            } catch (e) {
                console.warn("Non-critical fetch failed:", e);
                return defaultValue;
            }
        };

        try {
            const [fetchedUser, fetchedRating] = await Promise.all([
                CodeforcesService.getUserInfo(h),
                CodeforcesService.getUserRating(h),
            ]);

            setUser(fetchedUser);
            setRatingHistory(fetchedRating);

            const fetchedStatus = await safeFetch(
                CodeforcesService.getUserStatus(h),
                [],
            );
            setSubmissions(fetchedStatus);
            setLoading(false);

            const stats = calculateAnalytics(fetchedStatus, fetchedRating);
            void generateAIInsights(fetchedUser, fetchedRating, stats);
        } catch (err: any) {
            const is404 =
                err.response?.status === 404 ||
                err.message?.toLowerCase().includes("not found") ||
                err.response?.data?.comment
                    ?.toLowerCase()
                    .includes("not found");

            if (is404) {
                setError(err.message || "Failed to fetch user data");
                setLoading(false);
            } else {
                console.warn(
                    "Critical fetch failed, falling back to simulated trace data:",
                    err,
                );
                setIsOfflineMode(true);
                setUser(generateFallbackUser(h));
                setRatingHistory(generateFallbackRatingHistory(h));
                setSubmissions(generateFallbackSubmissions(h));
                setLoading(false);
            }
        }

        void Promise.all([
            safeFetch(CodeforcesService.getProblemSet(), []),
            safeFetch(CodeforcesService.getContests(), []),
            safeFetch(CodeforcesService.getUserBlogEntries(h), []),
        ])
            .then(([p, c, b]) => {
                setProblemset(p);
                setContests(c);
                setBlogs(b);
            })
            .catch(() => {
                // Optional extras failed, but core UI should remain usable.
            });
    };

    const refreshSubmissions = async () => {
        if (!handle) return;
        setRefreshing(true);
        try {
            const s = await CodeforcesService.getUserStatus(handle);
            setSubmissions(s);
        } catch (err: any) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    const generateAIInsights = async (
        user: any,
        history: any[],
        stats: any,
    ) => {
        if (!user || stats.totalSolved === 0) return;
        setLoadingInsights(true);
        try {
            const insights = await GeminiService.analyzeProfile(
                user,
                history,
                stats,
            );
            setAiInsights(insights);
        } catch (err) {
            console.error("AI Insight Error:", err);
        } finally {
            setLoadingInsights(false);
        }
    };

    const calculateAnalytics = (
        subs: Submission[],
        history: RatingChange[] = [],
    ) => {
        const solved = subs.filter((s) => s.verdict === "OK");
        const uniqueSolved = new Set(
            solved.map((s) => `${s.problem.contestId}-${s.problem.index}`),
        );

        // Advanced Insights
        const tags: Record<string, number> = {};
        const hours: Record<number, number> = {};
        solved.forEach((s) => {
            s.problem.tags.forEach((t) => (tags[t] = (tags[t] || 0) + 1));
            const hour = new Date(s.creationTimeSeconds * 1000).getHours();
            hours[hour] = (hours[hour] || 0) + 1;
        });

        const bestTag =
            Object.entries(tags).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
        const peakHour =
            Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;

        // Performance Metrics
        const ratingChanges = history.map((r) => r.newRating - r.oldRating);
        const maxDelta = ratingChanges.length ? Math.max(...ratingChanges) : 0;
        const minDelta = ratingChanges.length ? Math.min(...ratingChanges) : 0;
        const positiveDeltas = ratingChanges.filter((d) => d > 0).length;
        const deltaSuccessRate = ratingChanges.length
            ? ((positiveDeltas / history.length) * 100).toFixed(1)
            : 0;
        const avgRank = history.length
            ? Math.round(
                  history.reduce((acc, r) => acc + r.rank, 0) / history.length,
              )
            : 0;

        return {
            totalSolved: uniqueSolved.size,
            accuracy: (
                (solved.length / Math.max(subs.length, 1)) *
                100
            ).toFixed(1),
            avgDifficulty:
                Math.round(
                    solved.reduce(
                        (acc, s) => acc + (s.problem.rating || 0),
                        0,
                    ) / Math.max(solved.length, 1),
                ) || 0,
            bestTag,
            peakHour: `${peakHour}:00`,
            maxDelta,
            minDelta,
            deltaSuccessRate,
            avgRank,
            contestCount: history.length,
        };
    };

    const analytics = useMemo(() => {
        if (!submissions.length) return null;
        return calculateAnalytics(submissions, ratingHistory);
    }, [submissions, ratingHistory]);

    // Compute live session stats for the AI tab
    const liveSessionStats = useMemo(() => {
        if (!submissions.length)
            return { streak: 0, intensity: "Low", efficiency: "0%" };

        // Streak: consecutive days with at least one accepted submission
        const solvedDays = new Set(
            submissions
                .filter((s) => s.verdict === "OK")
                .map((s) =>
                    new Date(s.creationTimeSeconds * 1000).toDateString(),
                ),
        );
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            if (solvedDays.has(d.toDateString())) streak++;
            else if (i > 0) break; // allow today to be missing
        }

        // Intensity: based on solves in last 30 days
        const thirtyDaysAgo = Date.now() / 1000 - 30 * 86400;
        const recentSolves = submissions.filter(
            (s) => s.verdict === "OK" && s.creationTimeSeconds > thirtyDaysAgo,
        ).length;
        const intensity =
            recentSolves > 60 ? "High" : recentSolves > 25 ? "Medium" : "Low";

        // Efficiency = accuracy
        const acc = analytics?.accuracy ?? 0;
        const efficiency = `${acc}%`;

        return { streak, intensity, efficiency };
    }, [submissions, analytics]);

    const availableLanguages = useMemo(() => {
        const langs = new Set<string>();
        submissions.forEach((s) => langs.add(s.programmingLanguage));
        return Array.from(langs).sort();
    }, [submissions]);

    const processedSubmissions = useMemo(() => {
        let filtered = [...submissions];

        if (deferredSearch) {
            const q = deferredSearch.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.problem.name.toLowerCase().includes(q) ||
                    s.problem.index.toLowerCase().includes(q),
            );
        }

        if (verdictFilter !== "ALL") {
            filtered = filtered.filter((s) => s.verdict === verdictFilter);
        }

        if (languageFilter !== "ALL") {
            filtered = filtered.filter(
                (s) => s.programmingLanguage === languageFilter,
            );
        }

        filtered.sort((a, b) => {
            let valA: any, valB: any;
            switch (sortKey) {
                case "problem":
                    valA = a.problem.name;
                    valB = b.problem.name;
                    break;
                case "verdict":
                    valA = a.verdict;
                    valB = b.verdict;
                    break;
                case "lang":
                    valA = a.programmingLanguage;
                    valB = b.programmingLanguage;
                    break;
                case "time":
                    valA = a.timeConsumedMillis;
                    valB = b.timeConsumedMillis;
                    break;
                case "memory":
                    valA = a.memoryConsumedBytes;
                    valB = b.memoryConsumedBytes;
                    break;
                case "when":
                    valA = a.creationTimeSeconds;
                    valB = b.creationTimeSeconds;
                    break;
                default:
                    valA = a.creationTimeSeconds;
                    valB = b.creationTimeSeconds;
            }
            return sortDirection === "asc"
                ? valA < valB
                    ? -1
                    : 1
                : valA > valB
                  ? -1
                  : 1;
        });

        return filtered;
    }, [
        submissions,
        deferredSearch,
        verdictFilter,
        languageFilter,
        sortKey,
        sortDirection,
    ]);

    const [activeTab, setActiveTab] = useState<
        | "overview"
        | "analytics"
        | "submissions"
        | "ai"
        | "prep"
        | "social"
        | "journey"
        | "predictor"
        | "contest-analyzer"
        | "bookmarks"
    >("overview");
    const [socialSubTab, setSocialSubTab] = useState<"cards" | "stream">(
        "cards",
    );
    const [activeAiTool, setActiveAiTool] = useState<
        "roadmap" | "chat" | "weakness"
    >("chat");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [heatmapRange, setHeatmapRange] = useState<
        "30" | "90" | "180" | "365"
    >("365");
    const [heatmapAnchor, setHeatmapAnchor] = useState(() =>
        format(new Date(), "yyyy-MM-dd"),
    );

    const focusTopic = analytics?.bestTag || "DP";
    const nextMilestone = Math.max(
        100 * Math.ceil(((user?.rating ?? 800) + 150) / 100),
        1000,
    );

    const TABS = [
        { id: "overview", label: "Overview", icon: LayoutList },
        { id: "contest-analyzer", label: "Contest Analyzer", icon: Trophy },
        { id: "predictor", label: "Predictor", icon: TrendingUp },
        { id: "ai", label: "AI Command Center", icon: Zap },
        { id: "prep", label: "Preparation", icon: Target },
        { id: "bookmarks", label: "Saved", icon: Bookmark },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "journey", label: "Journey", icon: Milestone },
        { id: "submissions", label: "History", icon: Code2 },
        { id: "social", label: "Social & Share", icon: Users },
    ] as const;

    if (loading) {
        return <DashboardSkeleton handle={handle} />;
    }

    if (error || !user) {
        return (
            <ErrorState
                message={error || "User not found"}
                onRetry={handle ? () => loadData(handle) : undefined}
                onHome={() => navigate("/")}
            />
        );
    }

    return (
        <div className="min-h-screen bg-bg-app flex relative">
            <div className="mesh-background">
                <div className="w-200 h-200 bg-brand-primary/10 -top-50 -left-50" />
                <div
                    className="w-150 h-150 bg-brand-secondary/10 top-[20%] -right-32"
                    style={{ animationDelay: "-5s" }}
                />
            </div>

            {/* Mobile Drawer (Overlay backdrop + Sidebar sliding from left) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-[6px] z-100"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="md:hidden fixed left-0 top-0 w-[84vw] max-w-[20rem] h-screen bg-bg-app border-r border-white/10 mobile-sidebar z-100 flex flex-col p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-[0_8px_24px_rgba(79,142,247,0.16)]">
                                        <Trophy size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-app font-black">
                                            Fury Hub
                                        </p>
                                        <p className="text-xs text-text-app font-semibold leading-tight">
                                            Quick actions
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-2xl text-muted-app hover:text-text-app hover:bg-white/10 transition-all"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-2">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-[1.15rem] transition-all duration-300 group relative text-sm",
                                                isActive
                                                    ? "bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/20 ring-1 ring-brand-primary/15"
                                                    : "text-muted-app hover:bg-white/10 hover:text-text-app",
                                            )}
                                        >
                                            <Icon
                                                size={18}
                                                className={cn(
                                                    "shrink-0 transition-transform duration-500",
                                                    isActive && "scale-110",
                                                )}
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">
                                                {tab.label}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabMobile"
                                                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="p-4 mt-auto">
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <button className="w-full flex items-center gap-3 px-4 py-4 rounded-[1.15rem] bg-white/5 border border-white/10 text-muted-app hover:bg-white/10 hover:text-text-app transition-all text-left shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                        <Search size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            New Scout
                                        </span>
                                    </button>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Modern Sidebar Navigation (Desktop) */}
            <aside className="hidden md:flex w-20 lg:w-64 border-r border-white/10 glass fixed left-0 top-0 h-screen flex-col z-50 transition-all duration-500 pt-8 backdrop-blur-3xl">
                <div className="px-4 pb-5 border-b border-white/10 mb-5 flex justify-center lg:justify-start">
                    <div className="flex items-center gap-0 lg:gap-3">
                        <div className="w-10 h-10 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm shadow-brand-primary/10 shrink-0">
                            <Trophy size={18} />
                        </div>
                        <div className="hidden lg:block ml-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-muted-app font-black">
                                Fury Hub
                            </p>
                            <p className="text-sm font-semibold text-text-app leading-tight">
                                Mission control
                            </p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-3 space-y-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-2 lg:px-4 py-3 rounded-3xl transition-all duration-300 group relative text-sm",
                                    isActive
                                        ? "bg-brand-primary/10 text-brand-primary shadow-sm shadow-brand-primary/20 ring-1 ring-brand-primary/15"
                                        : "text-muted-app hover:bg-white/10 hover:text-text-app",
                                )}
                            >
                                <Icon
                                    size={20}
                                    className={cn(
                                        "shrink-0 transition-transform duration-500",
                                        isActive && "scale-110",
                                    )}
                                />
                                <span className="text-[11px] font-bold uppercase tracking-widest hidden lg:block">
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <Link to="/">
                        <button className="w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-2 lg:px-4 py-4 rounded-3xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary hover:bg-brand-primary/10 transition-all text-left">
                            <Search size={18} className="shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
                                New Scout
                            </span>
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-0 mt-0 md:mt-0 md:ml-20 lg:ml-64 overflow-y-auto custom-scrollbar relative">
                <header className="sticky top-0 z-40 bg-bg-app/80 backdrop-blur-xl border-b border-white/5 px-3 sm:px-4 md:px-8 py-3 md:py-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 md:gap-5">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                className="md:hidden p-2 rounded-2xl text-muted-app hover:text-text-app hover:bg-white/10 transition-all"
                                aria-label="Open menu"
                            >
                                <Menu size={20} />
                            </button>
                            {/* User Profile Pill */}
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white/5 border border-white/10 px-1.5 py-1.5 pr-4 transition-all duration-300 hover:bg-white/10 hover:border-brand-primary/30 hover:shadow-[0_0_15px_rgba(var(--brand-primary),0.15)]"
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatar}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
                                        alt="User avatar"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-bg-app shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <div className="min-w-0 text-left max-w-22.5 sm:max-w-37.5">
                                    <p className="text-xs sm:text-sm font-bold text-text-app leading-tight truncate group-hover:text-brand-primary transition-colors">
                                        {user.handle}
                                    </p>
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-app">
                                        {user.rank || "Unranked"}
                                    </p>
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2 mr-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-emerald-500/80">
                                    Live Sync
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl p-2 text-muted-app border border-white/5 hover:bg-white/10 hover:text-text-app hover:border-white/10 transition-all"
                                onClick={handleShare}
                                title="Share Dashboard"
                            >
                                {copied ? (
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                        Copied
                                    </span>
                                ) : (
                                    <Share2 size={16} />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl p-2 text-muted-app border border-white/5 hover:bg-white/10 hover:text-text-app hover:border-white/10 transition-all"
                                onClick={exportSubmissionsToCSV}
                                title="Export CSV"
                            >
                                <Download size={16} />
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 md:pt-6 pb-24 md:pb-10">
                    {isOfflineMode && (
                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 backdrop-blur-md">
                            <div className="flex items-center gap-2.5">
                                <AlertTriangle
                                    size={16}
                                    className="text-amber-400 shrink-0"
                                />
                                <p className="leading-relaxed text-left">
                                    <strong>
                                        Codeforces API is currently experiencing
                                        issues (Status 503/429).
                                    </strong>{" "}
                                    Showing simulated trace metrics and fallback
                                    profile statistics for{" "}
                                    <strong>{handle}</strong> to keep your
                                    dashboard interactive.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handle && loadData(handle)}
                                className="text-[10px] font-black uppercase tracking-widest bg-amber-500/25 hover:bg-amber-500/40 text-white rounded-xl border border-amber-500/30 whitespace-nowrap py-1.5 px-3 h-auto shrink-0 transition-all"
                            >
                                Reconnect API
                            </Button>
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{
                                duration: 0.35,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        >
                            <Suspense
                                fallback={
                                    <div className="flex justify-center items-center py-24">
                                        <Activity
                                            className="animate-spin text-brand-primary"
                                            size={32}
                                        />
                                    </div>
                                }
                            >
                                {activeTab === "overview" && (
                                    <OverviewTab
                                        user={user}
                                        analytics={analytics}
                                        ratingHistory={ratingHistory}
                                        focusTopic={focusTopic}
                                        nextMilestone={nextMilestone}
                                        loadingInsights={loadingInsights}
                                        aiInsights={aiInsights}
                                        submissions={submissions}
                                        isOfflineMode={isOfflineMode}
                                        handle={handle}
                                        loadData={loadData}
                                        heatmapAnchor={heatmapAnchor}
                                        setHeatmapAnchor={setHeatmapAnchor}
                                        heatmapRange={heatmapRange}
                                        setHeatmapRange={setHeatmapRange}
                                    />
                                )}

                                {activeTab === "journey" && (
                                    <div className="max-w-4xl mx-auto">
                                        <Timeline
                                            user={user}
                                            ratingHistory={ratingHistory}
                                            submissions={submissions}
                                        />
                                    </div>
                                )}

                                {activeTab === "analytics" && (
                                    <AnalyticsTab
                                        analytics={analytics}
                                        focusTopic={focusTopic}
                                        submissions={submissions}
                                        ratingHistory={ratingHistory}
                                    />
                                )}

                                {activeTab === "submissions" && (
                                    <SubmissionsTab
                                        submissions={submissions}
                                        processedSubmissions={
                                            processedSubmissions
                                        }
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        verdictFilter={verdictFilter}
                                        setVerdictFilter={setVerdictFilter}
                                        languageFilter={languageFilter}
                                        setLanguageFilter={setLanguageFilter}
                                        availableLanguages={availableLanguages}
                                        sortKey={sortKey}
                                        sortDirection={sortDirection}
                                        toggleSort={toggleSort}
                                        refreshing={refreshing}
                                        refreshSubmissions={refreshSubmissions}
                                        setSelectedSubmission={
                                            setSelectedSubmission
                                        }
                                    />
                                )}

                                {activeTab === "ai" && (
                                    <AiTab
                                        user={user}
                                        ratingHistory={ratingHistory}
                                        submissions={submissions}
                                        analytics={analytics}
                                        activeAiTool={activeAiTool}
                                        setActiveAiTool={setActiveAiTool}
                                        aiInsights={aiInsights}
                                        loadingInsights={loadingInsights}
                                        liveSessionStats={liveSessionStats}
                                    />
                                )}

                                {activeTab === "prep" && (
                                    <PrepTab
                                        user={user}
                                        problemset={problemset}
                                        submissions={submissions}
                                        contests={contests}
                                        ratingHistory={ratingHistory}
                                        nextMilestone={nextMilestone}
                                        focusTopic={focusTopic}
                                    />
                                )}

                                {activeTab === "bookmarks" && (
                                    <BookmarksAndNotes />
                                )}

                                {activeTab === "social" && (
                                    <SocialTab
                                        socialSubTab={socialSubTab}
                                        setSocialSubTab={setSocialSubTab}
                                        user={user}
                                        ratingHistory={ratingHistory}
                                        submissions={submissions}
                                        blogs={blogs}
                                    />
                                )}

                                {activeTab === "predictor" && (
                                    <RatingPredictor
                                        currentUser={user}
                                        ratingHistory={ratingHistory}
                                    />
                                )}

                                {activeTab === "contest-analyzer" && (
                                    <ContestAnalyzer
                                        ratingHistory={ratingHistory}
                                        submissions={submissions}
                                        problemset={problemset}
                                        userRating={user?.rating ?? 800}
                                        userHandle={user?.handle ?? ""}
                                    />
                                )}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Detailed Profile Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <div
                        className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl"
                        style={{ background: "var(--overlay-bg)" }}
                        onClick={() => setIsProfileModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl rounded-3xl sm:rounded-[40px] overflow-hidden shadow-3xl flex flex-col max-h-[92vh] sm:max-h-[90vh]"
                            style={{
                                background: "var(--bg-app)",
                                border: "1px solid var(--glass-border)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header/Hero */}
                            <div className="relative h-36 sm:h-48 shrink-0">
                                <div
                                    className={cn(
                                        "absolute inset-0 opacity-20",
                                        getRankBg(user.rank || ""),
                                    )}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-bg-app via-bg-app/50 to-transparent" />

                                <button
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full transition-colors z-10 backdrop-blur-md"
                                    style={{ background: "var(--glass-bg)" }}
                                >
                                    <XCircle
                                        size={20}
                                        className="text-text-app"
                                    />
                                </button>

                                <div className="absolute -bottom-12 left-4 right-4 sm:-bottom-10 sm:left-10 flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-6 text-center sm:text-left">
                                    <div className="relative group shrink-0">
                                        <div
                                            className={cn(
                                                "absolute -inset-1 rounded-3xl sm:rounded-4xl blur-lg opacity-40",
                                                getRankBg(user.rank || ""),
                                            )}
                                        />
                                        <img
                                            src={user.titlePhoto || user.avatar}
                                            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl sm:rounded-4xl border-4 border-bg-app object-cover shadow-2xl"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="mb-0 sm:mb-4 min-w-0">
                                        <h2 className="text-xl sm:text-3xl font-display font-black text-text-app tracking-tighter leading-none mb-1.5 sm:mb-2 truncate">
                                            {user.handle}
                                        </h2>
                                        <div className="flex items-center justify-center sm:justify-start gap-2">
                                            <span
                                                className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10",
                                                    getRankBg(
                                                        user.rank || "",
                                                    ).split(" ")[1],
                                                )}
                                            >
                                                {user.rank || "Unranked"}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-muted-app opacity-60 uppercase">
                                                Max {user.maxRank}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 pt-16 sm:p-10 sm:pt-16 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
                                    <DetailItem
                                        label="Full Intelligence Name"
                                        value={
                                            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                                            "Classified"
                                        }
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Current Rating"
                                        value={user.rating || "N/A"}
                                        isMono
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Peak Rating"
                                        value={user.maxRating || "N/A"}
                                        isMono
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Origin (Country)"
                                        value={user.country || "Global"}
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Field Base (City)"
                                        value={user.city || "Undisclosed"}
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Organization"
                                        value={
                                            user.organization || "Independent"
                                        }
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Social Footprint"
                                        value={`${(user as any).friendOfCount || 0} Followers`}
                                        isMono
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Contribution"
                                        value={user.contribution || 0}
                                        isMono
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                    <DetailItem
                                        label="Member Capacity"
                                        value={format(
                                            new Date(
                                                user.registrationTimeSeconds *
                                                    1000,
                                            ),
                                            "MMM dd, yyyy",
                                        )}
                                        outerClassName="bg-[var(--bg-card)] border border-[var(--glass-border)]"
                                    />
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    <h4 className="text-[10px] font-black text-muted-app uppercase tracking-[0.2em] opacity-40">
                                        Intelligence Overview
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            className="p-5 sm:p-6 rounded-[20px] sm:rounded-3xl"
                                            style={{
                                                background: "var(--bg-card)",
                                                border: "1px solid var(--glass-border)",
                                            }}
                                        >
                                            <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                                Primary Domain
                                            </p>
                                            <p className="text-base sm:text-lg font-display font-bold text-text-app">
                                                {analytics?.bestTag}
                                            </p>
                                        </div>
                                        <div
                                            className="p-5 sm:p-6 rounded-[20px] sm:rounded-3xl"
                                            style={{
                                                background: "var(--bg-card)",
                                                border: "1px solid var(--glass-border)",
                                            }}
                                        >
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">
                                                Success Velocity
                                            </p>
                                            <p className="text-base sm:text-lg font-display font-bold text-text-app">
                                                {analytics?.totalSolved} Solved
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 sm:mt-10 pt-6 sm:pt-10 border-t border-white/5 flex gap-4">
                                    <a
                                        href={`https://codeforces.com/profile/${user.handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] sm:text-[11px] bg-brand-primary">
                                            <ExternalLink size={18} /> Deep
                                            Trace Profile
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Submission Details Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <div
                        className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-md"
                        style={{ background: "var(--overlay-bg)" }}
                        onClick={() => setSelectedSubmission(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass w-full max-w-xl rounded-[40px] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                                            <Code2 size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-text-app">
                                                Submission Internal
                                            </h3>
                                            <p className="text-[10px] font-mono text-muted-app uppercase tracking-widest font-bold">
                                                Trace ID #
                                                {selectedSubmission.id}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setSelectedSubmission(null)
                                        }
                                        className="p-3 hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <XCircle
                                            size={24}
                                            className="text-muted-app"
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                                    <DetailItem
                                        label="Problem Name"
                                        value={selectedSubmission.problem.name}
                                    />
                                    <DetailItem
                                        label="Contest ID"
                                        value={`#${selectedSubmission.contestId}`}
                                    />
                                    <div className="col-span-2 md:col-span-1">
                                        <DetailItem
                                            label="Status Verdict"
                                            value={selectedSubmission.verdict}
                                            isVerdict
                                        />
                                    </div>
                                    <DetailItem
                                        label="Language"
                                        value={
                                            selectedSubmission.programmingLanguage
                                        }
                                    />
                                    <DetailItem
                                        label="Execution Time"
                                        value={`${selectedSubmission.timeConsumedMillis}ms`}
                                        isMono
                                    />
                                    <DetailItem
                                        label="Memory Heap"
                                        value={`${Math.round(selectedSubmission.memoryConsumedBytes / 1024 / 1024)}MB`}
                                        isMono
                                    />
                                    <DetailItem
                                        label="Testset"
                                        value={selectedSubmission.testset}
                                    />
                                    <DetailItem
                                        label="Passed Tests"
                                        value={
                                            selectedSubmission.passedTestCount
                                        }
                                        isMono
                                    />
                                    <DetailItem
                                        label="Submitted At"
                                        value={format(
                                            new Date(
                                                selectedSubmission.creationTimeSeconds *
                                                    1000,
                                            ),
                                            "MMM dd, HH:mm:ss",
                                        )}
                                        isMono
                                    />

                                    <div className="col-span-2 md:col-span-3">
                                        <p className="text-[10px] text-muted-app uppercase font-black tracking-[0.2em] mb-2">
                                            Problem Tags
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubmission.problem.tags.map(
                                                (tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-muted-app uppercase tracking-wider"
                                                    >
                                                        {tag}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <a
                                        href={`https://codeforces.com/contest/${selectedSubmission.contestId}/submission/${selectedSubmission.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button className="w-full h-14 rounded-2xl gap-2 font-black uppercase tracking-widest text-[11px]">
                                            <ExternalLink size={16} /> View on
                                            Codeforces
                                        </Button>
                                    </a>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setSelectedSubmission(null)
                                        }
                                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px]"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
