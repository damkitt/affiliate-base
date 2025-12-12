import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Fetches the leaderboard programs with strict caching and field selection.
 * Cached for 60 seconds to allow for rapid navigation without DB hits.
 */
export const getLeaderboardPrograms = unstable_cache(
    async () => {
        return await prisma.program.findMany({
            where: {
                approvalStatus: true,
            },
            orderBy: [
                { trendingScore: "desc" },
                { createdAt: "desc" },
            ],
            take: 50, // Limit to top 50 for initial render performance
            select: {
                id: true,
                programName: true,
                slug: true,
                logoUrl: true,
                commissionRate: true,
                commissionDuration: true,
                category: true,
                tagline: true,
                description: true, // Needed for search filtering
                isFeatured: true,
                featuredExpiresAt: true,
                createdAt: true,
                trendingScore: true,
            },
        });
    },
    ["leaderboard-programs"], // Cache key
    {
        revalidate: 60, // Revalidate every 60 seconds
        tags: ["programs"],
    }
);

/**
 * Fetches a single program by slug for the detail page.
 */
export const getProgramBySlug = unstable_cache(
    async (slug: string) => {
        return await prisma.program.findUnique({
            where: { slug },
        });
    },
    ["program-by-slug"], // Note: Dynamic key part handled by caller usually, but unstable_cache wraps a function.
    // Actually unstable_cache handles arguments if passed.
    // However, for variable arguments, it's safer to rely on the function signature.
    // Next.js unstable_cache automatically uses arguments as part of the key if configured? 
    // No, we need to pass dynamic keys if the function takes args.
    // But here we'll define the cached function inside or just wrapping the logic.
    // Actually, let's just export the raw function wrapped.
    // The cache key needs to be unique per slug.
    // `unstable_cache` supports variadic args, they become part of the key.
    {
        revalidate: 60,
        tags: ["program-detail"],
    }
);

// Correct usage for dynamic args with unstable_cache:
export const getCachedProgramBySlug = unstable_cache(
    async (slug: string) => {
        return await prisma.program.findUnique({
            where: { slug, approvalStatus: true },
        });
    },
    ["program-by-slug-v1"],
    { revalidate: 60 }
);


export const getCachedClicks = unstable_cache(
    async () => {
        // This might be a heavy aggregation, caching is good.
        // For now, we return empty or implement the actual logic if needed.
        // The original used an API route. 
        // We'll stick to API for metrics for now as they change often?
        // Actually, metrics shouldn't block the page load.
        return {};
    },
    ["metrics-clicks"],
    { revalidate: 300 }
);
