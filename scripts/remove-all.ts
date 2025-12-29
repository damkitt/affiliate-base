import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.trafficLog.deleteMany({});
  console.log(`Deleted ${result.count} traffic logs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
