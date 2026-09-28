# Supabase clients

This folder creates clients for the current runtime: browser, server, and request middleware. Keep credentials and client setup here; use `lib/services` for reads and `lib/actions` for validated writes. Database types are generated separately under `types/`.

The root `proxy.ts` applies the Supabase session refresh convention through `lib/supabase/middleware.ts`. Route groups do not provide authorization by themselves. Row Level Security and database constraints remain the enforcement layer for data access. See [the architecture guide](../../docs/architecture.md).

Email confirmation depends on the hosted Auth configuration as well as the app:

- Under Authentication → URL Configuration, set Site URL to `https://vroom-view.vercel.app`. Allow `https://vroom-view.vercel.app/auth/callback**` and the local development origin, such as `http://localhost:3000/**`. The app supplies `/auth/callback?next=…` as the signup and recovery redirect. Supabase falls back to Site URL when a redirect is not allowed; an old localhost Site URL therefore sends production emails to localhost.
- Under Authentication → Sign In / Providers → Email, enable **Confirm email**. Supabase enforces confirmation before password sign-in. Turning this off automatically confirms new accounts and permits immediate signup sessions. Enabling it later does not establish that those older accounts verified ownership of their email.
- The default `{{ .ConfirmationURL }}` template supports the callback flow. If using a custom `token_hash` template with `/auth/confirm`, ensure its base URL points to the deployed app, and use `type=recovery` for password recovery. A template based on `{{ .SiteURL }}` requires the correct Site URL even when the app passes `emailRedirectTo`.

Verify with a fresh account: signup stays on “Check your email”, password sign-in fails until the link is opened, and the email lands on the deployed app. These live email and provider settings are not covered by the isolated application tests.

References: [Supabase redirect configuration](https://supabase.com/docs/guides/auth/redirect-urls), [password authentication and confirmation settings](https://supabase.com/docs/guides/auth/passwords).
