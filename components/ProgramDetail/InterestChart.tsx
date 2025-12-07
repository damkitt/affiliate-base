"use client";

/**
 * Interest Chart Component
 * 
 * Displays program analytics with animated statistics and an area chart.
 * Fetches real data from the analytics API.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HiEye } from "react-icons/hi2";
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

const EMPTY_CHART_DATA: ChartDataPoint[] = [
  { day: "Mon", clicks: 0 },
  { day: "Tue", clicks: 0 },
  { day: "Wed", clicks: 0 },
  { day: "Thu", clicks: 0 },
  { day: "Fri", clicks: 0 },
  { day: "Sat", clicks: 0 },
  { day: "Sun", clicks: 0 },
];

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
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {payload[0].value} views
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)]" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-[var(--bg-secondary)] rounded" />
          <div className="h-3 w-40 bg-[var(--bg-secondary)] rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[var(--bg-secondary)] rounded-xl" />
        ))}
      </div>
      <div className="h-[250px] bg-[var(--bg-secondary)] rounded-xl" />
    </div>
  );
}

// =============================================================================
// Hooks
// =============================================================================

function useAnimatedCounter(target: number): number {
  const [value, setValue] = useState(target);
  const rafRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (target === 0) {
      // Use requestAnimationFrame for initial zero set to avoid sync setState
      rafRef.current = requestAnimationFrame(() => setValue(0));
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }

    startValueRef.current = 0;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || currentTime);
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const current = Math.floor(startValueRef.current + (target - startValueRef.current) * progress);
      
      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
  const totalViews = analyticsData?.totalViews ?? totalClicks;

  const animatedTotal = useAnimatedCounter(totalViews);
  const animatedToday = useAnimatedCounter(todayViews);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="card-solid p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center">
          <HiEye className="w-5 h-5 text-[var(--accent-solid)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Program Interest</h2>
          <p className="text-sm text-[var(--text-secondary)]">Weekly analytics overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Views */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]"
        >
          <p className="text-sm text-[var(--text-secondary)] mb-1">Total Views</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {animatedTotal.toLocaleString()}
          </p>
        </motion.div>

        {/* Today - Accent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-[var(--accent-solid)]/30 bg-[var(--accent-dim)]"
        >
          <p className="text-sm text-[var(--text-secondary)] mb-1">Today</p>
          <p className="text-2xl font-bold text-[var(--accent-solid)] tabular-nums">
            {animatedToday.toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="h-[250px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              width={30}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorClicks)"
              animationDuration={ANIMATION_DURATION}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-[var(--border)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-sm text-[var(--text-secondary)]">Live tracking enabled</span>
      </div>
    </div>
  );
}
