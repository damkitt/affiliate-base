import { ChangeEvent } from "react";
import { HiChatBubbleLeftRight, HiEnvelope, HiPhoto } from "react-icons/hi2";
import type { FormData } from "../types";

interface ContactStepProps {
  formData: FormData;
  logoPreview: string | null;
  onFormChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export function ContactStep({
  formData,
  logoPreview,
  onFormChange,
}: ContactStepProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Contact Info */}
      <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
          <HiChatBubbleLeftRight className="w-4 h-4 text-[var(--text-tertiary)]" />
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
              X (Twitter) Handle
            </label>
            <input
              type="text"
              name="xHandle"
              value={formData.xHandle}
              onChange={onFormChange}
              placeholder="@username"
              className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
            />
          </div>
          <div>
            <label className="flex text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
              <HiEnvelope className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onFormChange}
              placeholder="contact@company.com"
              className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
          Additional Information for Creators
        </label>
        <p className="text-xs text-[var(--text-tertiary)] mb-2">
          Share tips, requirements, or any helpful info for potential affiliates
        </p>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={onFormChange}
          placeholder="e.g. We provide custom landing pages, marketing materials, dedicated affiliate manager..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 resize-none"
        />
      </div>

      {/* Preview */}
      <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
        <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
          Preview
        </h4>
        <div className="flex items-center gap-3">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo"
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--border)] flex items-center justify-center">
              <HiPhoto className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
          )}
          <div>
            <h5 className="font-semibold text-[var(--text-primary)]">
              {formData.programName || "Program Name"}
            </h5>
            <p className="text-sm text-[var(--text-secondary)]">
              {formData.tagline || "Your tagline"}
            </p>
          </div>
          {formData.commissionRate && (
            <div className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-500 text-sm font-medium rounded-full">
              {formData.commissionRate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
