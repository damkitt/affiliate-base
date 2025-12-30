"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import useSWRImmutable from "swr/immutable";
import dynamic from "next/dynamic";
import {
  HiArrowUpRight,
  HiInformationCircle,
  HiCheckCircle,
  HiShare,
  HiCheck,
} from "react-icons/hi2";
import Link from "next/link";
import type { Program, Category } from "@/types";
import { getSlugFromCategory } from "@/constants";
import {
  EditReportModal,
  IncomeCalculator,
  ProgramStatsGrid,
  HowItWorks,
  ProgramSidebar,
} from "@/components/ProgramDetail";
import { NavBar } from "@/components/NavBar";
import { CallToAction } from "@/components/CallToAction";
import AddProgramModal from "@/components/AddProgramModal";
import { generateFingerprint } from "@/lib/fingerprint";

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
  relatedProgramsSlot?: React.ReactNode;
}

export function ProgramDetailContent({
  program,
  relatedProgramsSlot,
}: ProgramDetailContentProps) {
  const viewTracked = useRef(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: clicksMap } = useSWRImmutable<Record<string, number>>(
    "/api/metrics/clicks",
    fetcher
  );

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  useEffect(() => {
    if (program && fingerprint && !viewTracked.current) {
      viewTracked.current = true;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          type: "VIEW",
          fingerprint: fingerprint || undefined,
          path: window.location.pathname,
        }),
      });
    }
  }, [program, fingerprint]);

  const handleApplyClick = async () => {
    if (!program) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programId: program.id,
        type: "CLICK",
        fingerprint: fingerprint || undefined,
        path: window.location.pathname,
      }),
      keepalive: true,
    });
  };

  const logoSrc =
    program.logoUrl ||
    `https://www.google.com/s2/favicons?domain=${program.websiteUrl}&sz=128`;

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-emerald-500/30 relative">
      { }

      { }
      <div className="relative z-10 flex flex-col min-h-screen">
        { }
        <NavBar showBackButton hideThemeToggle />

        { }
        <div className="h-14" />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-1 w-full">
          { }
          <div className="card-premium p-2 md:p-8 rounded-[2rem] animate-fade-in-up mb-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border-none shadow-lg shadow-black/5 dark:shadow-black/20">
                  <Image
                    src={logoSrc}
                    alt={program.programName}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 80px, 96px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `<span class="text-3xl font-bold text-white/50">${program.programName.charAt(
                        0
                      )}</span>`;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/category/${getSlugFromCategory(program.category as Category)}`}
                      className="px-3 py-1 text-[10px] md:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wide hover:bg-emerald-500/20 transition-all duration-200"
                    >
                      {program.category}
                    </Link>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 leading-tight tracking-tight break-words">
                    {program.programName}
                  </h1>
                  <p className="text-sm md:text-base text-[var(--text-secondary)] font-medium break-words">
                    {program.tagline ?? ""}
                  </p>
                </div>
              </div>

              { }
              <div className="flex items-center gap-3 w-auto mt-2 md:mt-0">
                <button
                  onClick={handleShare}
                  className={`px-5 py-2 rounded-full transition-all group border flex items-center gap-2 font-semibold text-xs md:text-sm ${copied
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-white/5 border-white/10 hover:border-white/20 text-white"
                    }`}
                  title="Copy Link"
                >
                  {copied ? (
                    <>
                      <HiCheck className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <HiShare className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <a
                  href={program.websiteUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="p-2.5 shrink-0 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] glass hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                >
                  <HiArrowUpRight className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-45 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            { }
            <div className="lg:col-span-8 space-y-6">
              { }
              <ProgramStatsGrid program={program} />

              { }
              <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-emerald-500/10">
                    <HiInformationCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    About This Program
                  </h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-base text-[var(--text-secondary)] leading-relaxed break-words whitespace-pre-wrap">
                    {program.description ?? program.tagline ?? ""}
                  </p>
                  {program.additionalInfo && (
                    <div className="mt-8 pt-6 border-t border-[var(--border)]">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                        Additional Details
                      </h3>
                      <p className="text-sm text-[var(--text-tertiary)] leading-relaxed whitespace-pre-wrap break-words">
                        {program.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              { }
              <HowItWorks />

              { }
              <div className="animate-fade-in-up delay-300">
                <InterestChart
                  programId={program.id}
                  totalClicks={
                    clicksMap?.[program.id] ?? program.clicksCount ?? 0
                  }
                />
              </div>
            </div>

            { }
            <ProgramSidebar
              program={program}
              onApply={handleApplyClick}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenEditModal={() => setIsReportModalOpen(true)}
            />
          </div>

          { }
        </main>

        <div className="max-w-7xl mx-auto px-6 w-full">
          {relatedProgramsSlot}
        </div>

        { }
        <CallToAction onAddProgram={() => setIsAddModalOpen(true)} />

        { }

        { }
        <EditReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          programId={program.id}
          programName={program.programName}
        />

        { }
        <AddProgramModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />

        { }
        <IncomeCalculator
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          commissionRate={program.commissionRate ?? 0}
          commissionType={program.commissionType}
          commissionDuration={program.commissionDuration}
          avgOrderValue={program.avgOrderValue}
          programName={program.programName}
        />
      </div>
    </div>
  );
}
