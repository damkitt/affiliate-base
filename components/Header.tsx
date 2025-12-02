import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
    onAddProgram: () => void;
    search: string;
    setSearch: (value: string) => void;
}

export function Header({ onAddProgram, search, setSearch }: HeaderProps) {
    return (
        <header className="relative pt-32 pb-12 px-6 animate-fade-in-up">
            {/* Theme Toggle - Fixed Position */}
            <div className="absolute top-6 right-6 z-10">
                <ThemeToggle />
            </div>

            <div className="relative max-w-[600px] mx-auto text-center">
                {/* Logo - Simple text */}
                <div className="mb-8">
                    <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
                        Trust Affiliate
                    </span>
                </div>

                <h1 className="text-[48px] md:text-[64px] font-bold tracking-tight mb-6 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)]">
                    Affiliate programs
                    <br />
                    that actually pay
                </h1>

                <p className="text-[var(--text-secondary)] mb-10 text-lg max-w-md mx-auto leading-relaxed font-light">
                    Curated database of verified affiliate programs with transparent commissions.
                </p>

                {/* Search + Add */}
                <div className="flex items-center gap-2 max-w-md mx-auto p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm focus-within:ring-2 ring-[var(--accent-dim)] transition-all duration-300">
                    <div className="flex-1 flex items-center h-10 px-3">
                        <HiMagnifyingGlass className="w-4 h-4 text-[var(--text-tertiary)] mr-3" />
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
                                className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onAddProgram}
                        className="h-9 px-4 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-sm font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
