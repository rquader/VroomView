import { createClient } from "@/lib/supabase/server";
import type { Concept, ConceptTag, SpecMetric, VoteDirection } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Concepts data access (server-side only — it imports the server client,
 * which reads request cookies, so pages using it render dynamically).
 *
 * HOW THE READ WORKS: one PostgREST request embeds everything the UI needs —
 * the author profile via the FK join and vote/comment COUNTS via aggregate
 * embeds. Votes are DIRECTIONAL (value ±1), so the same votes table is
 * embedded twice under aliases with independent filters (`up.value=eq.1`,
 * `down.value=eq.-1`) — each returns `[{ count }]` without fetching rows.
 * RLS runs inside that same query, so this code never "adds" security — it
 * inherits it. The viewer's own votes are a second cheap indexed query,
 * merged here so components receive complete domain objects and never touch
 * Supabase themselves.
 */

// profiles is reachable two ways (author FK, and through concept_votes), so
// PostgREST needs the exact FK named — `profiles!concepts_author_id_fkey` —
// or it refuses the embed as ambiguous.
const CONCEPT_SELECT = `id, title, summary, details, feasibility, body_style, make,
  specs, tags, created_at,
  author:profiles!concepts_author_id_fkey(id, username, display_name),
  up:concept_votes(count), down:concept_votes(count), comments(count)` as const;

/** The select + the embed filters that make `up`/`down` mean what they say. */
function conceptQuery(supabase: SupabaseClient) {
  return supabase
    .from("concepts")
    .select(CONCEPT_SELECT)
    .eq("up.value", 1)
    .eq("down.value", -1);
}

type ConceptRow = {
  id: string;
  title: string;
  summary: string;
  details: string | null;
  feasibility: string | null;
  body_style: string;
  make: string | null;
  specs: unknown;
  tags: string[];
  created_at: string;
  author: { id: string; username: string; display_name: string | null };
  up: { count: number }[];
  down: { count: number }[];
  comments: { count: number }[];
};

/** specs is JSONB — trust its shape only after checking it. */
function parseSpecs(raw: unknown): SpecMetric[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is SpecMetric =>
      typeof s === "object" &&
      s !== null &&
      typeof (s as SpecMetric).label === "string" &&
      typeof (s as SpecMetric).value === "string",
  );
}

function mapConcept(
  row: ConceptRow,
  viewerId: string | null,
  viewerVotes: Map<string, VoteDirection>,
): Concept {
  const upvotes = row.up[0]?.count ?? 0;
  const downvotes = row.down[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    details: row.details,
    feasibility: row.feasibility,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.display_name,
    },
    bodyStyle: row.body_style,
    make: row.make,
    specs: parseSpecs(row.specs),
    tags: row.tags as ConceptTag[],
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    comments: row.comments[0]?.count ?? 0,
    viewerVote: viewerVotes.get(row.id) ?? 0,
    isOwn: viewerId !== null && row.author.id === viewerId,
    postedAt: row.created_at,
  };
}

/** The signed-in user's id, or null for guests. */
async function getViewerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** The viewer's standing vote (±1) on each of these concepts. (One indexed query.) */
async function getViewerVotes(
  viewerId: string | null,
  conceptIds: string[],
): Promise<Map<string, VoteDirection>> {
  if (!viewerId || conceptIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("concept_votes")
    .select("concept_id, value")
    .eq("voter_id", viewerId)
    .in("concept_id", conceptIds);
  return new Map(
    (data ?? []).map((v) => [v.concept_id, v.value as VoteDirection]),
  );
}

/** The whole board, newest first. */
export async function listConcepts(): Promise<Concept[]> {
  const supabase = await createClient();
  const { data, error } = await conceptQuery(supabase).order("created_at", {
    ascending: false,
  });
  if (error) throw new Error(`listConcepts failed: ${error.message}`);

  const rows = (data ?? []) as unknown as ConceptRow[];
  const viewerId = await getViewerId();
  const voted = await getViewerVotes(
    viewerId,
    rows.map((r) => r.id),
  );
  return rows.map((r) => mapConcept(r, viewerId, voted));
}

/** One concept, or null if it doesn't exist. */
export async function getConcept(id: string): Promise<Concept | null> {
  const supabase = await createClient();
  const { data, error } = await conceptQuery(supabase).eq("id", id).maybeSingle();
  if (error) throw new Error(`getConcept failed: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as ConceptRow;
  const viewerId = await getViewerId();
  const voted = await getViewerVotes(viewerId, [row.id]);
  return mapConcept(row, viewerId, voted);
}

/**
 * "More like this": concepts sharing at least one lens, ranked by how many
 * lenses they share, then by support. The overlap filter uses the GIN index;
 * the (tiny) candidate set is ranked here in code.
 */
/**
 * Spec labels the community actually uses, most-used first — feeds the
 * drafting table's label suggestions alongside the developer presets.
 * Case-insensitive counting, first-seen casing wins; labels already in
 * `exclude` (the presets) are skipped so suggestions are genuinely new.
 */
export async function listCommunitySpecLabels(
  exclude: string[],
  limit = 8,
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("concepts").select("specs");
  if (error) throw new Error(`listCommunitySpecLabels failed: ${error.message}`);

  const excluded = new Set(exclude.map((l) => l.toLowerCase()));
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
    .map((e) => e.label);
}

export async function getRelated(concept: Concept, limit = 3): Promise<Concept[]> {
  if (concept.tags.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await conceptQuery(supabase)
    .neq("id", concept.id)
    .overlaps("tags", concept.tags)
    .limit(12);
  if (error) throw new Error(`getRelated failed: ${error.message}`);

  const rows = (data ?? []) as unknown as ConceptRow[];
  const viewerId = await getViewerId();
  const voted = await getViewerVotes(
    viewerId,
    rows.map((r) => r.id),
  );
  return rows
    .map((r) => mapConcept(r, viewerId, voted))
    .sort((a, b) => {
      const shared = (c: Concept) =>
        c.tags.filter((t) => concept.tags.includes(t)).length;
      return shared(b) - shared(a) || b.score - a.score;
    })
    .slice(0, limit);
}
