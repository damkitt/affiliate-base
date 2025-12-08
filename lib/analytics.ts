// lib/analytics.ts
// Dashboard aggregation service with caching for performance

import { prisma } from "./prisma";

interface TrafficDataPoint {
    date: string;
    visitors: number;
    clicks: number;
}

interface GeoReferrerStat {
    country: string;
    users: number;
    topSource: string;
}

interface TopProgram {
    id: string;
    name: string;
    slug: string | null;
    views: number;
    clicks: number;
    ctr: number;
}

interface StartupOrigin {
    country: string;
    count: number;
}

interface ClickBreakdown {
    programId: string;
    programName: string;
    slug: string | null;
    clicks: number;
}

interface SearchQuery {
    query: string;
    count: number;
    resultsCount: number;
}

interface CategoryTrend {
    category: string;
    views: number;
    percentage: number;
}

interface ReferrerCTR {
    source: string;
    visitors: number;
    clicks: number;
    ctr: number;
}

interface FunnelStep {
    name: string;
    value: number;
    conversion: number; // % from previous step
}

export interface FeaturedProgram {
    id: string;
    name: string;
    slug: string | null;
}

export interface FunnelData {
    steps: FunnelStep[];
}

export interface DashboardStats {
    liveUsers: number;
    totalViews: number;
    totalClicks: number;
    trafficChart: TrafficDataPoint[];
    geoReferrerStats: GeoReferrerStat[];
    startupOrigins: StartupOrigin[];
    topPrograms: TopProgram[];
    newProgramsChart: { date: string; count: number }[];
    newProgramsCount: { day: number; week: number; month: number };
    clickBreakdown: ClickBreakdown[];
    // New analytics
    topSearches: SearchQuery[];
    zeroResultSearches: SearchQuery[];
    categoryTrends: CategoryTrend[];
    referrerCTR: ReferrerCTR[];
    // Funnel
    funnel: FunnelData;
    featuredPrograms: FeaturedProgram[];
}

// Helper to get date range
function getDateRange(range: "24h" | "7d" | "30d"): Date {
    const now = new Date();
    switch (range) {
        case "24h":
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
}

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
    US: "🇺🇸",
    GB: "🇬🇧",
    DE: "🇩🇪",
    FR: "🇫🇷",
    IN: "🇮🇳",
    BR: "🇧🇷",
    CA: "🇨🇦",
    AU: "🇦🇺",
    JP: "🇯🇵",
    KR: "🇰🇷",
    CN: "🇨🇳",
    RU: "🇷🇺",
    ES: "🇪🇸",
    IT: "🇮🇹",
    NL: "🇳🇱",
    Other: "🌐",
};

export function getCountryFlag(code: string): string {
    return countryFlags[code] || "🌐";
}

