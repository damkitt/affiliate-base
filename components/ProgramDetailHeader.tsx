import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function ProgramDetailHeader() {
  return (
    <header className="relative pt-8 pb-6 px-6 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm animate-fade-in-up">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Programs
        </Link>
      </div>
    </header>
  );
}
