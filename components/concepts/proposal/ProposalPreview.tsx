import type { ConceptDesign, ConceptTag, SpecMetric } from "@/types";
import { ConceptArtwork } from "../ConceptArtwork";
import { SpecList } from "../SpecList";

type ProposalPreviewProps = {
  username: string;
  title: string;
  summary: string;
  bodyStyle: string;
  make: string;
  design: ConceptDesign | null;
  specs: SpecMetric[];
  tags: ConceptTag[];
};

export function ProposalPreview({
  username,
  title,
  summary,
  bodyStyle,
  make,
  design,
  specs,
  tags,
}: ProposalPreviewProps) {
  const completeSpecs = specs.filter(
    (spec) => spec.label.trim() && spec.value.trim(),
  );

  return (
    <div className="sheet overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-4 py-2">
        <span className="ui-label text-[10px] text-ink-2">Preview</span>
        <span className="dateline text-[10px] text-ink-2">Draft</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="font-semibold uppercase tracking-[0.14em] text-accent">
            {bodyStyle.trim() || "Body style"}
          </span>
          <span className="dateline">
            @<span className="normal-case">{username}</span>
            {make ? (
              <>
                {" "}
                · for <span className="normal-case">{make}</span>
              </>
            ) : null}
          </span>
        </div>
        <h2 className="mt-2.5 font-serif text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
          {title.trim() || <span className="text-ink-3">Untitled concept</span>}
        </h2>
        <p className="mt-1.5 leading-relaxed text-ink-2">
          {summary.trim() || (
            <span className="text-ink-3">
              Your one-line pitch appears here.
            </span>
          )}
        </p>

        {design || bodyStyle.trim() ? (
          <div className="mt-4">
            <ConceptArtwork bodyStyle={bodyStyle} design={design} />
          </div>
        ) : null}

        {completeSpecs.length > 0 ? (
          <div className="mt-5">
            <SpecList specs={completeSpecs} lead />
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="mt-5 border-t border-line pt-3.5 text-[11px] uppercase tracking-wide text-ink-3">
            {tags.join(" · ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
