import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Crée une session de paiement Stripe pour passer au plan premium
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await getSupabaseAdmin()
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    client_reference_id: userData.user.id,
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: userData.user.email }),
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancel`,
  });

  return NextResponse.json({ url: session.url });
}
