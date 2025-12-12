"use client";

import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";

const ROTATING_WORDS = ["Premium", "High-Paying", "SaaS", "Transparent"];

interface HeaderProps {
  onAddProgram?: () => void;
  search?: string;
  setSearch?: (value: string) => void;
}

export function Header({ onAddProgram, search, setSearch }: HeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative pt-32 pb-12 px-6 animate-fade-in-up">
      {/* Theme Toggle - Fixed Position in viewport */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative max-w-[700px] mx-auto text-center">
        {/* Logo - Simple text with link to home */}
        <div className="mb-8">
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
        </div>

        <h1 className="text-[40px] md:text-[56px] font-serif tracking-tight mb-6 leading-[1.15] bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
          The Database of{" "}
          <span className="relative inline-flex justify-start h-[1.15em] overflow-hidden align-bottom min-w-[180px] sm:min-w-[240px] md:min-w-[300px]">
            <span
              key={currentIndex}
              className="absolute left-0 bg-gradient-to-b from-emerald-400 to-emerald-700 bg-clip-text text-transparent font-serif italic animate-fade-in-up"
            >
              {ROTATING_WORDS[currentIndex]}
            </span>
          </span>
          <br />
          Affiliate Programs
        </h1>

        <p className="text-[var(--text-secondary)] mb-10 text-lg max-w-md mx-auto leading-relaxed font-light">
          Curated directory of SaaS & Tech affiliate programs with transparent
          commissions.
        </p>

        {/* Search + Add */}
        {onAddProgram && setSearch && (
          <div className="flex items-center gap-3 max-w-xl mx-auto">
            {/* Search Input */}
            <div className="flex-1 flex items-center h-10 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] focus-within:border-[var(--accent-solid)] transition-all duration-300">
              <HiMagnifyingGlass className="w-5 h-5 text-[var(--text-tertiary)] mr-3 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search programs..."
                className="flex-1 bg-transparent text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none text-[var(--text-primary)]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors px-2 py-1 rounded hover:bg-[var(--bg-secondary)]"
                >
                  Clear
                </button>
              )}
            </div>
            {/* Add Button */}
            <button
              onClick={onAddProgram}
              className="h-10 px-5 rounded-xl bg-[var(--accent-solid)] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-150 shadow-md shrink-0"
            >
              <HiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        )}
      </div>
    </header >
  );
}