// Dashboard stats aggregation service
export async function getDashboardStats(
    range: "24h" | "7d" | "30d" = "7d"
): Promise<DashboardStats> {
    const rangeStart = getDateRange(range);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Live users (distinct fingerprints in last 10 minutes)
    const liveUsersResult = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: tenMinutesAgo } },
        select: { fingerprint: true },
        distinct: ["fingerprint"],
    });
    const liveUsers = liveUsersResult.length;

    // 2. Total views and clicks in range (use eventType for compatibility)
    const [totalViews, totalClicks] = await Promise.all([
        prisma.analyticsEvent.count({
            where: {
                createdAt: { gte: rangeStart },
                eventType: "view",
            },
        }),
        prisma.analyticsEvent.count({
            where: {
                createdAt: { gte: rangeStart },
                eventType: { in: ["click", "outbound"] },
            },
        }),
    ]);

    // 3. Traffic chart data (grouped by hour for 24h, by day for 7d/30d)
    const trafficEvents = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: {
            createdAt: true,
            fingerprint: true,
            eventType: true,
        },
    });

    // Group by date or hour depending on range
    const isHourly = range === "24h";
    const trafficByPeriod = new Map<
        string,
        { visitors: Set<string>; clicks: number }
    >();

    for (const event of trafficEvents) {
        let periodKey: string;
        if (isHourly) {
            // Group by hour: "2024-12-08T14"
            const date = event.createdAt;
            periodKey = `${date.toISOString().split("T")[0]}T${String(date.getHours()).padStart(2, "0")}:00`;
        } else {
            // Group by day
            periodKey = event.createdAt.toISOString().split("T")[0];
        }

        if (!trafficByPeriod.has(periodKey)) {
            trafficByPeriod.set(periodKey, { visitors: new Set(), clicks: 0 });
        }
        const periodData = trafficByPeriod.get(periodKey)!;
        periodData.visitors.add(event.fingerprint);
        if (event.eventType === "click" || event.eventType === "outbound") {
            periodData.clicks++;
        }
    }

    const trafficChart: TrafficDataPoint[] = Array.from(trafficByPeriod.entries())
        .map(([date, data]) => ({
            date,
            visitors: data.visitors.size,
            clicks: data.clicks,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 4. Geo-Referrer stats
    const geoEvents = await prisma.analyticsEvent.findMany({
        where: {
            createdAt: { gte: rangeStart },
            country: { not: null },
        },
        select: {
            country: true,
            fingerprint: true,
            referer: true,
        },
    });

    // Group by country, then find top referrer
    const countryData = new Map<
        string,
        { sessions: Set<string>; referrers: Map<string, number> }
    >();

    for (const event of geoEvents) {
        const country = event.country || "Unknown";
        if (!countryData.has(country)) {
            countryData.set(country, { sessions: new Set(), referrers: new Map() });
        }
        const data = countryData.get(country)!;
        data.sessions.add(event.fingerprint);

        const referrer = parseReferrer(event.referer);
        data.referrers.set(referrer, (data.referrers.get(referrer) || 0) + 1);
    }

    const geoReferrerStats: GeoReferrerStat[] = Array.from(countryData.entries())
        .map(([country, data]) => {
            let topSource = "Direct";
            let maxCount = 0;
            for (const [source, count] of data.referrers.entries()) {
                if (count > maxCount) {
                    maxCount = count;
                    topSource = source;
                }
            }
            return {
                country,
                users: data.sessions.size,
                topSource,
            };
        })
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);

    // 5. Startup origins (programs by country)
    const programsByCountry = await prisma.program.groupBy({
        by: ["country"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
    });

    const startupOrigins: StartupOrigin[] = programsByCountry.map((p) => ({
        country: p.country,
        count: p._count.id,
    }));

    // 6. Top programs by performance
    const programs = await prisma.program.findMany({
        select: {
            id: true,
            programName: true,
            slug: true,
            totalViews: true,
        },
        orderBy: { totalViews: "desc" },
        take: 10,
    });

    // Get click counts for these programs
    const programIds = programs.map((p) => p.id);
    const clickCounts = await prisma.analyticsEvent.groupBy({
        by: ["programId"],
        where: {
            programId: { in: programIds },
            eventType: { in: ["click", "outbound"] },
        },
        _count: { id: true },
    });

    const clickMap = new Map(
        clickCounts.map((c) => [c.programId, c._count.id])
    );

    const topPrograms: TopProgram[] = programs.map((p) => {
        const clicks = clickMap.get(p.id) || 0;
        const views = p.totalViews || 0;
        return {
            id: p.id,
            name: p.programName,
            slug: p.slug,
            views,
            clicks,
            ctr: views > 0 ? Math.round((clicks / views) * 100 * 10) / 10 : 0,
        };
    });

    // 7. New programs chart
    const newPrograms = await prisma.program.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true },
    });

    const programsByDate = new Map<string, number>();
    for (const program of newPrograms) {
        const dateKey = program.createdAt.toISOString().split("T")[0];
        programsByDate.set(dateKey, (programsByDate.get(dateKey) || 0) + 1);
    }

    const newProgramsChart = Array.from(programsByDate.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 8. New programs counts (day/week/month)
    const [newDay, newWeek, newMonth] = await Promise.all([
        prisma.program.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.program.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.program.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // 9. Click breakdown by program - simpler approach
    const clickEvents = await prisma.analyticsEvent.findMany({
        where: {
            eventType: { in: ["click", "outbound"] },
        },
        select: { programId: true },
    });

    // Count clicks per program
    const clickCountMap = new Map<string, number>();
    for (const event of clickEvents) {
        if (event.programId) {
            clickCountMap.set(event.programId, (clickCountMap.get(event.programId) || 0) + 1);
        }
    }

    // Sort and take top 20
    const sortedClicks = Array.from(clickCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const clickProgramIds = sortedClicks.map(([id]) => id);

    const clickPrograms = await prisma.program.findMany({
        where: { id: { in: clickProgramIds } },
        select: { id: true, programName: true, slug: true },
    });

    const programMap = new Map(clickPrograms.map((p) => [p.id, p]));

    const clickBreakdown: ClickBreakdown[] = sortedClicks
        .filter(([id]) => programMap.has(id))
        .map(([id, clicks]) => {
            const program = programMap.get(id)!;
            return {
                programId: id,
                programName: program.programName,
                slug: program.slug,
                clicks,
            };
        });

    // 10. Search analytics
    let topSearches: SearchQuery[] = [];
    let zeroResultSearches: SearchQuery[] = [];

    try {
        const searchLogs = await prisma.searchLog.findMany({
            where: { createdAt: { gte: rangeStart } },
            select: { query: true, resultsCount: true },
        });

        // Aggregate searches by query
        const searchMap = new Map<string, { count: number; resultsCount: number }>();
        for (const log of searchLogs) {
            const existing = searchMap.get(log.query) || { count: 0, resultsCount: log.resultsCount };
            existing.count++;
            searchMap.set(log.query, existing);
        }

        const allSearches = Array.from(searchMap.entries())
            .map(([query, data]) => ({ query, count: data.count, resultsCount: data.resultsCount }))
            .sort((a, b) => b.count - a.count);

        topSearches = allSearches.slice(0, 5);
        zeroResultSearches = allSearches.filter(s => s.resultsCount === 0).slice(0, 5);
    } catch {
        // SearchLog table might not exist yet
    }

    // 11. Category trends
    const allEvents = await prisma.analyticsEvent.findMany({
        where: {
            createdAt: { gte: rangeStart },
            eventType: "view",
        },
        select: { programId: true },
    });

    const viewsByProgramId = new Map<string, number>();
    for (const event of allEvents) {
        if (event.programId) {
            viewsByProgramId.set(event.programId, (viewsByProgramId.get(event.programId) || 0) + 1);
        }
    }

    const allProgramsWithCategories = await prisma.program.findMany({
        where: { id: { in: Array.from(viewsByProgramId.keys()) } },
        select: { id: true, category: true },
    });

    const viewsByCategory = new Map<string, number>();
    for (const program of allProgramsWithCategories) {
        const views = viewsByProgramId.get(program.id) || 0;
        viewsByCategory.set(program.category, (viewsByCategory.get(program.category) || 0) + views);
    }

    const totalCategoryViews = Array.from(viewsByCategory.values()).reduce((a, b) => a + b, 0);
    const categoryTrends: CategoryTrend[] = Array.from(viewsByCategory.entries())
        .map(([category, views]) => ({
            category,
            views,
            percentage: totalCategoryViews > 0 ? Math.round((views / totalCategoryViews) * 100) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    // 12. Referrer CTR
    const referrerEvents = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { referer: true, fingerprint: true, eventType: true },
    });

    const referrerData = new Map<string, { visitors: Set<string>; clicks: number }>();
    for (const event of referrerEvents) {
        const source = parseReferrer(event.referer);
        if (!referrerData.has(source)) {
            referrerData.set(source, { visitors: new Set(), clicks: 0 });
        }
        const data = referrerData.get(source)!;
        data.visitors.add(event.fingerprint);
        if (event.eventType === "click" || event.eventType === "outbound") {
            data.clicks++;
        }
    }

    const referrerCTR: ReferrerCTR[] = Array.from(referrerData.entries())
        .map(([source, data]) => ({
            source,
            visitors: data.visitors.size,
            clicks: data.clicks,
            ctr: data.visitors.size > 0 ? Math.round((data.clicks / data.visitors.size) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 10);

    // 13. Conversion Funnel
    // Step 1: Unique Visitors (distinct fingerprints in range)
    const uniqueVisitorsResult = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { fingerprint: true },
        distinct: ["fingerprint"],
    });
    const uniqueVisitors = uniqueVisitorsResult.length;

    // Already have totalViews and totalClicks from earlier queries

    // Calculate conversion rates
    const viewConversion = uniqueVisitors > 0 ? Math.round((totalViews / uniqueVisitors) * 100) : 0;
    const clickConversion = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

    const funnel: FunnelData = {
        steps: [
            { name: "Visitors", value: uniqueVisitors, conversion: 100 },
            { name: "Views", value: totalViews, conversion: viewConversion },
            { name: "Clicks", value: totalClicks, conversion: clickConversion },
        ],
    };

    // 14. Featured Programs for dropdown
    const featuredPrograms = await prisma.program.findMany({
        where: { isFeatured: true },
        select: { id: true, programName: true, slug: true },
        orderBy: { programName: "asc" },
    });

    const featuredProgramsList: FeaturedProgram[] = featuredPrograms.map((p) => ({
        id: p.id,
        name: p.programName,
        slug: p.slug,
    }));

    return {
        liveUsers,
        totalViews,
        totalClicks,
        trafficChart,
        geoReferrerStats,
        startupOrigins,
        topPrograms,
        newProgramsChart,
        newProgramsCount: { day: newDay, week: newWeek, month: newMonth },
        clickBreakdown,
        topSearches,
        zeroResultSearches,
        categoryTrends,
        referrerCTR,
        funnel,
        featuredPrograms: featuredProgramsList,
    };
}

// Parse referrer URL to readable source name
function parseReferrer(referer: string | null): string {
    if (!referer) return "Direct";
    try {
        const url = new URL(referer);
        const host = url.hostname.replace("www.", "");

        if (host.includes("google")) return "Google";
        if (host.includes("twitter") || host.includes("t.co")) return "Twitter";
        if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
        if (host.includes("linkedin")) return "LinkedIn";
        if (host.includes("reddit")) return "Reddit";
        if (host.includes("youtube")) return "YouTube";
        if (host.includes("instagram")) return "Instagram";
        if (host.includes("tiktok")) return "TikTok";
        if (host.includes("bing")) return "Bing";
        if (host.includes("duckduckgo")) return "DuckDuckGo";

        return (
            host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1)
        );
    } catch {
        return "Direct";
    }
}

// Non-blocking event tracking
export function trackEventBackground(data: {
    sessionId: string;
    eventName: "VIEW" | "CLICK" | "OUTBOUND";
    programId?: string;
    fingerprint: string;
    ipHash: string;
    userAgent?: string;
    referer?: string;
    country?: string;
    url?: string;
    targetUrl?: string;
}) {
    prisma.analyticsEvent
        .create({
            data: {
                sessionId: data.sessionId,
                eventName: data.eventName,
                eventType: data.eventName.toLowerCase(),
                programId: data.programId ?? undefined,
                fingerprint: data.fingerprint,
                ipHash: data.ipHash,
                userAgent: data.userAgent,
                referer: data.referer,
                country: data.country,
                url: data.url,
                targetUrl: data.targetUrl,
            },
        })
        .catch((err) => {
            console.error("Failed to track event:", err);
        });
}

// Generate session ID from fingerprint + date
export function generateSessionId(fingerprint: string): string {
    const today = new Date().toISOString().split("T")[0];
    let hash = 0;
    const str = `${fingerprint}-${today}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}
