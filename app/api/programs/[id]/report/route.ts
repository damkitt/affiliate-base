import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Create a report for a program
 * @param request
 * @param param1
 * @returns
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    const { type, reason, message, email, isFounder } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: "Type and message are required" },
        { status: 400 }
      );
    }

    if (!["EDIT", "REPORT"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be EDIT or REPORT" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const report = await prisma.programReport.create({
      data: {
        programId: id,
        type,
        reason: reason || null,
        message,
        email: email || null,
        isFounder: isFounder || false,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
