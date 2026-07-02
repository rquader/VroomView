import type { ReactNode } from "react";

// Route group for credential pages (/login, /signup, …) — the URL never shows
// "(auth)". The group exists so these pages can share chrome decisions apart
// from the main app if needed; today it simply passes children through.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return children;
}
