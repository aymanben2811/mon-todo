"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import {
  addTodo,
  deleteTodo,
  fetchTodos,
  PRIORITES,
  sortByPriority,
  toggleTodo,
  updateTodoCategory,
  updateTodoPriority,
  type Priority,
  type Todo,
} from "@/lib/todos";
import { fetchCategories, type Category } from "@/lib/categories";
import { fetchProfile, type Profile } from "@/lib/profile";
import { redirectToCheckout } from "@/lib/billing";
import AuthForm from "@/components/AuthForm";
import ProfileButton from "@/components/ProfileButton";
import TodoList from "@/components/TodoList";
import CategoryFilter, { FILTRE_SANS_CATEGORIE } from "@/components/CategoryFilter";
import CategoryManager from "@/components/CategoryManager";

function libelleRestantes(n: number) {
  if (n === 0) return "Aucune tâche restante";
  if (n === 1) return "1 tâche restante";
  return `${n} tâches restantes`;
}

// Nombre maximum de tâches autorisées pour le plan gratuit
const LIMITE_TACHES_GRATUIT = 12;

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [verificationSession, setVerificationSession] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chargementTodos, setChargementTodos] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState("");
  const [nouvelleTacheCategorie, setNouvelleTacheCategorie] = useState("");
  const [nouvelleTachePriorite, setNouvelleTachePriorite] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [dernierAjouteId, setDernierAjouteId] = useState<string | null>(null);
  const [idsEnSuppression, setIdsEnSuppression] = useState<Set<string>>(
    new Set()
  );
  const [filtreCategorie, setFiltreCategorie] = useState<string | null>(null);
  const [afficherCategories, setAfficherCategories] = useState(false);
  const [chargementPaiement, setChargementPaiement] = useState(false);
  const [messageCheckout] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      return "Paiement réussi ! Votre compte sera mis à jour vers Premium dans quelques instants.";
    }
    if (checkout === "cancel") return "Paiement annulé.";
    return null;
  });

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

  // Charge les tâches et les catégories une fois l'utilisateur connecté
  useEffect(() => {
    if (!session) {
      setTodos([]);
      setCategories([]);
      return;
    }

    setChargementTodos(true);
    Promise.all([fetchTodos(), fetchCategories()])
      .then(([todosData, categoriesData]) => {
        setTodos(todosData);
        setCategories(categoriesData);
      })
      .catch((err) =>
        setErreur(err instanceof Error ? err.message : "Erreur de chargement")
      )
      .finally(() => setChargementTodos(false));
  }, [session]);

  // Charge le profil pour savoir si l'utilisateur est admin ou premium
  useEffect(() => {
    if (!session) return;

    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [session]);

  // Affiche un message après un retour de la page de paiement Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    window.history.replaceState({}, "", window.location.pathname);

    if (checkout === "success") {
      const delai = setTimeout(() => {
        fetchProfile()
          .then(setProfile)
          .catch(() => {});
      }, 2000);
      return () => clearTimeout(delai);
    }
  }, []);

  const tachesRestantes = todos.filter((t) => !t.completed).length;
  const estPremium = profile?.is_premium ?? false;
  const limiteAtteinte =
    profile !== null && !estPremium && todos.length >= LIMITE_TACHES_GRATUIT;

  const todosAffiches = sortByPriority(
    todos.filter((t) => {
      if (filtreCategorie === null) return true;
      if (filtreCategorie === FILTRE_SANS_CATEGORIE) return !t.category_id;
      return t.category_id === filtreCategorie;
    })
  );

  async function ajouterTache(e: React.FormEvent) {
    e.preventDefault();
    const titre = nouvelleTache.trim();
    if (!titre || limiteAtteinte) return;

    setErreur(null);
    try {
      const todo = await addTodo(
        titre,
        nouvelleTacheCategorie || null,
        (nouvelleTachePriorite || null) as Priority | null
      );
      setTodos((prev) => [todo, ...prev]);
      setDernierAjouteId(todo.id);
      setNouvelleTache("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'ajout");
    }
  }

  async function changerCategorieTache(todo: Todo, categoryId: string | null) {
    setErreur(null);
    try {
      const miseAJour = await updateTodoCategory(todo.id, categoryId);
      setTodos((prev) =>
        prev.map((t) => (t.id === miseAJour.id ? miseAJour : t))
      );
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    }
  }

  async function changerPrioriteTache(todo: Todo, priority: Priority | null) {
    setErreur(null);
    try {
      const miseAJour = await updateTodoPriority(todo.id, priority);
      setTodos((prev) =>
        prev.map((t) => (t.id === miseAJour.id ? miseAJour : t))
      );
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    }
  }

  // Redirige vers la page de paiement Stripe pour passer au plan premium
  async function passerPremium() {
    setErreur(null);
    setChargementPaiement(true);
    try {
      await redirectToCheckout();
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : "Erreur lors de la redirection vers le paiement"
      );
      setChargementPaiement(false);
    }
  }

  function ajouterCategorie(categorie: Category) {
    setCategories((prev) =>
      [...prev, categorie].sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  function modifierCategorie(categorie: Category) {
    setCategories((prev) =>
      prev
        .map((c) => (c.id === categorie.id ? categorie : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  function supprimerCategorie(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTodos((prev) =>
      prev.map((t) => (t.category_id === id ? { ...t, category_id: null } : t))
    );
    if (filtreCategorie === id) setFiltreCategorie(null);
    if (nouvelleTacheCategorie === id) setNouvelleTacheCategorie("");
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
      <ProfileButton
        email={session.user.email}
        className="fixed top-5 right-5 z-20 sm:top-6 sm:right-6"
      />

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
            {estPremium && (
              <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Premium
              </span>
            )}
            {todos.length > 0 && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 transition-all duration-300 dark:bg-violet-900/50 dark:text-violet-300">
                {libelleRestantes(tachesRestantes)}
              </span>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => setAfficherCategories((v) => !v)}
              className={[
                "rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                afficherCategories
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              ].join(" ")}
            >
              Catégories
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {messageCheckout && (
          <div className="mb-6 rounded-xl border border-violet-200/80 bg-violet-50/80 px-4 py-3 text-sm text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/30 dark:text-violet-300">
            {messageCheckout}
          </div>
        )}

        {afficherCategories && (
          <div className="mb-6 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/40">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Mes catégories
            </h2>
            <CategoryManager
              categories={categories}
              onCategoryAdded={ajouterCategorie}
              onCategoryUpdated={modifierCategorie}
              onCategoryDeleted={supprimerCategorie}
            />
          </div>
        )}

        <form
          onSubmit={ajouterTache}
          className="mb-6 flex flex-wrap gap-2 rounded-xl border border-zinc-200/80 bg-white/80 p-2 shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/60"
        >
          <input
            type="text"
            value={nouvelleTache}
            onChange={(e) => setNouvelleTache(e.target.value)}
            placeholder={
              limiteAtteinte ? "Limite de tâches atteinte" : "Ajouter une tâche..."
            }
            disabled={limiteAtteinte}
            className="min-w-0 flex-1 rounded-lg bg-transparent px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed dark:text-zinc-50"
          />
          <select
            value={nouvelleTachePriorite}
            onChange={(e) => setNouvelleTachePriorite(e.target.value)}
            aria-label="Priorité de la nouvelle tâche"
            disabled={limiteAtteinte}
            className="rounded-lg border border-zinc-200/80 bg-white/80 px-2 text-sm text-zinc-600 outline-none focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            <option value="">Sans priorité</option>
            {PRIORITES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {categories.length > 0 && (
            <select
              value={nouvelleTacheCategorie}
              onChange={(e) => setNouvelleTacheCategorie(e.target.value)}
              aria-label="Catégorie de la nouvelle tâche"
              disabled={limiteAtteinte}
              className="rounded-lg border border-zinc-200/80 bg-white/80 px-2 text-sm text-zinc-600 outline-none focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:text-zinc-300"
            >
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={limiteAtteinte}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ajouter
          </button>
        </form>

        {limiteAtteinte && (
          <div className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-center dark:border-amber-800/40 dark:bg-amber-950/30">
            <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
              Vous avez atteint la limite de {LIMITE_TACHES_GRATUIT} tâches du plan
              gratuit.
            </p>
            <button
              type="button"
              onClick={passerPremium}
              disabled={chargementPaiement}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chargementPaiement ? "Redirection..." : "Passer Premium — 2 €/mois"}
            </button>
          </div>
        )}

        <CategoryFilter
          categories={categories}
          filtreActif={filtreCategorie}
          onFiltreChange={setFiltreCategorie}
        />

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
            todos={todosAffiches}
            categories={categories}
            newlyAddedId={dernierAjouteId}
            deletingIds={idsEnSuppression}
            onToggle={basculerTache}
            onDelete={supprimerTache}
            onCategoryChange={changerCategorieTache}
            onPriorityChange={changerPrioriteTache}
            onItemAnimationEnd={(id) => {
              if (id === dernierAjouteId) setDernierAjouteId(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
