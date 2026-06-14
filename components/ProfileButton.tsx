"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProfile, type Profile } from "@/lib/profile";

type ProfileButtonProps = {
  email?: string;
  className?: string;
};

export default function ProfileButton({ email, className = "" }: ProfileButtonProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const prenom = profile?.first_name?.trim();
  const initiale = (prenom || email || "?").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url}?v=${encodeURIComponent(profile.updated_at)}`
    : null;
  const libelle = prenom || "Profil";

  return (
    <Link
      href="/profil"
      className={[
        "group flex items-center gap-2.5 rounded-full border border-white/60 bg-white/80 py-1.5 pr-4 pl-1.5 shadow-md shadow-violet-200/30 backdrop-blur-md transition-all",
        "hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-200/40",
        "dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-violet-950/30",
        "dark:hover:border-violet-800/60 dark:hover:bg-zinc-900",
        className,
      ].join(" ")}
      aria-label="Aller au profil"
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ring-2 ring-white/80 transition-transform group-hover:scale-105 dark:ring-zinc-800/80">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">{initiale}</span>
        )}
      </span>
      <span className="max-w-[120px] truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
        {libelle}
      </span>
    </Link>
  );
}
