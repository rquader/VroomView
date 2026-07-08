"use client";

import { useActionState, useState } from "react";
import {
  deleteAccountAction,
  updateUsernameAction,
  type AccountState,
} from "@/lib/actions/account";

const IDLE: AccountState = { status: "idle" };

/**
 * The two account forms. useActionState keeps them working pre-hydration;
 * errors land inline as role="alert". The deletion form is deliberately
 * high-friction: type your handle, then a native confirm — the server
 * re-checks the typed handle regardless.
 */

export function ChangeUsernameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateUsernameAction, IDLE);
  const shown = state.status === "saved" ? state.username : current;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="overline">New handle</span>
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          minLength={3}
          maxLength={24}
          pattern="[a-zA-Z0-9_]{3,24}"
          defaultValue={shown}
          className="field max-w-xs"
        />
        <span className="text-xs text-ink-3">
          3–24 characters: a–z, 0–9, underscore. Your filings and notes keep
          their history under the new name.
        </span>
      </label>
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      {state.status === "saved" ? (
        <p role="status" className="text-sm text-accent">
          Registered — you file as @{state.username} now.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-secondary self-start"
      >
        {pending ? "Registering…" : "Change handle"}
      </button>
    </form>
  );
}

export function DeleteAccountForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(deleteAccountAction, IDLE);
  const [typed, setTyped] = useState("");
  const armed = typed.trim().toLowerCase() === username.toLowerCase();

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Delete this account and everything it filed? This can't be undone.",
          )
        )
          e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="overline">
          Type <span className="normal-case">@{username}</span> to confirm
        </span>
        <input
          name="confirm"
          type="text"
          required
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={username}
          className="field max-w-xs"
        />
      </label>
      {state.status === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !armed}
        className="btn self-start border border-danger bg-card px-4 text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete this account"}
      </button>
    </form>
  );
}
