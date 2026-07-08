"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_TAGS } from "@/constants/lenses";
import { DESIGN_LIMITS, parseDesign } from "@/lib/design";
import type { SpecMetric } from "@/types";

/**
 * Filing a concept. Same two-layer model as every write: the checks here
 * exist to give the drafter precise, friendly feedback — the database's CHECK
 * constraints and RLS policies (insert requires author_id = auth.uid()) are
 * the law underneath. The bounds below mirror the SQL constraints exactly
 * (see supabase/migrations/…create_concepts.sql) so users never hit a raw
 * Postgres error for something the form could have said nicely.
 */

export type CreateConceptInput = {
  title: string;
  summary: string;
  details: string;
  /** the production case — optional, like details */
  feasibility: string;
  bodyStyle: string;
  /** proposed manufacturer; empty string = deliberate "any maker" (stored NULL) */
  make: string;
  /** studio design document, if the author drafted one (validated here) */
  design?: unknown;
  specs: SpecMetric[];
  tags: string[];
};

export type CreateConceptResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createConcept(
  input: CreateConceptInput,
): Promise<CreateConceptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to file a proposal." };

  const title = input.title.trim();
  const summary = input.summary.trim();
  const details = input.details.trim();
  const feasibility = input.feasibility.trim();
  const bodyStyle = input.bodyStyle.trim();
  const make = input.make.trim();

  if (title.length < 8 || title.length > 90)
    return { ok: false, error: "Titles run 8–90 characters." };
  if (summary.length < 20 || summary.length > 300)
    return { ok: false, error: "The summary needs 20–300 characters — one or two real sentences." };
  if (details.length > 2000)
    return { ok: false, error: "The case maxes out at 2,000 characters." };
  if (feasibility.length > 2000)
    return { ok: false, error: "The production case maxes out at 2,000 characters." };
  if (bodyStyle.length < 3 || bodyStyle.length > 24)
    return { ok: false, error: "Body style runs 3–24 characters." };
  if (make.length > 0 && (make.length < 2 || make.length > 40))
    return { ok: false, error: "Maker names run 2–40 characters — or leave it blank for any maker." };

  // keep only complete spec rows, bounded like the DB expects
  const specs = input.specs
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label.length > 0 && s.value.length > 0)
    .slice(0, 8);
  if (specs.length === 0)
    return { ok: false, error: "A proposal needs at least one number — that's the whole idea." };
  if (specs.some((s) => s.label.length > 24 || s.value.length > 24))
    return { ok: false, error: "Spec labels and values max out at 24 characters." };

  const tags = input.tags.filter((t) => (ALL_TAGS as string[]).includes(t));
  if (tags.length === 0)
    return { ok: false, error: "Pick at least one lens so reviewers know where to look." };

  // the studio design: strictly parsed (grammar, bounds, known skeletons) —
  // anything malformed is refused rather than silently stripped, and a
  // parsed-clean copy is what gets stored, never the raw client object
  let design = null;
  if (input.design !== undefined && input.design !== null) {
    design = parseDesign(input.design);
    if (!design)
      return { ok: false, error: "That design sheet didn't validate — redraw and try again." };
    if (JSON.stringify(design).length > DESIGN_LIMITS.maxJsonChars)
      return { ok: false, error: "That design sheet is too heavy — fewer strokes, same idea." };
  }

  const { data, error } = await supabase
    .from("concepts")
    .insert({
      author_id: user.id,
      title,
      summary,
      details: details.length > 0 ? details : null,
      feasibility: feasibility.length > 0 ? feasibility : null,
      body_style: bodyStyle,
      make: make.length > 0 ? make : null,
      design,
      specs,
      tags,
    })
    .select("id")
    .single();

  if (error || !data)
    return { ok: false, error: "The filing didn't go through — try again." };

  revalidatePath("/");
  revalidatePath("/explore");
  return { ok: true, id: data.id };
}
