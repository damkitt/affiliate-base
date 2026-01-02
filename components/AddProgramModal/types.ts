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
  commissionType: "PERCENTAGE" | "FIXED";
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

import { COUNTRIES, VALID_COUNTRIES } from "@/constants";

export type CountryCode = (typeof VALID_COUNTRIES)[number];

export const COUNTRY_CODE_MAP: Record<string, CountryCode> = COUNTRIES.reduce(
  (acc, c) => ({ ...acc, [c.name]: c.code }),
  {} as Record<string, CountryCode>
);
