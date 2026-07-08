import Link from "next/link";
import type { Concept } from "@/types";
import { ROUTES } from "@/constants/app";
import { Silhouette } from "@/components/ui/Silhouette";

/**
 * "More like this" for the detail rail: concepts ranked by shared lenses
 * (then support), computed by the caller so this stays presentational and
 * data-source-agnostic. Each entry carries its elevation thumbnail — the
 * board's visual index mark — and only claims votes it actually has.
 */
export function RelatedConcepts({ concepts }: { concepts: Concept[] }) {
  if (concepts.length === 0) return null;

  return (
    <section aria-label="Related concepts" className="mt-10">
      <h2 className="overline border-b border-line pb-3">More like this</h2>
      <ul className="mt-2 flex flex-col">
        {concepts.map((c) => (
          <li key={c.id} className="border-b border-line last:border-b-0">
            <Link
              href={ROUTES.concept(c.id)}
              className="group flex items-center gap-4 py-3.5 transition-colors"
            >
              <Silhouette
                bodyStyle={c.bodyStyle}
                className="w-16 shrink-0 text-ink-3 transition-colors group-hover:text-accent"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[10px]">
                  <span className="font-semibold uppercase tracking-[0.14em] text-accent">
                    {c.bodyStyle}
                  </span>
                  {c.score !== 0 ? (
                    <span className="dateline text-[10px]">
                      {c.score > 0 ? `+${c.score}` : c.score}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block font-serif text-[1.05rem] font-medium leading-snug tracking-[-0.01em] group-hover:text-accent">
                  {c.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedConcepts;
