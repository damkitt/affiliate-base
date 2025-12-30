"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface NavBarProps {
  showBackButton?: boolean;
  hideThemeToggle?: boolean;
}

export function NavBar({ showBackButton = false, hideThemeToggle = false }: NavBarProps) {
  return (
    <>
      {/* Theme Toggle - Fixed Position in viewport (same as Header) */}
      {!hideThemeToggle && (
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center">
          {/* Left side */}
          {showBackButton ? (
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Programs
            </Link>
          ) : (
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.location.href = '/';
              }}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Affiliate <span className="text-[var(--accent-solid)]">Base</span>
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
