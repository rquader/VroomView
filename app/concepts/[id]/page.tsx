import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
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
import { Silhouette } from "@/components/ui/Silhouette";
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
        <div>
          <article>
            {/*
              The drawing sheet — the page's showpiece. The whole header is ONE
              filed sheet: register strip (body style, author, sheet number),
              title beside the elevation drawing, the measured spec band, then
              the action band where backing gets stamped. The identity moment
              of the product lives here, so it earns the full vocabulary.
            */}
            <div className="sheet relative overflow-hidden">
              <div
                aria-hidden
                className="drafting-grid pointer-events-none absolute inset-0 opacity-70"
              />

              {/* register strip — text on well surfaces stays ink/ink-2/accent
                  (ink-3 dips below 4.5:1 there; see 21 - Accessibility) */}
              <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line bg-well/60 px-5 py-2.5 sm:px-7">
                <div className="flex items-center gap-2.5 text-[11px]">
                  <span className="font-semibold uppercase tracking-[0.14em] text-accent">
                    {concept.bodyStyle}
                  </span>
                  <span className="dateline text-ink-2">
                    {timeAgo(concept.postedAt)} ·{" "}
                    <span className="normal-case">
                      @{concept.author.username}
                    </span>
                  </span>
                </div>
                <span className="dateline text-ink-2">
                  Sheet {sheetNo(concept.id)}
                </span>
              </div>

              {/* title block: headline + summary beside the elevation drawing */}
              <div className="relative grid gap-7 px-5 pt-6 pb-7 sm:px-7 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-center lg:gap-10">
                <div>
                  {/* pairs with the feed card's identically-named transition:
                      the title morphs from card to sheet on navigation */}
                  <ViewTransition name={`vv-title-${concept.id}`}>
                    <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem]">
                      {concept.title}
                    </h1>
                  </ViewTransition>
                  <p className="mt-4 text-lg leading-relaxed text-ink-2 sm:text-xl">
                    {concept.summary}
                  </p>
                </div>
                <div className="lg:border-l lg:border-line lg:pl-10">
                  <Silhouette
                    bodyStyle={concept.bodyStyle}
                    strokeWidth={1.25}
                    className="mx-auto h-auto w-full max-w-[260px] text-ink lg:max-w-none"
                  />
                  <div
                    className="dim-rule mx-auto mt-3 max-w-[260px] lg:max-w-none"
                    aria-hidden
                  />
                  <p className="dateline mt-2 text-center text-ink-2">
                    {concept.bodyStyle} · elevation
                  </p>
                </div>
              </div>

              {/* the measured spec band */}
              <div className="relative border-t border-line bg-well/40 px-5 py-6 sm:px-7">
                <h2 className="overline text-accent">Proposed specification</h2>
                <div className="mt-5">
                  <SpecList specs={concept.specs} size="hero" />
                </div>
              </div>

              {/* action band: lenses + the support stamp */}
              <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line px-5 py-4 sm:px-7">
                <div className="flex min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-wide text-ink-3">
                  <TagIcon size={13} className="shrink-0" />
                  <span>{concept.tags.join(" · ")}</span>
                </div>
                <VoteControl
                  variant="stamp"
                  conceptId={concept.id}
                  score={concept.score}
                  viewerVote={concept.viewerVote}
                  signedIn={signedIn}
                  className="w-full sm:ml-auto sm:w-auto"
                />
              </div>
            </div>

            {concept.details ? (
              <div className="mt-8 max-w-3xl">
                {/* same label the drafting table uses — filing and reading rhyme */}
                <h2 className="overline">The case for it</h2>
                <p className="mt-3 leading-relaxed">{concept.details}</p>
              </div>
            ) : null}
          </article>

          <section id="discussion" className="mt-12 max-w-3xl scroll-mt-24">
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
                viewer={
                  viewer ? { id: viewer.id, username: viewer.username } : null
                }
              />
            </div>
          </section>
        </div>

        {/* Register + related: desktop right rail. On mobile the sheet header
            already carries the meta, so only "more like this" follows the read. */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <ConceptMeta concept={concept} />
          <RelatedConcepts concepts={related} />
        </aside>
        <div className="mt-12 lg:hidden">
          <RelatedConcepts concepts={related} />
        </div>
      </div>
    </main>
  );
}
