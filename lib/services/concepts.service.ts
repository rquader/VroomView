import { createClient } from "@/lib/supabase/server";
import type { Concept, ConceptTag, SpecMetric } from "@/types";

/**
 * Concepts data access (server-side only — it imports the server client,
 * which reads request cookies, so pages using it render dynamically).
 *
 * HOW THE READ WORKS: one PostgREST request embeds everything the UI needs —
 * the author profile via the FK join and vote/comment COUNTS via the
 * aggregate embed (`concept_votes(count)` returns `[{ count }]` without
 * fetching rows). RLS runs inside that same query, so this code never
 * "adds" security — it inherits it. The viewer's own votes are a second
 * cheap indexed query, merged here so components receive complete domain
 * objects and never touch Supabase themselves.
 */

// profiles is reachable two ways (author FK, and through concept_votes), so
// PostgREST needs the exact FK named — `profiles!concepts_author_id_fkey` —
// or it refuses the embed as ambiguous.
const CONCEPT_SELECT = `id, title, summary, details, body_style, specs, tags,
  created_at, author:profiles!concepts_author_id_fkey(id, username, display_name),
  concept_votes(count), comments(count)` as const;

type ConceptRow = {
  id: string;
  title: string;
  summary: string;
  details: string | null;
  body_style: string;
  specs: unknown;
  tags: string[];
  created_at: string;
  author: { id: string; username: string; display_name: string | null };
  concept_votes: { count: number }[];
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
  votedIds: Set<string>,
): Concept {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    details: row.details,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.display_name,
    },
    bodyStyle: row.body_style,
    specs: parseSpecs(row.specs),
    tags: row.tags as ConceptTag[],
    votes: row.concept_votes[0]?.count ?? 0,
    comments: row.comments[0]?.count ?? 0,
    viewerHasVoted: votedIds.has(row.id),
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

/** Which of these concepts has the viewer voted for? (One indexed query.) */
async function getViewerVotes(
  viewerId: string | null,
  conceptIds: string[],
): Promise<Set<string>> {
  if (!viewerId || conceptIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from("concept_votes")
    .select("concept_id")
    .eq("voter_id", viewerId)
    .in("concept_id", conceptIds);
  return new Set((data ?? []).map((v) => v.concept_id));
}

/** The whole board, newest first. */
export async function listConcepts(): Promise<Concept[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concepts")
    .select(CONCEPT_SELECT)
    .order("created_at", { ascending: false });
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
  const { data, error } = await supabase
    .from("concepts")
    .select(CONCEPT_SELECT)
    .eq("id", id)
    .maybeSingle();
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
export async function getRelated(concept: Concept, limit = 3): Promise<Concept[]> {
  if (concept.tags.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concepts")
    .select(CONCEPT_SELECT)
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
      return shared(b) - shared(a) || b.votes - a.votes;
    })
    .slice(0, limit);
}
