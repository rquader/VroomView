import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { getConcept, getRelated } from "@/lib/services/concepts.service";
import { listCommentsByConcept } from "@/lib/services/comments.service";
import { getViewer } from "@/lib/services/viewer.service";
import { timeAgo } from "@/utils/time";
import { designProvenance } from "@/lib/design";
import { ConceptArtwork } from "@/components/concepts/ConceptArtwork";
import { SpecList } from "@/components/concepts/SpecList";
import { VoteControl } from "@/components/concepts/VoteControl";
import { CommentThread } from "@/components/concepts/CommentThread";
import { ConceptMeta } from "@/components/concepts/ConceptMeta";
import { RelatedConcepts } from "@/components/concepts/RelatedConcepts";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeftIcon, CommentIcon } from "@/components/ui/Icon";

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const concept = await getConcept(id);
  return {
    title: concept?.title ?? "Concept not found",
    description: concept?.summary,
  };
}

export default async function ConceptDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const concept = await getConcept(id);
  if (!concept) notFound();
  const [comments, related, viewer] = await Promise.all([
    listCommentsByConcept(concept.id),
    getRelated(concept),
    getViewer(),
  ]);
  const signedIn = viewer !== null;
  const author = concept.author.displayName || concept.author.username;

  return (
    <main className="page-shell pt-6 sm:pt-8">
      <Link
        href={ROUTES.home}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 hover:text-accent"
      >
        <ArrowLeftIcon size={16} /> Community
      </Link>
      <div className="mt-5 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_264px] lg:gap-12">
        <div className="min-w-0">
          <article className="sheet overflow-hidden">
            <div className="p-5 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <Avatar name={author} />
                <div className="text-sm">
                  <p className="font-medium">{author}</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    @{concept.author.username} <span className="mx-1">·</span>{" "}
                    <span suppressHydrationWarning>
                      {timeAgo(concept.postedAt)}
                    </span>
                  </p>
                </div>
              </div>
              <ViewTransition name={`vv-title-${concept.id}`}>
                <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                  {concept.title}
                </h1>
              </ViewTransition>
              <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
                {concept.summary}
              </p>
              <div className="mt-6">
                <ConceptArtwork
                  bodyStyle={concept.bodyStyle}
                  design={concept.design}
                  large
                />
              </div>
              {concept.design ? (
                <p className="mt-2 text-xs text-ink-3">
                  {designProvenance(concept.design)}
                </p>
              ) : null}
              <section className="mt-7" aria-labelledby="specifications">
                <h2 id="specifications" className="mb-5 text-sm font-semibold">
                  Proposed specifications
                </h2>
                <SpecList specs={concept.specs} size="hero" />
              </section>
              {concept.details ? (
                <section className="mt-8">
                  <h2 className="section-heading">The argument</h2>
                  <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-ink-2">
                    {concept.details}
                  </p>
                </section>
              ) : null}
              {concept.feasibility ? (
                <section className="mt-8">
                  <h2 className="section-heading">How it could work</h2>
                  <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-ink-2">
                    {concept.feasibility}
                  </p>
                </section>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-2">
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-8">
              <VoteControl
                conceptId={concept.id}
                score={concept.score}
                viewerVote={concept.viewerVote}
                signedIn={signedIn}
              />
              <a href="#discussion" className="btn btn-ghost gap-2 text-sm">
                <CommentIcon size={17} />
                {comments.length} comments
              </a>
            </div>
          </article>
          <section
            id="discussion"
            className="mt-10 scroll-mt-28"
            aria-labelledby="comments-heading"
          >
            <h2 id="comments-heading" className="section-heading">
              Comments{" "}
              <span className="ml-1 font-sans text-sm font-normal text-ink-3">
                {comments.length}
              </span>
            </h2>
            <div className="mt-5">
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
        <aside className="lg:sticky lg:top-28">
          <ConceptMeta concept={concept} />
          <RelatedConcepts concepts={related} />
        </aside>
      </div>
    </main>
  );
}
