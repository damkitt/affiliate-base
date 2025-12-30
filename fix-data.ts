
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const program = await prisma.program.findFirst({
        where: { programName: "Sandimax" },
    });

    if (!program) {
        console.log("Sandimax not found");
        return;
    }

    console.log("Current Sandimax:", program.commissionType, program.commissionRate);

    const updated = await prisma.program.update({
        where: { id: program.id },
        data: {
            commissionType: "FIXED",
            // Ensure it is 120 (it was 120% in screenshot)
            commissionRate: 120,
        },
    });
    console.log("Updated Sandimax to:", updated.commissionType);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
