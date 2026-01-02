import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Fetches the leaderboard programs with strict caching and field selection.
 * The arguments passed to the cached function (like category) are automatically
 * part of the cache key in Next.js 15.
 */
export const getLeaderboardPrograms = unstable_cache(
    async (category?: string, page: number = 1, limit: number = 200) => {
        try {
            const now = new Date();
            const whereClause: any = { approvalStatus: true };
            if (category) {
                whereClause.category = category;
            }

            // 1. Fetch Featured Programs (only for Page 1)
            let featuredPrograms: any[] = [];
            if (page === 1) {
                featuredPrograms = await prisma.program.findMany({
                    where: {
                        ...whereClause,
                        isFeatured: true,
                        featuredExpiresAt: { gt: now },
                    },
                    select: {
                        id: true,
                        programName: true,
                        slug: true,
                        logoUrl: true,
                        commissionRate: true,
                        // @ts-ignore
                        commissionType: true,
                        commissionDuration: true,
                        category: true,
                        tagline: true,
                        isFeatured: true,
                        featuredExpiresAt: true,
                        createdAt: true,
                        trendingScore: true,
                    },
                });
            }

            // 2. Fetch Organic Programs
            const topPrograms = await prisma.program.findMany({
                where: whereClause,
                orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
                take: limit,
                skip: (page - 1) * limit,
                select: {
                    id: true,
                    programName: true,
                    slug: true,
                    logoUrl: true,
                    commissionRate: true,
                    // @ts-ignore
                    commissionType: true,
                    commissionDuration: true,
                    category: true,
                    tagline: true,
                    isFeatured: true,
                    featuredExpiresAt: true,
                    createdAt: true,
                    trendingScore: true,
                },
            });

            // 3. Combine and Deduplicate (Robustly)
            const dedupeMap = new Map<string, any>();

            // Fill with organic first
            topPrograms.forEach(p => dedupeMap.set(p.id, p));
            // Overwrite with featured (if any) to ensure featured fields/status are correct
            featuredPrograms.forEach(p => dedupeMap.set(p.id, p));

            // NOTE: We do NOT slice the result to the 'limit'. 
            // This is "Variant A" (Add): if featured programs are added on top of organic, 
            // the page length just grows. This ensures no programs are "swallowed" 
            // when the next page uses 'skip = (page-1) * limit'.
            const allPrograms = Array.from(dedupeMap.values());

            return processLeaderboardPrograms(allPrograms, page);
        } catch (error) {
            console.error("[getLeaderboardPrograms] DB Error:", error);
            return [];
        }
    },
    ["leaderboard-programs-v11"],
    { revalidate: 60, tags: ["programs", "leaderboard"] }
);

/**
 * Shared utility to process programs for the leaderboard:
 * 1. Filters sponsored/featured programs for the top slots
 * 2. Identifies "newcomers" (last 24h)
 * 3. Injects newcomers into the organic list at specific slots
 */
export function processLeaderboardPrograms(allPrograms: any[], page: number = 1) {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 86400000);

    // 1. Sponsored-First (Only on Page 1)
    const sponsored = page === 1
        ? allPrograms.filter((p) => p.isFeatured && p.featuredExpiresAt && new Date(p.featuredExpiresAt) > now).slice(0, 3)
        : [];

    const sponsoredIds = new Set(sponsored.map((p) => p.id));
    const organic = allPrograms.filter((p) => !sponsoredIds.has(p.id));

    // 2. Newcomers (Page 1 Only: last 24h, and not in the top 20 organic)
    const newcomers = page === 1
        ? organic
            .filter((p) => new Date(p.createdAt) >= dayAgo && !organic.slice(0, 20).some(top => top.id === p.id))
            .sort((a, b) => b.trendingScore - a.trendingScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];

    // 3. Merge Logic
    // If not Page 1, just return organic programs directly (already sorted by trendingScore from DB)
    if (page > 1) {
        return organic;
    }

    const result: any[] = [...sponsored];
    const seen = new Set(sponsored.map((p) => p.id));

    let oi = 0;
    let ni = 0;

    // NOTE: This loop completes until all organic items are accounted for.
    // Length of result = sponsored.length + organic.length.
    // This maintains "Variant A" safety for pagination.
    while (result.length < sponsored.length + organic.length) {
        const pos = result.length + 1;
        // Inject newcomers at positions 8, 13, 18...
        const isInjectionSlot = pos >= 8 && (pos - 8) % 5 === 0;

        if (isInjectionSlot && ni < newcomers.length) {
            while (ni < newcomers.length && seen.has(newcomers[ni].id)) ni++;
            if (ni < newcomers.length) {
                result.push({ ...newcomers[ni], isInjected: true });
                seen.add(newcomers[ni++].id);
                continue;
            }
        }

        while (oi < organic.length && seen.has(organic[oi].id)) oi++;
        if (oi >= organic.length) break;

        result.push(organic[oi]);
        seen.add(organic[oi++].id);
    }

    return result;
}

