import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { pageViewsTotal, fraudBlockedTotal, pushMetrics } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANTI_FRAUD_WINDOW_MINUTES = 60;
const MIN_FINGERPRINT_LENGTH = 32;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface ViewRequestBody {
  fingerprint: string;
}

interface ViewResponse {
  success: boolean;
  duplicate: boolean;
  message?: string;
}

interface AnalyticsResponse {
  chartData: Array<{ day: string; clicks: number }>;
  totalViews: number;
  todayViews: number;
  weeklyViews: number;
}

// в App Router params обычно не Promise, но если у тебя уже так — можно оставить
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id: programId } = await params;
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];

    // 1. Get totals from Program (fast access from "Current Totals" requirement)
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: { totalViews: true, clicks: true }
    });

    // 2. Get Today's Activity (Strict ProgramEvent - Views only per user request)
    const todayCount = await prisma.programEvent.count({
      where: {
        programId,
        dateKey,
        type: 'VIEW'
      }
    });

    // 3. Get Last 7 Days Chart Data (Strict ProgramEvent - Views only)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const minDateKey = sevenDaysAgo.toISOString().split('T')[0];

    // Group by DateKey from strict table
    const dailyStats = await prisma.programEvent.groupBy({
      by: ['dateKey'],
      where: {
        programId,
        dateKey: { gte: minDateKey },
        type: 'VIEW'
      },
      _count: { _all: true }
    });

    // Map to chart format, filling in missing days with 0
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const dayName = formatter.format(d);

      const stat = dailyStats.find(s => s.dateKey === k);
      chartData.push({
        day: dayName,
        clicks: stat ? stat._count._all : 0 // "clicks" key kept for frontend compatibility, but reflects Views
      });
    }

    const weeklyViews = dailyStats.reduce((acc, curr) => acc + curr._count._all, 0);
    // Total Activity for the line is just Views as requested for the chart context
    const totalActivity = program?.totalViews || 0;

    return NextResponse.json({
      chartData,
      totalViews: totalActivity,
      todayViews: todayCount,
      weeklyViews
    });
  } catch (error) {
    console.error("Analytics fetch failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
