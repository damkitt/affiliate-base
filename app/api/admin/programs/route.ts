import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/programs
 * Retrieves programs based on query parameters
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status === "pending" ? { approvalStatus: false } : {};

  const programs = await prisma.program.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(programs);
}

/**
 * PATCH /api/admin/programs
 * Updates the approval status of a program
 */
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const approvalStatus = status === "approved";

    const program = await prisma.program.update({
      where: { id },
      data: { approvalStatus },
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error updating program status:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}
