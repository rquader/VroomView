import Link from "next/link";
import { FeedView } from "@/components/concepts/FeedView";
import { SpecList } from "@/components/concepts/SpecList";
import { listConcepts } from "@/lib/services/concepts.service";
import { getViewer } from "@/lib/services/viewer.service";
import { ROUTES } from "@/constants/app";
import { ALL_TAGS } from "@/constants/lenses";

/**
 * Home / feed. Server Component: fetches real rows through the service layer
 * (which reads the session cookie for per-viewer vote state — that's what
 * makes this page dynamically rendered) and hands plain domain objects to the
 * client <FeedView> for filtering/sorting.
 *
 * The story hero (headline + elevation studies) lives on /about now — home
 * is the WORKING board, so the feed leads and the masthead band stays
 * compact: title, one line, the board's honest numbers, and a door to the
 * story for newcomers.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  const [concepts, viewer, params] = await Promise.all([
    listConcepts(),
    getViewer(),
    searchParams,
  ]);

  // ?body= deep link (Explore's shelves): only honor styles that exist,
  // matched case-insensitively to the canonical casing in the data.
  const initialBody =
    concepts
      .map((c) => c.bodyStyle)
      .find((s) => s.toLowerCase() === params.body?.toLowerCase()) ?? null;

  // The board's own spec sheet — honest numbers derived from the data.
  const boardSpecs = [
    { label: "On the board", value: String(concepts.length) },
    {
      label: "Notes filed",
      value: String(concepts.reduce((n, c) => n + c.comments, 0)),
    },
    { label: "Review lenses", value: String(ALL_TAGS.length) },
  ];

  return (
    <main className="relative mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
      {/* faint graph-vellum grid behind the masthead band only */}
      <div
        aria-hidden
        className="drafting-grid pointer-events-none absolute inset-x-0 top-0 h-44"
      />

      <section className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            The proving ground
          </p>
          <h1 className="mt-2.5 font-serif text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            The review board
          </h1>
          <p className="mt-2.5 leading-relaxed text-ink-2">
            Every concept under review, argued with real numbers.{" "}
            <Link
              href={ROUTES.about}
              className="whitespace-nowrap text-accent underline-offset-2 hover:underline"
            >
              New here? The story →
            </Link>
          </p>
        </div>

        <div className="w-full max-w-sm shrink-0">
          <SpecList specs={boardSpecs} columns={3} />
        </div>
      </section>

      <section className="mt-10 sm:mt-11">
        <FeedView
          concepts={concepts}
          signedIn={viewer !== null}
          initialBody={initialBody}
        />
      </section>
    </main>
  );
}
