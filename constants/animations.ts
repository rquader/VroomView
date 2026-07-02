/**
 * Runtime paths to Lottie JSON files served from /public/animations.
 *
 * <LottiePlayer> fetches these at runtime, so the app builds and runs fine even
 * before any JSON exists — components show a static fallback until you add a file.
 * To enable a real animation, drop a matching file in public/animations/, e.g.:
 *   public/animations/loading.json
 */
export const ANIMATION_SRC = {
  loading: "/animations/loading.json",
  empty: "/animations/empty.json",
  success: "/animations/success.json",
  error: "/animations/error.json",
} as const;

export type AnimationKey = keyof typeof ANIMATION_SRC;
