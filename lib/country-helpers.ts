import { COUNTRIES } from "@/constants";

export function getCountryFlag(code: string): string {
    const country = COUNTRIES.find(c => c.code === code);
    return country?.flag || "🌐";
}

export function getFullCountryName(code: string): string {
    const country = COUNTRIES.find(c => c.code === code);
    return country?.name || code || "Unknown";
}
