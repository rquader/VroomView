-- profiles: the public face of an account, 1-to-1 with auth.users (which is
-- Supabase's private property — credentials live there, never app data).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username extensions.citext not null unique
    constraint username_format check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text
    constraint display_name_length check (display_name is null or char_length(display_name) between 1 and 60),
  bio text
    constraint bio_length check (bio is null or char_length(bio) <= 280),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile per auth user. Created by the on_auth_user_created trigger, never by app code.';

alter table public.profiles enable row level security;

-- RLS decides which ROWS are visible; GRANTs decide whether the TABLE is
-- reachable at all. Both are set explicitly so the access model is readable.
create policy "Profiles are readable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

-- UPDATE needs USING (which rows you may touch) AND WITH CHECK (what the row
-- may look like afterwards) — without WITH CHECK a user could hand their row
-- to someone else.
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on public.profiles to anon, authenticated;
grant update (username, display_name, bio, avatar_url) on public.profiles to authenticated;

-- Creates the profile whenever Supabase Auth creates a user. SECURITY DEFINER
-- because the auth machinery has no rights on public tables; hardened per the
-- definer rules: empty search_path (no object-name hijacking), EXECUTE revoked
-- from API roles (Postgres grants EXECUTE to everyone by default), and the
-- body does exactly one insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
begin
  base := left(lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g')), 20);
  if base is null or char_length(base) < 3 then
    base := 'driver';
  end if;
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := left(base, 18) || '_' || substr(md5(gen_random_uuid()::text), 1, 4);
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, nullif(split_part(new.email, '@', 1), ''));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);
