/**
 * Program View Analytics API
 * 
 * POST: Track unique page views with anti-fraud protection
 * GET: Retrieve analytics data for charts
 */

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { pageViewsTotal, fraudBlockedTotal } from "@/lib/metrics";

// =============================================================================
// Constants
// =============================================================================

/** Time window for duplicate detection (minutes) */
const ANTI_FRAUD_WINDOW_MINUTES = 60;

/** Minimum valid fingerprint length */
const MIN_FINGERPRINT_LENGTH = 32;

/** Days of the week for chart labels */
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// =============================================================================
// Types
// =============================================================================

interface ViewRequestBody {
  fingerprint: string;
}

interface ViewResponse {
  success: boolean;
  clicksCount: number;
  duplicate: boolean;
  message?: string;
}

interface AnalyticsResponse {
  chartData: Array<{ day: string; clicks: number }>;
  totalViews: number;
  todayViews: number;
  weeklyViews: number;
}

type RouteContext = { params: Promise<{ id: string }> };

// =============================================================================
// Utility Functions
// =============================================================================

function hashIP(ip: string): string {
  const salt = process.env.IP_SALT || "affiliatebase-salt";
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .slice(0, 32);
}

function getClientIP(request: Request): string {
  // Check headers in order of reliability
  const headers = [
    "cf-connecting-ip",  // Cloudflare
    "x-real-ip",         // Nginx
    "x-forwarded-for",   // Standard proxy
  ];

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

// =============================================================================
// POST: Track View
// =============================================================================

export async function POST(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse<ViewResponse | { error: string }>> {
  try {
    const { id: programId } = await params;

    // Parse and validate request body
    const body = await request.json().catch(() => null) as ViewRequestBody | null;
    
    if (!body?.fingerprint || body.fingerprint.length < MIN_FINGERPRINT_LENGTH) {
      return NextResponse.json(
        { error: "Valid fingerprint required" },
        { status: 400 }
      );
    }

    const { fingerprint } = body;
    const ipHash = hashIP(getClientIP(request));
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const referer = request.headers.get("referer") ?? undefined;

    // Check for duplicate within time window
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - ANTI_FRAUD_WINDOW_MINUTES);

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
      // Track blocked attempt
      fraudBlockedTotal.labels({ program_id: programId, reason: "duplicate" }).inc();

      const program = await prisma.program.findUnique({
        where: { id: programId },
        select: { clicksCount: true },
      });

      return NextResponse.json({
        success: true,
        clicksCount: program?.clicksCount ?? 0,
        duplicate: true,
        message: "View already counted",
      });
    }

    // Record new event and increment counter atomically
    const [, program] = await prisma.$transaction([
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
      prisma.program.update({
        where: { id: programId },
        data: { clicksCount: { increment: 1 } },
      }),
    ]);

    // Track in Prometheus
    pageViewsTotal
      .labels({ program_id: programId, program_name: program.programName })
      .inc();

    return NextResponse.json({
      success: true,
      clicksCount: program.clicksCount,
      duplicate: false,
    });
  } catch (error) {
    console.error("[Analytics] Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET: Fetch Analytics
// =============================================================================

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse<AnalyticsResponse | { error: string }>> {
  try {
    const { id: programId } = await params;
    const sevenDaysAgo = getDateRangeStart(7);
    const todayStart = getTodayStart();

    // Fetch all data in parallel
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

    // Initialize chart data for last 7 days
    const chartData: Array<{ day: string; clicks: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      chartData.push({
        day: DAYS_OF_WEEK[date.getDay()],
        clicks: 0,
      });
    }

    // Aggregate events by day
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
