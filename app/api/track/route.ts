
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TrackSchema = z.object({
    programId: z.string().optional().nullable(),
    type: z.enum(['VIEW', 'CLICK']),
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
            return NextResponse.json({ error: 'Invalid data', details: result.error }, { status: 400 });
        }

        const { programId, type, fingerprint, path } = result.data;
        const finalPath = path || '/';
        const finalFingerprint = fingerprint || 'unknown_visitor';
        const headers = request.headers;

        // 1. ALWAYS write to Rich Traffic Log
        // Await to ensure it writes before response
        try {
            await prisma.trafficLog.create({
                data: {
                    path: finalPath,
                    referrer: headers.get('referer') || null,
                    userAgent: headers.get('user-agent') || null,
                    country: headers.get('x-vercel-ip-country') || null,
                    programId: programId || null,
                }
            });
            console.log("[API/Track] TrafficLog written");
        } catch (err) {
            console.error("[API/Track] TrafficLog Write Failed:", err);
        }

        // 2. Strict Program Stats
        if (programId && fingerprint) {
            const dateKey = new Date().toISOString().split('T')[0];

            try {
                await prisma.$transaction(async (tx) => {
                    await tx.programEvent.create({
                        data: {
                            programId,
                            type,
                            visitorId: fingerprint,
                            dateKey
                        }
                    });

                    if (type === 'VIEW') {
                        await tx.program.update({
                            where: { id: programId },
                            data: { totalViews: { increment: 1 } }
                        });
                    } else {
                        await tx.program.update({
                            where: { id: programId },
                            data: { clicks: { increment: 1 } }
                        });
                    }
                });
                console.log(`[API/Track] Strict Event Recorded: ${type} for ${programId}`);
                return NextResponse.json({ status: 'tracked' });
            } catch (error: any) {
                if (error.code === 'P2002') {
                    console.log("[API/Track] Duplicate event ignored.");
                    return NextResponse.json({ status: 'duplicate_ignored' });
                }
                console.error("[API/Track] ProgramEvent Error:", error);
            }
        } else {
            console.warn("[API/Track] Skipping Strict Stats - Missing ID or Fingerprint");
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('[API/Track] Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
