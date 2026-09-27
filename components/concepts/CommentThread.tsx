"use client";

import { useMemo, useOptimistic, useState } from "react";
import Link from "next/link";
import type { ConceptComment, ConceptTag } from "@/types";
import { ROUTES } from "@/constants/app";
import { TagFilterBar } from "./TagFilterBar";
import { CommentCard } from "./CommentCard";
import { CommentComposer } from "./CommentComposer";

/**
 * The discussion under a concept. Signed-in reviewers get the composer; guests
 * get a real invitation (a link, not a dead control). Notes order by support,
 * then age, so the strongest arguments lead while ties stay conversational.
 *
 * PERCEIVED SPEED: posting appends the note optimistically — it appears the
 * instant you file it (marked "filing…"), and React swaps in the server truth
 * when the action's revalidation lands (or rolls it back on failure, with the
 * composer keeping your text). Optimistic entries are recognized by their
 * "optimistic-" id prefix — a convention shared with CommentComposer only.
 */
export function CommentThread({
  conceptId,
  comments,
  signedIn,
  viewer,
}: {
  conceptId: string;
  comments: ConceptComment[];
  signedIn: boolean;
  /** the signed-in reviewer's identity, for optimistic authorship */
  viewer: { id: string; username: string } | null;
}) {
  const [active, setActive] = useState<ConceptTag[]>([]);
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (cur, next: ConceptComment) => [...cur, next],
  );

  const toggle = (tag: ConceptTag) =>
    setActive((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const available = useMemo(() => {
    const seen = new Set<ConceptTag>();
    for (const c of optimisticComments) for (const t of c.tags) seen.add(t);
    return [...seen];
  }, [optimisticComments]);

  const visible = useMemo(() => {
    const filtered =
      active.length === 0
        ? optimisticComments
        : optimisticComments.filter((c) =>
            active.every((t) => c.tags.includes(t)),
          );
    return [...filtered].sort(
      (a, b) => b.votes - a.votes || a.postedAt.localeCompare(b.postedAt),
    );
  }, [optimisticComments, active]);

  return (
    <div className="flex flex-col gap-6">
      {signedIn && viewer ? (
        <CommentComposer
          conceptId={conceptId}
          viewer={viewer}
          onOptimistic={addOptimistic}
        />
      ) : (
        <div className="sheet flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-2">Sign in to comment or vote.</p>
          <Link
            href={`${ROUTES.login}?next=${encodeURIComponent(ROUTES.concept(conceptId) + "#discussion")}`}
            className="btn btn-secondary btn-sm min-h-11 shrink-0"
          >
            Sign in
          </Link>
        </div>
      )}

      {available.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="ui-label">Filter comments by topic</p>
            {active.length > 0 ? (
              <button
                type="button"
                onClick={() => setActive([])}
                className="min-h-11 rounded-btn px-3 text-sm text-accent hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
          <TagFilterBar
            active={active}
            onToggle={toggle}
            available={available}
          />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="note">
          {optimisticComments.length === 0
            ? "No comments yet."
            : "No comments match these topics."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((c) => (
            <li key={c.id}>
              <CommentCard
                comment={c}
                signedIn={signedIn}
                pending={c.id.startsWith("optimistic-")}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentThread;
