
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB Access...');

    try {
        // 1. Test TrafficLog
        console.log('Writing to TrafficLog...');
        const log = await prisma.trafficLog.create({
            data: {
                path: '/debug-script',
                userAgent: 'DebugScript/1.0',
                programId: 'debug-id',
            }
        });
        console.log('✅ TrafficLog Success:', log.id);

        // 2. Test ProgramEvent (Need a valid program first)
        // Just find first program
        const program = await prisma.program.findFirst();
        if (program) {
            console.log('Found Program:', program.id);
            const event = await prisma.programEvent.create({
                data: {
                    programId: program.id,
                    type: 'VIEW',
                    visitorId: 'debug-visitor-' + Date.now(),
                    dateKey: new Date().toISOString().split('T')[0]
                }
            });
            console.log('✅ ProgramEvent Success:', event.id);
        } else {
            console.log('⚠️ No existing programs to test ProgramEvent relation.');
        }

    } catch (error) {
        console.error('❌ DB Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
