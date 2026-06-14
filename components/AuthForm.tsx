"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";

type Mode = "connexion" | "inscription";

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setIsLoading(true);

    try {
      if (mode === "connexion") {
        await signIn(email, password);
      } else {
        await signUp(email, password, firstName, lastName);
        setMessage("Vérifiez vos emails pour confirmer votre inscription.");
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }

  function basculerMode() {
    setMode((m) => (m === "connexion" ? "inscription" : "connexion"));
    setErreur(null);
    setMessage(null);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-sky-100 px-4 py-16 dark:from-violet-950 dark:via-indigo-950 dark:to-slate-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-[400px] rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-600/10"
      />

      <main className="relative w-full max-w-sm rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-violet-200/40 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70 dark:shadow-violet-950/40">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {mode === "connexion" ? "Connexion" : "Inscription"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "inscription" && (
            <div className="flex gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                required
                className="flex-1 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                required
                className="flex-1 rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
              />
            </div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
            minLength={6}
            className="rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
          />

          {erreur && (
            <p className="text-sm text-red-600 dark:text-red-400">{erreur}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading
              ? "Chargement..."
              : mode === "connexion"
                ? "Se connecter"
                : "S'inscrire"}
          </button>
        </form>

        <button
          type="button"
          onClick={basculerMode}
          className="mt-4 text-sm text-violet-600 hover:underline dark:text-violet-400"
        >
          {mode === "connexion"
            ? "Pas de compte ? Inscrivez-vous"
            : "Déjà un compte ? Connectez-vous"}
        </button>
      </main>
    </div>
  );
}
