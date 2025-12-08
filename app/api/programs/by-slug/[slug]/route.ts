import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const program = await prisma.program.findFirst({
        where: {
            slug: slug,
            approvalStatus: true,
        },
    });

    if (!program) {
        return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
}
