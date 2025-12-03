import {
  HiGlobeAlt,
  HiEnvelope,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";
import { Program } from "@/types";

interface ProgramContactsProps {
  readonly program: Program;
}

export function ProgramContacts({ program }: ProgramContactsProps) {
  const hasContacts = program.websiteUrl || program.xHandle || program.email;

  if (!hasContacts) return null;

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-solid)]/30 transition-all" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Contact & Links
      </h3>
      <div className="space-y-2">
        {program.websiteUrl && (
          <a
            href={program.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors group"
          >
            <HiGlobeAlt className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs font-medium text-[var(--text-secondary)] flex-1 truncate">
              {new URL(program.websiteUrl).hostname}
            </span>
            <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
        {program.xHandle && (
          <a
            href={`https://x.com/${program.xHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors group"
          >
            <FaXTwitter className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs font-medium text-[var(--text-secondary)] flex-1 truncate">
              {program.xHandle}
            </span>
            <HiArrowTopRightOnSquare className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
        {program.email && (
          <a
            href={`mailto:${program.email}`}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors group"
          >
            <HiEnvelope className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs font-medium text-[var(--text-secondary)] flex-1 truncate">
              {program.email}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
