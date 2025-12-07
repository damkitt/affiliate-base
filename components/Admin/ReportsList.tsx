"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import {
  HiPencilSquare,
  HiFlag,
  HiTrash,
  HiCheckCircle,
  HiXMark,
  HiEnvelope,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

interface ProgramReport {
  id: string;
  programId: string;
  type: "EDIT" | "REPORT";
  reason: string | null;
  message: string;
  email: string | null;
  isFounder: boolean;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  resolvedAt: string | null;
  program: {
    id: string;
    programName: string;
    logoUrl: string | null;
    websiteUrl: string | null;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const REASON_LABELS: Record<string, string> = {
  broken_link: "Broken Link",
  scam: "Scam / Fraud",
  misleading: "Misleading Info",
  other: "Other",
};

export function ReportsList() {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("pending");
  
  const { data: reports = [], mutate } = useSWR<ProgramReport[]>(
    `/api/admin/reports?status=${filter}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleResolve = async (id: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "RESOLVED" }),
    });
    mutate();
  };

  const handleDismiss = async (id: string) => {
    if (!confirm("Are you sure you want to dismiss this report?")) return;
    await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
    mutate();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(["pending", "all", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-[var(--accent-dim)] text-[var(--accent-solid)] border border-[var(--accent-solid)]/30"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {/* Type Badge */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    report.type === "EDIT"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {report.type === "EDIT" ? (
                    <HiPencilSquare className="w-3.5 h-3.5" />
                  ) : (
                    <HiFlag className="w-3.5 h-3.5" />
                  )}
                  {report.type === "EDIT" ? "Edit Suggestion" : "Report"}
                </div>

                {/* Reason (for reports) */}
                {report.type === "REPORT" && report.reason && (
                  <span className="text-xs text-[var(--text-tertiary)] px-2 py-0.5 bg-[var(--bg-secondary)] rounded">
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                )}

                {/* Founder Badge */}
                {report.isFounder && (
                  <span className="text-xs text-amber-500 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    From Founder
                  </span>
                )}
              </div>

              {/* Date */}
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatDate(report.createdAt)}
              </span>
            </div>

            {/* Program Info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[var(--bg-secondary)]">
              <div className="relative w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                {report.program.logoUrl ? (
                  <Image
                    src={report.program.logoUrl}
                    alt={report.program.programName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-sm font-bold text-[var(--accent-solid)]">
                    {report.program.programName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/programs/${report.program.id}`}
                  className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-solid)] transition-colors flex items-center gap-1"
                >
                  {report.program.programName}
                  <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {report.message}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              {/* Email */}
              {report.email ? (
                <a
                  href={`mailto:${report.email}`}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-solid)] transition-colors"
                >
                  <HiEnvelope className="w-3.5 h-3.5" />
                  {report.email}
                </a>
              ) : (
                <span className="text-xs text-[var(--text-tertiary)]">
                  No email provided
                </span>
              )}

              {/* Actions */}
              {report.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                  >
                    <HiCheckCircle className="w-4 h-4" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <HiTrash className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              )}

              {report.status === "RESOLVED" && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                  <HiCheckCircle className="w-4 h-4" />
                  Resolved {report.resolvedAt && `on ${formatDate(report.resolvedAt)}`}
                </div>
              )}

              {report.status === "DISMISSED" && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                  <HiXMark className="w-4 h-4" />
                  Dismissed
                </div>
              )}
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--text-secondary)]">
              No {filter === "all" ? "" : filter} reports found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
