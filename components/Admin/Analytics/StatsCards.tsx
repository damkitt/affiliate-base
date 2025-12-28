import { DashboardStats } from "@/lib/analytics";
import {
    HiUsers,
    HiEye,
    HiCursorArrowRays,
    HiMegaphone,
    HiUserGroup,
    HiArrowTrendingDown,
    HiClock,
    HiArrowPath
} from "react-icons/hi2";

interface StatsCardsProps {
    data?: DashboardStats;
    isLoading: boolean;
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
    const primaryCards = [
        {
            label: "Live Users",
            value: data?.liveUsers ?? 0,
            icon: HiUsers,
            color: "emerald",
            isLive: true
        },
        {
            label: "Unique Visitors",
            value: data?.uniqueVisitors ?? 0,
            icon: HiUserGroup,
            color: "cyan"
        },
        {
            label: "Page Views",
            value: data?.totalViews ?? 0,
            icon: HiEye,
            color: "blue"
        },
        {
            label: "Outbound Clicks",
            value: data?.totalClicks ?? 0,
            icon: HiCursorArrowRays,
            color: "orange"
        }
    ];

    const secondaryCards = [
        {
            label: "Bounce Rate",
            value: `${data?.bounceRate ?? 0}%`,
            icon: HiArrowTrendingDown,
            color: "rose"
        },
        {
            label: "Avg Session",
            value: formatDuration(data?.avgSessionDuration ?? 0),
            icon: HiClock,
            color: "amber"
        },
        {
            label: "Return Rate",
            value: `${data?.returnVisitorRate ?? 0}%`,
            icon: HiArrowPath,
            color: "violet"
        },
        {
            label: "Advertise Interest",
            value: data?.advertiseViews ?? 0,
            icon: HiMegaphone,
            color: "purple"
        }
    ];

    const renderCard = (card: any, i: number) => (
        <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent hover:border-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-${card.color}-500/10 text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-5 h-5" />
                </div>
                {card.isLive && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <span className="text-xs font-medium text-white/30 uppercase tracking-widest">{card.label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                        {isLoading ? "—" : (typeof card.value === 'number' ? card.value.toLocaleString() : card.value)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {primaryCards.map(renderCard)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {secondaryCards.map(renderCard)}
            </div>
        </div>
    );
}

