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
    <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Links
      </h3>
      <div className="space-y-1.5">
        {program.websiteUrl && (
          <a
            href={program.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors group"
          >
            <HiGlobeAlt className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">
              {new URL(program.websiteUrl).hostname}
            </span>
            <HiArrowTopRightOnSquare className="w-3 h-3 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
        {program.xHandle && (
          <a
            href={`https://x.com/${program.xHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors group"
          >
            <FaXTwitter className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">
              {program.xHandle}
            </span>
            <HiArrowTopRightOnSquare className="w-3 h-3 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}
        {program.email && (
          <a
            href={`mailto:${program.email}`}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors group"
          >
            <HiEnvelope className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
            <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">
              {program.email}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
