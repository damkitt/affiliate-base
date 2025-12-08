import { PrismaClient } from "@prisma/client";
import { calculateQualityScore } from "../lib/scoring";

const prisma = new PrismaClient();

async function main() {
    console.log("Updating quality scores for all programs...\n");

    const programs = await prisma.program.findMany();

    for (const program of programs) {
        const qualityScore = calculateQualityScore(program);

        await prisma.program.update({
            where: { id: program.id },
            data: { qualityScore },
        });

        console.log(`✓ ${program.programName}: qualityScore = ${qualityScore}`);
    }

    console.log(`\nDone! Updated ${programs.length} programs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
