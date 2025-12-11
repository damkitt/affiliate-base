import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry, validateCreateBody } from "@/lib/utils";
import { calculateQualityScore, calculateTrendingScore, calculateTrustScore, calculateRecencyBoost } from "@/lib/scoring";
import { cleanAndValidateUrl } from "@/lib/url-validator";
import { validateUrlReachability } from "@/lib/network-validator";

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
  try {
    const body = await request.json();

    // Strict URL Validation & Cleaning
    try {
      if (body.websiteUrl) body.websiteUrl = cleanAndValidateUrl(body.websiteUrl);
      if (body.affiliateUrl) body.affiliateUrl = cleanAndValidateUrl(body.affiliateUrl);

      // Smart Ping: Verify URLs are reachable
      // We run checks in parallel to minimize latency
      await Promise.all([
        body.websiteUrl
          ? validateUrlReachability(body.websiteUrl, "Website")
          : Promise.resolve(),
        body.affiliateUrl
          ? validateUrlReachability(body.affiliateUrl, "Affiliate Link")
          : Promise.resolve(),
      ]);

    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Detailed Validation
    const requiredFields = [
      "programName",
      "websiteUrl",
      "affiliateUrl",
      "category",
      "commissionRate",
      "logoUrl",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = body[field];
      if (typeof value === "string") return !value.trim();
      return value === null || value === undefined;
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
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
  } catch (error: any) {
    console.error("[API] POST Error:", error);

    // Handle Unique Constraint (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];

        if (target && Array.isArray(target)) {
          if (target.includes("program_name")) {
            return NextResponse.json(
              { error: "A program with this name already exists. Please choose a different name." },
              { status: 409 }
            );
          }
          if (target.includes("website_url")) {
            return NextResponse.json(
              { error: "This Website URL is already registered." },
              { status: 409 }
            );
          }
          if (target.includes("affiliate_url")) {
            return NextResponse.json(
              { error: "This Affiliate Link is already registered." },
              { status: 409 }
            );
          }
        }

        return NextResponse.json(
          { error: "A program with these details already exists." },
          { status: 409 }
        );
      }
    }

    // Generic Fallback (Mask internal details)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
