"use server";

import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "@/lib/scoring";
import { revalidatePath } from "next/cache";

export async function updateProgramBoost(id: string, boost: number) {
    try {
        // 1. Fetch current program and engagement stats to recalculate score
        const program = await prisma.program.findUnique({
            where: { id },
        });

        if (!program) throw new Error("Program not found");

        // 2. Get 14-day engagement for recalculation
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const stats = await prisma.programEvent.groupBy({
            by: ["type"],
            where: {
                programId: id,
                createdAt: { gte: fourteenDaysAgo },
            },
            _count: true,
        });

        const views = stats.find(s => s.type === 'VIEW')?._count || 0;
        const clicks = stats.find(s => s.type === 'CLICK')?._count || 0;

        // 3. Calculate new score including the NEW boost
        const newTrendingScore = calculateTrendingScore(
            { ...(program as any), manualScoreBoost: boost },
            views,
            clicks
        );

        // 4. Update DB
        await prisma.program.update({
            where: { id },
            data: {
                manualScoreBoost: boost,
                trendingScore: newTrendingScore,
            } as any,
        });

        revalidatePath("/");
        revalidatePath("/admin");

        return { success: true, newScore: newTrendingScore };
    } catch (error) {
        console.error("Failed to update boost:", error);
        return { success: false, error: "Failed to update boost" };
    }
}

import { getProgramStats } from "@/lib/analytics";

export async function getProgramManagementData(id: string, range: "24h" | "7d" | "30d" = "7d") {
    try {
        const program = await prisma.program.findUnique({
            where: { id },
        });

        if (!program) return { success: false, error: "Program not found" };

        const stats = await getProgramStats(id, range);

        return { success: true, program, stats };
    } catch (error) {
        console.error("Failed to fetch management data:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}

export async function updateProgramData(id: string, data: any) {
    try {
        // 1. Update the program
        const updatedProgram = await prisma.program.update({
            where: { id },
            data,
        });

        // 2. Recalculate score
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const stats = await prisma.programEvent.groupBy({
            by: ["type"],
            where: {
                programId: id,
                createdAt: { gte: fourteenDaysAgo },
            },
            _count: true,
        });

        const views = stats.find(s => s.type === 'VIEW')?._count || 0;
        const clicks = stats.find(s => s.type === 'CLICK')?._count || 0;

        const newTrendingScore = calculateTrendingScore(
            updatedProgram as any,
            views,
            clicks
        );

        // 3. Update score in DB
        await prisma.program.update({
            where: { id },
            data: { trendingScore: newTrendingScore },
        });

        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath(`/admin/programs/${id}`);

        return { success: true, program: updatedProgram };
    } catch (error) {
        console.error("Failed to update program:", error);
        return { success: false, error: "Failed to update" };
    }
}
