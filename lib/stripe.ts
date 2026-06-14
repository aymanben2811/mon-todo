import Stripe from "stripe";

let client: Stripe | null = null;

// Client Stripe côté serveur (ne jamais importer dans un composant client)
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return client;
}
