"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeAuthNext } from "@/lib/auth/redirects";

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

async function origin(): Promise<string> {
  // Trustworthy enough for building the email link: Supabase only redirects
  // to URLs on its allowlist, so a spoofed Host can't hijack the flow.
  const h = await headers();
  const requestOrigin = h.get("origin");
  if (requestOrigin) return new URL(requestOrigin).origin;
  const host = h.get("host") ?? "localhost:3000";
  const protocol = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)
    ? "http"
    : "https";
  return `${protocol}://${host}`;
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

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

  // A chosen handle is validated HERE, before the confirmation email is
  // burned: format first, then availability (profiles is publicly readable,
  // so this leaks nothing new). The DB trigger re-checks both — a signup
  // race degrades to a suffixed handle, never a failed registration.
  if (username.length > 0) {
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return {
        status: "error",
        message: "Handles are 3–24 characters of a–z, 0–9, or underscore.",
      };
    }
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (taken) {
      return {
        status: "error",
        message: "That handle is taken — pick another (or leave it blank).",
      };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lands on our callback route, which exchanges the code for a session.
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(
        safeAuthNext(formData.get("next")),
      )}`,
      // the handle rides the signup metadata; handle_new_user honors it
      ...(username.length > 0 ? { data: { username } } : {}),
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
  if (data.session) redirect(safeAuthNext(formData.get("next")));
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

  redirect(safeAuthNext(formData.get("next")));
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

  // Works because the caller is signed in — either normally (the account
  // page links here) or via the recovery link (/auth/callback).
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      status: "error",
      message: "Couldn't set that password — request a new reset link.",
    };
  }

  // A new password should mean a clean slate: revoke every OTHER session so
  // anyone holding the old credentials is signed out everywhere but here.
  await supabase.auth.signOut({ scope: "others" });

  redirect("/?password-updated");
}
