import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/programs/check-duplicate
 * Real-time duplicate checking for program creation form
 * @query field - Field to check (programName, websiteUrl, affiliateUrl)
 * @query value - Value to check
 */
/**
 * GET /api/programs/check-duplicate
 * Real-time duplicate checking for program creation form
 * @query field - Field to check (programName, websiteUrl, affiliateUrl)
 * @query value - Value to check
 */
export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const value = searchParams.get("value");

    if (!field || !value) {
        return NextResponse.json({ error: "Missing field or value" }, { status: 400 });
    }

    // Only allow checking specific fields
    const allowedFields = ["programName", "websiteUrl", "affiliateUrl"];
    if (!allowedFields.includes(field)) {
        return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    try {
        // Map camelCase to Prisma field names
        const fieldMap: Record<string, string> = {
            programName: "programName",
            websiteUrl: "websiteUrl",
            affiliateUrl: "affiliateUrl",
        };

        const prismaField = fieldMap[field];
        let whereClause: any = {};

        // Special handling for URLs to prevent bypasses
        if (field === "websiteUrl" || field === "affiliateUrl") {
            const variations = getUrlVariations(value);
            whereClause = {
                [prismaField]: { in: variations }
            };
        } else {
            // For program name, strict case-insensitive check could be good, but
            // for now sticking to simple trim match or insensitive if desired.
            // Let's use insensitive to be helpful.
            whereClause = {
                [prismaField]: { equals: value.trim(), mode: "insensitive" }
            };
        }

        // Check if value already exists
        const existing = await prisma.program.findFirst({
            where: whereClause,
            select: { id: true, programName: true },
        });

        if (existing) {
            const messages: Record<string, string> = {
                programName: "This program name is already taken",
                websiteUrl: "This website is already registered",
                affiliateUrl: "This affiliate link is already registered",
            };

            return NextResponse.json({
                exists: true,
                message: messages[field],
            });
        }

        return NextResponse.json({ exists: false });
    } catch (error) {
        console.error("[Check Duplicate] Error:", error);
        return NextResponse.json({ error: "Failed to check" }, { status: 500 });
    }
}

import { cleanAndValidateUrl } from "@/lib/url-validator";

/**
 * Generates URL variations to check against the DB.
 * Uses cleanAndValidateUrl to match the normalization logic used during creation.
 */
function getUrlVariations(input: string): string[] {
    const variations = new Set<string>();
    const raw = input.trim();

    // 1. Always check the raw input
    variations.add(raw);

    try {
        // 2. Get the canonical version (stripped params, added https, etc)
        // This fails if the URL is "banned" (shortener etc), but that's fine
        // because validation will catch that separately.
        const canonical = cleanAndValidateUrl(raw);
        variations.add(canonical);

        // 3. WWW vs non-WWW variations of the canonical URL
        try {
            const url = new URL(canonical);
            const hostname = url.hostname;

            // Helper to strip trailing slash for comparison
            const clean = (u: URL) => {
                let s = u.toString();
                // Strip hash/search again just to be safe (though cleanAndValidateUrl does it)
                u.search = '';
                u.hash = '';
                s = u.toString();
                return s.endsWith('/') ? s.slice(0, -1) : s;
            };

            // Variation: opposite of current www state
            if (hostname.startsWith('www.')) {
                const noWww = new URL(url.toString());
                noWww.hostname = hostname.replace('www.', '');
                variations.add(clean(noWww));
            } else {
                const yesWww = new URL(url.toString());
                yesWww.hostname = 'www.' + hostname;
                variations.add(clean(yesWww));
            }

            // Also add the canonical itself with/without slash
            variations.add(canonical.endsWith('/') ? canonical.slice(0, -1) : canonical);
            variations.add(canonical + '/');

        } catch (e) {
            // parsing error, ignore
        }

    } catch (e) {
        // cleanAndValidateUrl failed (e.g. invalid format or banned domain)
        // We rely on the 'raw' check and separate validation API
    }

    return Array.from(variations);
}
