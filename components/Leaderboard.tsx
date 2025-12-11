"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Program } from "@/types";
import { HiArrowUpRight, HiStar } from "react-icons/hi2";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  programs: Program[];
}

export function Leaderboard({ programs }: LeaderboardProps) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Scrollbar logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;

    setScrollProgress(progress);
    setIsScrollbarVisible(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollbarVisible(false);
    }, 1000); // Fade out after 1 second
  };

  // Separate featured and organic
  const now = new Date();
  const featuredPrograms = programs.filter(p => p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > now);
  const regularPrograms = programs.filter(p => !featuredPrograms.find(f => f.id === p.id));

  // Carousel logic  // Auto-rotate featured programs
  useEffect(() => {
    if (featuredPrograms.length <= 3) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 3) % featuredPrograms.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPrograms.length]);

  // Get current 3 visible featured programs (circular slice)
  const visibleFeatured = [];
  if (featuredPrograms.length > 0) {
    for (let i = 0; i < Math.min(featuredPrograms.length, 3); i++) {
      // If we have > 3, we cycle; otherwise just show what we have
      const index = featuredPrograms.length > 3
        ? (featuredIndex + i) % featuredPrograms.length
        : i;
      visibleFeatured.push(featuredPrograms[index]);
    }
  }

  const displayRegular = regularPrograms.slice(0, visibleCount);

  // Helper to render card content (no motion wrapper)
  const renderCardContent = (program: Program, isFeatured: boolean, index: number, isCarousel = false) => {
    const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;

    // Rank Logic
    let rankDisplay;
    if (isFeatured) {
      rankDisplay = <HiStar className="w-5 h-5 text-amber-500" />;
    } else {
      // Since 'regularPrograms' is already just the organic ones, simple index map
      // But wait, 'index' passed here is local to the map. 
      // We want global rank relative to "top 3 usually get medals".
      // Let's assume organic rank starts at 1.
      const organicRank = index + 1;
      if (organicRank === 1) rankDisplay = <span className="text-2xl">🥇</span>;
      else if (organicRank === 2) rankDisplay = <span className="text-2xl">🥈</span>;
      else if (organicRank === 3) rankDisplay = <span className="text-2xl">🥉</span>;
      else rankDisplay = <span className="text-base font-semibold text-[var(--text-secondary)]">{organicRank}</span>;
    }

    return (
      <>
        {/* NEW Badge - floating above the card */}
        {isNew && (
          <div className="absolute top-0 right-3 z-10 -translate-y-1/2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-lg",
              isFeatured
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
            )}>
              New
            </span>
          </div>
        )}

        <Link
          href={`/programs/${program.slug || program.id}`}
          className={cn(
            "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden h-full",
            // Styles based on type
            isFeatured
              ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500/50 hover:bg-gradient-to-r hover:from-amber-500/20 hover:via-amber-500/10 hover:to-transparent"
              : "bg-white dark:bg-black/40 backdrop-blur-sm border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-lg dark:hover:bg-black/60 hover:bg-gray-50"
          )}
          style={{
            boxShadow: isFeatured
              ? "0 4px 20px -2px rgba(245, 158, 11, 0.15)"
              : undefined
          }}
        >
          {/* Rank */}
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            {rankDisplay}
          </div>

          {/* Logo */}
          <div className="relative w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            {program.logoUrl ? (
              <Image
                src={program.logoUrl}
                alt={program.programName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--text-tertiary)]">
                {program.programName[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={cn(
                "font-medium text-sm truncate transition-colors",
                isFeatured
                  ? "text-[var(--text-primary)] group-hover:text-amber-500"
                  : "text-[var(--text-primary)] group-hover:text-[var(--accent-solid)]"
              )}>
                {program.programName}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border)]">
                {program.category}
              </span>
              {isFeatured && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20">
                  Sponsored
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {program.tagline}
            </p>
          </div>

          {/* Commission */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold border tabular-nums whitespace-nowrap",
              isFeatured
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-[var(--accent-dim)] text-[var(--accent-solid)] border-[var(--accent-solid)]/20"
            )}>
              {program.commissionRate}%{" "}
              <span className="font-medium opacity-80">
                {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
            isFeatured
              ? "text-[var(--text-secondary)] group-hover:text-amber-500 group-hover:bg-amber-500/10"
              : "text-[var(--text-secondary)] group-hover:text-[var(--accent-solid)] group-hover:bg-[var(--accent-dim)]"
          )}>
            <HiArrowUpRight className="w-3 h-3" />
          </div>
        </Link>
      </>
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 pb-20 relative group/list">

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto pb-6 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="min-w-[800px] md:min-w-0">
          {/* Unified Table Block */}
          <div className="border border-zinc-200 dark:border-white/[0.08] rounded-2xl bg-white dark:bg-[#080808]/50 overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-zinc-100 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-white/[0.02] text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest backdrop-blur-sm">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Program</div>
              <div className="col-span-3 hidden md:block">Category</div>
              <div className="col-span-3 md:col-span-2 text-right">Commission</div>
              <div className="col-span-2 md:col-span-1"></div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] perspective-[600px]">
              {/* Featured Section - Integrated into Table */}
              <AnimatePresence mode="popLayout">
                {featuredPrograms.length > 0 && Array.from({ length: Math.min(featuredPrograms.length, 3) }).map((_, i) => {
                  const pIndex = (featuredIndex + i) % featuredPrograms.length;
                  const program = featuredPrograms[pIndex];
                  const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;

                  return (
                    <motion.div
                      key={`featured-${program.id}`}
                      initial={{ opacity: 0, rotateX: -90, scale: 0.9 }}
                      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                      exit={{ opacity: 0, rotateX: 90, scale: 0.9 }}
                      transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                      style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                    >
                      <Link href={`/programs/${program.slug || program.id}`} className="block group bg-amber-50 dark:bg-amber-500/[0.03] hover:bg-amber-100/50 dark:hover:bg-amber-500/[0.06] transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">

                          {/* Star Icon instead of Rank */}
                          <div className="col-span-1 flex items-center justify-center">
                            <HiStar className="w-4 h-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                          </div>

                          {/* Program Info */}
                          <div className="col-span-6 md:col-span-5 flex items-center gap-4 min-w-0">
                            <div className="relative w-9 h-9 rounded bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0 shadow-sm dark:shadow-none">
                              {program.logoUrl ? (
                                <Image src={program.logoUrl} alt={program.programName} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 dark:text-white/20 text-[10px]">{program.programName[0]}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm truncate">{program.programName}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 bg-amber-100 dark:bg-amber-500/5">Sponsored</span>
                                {isNew && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/5">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate hidden md:block mt-0.5">{program.tagline}</p>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="col-span-3 hidden md:flex items-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400">
                              {program.category}
                            </span>
                          </div>

                          {/* Metrics (Pill) */}
                          <div className="col-span-3 md:col-span-2 flex justify-end">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-100 dark:bg-amber-500/5 text-amber-600 dark:text-amber-500">
                              <span className="text-xs font-bold">{program.commissionRate}%</span>
                              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                                {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
                              </span>
                            </div>
                          </div>

                          {/* Arrow Action */}
                          <div className="col-span-2 md:col-span-1 flex justify-end">
                            <HiArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-600 dark:group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Regular Table Rows */}
              <AnimatePresence mode="popLayout">
                {displayRegular.map((program, index) => {
                  const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;

                  return (
                    <motion.div
                      key={program.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group"
                    >
                      <Link
                        href={`/programs/${program.slug || program.id}`}
                        className="block hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors duration-150"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center px-6 py-4">
                          {/* Rank */}
                          <div className="col-span-1 text-center font-mono text-zinc-400 dark:text-zinc-600 text-xs">
                            {index + 1}
                          </div>

                          {/* Program Info */}
                          <div className="col-span-6 md:col-span-5 flex items-center gap-4 min-w-0">
                            <div className="relative w-9 h-9 rounded bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0 shadow-sm dark:shadow-none">
                              {program.logoUrl ? (
                                <Image src={program.logoUrl} alt={program.programName} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 dark:text-white/20 text-[10px]">{program.programName[0]}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-200 dark:group-hover:text-white text-sm truncate transition-colors">{program.programName}</h3>
                                {isNew && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-100 dark:bg-emerald-500/5">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate hidden md:block mt-0.5">{program.tagline}</p>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="col-span-3 hidden md:flex items-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-[#111] border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400">
                              {program.category}
                            </span>
                          </div>

                          {/* Commission (Pill) */}
                          <div className="col-span-3 md:col-span-2 flex justify-end">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/5 transition-colors">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{program.commissionRate}%</span>
                              <span className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wide">
                                {program.commissionDuration === "Recurring" ? "recurring" : "one-time"}
                              </span>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="col-span-2 md:col-span-1 flex justify-end">
                            <HiArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-700 dark:group-hover:text-zinc-400 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Custom Scrollbar - Mobile Only */}
      <div
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/10 rounded-full overflow-hidden transition-opacity duration-300 md:hidden pointer-events-none z-50",
          isScrollbarVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="absolute top-0 bottom-0 bg-white/40 rounded-full transition-all duration-150 ease-out"
          style={{
            width: '25%', // Fixed percentage width
            left: `${(scrollProgress / 100) * 75}%` // Move within the remaining 75%
          }}
        />
      </div>

      {/* See More Button */}
      {
        visibleCount < regularPrograms.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-6 py-2 rounded-full border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-200"
            >
              Load more
            </button>
          </div>
        )
      }
    </div >
  );
}
