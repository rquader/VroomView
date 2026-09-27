# Supabase clients

This folder creates clients for the current runtime: browser, server, and request middleware. Keep credentials and client setup here; use `lib/services` for reads and `lib/actions` for validated writes. Database types are generated separately under `types/`.

The root `proxy.ts` applies the Supabase session refresh convention through `lib/supabase/middleware.ts`. Route groups do not provide authorization by themselves. Row Level Security and database constraints remain the enforcement layer for data access. See [the architecture guide](../../docs/architecture.md).
