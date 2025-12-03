import {
  HiCurrencyDollar,
  HiClock,
  HiMapPin,
  HiUserGroup,
  HiBanknotes,
  HiCheckCircle,
  HiShoppingCart,
  HiUsers,
  HiCalendar,
  HiDocumentText,
  HiInformationCircle,
} from "react-icons/hi2";
import { Program } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProgramStatsProps {
  readonly program: Program;
}

export function ProgramStats({ program }: ProgramStatsProps) {
  // Build list of filled fields only
  const infoItems = [
    { icon: HiCurrencyDollar, label: "Commission", value: `${program.commissionRate}%`, show: true },
    { icon: HiClock, label: "Cookie Duration", value: program.cookieDuration ? `${program.cookieDuration} days` : null, show: !!program.cookieDuration },
    { icon: HiMapPin, label: "Region", value: program.country, show: !!program.country },
    { icon: HiUserGroup, label: "Affiliates", value: program.affiliatesCountRange, show: !!program.affiliatesCountRange },
    { icon: HiBanknotes, label: "Total Payouts", value: program.payoutsTotalRange, show: !!program.payoutsTotalRange },
    { icon: HiCheckCircle, label: "Approval Time", value: program.approvalTimeRange, show: !!program.approvalTimeRange },
    { icon: HiShoppingCart, label: "Avg Order Value", value: program.avgOrderValue ? `$${program.avgOrderValue}` : null, show: !!program.avgOrderValue },
    { icon: HiBanknotes, label: "Min Payout", value: program.minPayoutValue ? `$${program.minPayoutValue}` : null, show: !!program.minPayoutValue },
    { icon: HiUsers, label: "Target Audience", value: program.targetAudience, show: !!program.targetAudience },
    { icon: HiCalendar, label: "Founded", value: program.foundingDate ? new Date(program.foundingDate).getFullYear().toString() : null, show: !!program.foundingDate },
  ].filter(item => item.show && item.value);

  if (infoItems.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <HiDocumentText className="w-5 h-5 text-[var(--accent-solid)]" />
          Program Details
        </h2>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="p-1 rounded-md hover:bg-[var(--bg-secondary)] transition-colors">
                <HiInformationCircle className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={8}>
              <p className="text-sm text-[var(--text-secondary)]">
                Data provided during registration.<br />
                Not verified by AffiliateBase.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-[var(--accent-solid)]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
