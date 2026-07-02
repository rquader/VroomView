/**
 * Minimal className combiner: drops falsy values and joins with spaces.
 *   cn("p-2", isActive && "bg-brand", undefined) -> "p-2 bg-brand"
 *
 * Intentionally dependency-free for the skeleton. When you build real UI and need
 * to DEDUPE conflicting Tailwind classes (e.g. a base "p-2" overridden by "p-4"),
 * upgrade to clsx + tailwind-merge:
 *   npm i clsx tailwind-merge
 *   import { clsx, type ClassValue } from "clsx";
 *   import { twMerge } from "tailwind-merge";
 *   export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
