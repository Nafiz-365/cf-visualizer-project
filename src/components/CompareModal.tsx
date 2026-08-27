import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    X,
    Trophy,
    Swords,
    Zap,
    Activity,
    Shield,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { User } from "../types";
import { CodeforcesService } from "../services/codeforces";
import { cn, getRankColor, getRankBg } from "../lib/utils";
import { Card } from "./ui/Card";

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    myHandle: string;
    friendHandle: string;
}

export function CompareModal({
    isOpen,
    onClose,
    myHandle,
    friendHandle,
}: CompareModalProps) {
    const [myUser, setMyUser] = useState<User | null>(null);
    const [friendUser, setFriendUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError("");

        Promise.all([
            CodeforcesService.getUserInfo(myHandle),
            CodeforcesService.getUserInfo(friendHandle),
        ])
            .then(([me, friend]) => {
                setMyUser(me);
                setFriendUser(friend);
            })
            .catch((err) => {
                console.error("Compare fetch error", err);
                setError(
                    "Failed to fetch data for comparison. One of the handles might be invalid or the Codeforces API is down.",
                );
            })
            .finally(() => setLoading(false));
    }, [isOpen, myHandle, friendHandle]);

    if (!isOpen) return null;

    const myRank = myUser?.rank ?? "unrated";
    const friendRank = friendUser?.rank ?? "unrated";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl glass-premium p-6 md:p-8 rounded-3xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-muted-app hover:text-text-app hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8 mt-2">
                            <h2 className="text-3xl font-display font-bold text-text-app flex items-center justify-center gap-3">
                                <Swords
                                    className="text-brand-primary"
                                    size={32}
                                />
                                Rivals Comparison
                            </h2>
                            <p className="text-muted-app mt-2">
                                Who is the better coder?
                            </p>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-brand-primary">
                                <Activity
                                    className="animate-spin mb-4"
                                    size={32}
                                />
                                <p className="text-muted-app animate-pulse">
                                    Analyzing both profiles...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-red-400">{error}</p>
                            </div>
                        ) : (
                            myUser &&
                            friendUser && (
                                <div className="space-y-6">
                                    {/* Header Comparison */}
                                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8 items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                                        {/* Me */}
                                        <div className="text-center">
                                            <div
                                                className={cn(
                                                    "w-20 h-20 mx-auto rounded-full mb-4 border-4",
                                                    getRankBg(myRank),
                                                )}
                                            >
                                                <img
                                                    src={myUser.titlePhoto}
                                                    alt={myUser.handle}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            </div>
                                            <h3
                                                className={cn(
                                                    "text-xl font-bold",
                                                    getRankColor(myRank),
                                                )}
                                            >
                                                {myUser.handle}
                                            </h3>
                                            <p className="text-sm text-muted-app capitalize">
                                                {myRank}
                                            </p>
                                        </div>

                                        <div className="text-4xl font-display font-black italic text-brand-secondary/50">
                                            VS
                                        </div>

                                        {/* Friend */}
                                        <div className="text-center">
                                            <div
                                                className={cn(
                                                    "w-20 h-20 mx-auto rounded-full mb-4 border-4",
                                                    getRankBg(friendRank),
                                                )}
                                            >
                                                <img
                                                    src={friendUser.titlePhoto}
                                                    alt={friendUser.handle}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            </div>

                                            <h3
                                                className={cn(
                                                    "text-xl font-bold",
                                                    getRankColor(friendRank),
                                                )}
                                            >
                                                {friendUser.handle}
                                            </h3>
                                            <p className="text-sm text-muted-app capitalize">
                                                {friendRank}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Comparison */}
                                    <div className="grid gap-3">
                                        <ComparisonRow
                                            label="Current Rating"
                                            val1={myUser.rating ?? 0}
                                            val2={friendUser.rating ?? 0}
                                            format={(v) => v.toString()}
                                        />
                                        <ComparisonRow
                                            label="Max Rating"
                                            val1={myUser.maxRating ?? 0}
                                            val2={friendUser.maxRating ?? 0}
                                            format={(v) => v.toString()}
                                        />
                                        <ComparisonRow
                                            label="Contribution"
                                            val1={myUser.contribution ?? 0}
                                            val2={friendUser.contribution ?? 0}
                                            format={(v) =>
                                                v > 0 ? `+${v}` : v.toString()
                                            }
                                        />
                                        <ComparisonRow
                                            label="Friend of Count"
                                            val1={myUser.friendOfCount ?? 0}
                                            val2={friendUser.friendOfCount ?? 0}
                                            format={(v) => v.toLocaleString()}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function ComparisonRow({
    label,
    val1,
    val2,
    format,
}: {
    label: string;
    val1: number;
    val2: number;
    format: (v: number) => string;
}) {
    const isVal1Better = val1 > val2;
    const isVal2Better = val2 > val1;
    const isTie = val1 === val2;

    return (
        <div className="grid grid-cols-[1fr_1.5fr_1fr] items-center bg-white/5 border border-white/5 rounded-xl p-4">
            <div
                className={cn(
                    "text-center font-mono font-bold text-lg",
                    isVal1Better
                        ? "text-green-400"
                        : isTie
                          ? "text-text-app"
                          : "text-muted-app",
                )}
            >
                {format(val1)}{" "}
                {isVal1Better && <ArrowUp size={16} className="inline ml-1" />}
            </div>
            <div className="text-center text-sm font-bold uppercase tracking-wider text-muted-app">
                {label}
            </div>
            <div
                className={cn(
                    "text-center font-mono font-bold text-lg",
                    isVal2Better
                        ? "text-green-400"
                        : isTie
                          ? "text-text-app"
                          : "text-muted-app",
                )}
            >
                {isVal2Better && <ArrowUp size={16} className="inline mr-1" />}{" "}
                {format(val2)}
            </div>
        </div>
    );
}
