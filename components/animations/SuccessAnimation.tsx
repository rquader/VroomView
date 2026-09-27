import { LottiePlayer } from "./LottiePlayer";
import { ANIMATION_SRC } from "@/constants/animations";

/**
 * Success feedback. Plays public/animations/success.json if present, otherwise
 * an original "approval stamp" — a double-ring check, set slightly off-square
 * the way a real stamp lands.
 */
export function SuccessAnimation({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className ?? ""}`}>
      <LottiePlayer
        src={ANIMATION_SRC.success}
        loop={false}
        ariaLabel="Success"
        className="h-24 w-24"
        fallback={
          <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden>
            <g
              transform="rotate(-8 24 24)"
              fill="none"
              stroke="var(--accent)"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="24" cy="24" r="20" strokeWidth="1.75" />
              <circle
                cx="24"
                cy="24"
                r="16"
                strokeWidth="0.75"
                opacity="0.55"
              />
              <path d="M16.5 24.5l5 5L32 19" strokeWidth="2.25" />
            </g>
          </svg>
        }
      />
      {message ? <p className="text-sm text-ink-2">{message}</p> : null}
    </div>
  );
}

export default SuccessAnimation;
