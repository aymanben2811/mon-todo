import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  is_premium: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string;
};

// Récupère l'id de l'utilisateur connecté
async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Utilisateur non connecté");
  return data.user.id;
}

// Récupère le profil de l'utilisateur connecté (null si jamais créé)
export async function fetchProfile(): Promise<Profile | null> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Met à jour le prénom et le nom de l'utilisateur connecté
export async function updateProfile(updates: {
  first_name: string;
  last_name: string;
}): Promise<Profile> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Upload une nouvelle photo de profil et met à jour le profil
export async function uploadAvatar(file: File): Promise<Profile> {
  const userId = await getUserId();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      avatar_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
