// Convenient re-exports so features can `import type { ... } from "@/types"`.
export type { Database, Json } from "./database";

/**
 * DOMAIN types — the shapes YOUR app reasons about, kept independent of the
 * database's exact column names/types. Data-access code (lib/services/*) maps
 * raw rows into these. This decoupling is what lets you later swap or add a data
 * source (e.g. a Java/Python API) WITHOUT touching UI code.
 *
 * This is an illustrative starter — evolve it as you design real features.
 */
export type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
};

/** A single label/value row in a concept's "spec sheet". */
export type SpecMetric = { label: string; value: string };

/** Comment/concept filter tags (the 8 discussion lenses). */
export type ConceptTag =
  | "Mileage"
  | "Price"
  | "Environment"
  | "Design"
  | "Performance"
  | "Reliability"
  | "Safety"
  | "Market fit";

/** A proposed vehicle concept post (the core domain object of the forum). */
export type Concept = {
  id: string;
  title: string;
  summary: string;
  author: string; // display handle
  bodyStyle: string; // e.g. "Minivan", "Wagon", "Coupe"
  specs: SpecMetric[];
  tags: ConceptTag[];
  votes: number;
  comments: number;
  postedAt: string; // ISO timestamp (matches Supabase created_at) — render via utils/time timeAgo()
  details?: string; // longer proposal body shown on the concept detail page
};

/** A comment in a concept's discussion — filterable by the same 8 tags. */
export type ConceptComment = {
  id: string;
  conceptId: string;
  author: string;
  body: string;
  tags: ConceptTag[];
  votes: number;
  postedAt: string; // ISO timestamp, as above
};
