import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/admin/reports
 * Retrieves all program reports (admin only)
 */
export async function GET(request: Request): Promise<NextResponse> {
  // Verify admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status && status !== "all" 
      ? { status: status.toUpperCase() as "PENDING" | "RESOLVED" | "DISMISSED" }
      : {};

    const reports = await prisma.programReport.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            programName: true,
            logoUrl: true,
            websiteUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports
 * Updates a report status (admin only)
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  // Verify admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    if (!["PENDING", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const report = await prisma.programReport.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reports
 * Deletes a report (admin only)
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  // Verify admin authentication
  const authResult = await verifyAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    await prisma.programReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
