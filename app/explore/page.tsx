import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { ALL_TAGS, LENS_GROUPS } from "@/constants/lenses";
import { MOCK_CONCEPTS } from "@/lib/mock/concepts";
import { Silhouette } from "@/components/ui/Silhouette";

export const metadata: Metadata = { title: "Explore" };

/**
 * The catalogue: two honest indexes over what's actually on the board —
 * body styles (drawn plates, real counts, each leading to its top proposal)
 * and the review lenses. Counts are derived from the data, never invented.
 */
export default function ExplorePage() {
  // Group concepts by body style; surface each shelf's most-supported proposal.
  const shelves = [...new Set(MOCK_CONCEPTS.map((c) => c.bodyStyle))]
    .map((style) => {
      const inShelf = MOCK_CONCEPTS.filter((c) => c.bodyStyle === style);
      const leading = [...inShelf].sort((a, b) => b.votes - a.votes)[0];
      return { style, count: inShelf.length, leading };
    })
    .sort((a, b) => b.count - a.count || a.style.localeCompare(b.style));

  const lensCounts = Object.fromEntries(
    ALL_TAGS.map((t) => [
      t,
      MOCK_CONCEPTS.filter((c) => c.tags.includes(t)).length,
    ]),
  );

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        The catalogue
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em]">
        Browse the board
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-2">
        Every concept on the board, indexed two ways: by the body it proposes,
        and by the lenses it invites.
      </p>

      <section className="mt-12" aria-labelledby="by-body">
        <h2 id="by-body" className="overline border-b border-line pb-3">
          By body style
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelves.map(({ style, count, leading }) => (
            <div key={style} className="sheet sheet-hover flex flex-col p-5">
              <div className="rounded-[8px] border border-line bg-well/60 px-4 pt-3 pb-2">
                <Silhouette
                  bodyStyle={style}
                  className="mx-auto h-auto w-full max-w-[190px] text-ink-2"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl font-medium tracking-[-0.01em]">
                  {style}
                </h3>
                <span className="dateline">
                  {count} {count === 1 ? "concept" : "concepts"}
                </span>
              </div>
              <p className="overline mt-4 text-[10px]">Leading proposal</p>
              <Link
                href={ROUTES.concept(leading.id)}
                className="mt-1 line-clamp-2 text-sm leading-snug text-ink-2 transition-colors hover:text-accent"
              >
                {leading.title}
                <span className="ml-2 font-mono text-xs text-ink-3">
                  {leading.votes} votes
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="by-lens">
        <h2 id="by-lens" className="overline border-b border-line pb-3">
          By review lens
        </h2>
        <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {LENS_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <ul className="mt-3 flex flex-col">
                {group.tags.map((tag) => (
                  <li
                    key={tag}
                    className="flex items-baseline justify-between border-b border-line py-2 text-sm text-ink-2 last:border-b-0"
                  >
                    {tag}
                    <span className="font-mono text-xs text-ink-3">
                      {lensCounts[tag]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-ink-3">
          Lenses do the filtering in the{" "}
          <Link
            href={ROUTES.home}
            className="text-accent underline-offset-2 hover:underline"
          >
            feed
          </Link>
          . Dedicated shelves arrive with the database.
        </p>
      </section>
    </main>
  );
}
