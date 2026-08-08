import React from 'react';
import { Trophy, TrendingUp, Users, Calendar, Zap, BarChart3, Binary, History as HistoryIcon } from 'lucide-react';

import { Card, StatCard } from '../ui/Card';
import { ContestHeatmap } from '../charts/ContestHeatmap';
import { SolvedByRating } from '../charts/SolvedByRating';
import { ProblemLevelStats } from '../charts/ProblemLevelStats';
import { ContestHistory } from '../ContestHistory';
import { RadarStrength } from '../RadarStrength';
import { ProblemDistribution } from '../ProblemDistribution';








function AnalyticsTabImpl({ analytics, focusTopic, submissions, ratingHistory }: any) {
    return (
        <>
                                <div className="space-y-6 md:space-y-8">
                                    <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6 md:gap-8">
                                        <Card className="p-4 md:p-8 overflow-visible!">
                                            <div className="mb-6 md:mb-8">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-primary">
                                                    <BarChart3 size={14} />
                                                    Snapshot
                                                </div>
                                                <h3 className="mt-4 text-lg md:text-2xl font-display font-bold text-text-app">
                                                    Analytics at a glance
                                                </h3>
                                                <p className="text-[10px] md:text-sm text-muted-app uppercase tracking-[0.2em] mt-2 opacity-60">
                                                    Key performance signals from
                                                    solved problems, contests,
                                                    and language trends.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
                                                <div className="rounded-3xl border border-white/10 bg-card-app/70 p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-app mb-2">
                                                        Best Tag
                                                    </p>
                                                    <p className="text-lg md:text-xl font-display font-bold text-text-app">
                                                        {analytics?.bestTag ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="rounded-3xl border border-white/10 bg-card-app/70 p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-app mb-2">
                                                        Peak Hour
                                                    </p>
                                                    <p className="text-lg md:text-xl font-display font-bold text-text-app">
                                                        {analytics?.peakHour ||
                                                            'N/A'}
                                                    </p>
                                                </div>
                                                <div className="rounded-3xl border border-white/10 bg-card-app/70 p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-app mb-2">
                                                        Success Rate
                                                    </p>
                                                    <p className="text-lg md:text-xl font-display font-bold text-text-app">
                                                        {analytics?.deltaSuccessRate !=
                                                        null
                                                            ? `${analytics.deltaSuccessRate}%`
                                                            : '0%'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="rounded-3xl border border-white/10 bg-card-app/70 p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-app mb-2">
                                                        Total Solved
                                                    </p>
                                                    <p className="text-2xl font-display font-bold text-text-app">
                                                        {analytics?.totalSolved ??
                                                            0}
                                                    </p>
                                                </div>
                                                <div className="rounded-3xl border border-white/10 bg-card-app/70 p-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-app mb-2">
                                                        Average Rating
                                                    </p>
                                                    <p className="text-2xl font-display font-bold text-text-app">
                                                        {analytics?.avgDifficulty ??
                                                            0}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="grid grid-cols-1 gap-6">
                                            <StatCard
                                                label="Accuracy"
                                                value={`${analytics?.accuracy ?? 0}%`}
                                                subValue="Submission precision"
                                                icon={Zap}
                                                color="bg-orange-500/10 text-orange-500"
                                            />
                                            <StatCard
                                                label="Contests"
                                                value={analytics?.contestCount}
                                                subValue="Official appearances"
                                                icon={Users}
                                                color="bg-blue-500/10 text-blue-500"
                                            />
                                            <StatCard
                                                label="Rank Movements"
                                                value={
                                                    analytics?.maxDelta != null
                                                        ? `+${analytics.maxDelta}`
                                                        : '-'
                                                }
                                                subValue="Peak rating gain"
                                                icon={TrendingUp}
                                                color="bg-emerald-500/10 text-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                        <Card className="p-4 md:p-8 overflow-visible!">
                                            <div className="mb-6 md:mb-8">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-secondary">
                                                    <Binary size={14} />
                                                    Rating Spread
                                                </div>
                                                <h3 className="mt-4 text-lg md:text-xl font-display font-bold text-text-app">
                                                    Problem Versatility
                                                </h3>
                                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-2 opacity-70">
                                                    How solved problems are
                                                    distributed across
                                                    difficulty bands.
                                                </p>
                                            </div>
                                            <ProblemDistribution
                                                submissions={submissions}
                                            />
                                        </Card>
                                        <Card className="p-4 md:p-8 overflow-visible!">
                                            <div className="mb-6 md:mb-8">
                                                <h3 className="text-lg md:text-xl font-display font-bold text-text-app">
                                                    Skill Signature
                                                </h3>
                                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                                                    Top problem tags and
                                                    cognitive strengths
                                                </p>
                                            </div>
                                            <RadarStrength
                                                submissions={submissions}
                                            />
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                                        <Card className="p-4 md:p-8 overflow-visible!">
                                            <div className="mb-6 md:mb-8">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-secondary">
                                                    <Trophy size={14} />
                                                    Rating Distribution
                                                </div>
                                                <h3 className="mt-4 text-lg md:text-xl font-display font-bold text-text-app">
                                                    Solved by Rating
                                                </h3>
                                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-2 opacity-70">
                                                    Your accepted solutions grouped by difficulty rating.
                                                </p>
                                            </div>
                                            <SolvedByRating submissions={submissions} />
                                        </Card>
                                        <Card className="p-4 md:p-8 overflow-visible!">
                                            <div className="mb-6 md:mb-8">
                                                <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand-primary">
                                                    <Calendar size={14} />
                                                    Activity
                                                </div>
                                                <h3 className="mt-4 text-lg md:text-xl font-display font-bold text-text-app">
                                                    Contest Heatmap
                                                </h3>
                                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-2 opacity-70">
                                                    Your performance across the days of the week.
                                                </p>
                                            </div>
                                            <ContestHeatmap history={ratingHistory} />
                                        </Card>
                                    </div>

                                    <Card className="p-4 md:p-8 overflow-visible!">
                                        <div className="mb-6 md:mb-8">
                                            <h3 className="text-lg md:text-xl font-display font-bold text-text-app">
                                                Problem Level Stats
                                            </h3>
                                            <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                                                Success rate across different problem indices (A, B, C...)
                                            </p>
                                        </div>
                                        <ProblemLevelStats submissions={submissions} />
                                    </Card>

                                    <Card className="p-4 md:p-8">
                                        <div className="flex items-center gap-3 mb-6 md:mb-8 text-text-app">
                                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                                <HistoryIcon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-display font-bold">
                                                    Battle History
                                                </h3>
                                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                                                    Official contest performance
                                                    over time
                                                </p>
                                            </div>
                                        </div>
                                        <ContestHistory
                                            ratingHistory={ratingHistory}
                                        />
                                    </Card>
                                </div>
        </>
    );
}

export const AnalyticsTab = React.memo(AnalyticsTabImpl);
