import { cache } from "react";
import { parseDesign } from "@/lib/design";
import {
  parseConceptTags,
  parseSpecs,
  parseVoteDirection,
} from "@/lib/domain/concept-mapping";
import { getViewer } from "@/lib/services/viewer.service";
import { createClient } from "@/lib/supabase/server";
import type { Concept, ConceptSummary, VoteDirection } from "@/types";
import type { Database } from "@/types/database";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

/**
 * Board and related reads intentionally omit the two long-form proposal
 * fields. The explicit cap matches the current PostgREST response ceiling;
 * pagination needs a product decision before the board grows beyond it.
 */
const MAX_BOARD_READ_ROWS = 1_000;
const RELATED_CANDIDATE_LIMIT = 12;

// Profiles is reachable through both author and votes, so this FK is explicit.
const CONCEPT_SUMMARY_SELECT = `id, title, summary, body_style, make, design,
  specs, tags, created_at,
  author:profiles!concepts_author_id_fkey(id, username, display_name),
  up:concept_votes(count), down:concept_votes(count), comments(count)` as const;

const CONCEPT_DETAIL_SELECT = `id, title, summary, details, feasibility,
  body_style, make, design, specs, tags, created_at,
  author:profiles!concepts_author_id_fkey(id, username, display_name),
  up:concept_votes(count), down:concept_votes(count), comments(count)` as const;

function summaryConceptQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from("concepts")
    .select(CONCEPT_SUMMARY_SELECT)
    .eq("up.value", 1)
    .eq("down.value", -1);
}

function detailConceptQuery(supabase: SupabaseClient<Database>) {
  return supabase
    .from("concepts")
    .select(CONCEPT_DETAIL_SELECT)
    .eq("up.value", 1)
    .eq("down.value", -1);
}

type ConceptSummaryRow = QueryData<
  ReturnType<typeof summaryConceptQuery>
>[number];
type ConceptDetailRow = QueryData<
  ReturnType<typeof detailConceptQuery>
>[number];
type ConceptProjection = ConceptSummaryRow;

function mapConceptSummary(
  row: ConceptProjection,
  viewerId: string | null,
  viewerVotes: ReadonlyMap<string, VoteDirection>,
): ConceptSummary {
  const upvotes = row.up[0]?.count ?? 0;
  const downvotes = row.down[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.display_name,
    },
    bodyStyle: row.body_style,
    make: row.make,
    design: parseDesign(row.design),
    specs: parseSpecs(row.specs),
    tags: parseConceptTags(row.tags),
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    comments: row.comments[0]?.count ?? 0,
    viewerVote: viewerVotes.get(row.id) ?? 0,
    isOwn: viewerId !== null && row.author.id === viewerId,
    postedAt: row.created_at,
  };
}

function mapConcept(
  row: ConceptDetailRow,
  viewerId: string | null,
  viewerVotes: ReadonlyMap<string, VoteDirection>,
): Concept {
  return {
    ...mapConceptSummary(row, viewerId, viewerVotes),
    details: row.details,
    feasibility: row.feasibility,
  };
}

/** The viewer's standing vote. Query failures must reach the route boundary. */
async function getViewerVotes(
  viewerId: string | null,
  conceptIds: string[],
): Promise<Map<string, VoteDirection>> {
  if (!viewerId || conceptIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concept_votes")
    .select("concept_id, value")
    .eq("voter_id", viewerId)
    .in("concept_id", conceptIds);
  if (error) throw new Error(`getViewerVotes failed: ${error.message}`);

  const votes = new Map<string, VoteDirection>();
  for (const vote of data ?? []) {
    const direction = parseVoteDirection(vote.value);
    if (direction !== null) votes.set(vote.concept_id, direction);
  }
  return votes;
}

async function getViewerId(): Promise<string | null> {
  return (await getViewer())?.id ?? null;
}

/** The whole current board, newest first, using lean concept summaries. */
export async function listConcepts(): Promise<ConceptSummary[]> {
  const supabase = await createClient();
  const { data, error } = await summaryConceptQuery(supabase)
    .order("created_at", { ascending: false })
    .limit(MAX_BOARD_READ_ROWS);
  if (error) throw new Error(`listConcepts failed: ${error.message}`);

  const rows = data ?? [];
  const viewerId = await getViewerId();
  const voted = await getViewerVotes(
    viewerId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => mapConceptSummary(row, viewerId, voted));
}

/** One full concept record for the detail route, or null if it does not exist. */
export const getConcept = cache(async (id: string): Promise<Concept | null> => {
  const supabase = await createClient();
  const { data, error } = await detailConceptQuery(supabase)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getConcept failed: ${error.message}`);
  if (!data) return null;

  const viewerId = await getViewerId();
  const voted = await getViewerVotes(viewerId, [data.id]);
  return mapConcept(data, viewerId, voted);
});

/** Spec labels the community actually uses, most-used first. */
export async function listCommunitySpecLabels(
  exclude: string[],
  limit = 8,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concepts")
    .select("specs")
    .limit(MAX_BOARD_READ_ROWS);
  if (error)
    throw new Error(`listCommunitySpecLabels failed: ${error.message}`);

  const excluded = new Set(exclude.map((label) => label.toLowerCase()));
  const counts = new Map<string, { label: string; n: number }>();
  for (const row of data ?? []) {
    for (const spec of parseSpecs(row.specs)) {
      const key = spec.label.toLowerCase();
      if (excluded.has(key)) continue;
      const entry = counts.get(key);
      if (entry) entry.n += 1;
      else counts.set(key, { label: spec.label, n: 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((entry) => entry.label);
}

/**
 * Concepts sharing a lens, ranked by lens overlap and then support. Candidate
 * count intentionally stays at twelve to preserve the existing ranking.
 */
export async function getRelated(
  concept: Concept,
  limit = 3,
): Promise<ConceptSummary[]> {
  if (concept.tags.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await summaryConceptQuery(supabase)
    .neq("id", concept.id)
    .overlaps("tags", concept.tags)
    .limit(RELATED_CANDIDATE_LIMIT);
  if (error) throw new Error(`getRelated failed: ${error.message}`);

  const rows = data ?? [];
  const viewerId = await getViewerId();
  const voted = await getViewerVotes(
    viewerId,
    rows.map((row) => row.id),
  );
  return rows
    .map((row) => mapConceptSummary(row, viewerId, voted))
    .sort((a, b) => {
      const shared = (candidate: ConceptSummary) =>
        candidate.tags.filter((tag) => concept.tags.includes(tag)).length;
      return shared(b) - shared(a) || b.score - a.score;
    })
    .slice(0, limit);
}
