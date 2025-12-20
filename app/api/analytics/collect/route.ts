import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { trackEventBackground, generateSessionId } from "@/lib/analytics";

export const runtime = "nodejs";

function hashIP(ip: string): string {
    const salt = process.env.IP_SALT || "affiliatebase-salt";
    return createHash("sha256")
        .update(ip + salt)
        .digest("hex")
        .slice(0, 32);
}

function getClientIP(request: Request): string {
    const headers = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"];
    for (const header of headers) {
        const value = request.headers.get(header);
        if (value) return value.split(",")[0].trim();
    }
    return "unknown";
}

export async function POST(request: Request) {
    try {
        const { fingerprint, url, referer: clientReferer } = await request.json();

        if (!fingerprint) {
            return NextResponse.json({ error: "Fingerprint required" }, { status: 400 });
        }

        const ip = getClientIP(request);
        const ipHash = hashIP(ip);
        const userAgent = request.headers.get("user-agent") ?? undefined;
        const referer = clientReferer ?? request.headers.get("referer") ?? undefined;
        const country = request.headers.get("cf-ipcountry") ?? undefined;
        const sessionId = generateSessionId(fingerprint);

        // Track a general VIEW event for site-wide presence
        trackEventBackground({
            sessionId,
            eventName: "VIEW",
            eventType: "page_visit",
            fingerprint,
            ipHash,
            userAgent,
            referer,
            country,
            url
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Analytics] Error in collector:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
