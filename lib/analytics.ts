import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";
import { isBot } from "./bot-detection";
import {
    getStableIdentity,
    getDateRange,
    getCountryFlag,
    getFullCountryName,
    parseUserAgent,
    parseReferrer
} from "./analytics-helpers";
import type {
    DashboardStats,
    TrafficDataPoint,
    GeoReferrerStat,
    TopProgram,
    StartupOrigin,
    ClickBreakdown,
    SearchQuery,
    CategoryTrend,
    ReferrerCTR,
    FunnelData,
    DeviceStat,
    OSStat,
    FeaturedProgram,
    ProgramStats // ADDED
} from "@/types/analytics";

// Re-export for backward compatibility
export * from "@/types/analytics";
export * from "@/lib/analytics-helpers";
export * from "@/lib/bot-detection";

// Core calculation logic (separated for testing/resilience)
export async function calculateDashboardStats(range: "24h" | "7d" | "30d" = "7d"): Promise<DashboardStats> {
    try {
        const rangeStart = getDateRange(range);
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // 1. Live users (filtered for bots)
        let liveUsers = 0;
        try {
            const liveUsersResult = await prisma.trafficLog.findMany({
                where: { createdAt: { gte: tenMinutesAgo } },
                select: { id: true, visitorId: true, ip: true, userAgent: true, createdAt: true } as any,
            });
            const humanLogs = liveUsersResult.filter((l: any) => !isBot(l.userAgent));
            liveUsers = new Set(humanLogs.map((l: any) => getStableIdentity(l))).size;
        } catch (e) {
            console.error(`[${range}] Live users error:`, e);
        }

        let totalViews = 0, totalClicks = 0, advertiseViews = 0;
        try {
            const [v, c, a] = await Promise.all([
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
            totalViews = v;
            totalClicks = c;
            advertiseViews = a;
        } catch (e) {
            console.error("Total metrics error:", e);
        }

        const isHourly = range === "24h";
        let trafficChart: TrafficDataPoint[] = [];

        // ============ SINGLE SOURCE OF TRUTH ============
        // Fetch ALL traffic logs ONCE and filter bots
        // This pool is used for EVERY metric to ensure consistency
        let masterVisitorPool: any[] = [];
        let allClickEvents: any[] = [];
        let uniqueVisitors = 0;
        let bounceRate = 0;
        let avgSessionDuration = 0;
        let returnVisitorRate = 0;
        let peakHours: { hour: number; visitors: number }[] = [];

        try {
            const [trafficLogsRes, clickEventsRes] = await Promise.all([
                prisma.trafficLog.findMany({
                    where: { createdAt: { gte: rangeStart } },
                    select: { id: true, createdAt: true, ip: true, visitorId: true, userAgent: true, referrer: true, country: true, path: true } as any,
                }),
                prisma.programEvent.findMany({
                    where: { createdAt: { gte: rangeStart }, type: "CLICK" },
                    select: { createdAt: true, visitorId: true },
                }),
            ]);

            // Filter bots ONCE - this is THE definitive visitor list
            masterVisitorPool = trafficLogsRes.filter((l: any) => !isBot(l.userAgent));
            allClickEvents = clickEventsRes;

            // Calculate unique visitors (Single Source of Truth)
            const visitorSet = new Set(masterVisitorPool.map((l: any) => getStableIdentity(l)));
            uniqueVisitors = visitorSet.size;

            // Calculate Peak Hours
            const hourMap = new Map<number, Set<string>>();
            masterVisitorPool.forEach((log: any) => {
                const hour = new Date(log.createdAt).getHours();
                if (!hourMap.has(hour)) hourMap.set(hour, new Set());
                hourMap.get(hour)!.add(getStableIdentity(log));
            });
            peakHours = Array.from(hourMap.entries())
                .map(([hour, visitors]) => ({ hour, visitors: visitors.size }))
                .sort((a, b) => b.visitors - a.visitors)
                .slice(0, 5);

            // Calculate Bounce Rate (visitors who never clicked)
            const clickerSet = new Set(allClickEvents.map((e: any) => e.visitorId));
            const bouncers = Array.from(visitorSet).filter(v => !clickerSet.has(v));
            bounceRate = uniqueVisitors > 0 ? Math.round((bouncers.length / uniqueVisitors) * 100) : 0;

            // Calculate Avg Session Duration (capped at 30 minutes per Google Analytics standard)
            const SESSION_CAP_SEC = 30 * 60; // 30 minutes max
            const visitorSessions = new Map<string, { first: number; last: number }>();
            masterVisitorPool.forEach((log: any) => {
                const id = getStableIdentity(log);
                const ts = new Date(log.createdAt).getTime();
                if (!visitorSessions.has(id)) {
                    visitorSessions.set(id, { first: ts, last: ts });
                } else {
                    const sess = visitorSessions.get(id)!;
                    if (ts < sess.first) sess.first = ts;
                    if (ts > sess.last) sess.last = ts;
                }
            });
            const durations = Array.from(visitorSessions.values())
                .map(s => Math.min((s.last - s.first) / 1000, SESSION_CAP_SEC)); // Cap at 30 min
            avgSessionDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

            // Return Visitor Rate (simplified: visitors with >1 page view)
            const visitorHitCounts = new Map<string, number>();
            masterVisitorPool.forEach((log: any) => {
                const id = getStableIdentity(log);
                visitorHitCounts.set(id, (visitorHitCounts.get(id) || 0) + 1);
            });
            const returners = Array.from(visitorHitCounts.values()).filter(c => c > 1).length;
            returnVisitorRate = uniqueVisitors > 0 ? Math.round((returners / uniqueVisitors) * 100) : 0;

        } catch (e) {
            console.error("Master visitor pool error:", e);
        }

        // Build Traffic Chart from master pool
        try {
            const trafficMap = new Map<string, { visitors: Set<string>; clicks: number }>();

            masterVisitorPool.forEach((log: any) => {
                const d = log.createdAt ? new Date(log.createdAt) : null;
                if (!d || isNaN(d.getTime())) return;
                const key = isHourly
                    ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
                    : d.toISOString().split("T")[0];
                const data = trafficMap.get(key) || { visitors: new Set<string>(), clicks: 0 };
                data.visitors.add(getStableIdentity(log));
                trafficMap.set(key, data);
            });

            allClickEvents.forEach((event: any) => {
                const d = event.createdAt;
                const key = isHourly
                    ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
                    : d.toISOString().split("T")[0];
                const data = trafficMap.get(key) || { visitors: new Set(), clicks: 0 };
                data.clicks++;
                trafficMap.set(key, data);
            });

            // Fill in all time slots to ensure a continuous chart
            const fullChart: TrafficDataPoint[] = [];
            let curr = new Date(rangeStart);
            const now = new Date();
            while (curr <= now) {
                const key = isHourly
                    ? `${curr.toISOString().split("T")[0]}T${String(curr.getHours()).padStart(2, "0")}:00`
                    : curr.toISOString().split("T")[0];
                const data = trafficMap.get(key);
                fullChart.push({
                    date: key,
                    visitors: data ? data.visitors.size : 0,
                    clicks: data ? data.clicks : 0,
                });
                if (isHourly) curr.setHours(curr.getHours() + 1);
                else curr.setDate(curr.getDate() + 1);
            }
            trafficChart = fullChart;
        } catch (e) {
            console.error(`[${range}] Traffic chart error:`, e);
        }

        // Geo stats - using masterVisitorPool (bot-filtered, deduplicated)
        let geoReferrerStats: GeoReferrerStat[] = [];
        try {
            const countryMap = new Map<string, Set<string>>();

            masterVisitorPool.forEach((log: any) => {
                const country = log.country || "Other";
                const visitorId = getStableIdentity(log);

                if (!countryMap.has(country)) countryMap.set(country, new Set());
                countryMap.get(country)!.add(visitorId);
            });

            geoReferrerStats = Array.from(countryMap.entries())
                .map(([code, visitors]) => ({
                    country: getFullCountryName(code) || "Unknown",
                    code,
                    users: visitors.size,
                    topSource: "Direct",
                }))
                .sort((a, b) => b.users - a.users)
                .slice(0, 10);
        } catch (e) {
            console.error("Geo stats error:", e);
        }

        // 5. Origins
        let startupOrigins: StartupOrigin[] = [];
        try {
            const programsByCountry = await prisma.program.groupBy({
                by: ["country"],
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
                take: 10,
            });
            startupOrigins = programsByCountry.map((p) => ({
                country: p.country,
                count: p._count.id,
            }));
        } catch (e) {
            console.error("Origins error:", e);
        }

        let topPrograms: TopProgram[] = [];
        try {
            const topProgramsResult = await prisma.program.findMany({
                select: { id: true, programName: true, slug: true, totalViews: true },
                orderBy: { totalViews: "desc" },
                take: 10,
            });
            topPrograms = topProgramsResult.map((p) => ({
                id: p.id,
                name: p.programName,
                slug: p.slug,
                views: p.totalViews || 0,
                clicks: 0,
                ctr: 0,
            }));
            const clickStatsBatch = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { programId: { in: topPrograms.map((p) => p.id) }, type: "CLICK" },
                _count: { id: true },
            });
            clickStatsBatch.forEach((c) => {
                const p = topPrograms.find((tp) => tp.id === c.programId);
                if (p) {
                    p.clicks = c._count.id;
                    p.ctr = p.views > 0 ? Math.round((p.clicks / p.views) * 100 * 10) / 10 : 0;
                }
            });
        } catch (e) {
            console.error("Top programs error:", e);
        }

        let newProgramsChart: any[] = [];
        let newDay = 0, newWeek = 0, newMonth = 0;
        try {
            const [totalBefore, newPrograms] = await Promise.all([
                prisma.program.count({ where: { createdAt: { lt: rangeStart } } }),
                prisma.program.findMany({
                    where: { createdAt: { gte: rangeStart } },
                    select: { createdAt: true },
                    orderBy: { createdAt: "asc" },
                }),
            ]);
            const periods: string[] = [];
            let curr = new Date(rangeStart);
            while (curr <= new Date()) {
                const pKey = isHourly
                    ? `${curr.toISOString().split("T")[0]}T${String(curr.getHours()).padStart(2, "0")}:00`
                    : curr.toISOString().split("T")[0];
                periods.push(pKey);
                isHourly ? curr.setHours(curr.getHours() + 1) : curr.setDate(curr.getDate() + 1);
            }
            let runningTotal = totalBefore;
            newProgramsChart = periods.map((p) => {
                const added = newPrograms.filter(
                    (np) =>
                        (isHourly
                            ? `${np.createdAt.toISOString().split("T")[0]}T${String(np.createdAt.getHours()).padStart(2, "0")}:00`
                            : np.createdAt.toISOString().split("T")[0]) === p
                ).length;
                runningTotal += added;
                return { date: p, added, total: runningTotal };
            });
            const [d, w, m] = await Promise.all([
                prisma.program.count({ where: { createdAt: { gte: oneDayAgo } } }),
                prisma.program.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
                prisma.program.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            ]);
            newDay = d;
            newWeek = w;
            newMonth = m;
        } catch (e) {
            console.error("New programs error:", e);
        }

        let clickBreakdown: ClickBreakdown[] = [];
        try {
            const clickData = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { type: "CLICK", createdAt: { gte: rangeStart } },
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
                take: 20,
            });
            const programInfo = await prisma.program.findMany({
                where: { id: { in: clickData.map((c) => c.programId) } },
                select: { id: true, programName: true, slug: true },
            });
            clickBreakdown = clickData.map((c) => {
                const p = programInfo.find((pn) => pn.id === c.programId);
                return {
                    programId: c.programId,
                    programName: p?.programName || "Unknown",
                    slug: p?.slug || null,
                    clicks: c._count.id,
                };
            });
        } catch (e) {
            console.error("Click breakdown error:", e);
        }

        // 10. Searches
        let topSearches: SearchQuery[] = [], zeroResultSearches: SearchQuery[] = [];
        try {
            const searches = await prisma.searchLog.findMany({
                where: { createdAt: { gte: rangeStart } },
                select: { query: true, resultsCount: true },
            });
            const sMap = new Map<string, { count: number; res: number }>();
            searches.forEach((s) => {
                const e = sMap.get(s.query) || { count: 0, res: s.resultsCount };
                sMap.set(s.query, { count: e.count + 1, res: e.res });
            });
            const all = Array.from(sMap.entries())
                .map(([query, d]) => ({ query, count: d.count, resultsCount: d.res }))
                .sort((a, b) => b.count - a.count);
            topSearches = all.slice(0, 5);
            zeroResultSearches = all.filter((s) => s.resultsCount === 0).slice(0, 5);
        } catch { }

        // 11. Categories
        let categoryTrends: CategoryTrend[] = [];
        try {
            const viewStats = await prisma.programEvent.groupBy({
                by: ["programId"],
                where: { createdAt: { gte: rangeStart }, type: "VIEW" },
                _count: { id: true },
            });
            const pCategories = await prisma.program.findMany({
                where: { id: { in: viewStats.map((v) => v.programId) } },
                select: { id: true, category: true },
            });
            const catViews = new Map<string, number>();
            viewStats.forEach((v) => {
                const cat = pCategories.find((pc) => pc.id === v.programId)?.category;
                if (cat) catViews.set(cat, (catViews.get(cat) || 0) + v._count.id);
            });
            const totalCatViews = Array.from(catViews.values()).reduce((a, b) => a + b, 0);
            categoryTrends = Array.from(catViews.entries())
                .map(([category, views]) => ({
                    category,
                    views,
                    percentage: totalCatViews > 0 ? Math.round((views / totalCatViews) * 100) : 0,
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);
        } catch (e) {
            console.error("Category trends error:", e);
        }

        let referrerCTR: ReferrerCTR[] = [];
        try {
            const [trafficRefs, clickEvents] = await Promise.all([
                prisma.trafficLog.findMany({
                    where: { createdAt: { gte: rangeStart } },
                    select: { id: true, referrer: true, ip: true, visitorId: true, userAgent: true, createdAt: true } as any,
                }),
                prisma.programEvent.findMany({
                    where: { createdAt: { gte: rangeStart }, type: "CLICK" },
                    select: { visitorId: true },
                }),
            ]);

            const visitorToReferrer = new Map<string, string>();
            const refMap = new Map<string, { visitors: Set<string>; clicks: number; domain: string | null }>();

            // Filter bots from traffic refs
            const humanTrafficRefs = trafficRefs.filter((l: any) => !isBot(l.userAgent));

            humanTrafficRefs.forEach((log: any) => {
                const { name, domain } = parseReferrer(log.referrer);
                const d = refMap.get(name) || { visitors: new Set<string>(), clicks: 0, domain };
                const visitorId = getStableIdentity(log);
                d.visitors.add(visitorId);
                // Store the mapping for click attribution
                visitorToReferrer.set(visitorId, name);
                refMap.set(name, d);
            });

            // Attribute clicks to referrers
            clickEvents.forEach((ev: any) => {
                if (ev.visitorId) {
                    const identifier = String(ev.visitorId);
                    const refName = visitorToReferrer.get(identifier);
                    if (refName && refMap.has(refName)) {
                        refMap.get(refName)!.clicks++;
                    }
                }
            });

            referrerCTR = Array.from(refMap.entries())
                .map(([name, d]) => ({
                    source: name,
                    domain: d.domain,
                    visitors: d.visitors.size,
                    clicks: d.clicks,
                    ctr: d.visitors.size > 0 ? Math.round((d.clicks / d.visitors.size) * 100 * 10) / 10 : 0,
                }))
                .sort((a, b) => b.visitors - a.visitors)
                .slice(0, 10);
        } catch (e) {
            console.error(`[${range}] Referrer CTR error:`, e);
        }

        // Funnel now uses the same uniqueVisitors from masterVisitorPool (Single Source of Truth)
        let funnel: FunnelData = { steps: [] };
        try {
            const [viewVisitorsRes, clickVisitorsRes] = await Promise.all([
                prisma.programEvent.findMany({
                    where: { createdAt: { gte: rangeStart }, type: "VIEW" },
                    select: { visitorId: true },
                    distinct: ["visitorId", "programId"], // Count unique Views per Program
                }),
                prisma.programEvent.findMany({
                    where: { createdAt: { gte: rangeStart }, type: "CLICK" },
                    select: { visitorId: true },
                    distinct: ["visitorId", "programId"], // Count unique Clicks per Program (1 per user per program)
                }),
            ]);
            // Funnel now uses raw counts for Steps 2 & 3 to capture ALL activity (User Request)
            // Note: Step 2 (Program Views) can mathematically exceed Step 1 (Total Visitors) 
            // if TrafficLog tracking (Step 1) misses some fingerprints that ProgramEvents (Step 2) capture.
            const viewVisitorsCount = viewVisitorsRes.length;
            const clickVisitorsCount = clickVisitorsRes.length;

            // Use the SAME uniqueVisitors calculated from masterVisitorPool for Step 1
            const viewRate = uniqueVisitors > 0 ? Math.round((viewVisitorsCount / uniqueVisitors) * 100) : 0;
            const clickRate = viewVisitorsCount > 0 ? Math.round((clickVisitorsCount / viewVisitorsCount) * 100) : 0;
            funnel = {
                steps: [
                    { name: "Total Visitors", value: uniqueVisitors, conversion: 100 },
                    { name: "Program Views", value: viewVisitorsCount, conversion: viewRate },
                    { name: "Affiliate Clicks", value: clickVisitorsCount, conversion: clickRate },
                ],
            };
        } catch (e) {
            console.error(`[${range}] Funnel error:`, e);
        }

        let featuredPrograms: any[] = [];
        try {
            const featuredProgramsResult = await prisma.program.findMany({
                where: { isFeatured: true },
                select: { id: true, programName: true, slug: true },
                orderBy: { programName: "asc" },
            });
            featuredPrograms = featuredProgramsResult.map((p) => ({ id: p.id, name: p.programName, slug: p.slug }));
        } catch (e) {
            console.error("Featured programs error:", e);
        }

        // Device/OS stats - using masterVisitorPool (bot-filtered, deduplicated)
        let deviceStats: DeviceStat[] = [], osStats: OSStat[] = [];
        try {
            const deviceMap = new Map<string, Set<string>>();
            const osMap = new Map<string, Set<string>>();

            // Use masterVisitorPool to count UNIQUE visitors per device/OS
            masterVisitorPool.forEach((log: any) => {
                const { os, device } = parseUserAgent(log.userAgent);
                const visitorId = getStableIdentity(log);

                if (!deviceMap.has(device)) deviceMap.set(device, new Set());
                deviceMap.get(device)!.add(visitorId);

                if (!osMap.has(os)) osMap.set(os, new Set());
                osMap.get(os)!.add(visitorId);
            });

            deviceStats = Array.from(deviceMap.entries())
                .map(([type, visitors]) => ({
                    type,
                    count: visitors.size,
                    percentage: uniqueVisitors > 0 ? Math.round((visitors.size / uniqueVisitors) * 100) : 0,
                }))
                .sort((a, b) => b.count - a.count);

            osStats = Array.from(osMap.entries())
                .map(([name, visitors]) => ({
                    name,
                    count: visitors.size,
                    percentage: uniqueVisitors > 0 ? Math.round((visitors.size / uniqueVisitors) * 100) : 0,
                }))
                .sort((a, b) => b.count - a.count);
        } catch (e) {
            console.error("Device/OS stats error:", e);
        }

        return {
            liveUsers,
            totalViews,
            uniqueVisitors,
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
            returnVisitorRate,
            avgSessionDuration,
            bounceRate,
            peakHours,
            featuredPrograms,
            deviceStats,
            osStats,
            health: {
                dbRows: await prisma.trafficLog.count(),
                dbSizeWarning: (await prisma.trafficLog.count()) > 50000
            }
        };
    } catch (error) {
        console.error("[calculateDashboardStats] CRITICAL Error:", error);
        throw error;
    }
}

