"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import useSWRImmutable from "swr/immutable";
import dynamic from "next/dynamic";
import {
    HiArrowUpRight,
    HiGlobeAlt,
    HiEnvelope,
    HiCalendar,
    HiUserGroup,
    HiBanknotes,
    HiBolt,
    HiMapPin,
    HiTag,
    HiClock,
    HiInformationCircle,
    HiLightBulb,
    HiLink,
    HiPresentationChartLine,
    HiCheckCircle,
    HiPencilSquare,
    HiChartBar,
    HiCurrencyDollar,
} from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";
import type { Program } from "@/types";
import { SimilarPrograms, EditReportModal, IncomeSimulator } from "@/components/ProgramDetail";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CallToAction } from "@/components/CallToAction";
import AddProgramModal from "@/components/AddProgramModal";
import { WhoopHero } from "@/components/WhoopHero";
import {
    generateFingerprint,
    wasViewedInSession,
    markViewedInSession,
} from "@/lib/fingerprint";

// Dynamically import InterestChart to reduce initial bundle size
const InterestChart = dynamic(
    () => import("./InterestChart").then((mod) => mod.InterestChart),
    {
        loading: () => (
            <div className="h-[300px] w-full card-premium rounded-3xl animate-pulse" />
        ),
        ssr: false,
    }
);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProgramDetailContentProps {
    program: Program;
}

