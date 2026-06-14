import { supabase } from "./supabase";

export type AdminUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin";
  todo_count: number;
};

// Récupère la liste de tous les utilisateurs avec leur nombre de tâches (admin uniquement)
export async function fetchAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;
  return data ?? [];
}

// Supprime définitivement le compte d'un utilisateur (admin uniquement)
export async function deleteUserAccount(userId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_user", {
    target_id: userId,
  });
  if (error) throw error;
}
