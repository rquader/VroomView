import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Server Supabase client — for Server Components, Route Handlers, and Server Actions.
 *
 * `cookies()` is async in the App Router, so this function is async too. The client
 * reads the session from request cookies and can write refreshed cookies back.
 */
export async function createClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, which cannot set cookies. Safe to
          // ignore because middleware.ts refreshes the session on every request
          // (see lib/supabase/middleware.ts).
        }
      },
    },
  });
}
