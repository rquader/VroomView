"use client";

import { useMemo } from "react";
import { designToLottie } from "@/lib/designLottie";
import { LottiePlayer } from "@/components/animations/LottiePlayer";
import { DesignPlate } from "./DesignPlate";
import type { ConceptDesign } from "@/types";

/**
 * The author's elevation, drafting itself: synthesizes a draw-on Lottie
 * from the design document (lib/designLottie) and plays it ONCE — the sheet
 * stays inked. LottiePlayer already handles reduced motion and any load
 * hiccup by showing the static plate instead.
 */
export function DesignSheet({
  design,
  className,
}: {
  design: ConceptDesign;
  className?: string;
}) {
  const animationData = useMemo(() => designToLottie(design), [design]);

  return (
    <LottiePlayer
      animationData={animationData}
      loop={false}
      ariaLabel="The author's concept elevation drawing itself"
      className={className}
      fallback={<DesignPlate design={design} className="h-auto w-full" />}
    />
  );
}

export default DesignSheet;
