"use client";

import Link from "next/link";
import Image from "next/image";
import { HiArrowUpRight, HiStar } from "react-icons/hi2";
import { Program } from "@/types";
import { cn, isProgramNew } from "@/lib/utils";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/Tooltip";

interface ProgramCardProps {
    program: Program;
    variant?: "row" | "card"; // 'row' for Table, 'card' for SimilarPrograms
    rank?: number;
    highlightNew?: boolean;
}

export function ProgramCard({
    program,
    variant = "row",
    rank,
    highlightNew = true
}: ProgramCardProps) {
    const isNew = highlightNew && isProgramNew(program.createdAt);
    const isSponsored = program.isFeatured && program.featuredExpiresAt && new Date(program.featuredExpiresAt) > new Date();

    const logoSrc = program.logoUrl || `https://www.google.com/s2/favicons?domain=${program.websiteUrl || ""}&sz=128`;
    const categoryIconName = CATEGORY_ICONS[program.category as keyof typeof CATEGORY_ICONS] || "HiCube";

    // Common Logo Component
    const Logo = (
        <div className={cn(
            "relative overflow-hidden shrink-0 flex items-center justify-center bg-white dark:bg-[#111]",
            // ROW: Standard
            variant === "row" && "w-9 h-9 rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none",
            // CARD (Similar):
            variant === "card" && "w-10 h-10 rounded border border-zinc-200"
        )}>
            {program.logoUrl ? (
                <Image src={program.logoUrl} alt={program.programName} fill className="object-cover" unoptimized />
            ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 dark:text-white/20 text-[10px]">
                    {program.programName[0]}
                </div>
            )}
        </div>
    );

    // NewDot with Tooltip
    // Positioned absolutely in the left gutter of the card
    const NewDot = isNew ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 group/dot flex items-center justify-center p-1 cursor-help z-50">
            <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isSponsored
                    ? "bg-amber-500 shadow-[0_0_8px_1px_rgba(245,158,11,0.6)]"
                    : "bg-emerald-500 shadow-[0_0_8px_1px_rgba(16,185,129,0.6)]"
            )} />

            {/* Beautiful Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-800 dark:border-white/10 text-white text-[10px] font-medium whitespace-nowrap rounded-lg opacity-0 translate-x-1 group-hover/dot:opacity-100 group-hover/dot:translate-x-0 transition-all duration-200 shadow-xl pointer-events-none">
                New Arrival (24h)
                {/* Little arrow */}
                <div className="absolute top-1/2 -left-1 -mt-[3px] border-4 border-transparent border-r-zinc-900/95 dark:border-r-zinc-800/95" />
            </div>
        </div>
    ) : null;

    const SponsoredBadge = isSponsored ? (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 bg-amber-100 dark:bg-amber-500/5">
            Sponsored
        </span>
    ) : null;

    const CommissionPill = (
        <div className={cn(
            "inline-flex items-center transition-all duration-300 gap-2 px-3.5 py-1.5 rounded-full border shadow-sm",
            isSponsored
                ? "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300"
                : "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 group-hover:border-emerald-300 group-hover:bg-emerald-200/80 dark:group-hover:bg-emerald-500/30 dark:group-hover:border-emerald-500/50 transition-colors"
        )}>
            <span className="text-xs font-bold">
                {program.commissionRate}%
            </span>
            <span className={cn(
                "text-[10px] font-bold uppercase tracking-wide opacity-80"
            )}>
                {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
            </span>
        </div>
    );

    // --- LAYOUTS ---

    // 1. Leaderboard Row (Standard Table Style)
    if (variant === "row") {
        const wrapperClasses = cn(
            "block transition-all duration-300 ease-out group relative",
            "border-b border-zinc-100 dark:border-white/[0.04] last:border-0",
            "hover:bg-zinc-50/50 dark:hover:bg-white/[0.02]",
            isSponsored
                ? "bg-amber-50/30 dark:bg-amber-500/[0.03] hover:bg-amber-50/50 dark:hover:bg-amber-500/[0.08]"
                : ""
        );
        return (
            <Link href={`/programs/${program.slug || program.id}`} className={wrapperClasses}>
                {NewDot}

                <div className="grid grid-cols-12 gap-4 items-center px-6 py-3.5">
                    {/* Rank (Col 1) */}
                    <div className="col-span-1 flex items-center justify-center">
                        {isSponsored ? (
                            <HiStar className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                        ) : (
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                                            {rank === 1 ? (
                                                <span className="text-xl leading-none filter drop-shadow-sm">🥇</span>
                                            ) : rank === 2 ? (
                                                <span className="text-xl leading-none filter drop-shadow-sm">🥈</span>
                                            ) : rank === 3 ? (
                                                <span className="text-xl leading-none filter drop-shadow-sm">🥉</span>
                                            ) : (
                                                <span className="font-mono text-zinc-400 dark:text-zinc-600 text-xs">
                                                    {rank}
                                                </span>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[220px] p-2.5 text-center bg-zinc-900/95 dark:bg-zinc-800/95 backdrop-blur-md border border-zinc-800 dark:border-white/10 shadow-xl animate-in fade-in-0 zoom-in-95">
                                        <p className="text-[10px] leading-relaxed font-medium text-zinc-300">
                                            Ranked by <span className="text-zinc-100">engagement</span>, <span className="text-zinc-100">quality</span> & <span className="text-zinc-100">popularity</span>. New programs get a temporary boost.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                    {/* Program Info */}
                    <div className="col-span-6 md:col-span-5 flex items-center gap-4 min-w-0">
                        {Logo}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className={cn(
                                    "font-semibold text-sm truncate transition-colors",
                                    isSponsored ? "text-zinc-900 dark:text-white" : "text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-white"
                                )}>
                                    {program.programName}
                                </h3>
                                {SponsoredBadge}
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate hidden md:block mt-0.5">{program.tagline}</p>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-3 hidden md:flex items-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400">
                            <CategoryIcon iconName={categoryIconName} className="w-3 h-3 opacity-70" />
                            {program.category}
                        </span>
                    </div>

                    {/* Commission */}
                    <div className="col-span-3 md:col-span-2 flex justify-start">
                        {CommissionPill}
                    </div>

                    {/* Action */}
                    <div className="col-span-2 md:col-span-1 flex justify-end items-center gap-2">
                        {isSponsored ? (
                            <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                            </svg>
                        ) : (
                            <HiArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors" />
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    // 2. Card (Box) Layout (Similar Programs)
    if (variant === "card") {
        return (
            <Link
                href={`/programs/${program.slug || program.id}`}
                className="group p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-solid)]/30 transition-all shadow-sm"
            >
                <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="relative w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {program.logoUrl ? (
                            <Image
                                src={program.logoUrl}
                                alt={program.programName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <span className="text-lg font-bold text-[var(--accent-solid)]">{program.programName.charAt(0)}</span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-solid)] transition-colors">
                            {program.programName}
                        </h3>

                        {/* Category Badge */}
                        <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)]">
                            <CategoryIcon
                                iconName={categoryIconName}
                                className="w-3 h-3 text-[var(--text-tertiary)]"
                            />
                            <span className="text-xs text-[var(--text-tertiary)]">
                                {program.category}
                            </span>
                        </div>
                    </div>

                    {/* Commission */}
                    {program.commissionRate != null && (
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-[var(--accent-solid)]">
                                {program.commissionRate}%
                            </div>
                            <div className="text-xs text-[var(--text-tertiary)]">commission</div>
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    return null;
}
