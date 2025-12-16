import { DashboardStats } from "@/lib/analytics";

interface StatsCardsProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Live Users */}
            <div className="p-5 rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40 uppercase tracking-wider">
                        Live
                    </span>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
                <span className="text-3xl font-light tabular-nums">
                    {isLoading ? "—" : data?.liveUsers ?? 0}
                </span>
            </div>

            {/* Total Views */}
            <div className="p-5 rounded-lg border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-3">
                    Views
                </span>
                <span className="text-3xl font-light tabular-nums">
                    {isLoading ? "—" : data?.totalViews?.toLocaleString() ?? 0}
                </span>
            </div>

            {/* Total Clicks */}
            <div className="p-5 rounded-lg border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-3">
                    Outbound Clicks
                </span>
                <span className="text-3xl font-light tabular-nums">
                    {isLoading ? "—" : data?.totalClicks?.toLocaleString() ?? 0}
                </span>
            </div>

            {/* New Programs */}
            <div className="p-5 rounded-lg border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-3">
                    New Programs
                </span>
                <div className="flex items-baseline gap-4">
                    <div>
                        <span className="text-3xl font-light tabular-nums">
                            {isLoading ? "—" : data?.newProgramsCount?.day ?? 0}
                        </span>
                        <span className="text-xs text-white/30 ml-1">today</span>
                    </div>
                    <div className="text-white/30 text-sm">
                        <span className="tabular-nums">
                            {data?.newProgramsCount?.week ?? 0}
                        </span>
                        <span className="text-xs ml-1">7d</span>
                    </div>
                    <div className="text-white/30 text-sm">
                        <span className="tabular-nums">
                            {data?.newProgramsCount?.month ?? 0}
                        </span>
                        <span className="text-xs ml-1">30d</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
