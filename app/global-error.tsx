"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="bg-black text-white font-sans flex items-center justify-center min-h-screen p-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                        <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">Critical System Error</h1>

                    <p className="text-white/60">
                        Something went wrong at the application level. Our team has been notified.
                    </p>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => reset()}
                            className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                        >
                            Return Home
                        </Link>
                    </div>

                    {error.digest && (
                        <p className="text-[10px] text-white/20 font-mono">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>
            </body>
        </html>
    );
}
