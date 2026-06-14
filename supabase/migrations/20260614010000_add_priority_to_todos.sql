-- Ajoute la priorité optionnelle sur les tâches
alter table public.todos
  add column if not exists priority text;

-- Niveaux autorisés : urgent, très important, important (ou aucune priorité)
alter table public.todos
  add constraint todos_priority_check check (priority in ('urgent', 'tres_important', 'important'));
