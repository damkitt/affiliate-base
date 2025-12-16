import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://affiliatebase.co';

    // Static routes
    const routes = [
        '',
        '/advertise',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic program routes
    const programs = await prisma.program.findMany({
        where: {
            approvalStatus: true,
            slug: {
                not: null,
            },
        },
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    const programRoutes = programs.map((program) => ({
        url: `${baseUrl}/programs/${program.slug}`,
        lastModified: program.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...programRoutes];
}
