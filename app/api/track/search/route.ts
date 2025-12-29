import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { query, resultsCount } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    prisma.searchLog
      .create({
        data: {
          query: query.toLowerCase().trim(),
          resultsCount: resultsCount ?? 0,
        },
      })
      .catch((err) => {
        console.error("Failed to log search:", err);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track search" },
      { status: 500 }
    );
  }
}
