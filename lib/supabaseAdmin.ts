import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Client Supabase avec la clé service_role : contourne la RLS,
// réservé aux routes API serveur (ex. webhook Stripe)
export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return client;
}
