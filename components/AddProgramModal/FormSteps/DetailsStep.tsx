import { ChangeEvent } from "react";
import {
  HiUsers,
  HiBanknotes,
  HiChevronDown,
  HiSparkles,
} from "react-icons/hi2";
import { FormData } from "../types";
import {
  MONTHS,
  YEARS,
  AFFILIATE_RANGES,
  PAYOUT_RANGES,
  APPROVAL_TIMES,
} from "../constants";
import { COUNTRIES } from "@/constants";

interface DetailsStepProps {
  formData: FormData;
  monthDropdownOpen: boolean;
  yearDropdownOpen: boolean;
  countryDropdownOpen: boolean;
  onFormChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onSetMonth: (month: string) => void;
  onSetYear: (year: string) => void;
  onSetCountry: (country: string) => void;
  onToggleMonthDropdown: () => void;
  onToggleYearDropdown: () => void;
  onToggleCountryDropdown: () => void;
}

export function DetailsStep({
  formData,
  monthDropdownOpen,
  yearDropdownOpen,
  countryDropdownOpen,
  onFormChange,
  onSetMonth,
  onSetYear,
  onSetCountry,
  onToggleMonthDropdown,
  onToggleYearDropdown,
  onToggleCountryDropdown,
}: DetailsStepProps) {
  const selectedCountry = COUNTRIES.find((c) => c.name === formData.country);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Founding Date */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
          Founding Date
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Month Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMonthDropdown}
              className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            >
              <span
                className={
                  formData.foundingMonth
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)]"
                }
              >
                {formData.foundingMonth || "Select month"}
              </span>
              <HiChevronDown
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${
                  monthDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {monthDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fadeIn">
                {MONTHS.map((month) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => onSetMonth(month)}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${
                      formData.foundingMonth === month
                        ? "bg-[var(--bg-secondary)] font-medium"
                        : ""
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
              onClick={onToggleYearDropdown}
              className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
            >
              <span
                className={
                  formData.foundingYear
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)]"
                }
              >
                {formData.foundingYear || "Select year"}
              </span>
              <HiChevronDown
                className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${
                  yearDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {yearDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-48 overflow-y-auto animate-fadeIn">
                {YEARS.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => onSetYear(year.toString())}
                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${
                      formData.foundingYear === year.toString()
                        ? "bg-[var(--bg-secondary)] font-medium"
                        : ""
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

      {/* Commission Rate */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Commission Rate <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="commissionRate"
          value={formData.commissionRate}
          onChange={onFormChange}
          placeholder="e.g. 30% recurring, $50 per sale..."
          className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
        />
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
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiUsers className="w-3.5 h-3.5" /> Cookie Duration
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="cookieDuration"
            value={formData.cookieDuration}
            onChange={onFormChange}
            placeholder="e.g. 90 Days"
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
          />
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiBanknotes className="w-3.5 h-3.5" /> Avg Order Value
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="avgOrderValue"
            value={formData.avgOrderValue}
            onChange={onFormChange}
            placeholder="e.g. 120"
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
          />
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiBanknotes className="w-3.5 h-3.5" /> Min Payout
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="minPayoutValue"
            value={formData.minPayoutValue}
            onChange={onFormChange}
            placeholder="e.g. 50"
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
          />
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiBanknotes className="w-3.5 h-3.5" /> Payout Method
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="payoutMethod"
            value={formData.payoutMethod}
            onChange={onFormChange}
            placeholder="e.g. PayPal, Wise"
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
          />
        </div>
        <div className="col-span-2">
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiUsers className="w-3.5 h-3.5" /> Target Audience
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            type="text"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={onFormChange}
            placeholder="e.g. SaaS Founders, Creators"
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
          />
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiUsers className="w-3.5 h-3.5" /> Affiliates Count
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <select
            name="affiliatesCountRange"
            value={formData.affiliatesCountRange}
            onChange={onFormChange}
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 appearance-none"
          >
            <option value="">Select range</option>
            {AFFILIATE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            <HiBanknotes className="w-3.5 h-3.5" /> Total Payouts
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <select
            name="payoutsTotalRange"
            value={formData.payoutsTotalRange}
            onChange={onFormChange}
            className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 appearance-none"
          >
            <option value="">Select range</option>
            {PAYOUT_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide items-center gap-1.5">
            Approval Time
            <span className="text-[var(--text-secondary)] font-normal normal-case">
              (optional)
            </span>
          </label>
          <div className="relative">
            <select
              name="approvalTimeRange"
              value={formData.approvalTimeRange}
              onChange={onFormChange}
              className="w-full h-11 px-4 pr-16 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300 appearance-none"
            >
              <option value="">Select</option>
              {APPROVAL_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-secondary)] font-medium">
              days
            </span>
          </div>
        </div>
      </div>

      {/* Country/Region */}
      <div className="relative">
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wide">
          Country / Region
        </label>
        <button
          type="button"
          onClick={onToggleCountryDropdown}
          className="w-full h-11 px-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-left flex items-center justify-between focus:outline-none focus:bg-[var(--bg)] focus:border-[var(--accent-solid)] transition-all duration-300"
        >
          <span
            className={
              formData.country
                ? "text-[var(--text-primary)] flex items-center gap-2"
                : "text-[var(--text-tertiary)]"
            }
          >
            {selectedCountry ? (
              <>
                <span className="text-lg">{selectedCountry.flag}</span>
                {selectedCountry.name}
              </>
            ) : (
              "Select country"
            )}
          </span>
          <HiChevronDown
            className={`w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300 ${
              countryDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {countryDropdownOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl max-h-56 overflow-y-auto animate-fadeIn">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => onSetCountry(country.name)}
                className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)] ${
                  formData.country === country.name
                    ? "bg-[var(--bg-secondary)] font-medium"
                    : ""
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
  );
}
