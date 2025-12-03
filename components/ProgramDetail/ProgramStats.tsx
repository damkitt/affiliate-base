import { HiUserGroup, HiCurrencyDollar, HiClock } from "react-icons/hi2";
import { Program } from "@/types";

interface ProgramStatsProps {
  readonly program: Program;
}

export function ProgramStats({ program }: ProgramStatsProps) {
  const stats = [
    program.affiliatesCountRange && {
      icon: HiUserGroup,
      label: "Active Affiliates",
      value: program.affiliatesCountRange,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      description: "Growing community",
    },
    program.payoutsTotalRange && {
      icon: HiCurrencyDollar,
      label: "Total Payouts",
      value: program.payoutsTotalRange,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      description: "Paid to affiliates",
    },
    program.approvalTimeRange && {
      icon: HiClock,
      label: "Approval Time",
      value: `${program.approvalTimeRange}d`,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      description: "Average response",
    },
  ].filter(Boolean);

  if (stats.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          if (!stat) return null;
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
