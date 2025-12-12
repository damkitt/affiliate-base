import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

        // Check if value already exists
        const existing = await prisma.program.findFirst({
            where: {
                [prismaField]: value.trim(),
            },
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
