-- Création de la table profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (RLS)
alter table public.profiles enable row level security;

-- Un utilisateur ne peut voir que son propre profil
create policy "Les utilisateurs peuvent voir leur profil"
  on public.profiles for select
  using (auth.uid() = id);

-- Un utilisateur ne peut créer que son propre profil
create policy "Les utilisateurs peuvent créer leur profil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Un utilisateur ne peut modifier que son propre profil
create policy "Les utilisateurs peuvent modifier leur profil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Création du bucket de stockage pour les photos de profil
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

-- Les photos de profil sont publiquement visibles
create policy "Les avatars sont publiquement visibles"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Un utilisateur ne peut uploader sa photo que dans son propre dossier
create policy "Les utilisateurs peuvent uploader leur avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Un utilisateur ne peut modifier que sa propre photo
create policy "Les utilisateurs peuvent modifier leur avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Un utilisateur ne peut supprimer que sa propre photo
create policy "Les utilisateurs peuvent supprimer leur avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
