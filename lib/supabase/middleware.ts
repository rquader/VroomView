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

  // --- Protected-route pattern (enable once auth pages exist) -----------------
  // Bounce unauthenticated visitors away from private areas, e.g.:
  //
  //   if (!user && request.nextUrl.pathname.startsWith("/feed")) {
  //     const loginUrl = request.nextUrl.clone();
  //     loginUrl.pathname = "/login";
  //     return NextResponse.redirect(loginUrl);
  //   }
  //
  // For the skeleton we only refresh the session and let every route through.
  void user;

  return supabaseResponse;
}
