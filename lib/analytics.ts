// lib/analytics.ts
// Dashboard aggregation service with caching for performance

import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

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
export const getDashboardStats = unstable_cache(
    async (range: "24h" | "7d" | "30d" = "7d"): Promise<DashboardStats> => {
        try {
            const rangeStart = getDateRange(range);
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // 1. Live users
            const liveUsersResult = await prisma.trafficLog.findMany({
                where: { createdAt: { gte: tenMinutesAgo } },
                select: { ip: true },
                distinct: ["ip"],
            });
            const liveUsers = liveUsersResult.length;

            // 2. Total metrics
            const [totalViews, totalClicks, advertiseViews] = await Promise.all([
                prisma.programEvent.count({
                    where: { createdAt: { gte: rangeStart }, type: "VIEW" },
                }),
                prisma.programEvent.count({
                    where: { createdAt: { gte: rangeStart }, type: "CLICK" },
                }),
                prisma.trafficLog.count({
                    where: {
                        createdAt: { gte: rangeStart },
                        path: { startsWith: "/advertise" },
                    },
                }),
            ]);

            // 3. Traffic chart
            const isHourly = range === "24h";
            const [trafficLogs, clickEvents] = await Promise.all([
                prisma.trafficLog.findMany({
                    where: { createdAt: { gte: rangeStart } },
                    select: { createdAt: true, ip: true },
                }),
                prisma.programEvent.findMany({
                    where: { createdAt: { gte: rangeStart }, type: "CLICK" },
                    select: { createdAt: true },
                }),
            ]);

            const trafficMap = new Map<string, { visitors: Set<string>; clicks: number }>();

            trafficLogs.forEach(log => {
                const d = log.createdAt;
                const key = isHourly
                    ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
                    : d.toISOString().split("T")[0];
                const data = trafficMap.get(key) || { visitors: new Set(), clicks: 0 };
                if (log.ip) data.visitors.add(log.ip);
                trafficMap.set(key, data);
            });

            clickEvents.forEach(event => {
                const d = event.createdAt;
                const key = isHourly
                    ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
                    : d.toISOString().split("T")[0];
                const data = trafficMap.get(key) || { visitors: new Set(), clicks: 0 };
                data.clicks++;
                trafficMap.set(key, data);
            });

            const trafficChart = Array.from(trafficMap.entries())
                .map(([date, data]) => ({ date, visitors: data.visitors.size, clicks: data.clicks }))
                .sort((a, b) => a.date.localeCompare(b.date));

            // 4. Geo
            const geoStats = await prisma.trafficLog.groupBy({
                by: ["country"],
                where: { createdAt: { gte: rangeStart }, country: { not: null } },
                _count: { ip: true },
                orderBy: { _count: { ip: "desc" } },
                take: 10,
            });

            const geoReferrerStats = geoStats.map((stat) => ({
                country: stat.country || "Unknown",
                users: stat._count.ip,
                topSource: "Direct",
            }));

            // 5. Origins
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

            // 6. Top Programs
            const topProgramsResult = await prisma.program.findMany({
                select: { id: true, programName: true, slug: true, totalViews: true },
                orderBy: { totalViews: "desc" },
                take: 10,
            });

            const topPrograms: TopProgram[] = topProgramsResult.map(p => ({
                id: p.id,
                name: p.programName,
                slug: p.slug,
                views: p.totalViews || 0,
                clicks: 0,
                ctr: 0
            }));

            const clickStatsBatch = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { programId: { in: topPrograms.map(p => p.id) }, type: "CLICK" },
                _count: { id: true },
            });

            clickStatsBatch.forEach(c => {
                const p = topPrograms.find(tp => tp.id === c.programId);
                if (p) {
                    p.clicks = c._count.id;
                    p.ctr = p.views > 0 ? Math.round((p.clicks / p.views) * 100 * 10) / 10 : 0;
                }
            });

            // 7. New programs chart
            const [totalBefore, newPrograms] = await Promise.all([
                prisma.program.count({ where: { createdAt: { lt: rangeStart } } }),
                prisma.program.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true }, orderBy: { createdAt: "asc" } }),
            ]);

            const periods: string[] = [];
            let curr = new Date(rangeStart);
            while (curr <= new Date()) {
                const pKey = isHourly ? `${curr.toISOString().split("T")[0]}T${String(curr.getHours()).padStart(2, "0")}:00` : curr.toISOString().split("T")[0];
                periods.push(pKey);
                isHourly ? curr.setHours(curr.getHours() + 1) : curr.setDate(curr.getDate() + 1);
            }

            let runningTotal = totalBefore;
            const newProgramsChart = periods.map(p => {
                const added = newPrograms.filter(np => (isHourly ? `${np.createdAt.toISOString().split("T")[0]}T${String(np.createdAt.getHours()).padStart(2, "0")}:00` : np.createdAt.toISOString().split("T")[0]) === p).length;
                runningTotal += added;
                return { date: p, added, total: runningTotal };
            });

            // 8. Counts
            const [newDay, newWeek, newMonth] = await Promise.all([
                prisma.program.count({ where: { createdAt: { gte: oneDayAgo } } }),
                prisma.program.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
                prisma.program.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            ]);

            // 9. Click Breakdown
            const clickData = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { type: "CLICK", createdAt: { gte: rangeStart } },
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
                take: 20,
            });

            const programInfo = await prisma.program.findMany({
                where: { id: { in: clickData.map(c => c.programId) } },
                select: { id: true, programName: true, slug: true }
            });

            const clickBreakdown = clickData.map(c => {
                const p = programInfo.find(pn => pn.id === c.programId);
                return {
                    programId: c.programId,
                    programName: p?.programName || "Unknown",
                    slug: p?.slug || null,
                    clicks: c._count.id
                };
            });

            // 10. Searches
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

            // 11. Categories
            const viewStats = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { createdAt: { gte: rangeStart }, type: "VIEW" },
                _count: { id: true }
            });

            const pCategories = await prisma.program.findMany({
                where: { id: { in: viewStats.map(v => v.programId) } },
                select: { id: true, category: true }
            });

            const catViews = new Map<string, number>();
            viewStats.forEach(v => {
                const cat = pCategories.find(pc => pc.id === v.programId)?.category;
                if (cat) catViews.set(cat, (catViews.get(cat) || 0) + v._count.id);
            });

            const totalCatViews = Array.from(catViews.values()).reduce((a, b) => a + b, 0);
            const categoryTrends = Array.from(catViews.entries())
                .map(([category, views]) => ({
                    category,
                    views,
                    percentage: totalCatViews > 0 ? Math.round((views / totalCatViews) * 100) : 0
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            // 12. Referrers
            const trafficRefs = await prisma.trafficLog.findMany({
                where: { createdAt: { gte: rangeStart }, referrer: { not: null } },
                select: { referrer: true, ip: true },
            });
            const refMap = new Map<string, { visitors: Set<string>; clicks: number; domain: string | null }>();
            trafficRefs.forEach(log => {
                const { name, domain } = parseReferrer(log.referrer);
                const d = refMap.get(name) || { visitors: new Set(), clicks: 0, domain };
                if (log.ip) d.visitors.add(log.ip);
                refMap.set(name, d);
            });
            const referrerCTR = Array.from(refMap.entries())
                .map(([name, d]) => ({
                    source: name,
                    domain: d.domain,
                    visitors: d.visitors.size,
                    clicks: 0,
                    ctr: 0
                }))
                .sort((a, b) => b.visitors - a.visitors).slice(0, 10);

            // 13. Funnel
            const uniqueVisitorsResult = await prisma.trafficLog.findMany({
                where: { createdAt: { gte: rangeStart } },
                select: { ip: true },
                distinct: ["ip"],
            });
            const uniqueVisitors = uniqueVisitorsResult.length;
            const viewConversion = uniqueVisitors > 0 ? Math.round((totalViews / uniqueVisitors) * 100) : 0;
            const clickConversion = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

            const funnel: FunnelData = {
                steps: [
                    { name: "Visitors", value: uniqueVisitors, conversion: 100 },
                    { name: "Views", value: totalViews, conversion: viewConversion },
                    { name: "Clicks", value: totalClicks, conversion: clickConversion },
                ],
            };

            // 14. Featured
            const featuredProgramsResult = await prisma.program.findMany({
                where: { isFeatured: true },
                select: { id: true, programName: true, slug: true },
                orderBy: { programName: "asc" },
            });

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
                featuredPrograms: featuredProgramsResult.map(p => ({ id: p.id, name: p.programName, slug: p.slug })),
            };
        } catch (error) {
            console.error("[getDashboardStats] Error:", error);
            // Return safe default state
            return {
                liveUsers: 0,
                totalViews: 0,
                totalClicks: 0,
                advertiseViews: 0,
                trafficChart: [],
                geoReferrerStats: [],
                startupOrigins: [],
                topPrograms: [],
                newProgramsChart: [],
                newProgramsCount: { day: 0, week: 0, month: 0 },
                clickBreakdown: [],
                topSearches: [],
                zeroResultSearches: [],
                categoryTrends: [],
                referrerCTR: [],
                funnel: { steps: [] },
                featuredPrograms: [],
            };
        }
    },
    ["dashboard-stats-v1"],
    { revalidate: 300, tags: ["analytics"] }
);

