"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth flows as Server Actions. The mental model:
 *
 * - Supabase Auth issues a short-lived access JWT + a rotating refresh token;
 *   @supabase/ssr stores them in COOKIES, which is why signing in here (on
 *   the server) just works for every later request — and why proxy.ts can
 *   keep refreshing the session forever ("stay logged in").
 * - Sessions are PER DEVICE: each browser holds its own refresh token and its
 *   own row in auth.sessions. Sign-out can therefore be surgical (this
 *   device) or global (revoke every session — the cross-device kill switch).
 * - We never store or see the password; it goes to Supabase Auth over TLS
 *   and only a hash lives in auth.users.
 */

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent"; email: string };

/** Only allow app-internal paths — a `next` from the URL is user input, and
 *  redirecting to arbitrary origins is the classic open-redirect hole. */
function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

async function origin(): Promise<string> {
  // Trustworthy enough for building the email link: Supabase only redirects
  // to URLs on its allowlist, so a spoofed Host can't hijack the flow.
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host") ?? "localhost:3000"}`;
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: "That email doesn't look right." };
  }
  if (password.length < 8) {
    return {
      status: "error",
      message: "Use at least 8 characters for the password.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lands on our callback route, which exchanges the code for a session.
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(
        safeNext(formData.get("next")),
      )}`,
    },
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "That email already has an account — sign in instead."
        : error.code === "email_address_invalid"
          ? "That email doesn't look deliverable — double-check it."
          : error.code === "over_email_send_rate_limit"
            ? "Too many sign-ups right now — try again in a few minutes."
            : "Sign-up didn't go through. Try again in a moment.";
    return { status: "error", message };
  }

  // Email confirmation is ON, so no session yet — the account activates when
  // they click the link. (If confirmations were off, a session would exist
  // and we'd redirect straight in.)
  if (data.session) redirect(safeNext(formData.get("next")));
  return { status: "sent", email };
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One vague message on purpose: precise errors ("no such account",
    // "wrong password") tell an attacker which emails are registered.
    return {
      status: "error",
      message:
        error.code === "email_not_confirmed"
          ? "Confirm your email first — the link is in your inbox."
          : "Email or password didn't match.",
    };
  }

  redirect(safeNext(formData.get("next")));
}

/** scope "local" = this device only; "global" = revoke every session. */
export async function signOutAction(formData: FormData) {
  const scope = formData.get("scope") === "global" ? "global" : "local";
  const supabase = await createClient();
  await supabase.auth.signOut({ scope });
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: "That email doesn't look right." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/update-password`,
  });

  // Always report success — a different answer for unknown emails would
  // leak which addresses have accounts.
  return { status: "sent", email };
}

export async function updatePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return {
      status: "error",
      message: "Use at least 8 characters for the password.",
    };
  }

  // Works because the recovery link signed the user in (via /auth/callback)
  // before they reached the form.
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      status: "error",
      message: "Couldn't set that password — request a new reset link.",
    };
  }

  redirect("/?password-updated");
}
