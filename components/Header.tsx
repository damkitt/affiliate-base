import { HiPlus, HiMagnifyingGlass } from "react-icons/hi2";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROTATING_WORDS = ["Premium", "High-Paying", "SaaS", "Transparent"];

interface HeaderProps {
    onAddProgram: () => void;
    search: string;
    setSearch: (value: string) => void;
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
            {/* Theme Toggle - Fixed Position */}
            <div className="absolute top-6 right-6 z-10">
                <ThemeToggle />
            </div>

            <div className="relative max-w-[700px] mx-auto text-center">
                {/* Logo - Simple text */}
                <div className="mb-8">
                    <span className="text-xs font-medium tracking-[0.2em] uppercase text-[var(--text-tertiary)]">
                        Affiliate <span className="text-[var(--accent)]">Base</span>
                    </span>
                </div>

                <h1 className="text-[40px] md:text-[56px] font-serif tracking-tight mb-6 leading-[1.15] bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                    The Database of{" "}
                    <span className="relative inline-flex justify-start h-[1.15em] overflow-hidden align-bottom min-w-[180px] sm:min-w-[240px] md:min-w-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentIndex}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -50, opacity: 0 }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="absolute left-0 text-[var(--accent-solid)] font-serif italic"
                            >
                                {ROTATING_WORDS[currentIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </span>
                    <br />
                    Affiliate Programs
                </h1>

                <p className="text-[var(--text-secondary)] mb-10 text-lg max-w-md mx-auto leading-relaxed font-light">
                    Curated directory of SaaS & Tech affiliate programs with transparent commissions.
                </p>

                {/* Search + Add */}
                <div className="flex items-center gap-2 max-w-md mx-auto p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] focus-within:ring-2 ring-[var(--accent-solid)] transition-all duration-300" style={{ boxShadow: 'var(--shadow-sm)' }}>
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
                        className="h-9 px-4 rounded-lg text-[var(--accent-foreground)] text-sm font-medium flex items-center gap-2 active:scale-[0.98] transition-all duration-150"
                        style={{ background: 'var(--accent-gradient-dark)', boxShadow: 'var(--shadow-sm)' }}
                    >
                        <HiPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
