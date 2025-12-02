"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  HiXMark,
  HiPhoto,
  HiGlobeAlt,
  HiLink,
  HiEnvelope,
  HiUsers,
  HiBanknotes,
  HiChevronDown,
  HiArrowRight,
  HiArrowLeft,
  HiCheck,
  HiSparkles,
  HiRocketLaunch,
  HiDocumentText,
  HiChatBubbleLeftRight
} from "react-icons/hi2";
import { CATEGORIES, CATEGORY_ICONS } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";
import { COUNTRIES } from "@/lib/countries";

interface AddProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Logo, name & links", icon: HiRocketLaunch },
  { id: 2, title: "Details", description: "Metrics & region", icon: HiDocumentText },
  { id: 3, title: "Contact", description: "How to reach you", icon: HiChatBubbleLeftRight },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 25 }, (_, i) => currentYear - i);

export default function AddProgramModal({ isOpen, onClose, onSuccess }: AddProgramModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const AFFILIATE_RANGES = ["0-100", "100-500", "500-1k", "1k-5k", "5k-10k", "10k+"];
  const PAYOUT_RANGES = ["$0-$1k", "$1k-$10k", "$10k-$50k", "$50k-$100k", "$100k+"];
  const APPROVAL_TIMES = ["1", "2-3", "3-5", "5-7", "7-14", "14+"];

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    category: "SaaS",
    websiteUrl: "",
    affiliateUrl: "",
    country: "",
    xHandle: "",
    email: "",
    logoBase64: "",
    commissionRate: "",
    affiliatesCount: "",
    payoutsTotal: "",
    foundingMonth: "",
    foundingYear: "",
    additionalInfo: "",
    cookieDuration: "",
    payoutMethod: "",
    minPayout: "",
    avgOrderValue: "",
    targetAudience: "",
    approvalTime: "",
  });

  const validateEnglishInput = (value: string) => {
    // Allow English letters, numbers, common punctuation, and whitespace
    // Reject Cyrillic, Chinese, etc.
    const regex = /^[a-zA-Z0-9\s.,!?'"@#$%^&*()_+\-=\[\]{};:|\\/<>]*$/;
    return regex.test(value);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // For specific fields, enforce English validation
    if (["name", "tagline", "description", "additionalInfo", "commissionRate", "targetAudience", "minPayout", "avgOrderValue", "cookieDuration", "payoutMethod"].includes(name)) {
      if (!validateEnglishInput(value)) {
        return; // Ignore non-English input
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData((prev) => ({ ...prev, logoBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceedToStep = (step: number): boolean => {
    if (step === 2) {
      // Step 1 requires: name, websiteUrl, affiliateUrl
      return !!formData.name && !!formData.websiteUrl && !!formData.affiliateUrl;
    }
    if (step === 3) {
      // Step 2 requires: commissionRate
      return !!formData.name && !!formData.websiteUrl && !!formData.affiliateUrl && !!formData.commissionRate;
    }
    return true;
  };

  const canSubmit = (): boolean => {
    return !!formData.name && !!formData.websiteUrl && !!formData.affiliateUrl && !!formData.commissionRate;
  };

  const handleNext = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setSlideDirection("right");
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSlideDirection("left");
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setIsSubmitting(true);

    // Calculate startup age from founding date
    let startupAge = null;
    if (formData.foundingMonth && formData.foundingYear) {
      const foundingDate = new Date(parseInt(formData.foundingYear), MONTHS.indexOf(formData.foundingMonth));
      const now = new Date();
      const months = (now.getFullYear() - foundingDate.getFullYear()) * 12 + (now.getMonth() - foundingDate.getMonth());
      startupAge = Math.max(0, months);
    }

    try {
      const payload = {
        name: formData.name,
        tagline: formData.tagline || "",
        description: formData.description || "",
        category: formData.category,
        websiteUrl: formData.websiteUrl,
        affiliateUrl: formData.affiliateUrl,
        country: formData.country || null,
        xHandle: formData.xHandle || null,
        email: formData.email || null,
        logoBase64: formData.logoBase64 || null,
        commissionRate: formData.commissionRate,
        affiliatesCount: formData.affiliatesCount || null,
        payoutsLast30Days: null, // Not in form but in schema
        payoutsTotal: formData.payoutsTotal || null,
        brandAge: startupAge !== null ? `${startupAge} months` : null, // Convert to string
        usersTotal: null, // Not in form but in schema
        cookieDuration: formData.cookieDuration || null,
        payoutMethod: formData.payoutMethod || null,
        minPayout: formData.minPayout || null,
        avgOrderValue: formData.avgOrderValue || null,
        targetAudience: formData.targetAudience || null,
        additionalInfo: formData.additionalInfo || null,
        approvalTime: formData.approvalTime || null,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success:", data);
        onSuccess();
        setShowSuccess(true); // Show success modal
        // Do not close immediately, let user see success
      } else {
        console.error("API Error:", response.status, data);
        alert(`Error: ${data.error || 'Failed to create program'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", tagline: "", description: "", category: "SaaS",
      websiteUrl: "", affiliateUrl: "", country: "", xHandle: "",
      email: "", logoBase64: "", commissionRate: "", affiliatesCount: "",
      payoutsTotal: "", foundingMonth: "", foundingYear: "", additionalInfo: "",
      cookieDuration: "", payoutMethod: "", minPayout: "", avgOrderValue: "", targetAudience: "",
    });
    setLogoPreview(null);
    setCurrentStep(1);
    setShowSuccess(false);
  };

  const selectedCountry = COUNTRIES.find(c => c.name === formData.country);

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />
        <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center animate-scaleIn border border-[var(--border)]">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
            <HiCheck className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Program Submitted!</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Your affiliate program has been successfully added to the directory.
          </p>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="w-full h-11 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn border border-[var(--border)]">
        {/* Header with Progress */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-all duration-300 hover:rotate-90"
          >
            <HiXMark className="w-5 h-5 text-[var(--text-tertiary)]" />
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-secondary)] rounded-full mb-3">
              <HiSparkles className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">Add Program</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-3">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={`
                        rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted
                          ? "w-10 h-10 bg-[var(--text-primary)]"
                          : isCurrent
                            ? "w-10 h-10 bg-[var(--accent)] ring-2 ring-[var(--border)]"
                            : "w-10 h-10 bg-[var(--bg-secondary)] border border-[var(--border)]"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <HiCheck className="w-6 h-6 text-white animate-scaleIn" />
                      ) : (
                        <StepIcon className={`w-5 h-5 transition-colors duration-300 ${isCurrent ? "text-[var(--bg)]" : "text-[var(--text-tertiary)]"}`} />
                      )}
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="w-12 h-[2px] mx-2 rounded-full overflow-hidden bg-[var(--border)]">
                      <div
                        className={`h-full bg-[var(--text-primary)] transition-all duration-500 ease-out ${isCompleted ? "w-full" : "w-0"
                          }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden">
          <div
            className={`h-full overflow-y-auto px-6 py-4 transition-all duration-500 ease-out ${slideDirection === "right" ? "animate-slideInRight" : "animate-slideInLeft"
              }`}
            key={currentStep}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Logo & Name */}
                <div className="flex items-start gap-5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-20 h-20 rounded-lg bg-[var(--bg-secondary)] border border-dashed border-[var(--border)] hover:border-[var(--text-tertiary)] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 flex-shrink-0"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <HiPhoto className="w-8 h-8 mx-auto text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors duration-300" />
                        <span className="text-[10px] text-[var(--text-tertiary)] mt-1 block">Upload</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                        Program Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Stripe, Notion, Figma..."
                        required
                        className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Tagline</label>
                      <input
                        type="text"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleChange}
                        placeholder="A short description..."
                        className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-3 uppercase tracking-wide">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(0, 10).map((cat) => {
                      const iconName = CATEGORY_ICONS[cat] || "HiCube";
                      const isSelected = formData.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                          className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${isSelected
                            ? "bg-[var(--accent)] text-[var(--bg)]"
                            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about this affiliate program..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 resize-none"
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiGlobeAlt className="w-3.5 h-3.5" /> Website <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiLink className="w-3.5 h-3.5" /> Affiliate URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      name="affiliateUrl"
                      value={formData.affiliateUrl}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Founding Date */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-3 uppercase tracking-wide">
                    Founding Date
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Month Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setMonthDropdownOpen(!monthDropdownOpen);
                          setYearDropdownOpen(false);
                        }}
                        className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                      >
                        <span className={formData.foundingMonth ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
                          {formData.foundingMonth || "Select month"}
                        </span>
                        <HiChevronDown className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300 ${monthDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {monthDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fadeIn">
                          {MONTHS.map((month) => (
                            <button
                              key={month}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, foundingMonth: month }));
                                setMonthDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${formData.foundingMonth === month ? "bg-[var(--bg-secondary)] font-medium" : ""
                                }`}
                            >
                              {month}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Year Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setYearDropdownOpen(!yearDropdownOpen);
                          setMonthDropdownOpen(false);
                        }}
                        className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                      >
                        <span className={formData.foundingYear ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
                          {formData.foundingYear || "Select year"}
                        </span>
                        <HiChevronDown className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300 ${yearDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {yearDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fadeIn">
                          {YEARS.map((year) => (
                            <button
                              key={year}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, foundingYear: year.toString() }));
                                setYearDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${formData.foundingYear === year.toString() ? "bg-[var(--bg-secondary)] font-medium" : ""
                                }`}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                    Commission Rate <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleChange}
                      placeholder="e.g. 30% recurring, $50 per sale..."
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Trust Booster Hint */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400 mt-0.5">
                    <HiSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-1">Trust Booster</h4>
                    <p className="text-xs text-blue-300/80 leading-relaxed">
                      Note: These fields are optional, but programs with complete details get <span className="text-blue-200 font-medium">3x more referrals</span> and higher trust from creators.
                    </p>
                  </div>
                </div>

                {/* Optional Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiUsers className="w-3.5 h-3.5" /> Cookie Duration
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="cookieDuration"
                      value={formData.cookieDuration}
                      onChange={handleChange}
                      placeholder="e.g. 90 Days"
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiBanknotes className="w-3.5 h-3.5" /> Avg Order Value
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="avgOrderValue"
                      value={formData.avgOrderValue}
                      onChange={handleChange}
                      placeholder="e.g. $120"
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiBanknotes className="w-3.5 h-3.5" /> Min Payout
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="minPayout"
                      value={formData.minPayout}
                      onChange={handleChange}
                      placeholder="e.g. $50"
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiBanknotes className="w-3.5 h-3.5" /> Payout Method
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="payoutMethod"
                      value={formData.payoutMethod}
                      onChange={handleChange}
                      placeholder="e.g. PayPal, Wise"
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiUsers className="w-3.5 h-3.5" /> Target Audience
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      placeholder="e.g. SaaS Founders, Creators"
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiUsers className="w-3.5 h-3.5" /> Affiliates Count
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <select
                      name="affiliatesCount"
                      value={formData.affiliatesCount}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 appearance-none"
                    >
                      <option value="">Select range</option>
                      {AFFILIATE_RANGES.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      <HiBanknotes className="w-3.5 h-3.5" /> Total Payouts
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <select
                      name="payoutsTotal"
                      value={formData.payoutsTotal}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 appearance-none"
                    >
                      <option value="">Select range</option>
                      {PAYOUT_RANGES.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                      Approval Time
                      <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        name="approvalTime"
                        value={formData.approvalTime}
                        onChange={handleChange}
                        className="w-full h-11 px-4 pr-16 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 appearance-none"
                      >
                        <option value="">Select</option>
                        {APPROVAL_TIMES.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">days</span>
                    </div>
                  </div>
                </div>

                {/* Country/Region */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide">
                    Country / Region
                  </label>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300"
                  >
                    <span className={formData.country ? "text-[var(--text-primary)] flex items-center gap-2" : "text-[var(--text-tertiary)]"}>
                      {selectedCountry ? (
                        <>
                          <span className="text-lg">{selectedCountry.flag}</span>
                          {selectedCountry.name}
                        </>
                      ) : (
                        "Select country"
                      )}
                    </span>
                    <HiChevronDown className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-300 ${countryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-56 overflow-y-auto animate-fadeIn">
                      {COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, country: country.name }));
                            setCountryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${formData.country === country.name ? "bg-[var(--bg-secondary)] font-medium" : ""
                            }`}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
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
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                        <HiEnvelope className="w-3.5 h-3.5" /> Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contact@company.com"
                        className="w-full h-12 px-4 rounded-xl bg-[var(--bg-card)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info for Creators */}
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
                    onChange={handleChange}
                    placeholder="e.g. We provide custom landing pages, marketing materials, dedicated affiliate manager..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border-2 border-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent)] transition-all duration-300 resize-none"
                  />
                </div>

                {/* Summary Preview */}
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                  <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Preview</h4>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[var(--border)] flex items-center justify-center">
                        <span className="text-lg font-bold text-[var(--text-tertiary)]">
                          {formData.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold text-[var(--text-primary)]">{formData.name || "Program Name"}</h5>
                      <p className="text-sm text-[var(--text-secondary)]">{formData.tagline || "Your tagline"}</p>
                    </div>
                    {formData.commissionRate && (
                      <div className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-500 text-sm font-medium rounded-full">
                        {formData.commissionRate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="h-10 px-4 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors duration-150 flex items-center gap-2"
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <HiArrowLeft className="w-4 h-4" />
                Back
              </>
            )}
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToStep(currentStep + 1)}
              className={`h-10 px-5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${canProceedToStep(currentStep + 1)
                ? "bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
                : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed"
                }`}
            >
              Continue
              <HiArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit()}
              className={`h-10 px-5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2 ${canSubmit() && !isSubmitting
                ? "bg-[var(--accent)] text-[var(--bg)] hover:opacity-90"
                : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <HiCheck className="w-4 h-4" />
                  Add Program
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
