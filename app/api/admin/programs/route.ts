import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const programs = await prisma.program.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(programs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        const program = await prisma.program.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        return NextResponse.json(program);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
    }
}
