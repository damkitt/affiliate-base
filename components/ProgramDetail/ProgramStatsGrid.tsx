
import {
    HiBanknotes,
    HiClock,
    HiMapPin,
    HiUserGroup,
    HiCurrencyDollar,
    HiBolt,
    HiCalendar,
    HiChartBar,
    HiTag,
    HiInformationCircle
} from "react-icons/hi2";
import { Program } from "@/types";
import { getCountryFlag, getFullCountryName } from "@/lib/country-helpers";

interface ProgramStatsGridProps {
    program: Program;
}

export function ProgramStatsGrid({ program }: ProgramStatsGridProps) {
    const commissionLabel = program.commissionDuration === "Recurring" ? "recurring" : program.commissionDuration === "One-time" ? "one-time" : null;

    const programDetails = [
        { icon: HiBanknotes, label: "Commission", value: program.commissionType === "FIXED" ? `Up to $${program.commissionRate} per sale` : (program.commissionRate != null ? `${program.commissionRate}%${commissionLabel ? ` ${commissionLabel}` : ""}` : null) },
        { icon: HiClock, label: "Cookie Duration", value: program.cookieDuration != null ? `${program.cookieDuration} days` : null },
        {
            icon: HiMapPin,
            label: "Country",
            value: program.country ? `${getCountryFlag(program.country)} ${getFullCountryName(program.country)}` : null
        },
        { icon: HiUserGroup, label: "Affiliates", value: program.affiliatesCountRange ?? null },
        { icon: HiCurrencyDollar, label: "Min Payout", value: program.minPayoutValue != null ? `$${program.minPayoutValue}` : null },
        { icon: HiBolt, label: "Approval Time", value: program.approvalTimeRange ? `${program.approvalTimeRange} days` : null },
        { icon: HiUserGroup, label: "Target Audience", value: program.targetAudience ?? null },
        {
            icon: HiCalendar,
            label: program.payoutsTotalRange ? "Payouts Total" : "Founded",
            value: program.payoutsTotalRange ?? (program.foundingDate ? new Date(program.foundingDate).getFullYear() : null)
        },
        { icon: HiChartBar, label: "Avg Order", value: program.avgOrderValue != null ? `$${program.avgOrderValue}` : null },
    ].filter(item => item.value != null);

    return (
        <div className="card-premium p-8 rounded-[2rem] animate-fade-in-up delay-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                        <HiTag className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Program Details</h2>
                </div>
                <div className="relative group">
                    <HiInformationCircle className="w-5 h-5 text-[var(--text-tertiary)] cursor-help hover:text-white transition-all hover:scale-110" />
                    <div className="absolute right-0 top-full mt-3 w-72 p-4 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                                <HiInformationCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[13px] font-bold text-white">Community Added</p>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                    This information was added by the community during listing and has not been verified by the Affiliate Base team.
                                </p>
                            </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-[-5px] right-[6px] w-3 h-3 bg-[#0A0A0A] border-t border-l border-white/10 rotate-45"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {programDetails.map((item, idx) => (
                    <div
                        key={idx}
                        className="p-4 md:p-5 rounded-2xl glass border border-[var(--border)] hover:border-[var(--accent-solid)] transition-colors group"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <item.icon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-emerald-400 transition-colors shrink-0" />
                            <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider truncate">{item.label}</span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-[var(--text-primary)] break-words leading-tight">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
