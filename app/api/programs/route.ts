import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry, validateCreateBody } from "@/lib/utils";
import {
  calculateQualityScore,
  calculateTrendingScore,
  calculateTrustScore,
  calculateRecencyBoost,
} from "@/lib/scoring";
import { cleanAndValidateUrl } from "@/lib/url-validator";

export async function GET(): Promise<NextResponse> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Fetch all active programs to handle sorting and filtering in memory
  // In a larger app, we'd do this via Prisma queries, but for this size, 
  // memory sorting allows for more complex "zipper" logic easily.
  const allPrograms = await prisma.program.findMany({
    where: { approvalStatus: true },
    orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      programName: true,
      slug: true,
      logoUrl: true,
      commissionRate: true,
      commissionDuration: true,
      category: true,
      tagline: true,
      description: true, // Keep for search
      isFeatured: true,
      featuredExpiresAt: true,
      createdAt: true,
      trendingScore: true,
    }
  });

  // Query A: Sponsored (Top 3)
  const sponsored = allPrograms
    .filter(p => p.isFeatured && p.featuredExpiresAt && p.featuredExpiresAt > now)
    .slice(0, 3);

  // Query B: Organic Leaders (All non-sponsored active programs)
  // These are already sorted by trendingScore DESC from the DB query
  const organic = allPrograms.filter(p => !sponsored.some(s => s.id === p.id));

  // Query C: The Injection Queue (Underdogs - Newcomers < 24h)
  // Sorted by trendingScore DESC then createdAt DESC
  const newcomers = organic
    .filter(p => p.createdAt >= twentyFourHoursAgo)
    .sort((a, b) => {
      if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  // Smart Zipper Merge Logic
  const finalList: any[] = [...sponsored];
  const seenIds = new Set(sponsored.map(p => p.id));

  let organicIndex = 0;
  let newcomerIndex = 0;
  const injectionSlots = [8, 13, 18, 23, 28, 33, 38, 43, 48]; // Target slots (1-indexed)

  while (finalList.length < allPrograms.length) {
    const nextSlot = finalList.length + 1;

    // Check for Injection Slot
    if (injectionSlots.includes(nextSlot) && newcomerIndex < newcomers.length) {
      // Find the next unique newcomer
      let candidate = newcomers[newcomerIndex++];
      while (candidate && seenIds.has(candidate.id) && newcomerIndex < newcomers.length) {
        candidate = newcomers[newcomerIndex++];
      }

      if (candidate && !seenIds.has(candidate.id)) {
        finalList.push({ ...candidate, isInjected: true });
        seenIds.add(candidate.id);
        continue; // Move to next slot
      }
    }

    // Standard Organic Flow
    if (organicIndex < organic.length) {
      const p = organic[organicIndex++];
      if (!seenIds.has(p.id)) {
        finalList.push(p);
        seenIds.add(p.id);
      }
    } else {
      break; // No more programs
    }
  }

  activeProgramsGauge.set(finalList.length);

  return NextResponse.json(finalList);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    try {
      if (body.websiteUrl)
        body.websiteUrl = cleanAndValidateUrl(body.websiteUrl);
      if (body.affiliateUrl)
        body.affiliateUrl = cleanAndValidateUrl(body.affiliateUrl);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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

    // Validate tagline length (max 50 characters)
    if (tagline && tagline.length > 50) {
      return NextResponse.json(
        { error: "Tagline must be 50 characters or less." },
        { status: 400 }
      );
    }

    // Validate program name length (max 30 characters)
    if (programName && programName.length > 30) {
      return NextResponse.json(
        { error: "Program name must be 30 characters or less." },
        { status: 400 }
      );
    }

    // Validate description length (max 2000 characters)
    if (description && description.length > 2000) {
      return NextResponse.json(
        { error: "Description must be 2000 characters or less." },
        { status: 400 }
      );
    }

    const baseSlug = programName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.program.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

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
      manualScoreBoost: 0,
    };

    const qualityScore = calculateQualityScore(programData);
    const trustScore = calculateTrustScore(programData);
    const trendingScore = calculateTrendingScore(
      { ...programData, createdAt: new Date() },
      0,
      0
    );

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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = error.meta?.target as string[];

        if (target && Array.isArray(target)) {
          if (target.includes("program_name")) {
            return NextResponse.json(
              {
                error:
                  "A program with this name already exists. Please choose a different name.",
              },
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

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
