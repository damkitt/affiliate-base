import { PrismaClient } from "@prisma/client";
import {
    calculateQualityScore,
    calculateTrendingScore,
} from "../lib/scoring";

const prisma = new PrismaClient();

async function main() {
    console.log("Updating trending scores for all programs...\n");

    const programs = await prisma.program.findMany();

    // Get 7-day engagement stats for all programs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await prisma.programEvent.groupBy({
        by: ["programId", "type"],
        where: {
            createdAt: { gte: sevenDaysAgo },
            type: { in: ["VIEW", "CLICK"] }
        },
        _count: true,
    });

    // Build lookup map for 7-day stats
    const engagementMap = new Map<string, { views: number; clicks: number }>();
    for (const stat of stats) {
        if (!stat.programId) continue;
        const entry = engagementMap.get(stat.programId) || { views: 0, clicks: 0 };
        if (stat.type === "VIEW") entry.views = stat._count;
        if (stat.type === "CLICK") entry.clicks = stat._count;
        engagementMap.set(stat.programId, entry);
    }

    for (const program of programs) {
        const engagement = engagementMap.get(program.id) || { views: 0, clicks: 0 };

        // Calculate new quality score
        const qualityScore = calculateQualityScore(program as any);

        // Calculate trending score (Pure Stats + Manual Boost)
        const trendingScore = calculateTrendingScore(
            program as any,
            engagement.views,
            engagement.clicks
        );

        await prisma.program.update({
            where: { id: program.id },
            data: {
                qualityScore,
                trendingScore,
            },
        });

        console.log(
            `✓ ${program.programName}: ` +
            `quality=${qualityScore}, ` +
            `stats=${engagement.views}v/${engagement.clicks}c, ` +
            `score=${trendingScore.toFixed(0)}`
        );
    }

    console.log(`\nDone! Updated ${programs.length} programs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
