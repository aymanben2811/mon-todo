import { supabase } from "./supabase";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

// Récupère toutes les catégories de l'utilisateur connecté
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Ajoute une nouvelle catégorie pour l'utilisateur connecté
export async function addCategory(name: string, color: string): Promise<Category> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, color, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Met à jour le nom et la couleur d'une catégorie
export async function updateCategory(
  id: string,
  updates: { name: string; color: string }
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Supprime une catégorie
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
