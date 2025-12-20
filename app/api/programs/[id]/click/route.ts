/**
 * Click Tracking API
 *
 * Records affiliate link clicks with Prometheus metrics tracking.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clicksTotal, pushMetrics } from "@/lib/metrics";

// =============================================================================
// Types
// =============================================================================

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClickResponse {
  success: boolean;
}

// =============================================================================
// Handler
// =============================================================================

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const { id: programId } = await params;
    const p = await (programId.startsWith("fake-") ? { programName: `Fake ${programId.replace("fake-", "")}` } : prisma.program.findUnique({ where: { id: programId }, select: { programName: true } }));
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.analyticsEvent.create({ data: { programId, eventType: "click", fingerprint: "anonymous", ipHash: "anonymous" } });
    clicksTotal.labels({ program_id: programId, program_name: p.programName }).inc();
    await pushMetrics("clicks", { instance: "api", program_id: programId });

    return NextResponse.json({ success: true });
  } catch (err) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
