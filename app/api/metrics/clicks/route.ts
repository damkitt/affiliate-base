import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "week"; 

  const now = new Date();
  const startDate = new Date();

  if (period === "day") {
    startDate.setHours(0, 0, 0, 0);
  } else {
    const day = now.getDay(); 
    const diff = now.getDate() - day;
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  }

  const aggregations = await prisma.programEvent.groupBy({
    by: ["programId"],
    where: {
      type: "CLICK",
      createdAt: {
        gte: startDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  const result: Record<string, number> = {};
  for (const agg of aggregations) {
    if (agg.programId) {
      result[agg.programId] = agg._count._all;
    }
  }

  return NextResponse.json(result);
}
