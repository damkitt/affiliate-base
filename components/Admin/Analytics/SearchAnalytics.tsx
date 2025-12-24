import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardStats } from "@/lib/analytics";
import { ChartErrorBoundary } from "../../ChartErrorBoundary";

// Chart colors for pie charts
const CHART_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

interface SearchAnalyticsProps {
    data?: DashboardStats;
    isLoading: boolean;
}

export function SearchAnalytics({ data, isLoading }: SearchAnalyticsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Searches */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                    What People Search
                </h2>
                <div className="space-y-2">
                    {isLoading ? (
                        <div className="text-white/30 text-sm py-4 text-center">Loading...</div>
                    ) : data?.topSearches?.length === 0 ? (
                        <div className="text-white/30 text-sm py-4 text-center">No searches yet</div>
                    ) : (
                        data?.topSearches?.map((search, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                                <span className="text-sm">&quot;{search.query}&quot;</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/30">
                                        {search.resultsCount} results
                                    </span>
                                    <span className="tabular-nums text-sm font-medium">
                                        {search.count}×
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Zero Results */}
                {data?.zeroResultSearches && data.zeroResultSearches.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <h3 className="text-xs text-red-400 uppercase tracking-wider mb-3">
                            ⚠️ Zero Results
                        </h3>
                        <div className="space-y-1">
                            {data.zeroResultSearches.map((search, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-red-400/80">&quot;{search.query}&quot;</span>
                                    <span className="text-xs text-white/30">{search.count}×</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Trends - Pie Chart */}
            <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                <h2 className="text-xs text-white/40 uppercase tracking-wider mb-4">
                    Category Trends
                </h2>
                {isLoading ? (
                    <div className="text-white/30 text-sm py-4 text-center">Loading...</div>
                ) : !data?.categoryTrends?.length ? (
                    <div className="text-white/30 text-sm py-4 text-center">No data yet</div>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Large Pie Chart */}
                        <div className="w-full h-48">
                            <ChartErrorBoundary>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.categoryTrends as unknown as Record<string, unknown>[]}
                                            dataKey="percentage"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {data.categoryTrends.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    className="transition-all duration-200 hover:opacity-80"
                                                    style={{ cursor: "pointer" }}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload as any; // Cast for simplicity in this context
                                                    return (
                                                        <div className="bg-black border border-white/20 rounded-lg px-3 py-2 shadow-lg">
                                                            <div className="text-sm font-medium text-white">{d.category}</div>
                                                            <div className="text-xs text-white/60">{d.percentage}%</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartErrorBoundary>
                        </div>
                        {/* Legend below */}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                            {data.categoryTrends.slice(0, 6).map((cat, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                    />
                                    <span className="text-xs text-white/60">{cat.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
