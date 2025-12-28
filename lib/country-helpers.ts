// Client-safe country helpers (No Node.js dependencies)

// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
    US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", IN: "🇮🇳", BR: "🇧🇷", CA: "🇨🇦",
    AU: "🇦🇺", JP: "🇯🇵", KR: "🇰🇷", CN: "🇨🇳", RU: "🇷🇺", ES: "🇪🇸", IT: "🇮🇹",
    NL: "🇳🇱", TR: "🇹🇷", UA: "🇺🇦", PL: "🇵🇱", AT: "🇦🇹", CH: "🇨🇭", SE: "🇸🇪",
    NO: "🇳🇴", DK: "🇩🇰", FI: "🇫🇮", ID: "🇮🇩", TH: "🇹🇭", VN: "🇻🇳", MY: "🇲🇾",
    PH: "🇵🇭", AE: "🇦🇪", SA: "🇸🇦", IL: "🇮🇱", EG: "🇪🇬", ZA: "🇿🇦", NG: "🇳🇬",
    KE: "🇰🇪", AR: "🇦🇷", MX: "🇲🇽", CO: "🇨🇴", CL: "🇨🇱", PT: "🇵🇹", IE: "🇮🇪",
    CZ: "🇨🇿", BE: "🇧🇪", HK: "🇭🇰", SG: "🇸🇬", Other: "🌐",
};

// Country full names mapping
const COUNTRY_NAMES: Record<string, string> = {
    US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France", IN: "India",
    BR: "Brazil", CA: "Canada", AU: "Australia", JP: "Japan", KR: "South Korea",
    CN: "China", RU: "Russia", ES: "Spain", IT: "Italy", NL: "Netherlands",
    TR: "Turkey", UA: "Ukraine", PL: "Poland", AT: "Austria", CH: "Switzerland",
    SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland", ID: "Indonesia",
    TH: "Thailand", VN: "Vietnam", MY: "Malaysia", PH: "Philippines",
    AE: "United Arab Emirates", SA: "Saudi Arabia", IL: "Israel", EG: "Egypt",
    ZA: "South Africa", NG: "Nigeria", KE: "Kenya", AR: "Argentina", MX: "Mexico",
    CO: "Colombia", CL: "Chile", PT: "Portugal", IE: "Ireland", CZ: "Czech Republic",
    BE: "Belgium", HK: "Hong Kong", SG: "Singapore", Other: "Other Locations",
};

export function getCountryFlag(code: string): string {
    return countryFlags[code] || "🌐";
}

export function getFullCountryName(code: string): string {
    return COUNTRY_NAMES[code] || code || "Unknown";
}
