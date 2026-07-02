import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PKCE landing spot. Confirmation, recovery, and (later) OAuth emails link
 * here with a one-time `?code=`; exchanging it creates the session and sets
 * the auth cookies. `next` says where the journey continues — validated to
 * app-internal paths so the emailed link can't become an open redirect.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next") ?? "/";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  // Expired/used link → back to sign-in with a friendly flag.
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
