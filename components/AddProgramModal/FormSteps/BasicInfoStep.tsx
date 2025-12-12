import { ChangeEvent, RefObject, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { HiPhoto, HiGlobeAlt, HiLink, HiExclamationCircle } from "react-icons/hi2";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { FormData } from "../types";
import { CATEGORIES, CATEGORY_ICONS } from "@/constants";
import { getUrlValidationError } from "../error-utils";

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
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
              Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="programName"
              value={formData.programName}
              onChange={onFormChange}
              placeholder="e.g. Stripe, Notion, Figma..."
              required
              className={`w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] transition-all duration-300 ${duplicateErrors.programName
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-[var(--border)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10"
                }`}
            />
            {renderFieldError("programName", duplicateErrors.programName, checkingFields.has("programName"))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={onFormChange}
              placeholder="A short description..."
              className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] focus:ring-2 focus:ring-[var(--accent-solid)]/10 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
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

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onFormChange}
          placeholder="Tell us about this affiliate program..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 resize-none"
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
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
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
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
