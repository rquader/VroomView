import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Server Supabase client — for Server Components, Route Handlers, and Server Actions.
 *
 * `cookies()` is async in the App Router, so this function is async too. The client
 * reads the session from request cookies and can write refreshed cookies back.
 *
 * Every request carries a 15s timeout. Without one, a single TCP connection
 * that the network silently drops (observed in the wild: a home gateway
 * black-holing packets) stalls the RSC stream indefinitely — the page hangs
 * forever instead of reaching the error boundary. 15s is far above any
 * healthy query and far below "forever".
 */
const REQUEST_TIMEOUT_MS = 15_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return fetch(input, {
    ...init,
    signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
  });
}

export async function createClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
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
