import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanAndValidateUrl } from "@/lib/url-validator";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function extractId(
  params: Promise<{ id: string }>
): Promise<string | null> {
  const { id } = await params;
  return id || null;
}

/**
 * Get Program by ID
 * @param _request
 * @param param1
 * @returns
 */

export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const id = await extractId(params);

  if (!id) {
    return NextResponse.json(
      { error: "Program ID is required" },
      { status: 400 }
    );
  }

  const program = await prisma.program.findUnique({
    where: { id },
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}

/**
 * Update Program by ID
 * @param request
 * @param param1
 * @returns
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const id = await extractId(params);

    if (!id) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ...updateData } = body;

    try {
      if (updateData.websiteUrl) {
        updateData.websiteUrl = cleanAndValidateUrl(updateData.websiteUrl);
      }
      if (updateData.affiliateUrl) {
        updateData.affiliateUrl = cleanAndValidateUrl(updateData.affiliateUrl);
      }
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    if (updateData.programName && updateData.programName.length > 30) {
      return NextResponse.json(
        { error: "Program name must be 30 characters or less." },
        { status: 400 }
      );
    }

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("[PATCH /api/programs/:id]", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

/**
 * Delete Program by ID
 * @param _request
 * @param param1
 * @returns
 */

export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const id = await extractId(params);

    if (!id) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    const exists = await prisma.program.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/programs/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
