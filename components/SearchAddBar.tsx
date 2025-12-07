"use client";

import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";

interface SearchAddBarProps {
  search?: string;
  setSearch?: (value: string) => void;
  onAddProgram?: () => void;
  placeholder?: string;
  showSearch?: boolean;
}

export function SearchAddBar({
  search = "",
  setSearch,
  onAddProgram,
  placeholder = "Search programs...",
  showSearch = true,
}: SearchAddBarProps) {
  return (
    <div className="flex items-center gap-2 max-w-lg mx-auto p-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm focus-within:ring-2 ring-[var(--accent-dim)] transition-all duration-300">
      {showSearch && setSearch && (
        <div className="flex-1 flex items-center h-10 px-3">
          <HiMagnifyingGlass className="w-4 h-4 text-[var(--text-secondary)] mr-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
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
      )}
      {onAddProgram && (
        <button
          onClick={onAddProgram}
          className="h-10 px-5 rounded-lg bg-[var(--accent-solid)] text-white text-sm font-semibold flex items-center gap-2 hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-150 shadow-md whitespace-nowrap"
        >
          <HiPlus className="w-4 h-4" />
          <span>Add Program</span>
        </button>
      )}
    </div>
  );
}
