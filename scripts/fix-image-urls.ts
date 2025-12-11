
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBrokenUrls() {
    const brokenPrograms = await prisma.program.findMany({
        where: {
            logoUrl: { contains: '//affiliate-base-avatars' } // Targeting the specific doubled bucket path
        }
    });

    console.log(`Found ${brokenPrograms.length} programs with broken image URLs.`);

    for (const program of brokenPrograms) {
        if (!program.logoUrl) continue;

        // Replace the double slash with a single slash
        // The pattern seems to be: protocol://host:port//bucket/file
        // Or protocol://host//bucket/file
        // Safest is to replace //affiliate-base-avatars with /affiliate-base-avatars
        // ensuring we don't break protocol:// 

        // Actually, MINIO_PUBLIC_URL + / + BUCKET was the issue.
        // If MINIO_PUBLIC_URL had trailing slash: http://...:9000/
        // Code did `${MINIO_PUBLIC_URL}/${BUCKET}` -> http://...:9000//affiliate-base-avatars

        const newUrl = program.logoUrl.replace('//affiliate-base-avatars', '/affiliate-base-avatars');

        if (newUrl !== program.logoUrl) {
            await prisma.program.update({
                where: { id: program.id },
                data: { logoUrl: newUrl }
            });
            console.log(`Fixed: ${program.id} -> ${newUrl}`);
        }
    }
}

fixBrokenUrls()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
