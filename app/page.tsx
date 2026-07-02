import { FeedView } from "@/components/concepts/FeedView";
import { SpecList } from "@/components/concepts/SpecList";
import { HeroSketch } from "@/components/animations/HeroSketch";
import { listConcepts } from "@/lib/services/concepts.service";
import { getViewer } from "@/lib/services/viewer.service";
import { ALL_TAGS } from "@/constants/lenses";

/**
 * Home / feed. Server Component: fetches real rows through the service layer
 * (which reads the session cookie for per-viewer vote state — that's what
 * makes this page dynamically rendered) and hands plain domain objects to the
 * client <FeedView> for filtering/sorting.
 */
export default async function HomePage() {
  const [concepts, viewer] = await Promise.all([listConcepts(), getViewer()]);

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
    <main className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* faint graph-vellum grid behind the hero only */}
      <div
        aria-hidden
        className="drafting-grid pointer-events-none absolute inset-x-0 top-0 h-72"
      />

      <section className="relative lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            The proving ground
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            The cars that <em className="font-medium">should</em> exist, argued
            into shape.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
            An open review board for automotive concepts — proposals with real
            numbers, debated like a design review.
          </p>

          <div className="mt-8 max-w-md">
            <SpecList specs={boardSpecs} columns={3} />
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md lg:mt-0 lg:max-w-none">
          <HeroSketch />
        </div>
      </section>

      <section className="mt-12 sm:mt-14">
        <FeedView concepts={concepts} signedIn={viewer !== null} />
      </section>
    </main>
  );
}
