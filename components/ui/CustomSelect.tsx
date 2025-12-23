"use client";

import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi2";
import { cn } from "@/lib/utils";

export interface SelectOption {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string; // Optional label above the input
    searchable?: boolean;
    position?: "top" | "bottom";
    className?: string; // Wrapper class
}

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    label,
    searchable = false,
    position = "bottom",
    className
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch(""); // Reset search on close
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = searchable
        ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300",
                    isOpen && "border-[var(--accent-solid)] bg-[var(--bg)]"
                )}
            >
                <span className={cn(
                    "flex items-center gap-2 truncate",
                    selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                )}>
                    {selectedOption?.icon && <span className="text-lg">{selectedOption.icon}</span>}
                    {selectedOption?.label || placeholder}
                </span>
                <HiChevronDown
                    className={cn(
                        "w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute z-50 left-0 right-0 bg-white dark:bg-[#09090b] border border-[var(--border)] rounded-xl shadow-2xl max-h-56 overflow-hidden flex flex-col animate-fadeIn ring-1 ring-[var(--border)]/10",
                    position === "top" ? "bottom-full mb-2" : "top-full mt-2"
                )}>
                    {searchable && (
                        <div className="p-2 border-b border-[var(--border)]">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] rounded-lg focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                            />
                        </div>
                    )}

                    <div className="overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2.5 text-sm text-left flex items-center justify-between gap-3 rounded-lg transition-colors",
                                        "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
                                        value === option.value && "bg-[var(--accent-dim)] text-[var(--accent-solid)] font-bold"
                                    )}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        {option.icon && <span className="text-lg">{option.icon}</span>}
                                        {option.label}
                                    </span>
                                    {value === option.value && <HiCheck className="w-4 h-4 text-[var(--accent-solid)]" />}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-[var(--text-tertiary)] text-center">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
