import crypto from "crypto";

import { getCountryFlag, getFullCountryName } from "./country-helpers";

export { getCountryFlag, getFullCountryName };


/**
 * Stable Visitor Identification (SHA-256)
 * Single source of truth for "Vercel-level" precision.
 */
export function getStableIdentity(log: any): string {
    // If visitorId (FingerprintJS) is present, it's the most stable
    if (log.visitorId) return String(log.visitorId);

    // Otherwise, hash IP + UserAgent (consistent across the entire range, no per-day salt to avoid duplicates)
    const data = `${log.ip || "anon"}-${log.userAgent || "no-ua"}`;
    return crypto.createHash("sha256").update(data).digest("hex").substring(0, 16);
}

// Generate session ID
export function generateSessionId(fingerprint: string): string {
    const today = new Date().toISOString().split("T")[0];
    let hash = 0;
    const str = `${fingerprint}-${today}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// OS/Device Parsing Helper
export function parseUserAgent(ua: string | null) {
    if (!ua) return { os: "Other", device: "Desktop" };

    const lowerUA = ua.toLowerCase();
    let os = "Other";
    let device = "Desktop";

    // Detect OS
    if (lowerUA.includes("windows")) os = "Windows";
    else if (lowerUA.includes("mac os x")) {
        if (lowerUA.includes("iphone") || lowerUA.includes("ipad")) os = "iOS";
        else os = "macOS";
    }
    else if (lowerUA.includes("android")) os = "Android";
    else if (lowerUA.includes("linux")) os = "Linux";
    else if (lowerUA.includes("ios") || lowerUA.includes("iphone")) os = "iOS";

    // Detect Device Type
    if (lowerUA.includes("mobile") || lowerUA.includes("iphone") || (lowerUA.includes("android") && lowerUA.includes("mobile"))) {
        device = "Mobile";
    } else if (lowerUA.includes("ipad") || lowerUA.includes("tablet") || (lowerUA.includes("android") && !lowerUA.includes("mobile"))) {
        device = "Tablet";
    }

    return { os, device };
}

// Helper to get date range
export function getDateRange(range: "24h" | "7d" | "30d"): Date {
    const now = new Date();
    switch (range) {
        case "24h":
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to 7d
    }
}

// Parse referrer URL
export function parseReferrer(referer: string | null): { name: string; domain: string | null } {
    if (!referer) return { name: "Direct", domain: null };
    try {
        const url = new URL(referer);
        const host = url.hostname.replace("www.", "");
        const domain = url.hostname;

        if (host.includes("google")) return { name: "Google", domain };
        if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com")) return { name: "X (Twitter)", domain };
        if (host.includes("linkedin")) return { name: "LinkedIn", domain };
        if (host.includes("facebook")) return { name: "Facebook", domain };
        if (host.includes("instagram")) return { name: "Instagram", domain };
        if (host.includes("reddit")) return { name: "Reddit", domain };
        if (host.includes("youtube")) return { name: "YouTube", domain };
        if (host.includes("bing")) return { name: "Bing", domain };
        if (host.includes("duckduckgo")) return { name: "DuckDuckGo", domain };
        if (host.includes("yandex")) return { name: "Yandex", domain };
        if (host.includes("github")) return { name: "GitHub", domain };
        if (host.includes("indiehackers")) return { name: "IndieHackers", domain };
        if (host.includes("producthunt")) return { name: "ProductHunt", domain };

        const name = host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
        return { name, domain };
    } catch {
        return { name: "Direct", domain: null };
    }
}
