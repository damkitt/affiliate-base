import { Program } from "@/types";

interface AdminHeaderProps {
  pendingCount: number;
}

export function AdminHeader({ pendingCount }: AdminHeaderProps) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </a>
          <div className="h-6 w-px bg-[var(--border)]" />
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Admin Panel
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </h1>
        </div>
      </div>
    </div>
  );
}
