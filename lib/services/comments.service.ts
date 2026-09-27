import { createClient } from "@/lib/supabase/server";
import { parseConceptTags } from "@/lib/domain/concept-mapping";
import { getViewer } from "@/lib/services/viewer.service";
import type { ConceptComment } from "@/types";
import type { Database } from "@/types/database";
import type { QueryData, SupabaseClient } from "@supabase/supabase-js";

/**
 * Comments ("notes") data access — same shape of thinking as the concepts
 * service: one embedded read, viewer state merged in, domain objects out.
 * "edited" is derived from timestamps the DATABASE stamped (moddatetime
 * trigger), so it can't be spoofed by a client.
 */

const MAX_COMMENT_READ_ROWS = 1_000;
const COMMENT_SELECT = `id, concept_id, body, tags, created_at, updated_at,
  author:profiles!comments_author_id_fkey(id, username, display_name),
  comment_votes(count)` as const;

function commentQuery(supabase: SupabaseClient<Database>) {
  return supabase.from("comments").select(COMMENT_SELECT);
}

type CommentRow = QueryData<ReturnType<typeof commentQuery>>[number];

export async function listCommentsByConcept(
  conceptId: string,
): Promise<ConceptComment[]> {
  const supabase = await createClient();

  const { data, error } = await commentQuery(supabase)
    .eq("concept_id", conceptId)
    .order("created_at", { ascending: true })
    .limit(MAX_COMMENT_READ_ROWS);
  if (error) throw new Error(`listComments failed: ${error.message}`);

  const rows: CommentRow[] = data ?? [];

  const viewer = await getViewer();
  let voted = new Set<string>();
  if (viewer && rows.length > 0) {
    const { data: votes, error: voteError } = await supabase
      .from("comment_votes")
      .select("comment_id")
      .eq("voter_id", viewer.id)
      .in(
        "comment_id",
        rows.map((r) => r.id),
      );
    if (voteError)
      throw new Error(`getCommentViewerVotes failed: ${voteError.message}`);
    voted = new Set((votes ?? []).map((v) => v.comment_id));
  }

  return rows.map((r) => ({
    id: r.id,
    conceptId: r.concept_id,
    author: {
      id: r.author.id,
      username: r.author.username,
      displayName: r.author.display_name,
    },
    body: r.body,
    tags: parseConceptTags(r.tags),
    votes: r.comment_votes[0]?.count ?? 0,
    viewerHasVoted: voted.has(r.id),
    isOwn: viewer !== null && r.author.id === viewer.id,
    edited: r.updated_at > r.created_at,
    postedAt: r.created_at,
  }));
}
