import React from 'react';
import {
    Trophy,
    TrendingUp,
    Award,
    Users,
    Calendar,
    CheckCircle2,
    RefreshCcw,
    Zap,
    Binary,
    Shield,
} from 'lucide-react';

import { Card, StatCard } from '../ui/Card';
import { RatingChart } from '../charts/RatingChart';
import { ActivityHeatmap } from '../charts/ActivityHeatmap';
import { UpcomingContests } from '../UpcomingContests';

function OverviewTabImpl({
    user,
    analytics,
    ratingHistory,
    focusTopic,
    nextMilestone,
    loadingInsights,
    aiInsights,
    submissions,
    isOfflineMode,
    handle,
    loadData,
    heatmapAnchor,
    setHeatmapAnchor,
    heatmapRange,
    setHeatmapRange,
}: any) {
    return (
        <>
            <div className="space-y-6 md:space-y-10">
                {/* Hero Summary */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-8 items-stretch">
                    <Card className="xl:col-span-8 p-4 md:p-10 bg-linear-to-br from-brand-primary/5 via-transparent to-transparent border-brand-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Trophy size={120} />
                        </div>
                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                            <div className="px-2 py-0.5 rounded bg-brand-primary text-[8px] font-black text-text-app uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                                Operational Profile
                            </div>
                        </div>
                        <h3 className="text-xl md:text-3xl lg:text-4xl font-display font-black text-text-app mb-3 md:mb-6 leading-tight tracking-tighter">
                            Mastering{' '}
                            <span className="text-brand-primary">
                                {analytics?.bestTag}
                            </span>{' '}
                            at{' '}
                            <span className="text-brand-secondary">
                                {analytics?.avgDifficulty}
                            </span>{' '}
                            Level
                        </h3>
                        <p className="text-xs md:text-sm lg:text-base text-muted-app leading-relaxed max-w-2xl opacity-70 group-hover:opacity-100 transition-opacity">
                            The data indicates reaching a threshold of{' '}
                            <span className="text-text-app font-bold">
                                {analytics?.totalSolved}
                            </span>{' '}
                            successful executions. Your focus on high-accuracy
                            problem solving shows structured growth toward the
                            next rating milestone.
                        </p>
                        <div className="mt-4 md:mt-8 flex items-center gap-4 md:gap-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-muted-app/40 uppercase tracking-widest">
                                    Top Efficiency
                                </p>
                                <p className="text-xs md:text-sm font-display font-bold text-text-app">
                                    {analytics?.peakHour}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-white/5" />
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-muted-app/40 uppercase tracking-widest">
                                    Problem Domain
                                </p>
                                <p className="text-xs md:text-sm font-display font-bold text-text-app">
                                    {analytics?.bestTag}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="xl:col-span-4 grid grid-cols-2 xl:grid-cols-1 gap-3 md:gap-6">
                        <Card className="p-3 md:p-8 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                                <Zap
                                    size={100}
                                    className="text-brand-primary"
                                />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1.5 md:mb-4">
                                    Streak Status
                                </h4>
                                <p className="text-sm sm:text-lg md:text-2xl font-display font-bold text-text-app mb-0.5 md:mb-1 leading-tight">
                                    Consistent Athlete
                                </p>
                                <p className="text-[9px] md:text-[11px] text-muted-app font-medium leading-normal">
                                    Maintained activity over the last quarter
                                </p>
                            </div>
                        </Card>
                        <Card className="p-3 md:p-8 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700">
                                <Shield
                                    size={100}
                                    className="text-brand-secondary"
                                />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[8px] md:text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-1.5 md:mb-4">
                                    Historical Guard
                                </h4>
                                <p className="text-sm sm:text-lg md:text-2xl font-display font-bold text-text-app mb-0.5 md:mb-1 leading-tight">
                                    Peak {user.maxRating}
                                </p>
                                <p className="text-[9px] md:text-[11px] text-muted-app font-medium leading-normal">
                                    Securing {user.maxRank || 'Expert'} status
                                    records
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-4 md:gap-6">
                    <Card className="p-4 md:p-5 border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent shadow-[0_14px_34px_rgba(0,0,0,0.12)] backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-app/70">
                                    Performance Pulse
                                </p>
                                <h4 className="text-base md:text-lg font-display font-bold text-text-app mt-1 leading-snug">
                                    A sharper read on your current momentum
                                </h4>
                            </div>
                            <div className="rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                Live
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                    Momentum
                                </p>
                                <p className="mt-1 text-sm font-bold text-text-app">
                                    {Number(analytics?.maxDelta ?? 0) > 0
                                        ? 'Rising'
                                        : 'Steady'}
                                </p>
                                <p className="mt-1 text-[10px] text-muted-app/70">
                                    {analytics?.maxDelta
                                        ? `Best gain +${analytics.maxDelta}`
                                        : 'No sharp swings yet'}
                                </p>
                            </div>
                            <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                    Accuracy
                                </p>
                                <p className="mt-1 text-sm font-bold text-text-app">
                                    {analytics?.accuracy ?? 0}%
                                </p>
                                <p className="mt-1 text-[10px] text-muted-app/70">
                                    Precision in your recent solving rhythm
                                </p>
                            </div>
                            <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                    Focus Topic
                                </p>
                                <p className="mt-1 text-sm font-bold text-text-app">
                                    {focusTopic}
                                </p>
                                <p className="mt-1 text-[10px] text-muted-app/70">
                                    Your strongest recurring domain
                                </p>
                            </div>
                            <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                    Peak Window
                                </p>
                                <p className="mt-1 text-sm font-bold text-text-app">
                                    {analytics?.peakHour || '—'}
                                </p>
                                <p className="mt-1 text-[10px] text-muted-app/70">
                                    Best hour for serious practice
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4 md:p-5 border border-white/10 bg-linear-to-br from-brand-primary/8 via-white/5 to-transparent shadow-[0_14px_34px_rgba(0,0,0,0.12)] backdrop-blur-md">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-app/70">
                                    AI Signal
                                </p>
                                <h4 className="text-base font-display font-bold text-text-app mt-1">
                                    Next move
                                </h4>
                            </div>
                            <div className="rounded-full bg-brand-secondary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary">
                                Smart
                            </div>
                        </div>
                        <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
                            {loadingInsights ? (
                                <p className="text-sm font-medium text-muted-app">
                                    Synthesizing your profile...
                                </p>
                            ) : (
                                <>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                        {(
                                            aiInsights[0]?.title ||
                                            'Strategic Edge'
                                        ).toUpperCase()}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-text-app leading-relaxed">
                                        {aiInsights[0]?.desc ||
                                            `Your next best move is to practice ${focusTopic} problems around ${nextMilestone} RP.`}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="mt-3 flex items-center justify-between rounded-[1.15rem] border border-brand-primary/10 bg-brand-primary/5 px-3 py-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                    Suggested focus
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-text-app">
                                    {focusTopic} • {analytics?.accuracy ?? 0}%
                                    accuracy
                                </p>
                            </div>
                            <div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                                Ready
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Grid Stats */}
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                    <StatCard
                        label="Total Solved"
                        value={analytics?.totalSolved}
                        subValue="Unique Problems"
                        icon={CheckCircle2}
                    />
                    <StatCard
                        label="Accuracy"
                        value={`${analytics?.accuracy}%`}
                        subValue="Submission Precision"
                        icon={Zap}
                        color="bg-orange-500/10 text-orange-500"
                    />
                    <StatCard
                        label="Avg Difficulty"
                        value={analytics?.avgDifficulty}
                        subValue="Rating Weight"
                        icon={Binary}
                        color="bg-brand-secondary/10 text-brand-secondary"
                    />
                    <StatCard
                        label="Rank Milestone"
                        value={user.maxRank}
                        subValue="Historical Peak"
                        icon={Award}
                        color="bg-emerald-500/10 text-emerald-500"
                    />
                    <div className="col-span-2 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                        <StatCard
                            label="Contests"
                            value={analytics?.contestCount}
                            subValue="Official Appearances"
                            icon={Users}
                            color="bg-blue-500/10 text-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                    <StatCard
                        label="Max Delta"
                        value={
                            analytics?.maxDelta != null &&
                            analytics.maxDelta > 0
                                ? `+${analytics.maxDelta}`
                                : (analytics?.maxDelta ?? '-')
                        }
                        subValue="Highest Gain"
                        icon={TrendingUp}
                        color="bg-emerald-500/10 text-emerald-500"
                    />
                    <StatCard
                        label="Min Delta"
                        value={analytics?.minDelta}
                        subValue="Deepest Drop"
                        icon={TrendingUp}
                        trend="down"
                        color="bg-red-500/10 text-red-500"
                    />
                    <div className="col-span-2 md:col-span-1">
                        <StatCard
                            label="Success Rate"
                            value={`${analytics?.deltaSuccessRate}%`}
                            subValue="Positive Delta %"
                            icon={TrendingUp}
                            color="bg-brand-primary/10 text-brand-primary"
                        />
                    </div>
                </div>

                {/* Main Rating Evolution */}
                <Card className="p-5 md:p-10 shadow-2xl relative overflow-visible!">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 md:mb-10">
                        <div>
                            <h3 className="text-lg md:text-2xl font-display font-bold text-text-app tracking-tight">
                                Competitive Trajectory
                            </h3>
                            <p className="text-[9px] md:text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1.5 md:mt-2 opacity-40">
                                Rating fluctuations across{' '}
                                {ratingHistory.length} contests
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 border-2 border-bg-app flex items-center justify-center"
                                    >
                                        <Trophy
                                            size={10}
                                            className="text-brand-primary"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="px-2.5 py-1 bg-brand-primary/5 border border-brand-primary/10 rounded-full flex items-center gap-1.5">
                                <RefreshCcw
                                    size={8}
                                    className="text-brand-primary"
                                />
                                <span className="text-[7px] md:text-[8px] font-black text-brand-primary tracking-widest uppercase">
                                    Live Trace
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="h-55 sm:h-80 md:h-112.5">
                        <RatingChart data={ratingHistory} />
                    </div>
                </Card>

                {/* Activity Matrix with Context */}
                <Card className="p-4 md:p-8 relative overflow-visible! rounded-[1.75rem] border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold text-text-app">
                                Cognitive Consistency
                            </h3>
                            <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1.5 opacity-40">
                                Pick a date and inspect the activity window
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-end">
                            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/70">
                                <Calendar
                                    size={12}
                                    className="text-brand-primary"
                                />
                                <input
                                    type="date"
                                    value={heatmapAnchor}
                                    onChange={(e) =>
                                        setHeatmapAnchor(e.target.value)
                                    }
                                    className="min-w-27.5 bg-transparent text-[10px] font-black text-text-app outline-none"
                                />
                            </label>
                            <select
                                value={heatmapRange}
                                onChange={(e) =>
                                    setHeatmapRange(
                                        e.target.value as
                                            | '30'
                                            | '90'
                                            | '180'
                                            | '365',
                                    )
                                }
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-app outline-none"
                            >
                                <option value="30">30D</option>
                                <option value="90">90D</option>
                                <option value="180">180D</option>
                                <option value="365">1Y</option>
                            </select>
                        </div>
                    </div>
                    <ActivityHeatmap
                        submissions={submissions}
                        anchorDate={heatmapAnchor}
                        rangeDays={parseInt(heatmapRange)}
                    />
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <Card className="p-4 md:p-8 lg:col-span-3">
                        <div className="flex items-center gap-3 mb-6 md:mb-8 text-text-app">
                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-display font-bold">
                                    Upcoming Contests
                                </h3>
                                <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                                    Scheduled official rounds
                                </p>
                            </div>
                        </div>
                        <UpcomingContests />
                    </Card>
                </div>
            </div>
        </>
    );
}

export const OverviewTab = React.memo(OverviewTabImpl);
