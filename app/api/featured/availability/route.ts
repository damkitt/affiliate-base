import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/config";

export const dynamic = "force-dynamic"; // Do not cache as availability changes

export async function GET() {
  const now = new Date();

  const featuredPrograms = await prisma.program.findMany({
    where: {
      isFeatured: true,
      featuredExpiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
      featuredExpiresAt: true,
    },
    orderBy: {
      featuredExpiresAt: "asc",
    },
  });

  const count = featuredPrograms.length;
  const isFull = count >= config.advertising.maxSlots;

  const nextAvailable =
    isFull && featuredPrograms[0]?.featuredExpiresAt
      ? featuredPrograms[0].featuredExpiresAt.toISOString()
      : "soon";

  return NextResponse.json({
    count,
    max: config.advertising.maxSlots,
    isFull,
    nextAvailable,
  });
}
