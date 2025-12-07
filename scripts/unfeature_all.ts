
import { prisma } from "../lib/prisma";

async function main() {
    try {
        const { count } = await prisma.program.updateMany({
            where: { isFeatured: true },
            data: { isFeatured: false, featuredExpiresAt: null },
        });
        console.log(`Successfully removed featured status from ${count} programs.`);
    } catch (error) {
        console.error("Error unfeaturing programs:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
