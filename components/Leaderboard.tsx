"use client";

import { useState } from "react";
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

  // Programs are already sorted by API (featured first, then by trendingScore)
  const displayPrograms = programs.slice(0, visibleCount);

  return (
    <div className="max-w-[800px] mx-auto px-6 pb-20">
      {/* Programs List */}
      <div className="space-y-3 relative">
        <AnimatePresence mode="popLayout">
          {displayPrograms.map((program, index) => {
            const isFeatured = program.isFeatured && program.featuredExpiresAt && new Date(program.featuredExpiresAt) > new Date();
            
            // Check if program is new (less than 24 hours old)
            const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;

            // Rank display - medals for top 3 organic, star for featured
            let rankDisplay;
            if (isFeatured) {
              rankDisplay = <HiStar className="w-5 h-5 text-amber-500" />;
            } else {
              // Count non-featured programs before this one for organic rank
              const organicIndex = displayPrograms
                .slice(0, index)
                .filter(p => !(p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > new Date()))
                .length;
              
              if (organicIndex === 0) rankDisplay = <span className="text-2xl">🥇</span>;
              else if (organicIndex === 1) rankDisplay = <span className="text-2xl">🥈</span>;
              else if (organicIndex === 2) rankDisplay = <span className="text-2xl">🥉</span>;
              else rankDisplay = <span className="text-base font-semibold text-[var(--text-secondary)]">{organicIndex + 1}</span>;
            }

            return (
              <motion.div
                key={program.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* NEW Badge - floating above the card */}
                {isNew && !isFeatured && (
                  <div className="absolute -top-2 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      New
                    </span>
                  </div>
                )}
                
                <Link
                  href={`/programs/${program.slug || program.id}`}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden",
                    isFeatured 
                      ? "bg-gradient-to-r from-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-500/50"
                      : isNew
                        ? "bg-gradient-to-r from-emerald-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/50"
                        : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent-solid)]"
                  )}
                  style={{ 
                    boxShadow: isFeatured 
                      ? "0 4px 20px -2px rgba(245, 158, 11, 0.1)" 
                      : isNew
                        ? "0 4px 20px -2px rgba(16, 185, 129, 0.15)"
                        : "var(--shadow-card)" 
                  }}
                  onMouseEnter={(e) => !isFeatured && !isNew && (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
                  onMouseLeave={(e) => !isFeatured && !isNew && (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
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
                    <div className="px-2 py-0.5 rounded-md bg-[var(--accent-dim)] text-[var(--accent-solid)] text-[10px] font-bold border border-[var(--accent-solid)]/20 tabular-nums whitespace-nowrap">
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
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Fog Effect */}
        {visibleCount < programs.length && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-background)] to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* See More Button */}
      {visibleCount < programs.length && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-8 py-3 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-medium shadow-lg hover:border-[var(--accent-solid)] hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
          >
            See more programs
            <HiArrowUpRight className="w-4 h-4 rotate-45 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
