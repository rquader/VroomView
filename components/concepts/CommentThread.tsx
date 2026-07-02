"use client";

import { useMemo, useState } from "react";
import type { ConceptComment, ConceptTag } from "@/types";
import { TagFilterBar } from "./TagFilterBar";
import { CommentCard } from "./CommentCard";

/**
 * The discussion under a concept. Owns the comment tag-filter state; the tab
 * bar only offers lenses that actually occur in this thread. Notes are ordered
 * by support so the strongest arguments lead. The compose box is a disabled
 * preview (posting needs auth + a backend, which don't exist yet).
 */
export function CommentThread({ comments }: { comments: ConceptComment[] }) {
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
    return [...filtered].sort((a, b) => b.votes - a.votes);
  }, [comments, active]);

  return (
    <div className="flex flex-col gap-6">
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

      <div className="sheet p-4">
        <textarea
          disabled
          rows={2}
          placeholder="Add your take on this proposal…"
          className="field resize-none"
        />
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="dateline">Posting opens with accounts</span>
          <button type="button" disabled className="btn btn-secondary btn-sm">
            Post note
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="note">
          No notes under that lens yet — try another, or add the first.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((c) => (
            <li key={c.id}>
              <CommentCard comment={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentThread;
