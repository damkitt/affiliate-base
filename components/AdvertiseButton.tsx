"use client";

import Link from "next/link";
import { HiMegaphone } from "react-icons/hi2";
import { motion } from "framer-motion";

export function AdvertiseButton() {
    return (
        <Link href="/advertise">
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="fixed bottom-8 right-8 z-50 flex items-center gap-4 p-2 pr-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent-solid)]/20 shadow-2xl shadow-[var(--accent-solid)]/20 backdrop-blur-xl group transition-all duration-300 hover:border-[var(--accent-solid)] hover:shadow-[var(--accent-solid)]/40"
            >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-solid)] to-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HiMegaphone className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-[var(--accent-solid)] uppercase tracking-widest mb-0.5">
                        Grow Your Brand
                    </span>
                    <span className="text-base font-bold text-[var(--text-primary)] leading-none">
                        Promote Program
                    </span>
                </div>
            </motion.button>
        </Link>
    );
}
