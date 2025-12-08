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
import { InterestChart, SimilarPrograms, EditReportModal } from "@/components/ProgramDetail";
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

  const {
    data: program,
    error,
    isLoading,
  } = useSWR<Program>(
    params?.id && !params.id.toString().startsWith("fake-") ? `/api/programs/${params.id}` : null,
    fetcher
  );

  const [fakeProgram, setFakeProgram] = useState<Program | null>(null);
  useEffect(() => {
    if (params?.id && params.id.toString().startsWith("fake-")) {
      import("@/lib/fakePrograms").then(mod => {
        setFakeProgram(mod.getFakeProgram(params.id as string));
      });
    }
  }, [params?.id]);

  const p = program || fakeProgram;
  const isFake = params?.id?.toString().startsWith("fake-");

  const { data: clicksMap } = useSWRImmutable<Record<string, number>>(
    "/api/metrics/clicks",
    fetcher
  );

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  useEffect(() => {
    if (p && fingerprint && !viewTracked.current && !isFake) {
      if (wasViewedInSession(p.id)) {
        viewTracked.current = true;
        return;
      }
      viewTracked.current = true;
      markViewedInSession(p.id);
      fetch(`/api/programs/${p.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });
    }
  }, [p, fingerprint, isFake]);

  const handleApplyClick = async () => {
    if (!p) return;
    if (!isFake) {
      fetch(`/api/programs/${p.id}/click`, { method: "POST" });
    }
    window.open(p.affiliateUrl, "_blank");
  };

  if (isLoading && !fakeProgram && !error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[var(--border)] border-t-[var(--accent-solid)] rounded-full animate-spin" />
      </div>
    );
  }

  if ((error || !p) && !isLoading) {
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

  const logoSrc = p!.logoUrl || `https://www.google.com/s2/favicons?domain=${p!.websiteUrl}&sz=128`;

  const programDetails = [
    { icon: HiBanknotes, label: "Commission", value: p!.commissionRate != null ? `${p!.commissionRate}%` : null },
    { icon: HiClock, label: "Cookie Duration", value: p!.cookieDuration != null ? `${p!.cookieDuration} days` : null },
    { icon: HiMapPin, label: "Region", value: p!.country ?? null },
    { icon: HiUserGroup, label: "Affiliates", value: p!.affiliatesCountRange ?? null },
    { icon: HiCurrencyDollar, label: "Min Payout", value: p!.minPayoutValue != null ? `$${p!.minPayoutValue}` : null },
    { icon: HiBolt, label: "Approval Time", value: p!.approvalTimeRange ?? null },
    { icon: HiUserGroup, label: "Target Audience", value: p!.targetAudience ?? null },
    { icon: HiCalendar, label: "Founded", value: p!.foundingDate ? new Date(p!.foundingDate).getFullYear() : null },
    { icon: HiChartBar, label: "Avg Order", value: p!.avgOrderValue != null ? `$${p!.avgOrderValue}` : null },
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
                      alt={p!.programName}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-white">${p!.programName.charAt(0)}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                        {p!.category}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{p!.programName}</h1>
                    <p className="text-sm text-[var(--text-secondary)]">{p!.tagline ?? ''}</p>
                  </div>
                </div>
                <a
                  href={p!.websiteUrl}
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
                <HiInformationCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
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
                {p!.description ?? p!.tagline ?? ''}
              </p>
              {p!.additionalInfo && (
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                    Additional Details
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap">
                    {p!.additionalInfo}
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
              programId={p!.id}
              totalClicks={clicksMap?.[p!.id] ?? p!.clicksCount ?? 0}
            />

          </div>

          {/* Sidebar - Sticky */}
          <div className="lg:sticky lg:top-20 space-y-4 self-start">

            {/* Commission CTA Card */}
            <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              {/* Commission Box */}
              <div className="p-4 rounded-xl border border-emerald-600/30 bg-emerald-600/5 mb-5">
                <p className="text-3xl font-bold text-emerald-500">{p!.commissionRate ?? 0}%</p>
                <p className="text-sm text-[var(--text-secondary)]">Commission on every sale</p>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyClick}
                className="w-full py-4 px-6 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-emerald-600 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-emerald-500/25"
              >
                Apply to Program
                <HiArrowUpRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">Free to join • No credit card required</p>

              {/* Divider */}
              <div className="border-t border-[var(--border)] my-5" />

              {/* Trust Badges */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">Verified Program</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">Secure & On-time Payments</span>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card-solid p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Links</h3>
              <div className="space-y-4">
                {p!.websiteUrl && (
                  <a
                    href={p!.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <HiGlobeAlt className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{new URL(p!.websiteUrl).hostname}</span>
                  </a>
                )}
                {p!.xHandle && (
                  <a
                    href={`https://twitter.com/${p!.xHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <FaXTwitter className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{p!.xHandle.replace('@', '')}</span>
                  </a>
                )}
                {p!.email && (
                  <a
                    href={`mailto:${p!.email}`}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                  >
                    <HiEnvelope className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-500 transition-colors" />
                    <span className="truncate">{p!.email}</span>
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
        <SimilarPrograms programId={p!.id} />
      </main>

      {/* Call to Action */}
      <CallToAction onAddProgram={() => setIsAddModalOpen(true)} />

      {/* Footer */}
      <Footer onAddProgram={() => setIsAddModalOpen(true)} />

      {/* Edit/Report Modal */}
      <EditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        programId={p!.id}
        programName={p!.programName}
      />

      {/* Add Program Modal */}
      <AddProgramModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
