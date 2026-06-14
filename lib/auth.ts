import { supabase } from "./supabase";

// Crée un nouveau compte utilisateur
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });
  if (error) throw error;

  // Envoie l'email de bienvenue sans bloquer l'inscription en cas d'échec
  fetch("/api/welcome-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, firstName }),
  }).catch(() => {});

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
