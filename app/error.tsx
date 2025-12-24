"use client";

import { useEffect } from "react";
import { HiArrowPath, HiExclamationTriangle } from "react-icons/hi2";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service if needed
        console.error("Global Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030303] px-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <HiExclamationTriangle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Something went wrong
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                        We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault.
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => reset()}
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        <HiArrowPath className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        Try again
                    </button>
                </div>

                <p className="text-xs text-zinc-400 dark:text-zinc-600 font-mono">
                    Error ID: {error.digest || "unknown_failure"}
                </p>
            </div>
        </div>
    );
}
