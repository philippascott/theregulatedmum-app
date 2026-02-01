import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "../../lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("👂 Stripe webhook received");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createSupabaseAdminClient();

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const subscriptionId = subscription.id;
    const subscriptionStatus = subscription.status;

    const subscriptionData = subscription as any;
    const currentPeriodEnd = new Date(
      subscriptionData.current_period_end * 1000
    ).toISOString();

    // Get product ID from the first subscription item
    const productId = subscription.items.data[0]?.price.product as string;

    const customer = await stripe.customers.retrieve(customerId);
    const email =
      typeof customer === "object" && "email" in customer
        ? (customer.email as string | null)
        : null;

    if (email) {
      const dataToWrite = {
        email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: subscriptionStatus,
        current_period_end: currentPeriodEnd,
        product_id: productId,
      };

      console.log("📦 Writing to Supabase:", dataToWrite);

      const { error } = await supabase
        .from("GHL_Subscription")
        .upsert(dataToWrite, { onConflict: "email" });

      if (error) {
        console.error("❌ Supabase error:", error);
      } else {
        console.log("✅ Successfully wrote to Supabase");
      }
    } else {
      console.warn("⚠️ No email found for customer", customerId);
    }
  }

  return res.status(200).send("OK");
}
