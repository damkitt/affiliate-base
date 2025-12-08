import { PrismaClient } from "@prisma/client";
import {
    calculateQualityScore,
    calculateTrendingScore,
} from "../lib/scoring";

const prisma = new PrismaClient();

async function main() {
    console.log("Updating trending scores for all programs...\n");

    const programs = await prisma.program.findMany();

    // Get 14-day engagement stats for all programs
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const stats = await prisma.analyticsEvent.groupBy({
        by: ["programId", "eventType"],
        where: {
            createdAt: { gte: fourteenDaysAgo },
        },
        _count: true,
    });

    // Build lookup map for 14-day stats
    const engagementMap = new Map<string, { views: number; clicks: number }>();
    for (const stat of stats) {
        const entry = engagementMap.get(stat.programId) || { views: 0, clicks: 0 };
        if (stat.eventType === "view") entry.views = stat._count;
        if (stat.eventType === "click") entry.clicks = stat._count;
        engagementMap.set(stat.programId, entry);
    }

    for (const program of programs) {
        const engagement = engagementMap.get(program.id) || { views: 0, clicks: 0 };
        
        // Calculate new quality score (in case formula changed)
        const qualityScore = calculateQualityScore(program);
        
        // Calculate trending score with all components
        const trendingScore = calculateTrendingScore(
            { ...program, createdAt: program.createdAt },
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
            `engagement=${engagement.views}v/${engagement.clicks}c, ` +
            `trending=${trendingScore.toFixed(0)}`
        );
    }

    console.log(`\nDone! Updated ${programs.length} programs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
