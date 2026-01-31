import type { NextApiRequest, NextApiResponse } from "next";
const Stripe = require("stripe");
const { createSupabaseAdminClient } = require("../src/lib/supabaseAdmin");

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to read raw body safely in Vercel
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
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createSupabaseAdminClient();

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object;
    const customerId = subscription.customer;

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

  return res.status(200).send("OK");
}
