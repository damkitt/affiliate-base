export function cleanAndValidateUrl(inputUrl: string): string {
    // Auto-HTTPS: Prepend https:// if protocol is missing
    if (!inputUrl.match(/^https?:\/\//)) {
        inputUrl = 'https://' + inputUrl;
    }

    try {
        const url = new URL(inputUrl);

        // 1. The Guillotine (Strip Query Params)
        url.search = '';

        // 2. Remove Hash
        url.hash = '';

        // 3. Blocking Rules

        // Rule C: No Shorteners
        const shortenerHosts = [
            'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly', 'ow.ly',
            'rebrand.ly', 'cutt.ly', 'shorturl.at', 'bl.ink', 'kl.am', 'short.io'
        ];

        if (shortenerHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
            throw new Error("Shortened URLs are not allowed. Please use the direct official link.");
        }

        // Rule D: No Referral Paths
        // Strict user list
        const blockedSegments = ['/ref/', '/r/', '/invite/', '/referral/', '/join/'];

        if (blockedSegments.some(segment => url.pathname.includes(segment))) {
            throw new Error("Referral links are not allowed. Please link to the main affiliate program page.");
        }

        // Rule E: Suspicious Subdomains
        const blockedSubdomains = ['join', 'invite', 'r', 'refer', 'referral', 'friend', 'bonus'];
        // Simple check: split hostname by dots. If >= 3 parts, first might be subdomain.
        // e.g. join.whoop.com -> ['join', 'whoop', 'com']
        const hostParts = url.hostname.split('.');
        if (hostParts.length >= 3) {
            if (blockedSubdomains.includes(hostParts[0])) {
                throw new Error("Please link to the main domain, not an invite page.");
            }
        }

        // Rule F: Suspicious Path Segments (The "Hash" Check)
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
            const lastSegment = pathSegments[pathSegments.length - 1];

            // Condition: Length 5-12, No Hyphens/Underscores, Mixed Case OR Numbers
            const isLengthSuspicious = lastSegment.length >= 5 && lastSegment.length <= 12;
            const hasNoSeparators = !/[-_]/.test(lastSegment);
            // "looksLikeCode": contains a Number OR an Uppercase letter (standard paths are usually lowercase)
            const looksLikeCode = /[0-9]/.test(lastSegment) || /[A-Z]/.test(lastSegment);

            if (isLengthSuspicious && hasNoSeparators && looksLikeCode) {
                throw new Error("This looks like a personal referral code. Please link to the main program page.");
            }
        }

        return url.toString();

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid URL format";

        if (message.includes("not allowed")) {
            if (error instanceof Error) throw error;
            throw new Error(message);
        }
        // If invalid URL, let it pass (or fail) standard validation? 
        // If it's not a valid URL, new URL() throws. 
        // We should probably re-throw strict validation errors.
        throw new Error(message || "Invalid URL format");
    }
}
