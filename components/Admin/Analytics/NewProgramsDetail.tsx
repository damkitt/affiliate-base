import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardStats } from "@/lib/analytics";

interface NewProgramsDetailProps {
    data?: DashboardStats;
    isLoading: boolean;
    range: "24h" | "7d" | "30d";
}

export function NewProgramsDetail({ data, isLoading, range }: NewProgramsDetailProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KPI Block */}
            <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between">
                <div>
                    <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold mb-8">
                        New Programs
                    </h2>
                    <div className="space-y-8">
                        <div>
                            <span className="text-6xl font-light tabular-nums leading-none">
                                {isLoading ? "—" : data?.newProgramsCount?.day ?? 0}
                            </span>
                            <span className="text-sm text-white/30 ml-3 uppercase tracking-wider">Added Today</span>
                        </div>
                        <div className="flex gap-12 pt-8 border-t border-white/5">
                            <div>
                                <span className="text-2xl font-light tabular-nums block mb-1">
                                    {isLoading ? "—" : data?.newProgramsCount?.week ?? 0}
                                </span>
                                <span className="text-[10px] text-white/30 uppercase tracking-wider">Last 7 Days</span>
                            </div>
                            <div>
                                <span className="text-2xl font-light tabular-nums block mb-1">
                                    {isLoading ? "—" : data?.newProgramsCount?.month ?? 0}
                                </span>
                                <span className="text-[10px] text-white/30 uppercase tracking-wider">Last 30 Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Block */}
            <div className="lg:col-span-2 p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs text-white/40 uppercase tracking-widest font-bold">
                        Additions Timeline
                    </h2>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest px-2 py-1 rounded border border-white/5">
                        {range === "24h" ? "Hourly View" : "Daily View"}
                    </div>
                </div>
                <div className="h-[200px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-white/30 text-xs">
                            Loading timeline...
                        </div>
                    ) : (data?.newProgramsChart?.length ?? 0) === 0 ? (
                        <div className="h-full flex items-center justify-center text-white/30 text-xs">
                            No program additions in this period
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.newProgramsChart ?? []}>
                                <defs>
                                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#333"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        if (range === "24h" && value.includes("T")) {
                                            return value.split("T")[1];
                                        }
                                        const date = new Date(value);
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#333"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    width={40}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                                                        {range === "24h" ? data.date.split("T")[1] : data.date}
                                                    </p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[11px] text-white/60">Total Programs</span>
                                                            <span className="text-[11px] font-bold text-white">{data.total}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[11px] text-emerald-500/60 font-medium">Additions</span>
                                                            <span className="text-[11px] font-bold text-emerald-400">+{data.added}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#colorNew)"
                                    name="Total Programs"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
