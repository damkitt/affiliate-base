import Image from "next/image";
import Link from "next/link";
import type { Program } from "@/types";

interface ProgramCardProps {
  program: Program;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onEdit: (program: Program) => void;
}

export function ProgramCard({
  program,
  onApprove,
  onDecline,
  onEdit,
}: ProgramCardProps) {
  const isPending = !program.approvalStatus;

  return (
    <div className="flex items-center gap-6 group">
      {/* Logo */}
      <div className="relative w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden flex-shrink-0 group-hover:border-[var(--accent-glow)] transition-colors">
        {program.logoUrl ? (
          <Image
            src={program.logoUrl}
            alt={program.programName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[var(--text-tertiary)]">
            {program.programName[0]}
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-base font-bold text-[var(--text-primary)] truncate">
            {program.programName}
          </h2>
          <div className="flex gap-1.5 flex-shrink-0">
            {program.isFeatured && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                SPONSORED
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${program.approvalStatus
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                }`}
            >
              {program.approvalStatus ? "LIVE" : "PENDING"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          <span className="truncate max-w-[150px]">{program.category}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <span className="text-emerald-500 font-bold">{program.commissionRate}% Commission</span>
          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <span className="font-mono text-[10px]">Score: {Math.round(program.trendingScore || 0)}</span>
        </div>
      </div>

      {/* Simplified Actions */}
      <div className="flex items-center gap-2">
        {isPending ? (
          <>
            <button
              onClick={() => onApprove(program.id)}
              className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Approve
            </button>
            <button
              onClick={() => onDecline(program.id)}
              className="h-9 px-4 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              Decline
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(program)}
              className="h-9 px-4 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
            >
              Control
            </button>
            <button
              onClick={() => onDecline(program.id)}
              className="w-9 h-9 rounded-lg bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