export const getDashboardStats = unstable_cache(
    async (range: "24h" | "7d" | "30d" = "7d"): Promise<DashboardStats> => {
        return calculateDashboardStats(range);
    },
    ["dashboard-stats-v16-prod-fix"], // Bump version to clear cache
    { revalidate: 30, tags: ["analytics"] }
);

/**
 * Get simple stats for a specific program (Views, Clicks, CTR)
 * Used by Admin Actions and Program Management
 */
export async function getProgramStats(programId: string, range: "24h" | "7d" | "30d" = "7d"): Promise<ProgramStats> {
    const rangeStart = getDateRange(range);
    const isHourly = range === "24h";

    // 1. Fetch Aggregates (Fast)
    const stats = await prisma.programEvent.groupBy({
        by: ["type"],
        where: {
            programId,
            createdAt: { gte: rangeStart },
        },
        _count: true,
    });

    const views = stats.find(s => s.type === 'VIEW')?._count || 0;
    const clicks = stats.find(s => s.type === 'CLICK')?._count || 0;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;

    // 2. Build Chart (Detailed)
    const events = await prisma.programEvent.findMany({
        where: {
            programId,
            createdAt: { gte: rangeStart },
        },
        select: { createdAt: true, type: true, visitorId: true }
    });

    const trafficMap = new Map<string, { visitors: Set<string>; clicks: number }>();

    events.forEach(ev => {
        const d = ev.createdAt;
        const key = isHourly
            ? `${d.toISOString().split("T")[0]}T${String(d.getHours()).padStart(2, "0")}:00`
            : d.toISOString().split("T")[0];

        const data = trafficMap.get(key) || { visitors: new Set(), clicks: 0 };

        if (ev.type === 'VIEW') {
            data.visitors.add(ev.visitorId);
        } else if (ev.type === 'CLICK') {
            data.clicks++;
        }
        trafficMap.set(key, data);
    });

    const trafficChart: TrafficDataPoint[] = [];
    let curr = new Date(rangeStart);
    const now = new Date();

    while (curr <= now) {
        const key = isHourly
            ? `${curr.toISOString().split("T")[0]}T${String(curr.getHours()).padStart(2, "0")}:00`
            : curr.toISOString().split("T")[0];

        const data = trafficMap.get(key);
        trafficChart.push({
            date: key,
            visitors: data ? data.visitors.size : 0,
            clicks: data ? data.clicks : 0,
        });

        if (isHourly) curr.setHours(curr.getHours() + 1);
        else curr.setDate(curr.getDate() + 1);
    }

    return { views, clicks, ctr, trafficChart };
}
