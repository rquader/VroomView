"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import {
  toggleConceptVote,
  toggleCommentVote,
} from "@/lib/actions/engagement";
import { ChevronUpIcon } from "@/components/ui/Icon";

type Target =
  | { kind: "concept"; conceptId: string }
  | { kind: "comment"; commentId: string; conceptId: string };

/**
 * The upvote chip — now real. useOptimistic answers the tap instantly; the
 * server action settles the truth and revalidates, and if it fails React
 * rolls the optimistic state back to the server value automatically. Guests
 * are sent to sign-in (the action would refuse them anyway — RLS twice over).
 */
export function VoteControl({
  target,
  votes,
  voted,
  signedIn,
}: {
  target: Target;
  votes: number;
  voted: boolean;
  signedIn: boolean;
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

  return (
    <button
      type="button"
      aria-pressed={view.voted}
      aria-label={
        signedIn
          ? view.voted
            ? "Remove your support"
            : "Support this"
          : "Sign in to support this"
      }
      title={signedIn ? undefined : "Sign in to support"}
      onClick={onClick}
      disabled={pending}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-btn border px-2.5 py-1.5 text-sm transition-colors ${
        view.voted
          ? "border-accent bg-accent/10 text-accent"
          : "border-control text-ink-2 hover:border-ink-3 hover:text-ink"
      } ${failed ? "border-danger" : ""}`}
    >
      <ChevronUpIcon size={15} />
      <span className="font-mono tabular-nums" suppressHydrationWarning>
        {view.votes}
      </span>
    </button>
  );
}

export default VoteControl;
