import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry, validateCreateBody } from "@/lib/utils";

/**
 * GET /api/programs
 * Retrieves all approved programs
 * @returns NextResponse with the list of approved programs
 */
export async function GET(): Promise<NextResponse> {
  const programs = await prisma.program.findMany({
    where: { approvalStatus: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      programName: true,
      tagline: true,
      description: true,
      category: true,
      websiteUrl: true,
      affiliateUrl: true,
      country: true,
      xHandle: true,
      email: true,
      logoUrl: true,
      commissionRate: true,
      commissionDuration: true,
      cookieDuration: true,
      payoutMethod: true,
      minPayoutValue: true,
      avgOrderValue: true,
      targetAudience: true,
      additionalInfo: true,
      affiliatesCountRange: true,
      payoutsTotalRange: true,
      foundingDate: true,
      approvalTimeRange: true,
      approvalStatus: true,
      isFeatured: true,
      featuredExpiresAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  activeProgramsGauge.set(programs.length);

  if (!programs) {
    return NextResponse.json({ error: "No programs found" }, { status: 404 });
  }

  return NextResponse.json(programs);
}

/**
 * POST /api/programs
 * Creates a new program
 * @param request - The incoming request
 * @returns NextResponse with the created program or error message
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  if (!validateCreateBody(body)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const {
    programName,
    websiteUrl,
    affiliateUrl,
    country,
    category,
    tagline,
    description,
    xHandle,
    email,
    logoUrl,
    commissionRate,
    commissionDuration,
    cookieDuration,
    payoutMethod,
    minPayoutValue,
    avgOrderValue,
    targetAudience,
    additionalInfo,
    affiliatesCountRange,
    payoutsTotalRange,
    foundingDate,
    approvalTimeRange,
  } = body;

  const program = await prisma.program.create({
    data: {
      programName: programName.trim(),
      tagline: tagline?.trim() || "No tagline provided.",
      description: description?.trim() || "No description provided.",
      category: category || "Not specified",
      websiteUrl: websiteUrl.trim(),
      affiliateUrl: affiliateUrl.trim(),
      country: validateCountry(country),
      xHandle: xHandle?.trim() || null,
      email: email?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
      commissionRate: commissionRate ?? 0,
      commissionDuration: commissionDuration || null,
      cookieDuration: cookieDuration ?? null,
      payoutMethod: payoutMethod || null,
      minPayoutValue: minPayoutValue ?? null,
      avgOrderValue: avgOrderValue ?? null,
      targetAudience: targetAudience || null,
      additionalInfo: additionalInfo || null,
      affiliatesCountRange: affiliatesCountRange || null,
      payoutsTotalRange: payoutsTotalRange || null,
      foundingDate: foundingDate ? new Date(foundingDate) : null,
      approvalTimeRange: approvalTimeRange || null,
      approvalStatus: true,
    },
  });

  programsCreatedTotal.inc();

  return NextResponse.json(program, { status: 201 });
}
