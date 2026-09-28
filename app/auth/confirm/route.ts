import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeAuthNext } from "@/lib/auth/redirects";

/**
 * Token-hash landing spot — the server-side email flow Supabase recommends
 * (templates changed to `{{ .SiteURL }}/auth/confirm?token_hash=…&type=…`).
 * verifyOtp exchanges the hash for a session without the secret ever
 * appearing in a client-side URL fragment. We support BOTH this and the
 * /auth/callback code flow, so either email template configuration works.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeAuthNext(url.searchParams.get("next"));

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Recovery links continue to the set-a-new-password form.
      const dest = type === "recovery" ? "/update-password" : next;
      return NextResponse.redirect(new URL(dest, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
