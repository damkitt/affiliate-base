"use server";

import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "@/lib/scoring";
import { revalidatePath, revalidateTag } from "next/cache";
import { minioClient, AVATAR_BUCKET } from "@/lib/minio";

export async function updateProgramBoost(id: string, boost: number) {
    try {
        // 1. Fetch current program and engagement stats to recalculate score
        const program = await prisma.program.findUnique({
            where: { id },
            select: { id: true, slug: true }
        });

        if (!program) throw new Error("Program not found");

        const slug = program.slug;

        // 2. Get 7-day stats using shared helper
        const stats = await getProgramStats(id, "7d");
        const views = stats.views;
        const clicks = stats.clicks;

        // 3. Calculate new score including the NEW boost
        const newTrendingScore = calculateTrendingScore(
            { manualScoreBoost: boost },
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

        revalidatePath("/", "layout");
        revalidatePath("/admin", "layout");
        if (slug) {
            revalidatePath(`/programs/${slug}`, "page");
            revalidatePath(`/programs/${slug}/opengraph-image`, "page");
            // @ts-ignore
            revalidateTag(`program-${slug}`);
        }

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
        // 0. Cleanup old logo if changing
        if (data.logoUrl) {
            const oldProgram = await prisma.program.findUnique({
                where: { id },
                select: { logoUrl: true }
            });

            if (oldProgram?.logoUrl && oldProgram.logoUrl !== data.logoUrl) {
                try {
                    // Extract filename from URL (e.g. https://.../avatars/filename.png)
                    const urlParts = oldProgram.logoUrl.split("/");
                    const filename = urlParts[urlParts.length - 1];
                    if (filename) {
                        await minioClient.removeObject(AVATAR_BUCKET, filename);
                    }
                } catch (e) {
                    console.error("Failed to delete old logo from storage:", e);
                    // Don't block the update if deletion fails
                }
            }
        }

        // 1. Update the program
        const updatedProgram = await prisma.program.update({
            where: { id },
            data,
        });

        // 2. Recalculate score based on 7-day window
        const stats = await getProgramStats(id, "7d");

        const newTrendingScore = calculateTrendingScore(
            updatedProgram as any,
            stats.views,
            stats.clicks
        );



        // 3. Update score in DB
        await prisma.program.update({
            where: { id },
            data: { trendingScore: newTrendingScore },
        });

        revalidatePath("/", "layout");
        revalidatePath("/admin", "layout");
        revalidatePath(`/admin/programs/${id}`, "page");
        if (updatedProgram.slug) {
            revalidatePath(`/programs/${updatedProgram.slug}`, "page");
            revalidatePath(`/programs/${updatedProgram.slug}/opengraph-image`, "page");
            // @ts-ignore
            revalidateTag(`program-${updatedProgram.slug}`);
        }

        return { success: true, program: updatedProgram };
    } catch (error) {
        console.error("Failed to update program:", error);
        return { success: false, error: "Failed to update" };
    }
}
