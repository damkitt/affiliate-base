export interface Program {
  id: string;
  programName: string;
  tagline: string;
  description: string;
  category: string;
  websiteUrl: string;
  affiliateUrl: string;
  country: string;
  xHandle?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  commissionRate: number;
  commissionDuration?: string | null;
  cookieDuration?: number | null;
  payoutMethod?: string | null;
  minPayoutValue?: number | null;
  avgOrderValue?: number | null;
  targetAudience?: string | null;
  additionalInfo?: string | null;
  affiliatesCountRange?: string | null;
  payoutsTotalRange?: string | null;
  foundingDate?: Date | null;
  approvalTimeRange?: string | null;
  clicksCount: number;
  approvalStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

// Icon names from react-icons/hi2 (Heroicons 2)
export const CATEGORY_ICONS: Record<string, string> = {
  "Artificial Intelligence": "HiSparkles",
  SaaS: "HiCloud",
  "Developer Tools": "HiWrenchScrewdriver",
  Fintech: "HiCreditCard",
  Productivity: "HiBolt",
  Marketing: "HiMegaphone",
  "E-commerce": "HiShoppingCart",
  "Design Tools": "HiPaintBrush",
  "No-Code": "HiPuzzlePiece",
  Analytics: "HiChartBar",
  Education: "HiAcademicCap",
  "Health & Fitness": "HiHeart",
  "Social Media": "HiDevicePhoneMobile",
  "Content Creation": "HiPencilSquare",
  Sales: "HiBanknotes",
  "Customer Support": "HiChatBubbleLeftRight",
  "Recruiting & HR": "HiUserGroup",
  "Real Estate": "HiHomeModern",
  Travel: "HiPaperAirplane",
  Security: "HiLockClosed",
};
