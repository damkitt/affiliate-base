"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import Link from "next/link";
import type { DashboardStats, FunnelData } from "@/lib/analytics";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then((res) => res.json());

// Chart colors for pie charts
const CHART_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

type TimeRange = "24h" | "7d" | "30d";

export default function AnalyticsPage() {
    const [range, setRange] = useState<TimeRange>("7d");
    const [selectedProgram, setSelectedProgram] = useState<string>("global");

    // Remove green gradient on this page
    useEffect(() => {
        document.body.classList.add("no-spotlight");
        return () => {
            document.body.classList.remove("no-spotlight");
        };
    }, []);

    const { data, error, isLoading } = useSWR<DashboardStats>(
        `/api/admin/analytics?range=${range}`,
        fetcher,
        { refreshInterval: 30000 }
    );

    // Fetch program-specific funnel when a program is selected
    const { data: programFunnel } = useSWR<FunnelData>(
        selectedProgram !== "global" ? `/api/admin/analytics/funnel?programId=${selectedProgram}&range=${range}` : null,
        fetcher
    );

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
                <p className="text-red-400">Failed to load analytics</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Header */}
            <header className="border-b border-white/10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/admin"
                            className="text-white/50 hover:text-white transition-colors text-sm"
                        >
                            ← Admin
                        </Link>
                        <h1 className="text-lg font-medium tracking-tight">Analytics</h1>
                    </div>
                    {/* Time Range Tabs */}
                    <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-md border border-white/10">
                        {(["24h", "7d", "30d"] as TimeRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-3 py-1 text-xs font-medium rounded transition-all ${range === r
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white"
                                    }`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Row 1: KPI Cards */}
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

                {/* Row 2: Traffic Chart */}
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

                {/* Row 3: Conversion Funnel */}
                <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs text-white/40 uppercase tracking-wider">
                            Conversion Funnel
                        </h2>
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                        >
                            <option value="global" className="bg-black">Global Overview</option>
                            {data?.featuredPrograms?.map((program) => (
                                <option key={program.id} value={program.id} className="bg-black">
                                    {program.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(() => {
                        const funnel = selectedProgram === "global" ? data?.funnel : programFunnel;
                        if (!funnel?.steps || funnel.steps.length < 3) {
                            return (
                                <div className="text-white/30 text-sm py-8 text-center">
                                    {isLoading ? "Loading..." : "No funnel data"}
                                </div>
                            );
                        }

                        const [step1, step2, step3] = funnel.steps;
                        const maxVal = Math.max(step1.value, step2.value, step3.value) || 1;

                        // Heights proportional to values (max 85% of container)
                        const h1 = (step1.value / maxVal) * 85;
                        const h2 = (step2.value / maxVal) * 85;
                        const h3 = (step3.value / maxVal) * 85;

                        return (
                            <div className="space-y-4">
                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step1.name}</div>
                                        <div className="text-2xl font-light tabular-nums">{step1.value.toLocaleString()}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step2.name}</div>
                                        <div className="text-2xl font-light tabular-nums">{step2.value.toLocaleString()}</div>
                                        <div className="text-xs text-white/30">{step2.conversion}% conv.</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-white/40 uppercase tracking-wide mb-1">{step3.name}</div>
                                        <div className="text-2xl font-light tabular-nums">{step3.value.toLocaleString()}</div>
                                        <div className="text-xs text-white/30">{step3.conversion}% conv.</div>
                                    </div>
                                </div>

                                {/* Bar Chart with smooth connections */}
                                <div className="relative h-32">
                                    <svg
                                        viewBox="0 0 300 100"
                                        className="w-full h-full"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
                                            </linearGradient>
                                            <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                                                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
                                            </linearGradient>
                                        </defs>

                                        {/* Bar 1 */}
                                        <rect
                                            x="0"
                                            y={100 - h1}
                                            width="80"
                                            height={h1}
                                            fill="url(#barGradient)"
                                            className="transition-all duration-500"
                                        />

                                        {/* Smooth connector 1->2 */}
                                        <path
                                            d={`
                                                M 80,${100 - h1}
                                                C 95,${100 - h1} 105,${100 - h2} 120,${100 - h2}
                                                L 120,100
                                                L 80,100
                                                Z
                                            `}
                                            fill="url(#connectorGradient)"
                                            className="transition-all duration-500"
                                        />

                                        {/* Bar 2 */}
                                        <rect
                                            x="120"
                                            y={100 - h2}
                                            width="60"
                                            height={h2}
                                            fill="url(#barGradient)"
                                            className="transition-all duration-500"
                                        />

                                        {/* Smooth connector 2->3 */}
                                        <path
                                            d={`
                                                M 180,${100 - h2}
                                                C 195,${100 - h2} 205,${100 - h3} 220,${100 - h3}
                                                L 220,100
                                                L 180,100
                                                Z
                                            `}
                                            fill="url(#connectorGradient)"
                                            className="transition-all duration-500"
                                        />

                                        {/* Bar 3 */}
                                        <rect
                                            x="220"
                                            y={100 - h3}
                                            width="80"
                                            height={h3}
                                            fill="url(#barGradient)"
                                            className="transition-all duration-500"
                                        />
                                    </svg>
                                </div>

                                {/* Overall conversion */}
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-white/40">Overall Conversion</span>
                                    <span className="text-sm font-medium tabular-nums">
                                        {step1.value > 0
                                            ? ((step3.value / step1.value) * 100).toFixed(2)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Row 4: Click Breakdown */}
                <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                    <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                        Outbound Clicks by Program
                    </h2>
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="text-white/30 text-sm py-4 text-center">
                                Loading...
                            </div>
                        ) : data?.clickBreakdown?.length === 0 ? (
                            <div className="text-white/30 text-sm py-4 text-center">
                                No clicks yet
                            </div>
                        ) : (
                            data?.clickBreakdown?.map((item, i) => (
                                <div
                                    key={item.programId}
                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/20 text-xs tabular-nums w-4">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-sm">
                                            {item.programName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {item.slug && (
                                            <Link
                                                href={`/programs/${item.slug}`}
                                                className="text-xs text-white/30 hover:text-white transition-colors"
                                            >
                                                View →
                                            </Link>
                                        )}
                                        <span className="tabular-nums text-sm font-medium">
                                            {item.clicks.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Row 4: Top Programs Performance */}
                <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                    <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                        Top Programs
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                                    <th className="pb-3 font-medium">#</th>
                                    <th className="pb-3 font-medium">Program</th>
                                    <th className="pb-3 font-medium text-right">Views</th>
                                    <th className="pb-3 font-medium text-right">Clicks</th>
                                    <th className="pb-3 font-medium text-right">CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-white/30">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : data?.topPrograms?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-white/30">
                                            No data yet
                                        </td>
                                    </tr>
                                ) : (
                                    data?.topPrograms?.map((program, i) => (
                                        <tr
                                            key={program.id}
                                            className="border-b border-white/5 last:border-0"
                                        >
                                            <td className="py-3 text-white/20 tabular-nums">
                                                {i + 1}
                                            </td>
                                            <td className="py-3">
                                                {program.slug ? (
                                                    <Link
                                                        href={`/programs/${program.slug}`}
                                                        className="hover:text-white/80 transition-colors"
                                                    >
                                                        {program.name}
                                                    </Link>
                                                ) : (
                                                    program.name
                                                )}
                                            </td>
                                            <td className="py-3 text-right tabular-nums text-white/70">
                                                {program.views.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right tabular-nums text-white/70">
                                                {program.clicks.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right tabular-nums">
                                                {program.ctr}%
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Row 5: Search Analytics */}
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
                                                        const d = payload[0].payload;
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

                {/* Row 6: Referrer CTR */}
                <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                    <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                        Source Quality (Referrer CTR)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-white/30 text-xs uppercase tracking-wider">
                                    <th className="pb-3 font-medium">Source</th>
                                    <th className="pb-3 font-medium text-right">Visitors</th>
                                    <th className="pb-3 font-medium text-right">Clicks</th>
                                    <th className="pb-3 font-medium text-right">CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-white/30">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : data?.referrerCTR?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-white/30">
                                            No data yet
                                        </td>
                                    </tr>
                                ) : (
                                    data?.referrerCTR?.map((ref, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0">
                                            <td className="py-3">{ref.source}</td>
                                            <td className="py-3 text-right tabular-nums text-white/70">
                                                {ref.visitors.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right tabular-nums text-white/70">
                                                {ref.clicks.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right tabular-nums">
                                                <span className={ref.ctr >= 10 ? "text-white font-medium" : ref.ctr >= 5 ? "text-white/80" : ""}>
                                                    {ref.ctr}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Row 7: Geo Stats */}
                {data?.geoReferrerStats && data.geoReferrerStats.length > 0 && (
                    <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
                        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-6">
                            Traffic by Country
                        </h2>
                        <div className="space-y-2">
                            {data.geoReferrerStats.map((stat, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                                >
                                    <span className="text-sm">{stat.country}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-white/30">
                                            via {stat.topSource}
                                        </span>
                                        <span className="tabular-nums text-sm">
                                            {stat.users.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
