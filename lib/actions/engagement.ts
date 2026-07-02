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
    tags.length <= 8 && tags.every((t) => (ALL_TAGS as string[]).includes(t))
  );
}

export async function toggleConceptVote(
  conceptId: string,
  currentlyVoted: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const result = currentlyVoted
    ? await supabase
        .from("concept_votes")
        .delete()
        .eq("concept_id", conceptId)
        .eq("voter_id", user.id)
    : await supabase
        .from("concept_votes")
        .insert({ concept_id: conceptId, voter_id: user.id });

  // 23505 = unique violation: a double-tap raced us; the vote already exists,
  // which is the state the user asked for — treat as success.
  if (result.error && result.error.code !== "23505") {
    return { ok: false, error: "That vote didn't stick — try again." };
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
  if (!validTags(tags)) return { ok: false, error: "Those lenses don't exist." };

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
  if (!validTags(tags)) return { ok: false, error: "Those lenses don't exist." };

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