export function ProgramDetailContent({ program }: ProgramDetailContentProps) {
    const viewTracked = useRef(false);
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);


    const { data: clicksMap } = useSWRImmutable<Record<string, number>>(
        "/api/metrics/clicks",
        fetcher
    );

    useEffect(() => {
        generateFingerprint().then(setFingerprint);
    }, []);

    useEffect(() => {
        if (program && fingerprint && !viewTracked.current) {
            if (wasViewedInSession(program.id)) {
                viewTracked.current = true;
                return;
            }
            viewTracked.current = true;
            markViewedInSession(program.id);
            fetch(`/api/programs/${program.id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fingerprint }),
            });
        }
    }, [program, fingerprint]);

    const handleApplyClick = async () => {
        if (!program) return;
        fetch(`/api/programs/${program.id}/click`, { method: "POST" });
    };

    const logoSrc = program.logoUrl || `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;

    const commissionLabel = program.commissionDuration === "Recurring" ? "recurring" : program.commissionDuration === "One-time" ? "one-time" : null;
    const programDetails = [
        { icon: HiBanknotes, label: "Commission", value: program.commissionRate != null ? `${program.commissionRate}%${commissionLabel ? ` ${commissionLabel}` : ""}` : null },
        { icon: HiClock, label: "Cookie Duration", value: program.cookieDuration != null ? `${program.cookieDuration} days` : null },
        { icon: HiMapPin, label: "Region", value: program.country ?? null },
        { icon: HiUserGroup, label: "Affiliates", value: program.affiliatesCountRange ?? null },
        { icon: HiCurrencyDollar, label: "Min Payout", value: program.minPayoutValue != null ? `$${program.minPayoutValue}` : null },
        { icon: HiBolt, label: "Approval Time", value: program.approvalTimeRange ?? null },
        { icon: HiUserGroup, label: "Target Audience", value: program.targetAudience ?? null },
        { icon: HiCalendar, label: "Founded", value: program.foundingDate ? new Date(program.foundingDate).getFullYear() : null },
        { icon: HiChartBar, label: "Avg Order", value: program.avgOrderValue != null ? `$${program.avgOrderValue}` : null },
    ].filter(item => item.value != null);

    const howItWorks = [
        {
            step: "01",
            icon: HiUserGroup,
            title: "Sign Up & Get Approved",
            desc: "Create your affiliate account and get instant access",
            color: "bg-emerald-600",
            details: ["Fill out simple application form", "Get approved within 24-48 hours", "Access affiliate dashboard"]
        },
        {
            step: "02",
            icon: HiLink,
            title: "Get Your Unique Link",
            desc: "Receive your personalized tracking link and materials",
            color: "bg-cyan-500",
            details: ["Custom tracking link generated", "Marketing materials provided", "Access to promotional banners"]
        },
        {
            step: "03",
            icon: HiPresentationChartLine,
            title: "Share & Track Performance",
            desc: "Promote the program and monitor your results",
            color: "bg-violet-500",
            details: ["Share link with your audience", "Real-time analytics dashboard", "Track clicks and conversions"]
        },
        {
            step: "04",
            icon: HiCurrencyDollar,
            title: "Earn Commissions",
            desc: "Get paid for every successful referral",
            color: "bg-amber-500",
            details: ["Automatic commission calculation", "Regular payout schedule", "Multiple payment methods"]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-[var(--text-primary)] font-sans selection:bg-emerald-500/30 relative">
            {/* New Whoop Style Background */}
            <WhoopHero />

            {/* Content wrapper with relative z-index to sit on top */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Global NavBar */}
                <NavBar showBackButton />

                {/* Spacer for fixed navbar */}
                <div className="h-14" />

                <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
                    {/* Header Card - Full Width */}
                    <div className="card-premium p-6 md:p-8 rounded-[2rem] animate-fade-in-up mb-8">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl glass flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-light)] shadow-lg shadow-black/5 dark:shadow-black/20">
                                    <Image
                                        src={logoSrc}
                                        alt={program.programName}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        priority
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-white/50">${program.programName.charAt(0)}</span>`;
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 text-[10px] md:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wide">
                                            {program.category}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 leading-tight tracking-tight">{program.programName}</h1>
                                    <p className="text-sm md:text-base text-[var(--text-secondary)] line-clamp-1 md:line-clamp-none font-medium">{program.tagline ?? ''}</p>
                                </div>
                            </div>

                            {/* External Link */}
                            <a
                                href={program.websiteUrl}
                                target="_blank"
                                rel="nofollow sponsored noopener noreferrer"
                                className="absolute top-6 right-6 md:static p-3 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] glass hover:bg-white/5 transition-all group"
                            >
                                <HiArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Main Column */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Program Details Card */}
                            <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-100">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10">
                                            <HiTag className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Program Details</h2>
                                    </div>
                                    <div className="relative group">
                                        <HiInformationCircle className="w-5 h-5 text-[var(--text-tertiary)] cursor-help hover:text-white transition-colors" />
                                        <div className="absolute right-0 top-8 w-64 p-4 rounded-2xl glass-card border border-[var(--border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                This information was added by the community during listing and has not been verified by the Affiliate Base team.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {programDetails.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 md:p-5 rounded-2xl glass border border-[var(--border)] hover:border-[var(--accent-solid)] transition-colors group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <item.icon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-400 transition-colors shrink-0" />
                                                <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider truncate">{item.label}</span>
                                            </div>
                                            <p className="text-base md:text-lg font-bold text-[var(--text-primary)] break-words leading-tight">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* About Card */}
                            <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-xl bg-emerald-500/10">
                                        <HiInformationCircle className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--text-primary)]">About This Program</h2>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                                        {program.description ?? program.tagline ?? ''}
                                    </p>
                                    {program.additionalInfo && (
                                        <div className="mt-8 pt-6 border-t border-[var(--border)]">
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                                <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                                                Additional Details
                                            </h3>
                                            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap">
                                                {program.additionalInfo}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* How It Works */}
                            <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-300">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-xl bg-emerald-500/10">
                                        <HiLightBulb className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--text-primary)]">How It Works</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {howItWorks.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-5 rounded-3xl glass border border-[var(--border)] cursor-pointer transition-all duration-300 hover:bg-[var(--bg-secondary)] ${activeStep === idx ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''}`}
                                            onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                                                    <item.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Step {item.step}</span>
                                            </div>
                                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                                            <p className="text-sm text-[var(--text-secondary)] mb-4">{item.desc}</p>

                                            {/* Expandable Details */}
                                            <div className={`overflow-hidden transition-all duration-300 ease-out ${activeStep === idx ? "max-h-48 opacity-100 mt-4 pt-4 border-t border-[var(--border)]" : "max-h-0 opacity-0"}`}>
                                                <ul className="space-y-2">
                                                    {item.details.map((detail, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs text-[var(--text-secondary)]">
                                                            <span className="text-emerald-500 font-bold">→</span>
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mt-2 flex items-center gap-1 group">
                                                {activeStep === idx ? "Show less" : "Learn more"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Program Interest Chart - Dynamically Loaded */}
                            <div className="animate-fade-in-up delay-300">
                                <InterestChart
                                    programId={program.id}
                                    totalClicks={clicksMap?.[program.id] ?? program.clicksCount ?? 0}
                                />
                            </div>

                        </div>

                        {/* Sidebar - Sticky */}
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
                                    onClick={handleApplyClick}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/20 mb-3"
                                >
                                    Apply to Program
                                    <HiArrowUpRight className="w-5 h-5" />
                                </a>

                                {/* Income Calculator Button */}
                                <button
                                    onClick={() => setIsCalculatorOpen(true)}
                                    className="w-full py-4 px-6 glass rounded-2xl text-[var(--text-primary)] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-all group"
                                >
                                    <HiPresentationChartLine className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    Income Calculator
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
                                onClick={() => setIsReportModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] transition-all animate-fade-in-up delay-300"
                            >
                                <HiPencilSquare className="w-4 h-4" />
                                Edit / Report Program
                            </button>

                        </div>

                    </div>

                    {/* Similar Programs */}
                    <div className="mt-12 animate-fade-in-up delay-500">
                        <SimilarPrograms programId={program.id} />
                    </div>
                </main>

                {/* Call to Action */}
                <CallToAction onAddProgram={() => setIsAddModalOpen(true)} />

                {/* Footer */}
                <Footer onAddProgram={() => setIsAddModalOpen(true)} />

                {/* Edit/Report Modal */}
                <EditReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    programId={program.id}
                    programName={program.programName}
                />

                {/* Add Program Modal */}
                <AddProgramModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                />

                {/* Income Simulator Modal */}
                <IncomeSimulator
                    isOpen={isCalculatorOpen}
                    onClose={() => setIsCalculatorOpen(false)}
                    commissionRate={program.commissionRate ?? 0}
                    commissionDuration={program.commissionDuration}
                    avgOrderValue={program.avgOrderValue}
                    programName={program.programName}
                />
            </div>
        </div>
    );
}
