import Image from "next/image";
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
    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg">
      <div className="flex items-start gap-6 mb-6">
        <div className="relative w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
          {program.logoUrl ? (
            <Image
              src={program.logoUrl}
              alt={program.programName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-bold text-[var(--text-tertiary)]">
              {program.programName[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {program.programName}
          </h2>
          <p className="text-base text-[var(--text-secondary)] mb-3">
            {program.tagline}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)]">
              {program.category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
              {program.commissionRate}%
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                program.approvalStatus
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}
            >
              {program.approvalStatus ? "Approved" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
        {program.description}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {program.websiteUrl && (
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
              Website
            </p>
            <a
              href={program.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate block"
            >
              {new URL(program.websiteUrl).hostname}
            </a>
          </div>
        )}
        {program.country && (
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
              Country
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              {program.country}
            </p>
          </div>
        )}
        {program.affiliatesCountRange && (
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
              Affiliates
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              {program.affiliatesCountRange}
            </p>
          </div>
        )}
        {program.payoutsTotalRange && (
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">
              Payouts
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              {program.payoutsTotalRange}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isPending && (
          <>
            <button
              onClick={() => onApprove(program.id)}
              className="flex-1 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Approve
            </button>
            <button
              onClick={() => onDecline(program.id)}
              className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Decline
            </button>
          </>
        )}
        <button
          onClick={() => onEdit(program)}
          className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium flex items-center gap-2 hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Edit
        </button>
        {!isPending && (
          <button
            onClick={() => onDecline(program.id)}
            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium flex items-center gap-2 hover:bg-red-500/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
