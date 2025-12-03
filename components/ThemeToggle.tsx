"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HiSun, HiMoon, HiComputerDesktop } from "react-icons/hi2"

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-full" />
                <div className="w-8 h-8 rounded-full" />
                <div className="w-8 h-8 rounded-full" />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] transition-colors duration-300">
            <button
                onClick={() => setTheme("light")}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === "light" 
                        ? "bg-[var(--accent-solid)] shadow-md text-white" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
                title="Light mode"
            >
                <HiSun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === "dark" 
                        ? "bg-[var(--accent-solid)] shadow-md text-white" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
                title="Dark mode"
            >
                <HiMoon className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    theme === "system" 
                        ? "bg-[var(--accent-solid)] shadow-md text-white" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
                title="System theme"
            >
                <HiComputerDesktop className="w-4 h-4" />
            </button>
        </div>
    )
}
