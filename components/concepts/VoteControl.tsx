"use client";

import { useState } from "react";
import { ChevronUpIcon } from "@/components/ui/Icon";

/**
 * Upvote control. Visual-only for the draft (local state, no backend). Uses the
 * hand-built chevron icon and a mono tally; turns petrol when active.
 */
export function VoteControl({ initial }: { initial: number }) {
  const [voted, setVoted] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={voted}
      aria-label={voted ? "Remove upvote" : "Upvote"}
      onClick={() => setVoted((v) => !v)}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-btn border px-2.5 py-1.5 text-sm transition-colors ${
        voted
          ? "border-accent bg-accent/10 text-accent"
          : "border-control text-ink-2 hover:border-ink-3 hover:text-ink"
      }`}
    >
      <ChevronUpIcon size={15} />
      <span className="font-mono tabular-nums">{initial + (voted ? 1 : 0)}</span>
    </button>
  );
}

export default VoteControl;
