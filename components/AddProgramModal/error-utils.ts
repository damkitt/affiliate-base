
import { cleanAndValidateUrl } from "@/lib/url-validator";
import { validateUrl } from "./validation";

export function getUrlValidationError(url: string | undefined): string | null {
    if (!url) return null;

    // 1. Check basic structure (Dot check)
    if (!validateUrl(url)) {
        return "Invalid URL format. Example: website.com";
    }

    // 2. Check strict blocking rules (Shorteners, Referrals)
    // We can reuse cleanAndValidateUrl logic but we need to handle the auto-https prepending 
    // because cleanAndValidateUrl also does it now.

    try {
        cleanAndValidateUrl(url);
        return null; // All good
    } catch (error: any) {
        return error.message;
    }
}
