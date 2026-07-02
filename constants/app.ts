export const APP_NAME = "VroomView";
export const APP_DESCRIPTION =
  "An independent review board for automotive concepts — proposals with real numbers, debated like a design review.";

/**
 * Central route map — avoid scattering magic path strings across the app.
 * These pages don't all exist yet; add entries as you build features and
 * reference ROUTES.* instead of hard-coding "/login" etc.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  feed: "/feed",
  explore: "/explore",
  submit: "/submit",
  concept: (id: string) => `/concepts/${id}`,
  profile: (username: string) => `/profile/${username}`,
} as const;
