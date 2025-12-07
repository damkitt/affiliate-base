"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Program } from "@/types";
import { HiArrowUpRight, HiEye, HiStar } from "react-icons/hi2";
import Link from "next/link";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  programs: Program[];
}

export function Leaderboard({ programs }: LeaderboardProps) {
  const [visibleCount, setVisibleCount] = useState(12);

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: clicksMap } = useSWR<Record<string, number>>(
    "/api/metrics/clicks",
    fetcher,
    { refreshInterval: 5000 }
  );

  // Split into featured and organic
  const { featuredPrograms, organicPrograms } = useMemo(() => {
    return sortPrograms(programs, clicksMap);
  }, [programs, clicksMap]);

  // Combine for display based on visibleCount, but keep structure
  // Actually, we should render them in two blocks to ensure organic gets medals correctly

  // Let's just merge them for the list but handle the index/medal logic carefully
  const displayPrograms = [...featuredPrograms, ...organicPrograms].slice(0, visibleCount);

  return (
    <div className="max-w-[800px] mx-auto px-6 pb-20">
      {/* ... Header ... */}

      {/* Programs List */}
      <div className="space-y-3 relative">
        <AnimatePresence mode="popLayout">
          {displayPrograms.map((program) => {
            const clicks = clicksMap?.[program.id] ?? program.clicksCount ?? 0;

            // Determine rank/medal only for organic programs
            let rankDisplay = null;
            if (!program.isFeatured) {
              const organicIndex = organicPrograms.findIndex(p => p.id === program.id);
              if (organicIndex === 0) rankDisplay = <span className="text-2xl">🥇</span>;
              else if (organicIndex === 1) rankDisplay = <span className="text-2xl">🥈</span>;
              else if (organicIndex === 2) rankDisplay = <span className="text-2xl">🥉</span>;
              else rankDisplay = <span className="text-base font-semibold text-[var(--text-secondary)]">{organicIndex + 1}</span>;
            } else {
              // Featured icon/placeholder
              rankDisplay = <HiStar className="w-5 h-5 text-amber-500" />;
            }

            return (
              <motion.div
                key={program.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/programs/${program.id}`}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer relative overflow-hidden",
                    !program.isFeatured && "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--accent-solid)]"
                  )}
                  style={{
                    boxShadow: program.isFeatured ? "0 4px 20px -2px rgba(16, 185, 129, 0.1)" : "var(--shadow-card)",
                    backgroundColor: program.isFeatured ? "hsla(163, 72%, 38%, 0.03)" : undefined,
                    borderColor: program.isFeatured ? "var(--accent-solid)" : undefined
                  }}
                  onMouseEnter={(e) =>
                    !program.isFeatured && (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")
                  }
                  onMouseLeave={(e) =>
                    !program.isFeatured && (e.currentTarget.style.boxShadow = "var(--shadow-card)")
                  }
                >
                  {/* Rank / Featured Icon */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {program.isFeatured ? (
                      <span className="text-lg drop-shadow-sm">📌</span>
                    ) : (
                      rankDisplay
                    )}
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

                  {/* ... Rest of content ... */}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-solid)] transition-colors">
                        {program.programName}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border)]">
                        {program.category}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {program.tagline}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2">
                    {/* Interest/Views */}
                    {!program.isFeatured && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] text-[10px] font-medium border border-[var(--border)] tabular-nums">
                        <HiEye className="w-3 h-3 text-[var(--accent-solid)]" />
                        <span>{clicks}</span>
                      </div>
                    )}

                    {/* Commission */}
                    <div className="px-2 py-0.5 rounded-md bg-[var(--accent-dim)] text-[var(--accent-solid)] text-[10px] font-bold border border-[var(--accent-solid)]/20 tabular-nums">
                      {program.commissionRate}%
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-solid)] group-hover:bg-[var(--accent-dim)] transition-all duration-200">
                    <HiArrowUpRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Fog Effect */}
        {visibleCount < (featuredPrograms.length + organicPrograms.length) && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-background)] to-transparent pointer-events-none z-10" />
        )}
      </div>

      {/* See More Button */}
      {visibleCount < (featuredPrograms.length + organicPrograms.length) && (
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

function sortPrograms(programs: Program[], clicksMap?: Record<string, number>) {
  const featured: Program[] = [];
  const organic: Program[] = [];

  programs.forEach((p) => {
    if (p.isFeatured) {
      featured.push(p);
    } else {
      organic.push(p);
    }
  });

  // Sort organic by clicks
  organic.sort((a, b) => {
    const clicksA = clicksMap?.[a.id] ?? a.clicksCount ?? 0;
    const clicksB = clicksMap?.[b.id] ?? b.clicksCount ?? 0;
    if (clicksA !== clicksB) return clicksB - clicksA;
    return a.programName.localeCompare(b.programName);
  });

  // Sort featured by clicks (descending)
  featured.sort((a, b) => {
    const clicksA = clicksMap?.[a.id] ?? a.clicksCount ?? 0;
    const clicksB = clicksMap?.[b.id] ?? b.clicksCount ?? 0;
    return clicksB - clicksA;
  });

  return { featuredPrograms: featured, organicPrograms: organic };
}
