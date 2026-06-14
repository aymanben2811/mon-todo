"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchProfile, type Profile } from "@/lib/profile";
import { fetchAllUsers, deleteUserAccount, type AdminUser } from "@/lib/admin";
import AuthForm from "@/components/AuthForm";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [verificationSession, setVerificationSession] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chargementProfil, setChargementProfil] = useState(true);
  const [utilisateurs, setUtilisateurs] = useState<AdminUser[]>([]);
  const [chargementUtilisateurs, setChargementUtilisateurs] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
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

  // Charge le profil de l'utilisateur connecté pour vérifier son rôle
  useEffect(() => {
    if (!session) return;

    fetchProfile()
      .then(setProfile)
      .catch((err) =>
        setErreur(err instanceof Error ? err.message : "Erreur de chargement")
      )
      .finally(() => setChargementProfil(false));
  }, [session]);

  // Redirige les utilisateurs non-admin vers l'accueil, sinon charge la liste
  useEffect(() => {
    if (!profile) return;

    if (profile.role !== "admin") {
      router.replace("/");
      return;
    }

    fetchAllUsers()
      .then(setUtilisateurs)
      .catch((err) =>
        setErreur(err instanceof Error ? err.message : "Erreur de chargement")
      )
      .finally(() => setChargementUtilisateurs(false));
  }, [profile, router]);

  async function supprimerUtilisateur(id: string) {
    if (!window.confirm("Supprimer définitivement ce compte ?")) return;

    setErreur(null);
    setIdsEnSuppression((prev) => new Set(prev).add(id));

    try {
      await deleteUserAccount(id);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
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

  if (chargementProfil || profile?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-400">Chargement...</p>
      </div>
    );
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

      <main className="relative w-full max-w-3xl rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-violet-200/40 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-violet-950/40">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Administration
          </h1>
          <Link
            href="/"
            className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            Retour aux tâches
          </Link>
        </div>

        {erreur && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {erreur}
          </p>
        )}

        {chargementUtilisateurs ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Chargement des utilisateurs...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200/80 text-xs text-zinc-500 dark:border-zinc-700/60 dark:text-zinc-400">
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Prénom</th>
                  <th className="py-2 pr-3 font-medium text-center">
                    Tâches
                  </th>
                  <th className="py-2 pl-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-100/80 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="py-2 pr-3 text-zinc-800 dark:text-zinc-100">
                      {u.email ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">
                      {u.first_name || "—"}
                    </td>
                    <td className="py-2 pr-3 text-center text-zinc-600 dark:text-zinc-300">
                      {u.todo_count}
                    </td>
                    <td className="py-2 pl-3 text-right">
                      {u.id === session.user.id ? (
                        <span className="text-xs text-zinc-400">Vous</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => supprimerUtilisateur(u.id)}
                          disabled={idsEnSuppression.has(u.id)}
                          className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                        >
                          {idsEnSuppression.has(u.id)
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {utilisateurs.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">
                Aucun utilisateur.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
