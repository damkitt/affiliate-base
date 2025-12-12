import { NextRequest, NextResponse } from "next/server";
import { cleanAndValidateUrl } from "@/lib/url-validator";
import { validateUrlReachability } from "@/lib/network-validator";

export async function POST(req: NextRequest) {
    try {
        const { url, type } = await req.json();

        if (!url) {
            return NextResponse.json({ isValid: false, error: "URL is required" }, { status: 400 });
        }

        // 1. Clean and Validate Format (Security Checks)
        let cleanedUrl: string;
        try {
            cleanedUrl = cleanAndValidateUrl(url);
        } catch (error: any) {
            return NextResponse.json({
                isValid: false,
                error: error.message || "Invalid URL format"
            });
        }

        // 2. Check Reachability (404 Check)
        // Only perform this if format is valid
        try {
            const context = type === "affiliate" ? "Affiliate Link" : "Website";
            await validateUrlReachability(cleanedUrl, context);
        } catch (error: any) {
            return NextResponse.json({
                isValid: false,
                error: error.message || "URL is unreachable"
            });
        }

        return NextResponse.json({
            isValid: true,
            cleanedUrl
        });

    } catch (error) {
        console.error("URL Validation Error:", error);
        return NextResponse.json({
            isValid: false,
            error: "Failed to validate URL. Please try again."
        }, { status: 500 });
    }
}
