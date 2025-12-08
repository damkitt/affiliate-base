import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry, validateCreateBody } from "@/lib/utils";
import { calculateQualityScore, calculateTrendingScore, calculateTrustScore, calculateRecencyBoost } from "@/lib/scoring";

/**
 * GET /api/programs
 * Retrieves all approved programs sorted by trendingScore
 * Featured programs appear at the top, followed by organic ranking
 * @returns NextResponse with the list of approved programs
 */
export async function GET(): Promise<NextResponse> {
  // Get all approved programs, sort by: featured first, then trendingScore DESC
  const programs = await prisma.program.findMany({
    where: {
      approvalStatus: true,
    },
    select: {
      id: true,
      slug: true,
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
      qualityScore: true,
      trendingScore: true,
      totalViews: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      { trendingScore: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Separate featured and organic programs
  const now = new Date();
  const featured = programs.filter(
    (p) => p.isFeatured && p.featuredExpiresAt && p.featuredExpiresAt > now
  );
  const organic = programs.filter(
    (p) => !(p.isFeatured && p.featuredExpiresAt && p.featuredExpiresAt > now)
  );

  // Combine: featured first, then organic
  const sortedPrograms = [...featured, ...organic];

  activeProgramsGauge.set(sortedPrograms.length);

  return NextResponse.json(sortedPrograms);
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

  // Generate unique slug from program name
  const baseSlug = programName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;

  // Check for duplicates and make slug unique
  while (await prisma.program.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Prepare program data
  const programData = {
    programName: programName.trim(),
    slug,
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
  };

  // Calculate quality score and initial trending score before saving
  const qualityScore = calculateQualityScore(programData);
  const trustScore = calculateTrustScore(programData);
  const recencyBoost = calculateRecencyBoost(new Date()); // New programs get max recency boost
  // Initial trending score: quality + trust + recency (no engagement yet)
  const trendingScore = qualityScore + trustScore + recencyBoost;

  const program = await prisma.program.create({
    data: {
      ...programData,
      qualityScore,
      trendingScore,
    },
  });

  programsCreatedTotal.inc();

  return NextResponse.json(program, { status: 201 });
}
