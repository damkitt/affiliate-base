import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function main() {
    // Get all programs
    const programs = await prisma.program.findMany();

    console.log(`Found ${programs.length} programs to update`);

    for (const program of programs) {
        const baseSlug = slugify(program.programName);
        let slug = baseSlug;
        let counter = 1;

        // Check for duplicates
        while (true) {
            const existing = await prisma.program.findFirst({
                where: {
                    slug,
                    NOT: { id: program.id }
                }
            });

            if (!existing) break;

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        await prisma.program.update({
            where: { id: program.id },
            data: { slug }
        });

        console.log(`✓ ${program.programName} → ${slug}`);
    }

    console.log('\nDone! All programs now have slugs.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
