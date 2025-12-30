import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Fetches the leaderboard programs with strict caching and field selection.
 * The arguments passed to the cached function (like category) are automatically
 * part of the cache key in Next.js 15.
 */
export const getLeaderboardPrograms = unstable_cache(
    async (category?: string) => {
        try {
            const whereClause: any = { approvalStatus: true };
            if (category) {
                whereClause.category = category;
            }

            const allPrograms = await prisma.program.findMany({
                where: whereClause,
                orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
                take: 100,
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

            // Apply Sponsored-First Logic
            const now = new Date();
            const sponsored = allPrograms.filter(
                (p) => p.isFeatured && p.featuredExpiresAt && p.featuredExpiresAt > now
            ).slice(0, 3);

            const organic = allPrograms.filter(
                (p) => !sponsored.some((s) => s.id === p.id)
            );

            return [...sponsored, ...organic];
        } catch (error) {
            console.error("[getLeaderboardPrograms] DB Error:", error);
            return [];
        }
    },
    ["leaderboard-programs-v9"],
    { revalidate: 60, tags: ["programs", "leaderboard"] }
);

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



