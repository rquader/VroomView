// Convenient re-exports so features can `import type { ... } from "@/types"`.
export type { Database, Json } from "./database";

/**
 * DOMAIN types — the shapes the app reasons about, independent of the
 * database's column names. lib/services/* maps raw rows into these, which is
 * what lets the UI stay untouched when the data source evolves.
 *
 * Two fields deserve explanation because they're PER-VIEWER, not per-row:
 * `viewerHasVoted` and `isOwn` are computed by the services against the
 * current session — the same concept is a different object for different
 * people. That's also why pages that render these are dynamically rendered.
 */
export type Profile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
};

/** The public identity attached to concepts and comments. */
export type Author = {
  id: string;
  username: string;
  displayName: string | null;
};

/** A single label/value row in a concept's "spec sheet". */
export type SpecMetric = { label: string; value: string };

/** A viewer's standing vote on a concept: backed, none, or voted down. */
export type VoteDirection = -1 | 0 | 1;

/**
 * Comment/concept filter tags (the 11 discussion lenses). Each lens family
 * carries an "Other" catch-all; the family name is baked into the stored
 * string so the flat tags stay unambiguous — the UI shortens them to
 * "Other" inside their group (see lensLabel in constants/lenses.ts).
 */
export type ConceptTag =
  | "Mileage"
  | "Price"
  | "Environment"
  | "Design"
  | "Performance"
  | "Reliability"
  | "Safety"
  | "Market fit"
  | "Other (practicality)"
  | "Other (engineering)"
  | "Other (design)";

/** A proposed vehicle concept post (the core domain object of the board). */
export type Concept = {
  id: string;
  title: string;
  summary: string;
  details: string | null;
  author: Author;
  bodyStyle: string;
  specs: SpecMetric[];
  tags: ConceptTag[];
  /** directional votes: score = upvotes − downvotes, the number the UI leads with */
  upvotes: number;
  downvotes: number;
  score: number;
  comments: number;
  viewerVote: VoteDirection;
  isOwn: boolean;
  postedAt: string; // ISO (created_at)
};

/** A note in a concept's discussion — filterable by the same 8 lenses. */
export type ConceptComment = {
  id: string;
  conceptId: string;
  author: Author;
  body: string;
  tags: ConceptTag[];
  votes: number;
  viewerHasVoted: boolean;
  isOwn: boolean;
  edited: boolean; // derived server-side: updated_at > created_at
  postedAt: string;
};
