import type { ReactNode } from "react";
import { LottiePlayer } from "./LottiePlayer";
import { ANIMATION_SRC } from "@/constants/animations";
import { Silhouette } from "@/components/ui/Silhouette";

/**
 * Shown when a list/screen has no content. Plays public/animations/empty.json
 * if present; otherwise an original "blank drawing sheet" illustration — a
 * dashed sheet with a ghost elevation waiting to be drawn (token-colored, so
 * it follows every theme).
 */
export function EmptyState({
  title = "Nothing on this sheet",
  description,
  action,
  className,
  heading: Heading = "h3",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Match the surrounding outline — e.g. "h2" when no h2 precedes it. */
  heading?: "h2" | "h3";
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className ?? ""}`}
    >
      <LottiePlayer
        src={ANIMATION_SRC.empty}
        ariaLabel="Empty"
        className="h-32 w-32"
        fallback={
          <div
            aria-hidden
            className="w-44 rounded-[10px] border border-dashed border-control px-5 pt-5 pb-3"
          >
            <Silhouette
              bodyStyle="wagon"
              className="h-auto w-full text-ink-3 opacity-70"
            />
            <div className="dim-rule mt-2.5" />
          </div>
        }
      />
      <Heading className="mt-1 text-lg font-semibold">{title}</Heading>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-ink-2">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}

export default EmptyState;
