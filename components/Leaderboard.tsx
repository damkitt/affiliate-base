"use client";

import { Program } from "@/types";
import { CATEGORY_ICONS } from "@/constants";
import { HiArrowUpRight, HiEye } from "react-icons/hi2";
import Link from "next/link";
import useSWR from "swr";

interface LeaderboardProps {
  programs: Program[];
  isLoading: boolean;
}

export function Leaderboard({ programs, isLoading }: LeaderboardProps) {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data: clicksMap } = useSWR<Record<string, number>>(
    "/api/metrics/clicks",
    fetcher
  );
  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse bg-[var(--bg-secondary)]"
            />
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
      <div className="flex items-center justify-between px-6 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
        <span>{programs.length} programs</span>
        <div className="flex items-center gap-6">
          <span className="hidden sm:inline">Interest</span>
          <span className="hidden sm:inline">Commission</span>
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-3">
        {programs.map((program, index) => {
          const logoSrc =
            program.logoUrl ||
            `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;
          const categoryIconName = CATEGORY_ICONS[program.category] || "HiCube";

          return (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-solid)] transition-all duration-200 cursor-pointer"
              style={{ boxShadow: "var(--shadow-card)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = "var(--shadow-card)")
              }
            >
              {/* Rank */}
              <div className="w-10 h-10 flex items-center justify-center">
                {index === 0 ? (
                  <span className="text-2xl">🥇</span>
                ) : index === 1 ? (
                  <span className="text-2xl">🥈</span>
                ) : index === 2 ? (
                  <span className="text-2xl">🥉</span>
                ) : (
                  <span className="text-base font-semibold text-[var(--text-secondary)]">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Logo */}
              <div className="relative w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                {program.logoUrl ? (
                  <img
                    src={program.logoUrl}
                    alt={program.programName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--text-tertiary)]">
                    {program.programName[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-solid)] transition-colors">
                    {program.programName}
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
              <div className="flex items-center gap-3">
                {/* Interest/Views */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border)] tabular-nums">
                  <HiEye className="w-3.5 h-3.5 text-[var(--accent-solid)]" />
                  <span>{clicksMap?.[program.id] ?? 0}</span>
                </div>

                {/* Commission */}
                <div className="px-2.5 py-1 rounded-lg bg-[var(--accent-dim)] text-[var(--accent-solid)] text-xs font-bold border border-[var(--accent-solid)]/20 tabular-nums">
                  {program.commissionRate}%
                </div>
              </div>

              {/* Arrow */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-solid)] group-hover:bg-[var(--accent-dim)] transition-all duration-200">
                <HiArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
