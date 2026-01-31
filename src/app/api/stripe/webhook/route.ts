import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const customer = await stripe.customers.retrieve(customerId);
    const email =
      typeof customer === "object" && "email" in customer
        ? customer.email
        : null;

    if (email) {
      const status = subscription.status === "active" ? "active" : "inactive";

      await supabase
        .from("GHL_Subscription")
        .upsert(
          {
            email,
            status,
          },
          { onConflict: "email" }
        );
    }
  }

  return new NextResponse("OK", { status: 200 });
}