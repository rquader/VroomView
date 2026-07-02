# Supabase schema — in-repo mirror

The database's source of truth is the **remote project's migration history**
(applied via the Supabase MCP on 2026-07-02; `supabase migration list` shows
the same five entries). These files mirror that history so the schema is
reviewable in git and reproducible on a fresh project.

- `migrations/` — the applied DDL, in order. One concern per file; each is
  commented to teach the WHY (constraints as law, RLS policy patterns, the
  definer-trigger rules).
- `seed.sql` — one-off launch content (archive account + five founding
  concepts + their discussions). Deliberately NOT a migration: schema history
  stays pure DDL. Votes are not seeded — support counts start at zero.

Design rationale and the full policy matrix: team note **23 - Data Layer and
RLS** (VroomViewNotes). Regenerate `types/database.ts` after any schema
change (command in that file's header).
