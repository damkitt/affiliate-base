import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://affiliatebase.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all approved programs
    const programs = await prisma.program.findMany({
        where: {
            approvalStatus: true,
        },
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    // Map programs to sitemap entries
    const programEntries = programs
        .filter((p) => p.slug)
        .map((program) => ({
            url: `${BASE_URL}/programs/${program.slug}`,
            lastModified: program.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

    // Static routes
    const staticEntries = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/advertise`, // User specified /advertise in objective
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/submit`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
    ];

    return [...staticEntries, ...programEntries];
}
