import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const { programId, programData } = session.metadata || {};

      const featuredExpiresAt = new Date();
      featuredExpiresAt.setDate(featuredExpiresAt.getDate() + 30);

      try {
        if (programId) {
          await prisma.program.update({
            where: { id: programId },
            data: {
              isFeatured: true,
              featuredExpiresAt,
            },
          });
        } else if (programData) {
          const data = JSON.parse(programData);
          await prisma.program.create({
            data: {
              ...data,
              isFeatured: true,
              featuredExpiresAt,
            },
          });
        }

        console.log(`Featured program activated: ${programId || "new"}`);
      } catch (err) {
        console.error("Error activating featured program:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
