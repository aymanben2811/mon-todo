-- Ajoute les informations d'abonnement Stripe au profil
alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

-- Empêche les utilisateurs de modifier eux-mêmes leur statut d'abonnement :
-- seul le webhook Stripe (via la clé service_role) peut changer ces colonnes
create or replace function public.protect_premium_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.is_premium := old.is_premium;
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
  end if;
  return new;
end;
$$;

create trigger protect_premium_fields_trigger
  before update on public.profiles
  for each row execute function public.protect_premium_fields();

-- Limite le plan gratuit à 12 tâches maximum
create or replace function public.check_todo_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  est_premium boolean;
  nombre_taches integer;
begin
  select coalesce(is_premium, false) into est_premium
  from public.profiles
  where id = new.user_id;

  if est_premium then
    return new;
  end if;

  select count(*) into nombre_taches
  from public.todos
  where user_id = new.user_id;

  if nombre_taches >= 12 then
    raise exception 'Limite de 12 tâches atteinte pour le plan gratuit';
  end if;

  return new;
end;
$$;

create trigger check_todo_limit_trigger
  before insert on public.todos
  for each row execute function public.check_todo_limit();
