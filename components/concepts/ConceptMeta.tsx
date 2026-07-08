import type { Concept } from "@/types";
import { sheetNo } from "@/utils/sheet";

/**
 * The filing register for the detail page's desktop rail — sheet number,
 * author, date, support, lenses as a quiet dl. The elevation drawing moved
 * into the page's sheet header (it's the showpiece there); on mobile the
 * header carries all of this, so the rail simply doesn't render. Server
 * Component; purely presentational.
 */
export function ConceptMeta({ concept }: { concept: Concept }) {
  const filed = new Date(concept.postedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section aria-label="About this proposal">
      <h2 className="overline border-b border-line pb-3">On this sheet</h2>

      <dl className="mt-2 flex flex-col">
        {[
          ["Sheet", sheetNo(concept.id)],
          ["Filed by", `@${concept.author.username}`],
          ["Filed", filed],
          // "any maker" is the deliberate reading of NULL, not missing data
          ["Maker", concept.make ?? "Any maker"],
          // the running balance of the argument, with its parts shown
          [
            "Score",
            `${concept.score > 0 ? `+${concept.score}` : concept.score} (${concept.upvotes} up · ${concept.downvotes} down)`,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-line py-2.5"
          >
            <dt className="overline text-[10px]">{label}</dt>
            <dd className="text-sm text-ink">{value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="overline shrink-0 text-[10px]">Lenses</dt>
          <dd className="text-right text-[11px] uppercase tracking-wide text-ink-3">
            {concept.tags.join(" · ")}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default ConceptMeta;
