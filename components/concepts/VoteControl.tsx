"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { setCommentVote, setConceptVote } from "@/lib/actions/engagement";
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
 * Variants: `chip` is the compact three-segment control for cards; `stamp`
 * gives the detail page a labeled upvote action.
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
    (current, next: VoteDirection) => ({
      // React reapplies pending actions when server props refresh. State the
      // desired vote relative to that current base, preserving everyone else.
      score: current.score + next - current.viewerVote,
      viewerVote: next,
    }),
  );

  const cast = (dir: 1 | -1) => {
    if (!signedIn) {
      router.push(
        `${ROUTES.login}?next=${encodeURIComponent(ROUTES.concept(conceptId))}`,
      );
      return;
    }
    // pressing your standing vote withdraws it; anything else re-states it
    const next: VoteDirection = view.viewerVote === dir ? 0 : dir;
    setFailed(false);
    setPressedAt(Date.now());
    startTransition(async () => {
      setOptimistic(next);
      const result = await setConceptVote(conceptId, next);
      if (!result.ok) setFailed(true);
    });
  };

  const upLabel = signedIn
    ? view.viewerVote === 1
      ? "Remove your upvote"
      : "Upvote this concept"
    : "Sign in to upvote this concept";
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
      <div className={className}>
        <div
          className={`flex items-stretch overflow-hidden rounded-btn border transition-colors ${
            failed ? "border-danger" : "border-control"
          }`}
        >
          <button
            type="button"
            aria-pressed={view.viewerVote === 1}
            aria-label={upLabel}
            onClick={() => cast(1)}
            disabled={pending}
            className={`inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2.5 px-4 py-2 transition-colors sm:flex-initial ${
              view.viewerVote === 1
                ? "bg-accent text-accent-ink"
                : "bg-card text-ink hover:text-accent"
            }`}
          >
            {/* keyed by press so the indicator animates only after a press */}
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
                ? "Upvoted"
                : signedIn
                  ? "Upvote"
                  : "Sign in to vote"}
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
                ? "bg-well text-ink"
                : "bg-card text-ink-2 hover:text-rubric"
            }`}
          >
            <ChevronDownIcon size={16} />
          </button>
        </div>
        {failed ? (
          <p role="alert" className="mt-2 text-sm text-danger">
            Vote didn&apos;t save. Try again.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`inline-flex items-stretch overflow-hidden rounded-btn border bg-card transition-colors ${
          failed ? "border-danger" : "border-control"
        }`}
      >
        <button
          type="button"
          aria-pressed={view.viewerVote === 1}
          aria-label={upLabel}
          title={signedIn ? undefined : "Sign in to vote"}
          onClick={() => cast(1)}
          disabled={pending}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center px-2 transition-colors ${
            view.viewerVote === 1
              ? "bg-well text-ink"
              : "text-ink-2 hover:bg-well hover:text-ink"
          }`}
        >
          <ChevronUpIcon size={15} />
        </button>
        <span
          className={`inline-flex min-h-11 min-w-11 items-center justify-center border-x border-line px-1.5 font-mono text-sm tabular-nums ${scoreTone}`}
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
          className={`inline-flex min-h-11 min-w-11 items-center justify-center px-2 transition-colors ${
            view.viewerVote === -1
              ? "bg-well text-ink"
              : "text-ink-2 hover:bg-well hover:text-ink"
          }`}
        >
          <ChevronDownIcon size={15} />
        </button>
      </div>
      {failed ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          Vote didn&apos;t save. Try again.
        </p>
      ) : null}
    </div>
  );
}

/**
 * Support on a comment stays a single quiet toggle — a comment is something
 * you agree with, not something the room ranks by controversy. (Deliberate
 * asymmetry with concepts; see team docs for the rationale.)
 */
export function CommentSupport({
  commentId,
  votes,
  voted,
  signedIn,
  className = "",
}: {
  commentId: string;
  votes: number;
  voted: boolean;
  signedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const [view, setOptimistic] = useOptimistic(
    { votes, voted },
    (_current, next: { votes: number; voted: boolean }) => next,
  );

  const onClick = () => {
    if (!signedIn) {
      router.push(`${ROUTES.login}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setFailed(false);
    startTransition(async () => {
      setOptimistic({
        votes: view.votes + (view.voted ? -1 : 1),
        voted: !view.voted,
      });
      const result = await setCommentVote(commentId, !view.voted);
      if (!result.ok) setFailed(true);
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        aria-pressed={view.voted}
        aria-label={
          signedIn
            ? view.voted
              ? "Remove your support"
              : "Support this comment"
            : "Sign in to support this comment"
        }
        title={signedIn ? undefined : "Sign in to support"}
        onClick={onClick}
        disabled={pending}
        className={`inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-btn border px-2.5 py-1.5 text-sm transition-colors ${
          view.voted
            ? "border-accent bg-well text-ink"
            : "border-control text-ink-2 hover:border-ink-3 hover:text-ink"
        } ${failed ? "border-danger" : ""}`}
      >
        <ChevronUpIcon size={15} />
        <span className="font-mono tabular-nums" suppressHydrationWarning>
          {view.votes}
        </span>
      </button>
      {failed ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          Support didn&apos;t save. Try again.
        </p>
      ) : null}
    </div>
  );
}

export default VoteControl;
