-- Création de la table todos
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index pour récupérer rapidement les todos d'un utilisateur
create index if not exists todos_user_id_idx on public.todos (user_id);

-- Active la sécurité au niveau des lignes (RLS)
alter table public.todos enable row level security;

-- Un utilisateur ne peut voir que ses propres todos
create policy "Les utilisateurs peuvent voir leurs todos"
  on public.todos for select
  using (auth.uid() = user_id);

-- Un utilisateur ne peut créer des todos que pour lui-même
create policy "Les utilisateurs peuvent créer leurs todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

-- Un utilisateur ne peut modifier que ses propres todos
create policy "Les utilisateurs peuvent modifier leurs todos"
  on public.todos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un utilisateur ne peut supprimer que ses propres todos
create policy "Les utilisateurs peuvent supprimer leurs todos"
  on public.todos for delete
  using (auth.uid() = user_id);
