create table if not exists public.graphs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text not null,
  nodes jsonb not null default '[]'::jsonb,
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.graphs enable row level security;

drop policy if exists "Users can read their graphs" on public.graphs;
create policy "Users can read their graphs"
on public.graphs
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their graphs" on public.graphs;
create policy "Users can create their graphs"
on public.graphs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their graphs" on public.graphs;
create policy "Users can update their graphs"
on public.graphs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their graphs" on public.graphs;
create policy "Users can delete their graphs"
on public.graphs
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_graphs_updated_at on public.graphs;
create trigger set_graphs_updated_at
before update on public.graphs
for each row
execute function public.set_updated_at();
