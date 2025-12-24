"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Program } from "@/types";
import { HiArrowUpRight, HiStar } from "react-icons/hi2";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgramCard } from "./ProgramCard";
import { AnimatePresence, motion } from "framer-motion";

interface LeaderboardProps {
  programs: Program[];
}

export function Leaderboard({ programs }: LeaderboardProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  // Separate sponsored and organic programs
  const now = useMemo(() => new Date(), []);

  const sponsoredPrograms = useMemo(() => {
    return programs.filter(
      (p) => p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > now
    ).slice(0, 3);
  }, [programs, now]);

  const organicPrograms = useMemo(() => {
    const sponsoredIds = new Set(sponsoredPrograms.map((p) => p.id));
    return programs.filter((p) => !sponsoredIds.has(p.id));
  }, [programs, sponsoredPrograms]);

  const displayOrganicPrograms = useMemo(() => {
    return organicPrograms.slice(0, visibleCount);
  }, [organicPrograms, visibleCount]);

  // Scrollbar logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
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
    }, 1000);
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 relative group/list pb-24">

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

        {/* Unified Table Block (List View) */}
        <div className="min-w-[800px] md:min-w-0">
          <div className="border border-zinc-200/60 dark:border-white/[0.1] rounded-2xl bg-white dark:bg-[#0A0A0A] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-300">

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-widest backdrop-blur-sm">
              <div className="col-span-1 text-center opacity-40">#</div>
              <div className="col-span-5">Program</div>
              <div className="col-span-3 opacity-60">Category</div>
              <div className="col-span-2 text-left opacity-60">Commission</div>
              <div className="col-span-1"></div>
            </div>

            {/* Sponsored Section */}
            {sponsoredPrograms.length > 0 && (
              <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] bg-gradient-to-b from-amber-500/[0.03] to-transparent dark:from-amber-500/[0.05]">
                {sponsoredPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    variant="row"
                    rank={undefined} // No rank for sponsored
                  />
                ))}
              </div>
            )}

            {/* Divider between Sponsored and Organic */}
            {sponsoredPrograms.length > 0 && organicPrograms.length > 0 && (
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/20 to-transparent" />
            )}

            {/* Organic Leaderboard */}
            <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] perspective-[600px]">
              <AnimatePresence mode="popLayout">
                {displayOrganicPrograms.map((program, index) => (
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      layout: { type: "spring", stiffness: 200, damping: 25, mass: 1 },
                      opacity: { duration: 0.3, ease: "easeOut" }
                    }}
                    key={program.id}
                  >
                    <ProgramCard
                      program={program}
                      variant="row"
                      rank={index + 1} // Organic ranks start from 1
                    />
                  </motion.div>
                ))}
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
        displayOrganicPrograms.length < organicPrograms.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setVisibleCount((prev) => prev + 12);
              }}
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

