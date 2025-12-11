
/**
 * Server-side network validation utilities.
 * This file should NOT be imported in client-side components to avoid CORS issues.
 */

export async function validateUrlReachability(url: string, context: "Website" | "Affiliate Link"): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
        const response = await fetch(url, {
            method: "GET", // GET is more reliable than HEAD for SPAs
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; AffiliateBaseBot/1.0; +http://affiliatebase.co)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const status = response.status;

        // PASS: 2xx (Success), 3xx (Redirect - fetch follows automatically usually), 401/403 (Protected/Forbidden)
        // We explicitly allow 401/403 because many valid sites block bots, but providing a 403 proves the server exists.
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

        // Catch-all for other 4xx? (e.g. 410 Gone, 400 Bad Request)
        // For now, let's treat other 4xx as suspicious but maybe allow? 
        // User requested specifically blocking 404 and 500+.
        // Let's block 410 as well if possible, but strict compliance to prompt:
        // Prompt only specified 404 and 500+ as FAIL.
        // 400 Bad Request might be due to bot User-Agent? Let's safeguard.
        // If not explicitly failed above, we let it pass?
        // "FAIL (Block Save): Status 404... Status 500+"
        // Implies others pass.

        // Explicitly handling the weird ones just in case?
        // If we get here, it's not ok, not 3xx, not 401/403, not 404, not 5xx.
        // E.g. 418 I'm a teapot.
        // Let's assume pass unless 404 or 5xx.
        return;

    } catch (error: any) {
        clearTimeout(timeoutId);

        // If it was our manual error (404/5xx), rethrow.
        if (error.message.includes(context)) {
            throw error;
        }

        // Network Errors
        if (error.name === "AbortError") {
            throw new Error(`We couldn't reach the ${context} in time (Timeout). Is the site valid?`);
        }

        // DNS / Connection Refused
        // precise error messages vary by runtime, but usually contain "fetch failed" or "ENOTFOUND"
        throw new Error(`We couldn't reach this domain (${context}). Please check if the website address is correct.`);
    }
}
