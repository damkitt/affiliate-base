import { z } from "zod";

export const categories = [
    "Artificial Intelligence",
    "Marketing",
    "E-commerce",
    "Design Tools",
    "Developer Tools",
    "Fintech",
    "Productivity",
    "No-Code",
    "Analytics",
    "SaaS",
    "Hosting & Web",
    "Utilities",
] as const;

export const programSchema = z.object({
    programName: z.string().trim().min(2, "Name must be at least 2 chars").max(30, "Name too long"),
    tagline: z.string().trim().min(5, "Tagline too short").max(50, "Tagline too long").optional().default("No tagline provided."),
    description: z.string().trim().max(2000, "Description too long").optional().default("No description provided."),
    category: z.enum(categories),
    websiteUrl: z.string().trim().url("Invalid Website URL"),
    affiliateUrl: z.string().trim().url("Invalid Affiliate URL"),
    logoUrl: z.string().trim().url("Invalid Logo URL").nullable().optional(),
    commissionType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
    commissionRate: z.number().min(0),
    commissionDuration: z.enum(["One-time", "Recurring"]).nullable().optional(),
    cookieDuration: z.number().nullable().optional(),
    payoutMethod: z.string().trim().nullable().optional(),
    minPayoutValue: z.number().nullable().optional(),
    avgOrderValue: z.number().nullable().optional(),
    targetAudience: z.string().trim().max(80, "Target audience too long").nullable().optional(),
    additionalInfo: z.string().trim().nullable().optional(),
    affiliatesCountRange: z.string().trim().nullable().optional(),
    payoutsTotalRange: z.string().trim().nullable().optional(),
    foundingDate: z.string().datetime().nullable().optional(),
    approvalTimeRange: z.string().trim().nullable().optional(),
    country: z.string().trim().optional().default("Other"),
    email: z.string().trim().email("Invalid email").nullable().optional(),
    xHandle: z.string().trim().nullable().optional(),
});

export type ProgramInput = z.infer<typeof programSchema>;
