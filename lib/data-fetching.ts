import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { cache } from "react";

/**
 * Fetches the leaderboard programs with strict caching and field selection.
 * Cached for 60 seconds to allow for rapid navigation without DB hits.
 */
export const getLeaderboardPrograms = unstable_cache(
    async () => {
        try {
            const allPrograms = await prisma.program.findMany({
                where: { approvalStatus: true },
                orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
                take: 50,
                select: {
                    id: true,
                    programName: true,
                    slug: true,
                    logoUrl: true,
                    commissionRate: true,
                    commissionDuration: true,
                    category: true,
                    tagline: true,
                    isFeatured: true,
                    featuredExpiresAt: true,
                    createdAt: true,
                    trendingScore: true,
                },
            });

            // Apply Sponsored-First Logic (must match API behavior)
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
            return []; // Fail gracefully with empty list
        }
    },
    ["leaderboard-programs-v3"], // Bump cache key version
    { revalidate: 60, tags: ["programs"] }
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
        ["program-by-slug-v2", slug],
        { revalidate: 300, tags: [`program-${slug}`] }
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
        ["related-programs-v2", category, currentId],
        { revalidate: 3600, tags: [`related-${category}`] }
    )(category, currentId);
});



