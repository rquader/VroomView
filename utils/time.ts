/**
 * Compact editorial age label for a timestamp: "just now", "40m", "5h", "2d",
 * "3w", then "Jun 12" (with year once it differs). Designed for mono datelines.
 *
 * NOTE: statically-generated pages compute this at build time, so ages drift
 * until the next build/revalidate. Fine for mock data; when real data lands,
 * pair with revalidation or client hydration if exact ages matter.
 */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 0) return "";
  if (seconds < 90) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.round(days / 7);
  if (weeks <= 4) return `${weeks}w`;

  const sameYear = then.getFullYear() === now.getFullYear();
  return then.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}
