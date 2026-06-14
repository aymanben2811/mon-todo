import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Reçoit les évènements Stripe et met à jour le statut premium du profil
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const estActif =
        subscription.status === "active" || subscription.status === "trialing";

      await supabaseAdmin
        .from("profiles")
        .update({ is_premium: estActif })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
