-- Création de la table categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#8b5cf6',
  created_at timestamptz not null default now()
);

-- Index pour récupérer rapidement les catégories d'un utilisateur
create index if not exists categories_user_id_idx on public.categories (user_id);

-- Active la sécurité au niveau des lignes (RLS)
alter table public.categories enable row level security;

-- Un utilisateur ne peut voir que ses propres catégories
create policy "Les utilisateurs peuvent voir leurs catégories"
  on public.categories for select
  using (auth.uid() = user_id);

-- Un utilisateur ne peut créer des catégories que pour lui-même
create policy "Les utilisateurs peuvent créer leurs catégories"
  on public.categories for insert
  with check (auth.uid() = user_id);

-- Un utilisateur ne peut modifier que ses propres catégories
create policy "Les utilisateurs peuvent modifier leurs catégories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un utilisateur ne peut supprimer que ses propres catégories
create policy "Les utilisateurs peuvent supprimer leurs catégories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Ajoute la catégorie optionnelle sur les tâches
alter table public.todos
  add column if not exists category_id uuid references public.categories (id) on delete set null;

-- Index pour filtrer rapidement les tâches par catégorie
create index if not exists todos_category_id_idx on public.todos (category_id);
