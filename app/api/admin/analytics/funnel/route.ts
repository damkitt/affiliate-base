// API endpoint for program-specific funnel data
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");
    const range = (searchParams.get("range") as "24h" | "7d" | "30d") || "7d";

    if (!programId) {
        return NextResponse.json({ error: "programId required" }, { status: 400 });
    }

    try {
        // Calculate range start
        const now = new Date();
        let rangeStart: Date;
        switch (range) {
            case "24h":
                rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case "7d":
                rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }

        // For featured programs: Impressions = Total Site Visitors (since they're visible on homepage)
        const totalVisitorsResult = await prisma.analyticsEvent.findMany({
            where: { createdAt: { gte: rangeStart } },
            select: { fingerprint: true },
            distinct: ["fingerprint"],
        });
        const impressions = totalVisitorsResult.length;

        // Program-specific views
        const programViews = await prisma.analyticsEvent.count({
            where: {
                createdAt: { gte: rangeStart },
                programId: programId,
                eventType: "view",
            },
        });

        // Program-specific clicks
        const programClicks = await prisma.analyticsEvent.count({
            where: {
                createdAt: { gte: rangeStart },
                programId: programId,
                eventType: { in: ["click", "outbound"] },
            },
        });

        // Calculate conversion rates
        const viewConversion = impressions > 0 ? Math.round((programViews / impressions) * 100 * 10) / 10 : 0;
        const clickConversion = programViews > 0 ? Math.round((programClicks / programViews) * 100 * 10) / 10 : 0;

        return NextResponse.json({
            steps: [
                { name: "Impressions", value: impressions, conversion: 100 },
                { name: "Views", value: programViews, conversion: viewConversion },
                { name: "Clicks", value: programClicks, conversion: clickConversion },
            ],
        });
    } catch (error) {
        console.error("Funnel API error:", error);
        return NextResponse.json({ error: "Failed to fetch funnel data" }, { status: 500 });
    }
}
