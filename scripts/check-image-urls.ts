
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIds() {
    const programs = await prisma.program.findMany({
        where: {
            logoUrl: {
                contains: '//avatars', // Assuming bucket is 'avatars' or similar. 
                // Wait, app/api/upload/avatar/route.ts used 'avatars' or 'avatar'?
                // The bucket var name came from lib/minio. 
                // Let's check for any double slashes after protocol.
                // http://... // ... 
                // Actually, just list some logoUrls to see.
            }
        },
        take: 10,
        select: { id: true, logoUrl: true }
    });

    console.log("Potential Broken URLs:", programs);

    const all = await prisma.program.findMany({
        where: { logoUrl: { not: null } },
        take: 5,
        select: { logoUrl: true }
    });
    console.log("Sample URLs:", all);
}

checkIds()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
