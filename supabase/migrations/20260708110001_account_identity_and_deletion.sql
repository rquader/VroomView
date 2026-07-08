-- Two account-lifecycle changes, both under the definer rules established in
-- create_profiles (empty search_path, minimal body, EXECUTE granted narrowly):
--
-- 1 · handle_new_user now honors a HANDLE THE USER CHOSE at signup, carried
--     in raw_user_meta_data.username. It must pass the same format rule the
--     column CHECK enforces and be free; otherwise the email-derived base
--     takes over. The collision-suffix loop covers both paths, so a signup
--     race degrades to a suffixed handle instead of a failed registration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested text;
  base text;
  candidate text;
begin
  requested := lower(new.raw_user_meta_data->>'username');
  if requested is not null
     and requested ~ '^[a-z0-9_]{3,24}$'
     and not exists (select 1 from public.profiles where username = requested) then
    base := requested;
  else
    base := left(lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g')), 20);
    if base is null or char_length(base) < 3 then
      base := 'driver';
    end if;
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

-- 2 · Self-serve account deletion. SECURITY DEFINER is required — users have
--     no rights on auth.users — and is deliberately the narrowest possible
--     surface: refuse anonymous callers, then delete EXACTLY the caller's own
--     row. Everything else is FK cascade: auth internals (sessions, identities,
--     refresh tokens) and public.profiles → concepts/comments/votes.
--     Documented trade-off in team note 16 - Security.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
