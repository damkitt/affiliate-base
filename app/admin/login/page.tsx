"use client";

/**
 * Admin Login Page
 * 
 * Secure login form for admin panel access.
 */

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiLockClosed, HiShieldCheck, HiExclamationTriangle } from "react-icons/hi2";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(redirectTo);
        router.refresh();
      } else if (response.status === 429) {
        setLockedUntil(data.retryAfter);
        setError(`Too many attempts. Try again in ${Math.ceil(data.retryAfter / 60)} minutes.`);
      } else if (response.status === 401) {
        setAttemptsRemaining(data.attemptsRemaining);
        setError(data.attemptsRemaining > 0 
          ? `Invalid password. ${data.attemptsRemaining} attempts remaining.`
          : "Account locked. Try again later."
        );
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent-solid)]/20 mb-4">
            <HiShieldCheck className="w-8 h-8 text-[var(--accent-solid)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Admin Access
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Enter your password to continue
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit}
          className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg"
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <HiExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Password Input */}
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || lockedUntil !== null}
                className="w-full px-4 py-3 pl-11 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-solid)]/50 focus:border-[var(--accent-solid)] transition-all disabled:opacity-50"
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
              />
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password || lockedUntil !== null}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-lg"
            style={{ background: 'var(--accent-gradient-dark)' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              "Access Admin Panel"
            )}
          </button>

          {/* Security Notice */}
          <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
            This area is protected. Unauthorized access attempts are logged.
          </p>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6">
          <a 
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors font-medium"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
