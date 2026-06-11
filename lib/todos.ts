import { supabase } from "./supabase";

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

// Récupère tous les todos de l'utilisateur connecté
export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Ajoute un nouveau todo pour l'utilisateur connecté
export async function addTodo(title: string): Promise<Todo> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("todos")
    .insert({ title, user_id: userData.user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Met à jour le statut "terminé" d'un todo
export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Met à jour le titre d'un todo
export async function updateTodoTitle(id: string, title: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ title })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Supprime un todo
export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}
