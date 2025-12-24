import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

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

// Correct usage for dynamic args with unstable_cache:
export const getCachedProgramBySlug = unstable_cache(
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
    ["program-by-slug-v1"],
    { revalidate: 60 }
);


export const getCachedClicks = unstable_cache(
    async () => {
        try {
            // Placeholder for actual metrics logic
            return {};
        } catch (error) {
            console.error("[getCachedClicks] Error:", error);
            return {};
        }
    },
    ["metrics-clicks"],
    { revalidate: 300 }
);
