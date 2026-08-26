import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Milestone, Brain, MessageSquare } from "lucide-react";
import { Card } from "../ui/Card";
import { AIRoadmap } from "../AIRoadmap";
import { AIChatCoach } from "../AIChatCoach";
import { AIWeaknessAnalyzer } from "../AIWeaknessAnalyzer";
import { cn } from "../../lib/utils";

function AiTabImpl({
    user,
    ratingHistory,
    submissions,
    analytics,
    activeAiTool,
    setActiveAiTool,
    aiInsights,
    loadingInsights,
    liveSessionStats,
}: any) {
    return (
        <>
            <div className="space-y-6 md:space-y-8">
                {/* AI Command Center Header */}
                <div className="rounded-3xl border border-white/10 bg-linear-to-r from-brand-primary/10 via-brand-secondary/5 to-transparent p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-primary font-black">
                                    Deepmind Engine Active
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-display font-black text-text-app">
                                AI Command Center
                            </h2>
                            <p className="text-xs text-muted-app mt-1 leading-relaxed max-w-xl">
                                Unlock personalized growth strategies,
                                conversational problem-solving coaching, and
                                real-time behavioral diagnostics.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {[
                                {
                                    id: "chat",
                                    label: "Chat Coach",
                                    icon: MessageSquare,
                                },
                                {
                                    id: "roadmap",
                                    label: "Growth Roadmap",
                                    icon: Milestone,
                                },
                                {
                                    id: "weakness",
                                    label: "Weakness Diagnostic",
                                    icon: Brain,
                                },
                            ].map((tool) => {
                                const ToolIcon = tool.icon;
                                const isSelected = activeAiTool === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        onClick={() =>
                                            setActiveAiTool(tool.id as any)
                                        }
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer",
                                            isSelected
                                                ? "bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/20"
                                                : "bg-white/5 text-muted-app border-white/5 hover:border-white/10 hover:bg-white/10 hover:text-text-app",
                                        )}
                                    >
                                        <ToolIcon size={14} />
                                        {tool.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sub-tool panels */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeAiTool}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeAiTool === "chat" && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                                {/* AI Chat Coach - Main Window */}
                                <div className="lg:col-span-8">
                                    <Card className="p-5 md:p-6 flex flex-col h-150">
                                        <AIChatCoach
                                            user={user}
                                            submissions={submissions}
                                            analytics={analytics}
                                            ratingHistory={ratingHistory}
                                        />
                                    </Card>
                                </div>

                                {/* Side Insights Panel */}
                                <div className="lg:col-span-4 space-y-6">
                                    {/* Dynamic Focus Recommendation */}
                                    <Card className="p-5 md:p-6 bg-brand-primary/5 border-brand-primary/10">
                                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">
                                            Focus Recommendation
                                        </h4>
                                        {analytics ? (
                                            <>
                                                <p className="text-xs font-bold text-text-app mb-1 leading-relaxed">
                                                    Based on your stats,
                                                    prioritize{" "}
                                                    <span className="text-brand-primary">
                                                        {analytics.bestTag}
                                                    </span>{" "}
                                                    and target problems rated{" "}
                                                    <span className="text-brand-primary">
                                                        {(user?.rating ?? 800) +
                                                            100}
                                                        –
                                                        {Math.min(
                                                            (user?.rating ??
                                                                800) + 300,
                                                            3500,
                                                        )}
                                                    </span>
                                                    .
                                                </p>
                                                <p className="text-[10px] text-muted-app/60 leading-relaxed">
                                                    Your{" "}
                                                    {analytics.deltaSuccessRate}
                                                    % contest win rate and{" "}
                                                    {analytics.accuracy}%
                                                    accuracy suggest{" "}
                                                    {Number(
                                                        analytics.deltaSuccessRate,
                                                    ) >= 50
                                                        ? "you\u2019re ready to push harder \u2014 attempt Div 2 C/D problems."
                                                        : "consistency training will drive your next rating breakthrough."}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-[10px] text-muted-app/50">
                                                Loading your profile data...
                                            </p>
                                        )}
                                    </Card>

                                    {/* Live Session Stats */}
                                    <Card className="p-5 md:p-6">
                                        <h4 className="text-[10px] font-black text-muted-app uppercase tracking-widest mb-4">
                                            Live Session Stats
                                        </h4>
                                        <div className="space-y-3.5">
                                            {[
                                                {
                                                    label: "Intensity",
                                                    value: liveSessionStats.intensity,
                                                    color:
                                                        liveSessionStats.intensity ===
                                                        "High"
                                                            ? "text-emerald-400"
                                                            : liveSessionStats.intensity ===
                                                                "Medium"
                                                              ? "text-yellow-400"
                                                              : "text-orange-400",
                                                },
                                                {
                                                    label: "Streak",
                                                    value:
                                                        liveSessionStats.streak >
                                                        0
                                                            ? `${liveSessionStats.streak} day${liveSessionStats.streak !== 1 ? "s" : ""}`
                                                            : "No streak",
                                                    color:
                                                        liveSessionStats.streak >
                                                        7
                                                            ? "text-emerald-400"
                                                            : liveSessionStats.streak >
                                                                2
                                                              ? "text-brand-primary"
                                                              : "text-muted-app/50",
                                                },
                                                {
                                                    label: "Efficiency",
                                                    value: liveSessionStats.efficiency,
                                                    color:
                                                        Number(
                                                            analytics?.accuracy ??
                                                                0,
                                                        ) >= 70
                                                            ? "text-emerald-400"
                                                            : Number(
                                                                    analytics?.accuracy ??
                                                                        0,
                                                                ) >= 50
                                                              ? "text-yellow-400"
                                                              : "text-orange-400",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-[10px] font-bold text-muted-app/50 uppercase tracking-wide">
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-xs font-black uppercase",
                                                            item.color,
                                                        )}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    {/* At a Glance Card */}
                                    <Card className="p-5 md:p-6">
                                        <h4 className="text-[10px] font-black text-muted-app uppercase tracking-widest mb-4">
                                            At a Glance
                                        </h4>
                                        <div className="space-y-3.5">
                                            {[
                                                {
                                                    label: "Contests",
                                                    value:
                                                        analytics?.contestCount ??
                                                        0,
                                                    color: "text-brand-secondary",
                                                },
                                                {
                                                    label: "Avg Rank",
                                                    value: analytics?.avgRank
                                                        ? `#${analytics.avgRank}`
                                                        : "—",
                                                    color: "text-text-app",
                                                },
                                                {
                                                    label: "Best Delta",
                                                    value: analytics?.maxDelta
                                                        ? `+${analytics.maxDelta}`
                                                        : "—",
                                                    color: "text-emerald-400",
                                                },
                                            ].map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="flex items-center justify-between"
                                                >
                                                    <span className="text-[10px] font-bold text-muted-app/50 uppercase tracking-wide">
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-xs font-black",
                                                            item.color,
                                                        )}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeAiTool === "roadmap" && (
                            <Card className="p-0 overflow-hidden flex flex-col h-full">
                                <div className="p-5 md:p-6 border-b border-white/5 bg-linear-to-r from-brand-primary/10 via-transparent to-transparent">
                                    <h3 className="text-lg font-display font-bold text-text-app">
                                        Intelligence Roadmap
                                    </h3>
                                    <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                                        AI-generated growth strategy
                                    </p>
                                </div>
                                <div className="p-5 md:p-6 flex-1">
                                    <AIRoadmap
                                        user={user}
                                        submissions={submissions}
                                        analytics={analytics}
                                    />
                                </div>
                            </Card>
                        )}

                        {activeAiTool === "weakness" && (
                            <Card className="p-5 md:p-8 relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/5 via-transparent to-transparent shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <Brain
                                        className="text-brand-primary animate-pulse"
                                        size={24}
                                    />
                                    <div>
                                        <h3 className="text-lg font-display font-bold text-text-app">
                                            Cognitive Weakness Analysis
                                        </h3>
                                        <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em]">
                                            Automated weakness and skill
                                            diagnostics
                                        </p>
                                    </div>
                                </div>
                                <AIWeaknessAnalyzer
                                    submissions={submissions}
                                    analytics={analytics}
                                    currentRating={user?.rating ?? 800}
                                />
                            </Card>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
}

export const AiTab = React.memo(AiTabImpl);
