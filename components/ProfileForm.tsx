"use client";

import { useState } from "react";
import { updateProfile, uploadAvatar, type Profile } from "@/lib/profile";

type ProfileFormProps = {
  email: string;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
};

export default function ProfileForm({
  email,
  profile,
  onProfileUpdate,
}: ProfileFormProps) {
  const [prenom, setPrenom] = useState(profile?.first_name ?? "");
  const [nom, setNom] = useState(profile?.last_name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url}?v=${encodeURIComponent(profile.updated_at)}`
    : null;
  const initiale = (prenom || email).charAt(0).toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const miseAJour = await updateProfile({
        first_name: prenom.trim(),
        last_name: nom.trim(),
      });
      onProfileUpdate(miseAJour);
      setMessage("Profil mis à jour.");
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setErreur(null);
    setMessage(null);

    if (!fichier.type.startsWith("image/")) {
      setErreur("Le fichier doit être une image.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const miseAJour = await uploadAvatar(fichier);
      onProfileUpdate(miseAJour);
      setMessage("Photo de profil mise à jour.");
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo"
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200/80 bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-800">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Photo de profil"
              className="size-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-zinc-400">
              {initiale}
            </span>
          )}
        </div>
        <label className="cursor-pointer rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95">
          {isUploading ? "Envoi..." : "Changer la photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-zinc-200/80 bg-zinc-100/80 px-3 py-2 text-sm text-zinc-500 outline-none dark:border-zinc-700/60 dark:bg-zinc-800/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Prénom
          </label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom"
            className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Nom
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
            className="w-full rounded-lg border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-400 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-50"
          />
        </div>

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
          disabled={isSaving}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
