import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardStats } from "@/lib/analytics";

interface TrafficChartProps {
    data?: DashboardStats;
    isLoading: boolean;
    range: "24h" | "7d" | "30d";
}

export function TrafficChart({ data, isLoading, range }: TrafficChartProps) {
    return (
        <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
            <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                Traffic
            </h2>
            <div className="h-[250px]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-white/30 text-sm">
                        Loading...
                    </div>
                ) : data?.trafficChart?.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/30 text-sm">
                        No data yet
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.trafficChart ?? []}>
                            <defs>
                                <linearGradient
                                    id="colorVisitors"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="5%" stopColor="#fff" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#333"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (range === "24h" && value.includes("T")) {
                                        // Hourly format: show just the hour
                                        const hour = value.split("T")[1];
                                        return hour;
                                    }
                                    const date = new Date(value);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                            />
                            <YAxis
                                stroke="#333"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#111",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                }}
                                labelStyle={{ color: "#666" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                stroke="#fff"
                                strokeWidth={1}
                                fill="url(#colorVisitors)"
                                name="Visitors"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
