import type { ConceptComment } from "@/types";
import { timeAgo } from "@/utils/time";
import { VoteControl } from "./VoteControl";

/**
 * A single note in a concept's discussion. Well-supported notes (≥30 votes)
 * get an accent left-edge and a "top note" mark so the thread is scannable
 * by signal.
 */
export function CommentCard({ comment }: { comment: ConceptComment }) {
  const top = comment.votes >= 30;

  return (
    <article
      className={`rounded-card bg-card p-4 ${
        top
          ? "border border-line-2 border-l-2 border-l-accent"
          : "border border-line"
      }`}
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-ink">@{comment.author}</span>
        <span className="dateline" suppressHydrationWarning>
          {timeAgo(comment.postedAt)}
        </span>
        {top ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
            · top note
          </span>
        ) : null}
      </div>
      <p className="mt-2 leading-relaxed">{comment.body}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-wide text-ink-3">
          {comment.tags.join(" · ")}
        </span>
        <div className="ml-auto">
          <VoteControl initial={comment.votes} />
        </div>
      </div>
    </article>
  );
}

export default CommentCard;
