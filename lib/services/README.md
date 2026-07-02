# lib/services — the data-access boundary

THE RULE: components and pages never import a Supabase client directly — they
call these functions (reads) or `lib/actions/*` (writes). Callers depend on
the SIGNATURES and the domain types in `@/types`, not on where data comes
from. That seam is what makes swapping or adding a data source (a Python
service, an AI ranker, a cache) a services-only change.

```
UI / pages ──▶ lib/services/* (reads)  ──▶ Supabase (today)
           └─▶ lib/actions/*  (writes) ──▶ …or any future backend (later)
```

## The services (all server-side — they read the session cookie)

| File | Provides |
|------|----------|
| `concepts.service.ts` | `listConcepts()`, `getConcept(id)`, `getRelated(concept)` — one embedded PostgREST read each (author join + vote/comment counts), viewer vote state merged in |
| `comments.service.ts` | `listCommentsByConcept(id)` — same shape of thinking; `edited` derived from DB-stamped timestamps |
| `viewer.service.ts` | `getViewer()` — the session user + public profile, or null for guests |

Writes live in `lib/actions/engagement.ts` (Server Actions): vote toggles and
comment add/edit/delete. Every action checks the session for friendly errors,
but the REAL authorization is RLS in Postgres — see team note
"23 - Data Layer and RLS" for the policy matrix and the two-layer rationale.

## Patterns to keep

- Map rows → domain types at the boundary (snake_case stays here; the app
  speaks `postedAt`, `viewerHasVoted`, `isOwn`).
- Per-viewer fields are computed HERE, per request — never cached across users.
- Throw on read errors (error boundaries render the drafting-language error
  state); return `{ ok, error }` from actions (forms show the message inline).
