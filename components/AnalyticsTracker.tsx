"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { generateFingerprint } from "@/lib/fingerprint";

export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const fingerprintRef = useRef<string | null>(null);
    const lastPathRef = useRef<string | null>(null);

    useEffect(() => {
        // Initial fingerprint generation
        if (!fingerprintRef.current) {
            generateFingerprint().then((fp) => {
                fingerprintRef.current = fp;
                // Track the initial page load once fingerprint is ready
                const currentPath = window.location.pathname + window.location.search;
                trackPageView(fp, currentPath);
                lastPathRef.current = currentPath;
            });
        }
    }, []);

    useEffect(() => {
        const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

        // Only track if fingerprint is ready and path actually changed from what we last tracked
        if (fingerprintRef.current && fullPath !== lastPathRef.current) {
            trackPageView(fingerprintRef.current, fullPath);
            lastPathRef.current = fullPath;
        }
    }, [pathname, searchParams]);

    const trackPageView = async (fp: string, path: string) => {
        try {
            const referer = document.referrer;

            // Use the universal collector
            fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "VIEW",
                    fingerprint: fp,
                    path: path,
                }),
            }).catch(err => console.error("[Analytics] Background tracking failed:", err));
        } catch (err) {
            console.error("[Analytics] Failed to track page view:", err);
        }
    };

    return null; // Invisible component
}
