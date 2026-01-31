export default async function handler(req, res) {
 console.log("👂 Stripe webhook received");
  import { buffer } from "micro";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "../src/lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
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
    const email = customer.email;

    if (email) {
      const status = subscription.status === "active" ? "active" : "inactive";

      await supabase
        .from("GHL_Subscription")
        .upsert(
          { email, status },
          { onConflict: "email" }
        );
    }
  }

  res.status(200).send("OK");
}
