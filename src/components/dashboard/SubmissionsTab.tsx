import React, { useState } from 'react';
import { RefreshCcw, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const PAGE_SIZE = 50;

function SubmissionsTabImpl({
    submissions,
    processedSubmissions,
    searchQuery,
    setSearchQuery,
    verdictFilter,
    setVerdictFilter,
    languageFilter,
    setLanguageFilter,
    availableLanguages,
    sortKey,
    sortDirection,
    toggleSort,
    refreshing,
    refreshSubmissions,
    setSelectedSubmission,
}: any) {
    const [page, setPage] = useState(0);
    const totalItems = processedSubmissions.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const paged = processedSubmissions.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE,
    );

    return (
        <>
            <Card className="p-0 overflow-hidden shadow-2xl">
                <div className="p-4 md:p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card-app/30">
                    <div>
                        <h3 className="text-lg md:text-xl font-display font-bold text-text-app">
                            Submissions Archive
                        </h3>
                        <p className="text-[10px] font-mono text-muted-app uppercase tracking-[0.2em] mt-1 opacity-50">
                            {totalItems} results
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <div className="relative group flex-1 lg:w-64">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-app"
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-text-app focus:outline-hidden focus:border-brand-primary w-full transition-all"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(0);
                                }}
                            />
                        </div>
                        <select
                            className="px-2.5 py-2 bg-card-app/20 border border-white/10 rounded-xl text-[10px] font-bold text-text-app appearance-none focus:outline-none focus:border-brand-primary shrink-0"
                            value={verdictFilter}
                            onChange={(e) => {
                                setVerdictFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="ALL">All</option>
                            <option value="OK">Accepted</option>
                            <option value="WRONG_ANSWER">Wrong</option>
                            <option value="TIME_LIMIT_EXCEEDED">TLE</option>
                        </select>
                        <Button
                            variant="secondary"
                            onClick={refreshSubmissions}
                            isLoading={refreshing}
                            className="h-9 px-3 shrink-0 rounded-xl"
                        >
                            <RefreshCcw
                                size={14}
                                className={refreshing ? 'animate-spin' : ''}
                            />
                        </Button>
                    </div>
                </div>

                <div className="md:hidden text-[10px] text-muted-app/70 flex justify-end mb-2 italic">
                    Swipe table to view more →
                </div>
                <div className="max-h-162.5 overflow-y-auto custom-scrollbar overflow-x-auto pb-2">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead className="sticky top-0 z-10 bg-bg-app shadow-sm shadow-white/5">
                            <tr>
                                {[
                                    {
                                        id: 'problem',
                                        label: 'Problem Subject',
                                        className: '',
                                    },
                                    {
                                        id: 'verdict',
                                        label: 'Status',
                                        className: '',
                                    },
                                    {
                                        id: 'lang',
                                        label: 'Sys',
                                        className: 'hidden sm:table-cell',
                                    },
                                    {
                                        id: 'time',
                                        label: 'Latency',
                                        className: 'hidden md:table-cell',
                                    },
                                    {
                                        id: 'when',
                                        label: 'Timestamp',
                                        className: '',
                                    },
                                ].map((h) => (
                                    <th
                                        key={h.id}
                                        onClick={() => {
                                            toggleSort(h.id);
                                            setPage(0);
                                        }}
                                        className={cn(
                                            'px-4 md:px-8 py-3 md:py-5 text-[9px] uppercase font-black text-muted-app tracking-[0.2em] border-b border-white/5 cursor-pointer hover:text-brand-primary transition-colors group/header',
                                            h.className,
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {h.label}
                                            <ChevronDown
                                                size={10}
                                                className={cn(
                                                    'transition-transform opacity-0 group-hover/header:opacity-100',
                                                    sortKey === h.id &&
                                                        'opacity-100',
                                                    sortKey === h.id &&
                                                        sortDirection ===
                                                            'asc' &&
                                                        'rotate-180',
                                                )}
                                            />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paged.map((sub: any) => (
                                <tr
                                    key={sub.id}
                                    onClick={() =>
                                        setSelectedSubmission(sub)
                                    }
                                    className="group hover:bg-brand-primary/2 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 md:px-8 py-3 md:py-5">
                                        <div className="flex flex-col">
                                            <span
                                                className="text-sm font-bold text-text-app group-hover:text-brand-primary transition-colors cursor-pointer"
                                                onClick={() =>
                                                    window.open(
                                                        `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`,
                                                        '_blank',
                                                    )
                                                }
                                            >
                                                {sub.problem.name}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-muted-app/40 mt-1 uppercase">
                                                #{sub.problem.contestId}
                                                {sub.problem.index}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-3 md:py-5">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    'w-2 h-2 rounded-full',
                                                    sub.verdict === 'OK'
                                                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                                                        : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    'text-[10px] font-black uppercase tracking-widest',
                                                    sub.verdict === 'OK'
                                                        ? 'text-emerald-500'
                                                        : 'text-red-500',
                                                )}
                                            >
                                                {sub.verdict === 'OK'
                                                    ? 'Accepted'
                                                    : 'Failed'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-3 md:py-5 text-[11px] font-mono text-muted-app font-bold hidden sm:table-cell">
                                        {sub.programmingLanguage}
                                    </td>
                                    <td className="px-4 md:px-8 py-3 md:py-5 text-[11px] font-mono text-muted-app font-bold hidden md:table-cell">
                                        {sub.timeConsumedMillis}ms
                                    </td>
                                    <td className="px-4 md:px-8 py-3 md:py-5 text-[11px] font-mono text-muted-app font-bold">
                                        {format(
                                            new Date(
                                                sub.creationTimeSeconds * 1000,
                                            ),
                                            'MMM dd, HH:mm',
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div className="px-4 md:px-8 py-3 border-t border-white/5 flex items-center justify-between bg-card-app/20">
                        <span className="text-[10px] font-mono text-muted-app uppercase tracking-wider">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage <= 0}
                                onClick={() => setPage(Math.max(0, currentPage - 1))}
                                className="p-1.5 rounded-lg border border-white/10 text-muted-app hover:text-text-app hover:border-brand-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                                className="p-1.5 rounded-lg border border-white/10 text-muted-app hover:text-text-app hover:border-brand-primary/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}

export const SubmissionsTab = React.memo(SubmissionsTabImpl);
