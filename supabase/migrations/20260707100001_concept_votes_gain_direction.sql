-- Directional votes: a vote row now carries its direction — +1 (back it) or
-- -1 (vote it down). Existing rows were all "support", so the default (+1) is
-- also the honest backfill. The composite PK still makes double-voting
-- structurally impossible; score = SUM(value), aggregated at read time.
alter table public.concept_votes
  add column value smallint not null default 1
    constraint vote_value_is_direction check (value in (-1, 1));

-- Switching direction is an UPDATE of your own row (the app updates first and
-- inserts only when no row exists). The grant is column-scoped on purpose:
-- only the direction may change — concept_id/voter_id stay what RLS admitted.
create policy "Users can change their own concept votes"
  on public.concept_votes for update
  to authenticated
  using ((select auth.uid()) = voter_id)
  with check ((select auth.uid()) = voter_id);

grant update (value) on public.concept_votes to authenticated;
