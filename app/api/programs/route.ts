import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const programs = await prisma.program.findMany({
            where: {
                status: "approved"
            },
            orderBy: {
                randomWeight: 'desc'
            }
        });
        return NextResponse.json(programs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const program = await prisma.program.create({
            data: {
                ...body,
                status: "approved", // Programs show immediately but can be reviewed in admin
                randomWeight: Math.random()
            }
        });
        return NextResponse.json(program);
    } catch (error) {
        console.error("Error creating program:", error);
        return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
    }
}
