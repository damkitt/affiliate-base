"use client";

import Image from "next/image";
import { HiSparkles } from "react-icons/hi2";
import useSWR from "swr";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORY_ICONS } from "@/constants";
import Link from "next/link";

interface SimilarProgram {
  id: string;
  programName: string;
  category: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  commissionRate: number | null;
  tagline: string | null;
}

interface SimilarProgramsProps {
  programId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ProgramCard({ program }: { program: SimilarProgram }) {
  const logoSrc =
    program.logoUrl ||
    `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;
  const categoryIconName = CATEGORY_ICONS[program.category as keyof typeof CATEGORY_ICONS] || "HiCube";

  return (
    <Link
      href={`/programs/${program.id}`}
      className="group p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-solid)]/30 transition-all"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="relative w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image
            src={logoSrc}
            alt={program.programName}
            fill
            className="object-cover"
            unoptimized
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.innerHTML = `<span class="text-lg font-bold text-[var(--accent-solid)]">${program.programName.charAt(0)}</span>`;
              }
            }}
          />
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

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
              <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarPrograms({ programId }: SimilarProgramsProps) {
  const { data: programs, isLoading } = useSWR<SimilarProgram[]>(
    `/api/programs/${programId}/similar`,
    fetcher
  );

  // Don't render if no similar programs
  if (!isLoading && (!programs || programs.length === 0)) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)]">
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <HiSparkles className="w-5 h-5 text-[var(--accent-solid)]" />
        You Might Also Like
      </h2>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs?.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
