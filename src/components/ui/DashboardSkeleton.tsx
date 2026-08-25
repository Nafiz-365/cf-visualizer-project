import React from 'react';

/** Skeleton block — animated shimmer placeholder */
function Bone({ className = '' }: { className?: string }) {
    return <div className={`skeleton ${className}`} />;
}

/** Full dashboard loading skeleton that mirrors the real layout */
export function DashboardSkeleton({ handle }: { handle?: string }) {
    return (
        <div
            className="min-h-screen bg-bg-app text-text-app"
            style={{ background: 'var(--bg-app)' }}
        >
            {/* Skeleton sidebar (matching real sidebar fixed layout) */}
            <aside
                className="hidden md:flex w-20 lg:w-64 border-r border-white/10 glass fixed left-0 top-0 h-screen flex-col z-50 pt-8 backdrop-blur-3xl px-3 space-y-2"
            >
                <div className="px-4 pb-5 border-b border-white/10 mb-5 flex justify-center lg:justify-start">
                    <div className="flex items-center gap-0 lg:gap-3">
                        <Bone className="w-10 h-10 rounded-3xl shrink-0" />
                        <div className="hidden lg:block ml-1 space-y-1.5">
                            <Bone className="h-2.5 w-16 rounded-full" />
                            <Bone className="h-3.5 w-24 rounded-full" />
                        </div>
                    </div>
                </div>

                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-center lg:justify-start gap-0 lg:gap-3 px-2 lg:px-4 py-3 rounded-3xl"
                    >
                        <Bone className="w-5 h-5 rounded-lg shrink-0" />
                        <Bone className="flex-1 h-3 rounded-full hidden lg:block" />
                    </div>
                ))}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-0 mt-0 md:mt-0 md:ml-20 lg:ml-64 overflow-y-auto custom-scrollbar relative">
                {/* Skeleton header */}
                <header
                    className="sticky top-0 z-40 bg-bg-app/80 backdrop-blur-xl border-b border-white/5 px-3 sm:px-4 md:px-8 py-3 md:py-4"
                >
                    <div className="flex items-center justify-between gap-2 sm:gap-3 max-w-7xl mx-auto">
                        <div className="flex items-center gap-3 md:gap-5">
                            <Bone className="w-8 h-8 md:hidden rounded-lg shrink-0" />
                            
                            <div className="flex items-center gap-2 sm:gap-3 rounded-full bg-white/5 border border-white/10 px-1.5 py-1.5 pr-4">
                                <Bone className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
                                <div className="space-y-1.5 w-24">
                                    <Bone className="h-3.5 w-full rounded-full" />
                                    <Bone className="h-2 w-16 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Bone className="w-8 h-8 rounded-xl" />
                            <Bone className="w-8 h-8 rounded-xl" />
                        </div>
                    </div>
                </header>

                {/* Skeleton content */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 md:pt-6 pb-24 md:pb-10 space-y-6 md:space-y-10">
                    {/* Hero + side mini cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-8 items-stretch">
                        <div
                            className="xl:col-span-8 p-4 md:p-10 rounded-[1.75rem] space-y-4"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--glass-border)',
                            }}
                        >
                            <Bone className="h-4 w-32 rounded-full mb-8" />
                            <Bone className="h-10 w-3/4 rounded-xl" />
                            <Bone className="h-4 w-full rounded-full mt-6" />
                            <Bone className="h-4 w-5/6 rounded-full" />
                            <div className="flex gap-6 pt-4">
                                <Bone className="h-6 w-24 rounded-full" />
                                <Bone className="h-6 w-24 rounded-full" />
                            </div>
                        </div>
                        <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                            {[0, 1].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-[1.75rem] p-6 space-y-3"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--glass-border)',
                                    }}
                                >
                                    <Bone className="h-3 w-24 rounded-full" />
                                    <Bone className="h-7 w-32 rounded-xl" />
                                    <Bone className="h-3 w-full rounded-full mt-auto" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stat cards row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-[1.75rem] p-4 md:p-5 space-y-3 min-h-24 md:min-h-32 flex flex-col"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <Bone className="h-2.5 w-16 rounded-full" />
                                    <Bone className="w-8 h-8 rounded-xl shrink-0" />
                                </div>
                                <Bone className="h-6 md:h-8 w-20 rounded-xl" />
                                <Bone className="h-1 w-full rounded-full mt-auto" />
                            </div>
                        ))}
                    </div>

                    {/* Loading status text */}
                    <div className="text-center pt-10 space-y-2">
                        <div className="relative inline-block mb-4">
                            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto" />
                        </div>
                        <p
                            className="text-sm font-display font-medium animate-pulse"
                            style={{ color: 'var(--text-main)' }}
                        >
                            Analyzing{handle ? ` ${handle}'s` : ''} profile
                            intelligence…
                        </p>
                        <p
                            className="text-[10px] font-mono uppercase tracking-[0.2em]"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Fetching from Codeforces API
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
