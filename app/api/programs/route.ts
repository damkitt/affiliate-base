import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry } from "@/lib/utils";
import { calculateQualityScore, calculateTrendingScore } from "@/lib/scoring";
import { cleanAndValidateUrl } from "@/lib/url-validator";
import { programSchema } from "@/lib/validation-schemas";
import { Program } from "@/types";
import { processLeaderboardPrograms } from "@/lib/data-fetching";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

const PROGRAM_SELECT = {
  id: true,
  programName: true,
  slug: true,
  logoUrl: true,
  commissionRate: true,
  commissionType: true,
  commissionDuration: true,
  category: true,
  tagline: true,
  isFeatured: true,
  featuredExpiresAt: true,
  createdAt: true,
  trendingScore: true,
} as const;

type ProgramListItem = Prisma.ProgramGetPayload<{
  select: typeof PROGRAM_SELECT;
}>;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "200", 10);
  const now = new Date();

  const where: Prisma.ProgramWhereInput = {
    approvalStatus: true,
    ...(category && { category }),
    ...(search && {
      OR: [
        { programName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // 1. Fetch Featured Programs (only for Page 1)
  let featuredPrograms: ProgramListItem[] = [];
  if (page === 1) {
    featuredPrograms = await prisma.program.findMany({
      where: {
        ...where,
        isFeatured: true,
        featuredExpiresAt: { gt: now },
      },
      select: PROGRAM_SELECT,
    });
  }

  // 2. Fetch Organic Programs
  const topPrograms = await prisma.program.findMany({
    where,
    orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
    take: limit,
    skip: (page - 1) * limit,
    select: PROGRAM_SELECT,
  });

  // 3. Combine and Deduplicate (Robustly)
  const dedupeMap = new Map<string, any>();

  // Fill with organic first
  topPrograms.forEach(p => dedupeMap.set(p.id, p));
  // Overwrite with featured (if any) to ensure featured fields/status are correct
  featuredPrograms.forEach(p => dedupeMap.set(p.id, p));

  const allPrograms = Array.from(dedupeMap.values());

  const finalList = processLeaderboardPrograms(allPrograms, page);

  activeProgramsGauge.set(finalList.length);

  return NextResponse.json(finalList, { headers: CACHE_HEADERS });
}


export async function POST(request: Request): Promise<NextResponse> {
  try {
    const validation = programSchema.safeParse(await request.json());

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const body = validation.data;

    try {
      body.websiteUrl = cleanAndValidateUrl(body.websiteUrl);
      body.affiliateUrl = cleanAndValidateUrl(body.affiliateUrl);
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(body.programName);

    const programData = {
      ...body,
      slug,
      country: validateCountry(body.country),
      foundingDate: body.foundingDate ? new Date(body.foundingDate) : null,
      approvalStatus: true,
      manualScoreBoost: 0,
    };

    const program = await prisma.program.create({
      data: {
        ...programData,
        qualityScore: calculateQualityScore(programData as unknown as Program),
        trendingScore: calculateTrendingScore(programData as unknown as Program, 0, 0),
      },
    });

    programsCreatedTotal.inc();

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("[POST /api/programs]", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target as string[] | undefined;
      const messages: Record<string, string> = {
        program_name: "A program with this name already exists.",
        website_url: "This Website URL is already registered.",
        affiliate_url: "This Affiliate Link is already registered.",
      };

      const field = target?.find((t) => messages[t]);
      return NextResponse.json(
        {
          error: field
            ? messages[field]
            : "A program with these details already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "program";

  let slug = base;
  let i = 1;

  while (await prisma.program.findFirst({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}
