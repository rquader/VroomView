"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { setConceptVote, toggleCommentVote } from "@/lib/actions/engagement";
import type { VoteDirection } from "@/types";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/ui/Icon";

/**
 * Directional voting on concepts — real votes. The client states the desired
 * END STATE (+1/0/-1) and paints it optimistically; the server action settles
 * the truth and revalidates, and a failure rolls the optimistic state back to
 * the server value automatically. Guests are sent to sign-in (the action
 * would refuse them anyway — RLS twice over).
 *
 * Two inks on purpose: BACKING stamps in the accent (the approval color),
 * VOTING DOWN marks in the rubric (the reviewer's red pencil). The number
 * between them is the net score — the argument's current balance.
 *
 * Variants: `chip` is the compact three-segment control for cards; `stamp`
 * is the detail page's headline act, where backing keeps its label, weight,
 * and stamp-in animation (motion-safe; only after a press, never on mount).
 */
export function VoteControl({
  conceptId,
  score,
  viewerVote,
  signedIn,
  variant = "chip",
  className = "",
}: {
  conceptId: string;
  score: number;
  viewerVote: VoteDirection;
  signedIn: boolean;
  variant?: "chip" | "stamp";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const [pressedAt, setPressedAt] = useState<number | null>(null);
  const [view, setOptimistic] = useOptimistic(
    { score, viewerVote },
    (_current, next: { score: number; viewerVote: VoteDirection }) => next,
  );

  const cast = (dir: 1 | -1) => {
    if (!signedIn) {
      router.push(ROUTES.login);
      return;
    }
    // pressing your standing vote withdraws it; anything else re-states it
    const next: VoteDirection = view.viewerVote === dir ? 0 : dir;
    setFailed(false);
    setPressedAt(Date.now());
    startTransition(async () => {
      setOptimistic({
        score: view.score + (next - view.viewerVote),
        viewerVote: next,
      });
      const result = await setConceptVote(conceptId, next);
      if (!result.ok) setFailed(true);
    });
  };

  const upLabel = signedIn
    ? view.viewerVote === 1
      ? "Remove your backing"
      : "Back this concept"
    : "Sign in to back this";
  const downLabel = signedIn
    ? view.viewerVote === -1
      ? "Withdraw your downvote"
      : "Vote this concept down"
    : "Sign in to vote this down";

  const scoreTone =
    view.viewerVote === 1
      ? "text-accent"
      : view.viewerVote === -1
        ? "text-rubric"
        : "text-ink";

  if (variant === "stamp") {
    return (
      <div
        className={`flex items-stretch overflow-hidden rounded-btn border transition-colors ${
          failed ? "border-danger" : "border-control"
        } ${className}`}
      >
        <button
          type="button"
          aria-pressed={view.viewerVote === 1}
          aria-label={upLabel}
          onClick={() => cast(1)}
          disabled={pending}
          className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2.5 px-4 py-2 transition-colors sm:flex-initial ${
            view.viewerVote === 1
              ? "bg-accent text-accent-ink"
              : "bg-card text-ink hover:text-accent"
          }`}
        >
          {/* keyed by press so the stamp lands again on every cast — and only
              after a real press (no animation on page arrival) */}
          <span
            key={pressedAt ?? "static"}
            className={`inline-flex items-center gap-2 ${
              pressedAt !== null
                ? "motion-safe:animate-[vv-stamp_0.35s_var(--ease-spring)]"
                : ""
            }`}
          >
            {view.viewerVote === 1 ? (
              <CheckIcon size={16} />
            ) : (
              <ChevronUpIcon size={16} />
            )}
            <span
              className="font-mono text-base font-medium tabular-nums"
              suppressHydrationWarning
            >
              {view.score}
            </span>
          </span>
          <span className="text-sm font-semibold">
            {view.viewerVote === 1
              ? "Backed"
              : signedIn
                ? "Back this concept"
                : "Sign in to back this"}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={view.viewerVote === -1}
          aria-label={downLabel}
          onClick={() => cast(-1)}
          disabled={pending}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center border-l border-line px-3 transition-colors ${
            view.viewerVote === -1
              ? "bg-rubric/10 text-rubric"
              : "bg-card text-ink-2 hover:text-rubric"
          }`}
        >
          <ChevronDownIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-stretch overflow-hidden rounded-btn border bg-card transition-colors ${
        failed ? "border-danger" : "border-control"
      } ${className}`}
    >
      <button
        type="button"
        aria-pressed={view.viewerVote === 1}
        aria-label={upLabel}
        title={signedIn ? undefined : "Sign in to vote"}
        onClick={() => cast(1)}
        disabled={pending}
        className={`inline-flex min-h-9 items-center px-2 transition-colors ${
          view.viewerVote === 1
            ? "bg-accent/10 text-accent"
            : "text-ink-2 hover:bg-well hover:text-ink"
        }`}
      >
        <ChevronUpIcon size={15} />
      </button>
      <span
        className={`inline-flex min-w-9 items-center justify-center border-x border-line px-1.5 font-mono text-sm tabular-nums ${scoreTone}`}
      >
        <span className="sr-only">Score </span>
        <span suppressHydrationWarning>{view.score}</span>
      </span>
      <button
        type="button"
        aria-pressed={view.viewerVote === -1}
        aria-label={downLabel}
        title={signedIn ? undefined : "Sign in to vote"}
        onClick={() => cast(-1)}
        disabled={pending}
        className={`inline-flex min-h-9 items-center px-2 transition-colors ${
          view.viewerVote === -1
            ? "bg-rubric/10 text-rubric"
            : "text-ink-2 hover:bg-well hover:text-ink"
        }`}
      >
        <ChevronDownIcon size={15} />
      </button>
    </div>
  );
}

/**
 * Support on a NOTE stays a single quiet toggle — a note is something you
 * agree with, not something the room ranks by controversy. (Deliberate
 * asymmetry with concepts; see team note 23.)
 */
export function CommentSupport({
  commentId,
  conceptId,
  votes,
  voted,
  signedIn,
  className = "",
}: {
  commentId: string;
  conceptId: string;
  votes: number;
  voted: boolean;
  signedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
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
    startTransition(async () => {
      setOptimistic({
        votes: view.votes + (view.voted ? -1 : 1),
        voted: !view.voted,
      });
      const result = await toggleCommentVote(commentId, conceptId, view.voted);
      if (!result.ok) setFailed(true);
    });
  };

  return (
    <button
      type="button"
      aria-pressed={view.voted}
      aria-label={
        signedIn
          ? view.voted
            ? "Remove your support"
            : "Support this note"
          : "Sign in to support this note"
      }
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
