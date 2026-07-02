# Services (data-access layer)

**The rule:** components, pages, and route handlers never import `@/lib/supabase`
directly. They call a function here. Callers depend on the function *signature*,
not on where the data actually comes from.

```
UI / pages ──▶ lib/services/* ──▶ Supabase (today)
                              └─▶ a Java/Python API, or an AI service (later)
```

## Why this seam exists

It keeps "add a real backend later" cheap:

- Move "the feed" to a Python recommender service? Change one function body, not 50 call sites.
- Add AI (semantic search, moderation)? Call the AI API from a service (server-side,
  so the key stays secret), or use Postgres `pgvector` for embeddings.
- Domain types live in `@/types` (independent of DB columns), so the shape your UI
  sees doesn't change when the source does.

## Conventions

- One file per domain area: `profiles.service.ts`, `posts.service.ts`, …
- Functions return **domain types** (`@/types`), not raw DB rows — map inside the service.
- Server-only services import `@/lib/supabase/server`; client-usable ones import `@/lib/supabase/client`.

See `profiles.service.ts` for the pattern (a stub for now — no tables exist yet).
