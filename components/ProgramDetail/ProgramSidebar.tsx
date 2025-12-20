
import {
    HiArrowUpRight,
    HiPresentationChartLine,
    HiGlobeAlt,
    HiEnvelope,
    HiPencilSquare,
    HiShare,
    HiCheck
} from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";
import { Program } from "@/types";
import { useState } from "react";

interface ProgramSidebarProps {
    program: Program;
    onApply: () => void;
    onOpenCalculator: () => void;
    onOpenEditModal: () => void;
}

export function ProgramSidebar({ program, onApply, onOpenCalculator, onOpenEditModal }: ProgramSidebarProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    return (
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">

            {/* Commission CTA Card */}
            <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-200 shadow-2xl">
                {/* Commission Box */}
                <div className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-4xl font-bold text-emerald-400 mb-1 relative z-10">{program.commissionRate ?? 0}%</p>
                    <p className="text-sm font-medium text-[var(--text-secondary)] relative z-10">
                        {program.commissionDuration === "Recurring" ? "Recurring commission" : "One-time commission"}
                    </p>
                </div>

                <a
                    href={program.affiliateUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    onClick={onApply}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/20 mb-3"
                >
                    Apply to Program
                    <HiArrowUpRight className="w-5 h-5" />
                </a>

                {/* Income Calculator Button */}
                <button
                    onClick={onOpenCalculator}
                    className="w-full py-4 px-6 glass rounded-2xl text-[var(--text-primary)] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-all group mb-3"
                >
                    <HiPresentationChartLine className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    Income Calculator
                </button>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all group border ${copied
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                            : "bg-black/40 border-white/10 hover:border-white/20 text-white"
                        }`}
                >
                    {copied ? (
                        <>
                            <HiCheck className="w-5 h-5" />
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <HiShare className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-white transition-colors" />
                            <span>Share</span>
                        </>
                    )}
                </button>

                <p className="text-xs text-[var(--text-tertiary)] text-center mt-4 font-medium">Free to join • No credit card required</p>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-6" />

                {/* Trust Badges */}
                <div className="space-y-4">
                    <div className="relative group flex items-center gap-4 cursor-help p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                            <HiArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Direct Application</span>

                        {/* Premium Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-2xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                                    <HiArrowUpRight className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white">Direct Link</p>
                                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                        You will be redirected to the official partner program application page.
                                    </p>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0A0A] border-b border-r border-white/10 rotate-45"></div>
                        </div>
                    </div>

                    <div className="relative group flex items-center gap-4 cursor-help p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                            <HiGlobeAlt className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">Global Access</span>

                        {/* Premium Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 rounded-xl bg-[#0A0A0A] border border-white/10 shadow-2xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                                    <HiGlobeAlt className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white">Worldwide Accepted</p>
                                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                        This program accepts affiliates from most countries.
                                    </p>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0A0A] border-b border-r border-white/10 rotate-45"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Card */}
            <div className="card-premium p-6 rounded-[2rem] animate-fade-in-up delay-300">
                <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-5 pl-2">Links</h3>
                <div className="space-y-2">
                    {program.websiteUrl && (
                        <a
                            href={program.websiteUrl}
                            target="_blank"
                            rel="nofollow sponsored noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] group-hover:bg-[var(--accent-dim)] transition-all">
                                <HiGlobeAlt className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors font-medium">{new URL(program.websiteUrl).hostname}</span>
                        </a>
                    )}
                    {program.xHandle && (
                        <a
                            href={`https://twitter.com/${program.xHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-white group-hover:bg-white/10 transition-all">
                                <FaXTwitter className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors font-medium">{program.xHandle.replace('@', '')}</span>
                        </a>
                    )}
                    {program.email && (
                        <a
                            href={`mailto:${program.email}`}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] group-hover:bg-[var(--accent-dim)] transition-all">
                                <HiEnvelope className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate transition-colors font-medium">{program.email}</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Edit/Report Button */}
            <button
                onClick={onOpenEditModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] transition-all animate-fade-in-up delay-300"
            >
                <HiPencilSquare className="w-4 h-4" />
                Edit / Report Program
            </button>

        </div>
    );
}
