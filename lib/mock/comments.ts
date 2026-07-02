import type { ConceptComment } from "@/types";

/**
 * TEMPORARY mock discussion data for UI drafting ONLY — not real data.
 * Replace with a real `lib/services` call once the `comments` table + RLS exist.
 * Tags are drawn from the 8 discussion lenses (see the ConceptTag type).
 */
const MOCK_COMMENTS: ConceptComment[] = [
  // c1 — AWD minivan
  { id: "m1", conceptId: "c1", author: "snowbelt_dad", body: "AWD plus sliding doors at this price is the combo nobody actually sells. Take my money.", tags: ["Price", "Safety"], votes: 41, postedAt: "2026-06-30T14:00:00Z" },
  { id: "m2", conceptId: "c1", author: "frugal_ev", body: "Skipping the giant battery is the right call — a small hybrid kills range anxiety without the weight.", tags: ["Environment", "Mileage"], votes: 33, postedAt: "2026-06-30T18:00:00Z" },
  { id: "m3", conceptId: "c1", author: "market_watch", body: "Manufacturers keep claiming minivans don't sell, but this exact niche is wide open.", tags: ["Market fit"], votes: 18, postedAt: "2026-07-01T05:00:00Z" },
  // c2 — EV wagon
  { id: "m4", conceptId: "c2", author: "wagonlife", body: "Cargo height over a fastback roofline — finally someone gets what a wagon is for.", tags: ["Design"], votes: 27, postedAt: "2026-07-01T11:00:00Z" },
  { id: "m5", conceptId: "c2", author: "rangecheck", body: "Is 300 mi real-world or optimistic? That single number makes or breaks this.", tags: ["Mileage", "Reliability"], votes: 22, postedAt: "2026-07-01T12:00:00Z" },
  // c3 — hybrid coupe
  { id: "m6", conceptId: "c3", author: "analog4life", body: "Low mass and analog steering feel? This is exactly the commuter I keep wishing existed.", tags: ["Performance", "Design"], votes: 30, postedAt: "2026-06-30T14:00:00Z" },
  { id: "m7", conceptId: "c3", author: "safety_first", body: "2,650 lb feels ambitious once you add real crash structure — curious how they hit it.", tags: ["Safety", "Reliability"], votes: 14, postedAt: "2026-06-30T20:00:00Z" },
  // c4 — small truck
  { id: "m8", conceptId: "c4", author: "lighthauler", body: "A real 5-ft bed and a unibody ride is all most buyers actually need. Perfect size.", tags: ["Market fit"], votes: 44, postedAt: "2026-06-29T13:00:00Z" },
  { id: "m9", conceptId: "c4", author: "mpgmatters", body: "If it clears 40 mpg it quietly eats the whole midsize truck segment.", tags: ["Mileage", "Price"], votes: 37, postedAt: "2026-06-30T14:00:00Z" },
  { id: "m10", conceptId: "c4", author: "weekend_projects", body: "1,400 lb payload is more than enough for home and yard runs.", tags: ["Reliability"], votes: 12, postedAt: "2026-06-30T16:00:00Z" },
  // c5 — urban hatch
  { id: "m11", conceptId: "c5", author: "cityparker", body: "The narrow footprint is the entire point in a dense city. Yes please.", tags: ["Design", "Environment"], votes: 19, postedAt: "2026-07-01T08:00:00Z" },
  { id: "m12", conceptId: "c5", author: "repaircafe", body: "Swappable panels and cheap standard repairs is what 'sustainable' should actually mean.", tags: ["Environment", "Reliability"], votes: 25, postedAt: "2026-07-01T10:00:00Z" },
];

/** Returns the (mock) comments for a concept id. */
export function getMockComments(conceptId: string): ConceptComment[] {
  return MOCK_COMMENTS.filter((c) => c.conceptId === conceptId);
}
