import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Daily Cron job to prune old logs and maintain DB performance.
 * - TrafficLog: Older than 30 days
 * - ProgramEvent: Older than 90 days
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.warn("[PRUNE] Unauthorized access attempt.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        console.log("[PRUNE] Starting log pruning session...");

        const [prunedTraffic, prunedEvents, prunedSearches] = await Promise.all([
            prisma.trafficLog.deleteMany({
                where: { createdAt: { lt: thirtyDaysAgo } }
            }),
            prisma.programEvent.deleteMany({
                where: { createdAt: { lt: ninetyDaysAgo } }
            }),
            prisma.searchLog.deleteMany({
                where: { createdAt: { lt: thirtyDaysAgo } }
            })
        ]);

        console.log(`[PRUNE] Success. Pruned ${prunedTraffic.count} TrafficLogs, ${prunedEvents.count} ProgramEvents, and ${prunedSearches.count} SearchLogs.`);

        return NextResponse.json({
            success: true,
            prunedTraffic: prunedTraffic.count,
            prunedEvents: prunedEvents.count,
            prunedSearches: prunedSearches.count
        });

    } catch (error: any) {
        console.error("[PRUNE] Failed:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
