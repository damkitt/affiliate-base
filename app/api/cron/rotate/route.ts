import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    // In a real production app, this should be protected by a secret key
    // to prevent unauthorized triggering. For MVP, we'll leave it open or add a simple check if needed.

    try {
        // We need to update all programs with a new random weight.
        // Prisma doesn't support "updateMany" with a random value easily in one query for SQLite.
        // So we might need to fetch IDs and update them, or use raw query.
        // SQLite: UPDATE Program SET randomWeight = RANDOM();

        await prisma.$executeRaw`UPDATE Program SET randomWeight = RANDOM()`;

        return NextResponse.json({ success: true, message: 'Rotated programs' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to rotate programs' }, { status: 500 });
    }
}
