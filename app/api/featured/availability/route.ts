import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const featuredPrograms = await prisma.program.findMany({
      where: {
        isFeatured: true,
      },
      select: {
        featuredExpiresAt: true,
      },
    });

    const count = featuredPrograms.length;
    const isFull = count >= config.advertising.maxSlots;

    return NextResponse.json(
      {
        count,
        max: config.advertising.maxSlots,
        isFull,
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
