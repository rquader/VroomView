import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { ALL_TAGS, LENS_GROUPS, lensLabel } from "@/constants/lenses";
import { listConcepts } from "@/lib/services/concepts.service";
import { ConceptArtwork } from "@/components/concepts/ConceptArtwork";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage() {
  const concepts = await listConcepts();
  const styles = [
    ...new Set(concepts.map((concept) => concept.bodyStyle)),
  ].sort();
  const counts = Object.fromEntries(
    ALL_TAGS.map((tag) => [
      tag,
      concepts.filter((concept) => concept.tags.includes(tag)).length,
    ]),
  );
  return (
    <main className="page-shell pt-9 sm:pt-12">
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
        Explore
      </h1>
      <p className="mt-3 text-ink-2">Browse concepts by body style or topic.</p>
      <section className="mt-10" aria-labelledby="body-styles">
        <h2 id="body-styles" className="section-heading">
          Body styles
        </h2>
        {styles.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {styles.map((style) => {
              const count = concepts.filter(
                (concept) => concept.bodyStyle === style,
              ).length;
              return (
                <Link
                  key={style}
                  href={`/?body=${encodeURIComponent(style)}`}
                  className="sheet overflow-hidden p-4 transition-colors hover:border-control"
                >
                  <ConceptArtwork bodyStyle={style} />
                  <div className="flex items-baseline justify-between gap-3 px-1 pt-4 pb-1">
                    <h3 className="font-serif text-2xl font-medium">{style}</h3>
                    <span className="text-sm text-ink-3">
                      {count} {count === 1 ? "concept" : "concepts"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="sheet mt-5 p-6">
            <p className="text-ink-2">No concepts have been shared yet.</p>
            <Link href={ROUTES.submit} className="btn btn-primary mt-4">
              Share a concept
            </Link>
          </div>
        )}
      </section>
      <section className="mt-12" aria-labelledby="topics">
        <h2 id="topics" className="section-heading">
          Topics
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {LENS_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-2 text-sm font-semibold">{group.label}</h3>
              <ul>
                {group.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className="flex min-h-12 items-center justify-between border-b border-line text-sm text-ink-2 hover:text-accent"
                    >
                      <span>{lensLabel(tag)}</span>
                      <span className="text-xs text-ink-3">{counts[tag]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
