import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://affiliatebase.co';

    // Fetch programs sorted by trendingScore (Real-time interest)
    const programs = await prisma.program.findMany({
        where: { approvalStatus: true },
        orderBy: { trendingScore: 'desc' }, // Show most popular first
        select: {
            programName: true,
            slug: true,
            category: true,
            tagline: true,
            commissionRate: true,
            // @ts-ignore
            commissionType: true,
            commissionDuration: true,
            cookieDuration: true,
            targetAudience: true,
            minPayoutValue: true,
        },
    });

    let text = `# Full Affiliate Program List (Ranked by Interest)\n`;
    text += `Last Updated: ${new Date().toISOString()}\n\n`;

    programs.forEach((p, index) => {
        const commStr = (p as any).commissionType === "FIXED"
            ? `$${p.commissionRate} per sale`
            : `${p.commissionRate}% ${p.commissionDuration === 'Recurring' ? 'recurring' : 'one-time'}`;

        text += `## ${index + 1}. ${p.programName}\n`;
        text += `- Category: ${p.category}\n`;
        text += `- Pitch: ${p.tagline || 'N/A'}\n`;
        text += `- Commission: ${commStr}\n`;
        text += `- Cookie: ${p.cookieDuration} days\n`;
        // Add these only if they exist in DB
        if (p.targetAudience) text += `- Target Audience: ${p.targetAudience}\n`;
        if (p.minPayoutValue) text += `- Min Payout: $${p.minPayoutValue}\n`;

        text += `- Link: ${baseUrl}/programs/${p.slug}\n\n`;
    });

    return new NextResponse(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
