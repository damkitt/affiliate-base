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
    domain: string | null;
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
    advertiseViews: number;
    trafficChart: TrafficDataPoint[];
    geoReferrerStats: GeoReferrerStat[];
    startupOrigins: StartupOrigin[];
    topPrograms: TopProgram[];
    newProgramsChart: { date: string; total: number; added: number }[];
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
    const [totalViews, totalClicks, advertiseViews] = await Promise.all([
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
        prisma.analyticsEvent.count({
            where: {
                createdAt: { gte: rangeStart },
                url: { startsWith: "/advertise" },
            },
        }),
    ]);

    // 3. Traffic chart data
    const trafficByPeriod = new Map<string, { visitors: Set<string>; clicks: number }>();
    const isHourly = range === "24h";

    (await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { createdAt: true, fingerprint: true, eventType: true },
    })).forEach(event => {
        const d = event.createdAt;
        const periodKey = isHourly
            ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
            : d.toISOString().split("T")[0];

        const data = trafficByPeriod.get(periodKey) || { visitors: new Set(), clicks: 0 };
        data.visitors.add(event.fingerprint);
        if (["click", "outbound"].includes(event.eventType || "")) data.clicks++;
        trafficByPeriod.set(periodKey, data);
    });

    const trafficChart = Array.from(trafficByPeriod.entries())
        .map(([date, data]) => ({ date, visitors: data.visitors.size, clicks: data.clicks }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 4. Geo-Referrer stats
    const countryData = new Map<string, { sessions: Set<string>; referrers: Map<string, number> }>();
    (await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart }, country: { not: null } },
        select: { country: true, fingerprint: true, referer: true },
    })).forEach(event => {
        const country = event.country || "Unknown";
        const data = countryData.get(country) || { sessions: new Set(), referrers: new Map() };
        data.sessions.add(event.fingerprint);
        const ref = parseReferrer(event.referer).name;
        data.referrers.set(ref, (data.referrers.get(ref) || 0) + 1);
        countryData.set(country, data);
    });

    const geoReferrerStats = Array.from(countryData.entries())
        .map(([country, data]) => ({
            country,
            users: data.sessions.size,
            topSource: Array.from(data.referrers.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Direct"
        }))
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
    const topPrograms: TopProgram[] = (await prisma.program.findMany({
        select: { id: true, programName: true, slug: true, totalViews: true },
        orderBy: { totalViews: "desc" },
        take: 10,
    })).map(p => ({
        id: p.id,
        name: p.programName,
        slug: p.slug,
        views: p.totalViews || 0,
        clicks: 0, // Will be filled below
        ctr: 0
    }));

    (await prisma.analyticsEvent.groupBy({
        by: ["programId"],
        where: { programId: { in: topPrograms.map(p => p.id) }, eventType: { in: ["click", "outbound"] } },
        _count: { id: true },
    })).forEach(c => {
        const p = topPrograms.find(tp => tp.id === c.programId);
        if (p) {
            p.clicks = c._count.id;
            p.ctr = p.views > 0 ? Math.round((p.clicks / p.views) * 100 * 10) / 10 : 0;
        }
    });

    // 7. New programs chart (Cumulative)
    const [totalBefore, newPrograms] = await Promise.all([
        prisma.program.count({ where: { createdAt: { lt: rangeStart } } }),
        prisma.program.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
    ]);

    const periods: string[] = [];
    let curr = new Date(rangeStart);
    while (curr <= new Date()) {
        periods.push(isHourly ? `${curr.toISOString().split("T")[0]}T${String(curr.getHours()).padStart(2, "0")}:00` : curr.toISOString().split("T")[0]);
        isHourly ? curr.setHours(curr.getHours() + 1) : curr.setDate(curr.getDate() + 1);
    }

    let runningTotal = totalBefore;
    const newProgramsChart = periods.map(p => {
        const added = newPrograms.filter(np => (isHourly ? `${np.createdAt.toISOString().split("T")[0]}T${String(np.createdAt.getHours()).padStart(2, "0")}:00` : np.createdAt.toISOString().split("T")[0]) === p).length;
        runningTotal += added;
        return { date: p, added, total: runningTotal };
    });

    // 8. New programs counts (day/week/month)
    const [newDay, newWeek, newMonth] = await Promise.all([
        prisma.program.count({ where: { createdAt: { gte: oneDayAgo } } }),
        prisma.program.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        prisma.program.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // 9. Click breakdown by program
    const clickData = await prisma.analyticsEvent.groupBy({
        by: ["programId"],
        where: { eventType: { in: ["click", "outbound"] }, programId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
    });
    const clickBreakdown = await Promise.all(clickData.map(async c => {
        const p = await prisma.program.findUnique({ where: { id: c.programId! }, select: { programName: true, slug: true } });
        return { programId: c.programId!, programName: p?.programName || "Unknown", slug: p?.slug || null, clicks: c._count.id };
    }));

    // 10. Search analytics
    let topSearches: SearchQuery[] = [], zeroResultSearches: SearchQuery[] = [];
    try {
        const searches = await prisma.searchLog.findMany({ where: { createdAt: { gte: rangeStart } }, select: { query: true, resultsCount: true } });
        const sMap = new Map<string, { count: number; res: number }>();
        searches.forEach(s => {
            const e = sMap.get(s.query) || { count: 0, res: s.resultsCount };
            sMap.set(s.query, { count: e.count + 1, res: e.res });
        });
        const all = Array.from(sMap.entries()).map(([query, d]) => ({ query, count: d.count, resultsCount: d.res })).sort((a, b) => b.count - a.count);
        topSearches = all.slice(0, 5);
        zeroResultSearches = all.filter(s => s.resultsCount === 0).slice(0, 5);
    } catch { }

    // 11. Category trends
    const catViews = new Map<string, number>();
    const events = await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart }, eventType: "view", programId: { not: null } },
        select: { programId: true }
    });
    const pIds = Array.from(new Set(events.map(e => e.programId!)));
    const programs = await prisma.program.findMany({ where: { id: { in: pIds } }, select: { id: true, category: true } });
    const idToCat = new Map(programs.map(p => [p.id, p.category]));
    events.forEach(e => {
        const cat = idToCat.get(e.programId!);
        if (cat) catViews.set(cat, (catViews.get(cat) || 0) + 1);
    });

    const totalCatViews = Array.from(catViews.values()).reduce((a, b) => a + b, 0);
    const categoryTrends = Array.from(catViews.entries())
        .map(([category, views]) => ({ category, views, percentage: totalCatViews > 0 ? Math.round((views / totalCatViews) * 100) : 0 }))
        .sort((a, b) => b.views - a.views).slice(0, 10);

    // 12. Referrer CTR
    const refMap = new Map<string, { visitors: Set<string>; clicks: number; domain: string | null }>();
    (await prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: rangeStart } },
        select: { referer: true, fingerprint: true, eventType: true }
    })).forEach(e => {
        const { name, domain } = parseReferrer(e.referer);
        const d = refMap.get(name) || { visitors: new Set(), clicks: 0, domain };
        d.visitors.add(e.fingerprint);
        if (["click", "outbound"].includes(e.eventType || "")) d.clicks++;
        refMap.set(name, d);
    });

    const referrerCTR = Array.from(refMap.entries())
        .map(([name, d]) => ({ source: name, domain: d.domain, visitors: d.visitors.size, clicks: d.clicks, ctr: d.visitors.size > 0 ? Math.round((d.clicks / d.visitors.size) * 100 * 10) / 10 : 0 }))
        .sort((a, b) => b.ctr - a.ctr).slice(0, 10);

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
        advertiseViews,
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

