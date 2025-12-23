import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        // Secure the route with CRON_SECRET (Bearer token)
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.warn("[CRON] Unauthorized access attempt.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[CRON] Starting trending score update...");

        // 1. Get stats for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats = await prisma.programEvent.groupBy({
            by: ["programId", "type"],
            where: {
                createdAt: { gte: sevenDaysAgo },
                type: { in: ["VIEW", "CLICK"] },
            },
            _count: {
                _all: true,
            },
        });

        // 2. Map stats to program IDs
        const engagementMap = new Map<string, { views: number; clicks: number }>();
        for (const stat of stats) {
            const entry = engagementMap.get(stat.programId) || { views: 0, clicks: 0 };
            if (stat.type === "VIEW") entry.views = stat._count._all;
            if (stat.type === "CLICK") entry.clicks = stat._count._all;
            engagementMap.set(stat.programId, entry);
        }

        // 3. Fetch all programs that need updating
        const programs = await prisma.program.findMany({
            select: {
                id: true,
                programName: true,
                manualScoreBoost: true,
            },
        });

        console.log(`[CRON] Updating ${programs.length} programs...`);

        // 4. Update programs using a transaction or batch updates
        // For smaller scale, Promise.all with individual updates is fine.
        // In a massive app, we'd use raw SQL or more sophisticated batching.
        const updates = programs.map((program) => {
            const { views, clicks } = engagementMap.get(program.id) || {
                views: 0,
                clicks: 0,
            };

            const newScore = calculateTrendingScore(program, views, clicks);

            return prisma.program.update({
                where: { id: program.id },
                data: { trendingScore: newScore },
            });
        });

        await Promise.all(updates);

        console.log("[CRON] Successfully updated all program scores.");

        return NextResponse.json({
            success: true,
            updatedCount: programs.length,
        });
    } catch (error: any) {
        console.error("[CRON] Update failed:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
