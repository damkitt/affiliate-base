const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        // Find all programs that are featured but missing an expiry date
        const programs = await prisma.program.findMany({
            where: {
                isFeatured: true,
                featuredExpiresAt: null
            },
            select: { id: true, programName: true }
        });

        console.log(`Found ${programs.length} programs with missing expiry dates:`);
        programs.forEach(p => console.log(`  - ${p.programName} (${p.id})`));

        // Set expiry to 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        console.log(`\nSetting expiry date to: ${expiryDate.toISOString()}`);

        // Update all affected programs
        const result = await prisma.program.updateMany({
            where: {
                isFeatured: true,
                featuredExpiresAt: null
            },
            data: {
                featuredExpiresAt: expiryDate
            }
        });

        console.log(`\n✓ Updated ${result.count} programs.`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
