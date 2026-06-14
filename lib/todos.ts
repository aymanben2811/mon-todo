import { supabase } from "./supabase";

export type Priority = "urgent" | "tres_important" | "important";

// Niveaux de priorité disponibles, du plus prioritaire au moins prioritaire
export const PRIORITES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "Urgent", color: "#ef4444" },
  { value: "tres_important", label: "Très important", color: "#f97316" },
  { value: "important", label: "Important", color: "#eab308" },
];

const RANG_PRIORITE: Record<Priority, number> = {
  urgent: 3,
  tres_important: 2,
  important: 1,
};

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  category_id: string | null;
  priority: Priority | null;
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
export async function addTodo(
  title: string,
  categoryId: string | null = null,
  priority: Priority | null = null
): Promise<Todo> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non connecté");

  const { data, error } = await supabase
    .from("todos")
    .insert({ title, user_id: userData.user.id, category_id: categoryId, priority })
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

// Met à jour la catégorie d'un todo
export async function updateTodoCategory(id: string, categoryId: string | null): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ category_id: categoryId })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Met à jour la priorité d'un todo
export async function updateTodoPriority(id: string, priority: Priority | null): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ priority })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Trie les tâches par priorité (urgent en premier, sans priorité en dernier)
export function sortByPriority(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const rangA = a.priority ? RANG_PRIORITE[a.priority] : 0;
    const rangB = b.priority ? RANG_PRIORITE[b.priority] : 0;
    if (rangA !== rangB) return rangB - rangA;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
