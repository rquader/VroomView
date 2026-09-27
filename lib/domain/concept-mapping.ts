import type { ConceptTag, SpecMetric, VoteDirection } from "@/types";

import { ALL_TAGS } from "@/constants/lenses";

const CONCEPT_TAGS = new Set<string>(ALL_TAGS);

/** Keep only the discussion lenses the domain recognizes. */
export function parseConceptTags(raw: readonly string[]): ConceptTag[] {
  return raw.filter((tag): tag is ConceptTag => CONCEPT_TAGS.has(tag));
}

/** JSONB spec sheets are user-authored, so retain only complete text metrics. */
export function parseSpecs(raw: unknown): SpecMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (metric): metric is SpecMetric =>
      typeof metric === "object" &&
      metric !== null &&
      typeof (metric as { label?: unknown }).label === "string" &&
      typeof (metric as { value?: unknown }).value === "string",
  );
}

/** concept_votes.value is numeric in Postgres, but only these values are valid domain votes. */
export function parseVoteDirection(value: number): VoteDirection | null {
  return value === -1 || value === 0 || value === 1 ? value : null;
}
