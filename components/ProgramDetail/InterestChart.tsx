"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { HiEye, HiArrowTrendingUp } from "react-icons/hi2";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalyticsData } from "@/types";
import { cn } from "@/lib/utils";

interface InterestChartProps {
  readonly programId: string;
  readonly totalClicks: number;
}

const EMPTY_CHART_DATA = [
  { day: "Mon", clicks: 0 },
  { day: "Tue", clicks: 0 },
  { day: "Wed", clicks: 0 },
  { day: "Thu", clicks: 0 },
  { day: "Fri", clicks: 0 },
  { day: "Sat", clicks: 0 },
  { day: "Sun", clicks: 0 },
];

function useAnalytics(programId: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/programs/${programId}/view`);
      if (response.ok) {
        const analytics: AnalyticsData = await response.json();
        setData(analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading };
}

export function InterestChart({ programId, totalClicks }: InterestChartProps) {
  const { data: analyticsData, loading } = useAnalytics(programId);
  // const containerRef = useRef<HTMLDivElement>(null); // Unused
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return (analyticsData?.chartData ?? EMPTY_CHART_DATA).slice(); // Create mutable copy
  }, [analyticsData?.chartData]);

  const totalViews = analyticsData?.totalViews ?? totalClicks;
  const todayViews = analyticsData?.todayViews ?? 0;

  if (loading) {
    return (
      <div className="h-[240px] w-full rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 animate-pulse" />
    );
  }

  return (
    <div
      className="w-full rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 p-8 shadow-xl dark:shadow-2xl relative overflow-hidden group"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 flex items-center justify-center">
          <HiEye className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-0.5">Program Interest</h2>
          <p className="text-sm text-zinc-500 font-medium">Weekly analytics overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {/* Total Views Card */}
        <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 rounded-2xl p-6 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-3">Total Views</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalViews.toLocaleString()}</p>
        </div>

        {/* Today Card */}
        <div className="bg-emerald-50/50 dark:bg-zinc-900/30 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 hover:bg-emerald-50 dark:hover:bg-emerald-900/5 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-3">Today</p>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">+{todayViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="relative h-64 w-full mb-8 select-none touch-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            onMouseMove={(e: any) => {
              if (e.activeTooltipIndex !== undefined) {
                setHoveredIndex(e.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="75%" stopColor="#10b981" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#71717a"
              strokeOpacity={0.2}
            />
            {/* Note: We use CSS variables or classes for stroke colors if possible, but Recharts is tricky. 
                 Ideally, we'd pass a prop, but for now fixed dark gray works okay on white too, or we can make it conditional.
                 Let's stick to a neutral zinc-700/30 look for grid which works on both. */}
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }} // zinc-500
              dy={10}
            />
            <YAxis
              hide
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip
              cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-3 flex flex-col items-center min-w-[100px] transform -translate-y-4">
                      <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                        {label}
                      </span>
                      <span className="text-zinc-900 dark:text-white text-lg font-bold tabular-nums leading-none">
                        {payload[0].value?.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal ml-0.5">views</span>
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#chartGradient)"
              activeDot={{
                r: 5,
                fill: "#10b981", // Green solid fill for better visibility in light mode too, or keep black/white?
                // Reference was black fill/white stroke. 
                // In light mode: White fill, Green stroke? Or just Green fill?
                // Let's go with Green fill, White stroke for universal pop.
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Separator & Live Tracking */}
      <div className="mt-4 pt-8 border-t border-zinc-100 dark:border-white/5 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">Live tracking enabled</span>
        </div>
      </div>
    </div>
  );
}
