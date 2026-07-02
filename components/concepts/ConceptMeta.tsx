import type { Concept } from "@/types";
import { Silhouette } from "@/components/ui/Silhouette";

/**
 * "About this proposal" — the drawing-plate meta block for the detail page.
 * Desktop: lives in the right rail. Mobile: flows after the discussion. Server
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

      {/* the elevation plate — body style drawn, not photographed */}
      <div className="mt-5 rounded-card border border-line bg-well/60 px-4 pt-4 pb-3">
        <Silhouette
          bodyStyle={concept.bodyStyle}
          className="mx-auto h-auto w-full max-w-[220px] text-ink-2"
        />
        <div className="dim-rule mx-auto mt-2 max-w-[220px]" aria-hidden />
        <p className="dateline mt-2 text-center">
          {concept.bodyStyle} · elevation
        </p>
      </div>

      <dl className="mt-5 flex flex-col">
        {[
          ["Filed by", `@${concept.author}`],
          ["Filed", filed],
          ["Support", `${concept.votes} votes`],
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
