import type { ConceptDesign } from "@/types";
import { DesignPlate } from "./DesignPlate";
import { Silhouette } from "@/components/ui/Silhouette";

/** Never present the generic body-style drawing as an author's own design. */
export function ConceptArtwork({
  bodyStyle,
  design,
  large = false,
}: {
  bodyStyle: string;
  design?: ConceptDesign | null;
  large?: boolean;
}) {
  const authoredDesign =
    design && (design.base !== null || design.strokes.length > 0)
      ? design
      : null;
  return (
    <figure className={`concept-art ${large ? "concept-art-large" : ""}`}>
      <div className="concept-art-drawing" aria-hidden>
        {authoredDesign ? (
          <DesignPlate design={authoredDesign} strokeWidth={0.85} />
        ) : (
          <Silhouette bodyStyle={bodyStyle} strokeWidth={0.85} />
        )}
      </div>
      <figcaption className="relative flex items-center justify-between gap-3 text-xs text-ink-2">
        <span>{bodyStyle}</span>
        <span>
          {authoredDesign ? "Ideator’s sketch" : "Body style illustration"}
        </span>
      </figcaption>
    </figure>
  );
}
