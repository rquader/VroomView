import { skeletonById } from "@/constants/profiles";
import { ProfileSvg } from "@/components/ui/Silhouette";
import { designPenValue, designViewport } from "@/lib/design";
import type { ConceptDesign } from "@/types";

/**
 * Static render of a studio design — the skeleton (with the author's wheel
 * and ride-height choices) plus their pen strokes, or bare strokes on a
 * blank plate. Server-safe; currentColor ink like every elevation. Also the
 * reduced-motion/loading fallback for the animated <DesignSheet>.
 */
export function DesignPlate({
  design,
  strokeWidth = 1.3,
  className,
}: {
  design: ConceptDesign;
  strokeWidth?: number;
  className?: string;
}) {
  const skeleton = design.base ? skeletonById(design.base) : null;
  const { viewBox } = designViewport(design);

  if (skeleton) {
    return (
      <ProfileSvg
        profile={skeleton.profile}
        wheelScale={design.wheelScale}
        rideHeight={design.rideHeight}
        extraStrokes={design.strokes}
        viewBox={viewBox}
        strokeWidth={strokeWidth}
        className={className}
      />
    );
  }

  // blank plate: only the author's pen
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {design.strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          stroke={designPenValue(s.color)}
          strokeWidth={strokeWidth * 0.85}
        />
      ))}
    </svg>
  );
}

export default DesignPlate;
