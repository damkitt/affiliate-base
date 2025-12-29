import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("[CRON] Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CRON] Starting trending score update & data sync...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rollingStats = await prisma.programEvent.groupBy({
      by: ["programId", "type"],
      where: {
        createdAt: { gte: sevenDaysAgo },
        type: { in: ["VIEW", "CLICK"] },
      },
      _count: { _all: true },
    });

    const lifetimeStats = await prisma.programEvent.groupBy({
      by: ["programId", "type"],
      where: {
        type: { in: ["VIEW", "CLICK"] },
      },
      _count: { _all: true },
    });

    const rollingMap = new Map<string, { views: number; clicks: number }>();
    for (const stat of rollingStats) {
      const entry = rollingMap.get(stat.programId) || { views: 0, clicks: 0 };
      if (stat.type === "VIEW") entry.views = stat._count._all;
      if (stat.type === "CLICK") entry.clicks = stat._count._all;
      rollingMap.set(stat.programId, entry);
    }

    const lifetimeMap = new Map<string, { views: number; clicks: number }>();
    for (const stat of lifetimeStats) {
      const entry = lifetimeMap.get(stat.programId) || { views: 0, clicks: 0 };
      if (stat.type === "VIEW") entry.views = stat._count._all;
      if (stat.type === "CLICK") entry.clicks = stat._count._all;
      lifetimeMap.set(stat.programId, entry);
    }

    const programs = await prisma.program.findMany({
      select: {
        id: true,
        programName: true,
        manualScoreBoost: true,
      },
    });

    console.log(
      `[CRON] Updating ${programs.length} programs in batches of 50...`
    );

    const CHUNK_SIZE = 50;
    let updatedCount = 0;

    for (let i = 0; i < programs.length; i += CHUNK_SIZE) {
      const chunk = programs.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (program) => {
          const rolling = rollingMap.get(program.id) || { views: 0, clicks: 0 };

          const newScore = calculateTrendingScore(
            program,
            rolling.views,
            rolling.clicks
          );

          return prisma.program.update({
            where: { id: program.id },
            data: {
              trendingScore: newScore,
            },
          });
        })
      );

      updatedCount += chunk.length;
      console.log(
        `[CRON] Processed ${updatedCount}/${programs.length} programs...`
      );
    }

    console.log(
      "[CRON] Successfully updated all program scores and healed counters."
    );

    return NextResponse.json({
      success: true,
      updatedCount: programs.length,
    });
  } catch (error) {
    console.error("[CRON] Update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
