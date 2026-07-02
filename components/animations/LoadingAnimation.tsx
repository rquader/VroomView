import { LottiePlayer } from "./LottiePlayer";
import { ANIMATION_SRC } from "@/constants/animations";

/**
 * Loading indicator. Plays public/animations/loading.json if present,
 * otherwise a drafting-compass dial: a dashed circle sweeping a single accent
 * tick. Reduced motion collapses the sweep to a static dial (global rule).
 */
export function LoadingAnimation({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <LottiePlayer
      src={ANIMATION_SRC.loading}
      ariaLabel={label}
      className={className ?? "h-24 w-24"}
      fallback={
        <div
          className="flex flex-col items-center gap-3"
          role="status"
          aria-label={label}
        >
          <svg
            viewBox="0 0 40 40"
            className="h-10 w-10 motion-safe:animate-spin [animation-duration:1.4s]"
            aria-hidden
          >
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="var(--line-2)"
              strokeWidth="1.5"
              strokeDasharray="2.5 5"
              strokeLinecap="round"
            />
            <path
              d="M20 2v7"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="dateline">{label}</span>
        </div>
      }
    />
  );
}

export default LoadingAnimation;
