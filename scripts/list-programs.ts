import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const programs = await prisma.program.findMany({
        select: {
            id: true,
            programName: true,
            slug: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log('Current programs in database:');
    console.log('============================');
    programs.forEach((p, i) => {
        console.log(`${i + 1}. ${p.programName} (slug: ${p.slug})`);
    });
    console.log(`\nTotal: ${programs.length} programs`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
