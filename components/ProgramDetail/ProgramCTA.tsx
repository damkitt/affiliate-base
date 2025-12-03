import {
  HiArrowTopRightOnSquare,
  HiCheckCircle,
  HiShieldCheck,
} from "react-icons/hi2";
import { Program } from "@/types";

interface ProgramCTAProps {
  readonly program: Program;
  readonly onApplyClick: () => void;
}

export function ProgramCTA({ program, onApplyClick }: ProgramCTAProps) {
  return (
    <div
      className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
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
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-all mb-2 hover:opacity-95 shadow-lg"
        style={{ background: "var(--accent-gradient-dark)" }}
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
          <span className="text-sm text-[var(--text-primary)]">
            Verified Program
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <HiShieldCheck className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-[var(--text-primary)]">
            Secure & On-time Payments
          </span>
        </div>
      </div>
    </div>
  );
}
