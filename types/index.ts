import { CATEGORIES, COUNTRIES, VALID_COUNTRIES } from "@/constants";
import { type JWTPayload } from "jose";

export type Program = {
  readonly id: string;
  readonly programName: string;
  readonly tagline: string;
  readonly description: string;
  readonly category: Category;
  readonly websiteUrl: string;
  readonly affiliateUrl: string;
  readonly country: string;
  readonly xHandle?: string | null;
  readonly email?: string | null;
  readonly logoUrl?: string | null;
  readonly commissionRate: number;
  readonly commissionDuration?: string | null;
  readonly cookieDuration?: number | null;
  readonly payoutMethod?: string | null;
  readonly minPayoutValue?: number | null;
  readonly avgOrderValue?: number | null;
  readonly targetAudience?: string | null;
  readonly additionalInfo?: string | null;
  readonly affiliatesCountRange?: string | null;
  readonly payoutsTotalRange?: string | null;
  readonly foundingDate?: Date | null;
  readonly approvalTimeRange?: string | null;
  readonly clicksCount: number;
  readonly approvalStatus: boolean;
  readonly isFeatured?: boolean;
  readonly featuredExpiresAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type ProgramCreateInput = Omit<
  Program,
  "id" | "createdAt" | "updatedAt" | "clicksCount"
>;
export type ProgramUpdateInput = Partial<ProgramCreateInput>;

export type AnalyticsEvent = {
  readonly id: string;
  readonly programId: string;
  readonly eventType: "view" | "click";
  readonly fingerprint: string;
  readonly ipHash: string;
  readonly userAgent?: string | null;
  readonly referer?: string | null;
  readonly country?: string | null;
  readonly createdAt: Date;
};

export type AnalyticsData = {
  readonly chartData: ReadonlyArray<{ day: string; clicks: number }>;
  readonly totalViews: number;
  readonly todayViews: number;
  readonly weeklyViews: number;
};

export type Category = (typeof CATEGORIES)[number];

export type ApiResponse<T> = {
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
};

export type AdminTokenPayload = JWTPayload & {
  role: "admin";
  jwtNumber: number;
  iat: number;
  exp: number;
};

export type ValidCountry = (typeof VALID_COUNTRIES)[number];

export type CreateProgramBody = {
  programName: string;
  websiteUrl: string;
  affiliateUrl: string;
  tagline?: string;
  description?: string;
  category?: string;
  country?: string;
  xHandle?: string;
  email?: string;
  logoUrl?: string;
  commissionRate?: number;
  commissionDuration?: string;
  cookieDuration?: number;
  payoutMethod?: string;
  minPayoutValue?: number;
  avgOrderValue?: number;
  targetAudience?: string;
  additionalInfo?: string;
  affiliatesCountRange?: string;
  payoutsTotalRange?: string;
  foundingDate?: string;
  approvalTimeRange?: string;
};

export type NavigatorWithExtras = Navigator & {
  deviceMemory?: number;
};

export type WindowWithWebkit = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export type CountryCode = (typeof COUNTRIES)[number]["code"];
