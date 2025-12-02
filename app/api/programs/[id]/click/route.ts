import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const programId = parseInt(id);

        if (isNaN(programId)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const program = await prisma.program.update({
            where: { id: programId },
            data: {
                clickCount: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(program);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to increment click count' }, { status: 500 });
    }
}
