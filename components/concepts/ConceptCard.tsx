import Link from "next/link";
import { ViewTransition } from "react";
import type { Concept } from "@/types";
import { ROUTES } from "@/constants/app";
import { timeAgo } from "@/utils/time";
import { SpecList } from "./SpecList";
import { VoteControl } from "./VoteControl";
import { Silhouette } from "@/components/ui/Silhouette";
import { CommentIcon, TagIcon } from "@/components/ui/Icon";

/**
 * A concept post in the feed — a catalogue entry: index + body-style kicker +
 * dateline, serif title (the only link — the card holds its own buttons), lede,
 * the measured spec sheet with its headline number, then quiet tag marks +
 * discussion/vote. Hovering the card (pointer devices) ghosts the concept's
 * elevation in from the right edge — the drawing showing through the sheet.
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
    <article className="sheet sheet-hover group relative overflow-hidden p-5 sm:p-6">
      <Silhouette
        bodyStyle={concept.bodyStyle}
        aria-hidden
        className="pointer-events-none absolute -right-3 top-5 hidden w-44 translate-x-3 text-ink opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-0 group-hover:opacity-10 lg:block"
      />

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
        <span className="dateline truncate" suppressHydrationWarning>
          {timeAgo(concept.postedAt)} ·{" "}
          {/* handles keep their true case inside the caps dateline */}
          <span className="normal-case">@{concept.author.username}</span>
          {concept.make ? (
            <>
              {" "}
              · for <span className="normal-case">{concept.make}</span>
            </>
          ) : null}
        </span>
      </div>

      {/* named transition: this title morphs into the detail sheet's h1 —
          the card being pulled up to the drafting table */}
      <ViewTransition name={`vv-title-${concept.id}`}>
        <h2 className="mt-2.5 font-serif text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
          <Link
            href={ROUTES.concept(concept.id)}
            className="transition-colors group-hover:text-accent"
          >
            {concept.title}
          </Link>
        </h2>
      </ViewTransition>
      <p className="mt-1.5 leading-relaxed text-ink-2">{concept.summary}</p>

      <div className="mt-5">
        <SpecList specs={concept.specs} lead />
      </div>

      <div className="mt-5 flex items-center gap-4 border-t border-line pt-3.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-3">
          <TagIcon size={13} className="shrink-0" />
          <span className="truncate">{concept.tags.join(" · ")}</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={`${ROUTES.concept(concept.id)}#discussion`}
            aria-label={`${concept.comments} ${
              concept.comments === 1 ? "note" : "notes"
            } — open the discussion`}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-btn px-1.5 text-sm text-ink-3 transition-colors hover:text-accent"
          >
            <CommentIcon size={15} />
            <span className="font-mono tabular-nums">{concept.comments}</span>
          </Link>
          <VoteControl
            conceptId={concept.id}
            score={concept.score}
            viewerVote={concept.viewerVote}
            signedIn={signedIn}
          />
        </div>
      </div>
    </article>
  );
}

export default ConceptCard;
