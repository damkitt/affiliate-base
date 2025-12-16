import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRODUCT_ID = process.env.STRIPE_PRODUCT_ID!;

interface FeaturedProgramRequest {
  programId?: string;
  programData?: Prisma.ProgramCreateInput;
}

export async function GET() {
  const now = new Date();

  const featuredPrograms = await prisma.program.findMany({
    where: {
      approvalStatus: true,
      isFeatured: true,
      featuredExpiresAt: { gt: now },
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
      logoUrl: true,
      commissionRate: true,
      commissionDuration: true,
      isFeatured: true,
      featuredExpiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(featuredPrograms);
}

export async function POST(request: Request) {
  const body: FeaturedProgramRequest = await request.json();
  const { programId, programData } = body;

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product: PRODUCT_ID,
          unit_amount: 29900,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    invoice_creation: {
      enabled: true,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/advertise/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/advertise/cancel`,
    metadata: {
      programId: programId || "",
      programData: programData ? JSON.stringify(programData) : "",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}

export async function afterPaymentSuccess(
  programId: string,
  programData?: Prisma.ProgramCreateInput
) {
  const featuredExpiresAt = new Date();
  featuredExpiresAt.setDate(featuredExpiresAt.getDate() + 30);

  const program = await prisma.$transaction(async (prisma) => {
    if (programId) {
      return await prisma.program.update({
        where: { id: programId },
        data: {
          isFeatured: true,
          featuredExpiresAt,
        },
      });
    } else if (programData) {
      return await prisma.program.create({
        data: {
          ...programData,
          isFeatured: true,
          featuredExpiresAt,
        },
      });
    } else {
      throw new Error("Missing programId or programData");
    }
  });

  return NextResponse.json(program);
}
