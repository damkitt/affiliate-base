import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Find Programs with approvalStatus true
 * @returns {Promise<NextResponse>} List of approved programs
 */
export async function GET() {
  const programs = await prisma.program.findMany({
    where: {
      approvalStatus: true,
    },
  });

  if (programs.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(programs);
}

/**
 * Create a new Program with approvalStatus true
 * @param request
 * @returns {Promise<NextResponse>} The created program
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.programName || !body.websiteUrl || !body.affiliateUrl) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: programName, websiteUrl, affiliateUrl",
        },
        { status: 400 }
      );
    }

    // Validate country enum
    const validCountries = [
      "US",
      "GB",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "BE",
      "AT",
      "CH",
      "SE",
      "NO",
      "DK",
      "FI",
      "PL",
      "CZ",
      "PT",
      "IE",
      "RU",
      "UA",
      "CA",
      "MX",
      "BR",
      "AR",
      "CO",
      "CL",
      "AU",
      "NZ",
      "JP",
      "KR",
      "CN",
      "HK",
      "SG",
      "IN",
      "ID",
      "TH",
      "VN",
      "MY",
      "PH",
      "AE",
      "SA",
      "IL",
      "TR",
      "EG",
      "ZA",
      "NG",
      "KE",
      "Other",
    ];

    const country =
      body.country && validCountries.includes(body.country)
        ? body.country
        : "Other";

    const program = await prisma.program.create({
      data: {
        programName: body.programName,
        tagline: body.tagline || "No tagline provided.",
        description: body.description || "No description provided.",
        category: body.category || "Not specified",
        websiteUrl: body.websiteUrl,
        affiliateUrl: body.affiliateUrl,
        country,
        xHandle: body.xHandle,
        email: body.email,
        logoUrl: body.logoUrl,
        commissionRate: body.commissionRate || 0,
        commissionDuration: body.commissionDuration,
        cookieDuration: body.cookieDuration,
        payoutMethod: body.payoutMethod,
        minPayoutValue: body.minPayoutValue,
        avgOrderValue: body.avgOrderValue,
        targetAudience: body.targetAudience,
        additionalInfo: body.additionalInfo,
        affiliatesCountRange: body.affiliatesCountRange,
        payoutsTotalRange: body.payoutsTotalRange,
        foundingDate: body.foundingDate ? new Date(body.foundingDate) : null,
        approvalTimeRange: body.approvalTimeRange,
        approvalStatus: true,
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    );
  }
}
