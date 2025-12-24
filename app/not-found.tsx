import Link from "next/link";
import { HiArrowLeft, HiMagnifyingGlass } from "react-icons/hi2";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030303] px-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <HiMagnifyingGlass className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Page not found
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
                        The page you are looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        Back to Leaderboard
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-medium">
                    <span>Error 404</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span>Trust Affiliate</span>
                </div>
            </div>
        </div>
    );
}
