-- Do Zero ao Império — schema de cloud saves
-- Execute no SQL Editor do Supabase

create table if not exists public.game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slot integer not null,
  save_data jsonb not null,
  character_name text,
  current_age integer,
  current_money numeric,
  patrimony numeric,
  life_path text,
  difficulty text,
  is_game_over boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, slot)
);

create index if not exists game_saves_user_id_idx on public.game_saves (user_id);
create index if not exists game_saves_updated_at_idx on public.game_saves (updated_at desc);

create or replace function public.set_game_saves_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists game_saves_updated_at on public.game_saves;

create trigger game_saves_updated_at
before update on public.game_saves
for each row
execute function public.set_game_saves_updated_at();

alter table public.game_saves enable row level security;

drop policy if exists "game_saves_select_own" on public.game_saves;
drop policy if exists "game_saves_insert_own" on public.game_saves;
drop policy if exists "game_saves_update_own" on public.game_saves;
drop policy if exists "game_saves_delete_own" on public.game_saves;

create policy "game_saves_select_own"
on public.game_saves for select
using (auth.uid() = user_id);

create policy "game_saves_insert_own"
on public.game_saves for insert
with check (auth.uid() = user_id);

create policy "game_saves_update_own"
on public.game_saves for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "game_saves_delete_own"
on public.game_saves for delete
using (auth.uid() = user_id);
