import { ChangeEvent, useState, useRef, useEffect } from "react";
import {
  HiUsers,
  HiBanknotes,
  HiChevronDown,
  HiSparkles,
  HiCheck,
} from "react-icons/hi2";
import { FormData } from "../types";
import {
  MONTHS,
  YEARS,
  AFFILIATE_RANGES,
  PAYOUT_RANGES,
  PAYOUT_METHODS,
} from "../constants";
import { COUNTRIES } from "@/constants";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface DetailsStepProps {
  formData: FormData;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSetMonth: (month: string) => void;
  onSetYear: (year: string) => void;
  onSetCountry: (country: string) => void;
}

export function DetailsStep({
  formData,
  onFormChange,
  onSetMonth,
  onSetYear,
  onSetCountry,
}: DetailsStepProps) {

  // Local state for Payout Method dropdown (kept custom due to multi-select nature)
  const [payoutDropdownOpen, setPayoutDropdownOpen] = useState(false);
  const payoutDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside for local dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (payoutDropdownRef.current && !payoutDropdownRef.current.contains(event.target as Node)) {
        setPayoutDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePayoutMethodToggle = (method: string) => {
    const currentMethods = formData.payoutMethod ? formData.payoutMethod.split(",").map(s => s.trim()).filter(Boolean) : [];
    let newMethods;
    if (currentMethods.includes(method)) {
      newMethods = currentMethods.filter(m => m !== method);
    } else {
      newMethods = [...currentMethods, method];
    }

    const syntheticEvent = {
      target: { name: "payoutMethod", value: newMethods.join(", ") },
    } as ChangeEvent<HTMLInputElement>;
    onFormChange(syntheticEvent);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Founding Date */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
          Founding Date
        </label>
        <div className="grid grid-cols-2 gap-4">
          <CustomSelect
            placeholder="Select month"
            value={formData.foundingMonth}
            onChange={onSetMonth}
            options={MONTHS.map(m => ({ label: m, value: m }))}
          />
          <CustomSelect
            placeholder="Select year"
            value={formData.foundingYear}
            onChange={onSetYear}
            options={YEARS.map(y => ({ label: y.toString(), value: y.toString() }))}
          />
        </div>
      </div>

      {/* Commission Rate */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Commission Rate <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-3">
          {/* Numeric input with % sign */}
          <div className="relative w-20">
            <input
              type="text"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow digits, max 2 characters
                if (/^\d{0,2}$/.test(value)) {
                  onFormChange(e);
                }
              }}
              placeholder="30"
              maxLength={2}
              className="w-full h-11 px-3 pr-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 text-center"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] font-medium pointer-events-none">
              %
            </span>
          </div>

          {/* Commission Type Toggle */}
          <div className="flex items-center h-11 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-1">
            <button
              type="button"
              onClick={() => {
                const syntheticEvent = {
                  target: { name: "commissionDuration", value: "One-time" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFormChange(syntheticEvent);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${formData.commissionDuration === "One-time" || !formData.commissionDuration
                ? "bg-[var(--accent-solid)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              One-time
            </button>
            <button
              type="button"
              onClick={() => {
                const syntheticEvent = {
                  target: { name: "commissionDuration", value: "Recurring" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFormChange(syntheticEvent);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${formData.commissionDuration === "Recurring"
                ? "bg-[var(--accent-solid)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Trust Booster */}
      <div className="p-4 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent-solid)]/30 flex items-start gap-3">
        <div className="p-1.5 rounded-full bg-[var(--accent-solid)]/20 text-[var(--accent-solid)] mt-0.5">
          <HiSparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[var(--accent-solid)] mb-1">
            Trust Booster
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Note: These fields are optional, but programs with complete details
            get{" "}
            <span className="text-[var(--accent-solid)] font-semibold">3x more referrals</span>{" "}
            and higher trust from creators.
          </p>
        </div>
      </div>

      {/* Optional Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cookie Duration */}
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiUsers className="w-3.5 h-3.5" /> Cookie Duration
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="cookieDuration"
              value={formData.cookieDuration}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,3}$/.test(value)) {
                  onFormChange(e);
                }
              }}
              placeholder="90"
              maxLength={3}
              className="w-full h-11 pl-4 pr-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">
              Days
            </span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiBanknotes className="w-3.5 h-3.5" /> Avg Order Value
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">
              $
            </span>
            <input
              type="text"
              name="avgOrderValue"
              value={formData.avgOrderValue}
              onChange={onFormChange}
              placeholder="120"
              className="w-full h-11 pl-8 pr-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Min Payout */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            <span className="flex items-center gap-1.5">
              <HiBanknotes className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wide">Min Payout</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">
              $
            </span>
            <input
              type="text"
              name="minPayoutValue"
              value={formData.minPayoutValue}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,4}$/.test(value)) {
                  onFormChange(e);
                }
              }}
              placeholder="50"
              maxLength={4}
              className="w-full h-11 pl-8 pr-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            />
          </div>
        </div>

        {/* Payout Method (Refined Chips with Spacing) */}
        <div className="relative" ref={payoutDropdownRef}>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            <span className="flex items-center gap-1.5">
              <HiBanknotes className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wide">Payout Method</span>
            </span>
          </label>
          <button
            type="button"
            onClick={() => setPayoutDropdownOpen(!payoutDropdownOpen)}
            className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none hover:bg-[var(--bg)] transition-all duration-300"
          >
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {formData.payoutMethod ? (
                formData.payoutMethod.split(",").map((method, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 backdrop-blur-sm transition-all duration-200"
                  >
                    {method.trim()}
                  </span>
                ))
              ) : (
                <span className="text-[var(--text-tertiary)]">Select methods</span>
              )}
            </div>
            <HiChevronDown className={`w-4 h-4 text-[var(--text-secondary)] shrink-0 transition-transform ml-2 ${payoutDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {payoutDropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl animate-fadeIn ring-1 ring-black/5">
              <div className="grid grid-cols-1">
                {PAYOUT_METHODS.map(method => {
                  const isSelected = formData.payoutMethod?.split(",").map(s => s.trim()).includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handlePayoutMethodToggle(method)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg transition-colors text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
                    >
                      {method}
                      {isSelected && <HiCheck className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiUsers className="w-3.5 h-3.5" /> Target Audience
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="targetAudience"
              value={formData.targetAudience || ""}
              onChange={onFormChange}
              placeholder="e.g. SaaS Founders, Creators"
              maxLength={30}
              className="w-full h-11 pl-4 pr-14 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] tabular-nums pointer-events-none">
              {(formData.targetAudience?.length || 0)}/30
            </span>
          </div>
        </div>

        <div>
          {/* Approval Time - Simple Input */}
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            Approval Time
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="approvalTimeRange"
              value={formData.approvalTimeRange}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,2}$/.test(value)) {
                  onFormChange(e);
                }
              }}
              placeholder="2"
              maxLength={2}
              className="w-full h-11 pl-4 pr-12 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">
              Days
            </span>
          </div>
        </div>

        <div>
          <CustomSelect
            label={
              <span className="flex items-center gap-1.5">
                <HiBanknotes className="w-3.5 h-3.5" /> Total Payouts
                <span className="text-[var(--text-secondary)] font-normal normal-case ml-0.5">(optional)</span>
              </span>
            }
            placeholder="Select range"
            value={formData.payoutsTotalRange}
            onChange={(val) => {
              const syntheticEvent = {
                target: { name: "payoutsTotalRange", value: val },
              } as React.ChangeEvent<HTMLSelectElement>;
              onFormChange(syntheticEvent);
            }}
            options={PAYOUT_RANGES.map(r => ({ label: r, value: r }))}
            position="top"
          />
        </div>

        <div>
          <CustomSelect
            label={
              <span className="flex items-center gap-1.5">
                <HiUsers className="w-3.5 h-3.5" /> Affiliates Count
                <span className="text-[var(--text-secondary)] font-normal normal-case ml-0.5">(optional)</span>
              </span>
            }
            placeholder="Select range"
            value={formData.affiliatesCountRange}
            onChange={(val) => {
              const syntheticEvent = {
                target: { name: "affiliatesCountRange", value: val },
              } as React.ChangeEvent<HTMLSelectElement>;
              onFormChange(syntheticEvent);
            }}
            options={AFFILIATE_RANGES.map(r => ({ label: r, value: r }))}
            position="top"
          />
        </div>

      </div>

      <CustomSelect
        label="Country / Region"
        placeholder="Select country"
        value={formData.country}
        onChange={(val) => onSetCountry(val)}
        options={COUNTRIES.map(c => ({ label: c.name, value: c.name, icon: c.flag }))}
        searchable
        position="top"
      />
    </div>
  );
}
