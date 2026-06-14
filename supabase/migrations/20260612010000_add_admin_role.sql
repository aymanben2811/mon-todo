-- Ajoute l'email et le rôle (user/admin) au profil
alter table public.profiles
  add column if not exists email text,
  add column if not exists role text not null default 'user';

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- Fonction utilitaire : l'utilisateur connecté est-il admin ?
-- (security definer pour éviter la récursion avec les policies de profiles)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Les admins peuvent voir tous les profils
create policy "Les admins peuvent voir tous les profils"
  on public.profiles for select
  using (public.is_admin());

-- Crée automatiquement un profil à l'inscription d'un utilisateur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garde l'email du profil synchronisé avec celui du compte
create or replace function public.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_update();

-- Crée un profil pour les utilisateurs déjà inscrits avant cette migration
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

-- RPC : liste tous les utilisateurs avec leur nombre de tâches (admin uniquement)
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  todo_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    coalesce(t.todo_count, 0) as todo_count
  from public.profiles p
  left join (
    select user_id, count(*) as todo_count
    from public.todos
    group by user_id
  ) t on t.user_id = p.id
  where public.is_admin()
  order by p.email;
$$;

grant execute on function public.admin_list_users() to authenticated;

-- RPC : supprime le compte d'un utilisateur (admin uniquement)
create or replace function public.admin_delete_user(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Accès refusé : réservé aux administrateurs';
  end if;

  if target_id = auth.uid() then
    raise exception 'Vous ne pouvez pas supprimer votre propre compte';
  end if;

  delete from auth.users where id = target_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;
