"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { HiArrowLeft, HiArrowTopRightOnSquare, HiGlobeAlt, HiEnvelope, HiCheckCircle, HiSparkles } from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";
import { Program, CATEGORY_ICONS } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProgramDetailPage() {
    const params = useParams();
    const { data: program, error, isLoading } = useSWR<Program>(
        params?.id ? `/api/programs/${params.id}` : null,
        fetcher
    );

    const handleApplyClick = async () => {
        if (!program) return;
        fetch(`/api/programs/${program.id}/click`, { method: "POST" });
        window.open(program.affiliateUrl, "_blank");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-base font-medium mb-4 text-[var(--text-primary)]">Program not found</p>
                    <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        ← Back to programs
                    </Link>
                </div>
            </div>
        );
    }

    const logoSrc = program.logoBase64 || `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;
    const categoryIconName = CATEGORY_ICONS[program.category] || "HiCube";

    return (
        <div className="min-h-screen pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--accent)] opacity-[0.03] blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0">
                <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <ThemeToggle />
                </div>
            </div>

            <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-12 animate-fade-in-up">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
                    {/* Main Content */}
                    <div className="space-y-10">
                        {/* Hero */}
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg shadow-[var(--accent-dim)]">
                                <img
                                    src={logoSrc}
                                    alt={program.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-[var(--text-tertiary)]">${program.name.charAt(0)}</span>`;
                                    }}
                                />
                            </div>
                            <div className="flex-1 pt-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{program.name}</h1>
                                    <span className="px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                                        <CategoryIcon iconName={categoryIconName} className="w-3.5 h-3.5" />
                                        {program.category}
                                    </span>
                                </div>
                                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
                                    {program.tagline}
                                </p>
                            </div>
                        </div>

                        {/* Stats Grid (Bento Box) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Commission</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{program.commissionRate}</p>
                            </div>
                            {program.affiliatesCount && (
                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                                    <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Affiliates</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{program.affiliatesCount.toLocaleString()}</p>
                                </div>
                            )}
                            {program.payoutsLast30Days && (
                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                                    <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Paid (30d)</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">${program.payoutsLast30Days.toLocaleString()}</p>
                                </div>
                            )}
                            {program.country && (
                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                                    <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Country</p>
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{program.country}</p>
                                </div>
                            )}
                        </div>

                        {/* Unverified Disclaimer */}
                        {!program.payoutsLast30Days && !program.payoutsTotal && !program.brandAge && (
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <HiSparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Unverified Program</p>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                        This program hasn't been fully verified yet. Financial metrics are self-reported and may not be fully accurate.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* About */}
                        <div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">About Program</h2>
                            <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                                {program.description || program.tagline}
                            </p>
                        </div>

                        {/* Additional Stats */}
                        {(program.payoutsTotal || program.brandAge || program.usersTotal || program.avgOrderValue) && (
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Additional Information</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {program.payoutsTotal && (
                                        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                                            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Total Payouts</p>
                                            <p className="text-lg font-bold text-[var(--text-primary)]">${program.payoutsTotal.toLocaleString()}</p>
                                        </div>
                                    )}
                                    {program.brandAge && (
                                        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                                            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Brand Age</p>
                                            <p className="text-lg font-bold text-[var(--text-primary)]">{program.brandAge}</p>
                                        </div>
                                    )}
                                    {program.usersTotal && (
                                        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                                            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Total Users</p>
                                            <p className="text-lg font-bold text-[var(--text-primary)]">{program.usersTotal.toLocaleString()}</p>
                                        </div>
                                    )}
                                    {program.avgOrderValue && (
                                        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                                            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Avg Order Value</p>
                                            <p className="text-lg font-bold text-[var(--text-primary)]">{program.avgOrderValue}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Info Text Box */}
                        {program.additionalInfo && (
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Trust Booster</h2>
                                <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                                        {program.additionalInfo}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Contact */}
                        {(program.xHandle || program.email) && (
                            <div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact</h2>
                                <div className="space-y-3">
                                    {program.xHandle && (
                                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                                            <FaXTwitter className="w-4 h-4" />
                                            <a
                                                href={`https://x.com/${program.xHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                {program.xHandle}
                                            </a>
                                        </div>
                                    )}
                                    {program.email && (
                                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                                            <HiEnvelope className="w-4 h-4" />
                                            <a
                                                href={`mailto:${program.email}`}
                                                className="hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                {program.email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - CTA Section */}
                    <div className="space-y-6">
                        {/* CTA Card */}
                        <div className="p-1 rounded-2xl bg-gradient-to-b from-[var(--border)] to-transparent sticky top-24">
                            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-lg">
                                {/* Headline */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                        Start Earning Today
                                    </h3>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                        Join {program.affiliatesCount ? `${program.affiliatesCount.toLocaleString()}+ affiliates` : 'thousands of marketers'} earning commissions with {program.name}. Quick approval, reliable payouts.
                                    </p>
                                </div>

                                {/* Trust Signals */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-medium text-[var(--text-primary)]">Fast Approval</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">Usually within 24h</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-medium text-[var(--text-primary)]">Verified</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-tertiary)]">Active program</p>
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <button
                                    onClick={handleApplyClick}
                                    className="relative w-full group overflow-hidden rounded-xl bg-[var(--foreground)] text-[var(--background)] px-6 py-3.5 font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl mb-3"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Apply to Program
                                        <HiArrowTopRightOnSquare className="w-4 h-4" />
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[hsla(0,0%,100%,0.2)] to-transparent transition-transform duration-1000 ease-in-out" />
                                </button>
                                <p className="text-center text-xs text-[var(--text-tertiary)]">
                                    Free to join • No hidden fees
                                </p>

                                {/* Contact Info */}
                                {(program.websiteUrl || program.xHandle || program.email) && (
                                    <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                                        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                                            Direct Contact
                                        </p>
                                        {program.websiteUrl && (
                                            <a
                                                href={program.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--border)] transition-colors">
                                                    <HiGlobeAlt className="w-4 h-4" />
                                                </div>
                                                <span className="flex-1 truncate text-xs">{new URL(program.websiteUrl).hostname}</span>
                                                <HiArrowTopRightOnSquare className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        )}
                                        {program.xHandle && (
                                            <a
                                                href={`https://x.com/${program.xHandle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--border)] transition-colors">
                                                    <FaXTwitter className="w-4 h-4" />
                                                </div>
                                                <span className="flex-1 truncate text-xs">{program.xHandle}</span>
                                            </a>
                                        )}
                                        {program.email && (
                                            <a
                                                href={`mailto:${program.email}`}
                                                className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center group-hover:bg-[var(--border)] transition-colors">
                                                    <HiEnvelope className="w-4 h-4" />
                                                </div>
                                                <span className="flex-1 truncate text-xs">{program.email}</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
