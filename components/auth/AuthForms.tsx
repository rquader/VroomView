"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import {
  signInAction,
  signUpAction,
  requestPasswordResetAction,
  updatePasswordAction,
  type AuthState,
} from "@/lib/actions/auth";
import { EmailField, PasswordField, UsernameField } from "./fields";
import { SuccessAnimation } from "@/components/animations";

/**
 * The four credential forms. useActionState wires each to its Server Action:
 * the form posts (works even before hydration), the action returns a typed
 * state, and errors render inline as role="alert" so screen readers hear
 * them the moment they land.
 */

const IDLE: AuthState = { status: "idle" };

function ErrorNote({ state }: { state: AuthState }) {
  if (state.status !== "error") return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {state.message}
    </p>
  );
}

function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: string;
}) {
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full">
      {pending ? "Working…" : children}
    </button>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(signInAction, IDLE);

  return (
    <form action={action} className="flex flex-col gap-5">
      {notice ? <p className="note text-sm">{notice}</p> : null}
      <input type="hidden" name="next" value={next} />
      <EmailField autoFocus />
      <PasswordField autoComplete="current-password" />
      <ErrorNote state={state} />
      <SubmitButton pending={pending}>Sign in</SubmitButton>
      <p className="text-center text-xs">
        <Link
          href="/forgot-password"
          className="text-ink-2 underline-offset-2 hover:text-ink hover:underline"
        >
          Forgot the password?
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signUpAction, IDLE);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "sent") successHeadingRef.current?.focus();
  }, [state.status]);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 py-4 text-center"
      >
        <SuccessAnimation />
        <div>
          <h2
            ref={successHeadingRef}
            tabIndex={-1}
            className="font-serif text-xl font-medium outline-none"
          >
            Check your email
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
            We sent a confirmation link to{" "}
            <span className="font-medium">{state.email}</span>. Open it to
            finish creating your account. Check spam if you do not see it.
          </p>
        </div>
        <Link href={ROUTES.login} className="btn btn-secondary btn-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <EmailField autoFocus />
      <UsernameField />
      <PasswordField
        autoComplete="new-password"
        hint="At least 8 characters."
      />
      <ErrorNote state={state} />
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    IDLE,
  );
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "sent") successHeadingRef.current?.focus();
  }, [state.status]);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 py-4 text-center"
      >
        <SuccessAnimation />
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="font-serif text-xl font-medium outline-none"
        >
          Check your email
        </h2>
        <p className="text-sm leading-relaxed text-ink-2">
          If <span className="font-medium">{state.email}</span> has an account,
          we sent a reset link. Check spam if you do not see it.
        </p>
        <Link href={ROUTES.login} className="btn btn-secondary btn-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <EmailField autoFocus />
      <ErrorNote state={state} />
      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, IDLE);

  return (
    <form action={action} className="flex flex-col gap-5">
      <PasswordField
        label="New password"
        autoComplete="new-password"
        hint="At least 8 characters."
      />
      <ErrorNote state={state} />
      <SubmitButton pending={pending}>Set new password</SubmitButton>
    </form>
  );
}
