import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const featuredPrograms = await prisma.program.findMany({
      where: {
        isFeatured: true,
        approvalStatus: true,
      },
      select: {
        featuredExpiresAt: true,
      },
    });

    const count = featuredPrograms.length;
    const isFull = count >= config.advertising.maxSlots;

    let nextAvailableDate: string | null = null;
    if (isFull && featuredPrograms.length > 0) {
      const expiryDates = featuredPrograms
        .map((p) => p.featuredExpiresAt)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (expiryDates.length > 0) {
        nextAvailableDate = expiryDates[0].toISOString();
      }
    }

    return NextResponse.json(
      {
        count,
        max: config.advertising.maxSlots,
        isFull,
        nextAvailableDate,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
