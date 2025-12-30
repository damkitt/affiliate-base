import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SIMILAR_PROGRAMS_COUNT = 3;

/**
 * GET /api/programs/[id]/similar
 * Returns 3 similar programs using smart fallback:
 * 1. First, try to get programs from the same category
 * 2. If not enough, fill with top trending programs (by clickCount)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Get current program to find its category
    const currentProgram = await prisma.program.findUnique({
      where: { id },
      select: { category: true },
    });

    if (!currentProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Step 1: Get programs from the same category
    const sameCategoryPrograms = await prisma.program.findMany({
      where: {
        approvalStatus: true,
        category: currentProgram.category,
        id: { not: id },
      },
      orderBy: { createdAt: "desc" },
      take: SIMILAR_PROGRAMS_COUNT,
      select: {
        id: true,
        programName: true,
        category: true,
        logoUrl: true,
        websiteUrl: true,
        commissionRate: true,
        commissionType: true,
        tagline: true,
      },
    });

    // Step 2: If we don't have enough, fill with top trending
    const remainingSlots = SIMILAR_PROGRAMS_COUNT - sameCategoryPrograms.length;

    let trendingPrograms: typeof sameCategoryPrograms = [];

    if (remainingSlots > 0) {
      const excludeIds = [id, ...sameCategoryPrograms.map((p) => p.id)];

      trendingPrograms = await prisma.program.findMany({
        where: {
          approvalStatus: true,
          id: { notIn: excludeIds },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: remainingSlots,
        select: {
          id: true,
          programName: true,
          category: true,
          logoUrl: true,
          websiteUrl: true,
          commissionRate: true,
          commissionType: true,
          tagline: true,
        },
      });
    }

    // Combine results (same category first, then trending)
    const similarPrograms = [...sameCategoryPrograms, ...trendingPrograms];

    return NextResponse.json(similarPrograms);
  } catch (error) {
    console.error("Error fetching similar programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar programs" },
      { status: 500 }
    );
  }
}
