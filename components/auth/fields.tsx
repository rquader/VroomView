"use client";

import { useState } from "react";

/** Labelled email input in the house field style. */
export function EmailField({ autoFocus = false }: { autoFocus?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="overline">Email</span>
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus={autoFocus}
        placeholder="you@example.com"
        className="field"
      />
    </label>
  );
}

/**
 * Password input with a show/hide toggle — visibility beats a confirm-field
 * for typo safety without doubling the friction.
 */
export function PasswordField({
  label = "Password",
  autoComplete,
  hint,
}: {
  label?: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="overline">{label}</span>
      <span className="relative">
        <input
          name="password"
          type={visible ? "text" : "password"}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          autoComplete={autoComplete}
          placeholder={visible ? "your password" : "••••••••"}
          className="field pr-16"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-1 right-1 rounded-btn px-2.5 text-xs font-medium text-ink-2 hover:bg-well hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
      {hint ? <span className="text-xs text-ink-3">{hint}</span> : null}
    </label>
  );
}
