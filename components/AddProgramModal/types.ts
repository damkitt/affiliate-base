export interface FormData {
  slug?: string;
  programName: string;
  tagline: string;
  description: string;
  category: string;
  websiteUrl: string;
  affiliateUrl: string;
  country: string;
  xHandle: string;
  email: string;
  logoUrl: string;
  commissionRate: string;
  commissionDuration: string;
  affiliatesCountRange: string;
  payoutsTotalRange: string;
  foundingMonth: string;
  foundingYear: string;
  additionalInfo: string;
  cookieDuration: string;
  payoutMethod: string;
  minPayoutValue: string;
  avgOrderValue: string;
  targetAudience: string;
  approvalTimeRange: string;
}

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type CountryCode =
  | "US"
  | "GB"
  | "DE"
  | "FR"
  | "ES"
  | "IT"
  | "NL"
  | "BE"
  | "AT"
  | "CH"
  | "SE"
  | "NO"
  | "DK"
  | "FI"
  | "PL"
  | "CZ"
  | "PT"
  | "IE"
  | "RU"
  | "UA"
  | "CA"
  | "MX"
  | "BR"
  | "AR"
  | "CO"
  | "CL"
  | "AU"
  | "NZ"
  | "JP"
  | "KR"
  | "CN"
  | "HK"
  | "SG"
  | "IN"
  | "ID"
  | "TH"
  | "VN"
  | "MY"
  | "PH"
  | "AE"
  | "SA"
  | "IL"
  | "TR"
  | "EG"
  | "ZA"
  | "NG"
  | "KE"
  | "Other";

export const COUNTRY_CODE_MAP: Record<string, CountryCode> = {
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  France: "FR",
  Spain: "ES",
  Italy: "IT",
  Netherlands: "NL",
  Belgium: "BE",
  Austria: "AT",
  Switzerland: "CH",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Finland: "FI",
  Poland: "PL",
  "Czech Republic": "CZ",
  Portugal: "PT",
  Ireland: "IE",
  Russia: "RU",
  Ukraine: "UA",
  Canada: "CA",
  Mexico: "MX",
  Brazil: "BR",
  Argentina: "AR",
  Colombia: "CO",
  Chile: "CL",
  Australia: "AU",
  "New Zealand": "NZ",
  Japan: "JP",
  "South Korea": "KR",
  China: "CN",
  "Hong Kong": "HK",
  Singapore: "SG",
  India: "IN",
  Indonesia: "ID",
  Thailand: "TH",
  Vietnam: "VN",
  Malaysia: "MY",
  Philippines: "PH",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  Israel: "IL",
  Turkey: "TR",
  Egypt: "EG",
  "South Africa": "ZA",
  Nigeria: "NG",
  Kenya: "KE",
};
