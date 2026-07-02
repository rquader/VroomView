import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and keeps cookies in sync.
 *
 * Why it's needed: Server Components can READ cookies but not WRITE them, yet
 * access tokens expire and must be refreshed. Middleware runs before each request
 * and can write the refreshed cookies.
 *
 * IMPORTANT: return the `supabaseResponse` object as-is (don't build a fresh
 * response without copying its cookies) or you'll silently sign users out.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, publishableKey } = getPublicSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do NOT put code between createServerClient and getUser(): getUser() must be
  // the first call so the token refresh happens reliably on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in users have no business on the credential pages — bounce home.
  // (Content pages stay public; actions enforce auth server-side + RLS.)
  // IMPORTANT: any redirect must CARRY the refreshed session cookies from
  // supabaseResponse, or the refresh this middleware just performed is lost.
  if (user && ["/login", "/signup"].includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach(({ name, value }) => redirectResponse.cookies.set(name, value));
    return redirectResponse;
  }

  return supabaseResponse;
}
