/**
 * Program CRUD API
 * 
 * Handles individual program operations: GET, PATCH, DELETE
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Program } from "@prisma/client";

// =============================================================================
// Types
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

async function extractId(params: Promise<{ id: string }>): Promise<string | null> {
  const { id } = await params;
  return id || null;
}

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /api/programs/[id]
 * Retrieves a single program by ID
 */
export async function GET(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const id = await extractId(params);

  if (!id) {
    return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
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
 * PATCH /api/programs/[id]
 * Updates a program's fields
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const id = await extractId(params);

    if (!id) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    const body = await request.json();
    
    // Destructure to remove id from update payload
    const { id: _id, createdAt: _createdAt, ...updateData } = body;

    const program = await prisma.program.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error("[PATCH /api/programs/:id]", error);
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

/**
 * DELETE /api/programs/[id]
 * Removes a program from the database
 */
export async function DELETE(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const id = await extractId(params);

    if (!id) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    // Check if program exists first
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
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
