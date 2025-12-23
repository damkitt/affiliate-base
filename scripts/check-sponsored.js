const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        const programs = await prisma.program.findMany({
            where: { isFeatured: true },
            select: { id: true, programName: true, isFeatured: true, featuredExpiresAt: true }
        });
        console.log(JSON.stringify(programs, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}

main();
