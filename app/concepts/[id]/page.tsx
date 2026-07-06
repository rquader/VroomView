import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { getConcept, getRelated } from "@/lib/services/concepts.service";
import { listCommentsByConcept } from "@/lib/services/comments.service";
import { getViewer } from "@/lib/services/viewer.service";
import { timeAgo } from "@/utils/time";
import { sheetNo } from "@/utils/sheet";
import { SpecList } from "@/components/concepts/SpecList";
import { VoteControl } from "@/components/concepts/VoteControl";
import { CommentThread } from "@/components/concepts/CommentThread";
import { ConceptMeta } from "@/components/concepts/ConceptMeta";
import { RelatedConcepts } from "@/components/concepts/RelatedConcepts";
import { ArrowLeftIcon, TagIcon } from "@/components/ui/Icon";

// Rendered per request: content lives in Supabase now, and vote state is
// per-viewer. (No generateStaticParams — that pattern retired with the mock.)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const concept = await getConcept(id);
  return { title: concept ? concept.title : "Concept not found" };
}

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const concept = await getConcept(id);
  if (!concept) notFound();

  const [comments, related, viewer] = await Promise.all([
    listCommentsByConcept(concept.id),
    getRelated(concept),
    getViewer(),
  ]);
  const signedIn = viewer !== null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <Link
        href={ROUTES.home}
        className="inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeftIcon size={16} />
        Feed
      </Link>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_264px] lg:gap-16">
        <div className="max-w-3xl">
          <article>
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className="font-semibold uppercase tracking-[0.14em] text-accent">
                {concept.bodyStyle}
              </span>
              <span className="dateline">
                {timeAgo(concept.postedAt)} ·{" "}
                <span className="normal-case">@{concept.author.username}</span>
              </span>
            </div>
            <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem]">
              {concept.title}
            </h1>
            <p className="mt-4 text-xl leading-relaxed text-ink-2">
              {concept.summary}
            </p>
            {concept.details ? (
              <p className="mt-4 leading-relaxed">{concept.details}</p>
            ) : null}

            {/* The spec sheet is the lead image — set as a drawing's title block. */}
            <div className="sheet mt-8 overflow-hidden">
              {/* text on well-tinted surfaces uses ink-2/accent tiers — ink-3
                  dips below 4.5:1 there (see 21 - Accessibility and Mobile QA) */}
              <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-5 py-2.5">
                <h2 className="overline text-accent">Proposed specification</h2>
                <span className="dateline text-ink-2">
                  Sheet {sheetNo(concept.id)}
                </span>
              </div>
              <div className="px-5 py-6 sm:px-6">
                <SpecList specs={concept.specs} size="hero" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 border-t border-line pt-4">
              <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-3">
                <TagIcon size={13} className="shrink-0" />
                <span className="truncate">{concept.tags.join(" · ")}</span>
              </div>
              <div className="ml-auto shrink-0">
                <VoteControl
                  target={{ kind: "concept", conceptId: concept.id }}
                  votes={concept.votes}
                  voted={concept.viewerHasVoted}
                  signedIn={signedIn}
                />
              </div>
            </div>
          </article>

          <section className="mt-12">
            <div className="flex items-baseline gap-3 border-b border-line pb-3">
              <h2 className="font-serif text-2xl font-medium tracking-[-0.01em]">
                Discussion
              </h2>
              <span className="dateline">
                {comments.length} {comments.length === 1 ? "note" : "notes"}
              </span>
            </div>
            <div className="mt-6">
              <CommentThread
                conceptId={concept.id}
                comments={comments}
                signedIn={signedIn}
              />
            </div>
          </section>
        </div>

        {/* Meta + related: right rail on desktop, end-of-page on mobile */}
        <aside className="mt-14 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
          <ConceptMeta concept={concept} />
          <RelatedConcepts concepts={related} />
        </aside>
      </div>
    </main>
  );
}
