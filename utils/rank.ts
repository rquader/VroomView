import type { Concept } from "@/types";

/**
 * Feed ranking math. Pure functions over domain objects so the sort menu
 * stays a dumb list of comparators.
 *
 * DETERMINISM: trending needs a "now", but the feed renders on the server
 * and hydrates on the client — two clocks. Using wall-clock time could flip
 * an ordering between the two renders and trip hydration. So the reference
 * clock is the NEWEST post's timestamp: identical on both sides, and ranking
 * is relative anyway.
 */

/** The board's reference clock: the newest post's timestamp (0 if empty). */
export function referenceClock(concepts: Concept[]): number {
  let max = 0;
  for (const c of concepts) {
    const t = Date.parse(c.postedAt);
    if (t > max) max = t;
  }
  return max;
}

/**
 * Trending: log-weighted score minus age decay (Reddit-style "hot").
 * log10 keeps a pile-on from drowning everything; the decay means a fresh
 * +3 outranks a stale +30 (one log10 decade ≈ 48 h of shelf life).
 */
export function hotScore(c: Concept, refMs: number): number {
  const magnitude = Math.log10(Math.max(Math.abs(c.score), 1));
  const ageHours = (refMs - Date.parse(c.postedAt)) / 3_600_000;
  return Math.sign(c.score) * magnitude - ageHours / 48;
}

/**
 * Controversy: an argument is controversial when it is BIG and BALANCED —
 * (up+down)^(minority/majority), Reddit's shape. Anything unanimous (either
 * side at zero) scores 0: silence isn't controversy.
 */
export function controversyScore(c: Concept): number {
  if (c.upvotes === 0 || c.downvotes === 0) return 0;
  const magnitude = c.upvotes + c.downvotes;
  const balance =
    c.upvotes > c.downvotes
      ? c.downvotes / c.upvotes
      : c.upvotes / c.downvotes;
  return magnitude ** balance;
}
