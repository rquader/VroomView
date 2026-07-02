-- comments ("notes"): the discussion under a concept. "Edited" is DERIVED
-- (updated_at > created_at) — no flag to forget, and moddatetime stamps the
-- time server-side so clients can't lie about it.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.concepts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null
    constraint body_length check (char_length(body) between 1 and 2000),
  tags text[] not null default '{}'
    constraint tags_are_lenses check (
      tags <@ array['Mileage','Price','Environment','Design','Performance','Reliability','Safety','Market fit']
      and cardinality(tags) <= 8
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comments are always fetched per concept, oldest context first
create index comments_concept_created_idx on public.comments (concept_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "Comments are readable by everyone"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can post comments as themselves"
  on public.comments for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

create policy "Authors can edit their own comments"
  on public.comments for update
  to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Authors can delete their own comments"
  on public.comments for delete
  to authenticated
  using ((select auth.uid()) = author_id);

grant select on public.comments to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;

create trigger set_comments_updated_at
  before update on public.comments
  for each row execute function extensions.moddatetime(updated_at);
