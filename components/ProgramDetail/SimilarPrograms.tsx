"use client";

import { HiSparkles } from "react-icons/hi2";
import useSWR from "swr";
import { Program } from "@/types";
import { ProgramCard } from "@/components/ProgramCard";

interface SimilarProgramsProps {
  programId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const { data: programs, isLoading } = useSWR<Program[]>(
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
            <ProgramCard key={program.id} program={program} variant="card" />
          ))}
        </div>
      )}
    </div>
  );
}
