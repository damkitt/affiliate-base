
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    props: { params: Promise<{ slug: string }> }
) {
    const params = await props.params;
    try {
        const slug = params.slug;

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        const program = await prisma.program.findFirst({
            where: {
                slug: slug,
                approvalStatus: true, // Only show approved programs
            },
            select: {
                programName: true,
                logoUrl: true,
                commissionRate: true,
                commissionDuration: true,
                websiteUrl: true,
            },
        });

        if (!program) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        return NextResponse.json(program);
    } catch (error) {
        console.error("[API] Get Program By Slug Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
