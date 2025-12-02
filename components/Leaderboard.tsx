"use client";

import { Program, CATEGORY_ICONS } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";
import { HiArrowUpRight } from "react-icons/hi2";
import Link from "next/link";

interface LeaderboardProps {
    programs: Program[];
    isLoading: boolean;
}

export function Leaderboard({ programs, isLoading }: LeaderboardProps) {
    if (isLoading) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-8">
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-20 rounded-xl animate-pulse bg-[var(--bg-secondary)]" />
                    ))}
                </div>
            </div>
        );
    }

    if (programs.length === 0) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <p className="text-[var(--text-tertiary)]">No programs found</p>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-6 pb-20">
            {/* Simple table header */}
            <div className="flex items-center justify-between px-6 py-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                <span>{programs.length} programs</span>
                <span className="hidden sm:inline">Commission</span>
            </div>

            {/* Programs List */}
            <div className="space-y-3">
                {programs.map((program, index) => {
                    const logoSrc = program.logoBase64 || `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;
                    const categoryIconName = CATEGORY_ICONS[program.category] || "HiCube";

                    return (
                        <Link
                            key={program.id}
                            href={`/programs/${program.id}`}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 cursor-pointer"
                        >
                            {/* Rank */}
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border
                              ${index === 0 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                                    index === 1 ? "text-slate-300 bg-slate-300/10 border-slate-300/20" :
                                        index === 2 ? "text-amber-700 bg-amber-700/10 border-amber-700/20" :
                                            "text-[var(--text-tertiary)] bg-[var(--bg-secondary)] border-[var(--border)]"}
                            `}>
                                {index + 1}
                            </div>

                            {/* Logo */}
                            <div className="relative w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                {program.logoBase64 ? (
                                    <img src={program.logoBase64} alt={program.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--text-tertiary)]">
                                        {program.name[0]}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                                        {program.name}
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border)]">
                                        {program.category}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] truncate">
                                    {program.tagline}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="text-right flex flex-col items-end gap-1">
                                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 tabular-nums">
                                    {program.commissionRate}
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:bg-[var(--bg-secondary)] transition-all duration-200">
                                <HiArrowUpRight className="w-4 h-4" />
                            </div>
                        </Link>
                    );
                })}
            </div >
        </div >
    );
}
