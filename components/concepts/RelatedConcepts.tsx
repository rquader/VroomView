import Link from "next/link";
import type { Concept } from "@/types";
import { ROUTES } from "@/constants/app";

/**
 * "More like this" for the detail rail: concepts ranked by shared lenses
 * (then support), computed by the caller so this stays presentational and
 * data-source-agnostic.
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
              className="group block py-3.5 transition-colors"
            >
              <span className="flex items-center gap-2 text-[10px]">
                <span className="font-semibold uppercase tracking-[0.14em] text-accent">
                  {c.bodyStyle}
                </span>
                <span className="dateline text-[10px]">{c.votes} votes</span>
              </span>
              <span className="mt-1 block font-serif text-[1.05rem] font-medium leading-snug tracking-[-0.01em] group-hover:text-accent">
                {c.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedConcepts;
