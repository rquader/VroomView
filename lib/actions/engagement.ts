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

function validTags(tags: unknown): tags is ConceptTag[] {
  return (
    Array.isArray(tags) &&
    tags.length <= ALL_TAGS.length &&
    tags.every(
      (tag): tag is ConceptTag =>
        typeof tag === "string" && (ALL_TAGS as string[]).includes(tag),
    )
  );
}

function normalizedCommentBody(body: unknown): string | null {
  return typeof body === "string" ? body.trim() : null;
}

/**
 * Set the caller's standing vote on a concept: +1 (back it), -1 (vote it
 * down), or 0 (withdraw). Not a toggle — the client states the desired end
 * state, so repeating a request is idempotent. Concurrent requests from
 * different tabs still settle in database execution order.
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
        const { data: retried, error: retryError } = await supabase
          .from("concept_votes")
          .update({ value: next })
          .eq("concept_id", conceptId)
          .eq("voter_id", user.id)
          .select("concept_id");
        if (retryError || !retried?.length)
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

async function getCommentConceptId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  commentId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("comments")
    .select("concept_id")
    .eq("id", commentId)
    .maybeSingle();
  return error || !data ? null : data.concept_id;
}

/** Set a comment vote after resolving its real parent concept on the server. */
export async function setCommentVote(
  commentId: string,
  desiredVoted: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };
  if (typeof desiredVoted !== "boolean") {
    return { ok: false, error: "That vote didn't stick — try again." };
  }

  // Do not trust a client to tell us which concept owns a comment. This read
  // also prevents a missing or hidden comment from looking like a vote success.
  const conceptId = await getCommentConceptId(supabase, commentId);
  if (!conceptId)
    return {
      ok: false,
      error: "That comment is unavailable — refresh and try again.",
    };

  const result = desiredVoted
    ? await supabase
        .from("comment_votes")
        .insert({ comment_id: commentId, voter_id: user.id })
    : await supabase
        .from("comment_votes")
        .delete()
        .eq("comment_id", commentId)
        .eq("voter_id", user.id);

  if (result.error && result.error.code !== "23505") {
    return { ok: false, error: "That vote didn't stick — try again." };
  }

  revalidatePath(`/concepts/${conceptId}`);
  return { ok: true };
}

export async function addComment(
  conceptId: string,
  body: unknown,
  tags: unknown,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const trimmed = normalizedCommentBody(body);
  if (!trimmed) return { ok: false, error: "Write the comment first." };
  if (trimmed.length > 2000)
    return { ok: false, error: "Comments max out at 2,000 characters." };
  if (!validTags(tags))
    return { ok: false, error: "Those topics don't exist." };

  const { error } = await supabase.from("comments").insert({
    concept_id: conceptId,
    author_id: user.id,
    body: trimmed,
    tags,
  });
  if (error)
    return { ok: false, error: "The comment didn't post — try again." };

  revalidatePath(`/concepts/${conceptId}`);
  revalidatePath("/"); // feed shows comment counts
  return { ok: true };
}

export async function updateComment(
  commentId: string,
  body: unknown,
  tags: unknown,
): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const trimmed = normalizedCommentBody(body);
  if (!trimmed) return { ok: false, error: "Write the comment first." };
  if (trimmed.length > 2000)
    return { ok: false, error: "Comments max out at 2,000 characters." };
  if (!validTags(tags))
    return { ok: false, error: "Those topics don't exist." };

  // .select() makes Postgres report the rows RLS actually let us touch —
  // zero rows means "not yours (or gone)", which we surface honestly.
  const { data, error } = await supabase
    .from("comments")
    .update({ body: trimmed, tags })
    .eq("id", commentId)
    .select("id, concept_id")
    .maybeSingle();
  if (error)
    return { ok: false, error: "The comment didn't save — try again." };
  if (!data)
    return { ok: false, error: "You can only edit your own comments." };

  revalidatePath(`/concepts/${data.concept_id}`);
  return { ok: true };
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const { supabase, user } = await getSessionUser();
  if (!user) return { ok: false, error: SIGN_IN_FIRST };

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id, concept_id")
    .maybeSingle();
  if (error)
    return { ok: false, error: "The comment didn't delete — try again." };
  if (!data)
    return { ok: false, error: "You can only delete your own comments." };

  revalidatePath(`/concepts/${data.concept_id}`);
  revalidatePath("/");
  return { ok: true };
}
