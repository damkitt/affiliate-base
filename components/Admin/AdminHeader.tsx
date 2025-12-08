"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowRightOnRectangle } from "react-icons/hi2";

interface AdminHeaderProps {
  pendingCount: number;
}

export function AdminHeader({ pendingCount }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
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
          </Link>
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

        <div className="flex items-center gap-2">
          {/* Analytics Button */}
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
