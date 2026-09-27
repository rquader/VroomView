"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_TAGS } from "@/constants/lenses";
import type { ConceptTag } from "@/types";

/**
 * Mutations for votes and comments, as Server Actions.
 *
 * SECURITY MODEL (two layers, on purpose): each action checks the session
 * first — that's for fast, friendly errors — but the REAL enforcement is RLS
 * in Postgres. Even if a bug (or a crafted request) skipped every check here,
 * the database would still refuse to write a row that isn't the caller's.
 * App checks are UX; policies are law.
 *
 * After a successful write we revalidatePath() the affected routes so the
 * next render reads fresh data — the client pairs this with useOptimistic
 * so the UI never waits for the round trip.
 */

export type ActionResult = { ok: true } | { ok: false; error: string };

const SIGN_IN_FIRST = "Sign in to join the review.";

async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function validTags(tags: string[]): tags is ConceptTag[] {
  return (
    tags.length <= ALL_TAGS.length &&
    tags.every((t) => (ALL_TAGS as string[]).includes(t))
  );
}

/**
 * Set the caller's standing vote on a concept: +1 (back it), -1 (vote it
 * down), or 0 (withdraw). Not a toggle — the client states the desired end
 * state, so a stale/raced call converges on what the user last asked for.
 */
export async function setConceptVote(
  conceptId: string,
  next: number,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };
  // client input is untrusted — the DB CHECK would also refuse, but say it nicely
  if (next !== -1 && next !== 0 && next !== 1) {
    return { ok: false, error: "That vote didn't stick — try again." };
  }

  if (next === 0) {
    const { error } = await supabase
      .from("concept_votes")
      .delete()
      .eq("concept_id", conceptId)
      .eq("voter_id", user.id);
    if (error)
      return { ok: false, error: "That vote didn't stick — try again." };
  } else {
    // update-first (direction changes are UPDATEs — the grant only allows
    // touching `value`); insert when no row exists yet. 23505 = an insert
    // race with ourselves — the row exists now, so update wins the argument.
    const { data: updated, error: updateError } = await supabase
      .from("concept_votes")
      .update({ value: next })
      .eq("concept_id", conceptId)
      .eq("voter_id", user.id)
      .select("concept_id");
    if (updateError)
      return { ok: false, error: "That vote didn't stick — try again." };

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase
        .from("concept_votes")
        .insert({ concept_id: conceptId, voter_id: user.id, value: next });
      if (insertError?.code === "23505") {
        const { error: retryError } = await supabase
          .from("concept_votes")
          .update({ value: next })
          .eq("concept_id", conceptId)
          .eq("voter_id", user.id);
        if (retryError)
          return { ok: false, error: "That vote didn't stick — try again." };
      } else if (insertError) {
        return { ok: false, error: "That vote didn't stick — try again." };
      }
    }
  }

  revalidatePath("/");
  revalidatePath(`/concepts/${conceptId}`);
  return { ok: true };
}

export async function toggleCommentVote(
  commentId: string,
  conceptId: string,
  currentlyVoted: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const result = currentlyVoted
    ? await supabase
        .from("comment_votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("voter_id", user.id)
    : await supabase
        .from("comment_votes")
        .insert({ comment_id: commentId, voter_id: user.id });

  if (result.error && result.error.code !== "23505") {
    return { ok: false, error: "That vote didn't stick — try again." };
  }

  revalidatePath(`/concepts/${conceptId}`);
  return { ok: true };
}

export async function addComment(
  conceptId: string,
  body: string,
  tags: string[],
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const trimmed = body.trim();
  if (trimmed.length < 1) return { ok: false, error: "Write the note first." };
  if (trimmed.length > 2000)
    return { ok: false, error: "Notes max out at 2,000 characters." };
  if (!validTags(tags))
    return { ok: false, error: "Those lenses don't exist." };

  const { error } = await supabase.from("comments").insert({
    concept_id: conceptId,
    author_id: user.id,
    body: trimmed,
    tags,
  });
  if (error) return { ok: false, error: "The note didn't post — try again." };

  revalidatePath(`/concepts/${conceptId}`);
  revalidatePath("/"); // feed shows note counts
  return { ok: true };
}

export async function updateComment(
  commentId: string,
  conceptId: string,
  body: string,
  tags: string[],
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const trimmed = body.trim();
  if (trimmed.length < 1) return { ok: false, error: "Write the note first." };
  if (trimmed.length > 2000)
    return { ok: false, error: "Notes max out at 2,000 characters." };
  if (!validTags(tags))
    return { ok: false, error: "Those lenses don't exist." };

  // .select() makes Postgres report the rows RLS actually let us touch —
  // zero rows means "not yours (or gone)", which we surface honestly.
  const { data, error } = await supabase
    .from("comments")
    .update({ body: trimmed, tags })
    .eq("id", commentId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "The edit didn't save — try again." };
  if (!data) return { ok: false, error: "You can only edit your own notes." };

  revalidatePath(`/concepts/${conceptId}`);
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
  conceptId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: "The note didn't delete — try again." };
  if (!data) return { ok: false, error: "You can only delete your own notes." };

  revalidatePath(`/concepts/${conceptId}`);
  revalidatePath("/");
  return { ok: true };
}
