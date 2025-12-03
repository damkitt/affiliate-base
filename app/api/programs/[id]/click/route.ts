import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** * Get a Program by ID
 * @param request
 * @param param1
 * @returns {Promise<NextResponse>} The requested program
 */

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const program = await prisma.program.update({
    where: { id: id },
    data: {
      clicksCount: {
        increment: 1,
      },
    },
  });

  if (!program) {
    return NextResponse.json(
      { message: "Failed to update clicks count" },
      { status: 500 }
    );
  }

  return NextResponse.json(program);
}
