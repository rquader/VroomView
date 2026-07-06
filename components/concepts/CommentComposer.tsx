"use client";

import { useState, useTransition } from "react";
import type { ConceptComment, ConceptTag } from "@/types";
import { addComment, updateComment } from "@/lib/actions/engagement";
import { TagFilterBar } from "./TagFilterBar";

/**
 * Write or edit a note. One component, two modes: pass `editing` to rework an
 * existing note (the same lens-tab control doubles as the tag picker — picking
 * lenses on your own note is the same gesture as filtering by them).
 * Submission runs in a transition; when posting fresh notes it first hands the
 * thread an optimistic copy (id-prefixed "optimistic-") so the note appears
 * instantly, then the server action revalidates and the server-stamped truth
 * replaces it. On failure React rolls the optimistic note back and the text
 * stays here in the composer.
 */
export function CommentComposer({
  conceptId,
  editing,
  onDone,
  viewer,
  onOptimistic,
}: {
  conceptId: string;
  editing?: ConceptComment;
  onDone?: () => void;
  /** identity for optimistic authorship (posting mode only) */
  viewer?: { id: string; username: string };
  onOptimistic?: (comment: ConceptComment) => void;
}) {
  const [body, setBody] = useState(editing?.body ?? "");
  const [tags, setTags] = useState<ConceptTag[]>(editing?.tags ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleTag = (tag: ConceptTag) =>
    setTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const submit = () => {
    setError(null);
    startTransition(async () => {
      if (!editing && viewer && onOptimistic && body.trim().length > 0) {
        onOptimistic({
          id: `optimistic-${Date.now()}`,
          conceptId,
          author: { id: viewer.id, username: viewer.username, displayName: null },
          body: body.trim(),
          tags,
          votes: 0,
          viewerHasVoted: false,
          isOwn: true,
          edited: false,
          postedAt: new Date().toISOString(),
        });
      }
      const result = editing
        ? await updateComment(editing.id, conceptId, body, tags)
        : await addComment(conceptId, body, tags);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (editing) {
        onDone?.();
      } else {
        setBody("");
        setTags([]);
      }
    });
  };

  return (
    <div className={editing ? "" : "sheet p-4"}>
      <label className="sr-only" htmlFor={`composer-${editing?.id ?? conceptId}`}>
        {editing ? "Edit your note" : "Add your take on this proposal"}
      </label>
      <textarea
        id={`composer-${editing?.id ?? conceptId}`}
        rows={editing ? 3 : 2}
        maxLength={2000}
        placeholder="Add your take on this proposal…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
        className="field resize-none"
      />

      <div className="mt-3 flex flex-col gap-2.5">
        <p className="overline text-[10px]">Lenses this note speaks to</p>
        <TagFilterBar active={tags} onToggle={toggleTag} />
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="dateline" aria-hidden>
          {body.length > 1600 ? `${body.length}/2000` : ""}
        </span>
        <div className="flex items-center gap-2">
          {editing ? (
            <button
              type="button"
              onClick={onDone}
              disabled={pending}
              className="btn btn-ghost btn-sm min-h-9"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={pending || body.trim().length === 0}
            className="btn btn-primary btn-sm min-h-9"
          >
            {pending ? "Filing…" : editing ? "Save note" : "Post note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentComposer;
