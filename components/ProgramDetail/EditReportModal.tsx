"use client";

import { useState } from "react";
import {
  HiXMark,
  HiPencilSquare,
  HiFlag,
  HiPaperAirplane,
  HiCheckCircle,
} from "react-icons/hi2";

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
}

type TabType = "edit" | "report";
type ReportReason = "broken_link" | "scam" | "misleading" | "other";

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "broken_link", label: "Broken Link" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "misleading", label: "Misleading Information" },
  { value: "other", label: "Other" },
];

export function EditReportModal({
  isOpen,
  onClose,
  programId,
  programName,
}: EditReportModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("edit");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isFounder, setIsFounder] = useState(false);
  const [reason, setReason] = useState<ReportReason>("broken_link");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setMessage("");
    setEmail("");
    setIsFounder(false);
    setReason("broken_link");
    setError(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is a fake/demo program
    if (programId.startsWith("fake-")) {
      setError("This is a demo program. Reports can only be submitted for real programs.");
      return;
    }
    
    if (!message.trim()) {
      setError("Please provide a message");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/programs/${programId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab === "edit" ? "EDIT" : "REPORT",
          reason: activeTab === "report" ? reason : null,
          message: message.trim(),
          email: email.trim() || null,
          isFounder: activeTab === "edit" ? isFounder : false,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success State */}
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <HiCheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Thank You!
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your {activeTab === "edit" ? "suggestion" : "report"} has been submitted.
              We&apos;ll review it shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  Feedback
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  for {programName}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <HiXMark className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => handleTabChange("edit")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "edit"
                    ? "text-[var(--accent-solid)] border-b-2 border-[var(--accent-solid)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <HiPencilSquare className="w-4 h-4" />
                Suggest Update
              </button>
              <button
                onClick={() => handleTabChange("report")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "report"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <HiFlag className="w-4 h-4" />
                Report Issue
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Report Reason (only for Report tab) */}
              {activeTab === "report" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-solid)]"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {activeTab === "edit" ? "What needs to be updated?" : "Details"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    activeTab === "edit"
                      ? "e.g., The commission rate is actually 30%, not 20%..."
                      : "Please describe the issue in detail..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)] resize-none"
                />
              </div>

              {/* Founder Checkbox (only for Edit tab) */}
              {activeTab === "edit" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFounder}
                    onChange={(e) => setIsFounder(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent-solid)] focus:ring-[var(--accent-solid)] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    I am the Founder / Part of the Team
                  </span>
                </label>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Contact Email{" "}
                  <span className="font-normal text-[var(--text-tertiary)]">
                    (optional)
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                  Leave your email so we can contact you for further details if needed.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: activeTab === "edit" ? "var(--accent-gradient-dark)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <HiPaperAirplane className="w-4 h-4" />
                    Submit {activeTab === "edit" ? "Suggestion" : "Report"}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
