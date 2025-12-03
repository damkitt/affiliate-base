"use client";

import { useState } from "react";
import {
  HiUserPlus,
  HiLink,
  HiCurrencyDollar,
  HiChartBar,
  HiLightBulb,
} from "react-icons/hi2";

interface Step {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  details: string[];
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: HiUserPlus,
    title: "Sign Up & Get Approved",
    description: "Create your affiliate account and get instant access",
    details: [
      "Fill out simple application form",
      "Get approved within 24-48 hours",
      "Access affiliate dashboard",
    ],
  },
  {
    number: "02",
    icon: HiLink,
    title: "Get Your Unique Link",
    description: "Receive your personalized tracking link and materials",
    details: [
      "Custom tracking link generated",
      "Marketing materials provided",
      "Access to promotional banners",
    ],
  },
  {
    number: "03",
    icon: HiChartBar,
    title: "Share & Track Performance",
    description: "Promote the program and monitor your results",
    details: [
      "Share link with your audience",
      "Real-time analytics dashboard",
      "Track clicks and conversions",
    ],
  },
  {
    number: "04",
    icon: HiCurrencyDollar,
    title: "Earn Commissions",
    description: "Get paid for every successful referral",
    details: [
      "Automatic commission calculation",
      "Regular payout schedule",
      "Multiple payment methods",
    ],
  },
];

export function ProgramHowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <HiLightBulb className="w-5 h-5 text-[var(--accent-solid)]" />
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === index;

          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              onClick={() => setActiveStep(isActive ? null : index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveStep(isActive ? null : index);
                }
              }}
              className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent-solid)]/30 cursor-pointer transition-all"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Icon & Number */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-solid)]/20">
                  <Icon className="w-5 h-5 text-[var(--accent-solid)]" />
                </div>
                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                  Step {step.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                {step.description}
              </p>

              {/* Details - Expandable */}
              <div
                className={`overflow-hidden transition-all duration-300 ${isActive ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <ul className="space-y-2 mt-4 pt-4 border-t border-[var(--border)]">
                  {step.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                    >
                      <span className="text-[var(--accent-solid)] mt-0.5">→</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Expand indicator */}
              <div className="mt-3 text-xs font-medium text-[var(--accent-solid)] group-hover:underline">
                {isActive ? "Show less" : "Learn more"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
