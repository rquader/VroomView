import { LottiePlayer } from "./LottiePlayer";
import { ANIMATION_SRC } from "@/constants/animations";

/**
 * Error feedback. Plays public/animations/error.json if present, otherwise an
 * original "broken dimension" drawing — a measurement rule snapped by a
 * drafting break mark, with the break struck in the danger tone.
 */
export function ErrorAnimation({
  message = "Something went wrong",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ""}`}>
      <LottiePlayer
        src={ANIMATION_SRC.error}
        loop={false}
        ariaLabel="Error"
        className="h-24 w-24"
        fallback={
          <svg viewBox="0 0 120 44" className="h-12 w-32" aria-hidden>
            {/* left rule with end tick */}
            <g stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 22h42" />
              <path d="M6 16v12" />
            </g>
            {/* right rule, knocked out of line */}
            <g stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M72 28h42" />
              <path d="M114 22v12" />
            </g>
            {/* the break — struck through in the danger tone */}
            <g stroke="var(--danger)" strokeWidth="2" strokeLinecap="round">
              <path d="M52 32L64 12" />
              <path d="M58 34L70 14" />
            </g>
          </svg>
        }
      />
      <p className="text-sm text-ink-2">{message}</p>
    </div>
  );
}

export default ErrorAnimation;
