/**
 * Core domain types for AffiliateBase platform
 */

// =============================================================================
// Program Types
// =============================================================================

export interface Program {
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
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type ProgramCreateInput = Omit<Program, 'id' | 'createdAt' | 'updatedAt' | 'clicksCount'>;
export type ProgramUpdateInput = Partial<ProgramCreateInput>;

// =============================================================================
// Analytics Types
// =============================================================================

export interface AnalyticsEvent {
  readonly id: string;
  readonly programId: string;
  readonly eventType: 'view' | 'click';
  readonly fingerprint: string;
  readonly ipHash: string;
  readonly userAgent?: string | null;
  readonly referer?: string | null;
  readonly country?: string | null;
  readonly createdAt: Date;
}

export interface AnalyticsData {
  readonly chartData: ReadonlyArray<{ day: string; clicks: number }>;
  readonly totalViews: number;
  readonly todayViews: number;
  readonly weeklyViews: number;
}

// =============================================================================
// Categories
// =============================================================================

export const CATEGORIES = [
  "Artificial Intelligence",
  "SaaS",
  "Developer Tools",
  "Fintech",
  "Productivity",
  "Marketing",
  "E-commerce",
  "Design Tools",
  "No-Code",
  "Analytics",
  "Education",
  "Health & Fitness",
  "Social Media",
  "Content Creation",
  "Sales",
  "Customer Support",
  "Recruiting & HR",
  "Real Estate",
  "Travel",
  "Security",
] as const;

export type Category = typeof CATEGORIES[number];

// Icon mapping for categories (Heroicons 2)
export const CATEGORY_ICONS: Readonly<Record<Category, string>> = {
  "Artificial Intelligence": "HiSparkles",
  "SaaS": "HiCloud",
  "Developer Tools": "HiWrenchScrewdriver",
  "Fintech": "HiCreditCard",
  "Productivity": "HiBolt",
  "Marketing": "HiMegaphone",
  "E-commerce": "HiShoppingCart",
  "Design Tools": "HiPaintBrush",
  "No-Code": "HiPuzzlePiece",
  "Analytics": "HiChartBar",
  "Education": "HiAcademicCap",
  "Health & Fitness": "HiHeart",
  "Social Media": "HiDevicePhoneMobile",
  "Content Creation": "HiPencilSquare",
  "Sales": "HiBanknotes",
  "Customer Support": "HiChatBubbleLeftRight",
  "Recruiting & HR": "HiUserGroup",
  "Real Estate": "HiHomeModern",
  "Travel": "HiPaperAirplane",
  "Security": "HiLockClosed",
} as const;

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasMore: boolean;
}
