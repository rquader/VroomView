import { createClient } from "@/lib/supabase/server";
import type { ConceptComment, ConceptTag } from "@/types";

/**
 * Comments ("notes") data access — same shape of thinking as the concepts
 * service: one embedded read, viewer state merged in, domain objects out.
 * "edited" is derived from timestamps the DATABASE stamped (moddatetime
 * trigger), so it can't be spoofed by a client.
 */

type CommentRow = {
  id: string;
  concept_id: string;
  body: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author: { id: string; username: string; display_name: string | null };
  comment_votes: { count: number }[];
};

export async function listCommentsByConcept(
  conceptId: string,
): Promise<ConceptComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      // FK named explicitly: profiles is also reachable through comment_votes,
      // which would make a bare `profiles(...)` embed ambiguous to PostgREST.
      `id, concept_id, body, tags, created_at, updated_at,
       author:profiles!comments_author_id_fkey(id, username, display_name),
       comment_votes(count)`,
    )
    .eq("concept_id", conceptId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listComments failed: ${error.message}`);

  const rows = (data ?? []) as unknown as CommentRow[];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let voted = new Set<string>();
  if (user && rows.length > 0) {
    const { data: votes } = await supabase
      .from("comment_votes")
      .select("comment_id")
      .eq("voter_id", user.id)
      .in(
        "comment_id",
        rows.map((r) => r.id),
      );
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
    tags: r.tags as ConceptTag[],
    votes: r.comment_votes[0]?.count ?? 0,
    viewerHasVoted: voted.has(r.id),
    isOwn: user !== null && r.author.id === user.id,
    edited: r.updated_at > r.created_at,
    postedAt: r.created_at,
  }));
}
