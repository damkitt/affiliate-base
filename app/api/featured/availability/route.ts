import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Do not cache as availability changes

export async function GET() {
    const MAX_SLOTS = 6;
    const now = new Date();

    // Find all active featured programs
    const featuredPrograms = await prisma.program.findMany({
        where: {
            isFeatured: true,
            featuredExpiresAt: {
                gt: now,
            },
        },
        select: {
            id: true,
            featuredExpiresAt: true,
        },
        orderBy: {
            featuredExpiresAt: "asc",
        },
    });

    const count = featuredPrograms.length;
    const isFull = count >= MAX_SLOTS;

    // If full, the next slot opens when the first expiration happens
    const nextAvailable = isFull && featuredPrograms[0]?.featuredExpiresAt
        ? featuredPrograms[0].featuredExpiresAt.toISOString()
        : null;

    return NextResponse.json({
        count,
        max: MAX_SLOTS,
        isFull,
        nextAvailable,
    });
}
