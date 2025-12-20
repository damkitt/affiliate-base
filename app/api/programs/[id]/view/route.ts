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

const hashIP = (ip: string) => require("crypto").createHash("sha256").update(ip + (process.env.IP_SALT || "affiliatebase-salt")).digest("hex").slice(0, 32);
const getIP = (req: Request) => ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"].map(h => req.headers.get(h)).find(v => v)?.split(",")[0].trim() || "unknown";

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id: programId } = await params;
    const body = await request.json().catch(() => ({}));
    if (!body?.fingerprint || body.fingerprint.length < 32) return NextResponse.json({ error: "Invalid fingerprint" }, { status: 400 });

    const ipHash = hashIP(getIP(request)), window = new Date(Date.now() - 60 * 60 * 1000);
    const isDup = await prisma.analyticsEvent.findFirst({ where: { programId, fingerprint: body.fingerprint, ipHash, createdAt: { gte: window } }, select: { id: true } });

    if (isDup) return NextResponse.json({ success: true, duplicate: true });

    await prisma.analyticsEvent.create({ data: { programId, eventType: "view", fingerprint: body.fingerprint, ipHash, userAgent: request.headers.get("user-agent"), referer: request.headers.get("referer") } });
    pageViewsTotal.labels({ program_id: programId, program_name: "unknown" }).inc();
    await pushMetrics("views", { outcome: "ok", route: "/api/programs/[id]/view" });

    return NextResponse.json({ success: true, duplicate: false });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id: programId } = await params, sevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), today = new Date(); today.setHours(0, 0, 0, 0);
    const [weekly, total, todayCount] = await Promise.all([
      prisma.analyticsEvent.findMany({ where: { programId, eventType: { in: ["view", "click"] }, createdAt: { gte: sevenDays } }, select: { createdAt: true } }),
      prisma.analyticsEvent.count({ where: { programId, eventType: { in: ["view", "click"] } } }),
      prisma.analyticsEvent.count({ where: { programId, eventType: { in: ["view", "click"] }, createdAt: { gte: today } } }),
    ]);

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      return { day: dayName, clicks: weekly.filter(e => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][e.createdAt.getDay()] === dayName).length };
    });

    return NextResponse.json({ chartData, totalViews: total, todayViews: todayCount, weeklyViews: weekly.length });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
