import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// в App Router params обычно не Promise, но если у тебя уже так — можно оставить
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id: programId } = await params;

    // Basic ID validation
    if (!programId || programId.length < 5) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const minDateKey = sevenDaysAgo.toISOString().split("T")[0];

    // Wrap DB calls in individual try-catch or global one with fallback
    let program;
    let dailyStats: any[] = [];

    try {
      const [_program, _dailyStats] = await Promise.all([
        prisma.program.findUnique({
          where: { id: programId },
          select: { totalViews: true, clicks: true },
        }),
        prisma.programEvent.groupBy({
          by: ["dateKey", "type"],
          where: {
            programId,
            dateKey: { gte: minDateKey },
          },
          _count: { _all: true },
        }),
      ]);
      program = _program;
      dailyStats = _dailyStats;
    } catch (dbError) {
      console.error("[API/View] DB Error:", dbError);
      // Fail gracefully: continue with empty stats rather than 500
    }

    const totalViews = program?.totalViews || 0;
    const totalClicks = program?.clicks || 0;

    // Map to chart format
    const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
    const chartData = [];
    let todayViews = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split("T")[0];
      const dayName = formatter.format(d);

      const viewStat = dailyStats.find(
        (s) => s.dateKey === k && s.type === "VIEW"
      );
      const clickStat = dailyStats.find(
        (s) => s.dateKey === k && s.type === "CLICK"
      );

      const views = viewStat ? viewStat._count._all : 0;
      if (i === 0) todayViews = views;

      chartData.push({
        day: dayName,
        views,
        clicks: clickStat ? clickStat._count._all : 0,
      });
    }

    const weeklyViews = dailyStats
      .filter((s) => s.type === "VIEW")
      .reduce((acc, curr) => acc + curr._count._all, 0);
    const weeklyClicks = dailyStats
      .filter((s) => s.type === "CLICK")
      .reduce((acc, curr) => acc + curr._count._all, 0);

    return NextResponse.json(
      {
        chartData,
        totalViews: Math.max(totalViews, todayViews),
        totalClicks: Math.max(totalClicks, weeklyClicks),
        todayViews,
        weeklyViews,
        weeklyClicks,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Analytics view fetch critical failure:", error);
    // Even on critical failure, return a safe empty state
    return NextResponse.json({
      chartData: [],
      totalViews: 0,
      totalClicks: 0,
      todayViews: 0,
      weeklyViews: 0,
      weeklyClicks: 0,
    });
  }
}
