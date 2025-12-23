"use client";

import Link from "next/link";
import { AddProgramForm } from "@/components/AddProgramModal/AddProgramForm";
import { Footer } from "@/components/Footer";
import { HiArrowLeft } from "react-icons/hi2";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-white relative overflow-x-hidden selection:bg-emerald-500/30">
            {/* Background Layer (Clipped) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">

                {/* Texture: Even more subtle Technical Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), 
                        linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Header: Fixed Top */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 hover:text-white transition-colors"
                    >
                        Affiliate <span className="text-emerald-500">Base</span>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-all hover:translate-x-[-4px]"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 relative z-10">
                <div className="w-full max-w-2xl">
                    <AddProgramForm
                        onClose={() => router.push("/")}
                        isModal={false}
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
