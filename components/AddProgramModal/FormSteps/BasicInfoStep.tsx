import { ChangeEvent, RefObject, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiChevronRight,
  HiInformationCircle,
  HiCheckCircle,
  HiExclamationCircle,
  HiQuestionMarkCircle,
  HiPencilSquare,
  HiPhoto,
  HiGlobeAlt,
  HiLink
} from 'react-icons/hi2';
import { CategoryIcon } from "@/components/CategoryIcon";
import type { FormData } from "../types";
import { CATEGORIES, CATEGORY_ICONS } from "@/constants";
import { getUrlValidationError } from "../error-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

interface DuplicateErrors {
  programName?: string;
  websiteUrl?: string;
  affiliateUrl?: string;
}

interface BasicInfoStepProps {
  formData: FormData;
  logoPreview: string | null;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFormChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onLogoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onCategorySelect: (category: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function BasicInfoStep({
  formData,
  logoPreview,
  isUploading,
  fileInputRef,
  onFormChange,
  onLogoUpload,
  onCategorySelect,
}: BasicInfoStepProps) {
  const websiteError = getUrlValidationError(formData.websiteUrl);
  const affiliateError = getUrlValidationError(formData.affiliateUrl);

  // Real-time duplicate checking
  const [duplicateErrors, setDuplicateErrors] = useState<DuplicateErrors>({});
  const [validationErrors, setValidationErrors] = useState<DuplicateErrors>({});
  const [checkingFields, setCheckingFields] = useState<Set<string>>(new Set());

  const debouncedProgramName = useDebounce(formData.programName, 500);
  const debouncedWebsiteUrl = useDebounce(formData.websiteUrl, 500);
  const debouncedAffiliateUrl = useDebounce(formData.affiliateUrl, 500);

  const checkDuplicate = useCallback(async (field: string, value: string) => {
    if (!value || value.length < 3) {
      setDuplicateErrors(prev => ({ ...prev, [field]: undefined }));
      return;
    }

    setCheckingFields(prev => new Set(prev).add(field));

    try {
      const res = await fetch(`/api/programs/check-duplicate?field=${field}&value=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (data.exists) {
        setDuplicateErrors(prev => ({ ...prev, [field]: data.message }));
      } else {
        setDuplicateErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } catch {
      // Silently fail - don't block user
    } finally {
      setCheckingFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  }, []);

  const validateUrl = useCallback(async (field: "websiteUrl" | "affiliateUrl", value: string) => {
    if (!value) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
      return;
    }

    setCheckingFields(prev => new Set(prev).add(`${field}-valid`));

    try {
      const type = field === "affiliateUrl" ? "affiliate" : "website";
      const res = await fetch("/api/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value, type }),
      });

      const data = await res.json();

      if (!data.isValid) {
        setValidationErrors(prev => ({ ...prev, [field]: data.error }));
      } else {
        setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        // Optional: Update with cleaned URL if needed, but might be annoying while typing
        // if (data.cleanedUrl !== value) { ... }
      }
    } catch {
      // Ignore network errors here
    } finally {
      setCheckingFields(prev => {
        const next = new Set(prev);
        next.delete(`${field}-valid`);
        return next;
      });
    }
  }, []);

  // Check for duplicates when debounced values change
  useEffect(() => {
    if (debouncedProgramName) {
      checkDuplicate("programName", debouncedProgramName);
    }
  }, [debouncedProgramName, checkDuplicate]);

  useEffect(() => {
    if (debouncedWebsiteUrl && !websiteError) {
      checkDuplicate("websiteUrl", debouncedWebsiteUrl);
    }
  }, [debouncedWebsiteUrl, websiteError, checkDuplicate]);

  useEffect(() => {
    if (debouncedAffiliateUrl && !affiliateError) {
      checkDuplicate("affiliateUrl", debouncedAffiliateUrl);
    }
  }, [debouncedAffiliateUrl, affiliateError, checkDuplicate]);

  const handleBlur = (field: "websiteUrl" | "affiliateUrl") => {
    const value = formData[field];
    if (value && !getUrlValidationError(value)) {
      validateUrl(field, value);
    }
  };

  const renderFieldError = (fieldName: string, error?: string, isChecking?: boolean) => {
    if (isChecking) {
      return (
        <p className="text-xs text-gray-400 mt-1.5 font-medium animate-pulse flex items-center gap-1">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Checking...
        </p>
      );
    }
    if (error) {
      return (
        <p className="text-xs text-red-500 mt-1.5 font-medium animate-fadeIn flex items-center gap-1">
          <HiExclamationCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Logo & Name */}
      <div className="flex items-start gap-5">
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`group relative w-20 h-20 rounded-lg bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden transition-all duration-200 flex-shrink-0 ${isUploading
            ? "opacity-50 cursor-wait"
            : "hover:border-[var(--accent-solid)] hover:bg-[var(--accent-dim)] cursor-pointer"
            }`}
        >
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <HiPhoto
                className={`w-8 h-8 mx-auto text-[var(--text-secondary)] transition-colors duration-300 ${!isUploading && "group-hover:text-[var(--accent-solid)]"
                  }`}
              />
              <span className="text-[10px] text-[var(--text-secondary)] mt-1 block font-medium">
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    Upload <span className="text-red-500">*</span>
                  </>
                )}
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            disabled={isUploading}
            className="hidden"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                Program Name <span className="text-red-500">*</span>
              </label>
              <span className={`text-[10px] font-medium ${(formData.programName?.length || 0) >= 30 ? "text-red-500" : "text-[var(--text-tertiary)]"}`}>
                {formData.programName?.length || 0}/30
              </span>
            </div>
            <input
              type="text"
              name="programName"
              value={formData.programName}
              onChange={onFormChange}
              placeholder="e.g. Stripe, Notion, Figma..."
              required
              maxLength={30}
              className={`w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] transition-all duration-300 ${duplicateErrors.programName
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-[var(--border)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10"
                }`}
            />
            {renderFieldError("programName", duplicateErrors.programName, checkingFields.has("programName"))}
          </div>
          <div>
            <label className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              <span className="flex items-center gap-1.5">
                Tagline
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
                          <HiInformationCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Quick Tip</p>
                          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                            Describe your product in <span className="text-white">5-7 words</span>. Keep it punchy and clear.
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className={`text-[10px] font-bold tabular-nums ${formData.tagline.length >= 50 ? 'text-red-500' : 'text-[var(--text-tertiary)]'}`}>
                {formData.tagline.length}/50
              </span>
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={onFormChange}
              placeholder="e.g. AI-powered writing assistant for teams"
              maxLength={50}
              className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 10).map((cat) => {
            const iconName = CATEGORY_ICONS[cat] || "HiCube";
            const isSelected = formData.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategorySelect(cat)}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 ${isSelected
                  ? "bg-[var(--accent-solid)] text-white shadow-md"
                  : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent-solid)]"
                  }`}
              >
                <CategoryIcon iconName={iconName} className="w-4 h-4" />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* About This Program */}
      <div>
        <label className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
          <span className="flex items-center gap-1.5">
            About This Program
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
          </span>
          <span className={`text-[10px] font-bold tabular-nums ${formData.description.length >= 2000 ? 'text-red-500' : 'text-[var(--text-tertiary)]'}`}>
            {formData.description.length}/2000
          </span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onFormChange}
          placeholder="Tell partners about your program, ideal customers, and what content works best..."
          rows={5}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 resize-none"
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 items-center gap-1.5">
            <HiGlobeAlt className="w-3.5 h-3.5" /> Website{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={onFormChange}
            onBlur={() => handleBlur("websiteUrl")}
            placeholder="https://..."
            className={`w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] transition-all duration-300 ${websiteError || duplicateErrors.websiteUrl || validationErrors.websiteUrl
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-[var(--border)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10"
              }`}
          />
          {renderFieldError(
            "websiteUrl",
            websiteError || duplicateErrors.websiteUrl || validationErrors.websiteUrl,
            !websiteError && (checkingFields.has("websiteUrl") || checkingFields.has("websiteUrl-valid"))
          )}
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 items-center gap-1.5">
            <HiLink className="w-3.5 h-3.5" /> Affiliate URL{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            name="affiliateUrl"
            value={formData.affiliateUrl}
            onChange={onFormChange}
            onBlur={() => handleBlur("affiliateUrl")}
            placeholder="https://..."
            className={`w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] transition-all duration-300 ${affiliateError || duplicateErrors.affiliateUrl || validationErrors.affiliateUrl
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              : "border-[var(--border)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10"
              }`}
          />
          {renderFieldError(
            "affiliateUrl",
            affiliateError || duplicateErrors.affiliateUrl || validationErrors.affiliateUrl,
            !affiliateError && (checkingFields.has("affiliateUrl") || checkingFields.has("affiliateUrl-valid"))
          )}
        </div>
      </div>
    </div>
  );
}
