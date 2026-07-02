/**
 * Reads the PUBLIC Supabase environment variables (safe to expose to the browser).
 *
 * We read them inside a function (not at module top-level) so a missing var throws
 * only when a Supabase client is actually created — not at import/build time.
 *
 * SECURITY: only NEXT_PUBLIC_* values belong here. Those are inlined into the
 * client bundle, so they must never hold a Supabase SECRET / service-role key.
 */
export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Copy .env.example to .env.local " +
        "and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}
