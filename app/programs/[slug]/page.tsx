"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
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
  HiChartBar,
  HiCurrencyDollar,
  HiPresentationChartLine,
  HiCheckCircle,
  HiPencilSquare,
} from "react-icons/hi2";
import { FaXTwitter } from "react-icons/fa6";
import type { Program } from "@/types";
import { InterestChart, SimilarPrograms, EditReportModal, IncomeSimulator } from "@/components/ProgramDetail";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CallToAction } from "@/components/CallToAction";
import AddProgramModal from "@/components/AddProgramModal";
import {
  generateFingerprint,
  wasViewedInSession,
  markViewedInSession,
} from "@/lib/fingerprint";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProgramDetailPage() {
  const params = useParams();
  const viewTracked = useRef(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const {
    data: program,
    error,
    isLoading,
  } = useSWR<Program>(
    params?.slug && !params.slug.toString().startsWith("fake-") ? `/api/programs/by-slug/${params.slug}` : null,
    fetcher
  );

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
    window.open(program.affiliateUrl, "_blank");
  };

  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent-solid)] rounded-full animate-spin" />
      </div>
    );
  }

  if ((error || !program) && !isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium mb-4 text-[var(--text-primary)]">Program not found</p>
          <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            ← Back to programs
          </Link>
        </div>
      </div>
    );
  }

  const logoSrc = program!.logoUrl || `https://www.google.com/s2/favicons?domain=${program!.websiteUrl}&sz=128`;

  const commissionLabel = program!.commissionDuration === "Recurring" ? "recurring" : program!.commissionDuration === "One-time" ? "one-time" : null;
  const programDetails = [
    { icon: HiBanknotes, label: "Commission", value: program!.commissionRate != null ? `${program!.commissionRate}%${commissionLabel ? ` ${commissionLabel}` : ""}` : null },
    { icon: HiClock, label: "Cookie Duration", value: program!.cookieDuration != null ? `${program!.cookieDuration} days` : null },
    { icon: HiMapPin, label: "Region", value: program!.country ?? null },
    { icon: HiUserGroup, label: "Affiliates", value: program!.affiliatesCountRange ?? null },
    { icon: HiCurrencyDollar, label: "Min Payout", value: program!.minPayoutValue != null ? `$${program!.minPayoutValue}` : null },
    { icon: HiBolt, label: "Approval Time", value: program!.approvalTimeRange ?? null },
    { icon: HiUserGroup, label: "Target Audience", value: program!.targetAudience ?? null },
    { icon: HiCalendar, label: "Founded", value: program!.foundingDate ? new Date(program!.foundingDate).getFullYear() : null },
    { icon: HiChartBar, label: "Avg Order", value: program!.avgOrderValue != null ? `$${program!.avgOrderValue}` : null },
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans selection:bg-emerald-500/30 flex flex-col">

      {/* Global NavBar */}
      <NavBar showBackButton />

      {/* Spacer for fixed navbar */}
      <div className="h-14" />

      <main className="max-w-6xl mx-auto px-6 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Card */}
            <div className="card-solid p-10 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border)]">
                    <Image
                      src={logoSrc}
                      alt={program!.programName}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${program!.programName.charAt(0)}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                        {program!.category}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{program!.programName}</h1>
                    <p className="text-sm text-[var(--text-secondary)]">{program!.tagline ?? ''}</p>
                  </div>
                </div>
                <a
                  href={program!.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent hover:border-[var(--border)] transition-all"
                >
                  <HiArrowUpRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Program Details Card */}
            <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HiTag className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Program Details</h2>
                </div>
                <div className="relative group">
                  <HiInformationCircle className="w-4 h-4 text-[var(--text-tertiary)] cursor-help" />
                  <div className="absolute right-0 top-6 w-64 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      This information was added by the community during listing and has not been verified by the Affiliate Base team.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {programDetails.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
                    </div>
                    <p className="text-base font-bold text-[var(--text-primary)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About Card */}
            <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-4">
                <HiInformationCircle className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">About This Program</h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {program!.description ?? program!.tagline ?? ''}
              </p>
              {program!.additionalInfo && (
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                    Additional Details
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap">
                    {program!.additionalInfo}
                  </p>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-5">
                <HiLightBulb className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">How It Works</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {howItWorks.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] cursor-pointer transition-colors hover:border-[var(--accent-solid)]/30 ${activeStep === idx ? 'ring-1 ring-emerald-500/50' : ''}`}
                    onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">Step {item.step}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.title}</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mb-3">{item.desc}</p>

                    {/* Expandable Details */}
                    <div className={`overflow-hidden transition-all duration-300 ${activeStep === idx ? "max-h-48 opacity-100 mt-3 pt-3 border-t border-[var(--border)]" : "max-h-0 opacity-0"}`}>
                      <ul className="space-y-1.5">
                        {item.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="text-emerald-500 mt-0.5">→</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button className="text-xs font-medium text-emerald-600 hover:text-emerald-500 transition-colors mt-1">
                      {activeStep === idx ? "Show less" : "Learn more"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Program Interest Chart */}
            <InterestChart
              programId={program!.id}
              totalClicks={clicksMap?.[program!.id] ?? program!.clicksCount ?? 0}
            />

          </div>

          {/* Sidebar - Sticky */}
          <div className="lg:sticky lg:top-20 space-y-4 self-start">

            {/* Commission CTA Card */}
            <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              {/* Commission Box */}
              <div className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-600/5 mb-5">
                <p className="text-3xl font-bold text-emerald-500">{program!.commissionRate ?? 0}%</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {program!.commissionDuration === "Recurring" ? "Recurring commission" : "One-time commission"}
                </p>
              </div>

              <button
                onClick={handleApplyClick}
                className="w-full py-4 px-6 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-emerald-600 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-emerald-500/25"
              >
                Apply to Program
                <HiArrowUpRight className="w-5 h-5" />
              </button>

              {/* Income Calculator Button */}
              <button
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full mt-3 py-3 px-4 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-xl flex items-center justify-center gap-2 hover:border-[var(--accent-solid)] hover:bg-[var(--bg-card)] transition-all"
              >
                <HiPresentationChartLine className="w-4 h-4 text-emerald-500" />
                Income Calculator
              </button>

              <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">Free to join • No credit card required</p>

              {/* Divider */}
              <div className="border-t border-[var(--border)] my-5" />

              {/* Trust Badges */}
              <div className="space-y-3">
                <div className="relative group flex items-center gap-3 cursor-help">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <HiArrowUpRight className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">Direct Application</span>
                  <div className="absolute left-0 bottom-full mb-2 w-56 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Apply directly through the official affiliate program page. No intermediaries.
                    </p>
                  </div>
                </div>
                <div className="relative group flex items-center gap-3 cursor-help">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <HiGlobeAlt className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">Global Access</span>
                  <div className="absolute left-0 bottom-full mb-2 w-56 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      This affiliate program accepts applications from affiliates worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card-solid p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Links</h3>
              <div className="space-y-4">
                {program!.websiteUrl && (
                  <a
                    href={program!.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <HiGlobeAlt className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{new URL(program!.websiteUrl).hostname}</span>
                  </a>
                )}
                {program!.xHandle && (
                  <a
                    href={`https://twitter.com/${program!.xHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <FaXTwitter className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{program!.xHandle.replace('@', '')}</span>
                  </a>
                )}
                {program!.email && (
                  <a
                    href={`mailto:${program!.email}`}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <HiEnvelope className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{program!.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Edit/Report Button */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border)] transition-all"
            >
              <HiPencilSquare className="w-4 h-4" />
              Edit / Report Program
            </button>

          </div>

        </div>

        {/* Similar Programs */}
        <SimilarPrograms programId={program!.id} />
      </main>

      {/* Call to Action */}
      <CallToAction onAddProgram={() => setIsAddModalOpen(true)} />

      {/* Footer */}
      <Footer onAddProgram={() => setIsAddModalOpen(true)} />

      {/* Edit/Report Modal */}
      <EditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        programId={program!.id}
        programName={program!.programName}
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
        commissionRate={program!.commissionRate ?? 0}
        commissionDuration={program!.commissionDuration}
        avgOrderValue={program!.avgOrderValue}
        programName={program!.programName}
      />
    </div>
  );
}
