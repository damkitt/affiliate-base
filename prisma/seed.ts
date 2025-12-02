const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Categories are hardcoded in the frontend/backend logic as per requirements,
  // but we can seed some initial programs if needed.
  // For now, we'll leave this empty or add a dummy program.
  
  // The prompt says "Hardcode these categories in the backend validation and frontend dropdown".
  // So we might not strictly need a Category table if we just store the string.
  // I decided to use a String field for category in the Program model for simplicity and flexibility,
  // matching the "Hardcode" instruction which suggests the source of truth is code, not DB.
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
