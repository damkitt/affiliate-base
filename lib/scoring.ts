import type { Program } from "@prisma/client";

/**
 * Optional fields that contribute to quality score (+5 each if non-null/non-empty)
 */
const OPTIONAL_QUALITY_FIELDS: (keyof Program)[] = [
    "description",
    "cookieDuration",
    "payoutMethod",
    "avgOrderValue",
    "xHandle",
    "targetAudience",
    "affiliatesCountRange",
    "minPayoutValue",
    "foundingDate",
    "approvalTimeRange",
    "email",
    "payoutsTotalRange",
];

/**
 * Trust tier mapping based on affiliates count range
 * Maps range strings to trust points (0-10)
 */
const AFFILIATES_TRUST_TIERS: Record<string, number> = {
    "0-50": 1,
    "51-100": 2,
    "101-500": 4,
    "501-1000": 6,
    "1001-5000": 8,
    "5001+": 10,
};

/**
 * Trust tier mapping based on payouts total range
 * Maps range strings to trust points (0-10)
 */
const PAYOUTS_TRUST_TIERS: Record<string, number> = {
    "$0-$10k": 1,
    "$10k-$50k": 2,
    "$50k-$100k": 4,
    "$100k-$500k": 6,
    "$500k-$1M": 8,
    "$1M+": 10,
};

/**
 * Calculate quality score based on profile completeness
 * +10 for logo, +5 for each filled optional field
 */
export function calculateQualityScore(program: Partial<Program>): number {
    let score = 0;

    // +10 for having a logo
    if (program.logoUrl && program.logoUrl.trim() !== "") {
        score += 10;
    }

    // +5 for each filled optional field
    for (const field of OPTIONAL_QUALITY_FIELDS) {
        const value = program[field];
        if (value !== null && value !== undefined && value !== "") {
            // For strings, check if it's not the default placeholder
            if (typeof value === "string") {
                if (
                    value !== "No description provided." &&
                    value !== "No tagline provided." &&
                    value !== "Not specified"
                ) {
                    score += 5;
                }
            } else {
                score += 5;
            }
        }
    }

    return score;
}

/**
 * Calculate trust tier score based on affiliates count and payouts total
 * Each contributes 0-10 points, capped at total of 10
 */
export function calculateTrustScore(program: Partial<Program>): number {
    let trustScore = 0;

    // Trust from affiliates count
    if (program.affiliatesCountRange) {
        trustScore += AFFILIATES_TRUST_TIERS[program.affiliatesCountRange] || 0;
    }

    // Trust from payouts total
    if (program.payoutsTotalRange) {
        trustScore += PAYOUTS_TRUST_TIERS[program.payoutsTotalRange] || 0;
    }

    // Cap at 10 points
    return Math.min(trustScore, 10);
}

/**
 * Calculate recency boost based on program creation date
 * <3 days: +100pts, <7 days: +50pts
 */
export function calculateRecencyBoost(createdAt: Date): number {
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceCreation < 3) {
        return 100;
    } else if (daysSinceCreation < 7) {
        return 50;
    }

    return 0;
}

/**
 * Calculate engagement score from 14-day rolling views and clicks
 * Views * 1 + Clicks * 10
 */
export function calculateEngagementScore(
    uniqueViews: number,
    outboundClicks: number
): number {
    return uniqueViews * 1 + outboundClicks * 10;
}

/**
 * Calculate total trending score combining all components:
 * A. Engagement (Rolling 14 Days): (UniqueViews * 1) + (OutboundClicks * 10)
 * B. Quality: +10 for Logo, +5 for each filled optional field
 * C. Trust Tiers: affiliatesCount/totalPayouts mapped to 0-10pts (safety capped)
 * D. Recency Boost: <3 days +100pts, <7 days +50pts
 */
export function calculateTrendingScore(
    program: Partial<Program> & { createdAt: Date },
    fourteenDayViews: number,
    fourteenDayClicks: number
): number {
    const engagementScore = calculateEngagementScore(fourteenDayViews, fourteenDayClicks);
    const qualityScore = calculateQualityScore(program);
    const trustScore = calculateTrustScore(program);
    const recencyBoost = calculateRecencyBoost(program.createdAt);

    return engagementScore + qualityScore + trustScore + recencyBoost;
}
