
/**
 * Server-side network validation utilities.
 * This file should NOT be imported in client-side components to avoid CORS issues.
 */

export async function validateUrlReachability(url: string, context: "Website" | "Affiliate Link"): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 5s)

    try {
        // Try HEAD first (faster), fallback to GET if HEAD fails
        let response = await fetch(url, {
            method: "HEAD",
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; AffiliateBaseBot/1.0; +http://affiliatebase.co)",
            },
            signal: controller.signal,
            redirect: "follow",
        }).catch(() => null);

        // If HEAD failed or returned 405, try GET
        if (!response || response.status === 405) {
            response = await fetch(url, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; AffiliateBaseBot/1.0; +http://affiliatebase.co)",
                },
                signal: controller.signal,
                redirect: "follow",
            });
        }

        clearTimeout(timeoutId);

        const status = response.status;

        // PASS: 2xx (Success), 3xx (Redirect), 401/403 (Protected/Forbidden)
        if (response.ok || (status >= 300 && status < 400) || status === 401 || status === 403) {
            return;
        }

        // FAIL: 404 Not Found
        if (status === 404) {
            throw new Error(`The ${context} leads to a 404 Page Not Found. Please check for typos.`);
        }

        // FAIL: 5xx Server Error
        if (status >= 500) {
            throw new Error(`The ${context} destination server is returning an error (${status}). Is the site down?`);
        }

        // Other status codes - allow through
        return;

    } catch (error: unknown) {
        clearTimeout(timeoutId);

        const errorMessage = error instanceof Error ? error.message : "Unknown Error";

        // If it was our manual error (404/5xx), rethrow.
        if (errorMessage.includes(context)) {
            if (error instanceof Error) throw error;
            throw new Error(errorMessage);
        }

        // Network Errors - Abort/Timeout
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error(`We couldn't reach the ${context} in time (Timeout). The site may be slow or blocking automated requests.`);
        }

        // DNS / Connection Refused
        throw new Error(`We couldn't reach this domain (${context}). Please check if the website address is correct.`);
    }
}
