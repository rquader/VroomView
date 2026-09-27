import Link from "next/link";
import { ViewTransition } from "react";
import type { ConceptSummary } from "@/types";
import { ROUTES } from "@/constants/app";
import { timeAgo } from "@/utils/time";
import { CommentIcon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { DesignPlate } from "./DesignPlate";
import { VoteControl } from "./VoteControl";

export function ConceptCard({
  concept,
  signedIn,
}: {
  concept: ConceptSummary;
  signedIn: boolean;
}) {
  const author = concept.author.displayName || concept.author.username;
  const href = ROUTES.concept(concept.id);
  const hasDesign =
    concept.design &&
    (concept.design.base !== null || concept.design.strokes.length > 0);
  const headlineSpec = concept.specs[0];

  return (
    <article className="gallery-card">
      <Link
        href={href}
        className="gallery-preview"
        aria-label={`View ${concept.title}`}
        aria-describedby={!hasDesign ? `summary-${concept.id}` : undefined}
      >
        <span className="gallery-preview-label">
          {concept.bodyStyle}
          {concept.make ? ` · ${concept.make}` : ""}
        </span>
        {hasDesign ? (
          <div className="gallery-drawing" aria-hidden="true">
            <DesignPlate design={concept.design!} strokeWidth={0.85} />
          </div>
        ) : (
          <p id={`summary-${concept.id}`} className="gallery-excerpt">
            {concept.summary}
          </p>
        )}
        <span className="gallery-preview-foot">
          {hasDesign ? <span>Ideator’s sketch</span> : <span>Idea</span>}
          {headlineSpec ? (
            <span className="text-right">
              <span className="sr-only">{headlineSpec.label}: </span>
              {headlineSpec.value}
            </span>
          ) : null}
        </span>
      </Link>
      <div className="px-1 pt-4">
        <ViewTransition name={`vv-title-${concept.id}`}>
          <h2 className="font-serif text-[1.65rem] font-medium leading-tight tracking-[-0.025em]">
            <Link href={href} className="hover:text-accent">
              {concept.title}
            </Link>
          </h2>
        </ViewTransition>
        {hasDesign ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-2">
            {concept.summary}
          </p>
        ) : null}
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-2">
          <Avatar name={author} small />
          <span className="truncate font-medium">{author}</span>
          <span aria-hidden="true">·</span>
          <time
            dateTime={concept.postedAt}
            className="shrink-0"
            suppressHydrationWarning
          >
            {timeAgo(concept.postedAt)}
          </time>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3">
          {concept.tags.slice(0, 2).map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="inline-flex min-h-9 items-center rounded text-xs text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-accent"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-1 pt-3">
        <VoteControl
          conceptId={concept.id}
          score={concept.score}
          viewerVote={concept.viewerVote}
          signedIn={signedIn}
        />
        <Link
          href={`${href}#discussion`}
          className="btn btn-ghost min-h-11 gap-2 text-sm"
          aria-label={`${concept.comments} comments on ${concept.title}`}
        >
          <CommentIcon size={18} />
          <span>{concept.comments}</span>
        </Link>
      </div>
    </article>
  );
}
