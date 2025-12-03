import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { pageViewsTotal, fraudBlockedTotal, pushMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

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

function hashIP(ip: string): string {
  const salt = process.env.IP_SALT || "affiliatebase-salt";
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .slice(0, 32);
}

function getClientIP(request: Request): string {
  const headers = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(",")[0].trim();
    }
  }

  return "unknown";
}

function getDateRangeStart(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function getTodayStart(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<ViewResponse | { error: string }>> {
  try {
    const { id: programId } = await params;

    const body = (await request
      .json()
      .catch(() => null)) as ViewRequestBody | null;

    if (
      !body?.fingerprint ||
      body.fingerprint.length < MIN_FINGERPRINT_LENGTH
    ) {
      return NextResponse.json(
        { error: "Valid fingerprint required" },
        { status: 400 }
      );
    }

    const { fingerprint } = body;
    const ipHash = hashIP(getClientIP(request));
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const referer = request.headers.get("referer") ?? undefined;

    const windowStart = new Date();
    windowStart.setMinutes(
      windowStart.getMinutes() - ANTI_FRAUD_WINDOW_MINUTES
    );

    const isDuplicate = await prisma.analyticsEvent.findFirst({
      where: {
        programId,
        fingerprint,
        ipHash,
        createdAt: { gte: windowStart },
      },
      select: { id: true },
    });

    if (isDuplicate) {
      fraudBlockedTotal
        .labels({ program_id: programId, reason: "duplicate" })
        .inc();

      await pushMetrics("views", {
        outcome: "duplicate",
        route: "/api/programs/[id]/view",
      });

      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "View already counted",
      });
    }

    await prisma.$transaction([
      prisma.analyticsEvent.create({
        data: {
          programId,
          eventType: "view",
          fingerprint,
          ipHash,
          userAgent,
          referer,
        },
      }),
    ]);

    // Increment Prometheus page views metric
    pageViewsTotal
      .labels({ program_id: programId, program_name: "unknown" })
      .inc();

    await pushMetrics("views", {
      outcome: "ok",
      route: "/api/programs/[id]/view",
    });

    return NextResponse.json({ success: true, duplicate: false });
  } catch (error) {
    console.error("[Analytics] Error tracking view:", error);

    await pushMetrics("views", {
      outcome: "error",
      route: "/api/programs/[id]/view",
    }).catch(() => {});

    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<AnalyticsResponse | { error: string }>> {
  try {
    const { id: programId } = await params;
    const sevenDaysAgo = getDateRangeStart(7);
    const todayStart = getTodayStart();

    const [weeklyEvents, totalViews, todayViews] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: {
          programId,
          eventType: "view",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.analyticsEvent.count({
        where: { programId, eventType: "view" },
      }),
      prisma.analyticsEvent.count({
        where: {
          programId,
          eventType: "view",
          createdAt: { gte: todayStart },
        },
      }),
    ]);

    const chartData: Array<{ day: string; clicks: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      chartData.push({
        day: DAYS_OF_WEEK[date.getDay()],
        clicks: 0,
      });
    }

    weeklyEvents.forEach((event) => {
      const dayName = DAYS_OF_WEEK[event.createdAt.getDay()];
      const dayEntry = chartData.find((d) => d.day === dayName);
      if (dayEntry) {
        dayEntry.clicks++;
      }
    });

    return NextResponse.json({
      chartData,
      totalViews,
      todayViews,
      weeklyViews: weeklyEvents.length,
    });
  } catch (error) {
    console.error("[Analytics] Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
