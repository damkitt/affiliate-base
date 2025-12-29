"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Program } from "@/types";
import { cn, isProgramSponsored } from "@/lib/utils";
import { ProgramCard } from "./ProgramCard";
import { AnimatePresence, motion } from "framer-motion";

interface LeaderboardProps {
  programs: Program[];
}

export function Leaderboard({ programs }: LeaderboardProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const sponsoredPrograms = useMemo(() => {
    return programs.filter(isProgramSponsored).slice(0, 3);
  }, [programs]);

  const organicPrograms = useMemo(() => {
    const sponsoredIds = new Set(sponsoredPrograms.map((p) => p.id));
    return programs.filter((p) => !sponsoredIds.has(p.id));
  }, [programs, sponsoredPrograms]);

  const displayOrganicPrograms = useMemo(() => {
    return organicPrograms.slice(0, visibleCount);
  }, [organicPrograms, visibleCount]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
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
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 relative group/list pb-24">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto pb-6 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="min-w-[800px] md:min-w-0">
          <div className="border border-zinc-200/60 dark:border-white/[0.1] rounded-2xl bg-white dark:bg-[#0A0A0A] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-300">
            {}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] text-[11px] font-regular text-zinc-900 dark:text-zinc-300 uppercase tracking-widest backdrop-blur-sm">
              <div className="w-6 text-center opacity-60">#</div>
              <div className="col-span-5 opacity-60">Program</div>
              <div className="col-span-3 opacity-60">Category</div>
              <div className="col-span-2 text-left opacity-60">Commission</div>
              <div className="col-span-1"></div>
            </div>

            {sponsoredPrograms.length > 0 && (
              <div className="bg-gradient-to-b from-amber-500/[0.03] to-transparent dark:from-amber-500/[0.05]">
                {sponsoredPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    variant="row"
                    rank={undefined}
                  />
                ))}
              </div>
            )}

            {programs.length > 0 && (
              <AnimatePresence mode="popLayout">
                {displayOrganicPrograms.map((program, index) => (
                  <div key={program.id}>
                    <ProgramCard
                      program={program}
                      variant="row"
                      rank={index + 1}
                    />
                  </div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/10 rounded-full overflow-hidden transition-opacity duration-300 md:hidden pointer-events-none z-50",
          isScrollbarVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="absolute top-0 bottom-0 bg-white/40 rounded-full transition-all duration-150 ease-out"
          style={{
            width: "25%",
            left: `${(scrollProgress / 100) * 75}%`,
          }}
        />
      </div>

      {displayOrganicPrograms.length < organicPrograms.length && (
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
      )}
    </div>
  );
}
