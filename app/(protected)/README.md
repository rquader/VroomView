# `(protected)` route group

A **route group** (parentheses = not part of the URL) for pages that require a
signed-in user — the feed, settings, messages, etc.

Two layers protect these (used together):

1. **Middleware** (`middleware.ts` → `lib/supabase/middleware.ts`) refreshes the
   session on every request and can redirect unauthenticated users. (The redirect is
   commented out until auth pages exist.)
2. **A group layout** `(protected)/layout.tsx` (add later) can call the server Supabase
   client, check `auth.getUser()`, and `redirect("/login")` if there's no user —
   defense in depth.

Planned routes (not built yet), e.g. `feed/page.tsx` → `/feed`. See
`06 - Auth Architecture` in the docs.
