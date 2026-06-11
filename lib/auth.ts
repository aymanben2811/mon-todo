import { supabase } from "./supabase";

// Crée un nouveau compte utilisateur
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Connecte un utilisateur existant
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Déconnecte l'utilisateur courant
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
