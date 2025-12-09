"use client";

import { useState, useEffect } from "react";
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

  // Separate featured and organic
  const now = new Date();
  const featuredPrograms = programs.filter(p => p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > now);
  const regularPrograms = programs.filter(p => !featuredPrograms.find(f => f.id === p.id));

  // Carousel logic for featured
  useEffect(() => {
    if (featuredPrograms.length <= 3) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPrograms.length);
    }, 10000); // Rotate every 10 seconds

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
    <div className="max-w-[800px] mx-auto px-6 pb-20">
      <div className="space-y-3 relative">

        {/* Featured Section */}
        {featuredPrograms.length > 0 && (
          <div className="grid grid-cols-1 gap-3 mb-6 relative" style={{ perspective: "1000px" }}>
            {/* We always render up to 3 slots if we have them */}
            {Array.from({ length: Math.min(featuredPrograms.length, 3) }).map((_, i) => {
              // Calculate which program is in this slot
              const pIndex = (featuredIndex + i) % featuredPrograms.length;
              const program = featuredPrograms[pIndex];
              const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;

              return (
                <div key={`slot-${i}`} className="relative h-[72px]"> {/* Fixed height container to prevent layout shifts during flip */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={program.id}
                      // No layoutId for featured to prevent moving between slots
                      initial={{ opacity: 0, rotateX: -90 }}
                      animate={{ opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, rotateX: 90 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="relative w-full h-full"
                      style={{ backfaceVisibility: "hidden" }} // Ensure smooth flip
                    >
                      <div className="relative w-full h-full">
                        {/* NEW Badge - floating above the card */}
                        {isNew && (
                          <div className="absolute top-0 right-3 z-10 -translate-y-1/2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-lg",
                              true // isFeatured is true here
                                ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
                            )}>
                              New
                            </span>
                          </div>
                        )}
                        <Link href={`/programs/${program.slug || program.id}`} className="block h-full">
                          {renderCardContent(program, true, i)}
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Regular Section */}
        <AnimatePresence mode="popLayout">
          {displayRegular.map((program, index) => {
            const isNew = program.createdAt && (new Date().getTime() - new Date(program.createdAt).getTime()) < 24 * 60 * 60 * 1000;
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
                {isNew && (
                  <div className="absolute top-0 right-3 z-10 -translate-y-1/2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white shadow-lg",
                      false // isFeatured is false for this section
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-500/30"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30"
                    )}>
                      New
                    </span>
                  </div>
                )}
                <Link href={`/programs/${program.slug || program.id}`} className="block h-full">
                  {renderCardContent(program, false, index)}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Fog Effect */}
        {visibleCount < regularPrograms.length && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-background)] to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* See More Button */}
      {
        visibleCount < regularPrograms.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="px-8 py-3 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] font-medium shadow-lg hover:border-[var(--accent-solid)] hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
            >
              See more programs
              <HiArrowUpRight className="w-4 h-4 rotate-45 group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )
      }
    </div >
  );
}
