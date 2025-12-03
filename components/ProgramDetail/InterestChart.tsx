"use client";

/**
 * Interest Chart Component
 * 
 * Displays program analytics with animated statistics and an area chart.
 * Fetches real data from the analytics API.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HiArrowTrendingUp, HiArrowTrendingDown, HiEye } from "react-icons/hi2";
import type { AnalyticsData } from "@/types";

// =============================================================================
// Types
// =============================================================================

interface InterestChartProps {
  readonly programId: string;
  readonly totalClicks: number;
}

interface ChartDataPoint {
  day: string;
  clicks: number;
}

// =============================================================================
// Constants
// =============================================================================

const ANIMATION_DURATION = 1500;
const ANIMATION_STEPS = 60;

const EMPTY_CHART_DATA: ChartDataPoint[] = [
  { day: "Mon", clicks: 0 },
  { day: "Tue", clicks: 0 },
  { day: "Wed", clicks: 0 },
  { day: "Thu", clicks: 0 },
  { day: "Fri", clicks: 0 },
  { day: "Sat", clicks: 0 },
  { day: "Sun", clicks: 0 },
];

const MOTION_VARIANTS = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  stat: (delay: number) => ({
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, delay },
  }),
  chart: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, delay: 0.4 },
  },
};

// =============================================================================
// Sub-components
// =============================================================================

interface ChartTooltipPayload {
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {payload[0].value} views
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] animate-pulse">
      <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/3 mb-4" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-xl" />
        ))}
      </div>
      <div className="h-[200px] bg-[var(--bg-secondary)] rounded" />
    </div>
  );
}

function GrowthBadge({ growth, isPositive }: { growth: number; isPositive: boolean }) {
  const Icon = isPositive ? HiArrowTrendingUp : HiArrowTrendingDown;
  const colorClass = isPositive 
    ? "text-emerald-600 dark:text-emerald-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10">
      <Icon className={`w-4 h-4 ${isPositive ? "text-emerald-500" : "text-red-500"}`} />
      <span className={`text-sm font-semibold ${colorClass}`}>
        {isPositive ? "+" : ""}{growth}%
      </span>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  delay, 
  variant = "default" 
}: { 
  label: string; 
  value: string; 
  delay: number;
  variant?: "default" | "accent";
}) {
  const baseClass = "p-4 rounded-xl border";
  const variantClass = variant === "accent"
    ? "bg-[var(--accent-dim)] border-[var(--accent-solid)]/20"
    : "bg-[var(--bg-secondary)] border-[var(--border)]";
  const valueClass = variant === "accent"
    ? "text-[var(--accent-solid)]"
    : "text-[var(--text-primary)]";

  return (
    <motion.div {...MOTION_VARIANTS.stat(delay)} className={`${baseClass} ${variantClass}`}>
      <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</p>
    </motion.div>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-[var(--border)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="text-xs text-[var(--text-secondary)]">Live tracking enabled</span>
    </div>
  );
}

// =============================================================================
// Hooks
// =============================================================================

function useAnimatedCounter(target: number): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const increment = target / ANIMATION_STEPS;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, ANIMATION_DURATION / ANIMATION_STEPS);

    return () => clearInterval(timer);
  }, [target]);

  return value;
}

function useAnalytics(programId: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/programs/${programId}/view`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      
      const analytics: AnalyticsData = await response.json();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error };
}

// =============================================================================
// Main Component
// =============================================================================

export function InterestChart({ programId, totalClicks }: InterestChartProps) {
  const { data: analyticsData, loading } = useAnalytics(programId);

  const chartData = useMemo(() => {
    return [...(analyticsData?.chartData ?? EMPTY_CHART_DATA)];
  }, [analyticsData?.chartData]);
  
  const todayViews = analyticsData?.todayViews ?? 0;
  const weeklyViews = analyticsData?.weeklyViews ?? 0;
  const totalViews = analyticsData?.totalViews ?? totalClicks;

  const animatedTotal = useAnimatedCounter(totalViews);

  const { avgDaily, weeklyGrowth, isPositiveGrowth } = useMemo(() => {
    const avg = Math.round(weeklyViews / 7) || 1;
    const growth = weeklyViews > 0 ? Math.round((todayViews / avg - 1) * 100) : 0;
    return {
      avgDaily: avg,
      weeklyGrowth: growth,
      isPositiveGrowth: growth >= 0,
    };
  }, [weeklyViews, todayViews]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div {...MOTION_VARIANTS.container} className="p-5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center">
            <HiEye className="w-5 h-5 text-[var(--accent-solid)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Program Interest</h3>
            <p className="text-sm text-[var(--text-secondary)]">Weekly analytics overview</p>
          </div>
        </div>
        <GrowthBadge growth={weeklyGrowth} isPositive={isPositiveGrowth} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard 
          label="Total Views" 
          value={animatedTotal.toLocaleString()} 
          delay={0.1} 
        />
        <StatCard 
          label="Today" 
          value={todayViews.toLocaleString()} 
          delay={0.2} 
          variant="accent" 
        />
        <StatCard 
          label="Avg/Day" 
          value={avgDaily.toLocaleString()} 
          delay={0.3} 
        />
      </div>

      {/* Chart */}
      <motion.div {...MOTION_VARIANTS.chart} className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-solid)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-solid)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="var(--accent-solid)"
              strokeWidth={2.5}
              fill="url(#colorClicks)"
              animationDuration={ANIMATION_DURATION}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <LiveIndicator />
    </motion.div>
  );
}
