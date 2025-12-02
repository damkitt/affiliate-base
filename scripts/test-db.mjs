import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite(db);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected.');

        console.log('Creating test program...');
        const program = await prisma.program.create({
            data: {
                name: 'Test Program Script BS3',
                tagline: 'Test Tagline',
                description: 'Test Description',
                category: 'SaaS',
                websiteUrl: 'https://example.com',
                affiliateUrl: 'https://example.com/affiliate',
                country: 'Global',
            },
        });
        console.log('Created program:', program);

        console.log('Fetching programs...');
        const programs = await prisma.program.findMany();
        console.log('Programs:', programs);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
