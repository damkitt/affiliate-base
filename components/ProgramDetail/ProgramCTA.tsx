import {
  HiArrowTopRightOnSquare,
  HiCheckCircle,
  HiClock,
  HiSparkles,
  HiShieldCheck,
} from "react-icons/hi2";
import { Program } from "@/types";

interface ProgramCTAProps {
  readonly program: Program;
  readonly onApplyClick: () => void;
}

export function ProgramCTA({ program, onApplyClick }: ProgramCTAProps) {
  return (
    <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] sticky top-24" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Status Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--accent-dim)] border border-[var(--accent-solid)]/20 mb-4">
        <HiSparkles className="w-3.5 h-3.5 text-[var(--accent-solid)]" />
        <span className="text-xs font-medium text-[var(--accent-solid)]">Active</span>
      </div>

      {/* Main Content */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          Ready to Start?
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {program.affiliatesCountRange
            ? `${program.affiliatesCountRange} affiliates earning`
            : "Join our affiliate community"}
        </p>
      </div>

      {/* Commission Highlight */}
      <div className="mb-5 p-4 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-solid)]/20">
        <div className="text-2xl font-bold text-[var(--accent-solid)] mb-0.5">
          {program.commissionRate}%
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          Commission on every sale
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onApplyClick}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-[var(--accent-foreground)] font-medium rounded-lg transition-all mb-2 hover:opacity-95"
        style={{ background: 'var(--accent-gradient-dark)', boxShadow: 'var(--shadow-md)' }}
      >
        Apply to Program
        <HiArrowTopRightOnSquare className="w-4 h-4" />
      </button>

      <p className="text-center text-xs text-[var(--text-secondary)] mb-5">
        Free to join • No credit card required
      </p>

      {/* Trust Signals */}
      <div className="space-y-2.5 pt-5 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <HiCheckCircle className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Verified Program
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              Trusted by affiliates
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <HiClock className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Fast Approval
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {program.approvalTimeRange
                ? `~${program.approvalTimeRange} days`
                : "Quick response"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <HiShieldCheck className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Secure & Reliable
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              On-time payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
