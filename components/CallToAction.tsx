"use client";

import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import Link from "next/link";

interface CallToActionProps {
  onAddProgram?: () => void;
}

export function CallToAction({ onAddProgram }: CallToActionProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--text-secondary)]">
            Affiliate <span className="text-[var(--accent-solid)]">Base</span>
          </span>
        </div>

        {/* Heading - Same style as Header */}
        <h2 className="text-[32px] md:text-[44px] font-serif tracking-tight mb-6 leading-[1.15] bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
          The Database of{" "}
          <span className="bg-gradient-to-b from-emerald-400 to-emerald-700 bg-clip-text text-transparent italic">
            Premium
          </span>
          <br />
          Affiliate Programs
        </h2>

        {/* Subtitle - Same style as Header */}
        <p className="text-[var(--text-secondary)] mb-10 text-lg max-w-md mx-auto leading-relaxed font-light">
          Curated directory of SaaS & Tech affiliate programs with transparent commissions.
        </p>

        {/* Search + Add - Same design as Header */}
        <div className="flex items-center gap-2 max-w-md mx-auto p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm focus-within:ring-2 ring-[var(--accent-dim)] transition-all duration-300">
          <Link 
            href="/"
            className="flex-1 flex items-center h-10 px-3 cursor-pointer"
          >
            <HiMagnifyingGlass className="w-4 h-4 text-[var(--text-secondary)] mr-3" />
            <span className="text-sm text-[var(--text-tertiary)]">
              Search programs...
            </span>
          </Link>
          <button
            onClick={onAddProgram}
            className="h-9 px-4 rounded-lg bg-[var(--accent-solid)] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-150 shadow-md"
          >
            <HiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </section>
  );
}
