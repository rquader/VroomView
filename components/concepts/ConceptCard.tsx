import Link from "next/link";
import type { Concept } from "@/types";
import { ROUTES } from "@/constants/app";
import { timeAgo } from "@/utils/time";
import { SpecList } from "./SpecList";
import { VoteControl } from "./VoteControl";
import { CommentIcon, TagIcon } from "@/components/ui/Icon";

/**
 * A concept post in the feed — a catalogue entry: index + body-style kicker +
 * dateline, serif title (the only link — the card holds its own buttons), lede,
 * the measured spec sheet, then quiet tag marks + discussion/vote.
 */
export function ConceptCard({
  concept,
  index,
  signedIn,
}: {
  concept: Concept;
  index?: number;
  signedIn: boolean;
}) {
  return (
    <article className="sheet sheet-hover p-5 sm:p-6">
      <div className="flex items-center gap-2.5 text-[11px]">
        {typeof index === "number" ? (
          <span className="font-mono text-rubric">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
        <span className="font-semibold uppercase tracking-[0.14em] text-accent">
          {concept.bodyStyle}
        </span>
        {/* suppress: age labels re-compute on the client and may drift from the
            build-time SSG text (e.g. "5h" → "9h") — that drift is expected */}
        <span className="dateline" suppressHydrationWarning>
          {timeAgo(concept.postedAt)} ·{" "}
          {/* handles keep their true case inside the caps dateline */}
          <span className="normal-case">@{concept.author.username}</span>
        </span>
      </div>

      <h2 className="mt-2.5 font-serif text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
        <Link
          href={ROUTES.concept(concept.id)}
          className="transition-colors hover:text-accent"
        >
          {concept.title}
        </Link>
      </h2>
      <p className="mt-1.5 leading-relaxed text-ink-2">{concept.summary}</p>

      <div className="mt-5">
        <SpecList specs={concept.specs} />
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-line pt-3.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-3">
          <TagIcon size={13} className="shrink-0" />
          <span className="truncate">{concept.tags.join(" · ")}</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 text-sm text-ink-3"
            title={`${concept.comments} notes in discussion`}
          >
            <CommentIcon size={15} />
            <span className="font-mono tabular-nums">{concept.comments}</span>
            <span className="sr-only">notes in discussion</span>
          </span>
          <VoteControl
            target={{ kind: "concept", conceptId: concept.id }}
            votes={concept.votes}
            voted={concept.viewerHasVoted}
            signedIn={signedIn}
          />
        </div>
      </div>
    </article>
  );
}

export default ConceptCard;