// Parse referrer URL
function parseReferrer(referer: string | null): { name: string; domain: string | null } {
    if (!referer) return { name: "Direct", domain: null };
    try {
        const url = new URL(referer);
        const host = url.hostname.replace("www.", "");
        const domain = url.hostname;

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

// Track event (legacy)
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
    eventType?: string;
}) {
    prisma.trafficLog
        .create({
            data: {
                path: data.url || "/",
                programId: data.programId,
                referrer: data.referer,
                userAgent: data.userAgent,
                country: data.country,
            },
        })
        .catch((err) => {
            console.error("Failed to track event (legacy):", err);
        });
}

// Generate session ID
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

export const getProgramStats = unstable_cache(
    async (programId: string, range: "24h" | "7d" | "30d" = "7d"): Promise<ProgramStats> => {
        try {
            const rangeStart = getDateRange(range);

            const [views, clicks, events] = await Promise.all([
                prisma.programEvent.count({
                    where: { programId, type: "VIEW", createdAt: { gte: rangeStart } },
                }),
                prisma.programEvent.count({
                    where: { programId, type: "CLICK", createdAt: { gte: rangeStart } },
                }),
                prisma.programEvent.findMany({
                    where: { programId, createdAt: { gte: rangeStart } },
                    select: { createdAt: true, type: true, visitorId: true },
                    orderBy: { createdAt: "asc" },
                }),
            ]);

            const isHourly = range === "24h";
            const trafficByPeriod = new Map<string, { visitors: Set<string>; clicks: number }>();

            for (const event of events) {
                let periodKey: string;
                if (isHourly) {
                    const d = event.createdAt;
                    periodKey = `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`;
                } else {
                    periodKey = event.createdAt.toISOString().split("T")[0];
                }

                if (!trafficByPeriod.has(periodKey)) {
                    trafficByPeriod.set(periodKey, { visitors: new Set(), clicks: 0 });
                }
                const data = trafficByPeriod.get(periodKey)!;
                if (event.type === "VIEW") data.visitors.add(event.visitorId);
                else if (event.type === "CLICK") data.clicks++;
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
        } catch (error) {
            console.error("[getProgramStats] Error:", error);
            return {
                views: 0,
                clicks: 0,
                ctr: 0,
                trafficChart: [],
            };
        }
    },
    ["program-stats-v1"],
    { revalidate: 300, tags: ["analytics"] }
);
