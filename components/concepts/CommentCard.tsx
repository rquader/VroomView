"use client";

import { useState, useTransition } from "react";
import type { ConceptComment } from "@/types";
import { timeAgo } from "@/utils/time";
import { deleteComment } from "@/lib/actions/engagement";
import { CommentSupport } from "./VoteControl";
import { CommentComposer } from "./CommentComposer";

/**
 * A single note in a concept's discussion. Well-supported notes get an accent
 * left-edge and a "top note" mark so the thread is scannable by signal. Your
 * own notes carry quiet edit/delete actions — editing swaps the body for the
 * composer in place, and "edited" is the server-derived timestamp truth.
 */
export function CommentCard({
  comment,
  signedIn,
  pending = false,
}: {
  comment: ConceptComment;
  signedIn: boolean;
  /** an optimistic entry still being filed — render calm, without controls */
  pending?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startTransition] = useTransition();
  const top = comment.votes >= 5;

  const remove = () => {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteComment(comment.id, comment.conceptId);
      if (!result.ok) setDeleteError(result.error);
    });
  };

  return (
    <article
      className={`rounded-card bg-card p-4 ${
        top
          ? "border border-line-2 border-l-2 border-l-accent"
          : "border border-line"
      } ${deleting ? "opacity-50" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="font-semibold text-ink">
          @{comment.author.username}
        </span>
        {pending ? (
          <span className="dateline text-accent">filing…</span>
        ) : (
          <span className="dateline" suppressHydrationWarning>
            {timeAgo(comment.postedAt)}
            {comment.edited ? " · edited" : ""}
          </span>
        )}
        {top ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
            · top note
          </span>
        ) : null}
        {comment.isOwn && !editing && !pending ? (
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn btn-ghost btn-sm min-h-8 px-2 text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="btn btn-ghost btn-sm min-h-8 px-2 text-xs hover:text-danger"
            >
              Delete
            </button>
          </span>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3">
          <CommentComposer
            conceptId={comment.conceptId}
            editing={comment}
            onDone={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          <p className="mt-2 leading-relaxed">{comment.body}</p>
          {deleteError ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {deleteError}
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-3">
            {comment.tags.length > 0 ? (
              <span className="text-[11px] uppercase tracking-wide text-ink-3">
                {comment.tags.join(" · ")}
              </span>
            ) : null}
            {pending ? null : (
              <div className="ml-auto">
                <CommentSupport
                  commentId={comment.id}
                  conceptId={comment.conceptId}
                  votes={comment.votes}
                  voted={comment.viewerHasVoted}
                  signedIn={signedIn}
                />
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default CommentCard;
