import Link from "next/link";
import { ViewTransition } from "react";
import type { ConceptSummary } from "@/types";
import { ROUTES } from "@/constants/app";
import { timeAgo } from "@/utils/time";
import { CommentIcon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ConceptArtwork } from "./ConceptArtwork";
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
  return (
    <article className="concept-card">
      <div className="flex items-center gap-3 px-5 pt-5 sm:px-6">
        <Avatar name={author} small />
        <div className="min-w-0 flex-1 text-sm">
          <span className="font-medium text-ink">{author}</span>
          <span className="ml-2 text-xs text-ink-3" suppressHydrationWarning>
            {timeAgo(concept.postedAt)}
          </span>
        </div>
        {concept.make ? (
          <span className="truncate text-xs text-ink-2">
            For {concept.make}
          </span>
        ) : null}
      </div>
      <div className="px-5 pt-4 sm:px-6">
        <ViewTransition name={`vv-title-${concept.id}`}>
          <h2 className="font-serif text-[1.7rem] font-medium leading-[1.12] tracking-[-0.025em] sm:text-[1.95rem]">
            <Link href={href} className="hover:text-accent">
              {concept.title}
            </Link>
          </h2>
        </ViewTransition>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-2 sm:text-[15px]">
          {concept.summary}
        </p>
        <Link
          href={href}
          aria-label={`View ${concept.title}`}
          className="mt-5 block rounded-card"
        >
          <ConceptArtwork
            bodyStyle={concept.bodyStyle}
            design={concept.design}
          />
        </Link>
        <dl className="my-5 grid grid-cols-2 gap-x-5 gap-y-4 min-[480px]:grid-cols-3">
          {concept.specs.slice(0, 3).map((spec, index) => (
            <div key={`${spec.label}-${index}`} className="min-w-0">
              <dt className="text-xs text-ink-3">{spec.label}</dt>
              <dd className="mt-1 break-words font-mono text-sm font-medium text-ink">
                {spec.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {concept.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="topic-tag"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:px-5">
        <VoteControl
          conceptId={concept.id}
          score={concept.score}
          viewerVote={concept.viewerVote}
          signedIn={signedIn}
        />
        <Link
          href={`${href}#discussion`}
          className="btn btn-ghost min-h-11 gap-2 text-xs sm:text-sm"
          aria-label={`${concept.comments} comments on ${concept.title}`}
        >
          <CommentIcon size={17} />
          {concept.comments > 0
            ? `${concept.comments} comments`
            : "Start a conversation"}
        </Link>
      </div>
    </article>
  );
}
