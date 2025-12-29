import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TrackSchema = z.object({
  programId: z.string().optional().nullable(),
  type: z.enum(["VIEW", "CLICK"]),
  fingerprint: z.string().optional().nullable(),
  path: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API/Track] Received Payload:", JSON.stringify(body));

    const result = TrackSchema.safeParse(body);
    if (!result.success) {
      console.error("[API/Track] Validation Failed:", result.error);
      return NextResponse.json(
        { error: "Invalid data", details: result.error },
        { status: 400 }
      );
    }

    const { programId, type, fingerprint, path } = result.data;
    const finalPath = path || "/";
    const finalFingerprint = fingerprint || "unknown_visitor";

    // Helper to get client IP
    const getIP = () => {
      const h = request.headers;
      return (
        h.get("cf-connecting-ip") ||
        h.get("x-real-ip") ||
        h.get("x-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
      );
    };
    const ip = getIP();
    const headers = request.headers;

    // 1. ALWAYS write to Rich Traffic Log (Non-blocking)
    try {
      await prisma.trafficLog.create({
        data: {
          path: finalPath,
          referrer: headers.get("referer") || null,
          userAgent: headers.get("user-agent") || null,
          country:
            headers.get("x-vercel-ip-country") ||
            headers.get("cf-ipcountry") ||
            null,
          ip: ip,
          visitorId: finalFingerprint,
          programId: programId || null,
        },
      });
    } catch (err) {
      console.error("[API/Track] TrafficLog Write Failed:", err);
      // Non-critical, continue
    }

    // 2. Strict Program Stats (Conditional & Transactional)
    if (programId && fingerprint) {
      const dateKey = new Date().toISOString().split("T")[0];

      try {
        // Verify program exists before updating stats to prevent P2025 errors in transactions
        const programExists = await prisma.program.findUnique({
          where: { id: programId },
          select: { id: true },
        });

        if (programExists) {
          await prisma.$transaction(async (tx) => {
            await tx.programEvent.create({
              data: {
                programId,
                type,
                visitorId: fingerprint,
                dateKey,
              },
            });

            if (type === "VIEW") {
              await tx.program.update({
                where: { id: programId },
                data: { totalViews: { increment: 1 } },
              });
            } else {
              await tx.program.update({
                where: { id: programId },
                data: { clicks: { increment: 1 } },
              });
            }
          });
          console.log(
            `[API/Track] Strict Event Recorded: ${type} for ${programId}`
          );
        } else {
          console.warn(
            "[API/Track] Skipping Strict Stats - Program not found:",
            programId
          );
        }
      } catch (error) {
        console.error("[API/Track] ProgramEvent Error:", error);
        return NextResponse.json({
          status: "error_logged",
          error: error,
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[API/Track] Critical Failure:", error);
    // Even on critical error, return a 200/ok to the client to avoid console spam
    return NextResponse.json({ status: "critical_failure" }, { status: 200 });
  }
}
