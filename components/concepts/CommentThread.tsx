"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ConceptComment, ConceptTag } from "@/types";
import { ROUTES } from "@/constants/app";
import { TagFilterBar } from "./TagFilterBar";
import { CommentCard } from "./CommentCard";
import { CommentComposer } from "./CommentComposer";

/**
 * The discussion under a concept — now live. Signed-in reviewers get the
 * composer; guests get a real invitation (a link, not a dead control). Notes
 * order by support, then age, so the strongest arguments lead while ties stay
 * conversational. The tab bar only offers lenses that actually occur here.
 */
export function CommentThread({
  conceptId,
  comments,
  signedIn,
}: {
  conceptId: string;
  comments: ConceptComment[];
  signedIn: boolean;
}) {
  const [active, setActive] = useState<ConceptTag[]>([]);

  const toggle = (tag: ConceptTag) =>
    setActive((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const available = useMemo(() => {
    const seen = new Set<ConceptTag>();
    for (const c of comments) for (const t of c.tags) seen.add(t);
    return [...seen];
  }, [comments]);

  const visible = useMemo(() => {
    const filtered =
      active.length === 0
        ? comments
        : comments.filter((c) => active.every((t) => c.tags.includes(t)));
    return [...filtered].sort(
      (a, b) => b.votes - a.votes || a.postedAt.localeCompare(b.postedAt),
    );
  }, [comments, active]);

  return (
    <div className="flex flex-col gap-6">
      {signedIn ? (
        <CommentComposer conceptId={conceptId} />
      ) : (
        <div className="sheet flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-2">
            Reviews are open — sign in to add your take and support the strong
            arguments.
          </p>
          <Link href={ROUTES.login} className="btn btn-secondary btn-sm min-h-9 shrink-0">
            Sign in to review
          </Link>
        </div>
      )}

      {available.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="overline">Narrow by lens</p>
            {active.length > 0 ? (
              <button
                type="button"
                onClick={() => setActive([])}
                className="text-xs text-accent hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
          <TagFilterBar active={active} onToggle={toggle} available={available} />
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="note">
          {comments.length === 0
            ? "No notes yet — this proposal is waiting on its first review."
            : "No notes under that lens yet — try another, or add the first."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((c) => (
            <li key={c.id}>
              <CommentCard comment={c} signedIn={signedIn} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentThread;
