import type { ConceptTag } from "@/types";

/**
 * The 8 discussion lenses concepts/comments can be filtered by. Shared domain
 * vocabulary (not component state), so it lives in constants/ where BOTH
 * Server and Client Components can import it.
 */
export const ALL_TAGS: ConceptTag[] = [
  "Mileage",
  "Price",
  "Environment",
  "Design",
  "Performance",
  "Reliability",
  "Safety",
  "Market fit",
];

/** The lenses grouped into families — drives the filter rail, drawer, and explore index. */
export const LENS_GROUPS: { label: string; tags: ConceptTag[] }[] = [
  { label: "Cost & practicality", tags: ["Price", "Mileage", "Market fit"] },
  { label: "Engineering", tags: ["Performance", "Reliability", "Safety"] },
  { label: "Design & impact", tags: ["Design", "Environment"] },
];