/**
 * Fetches a single program by slug for the detail page.
 */
export const getProgramBySlug = unstable_cache(
    async (slug: string) => {
        try {
            return await prisma.program.findUnique({
                where: { slug },
            });
        } catch (error) {
            console.error("[getProgramBySlug] DB Error:", error);
            return null;
        }
    },
    ["program-by-slug"],
    { revalidate: 60, tags: ["program-detail"] }
);

// React.cache dedupes the same DB call within a single request (Metadata + Page)
export const getCachedProgramBySlug = cache(async (slug: string) => {
    return unstable_cache(
        async (slug: string) => {
            try {
                return await prisma.program.findUnique({
                    where: { slug, approvalStatus: true },
                });
            } catch (error) {
                console.error("[getCachedProgramBySlug] DB Error:", error);
                return null;
            }
        },
        ["program-by-slug-v3", slug],
        { revalidate: 60, tags: [`program-${slug}`] }
    )(slug);
});

export const getCachedRelatedPrograms = cache(async (category: string, currentId: string) => {
    return unstable_cache(
        async (category: string, currentId: string) => {
            if (!category || category === "Not specified") {
                return [];
            }
            try {
                // 1. Fetch by Category
                let programs = await prisma.program.findMany({
                    where: {
                        category,
                        id: { not: currentId },
                        approvalStatus: true,
                    },
                    take: 3,
                    orderBy: { trendingScore: 'desc' },
                    select: {
                        id: true,
                        programName: true,
                        logoUrl: true,
                        commissionRate: true,
                        // @ts-ignore
                        commissionType: true,
                        slug: true,
                        commissionDuration: true,
                    },
                });

                // 2. Fallback if not enough
                if (programs.length < 3) {
                    const existingIds = [currentId, ...programs.map((p) => p.id)];
                    const fallbackPrograms = await prisma.program.findMany({
                        where: {
                            id: { notIn: existingIds },
                            approvalStatus: true,
                        },
                        orderBy: { trendingScore: 'desc' },
                        take: 3 - programs.length,
                        select: {
                            id: true,
                            programName: true,
                            logoUrl: true,
                            commissionRate: true,
                            commissionType: true,
                            slug: true,
                            commissionDuration: true,
                        },
                    });
                    programs = [...programs, ...fallbackPrograms];
                }
                return JSON.parse(JSON.stringify(programs)); // Serialization safety
            } catch (error) {
                console.error("[getCachedRelatedPrograms] Error:", error);
                return [];
            }
        },
        ["related-programs-v3", category, currentId],
        { revalidate: 3600, tags: [`related-${category}`] }
    )(category, currentId);
});

/**
 * Fetches all categories that have at least one approved program.
 * Optimized with high revalidation time as categories don't change often.
 */
export const getActiveCategories = unstable_cache(
    async (): Promise<string[]> => {
        try {
            const categories = await prisma.program.findMany({
                where: { approvalStatus: true },
                distinct: ["category"],
                select: { category: true },
            });
            return categories.map((c) => c.category).filter(Boolean).sort();
        } catch (error) {
            console.error("[getActiveCategories] DB Error:", error);
            return [];
        }
    },
    ["active-categories-v1"],
    { revalidate: 3600, tags: ["programs", "categories"] }
);



