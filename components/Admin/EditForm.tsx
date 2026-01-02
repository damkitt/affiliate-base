import { CATEGORIES, COUNTRIES } from "@/constants";
import type { Program } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { HiPencilSquare, HiQuestionMarkCircle, HiPhoto, HiCheck, HiXMark } from "react-icons/hi2";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";

interface EditFormProps {
  program: Partial<Program>;
  onChange: (field: keyof Program, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveStatus?: "idle" | "success" | "error";
}

export function EditForm({
  program,
  onChange,
  onSave,
  onCancel,
  isSaving,
  saveStatus,
}: EditFormProps) {
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropImageSrc(null);
    setIsUploading(true);

    try {
      const uploadData = new window.FormData();
      uploadData.append("file", croppedFile);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onChange("logoUrl", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-[var(--text-tertiary)]">
              Program Name *
            </label>
            <span className={`text-[10px] font-medium ${(program.programName?.length || 0) >= 30 ? "text-red-500" : "text-[var(--text-tertiary)]"}`}>
              {program.programName?.length || 0}/30
            </span>
          </div>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.programName || ""}
            onChange={(e) => onChange("programName", e.target.value)}
            maxLength={30}
            placeholder="30 characters max"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Category *
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1.5">
            Tagline *
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-help outline-none">
                    <HiQuestionMarkCircle className="w-4 h-4 text-[var(--text-tertiary)] hover:text-white transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="max-w-[260px] bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                      <HiPencilSquare className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Tagline</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                        Describe your product in <span className="text-white">5-7 words</span>. Keep it punchy and clear.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <span className={`text-[10px] font-medium ${(program.tagline?.length || 0) >= 50 ? "text-red-500" : "text-[var(--text-tertiary)]"
            }`}>
            {program.tagline?.length || 0}/50
          </span>
        </div>
        <input
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
          value={program.tagline || ""}
          onChange={(e) => onChange("tagline", e.target.value)}
          maxLength={50}
          placeholder="50 characters max"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1.5">
            About This Program *
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-help outline-none">
                    <HiQuestionMarkCircle className="w-4 h-4 text-[var(--text-tertiary)] hover:text-white transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8} className="max-w-[310px] bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
                      <HiPencilSquare className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Quick Tip</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          Don&apos;t just copy your homepage. Treat this as a briefing for your partners.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <span className="text-emerald-500/50 mt-1.5">•</span>
                          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            <span className="text-white font-bold">The Fit:</span> Who buys your product and why?
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-emerald-500/50 mt-1.5">•</span>
                          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            <span className="text-white font-bold">The Partner:</span> Who can join? Any restrictions?
                          </p>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="text-emerald-500/50 mt-1.5">•</span>
                          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            <span className="text-white font-bold">The Playbook:</span> What formats convert best?
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5">
                        <p className="text-[11px] text-emerald-400 font-bold leading-relaxed">
                          Give creators the blueprint to succeed.
                        </p>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <span className={`text-[10px] font-medium ${(program.description?.length || 0) >= 2000 ? "text-red-500" : "text-[var(--text-tertiary)]"
            }`}>
            {program.description?.length || 0}/2000
          </span>
        </div>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[100px]"
          value={program.description || ""}
          onChange={(e) => onChange("description", e.target.value.slice(0, 2000))}
          placeholder="Tell partners about your program, ideal customers, and what content works best..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Website URL *
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.websiteUrl || ""}
            onChange={(e) => onChange("websiteUrl", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Affiliate URL *
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.affiliateUrl || ""}
            onChange={(e) => onChange("affiliateUrl", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-semibold text-[var(--text-tertiary)]">
            Commission *
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-fit">
              <button
                type="button"
                onClick={() => onChange("commissionType", "PERCENTAGE")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${program.commissionType === "PERCENTAGE" || !program.commissionType
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-white"
                  }`}
              >
                PERCENTAGE
              </button>
              <button
                type="button"
                onClick={() => onChange("commissionType", "FIXED")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${program.commissionType === "FIXED"
                  ? "bg-white text-black shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-white"
                  }`}
              >
                FIXED
              </button>
            </div>

            {(program.commissionType === "PERCENTAGE" || !program.commissionType) && (
              <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] w-fit animate-fadeIn">
                <button
                  type="button"
                  onClick={() => onChange("commissionDuration", "One-time")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${program.commissionDuration === "One-time" || !program.commissionDuration
                    ? "bg-white text-black shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-white"
                    }`}
                >
                  ONE-TIME
                </button>
                <button
                  type="button"
                  onClick={() => onChange("commissionDuration", "Recurring")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${program.commissionDuration === "Recurring"
                    ? "bg-white text-black shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-white"
                    }`}
                >
                  RECURRING
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            {program.commissionType === "FIXED" && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-sm font-bold">
                $
              </span>
            )}
            <input
              type="number"
              className={`w-full py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] ${program.commissionType === "FIXED" ? "pl-8 pr-4" : "px-4"
                }`}
              value={program.commissionRate ?? ""}
              onChange={(e) =>
                onChange("commissionRate", Number.parseInt(e.target.value))
              }
              placeholder={program.commissionType === "FIXED" ? "e.g. 100" : "e.g. 20 (%)"}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Cookie Duration (days)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.cookieDuration ?? ""}
            onChange={(e) =>
              onChange("cookieDuration", Number.parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Country
          </label>
          <CustomSelect
            value={program.country || ""}
            onChange={(val) => onChange("country", val)}
            options={COUNTRIES.map((c) => ({
              label: c.name,
              value: c.code,
              icon: c.flag,
            }))}
            searchable
            placeholder="Select Country"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            X Handle
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.xHandle || ""}
            onChange={(e) => onChange("xHandle", e.target.value)}
            placeholder="@username"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
          Program Logo
        </label>
        <div className="flex items-center gap-6 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative w-24 h-24 rounded-xl bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden transition-all ${isUploading ? "opacity-50 cursor-wait" : "hover:border-[var(--accent-solid)] cursor-pointer group"
              }`}
          >
            {program.logoUrl ? (
              <Image
                src={program.logoUrl}
                alt="Logo"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <HiPhoto className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--accent-solid)] transition-colors" />
                <span className="text-[10px] text-[var(--text-tertiary)] font-bold">Upload</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-[var(--text-tertiary)] font-medium max-w-[200px]">
              Click to upload and crop. Square images work best.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="text-xs font-bold text-white hover:text-emerald-400 transition-colors"
              >
                Change Logo
              </button>
              {program.logoUrl && (
                <button
                  type="button"
                  onClick={() => onChange("logoUrl", "")}
                  className="text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {cropImageSrc && (
          <ImageCropper
            imageSrc={cropImageSrc}
            onCancel={() => {
              setCropImageSrc(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Affiliates Count Range
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.affiliatesCountRange || ""}
            onChange={(e) => onChange("affiliatesCountRange", e.target.value)}
            placeholder="e.g. 100-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
            Payouts Total Range
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.payoutsTotalRange || ""}
            onChange={(e) => onChange("payoutsTotalRange", e.target.value)}
            placeholder="e.g. $10k-$50k"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-2">
          Additional Info
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[80px]"
          value={program.additionalInfo || ""}
          onChange={(e) => onChange("additionalInfo", e.target.value)}
          placeholder="Trust booster information..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 ${saveStatus === "success"
            ? "bg-emerald-500 text-white"
            : saveStatus === "error"
              ? "bg-red-500 text-white"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
        >
          {isSaving ? "Saving..." : saveStatus === "success" ? "Saved!" : saveStatus === "error" ? "Error" : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
