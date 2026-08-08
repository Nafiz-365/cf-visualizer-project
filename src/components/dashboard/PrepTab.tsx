import React from 'react';
import { motion } from 'motion/react';

import { Card } from '../ui/Card';
import { Recommendations } from '../Recommendations';
import { UnsolvedProblems } from '../UnsolvedProblems';









import { PracticeCoach } from '../PracticeCoach';

function PrepTabImpl({ user, problemset, submissions, contests, ratingHistory, nextMilestone, focusTopic }: any) {
    return (
        <>
                                <div className="space-y-6 md:space-y-8">
                                    <PracticeCoach
                                        user={user}
                                        ratingHistory={ratingHistory}
                                        submissions={submissions}
                                    />

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                                        <div className="lg:col-span-8 space-y-6 md:space-y-8">

                                            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-transparent p-4 sm:p-5 mb-6 md:mb-8 shadow-[0_12px_36px_rgba(0,0,0,0.12)] backdrop-blur-md">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-app/70">
                                                            Next Focus
                                                        </p>
                                                        <h4 className="text-base md:text-lg font-display font-bold text-text-app mt-1 leading-snug">
                                                            Stay sharp for the
                                                            next milestone
                                                        </h4>
                                                    </div>
                                                    <div className="self-start rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary sm:self-auto">
                                                        {nextMilestone} RP
                                                    </div>
                                                </div>
                                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                                            Priority Topic
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-text-app">
                                                            {focusTopic}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                                            Best Window
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-text-app">
                                                            2–3 focused sessions
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-app/60">
                                                            Mode
                                                        </p>
                                                        <p className="mt-1 text-sm font-bold text-text-app">
                                                            Accuracy + speed
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                                                <Card className="p-4 md:p-8 bg-card-app/30 border border-white/5 rounded-3xl">
                                                    <Recommendations
                                                        submissions={
                                                            submissions
                                                        }
                                                        problemset={problemset}
                                                        currentRating={
                                                            user?.rating || 800
                                                        }
                                                    />
                                                </Card>
                                                <Card className="p-4 md:p-8 bg-card-app/30 border border-white/5 rounded-3xl">
                                                    <UnsolvedProblems
                                                        submissions={
                                                            submissions
                                                        }
                                                    />
                                                </Card>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-4 space-y-6 md:space-y-8">

                                            <Card className="p-4 md:p-8 relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/8 via-transparent to-transparent shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-md">
                                                <h3 className="text-sm font-black text-text-app uppercase tracking-widest mb-6 md:mb-8">
                                                    Advancement Vector
                                                </h3>
                                                <div className="space-y-6 relative z-10">
                                                    <div className="p-4 md:p-6 rounded-[1.35rem] bg-linear-to-br from-white/10 to-white/5 border border-white/10 group hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                                                        <p className="text-[10px] font-black text-muted-app uppercase tracking-widest mb-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            Current Breakthrough
                                                            Phase
                                                        </p>
                                                        <div className="flex items-center justify-between mb-6">
                                                            <span className="text-xl md:text-2xl font-display font-black text-text-app tracking-tight">
                                                                Expert Status
                                                            </span>
                                                            <span className="text-xs md:text-sm font-mono font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">
                                                                1600 RP
                                                            </span>
                                                        </div>
                                                        <div className="h-2.5 w-full bg-white/6 rounded-full overflow-hidden mb-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.16)]">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${((user?.rating ?? 0) / 1600) * 100}%`,
                                                                }}
                                                                className="h-full bg-linear-to-r from-brand-primary to-brand-secondary rounded-full relative"
                                                            >
                                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[progress_1s_linear_infinite]" />
                                                            </motion.div>
                                                        </div>
                                                        <div className="flex justify-between mt-4">
                                                            <span className="text-[10px] font-bold text-muted-app italic">
                                                                Progressing...
                                                            </span>
                                                            <span className="text-[10px] font-black text-text-app uppercase">
                                                                {Math.round(
                                                                    ((user?.rating ??
                                                                        0) /
                                                                        1600) *
                                                                        100,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
        </>
    );
}

export const PrepTab = React.memo(PrepTabImpl);