// Parse referrer URL to readable source name + domain
function parseReferrer(referer: string | null): { name: string; domain: string | null } {
    if (!referer) return { name: "Direct", domain: null };
    try {
        const url = new URL(referer);
        const host = url.hostname.replace("www.", "");
        const domain = url.hostname; // Keep original hostname for favicon

        if (host.includes("google")) return { name: "Google", domain };
        if (host.includes("twitter") || host.includes("t.co")) return { name: "Twitter", domain };
        if (host.includes("facebook") || host.includes("fb.com")) return { name: "Facebook", domain };
        if (host.includes("linkedin")) return { name: "LinkedIn", domain };
        if (host.includes("reddit")) return { name: "Reddit", domain };
        if (host.includes("youtube")) return { name: "YouTube", domain };
        if (host.includes("instagram")) return { name: "Instagram", domain };
        if (host.includes("tiktok")) return { name: "TikTok", domain };
        if (host.includes("bing")) return { name: "Bing", domain };
        if (host.includes("duckduckgo")) return { name: "DuckDuckGo", domain };
        if (host.includes("yandex")) return { name: "Yandex", domain };

        const name = host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
        return { name, domain };
    } catch {
        return { name: "Direct", domain: null };
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
    eventType?: string; // Optional override
}) {
    prisma.analyticsEvent
        .create({
            data: {
                sessionId: data.sessionId,
                eventName: data.eventName,
                eventType: data.eventType || data.eventName.toLowerCase(),
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
export interface ProgramStats {
    views: number;
    clicks: number;
    ctr: number;
    trafficChart: TrafficDataPoint[];
}

export async function getProgramStats(
    programId: string,
    range: "24h" | "7d" | "30d" = "7d"
): Promise<ProgramStats> {
    const rangeStart = getDateRange(range);

    const [views, clicks, events] = await Promise.all([
        prisma.analyticsEvent.count({
            where: {
                programId,
                eventType: "view",
                createdAt: { gte: rangeStart },
            },
        }),
        prisma.analyticsEvent.count({
            where: {
                programId,
                eventType: { in: ["click", "outbound"] },
                createdAt: { gte: rangeStart },
            },
        }),
        prisma.analyticsEvent.findMany({
            where: {
                programId,
                createdAt: { gte: rangeStart },
            },
            select: {
                createdAt: true,
                eventType: true,
                fingerprint: true,
            },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    // Grouping for chart
    const isHourly = range === "24h";
    const trafficByPeriod = new Map<string, { visitors: Set<string>; clicks: number }>();

    for (const event of events) {
        let periodKey: string;
        if (isHourly) {
            const date = event.createdAt;
            periodKey = `${date.toISOString().split("T")[0]}T${String(date.getHours()).padStart(2, "0")}:00`;
        } else {
            periodKey = event.createdAt.toISOString().split("T")[0];
        }

        if (!trafficByPeriod.has(periodKey)) {
            trafficByPeriod.set(periodKey, { visitors: new Set(), clicks: 0 });
        }
        const data = trafficByPeriod.get(periodKey)!;
        if (event.eventType === "view") {
            data.visitors.add(event.fingerprint);
        } else if (event.eventType === "click" || event.eventType === "outbound") {
            data.clicks++;
        }
    }

    const trafficChart: TrafficDataPoint[] = Array.from(trafficByPeriod.entries()).map(([date, data]) => ({
        date,
        visitors: data.visitors.size,
        clicks: data.clicks,
    }));

    return {
        views,
        clicks,
        ctr: views > 0 ? Math.round((clicks / views) * 100 * 10) / 10 : 0,
        trafficChart,
    };
}
