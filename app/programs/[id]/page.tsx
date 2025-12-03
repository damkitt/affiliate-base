"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { HiCheckCircle, HiInformationCircle } from "react-icons/hi2";
import { Program } from "@/types";
import { ProgramDetailHeader } from "@/components/ProgramDetailHeader";
import {
  ProgramHero,
  ProgramStats,
  ProgramCTA,
  ProgramContacts,
  ProgramFeatures,
  ProgramHowItWorks,
  ProgramFAQ,
} from "@/components/ProgramDetail";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProgramDetailPage() {
  const params = useParams();
  const {
    data: program,
    error,
    isLoading,
  } = useSWR<Program>(
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
        <div className="w-6 h-6 border-2 border-[var(--accent-solid)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-base font-medium mb-4 text-[var(--text-primary)]">
            Program not found
          </p>
          <a
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors"
          >
            ← Back to programs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <ProgramDetailHeader />

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <ProgramHero program={program} onApplyClick={handleApplyClick} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <ProgramStats program={program} />

            {/* Key Features */}
            <ProgramFeatures />

            {/* About Program */}
            <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-card)' }}>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <HiInformationCircle className="w-5 h-5 text-[var(--accent-solid)]" />
                About This Program
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {program.description || program.tagline}
              </p>
            </div>

            {/* How It Works */}
            <ProgramHowItWorks />

            {/* FAQ */}
            <ProgramFAQ />

            {/* Additional Info */}
            {program.additionalInfo && (
              <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-[var(--accent-solid)]" />
                  Additional Details
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {program.additionalInfo}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <ProgramCTA program={program} onApplyClick={handleApplyClick} />
            <ProgramContacts program={program} />
          </div>
        </div>
      </main>
    </div>
  );
}
