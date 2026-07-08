import type { ConceptTag } from "@/types";

/**
 * The 11 discussion lenses concepts/comments can be filtered by. Shared domain
 * vocabulary (not component state), so it lives in constants/ where BOTH
 * Server and Client Components can import it. The list mirrors the DB CHECK
 * (tags_are_lenses) exactly — change them together.
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
  "Other (practicality)",
  "Other (engineering)",
  "Other (design)",
];

/** The lenses grouped into families — drives the filter rail, drawer, and explore index. */
export const LENS_GROUPS: { label: string; tags: ConceptTag[] }[] = [
  {
    label: "Cost & practicality",
    tags: ["Price", "Mileage", "Market fit", "Other (practicality)"],
  },
  {
    label: "Engineering",
    tags: ["Performance", "Reliability", "Safety", "Other (engineering)"],
  },
  {
    label: "Design & impact",
    tags: ["Design", "Environment", "Other (design)"],
  },
];

/**
 * Display name INSIDE a labelled group, where the family is already visible:
 * the catch-alls read as plain "Other". Flat contexts (card tag lines, the
 * meta rail) keep the full string — three bare "Other"s would be ambiguous.
 */
export function lensLabel(tag: ConceptTag): string {
  return tag.startsWith("Other (") ? "Other" : tag;
}
