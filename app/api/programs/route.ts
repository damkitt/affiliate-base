import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { programsCreatedTotal, activeProgramsGauge } from "@/lib/metrics";
import { validateCountry } from "@/lib/utils";
import { calculateQualityScore, calculateTrendingScore } from "@/lib/scoring";
import { cleanAndValidateUrl } from "@/lib/url-validator";
import { programSchema } from "@/lib/validation-schemas";
import { Program } from "@/types";

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
  const search = new URL(request.url).searchParams.get("search")?.trim();
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);

  const where: Prisma.ProgramWhereInput = {
    approvalStatus: true,
    ...(search && {
      OR: [
        { programName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const allPrograms = await prisma.program.findMany({
    where,
    orderBy: [{ trendingScore: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: PROGRAM_SELECT,
  });

  const sponsored = allPrograms
    .filter(
      (p) => p.isFeatured && p.featuredExpiresAt && p.featuredExpiresAt > now
    )
    .slice(0, 3);

  const sponsoredIds = new Set(sponsored.map((p) => p.id));
  const organic = allPrograms.filter((p) => !sponsoredIds.has(p.id));

  const top20Ids = new Set(organic.slice(0, 20).map((p) => p.id));
  const newcomers = organic
    .filter((p) => p.createdAt >= dayAgo && !top20Ids.has(p.id))
    .sort(
      (a, b) =>
        b.trendingScore - a.trendingScore ||
        b.createdAt.getTime() - a.createdAt.getTime()
    );

  const finalList = mergeWithNewcomers(sponsored, organic, newcomers);

  activeProgramsGauge.set(finalList.length);

  return NextResponse.json(finalList, { headers: CACHE_HEADERS });
}

function mergeWithNewcomers(
  sponsored: ProgramListItem[],
  organic: ProgramListItem[],
  newcomers: ProgramListItem[]
) {
  const result: (ProgramListItem & { isInjected?: boolean })[] = [...sponsored];
  const seen = new Set(sponsored.map((p) => p.id));

  let oi = 0;
  let ni = 0;

  while (result.length < sponsored.length + organic.length) {
    const pos = result.length + 1;
    const isInjectionSlot = pos >= 8 && (pos - 8) % 5 === 0;

    if (isInjectionSlot) {
      while (ni < newcomers.length && seen.has(newcomers[ni].id)) ni++;
      if (ni < newcomers.length) {
        result.push({ ...newcomers[ni], isInjected: true });
        seen.add(newcomers[ni++].id);
        continue;
      }
    }

    while (oi < organic.length && seen.has(organic[oi].id)) oi++;
    if (oi >= organic.length) break;

    result.push(organic[oi]);
    seen.add(organic[oi++].id);
  }

  return result;
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
        qualityScore: calculateQualityScore(programData as Program),
        trendingScore: calculateTrendingScore(programData as Program, 0, 0),
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
    .replace(/(^-|-$)/g, "");

  let slug = base;
  let i = 1;

  while (await prisma.program.findFirst({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  return slug;
}
