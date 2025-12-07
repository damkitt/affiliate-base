import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface FeaturedProgramRequest {
  programId?: string;
  programData?: Prisma.ProgramCreateInput;
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
