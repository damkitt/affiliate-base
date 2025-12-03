/**
 * Programs API
 * 
 * GET: Fetch all approved programs sorted by interest
 * POST: Create a new program
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";

// =============================================================================
// Constants
// =============================================================================

const VALID_COUNTRIES = [
  "US", "GB", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "CH",
  "SE", "NO", "DK", "FI", "PL", "CZ", "PT", "IE", "RU", "UA",
  "CA", "MX", "BR", "AR", "CO", "CL", "AU", "NZ", "JP", "KR",
  "CN", "HK", "SG", "IN", "ID", "TH", "VN", "MY", "PH", "AE",
  "SA", "IL", "TR", "EG", "ZA", "NG", "KE", "Other",
] as const;

type ValidCountry = typeof VALID_COUNTRIES[number];

// =============================================================================
// Types
// =============================================================================

interface CreateProgramBody {
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
}

// =============================================================================
// Validation
// =============================================================================

function validateCountry(country: string | undefined): ValidCountry {
  if (country && VALID_COUNTRIES.includes(country as ValidCountry)) {
    return country as ValidCountry;
  }
  return "Other";
}

function validateCreateBody(body: unknown): body is CreateProgramBody {
  if (typeof body !== "object" || body === null) return false;
  
  const { programName, websiteUrl, affiliateUrl } = body as CreateProgramBody;
  
  return Boolean(
    programName?.trim() &&
    websiteUrl?.trim() &&
    affiliateUrl?.trim()
  );
}

// =============================================================================
// GET: List Programs
// =============================================================================

export async function GET(): Promise<NextResponse> {
  try {
    const programs = await prisma.program.findMany({
      where: { approvalStatus: true },
      orderBy: { clicksCount: "desc" },
    });

    // Update active programs gauge
    activeProgramsGauge.set(programs.length);

    return NextResponse.json(programs);
  } catch (error) {
    console.error("[Programs] Error fetching:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST: Create Program
// =============================================================================

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!validateCreateBody(body)) {
      return NextResponse.json(
        { error: "Missing required fields: programName, websiteUrl, affiliateUrl" },
        { status: 400 }
      );
    }

    const program = await prisma.program.create({
      data: {
        programName: body.programName.trim(),
        tagline: body.tagline?.trim() || "No tagline provided.",
        description: body.description?.trim() || "No description provided.",
        category: body.category || "Not specified",
        websiteUrl: body.websiteUrl.trim(),
        affiliateUrl: body.affiliateUrl.trim(),
        country: validateCountry(body.country),
        xHandle: body.xHandle?.trim() || null,
        email: body.email?.trim() || null,
        logoUrl: body.logoUrl?.trim() || null,
        commissionRate: body.commissionRate ?? 0,
        commissionDuration: body.commissionDuration || null,
        cookieDuration: body.cookieDuration ?? null,
        payoutMethod: body.payoutMethod || null,
        minPayoutValue: body.minPayoutValue ?? null,
        avgOrderValue: body.avgOrderValue ?? null,
        targetAudience: body.targetAudience || null,
        additionalInfo: body.additionalInfo || null,
        affiliatesCountRange: body.affiliatesCountRange || null,
        payoutsTotalRange: body.payoutsTotalRange || null,
        foundingDate: body.foundingDate ? new Date(body.foundingDate) : null,
        approvalTimeRange: body.approvalTimeRange || null,
        approvalStatus: true,
      },
    });

    // Track in Prometheus
    programsCreatedTotal.inc();

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("[Programs] Error creating:", error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Program with this name or URL already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
