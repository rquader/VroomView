"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// lottie-react touches `document`, so it must never render on the server. Importing
// it via next/dynamic with ssr:false guarantees a client-only load.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// The global reduced-motion CSS rule can't reach Lottie's JS-driven playback,
// so the player itself respects the preference: reduced → static fallback.
const rmQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const subscribeReducedMotion = (cb: () => void) => {
  const mq = rmQuery();
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => rmQuery().matches,
    () => false, // server snapshot
  );
}

export type LottiePlayerProps = {
  /** Pre-imported Lottie JSON (bundled). Takes precedence over `src`. */
  animationData?: unknown;
  /** Public path to a Lottie JSON file, e.g. "/animations/loading.json". Fetched at runtime. */
  src?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  /** Shown while loading, or whenever no animation is available (missing file / fetch error). */
  fallback?: ReactNode;
  ariaLabel?: string;
};

/**
 * Generic wrapper around lottie-react.
 *
 * It fetches JSON from /public at runtime, so the app builds and runs even when a
 * file doesn't exist yet — it just shows `fallback` until you add the file. This is
 * also the single "use client" boundary, so the wrapper components (LoadingAnimation,
 * EmptyState, …) can stay server-friendly.
 */
export function LottiePlayer({
  animationData,
  src,
  loop = true,
  autoplay = true,
  className,
  fallback = null,
  ariaLabel,
}: LottiePlayerProps) {
  const [data, setData] = useState<unknown>(animationData ?? null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Don't even fetch when the user prefers reduced motion.
    if (reducedMotion || animationData || !src) return;

    let cancelled = false;

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Lottie file not found: ${src}`);
        return res.json();
      })
      .then((json) => {
        // Reset `failed` here (in the async callback, not synchronously in the
        // effect body) so a previously-failed src that now loads clears the fallback.
        if (!cancelled) {
          setData(json);
          setFailed(false);
        }
      })
      .catch(() => {
        // File not added yet (or invalid) — quietly fall back to the static UI.
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src, animationData, reducedMotion]);

  if (reducedMotion || !data || failed) return <>{fallback}</>;

  return (
    // vv-lottie scopes the theme re-inking rules in globals.css
    <div
      className={`vv-lottie ${className ?? ""}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Lottie animationData={data} loop={loop} autoplay={autoplay} />
    </div>
  );
}

export default LottiePlayer;
