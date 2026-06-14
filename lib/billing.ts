import { supabase } from "./supabase";

// Redirige l'utilisateur vers la page de paiement Stripe pour passer premium
export async function redirectToCheckout(): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  const token = data.session?.access_token;
  if (!token) throw new Error("Utilisateur non connecté");

  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await response.json();
  if (!response.ok || !result.url) {
    throw new Error(result.error ?? "Erreur lors de la création du paiement");
  }

  window.location.href = result.url;
}
