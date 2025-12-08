import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/metrics/clicks
 * Returns a mapping of program_id -> click count from Prometheus registry.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week"; // Default to week

  const now = new Date();
  const startDate = new Date();

  if (period === "day") {
    // Start of today (00:00:00)
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Start of this week (Sunday 00:00:00)
    const day = now.getDay(); // 0 is Sunday
    const diff = now.getDate() - day;
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  }

  // Aggregate clicks from Database
  const aggregations = await prisma.analyticsEvent.groupBy({
    by: ["programId"],
    where: {
      eventType: "click",
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  const result: Record<string, number> = {};
  for (const agg of aggregations) {
    if (agg.programId) {
      result[agg.programId] = agg._count._all;
    }
  }

  return NextResponse.json(result);
}
