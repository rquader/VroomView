-- Votes: one row per (thing, person) — the composite PRIMARY KEY makes
-- double-voting structurally impossible; there is no counter to corrupt.
-- Counts are aggregated at read time. Un-vote = delete your row.
--
-- DOCUMENTED TRADEOFF: SELECT is public. Honest aggregate counts under RLS
-- require readable rows (like GitHub stars — who-starred is public). The
-- private alternative (a SECURITY DEFINER counting function) adds a
-- bypass-RLS surface for little gain at this stage. See team note 23.
create table public.concept_votes (
  concept_id uuid not null references public.concepts(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (concept_id, voter_id)
);

create index concept_votes_voter_idx on public.concept_votes (voter_id);

create table public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, voter_id)
);

create index comment_votes_voter_idx on public.comment_votes (voter_id);

alter table public.concept_votes enable row level security;
alter table public.comment_votes enable row level security;

create policy "Concept votes are readable by everyone"
  on public.concept_votes for select
  to anon, authenticated
  using (true);

create policy "Users can vote on concepts as themselves"
  on public.concept_votes for insert
  to authenticated
  with check ((select auth.uid()) = voter_id);

create policy "Users can remove their own concept votes"
  on public.concept_votes for delete
  to authenticated
  using ((select auth.uid()) = voter_id);

create policy "Comment votes are readable by everyone"
  on public.comment_votes for select
  to anon, authenticated
  using (true);

create policy "Users can vote on comments as themselves"
  on public.comment_votes for insert
  to authenticated
  with check ((select auth.uid()) = voter_id);

create policy "Users can remove their own comment votes"
  on public.comment_votes for delete
  to authenticated
  using ((select auth.uid()) = voter_id);

grant select on public.concept_votes, public.comment_votes to anon, authenticated;
grant insert, delete on public.concept_votes, public.comment_votes to authenticated;
