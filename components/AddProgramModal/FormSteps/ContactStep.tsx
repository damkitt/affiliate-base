import { ChangeEvent } from "react";
import Image from "next/image";
import { HiChatBubbleLeftRight, HiEnvelope } from "react-icons/hi2";
import type { FormData } from "../types";
import { ProgramCard } from "@/components/ProgramCard";

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
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <HiChatBubbleLeftRight className="w-4 h-4 text-[var(--accent-solid)]" />
          Contact Information
        </h3>
        <p className="text-[11px] text-[var(--text-secondary)] mb-4">
          Affiliates will be able to contact you for questions or further details.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
              X (Twitter) Handle
            </label>
            <input
              type="text"
              name="xHandle"
              value={formData.xHandle}
              onChange={onFormChange}
              placeholder="@username"
              className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all duration-300"
            />
          </div>
          <div>
            <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
              <HiEnvelope className="w-3.5 h-3.5" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onFormChange}
              placeholder="contact@company.com"
              className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-solid)] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Additional Information for Creators
        </label>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Share tips, requirements, or any helpful info for potential affiliates
        </p>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={onFormChange}
          placeholder="e.g. We provide custom landing pages, marketing materials, dedicated affiliate manager..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 resize-none"
        />
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide px-1">
          Preview
        </h4>
        <div className="border border-zinc-200/60 dark:border-white/[0.1] rounded-2xl bg-white dark:bg-[#0A0A0A] overflow-hidden shadow-sm">
          {/* Mock Table Header for context */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-widest backdrop-blur-sm opacity-50 pointer-events-none">
            <div className="col-span-1 text-center opacity-40">#</div>
            <div className="col-span-5">Program</div>
            <div className="col-span-3 opacity-60">Category</div>
            <div className="col-span-2 text-left opacity-60">Commission</div>
            <div className="col-span-1"></div>
          </div>

          <div className="pointer-events-none">
            <ProgramCard
              program={{
                id: "preview",
                programName: formData.programName || "Program Name",
                tagline: formData.tagline || "Your tagline goes here",
                description: formData.description || "",
                category: (formData.category as any) || "SaaS",
                websiteUrl: formData.websiteUrl || "#",
                affiliateUrl: formData.affiliateUrl || "#",
                country: formData.country || "US",
                logoUrl: logoPreview || null,
                commissionRate: parseInt(formData.commissionRate) || 0,
                commissionType: formData.commissionType as any,
                commissionDuration: formData.commissionDuration || "Recurring",
                cookieDuration: parseInt(formData.cookieDuration) || 30,
                approvalStatus: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                clicks: 0,
                clicksCount: 0,
                isFeatured: false,
                // Add other required fields with defaults
              } as any}
              variant="row"
              rank={12} // Mock rank as seen in screenshot
              hideAction={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
