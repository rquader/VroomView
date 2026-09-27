export const APP_NAME = "VroomView";
export const APP_DESCRIPTION =
  "A community for vehicle ideas, improvements, and discussion.";

/**
 * Central route map — avoid scattering magic path strings across the app.
 * Only implemented routes belong here.
 */
export const ROUTES = {
  home: "/",
  about: "/about",
  account: "/account",
  login: "/login",
  signup: "/signup",
  explore: "/explore",
  submit: "/submit",
  concept: (id: string) => `/concepts/${id}`,
} as const;
