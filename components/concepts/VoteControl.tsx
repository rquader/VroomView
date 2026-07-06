"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import {
  toggleConceptVote,
  toggleCommentVote,
} from "@/lib/actions/engagement";
import { CheckIcon, ChevronUpIcon } from "@/components/ui/Icon";

type Target =
  | { kind: "concept"; conceptId: string }
  | { kind: "comment"; commentId: string; conceptId: string };

/**
 * The support control — real votes. useOptimistic answers the tap instantly;
 * the server action settles the truth and revalidates, and if it fails React
 * rolls the optimistic state back to the server value automatically. Guests
 * are sent to sign-in (the action would refuse them anyway — RLS twice over).
 *
 * Two variants of one behavior: `chip` is the quiet count for cards and
 * comments; `stamp` is the detail page's headline act — backing a proposal is
 * the product's core verb, so there it gets a label, weight, and a stamp-in
 * animation on press (motion-safe; only after a press, never on mount).
 */
export function VoteControl({
  target,
  votes,
  voted,
  signedIn,
  variant = "chip",
  className = "",
}: {
  target: Target;
  votes: number;
  voted: boolean;
  signedIn: boolean;
  variant?: "chip" | "stamp";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const [pressedAt, setPressedAt] = useState<number | null>(null);
  const [view, setOptimistic] = useOptimistic(
    { votes, voted },
    (_current, next: { votes: number; voted: boolean }) => next,
  );

  const onClick = () => {
    if (!signedIn) {
      router.push(ROUTES.login);
      return;
    }
    setFailed(false);
    setPressedAt(Date.now());
    startTransition(async () => {
      setOptimistic({
        votes: view.votes + (view.voted ? -1 : 1),
        voted: !view.voted,
      });
      const result =
        target.kind === "concept"
          ? await toggleConceptVote(target.conceptId, view.voted)
          : await toggleCommentVote(
              target.commentId,
              target.conceptId,
              view.voted,
            );
      if (!result.ok) setFailed(true);
    });
  };

  const ariaLabel = signedIn
    ? view.voted
      ? "Remove your support"
      : "Support this"
    : "Sign in to support this";

  if (variant === "stamp") {
    return (
      <button
        type="button"
        aria-pressed={view.voted}
        aria-label={ariaLabel}
        onClick={onClick}
        disabled={pending}
        className={`inline-flex min-h-11 items-center justify-center gap-2.5 rounded-btn border px-4 py-2 transition-colors ${
          view.voted
            ? "border-accent bg-accent text-accent-ink shadow-[var(--shadow-paper)]"
            : "border-control bg-card text-ink hover:border-accent hover:text-accent"
        } ${failed ? "border-danger" : ""} ${className}`}
      >
        {/* keyed by press so the stamp lands again on every toggle — and only
            after a real press (no animation on page arrival) */}
        <span
          key={pressedAt ?? "static"}
          className={`inline-flex items-center gap-2 ${
            pressedAt !== null
              ? "motion-safe:animate-[vv-stamp_0.35s_var(--ease-spring)]"
              : ""
          }`}
        >
          {view.voted ? <CheckIcon size={16} /> : <ChevronUpIcon size={16} />}
          <span
            className="font-mono text-base font-medium tabular-nums"
            suppressHydrationWarning
          >
            {view.votes}
          </span>
        </span>
        <span className="text-sm font-semibold">
          {view.voted
            ? "Backed"
            : signedIn
              ? "Back this concept"
              : "Sign in to back this"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={view.voted}
      aria-label={ariaLabel}
      title={signedIn ? undefined : "Sign in to support"}
      onClick={onClick}
      disabled={pending}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-btn border px-2.5 py-1.5 text-sm transition-colors ${
        view.voted
          ? "border-accent bg-accent/10 text-accent"
          : "border-control text-ink-2 hover:border-ink-3 hover:text-ink"
      } ${failed ? "border-danger" : ""} ${className}`}
    >
      <ChevronUpIcon size={15} />
      <span className="font-mono tabular-nums" suppressHydrationWarning>
        {view.votes}
      </span>
    </button>
  );
}

export default VoteControl;
