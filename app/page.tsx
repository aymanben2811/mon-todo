"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { addTodo, deleteTodo, fetchTodos, toggleTodo, type Todo } from "@/lib/todos";
import AuthForm from "@/components/AuthForm";
import TodoList from "@/components/TodoList";

function libelleRestantes(n: number) {
  if (n === 0) return "Aucune tâche restante";
  if (n === 1) return "1 tâche restante";
  return `${n} tâches restantes`;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [verificationSession, setVerificationSession] = useState(true);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [chargementTodos, setChargementTodos] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierAjouteId, setDernierAjouteId] = useState<string | null>(null);
  const [idsEnSuppression, setIdsEnSuppression] = useState<Set<string>>(
    new Set()
  );

  // Récupère la session au chargement et écoute les changements d'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setVerificationSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nouvelleSession) => {
      setSession(nouvelleSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Charge les tâches une fois l'utilisateur connecté
  useEffect(() => {
    if (!session) {
      setTodos([]);
      return;
    }

    setChargementTodos(true);
    fetchTodos()
      .then(setTodos)
      .catch((err) =>
        setErreur(err instanceof Error ? err.message : "Erreur de chargement")
      )
      .finally(() => setChargementTodos(false));
  }, [session]);

  const tachesRestantes = todos.filter((t) => !t.completed).length;

  async function ajouterTache(e: React.FormEvent) {
    e.preventDefault();
    const titre = nouvelleTache.trim();
    if (!titre) return;

    setErreur(null);
    try {
      const todo = await addTodo(titre);
      setTodos((prev) => [todo, ...prev]);
      setDernierAjouteId(todo.id);
      setNouvelleTache("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  }

  async function basculerTache(todo: Todo) {
    setErreur(null);
    try {
      const miseAJour = await toggleTodo(todo.id, !todo.completed);
      setTodos((prev) =>
        prev.map((t) => (t.id === miseAJour.id ? miseAJour : t))
      );
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    }
  }

  async function supprimerTache(id: string) {
    setErreur(null);
    setIdsEnSuppression((prev) => new Set(prev).add(id));

    try {
      await deleteTodo(id);
      setTimeout(() => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        setIdsEnSuppression((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 350);
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      setIdsEnSuppression((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (verificationSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100 px-4 py-16 dark:from-violet-950 dark:via-indigo-950 dark:to-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[400px] rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-600/10"
      />

      <main className="relative w-full max-w-lg rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-violet-200/40 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-violet-950/40">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mes Tâches
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {todos.length > 0 && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 transition-all duration-300 dark:bg-violet-900/50 dark:text-violet-300">
                {libelleRestantes(tachesRestantes)}
              </span>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <form
          onSubmit={ajouterTache}
          className="mb-6 flex gap-2 rounded-xl border border-zinc-200/80 bg-white/80 p-2 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/60"
        >
          <input
            type="text"
            value={nouvelleTache}
            onChange={(e) => setNouvelleTache(e.target.value)}
            placeholder="Ajouter une tâche..."
            className="flex-1 rounded-lg bg-transparent px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none dark:text-zinc-50"
          />
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95"
          >
            Ajouter
          </button>
        </form>

        {erreur && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {erreur}
          </p>
        )}

        {chargementTodos ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Chargement des tâches...
          </p>
        ) : (
          <TodoList
            todos={todos}
            newlyAddedId={dernierAjouteId}
            deletingIds={idsEnSuppression}
            onToggle={basculerTache}
            onDelete={supprimerTache}
            onItemAnimationEnd={(id) => {
              if (id === dernierAjouteId) setDernierAjouteId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
