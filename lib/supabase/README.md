# Supabase clients

Three clients, one per runtime. Pick the right one for where your code runs.

| File | Use it in | Why it's separate |
|------|-----------|-------------------|
| `client.ts` | Client Components (`"use client"`) | Reads/writes the session from browser cookies. |
| `server.ts` | Server Components, Route Handlers, Server Actions | `cookies()` is async; can refresh the session. |
| `middleware.ts` | the root `proxy.ts` only | Refreshes the session every request (Server Components can't write cookies). Next 16 renamed the root file `middleware.ts` → `proxy.ts`; this helper keeps its historical name because `@supabase/ssr` docs call this piece "middleware". |

All three use only the **publishable** key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
Never use a secret / service-role key in this app — the browser would see it.
Access control is enforced by **Row Level Security (RLS)** in Postgres.

## Typed queries

The clients are generic over `Database` (`@/types/database`), which is an empty
placeholder until you create tables. Regenerate it after each schema change:

```bash
# hosted project:
npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts
# or local dev DB:
npx supabase gen types typescript --local > types/database.ts
```

## Don't import these from components

UI code should call a function in `lib/services/` instead of importing a client
directly. That boundary is what lets you swap the data source later. See
`lib/services/README.md`.
