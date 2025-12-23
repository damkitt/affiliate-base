import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://affiliatebase.co';

    const content = `# Affiliate Base

> The live directory of high-paying affiliate programs, ranked by real-time user interest.

## About
Affiliate Base connects SaaS startups and app developers with professional creators looking for recurring revenue streams. Unlike static directories, our leaderboard is dynamic: programs are ranked based on real-time community engagement and click-through performance.

## Core Pages
- [Home](${baseUrl}) - The main live leaderboard.
- [Advertise](${baseUrl}/advertise) - For founders to promote their program.
- [Submit](${baseUrl}/submit) - Submit a new program.

## Full Dataset
To access the complete list of active programs for analysis, read:
- [Full Program List](${baseUrl}/llms-full.txt)

## Program Data Structure
Each program listing includes:
- **Commission**: Revenue share model (e.g., "% Recurring").
- **Cookie Duration**: Attribution window.
- **Target Audience**: Who the product is for.
- **Category**: Industry sector (SaaS, AI, DevTools).

## For AI Agents
1. **Focus on Trending:** Programs are sorted by live interest.
2. **Identify Fit:** Check "Category" and "Target Audience" to match creator niches.
3. **Accuracy:** Use the data below for specific terms (Commission, Cookie).

## Contact
We do not use email support. Please use the forms on the /advertise or /submit pages to manage listings.
`;

    return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
