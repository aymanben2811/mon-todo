"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { fetchProfile, type Profile } from "@/lib/profile";
import AuthForm from "@/components/AuthForm";
import ProfileForm from "@/components/ProfileForm";

export default function ProfilPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [verificationSession, setVerificationSession] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chargementProfil, setChargementProfil] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

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

  // Charge le profil une fois l'utilisateur connecté
  useEffect(() => {
    if (!session) {
      return;
    }

    fetchProfile()
      .then(setProfile)
      .catch((err) =>
        setErreur(err instanceof Error ? err.message : "Erreur de chargement")
      )
      .finally(() => setChargementProfil(false));
  }, [session]);

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
            Mon Profil
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

        {chargementProfil ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Chargement du profil...
          </p>
        ) : (
          <ProfileForm
            email={session.user.email ?? ""}
            profile={profile}
            onProfileUpdate={setProfile}
          />
        )}
      </main>
    </div>
  );
}
