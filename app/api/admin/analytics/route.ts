// API endpoint for analytics dashboard
import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/analytics";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") as "24h" | "7d" | "30d") || "7d";

    try {
        const stats = await getDashboardStats(range);
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Analytics API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
