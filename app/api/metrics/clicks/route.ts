import { NextResponse } from "next/server";
import { clicksTotal } from "@/lib/metrics";

/**
 * GET /api/metrics/clicks
 * Returns a mapping of program_id -> click count from Prometheus registry.
 */
export async function GET(): Promise<NextResponse> {
  const data = await clicksTotal.get();
  const result: Record<string, number> = {};

  for (const v of data.values) {
    const pid = v.labels.program_id as string | undefined;
    if (!pid) continue;
    result[pid] = (result[pid] ?? 0) + v.value;
  }

  return NextResponse.json(result);
}
