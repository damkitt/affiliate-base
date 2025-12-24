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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Construct Prisma Filter
  const where: Prisma.ProgramWhereInput = { approvalStatus: true };
  if (search) {
    where.OR = [
      { programName: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { tagline: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Fetch results with capping for extreme performance
  const allPrograms = await prisma.program.findMany({
    where,
    orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
    take: 200, // Limit to top 200 results for scalability
    select: {
      id: true,
      programName: true,
      slug: true,
      logoUrl: true,
      commissionRate: true,
      commissionDuration: true,
      category: true,
      tagline: true,
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

  // Query B: Organic Leaders
  const organic = allPrograms.filter(p => !sponsored.some(s => s.id === p.id));

  // Query C: The Injection Queue (Underdogs - Newcomers < 24h)
  const top20OrganicIds = new Set(organic.slice(0, 20).map(p => p.id));
  const newcomers = organic
    .filter(p => p.createdAt >= twentyFourHoursAgo && !top20OrganicIds.has(p.id))
    .sort((a, b) => {
      if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  // Smart Zipper Merge Logic
  const finalList: any[] = [...sponsored];
  const seenIds = new Set(sponsored.map(p => p.id));

  let organicIndex = 0;
  let newcomerIndex = 0;
  const injectionSlots = [8, 13, 18, 23, 28, 33, 38, 43, 48];

  while (finalList.length < allPrograms.length) {
    const nextSlot = finalList.length + 1;

    if (injectionSlots.includes(nextSlot) && newcomerIndex < newcomers.length) {
      let candidate = newcomers[newcomerIndex++];
      while (candidate && seenIds.has(candidate.id) && newcomerIndex < newcomers.length) {
        candidate = newcomers[newcomerIndex++];
      }

      if (candidate && !seenIds.has(candidate.id)) {
        finalList.push({ ...candidate, isInjected: true });
        seenIds.add(candidate.id);
        continue;
      }
    }

    if (organicIndex < organic.length) {
      const p = organic[organicIndex++];
      if (!seenIds.has(p.id)) {
        finalList.push(p);
        seenIds.add(p.id);
      }
    } else {
      break;
    }
  }

  activeProgramsGauge.set(finalList.length);

  return NextResponse.json(finalList, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    }
  });
}

import { programSchema } from "@/lib/validation-schemas";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const rawBody = await request.json();

    // 1. Strict Validation & Sanitization with Zod
    const validation = programSchema.safeParse(rawBody);

    if (!validation.success) {
      const error = validation.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error }, { status: 400 });
    }

    const body = validation.data;

    // 2. Further URL Hardening
    try {
      if (body.websiteUrl)
        body.websiteUrl = cleanAndValidateUrl(body.websiteUrl);
      if (body.affiliateUrl)
        body.affiliateUrl = cleanAndValidateUrl(body.affiliateUrl);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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

    // 3. Slug Generation with Collision Protection
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

    const programData: any = {
      programName,
      slug,
      tagline,
      description,
      category,
      websiteUrl,
      affiliateUrl,
      country: validateCountry(country),
      xHandle: xHandle || null,
      email: email || null,
      logoUrl: logoUrl || null,
      commissionRate,
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
    const trendingScore = calculateTrendingScore(programData, 0, 0);

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
