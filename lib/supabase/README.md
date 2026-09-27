# Supabase clients

Use the client that matches where the code runs.

| File            | Use it in                                         | Purpose                                                                                                                                                    |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client.ts`     | Client Components                                 | Browser-side Supabase operations using the signed-in browser session.                                                                                      |
| `server.ts`     | Server Components, Route Handlers, Server Actions | Creates a request-aware server client using Next.js cookies.                                                                                               |
| `middleware.ts` | Root `proxy.ts` only                              | Refreshes the session and propagates refreshed cookies during the request. The helper name is historical; Next.js 16 calls the root convention `proxy.ts`. |

All clients use the public Supabase URL and publishable key. Never put a secret/service-role key in client code or a `NEXT_PUBLIC_*` variable. The database's Row Level Security policies enforce access. UI and page code should call `lib/services/` for reads and `lib/actions/` for writes instead of importing a client directly.

Queries are typed with the generated `Database` type in `types/database.ts`. After an approved schema change, regenerate and review that type alongside the migration. Follow the migration workflow in the VroomViewNotes “23 - Data Layer and RLS” note; do not create schema changes as a side effect of application work.

See [the architecture guide](../../docs/architecture.md) for the read/write flow and the boundary that would allow a future data adapter if one becomes necessary.
