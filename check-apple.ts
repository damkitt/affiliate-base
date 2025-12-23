
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const appleId = '9160814d-8f74-4cc8-9df8-2c10f5806034';
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(`--- DB State for Apple (${appleId}) ---`);
    console.log(`Server today dateKey: ${todayStr}`);

    const program = await prisma.program.findUnique({
        where: { id: appleId }
    });
    console.log(`Program Table stats: totalViews=${program?.totalViews}, clicks=${program?.clicks}`);

    const events = await prisma.programEvent.findMany({
        where: { programId: appleId }
    });
    console.log(`\nTotal ProgramEvents found: ${events.length}`);
    events.forEach(e => {
        console.log(`- Type: ${e.type}, DateKey: ${e.dateKey}, Visitor: ${e.visitorId.substring(0, 8)}...`);
    });

    const todayViewsCount = await prisma.programEvent.count({
        where: { programId: appleId, type: 'VIEW', dateKey: todayStr }
    });
    console.log(`\nToday's Views (exact dateKey match): ${todayViewsCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
