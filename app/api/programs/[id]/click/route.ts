/**
 * Click Tracking API
 *
 * Records affiliate link clicks with Prometheus metrics tracking.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clicksTotal, pushMetrics } from "@/lib/metrics";
import type { Program } from "@prisma/client";

// =============================================================================
// Types
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClickResponse {
  success: boolean;
  clicksCount: number;
}

// =============================================================================
// Handler
// =============================================================================

/**
 * POST /api/programs/[id]/click
 *
 * Increments the click counter for a program and tracks in Prometheus.
 * Called when user clicks an affiliate link.
 */
export async function POST(
  _request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Program ID is required" },
        { status: 400 }
      );
    }

    // Atomic increment of clicks count
    const program: Program = await prisma.program.update({
      where: { id },
      data: {
        clicksCount: { increment: 1 },
      },
    });

    // Track in Prometheus for monitoring
    clicksTotal
      .labels({
        program_id: id,
        program_name: program.programName ?? "unknown",
      })
      .inc();

    await pushMetrics("clicks", { instance: "api", program_id: id });

    const response: ClickResponse = {
      success: true,
      clicksCount: program.clicksCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/programs/:id/click]", error);

    // Check if it's a "not found" error
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
