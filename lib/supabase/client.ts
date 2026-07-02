import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client — for Client Components ("use client").
 *
 * Reads/writes the auth session from browser cookies. Safe on the client because
 * it only uses the PUBLISHABLE key; data is protected server-side by Row Level
 * Security (RLS).
 *
 * Call this inside the component (don't keep one module-level instance) so each
 * component gets a client bound to the current session.
 */
export function createClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
