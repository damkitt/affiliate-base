import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface FeaturedProgramRequest {
  programId?: string;
  programData?: Prisma.ProgramCreateInput;
}

/**
 * GET /api/programs/featured
 * Returns all active featured programs (isFeatured=true AND featuredExpiresAt > now)
 */
export async function GET() {
  const now = new Date();

  const featuredPrograms = await prisma.program.findMany({
    where: {
      approvalStatus: true,
      isFeatured: true,
      featuredExpiresAt: { gt: now },
    },
    select: {
      id: true,
      slug: true,
      programName: true,
      tagline: true,
      description: true,
      category: true,
      websiteUrl: true,
      affiliateUrl: true,
      country: true,
      logoUrl: true,
      commissionRate: true,
      commissionDuration: true,
      isFeatured: true,
      featuredExpiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(featuredPrograms);
}

export async function POST(request: Request) {
    try {
        const body: FeaturedProgramRequest = await request.json();
        const { programId, programData } = body;

        let program;

        // Calculate expiry date (30 days from now)
        const featuredExpiresAt = new Date();
        featuredExpiresAt.setDate(featuredExpiresAt.getDate() + 30);

        if (programId) {
            // Update existing program
            program = await prisma.program.update({
                where: { id: programId },
                data: {
                    isFeatured: true,
                    featuredExpiresAt,
                },
            });
        } else if (programData) {
            // Create new program with all required fields from programData
            program = await prisma.program.create({
                data: {
                    ...programData,
                    isFeatured: true,
                    featuredExpiresAt,
                },
            });
        } else {
            return NextResponse.json(
                { error: "Missing programId or programData" },
                { status: 400 }
            );
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error("Error processing featured program:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
