import { LottiePlayer } from "./LottiePlayer";
import { ANIMATION_SRC } from "@/constants/animations";
import { Silhouette } from "@/components/ui/Silhouette";

/**
 * The home hero's drafting plate: "elevation studies" — three vehicle
 * profiles sketch themselves in a loop (original animation, authored by
 * scripts/build-animations.mjs). Falls back to a static sedan elevation
 * under reduced motion or if the JSON is missing.
 */
export function HeroSketch() {
  return (
    <div className="sheet overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-4 py-2">
        <span className="ui-label text-[10px] text-ink-2">
          Elevation studies
        </span>
        <span className="dateline text-[10px] text-ink-2">03 sheets</span>
      </div>
      <div className="px-4 py-3 sm:px-5">
        <LottiePlayer
          src={ANIMATION_SRC.hero}
          ariaLabel="Sedan, truck, and minivan side profiles drafting themselves in a loop"
          className="mx-auto aspect-[42/25] w-full max-w-[440px]"
          fallback={
            <div className="mx-auto max-w-[320px] py-6">
              <Silhouette
                bodyStyle="sedan"
                className="h-auto w-full text-ink-2"
              />
              <div className="dim-rule mt-3" aria-hidden />
            </div>
          }
        />
      </div>
    </div>
  );
}

export default HeroSketch;
