"use client";

import { useId, useState } from "react";

/**
 * Credential inputs with EXPLICIT label association (htmlFor/id) rather than
 * wrapping labels: a wrapping <label> would fold the Show/Hide button and the
 * hint into the input's accessible name ("Password Show At least 8…"), which
 * is noise for screen readers. Hints attach via aria-describedby instead —
 * announced after the name, the way supplementary text should be.
 */

export function EmailField({ autoFocus = false }: { autoFocus?: boolean }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="overline">
        Email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        required
        autoComplete="email"
        autoFocus={autoFocus}
        placeholder="you@example.com"
        className="field"
      />
    </div>
  );
}

/** Password input with a show/hide toggle — visibility beats a confirm-field
 *  for typo safety without doubling the friction. */
export function PasswordField({
  label = "Password",
  autoComplete,
  hint,
}: {
  label?: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
}) {
  const id = useId();
  const hintId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="overline">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          autoComplete={autoComplete}
          placeholder={visible ? "your password" : "••••••••"}
          aria-describedby={hint ? hintId : undefined}
          className="field pr-16"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-1 right-1 rounded-btn px-2.5 text-xs font-medium text-ink-2 hover:bg-well hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint ? (
        <span id={hintId} className="text-xs text-ink-3">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
