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

    // 2. Derive Totals from Events (always accurate)
    const totalViews = await prisma.programEvent.count({
      where: { programId, type: 'VIEW' }
    });
    const totalClicks = await prisma.programEvent.count({
      where: { programId, type: 'CLICK' }
    });

    console.log(`[API/View] Program: ${programId}, totalViews: ${totalViews}, totalClicks: ${totalClicks}`);

    // 3. Get Last 7 Days Chart Data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const minDateKey = sevenDaysAgo.toISOString().split('T')[0];

    const dailyStats = await prisma.programEvent.groupBy({
      by: ['dateKey', 'type'],
      where: {
        programId,
        dateKey: { gte: minDateKey }
      },
      _count: { _all: true }
    });

    // Map to chart format
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    const chartData = [];
    let todayViews = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const dayName = formatter.format(d);

      const viewStat = dailyStats.find(s => s.dateKey === k && s.type === 'VIEW');
      const clickStat = dailyStats.find(s => s.dateKey === k && s.type === 'CLICK');

      const views = viewStat ? viewStat._count._all : 0;
      if (i === 0) todayViews = views;

      chartData.push({
        day: dayName,
        views,
        clicks: clickStat ? clickStat._count._all : 0
      });
    }

    const weeklyViews = dailyStats.filter(s => s.type === 'VIEW').reduce((acc, curr) => acc + curr._count._all, 0);
    const weeklyClicks = dailyStats.filter(s => s.type === 'CLICK').reduce((acc, curr) => acc + curr._count._all, 0);

    return NextResponse.json({
      chartData,
      totalViews: Math.max(totalViews, todayViews),
      totalClicks: Math.max(totalClicks, weeklyClicks), // weeklyClicks is more of a sum of recent, but safe
      todayViews,
      weeklyViews,
      weeklyClicks
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error("Analytics fetch failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
