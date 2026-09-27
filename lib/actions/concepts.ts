"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_TAGS } from "@/constants/lenses";
import { DESIGN_LIMITS, parseDesign } from "@/lib/design";
import type { SpecMetric } from "@/types";

/**
 * Sharing a concept. Same two-layer model as every write: the checks here
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimmedString(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

export async function createConcept(
  input: CreateConceptInput,
): Promise<CreateConceptResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to share a concept." };

  // A Server Action boundary is callable without TypeScript, so validate the
  // runtime payload before touching any string or array methods.
  if (!isRecord(input)) {
    return { ok: false, error: "Check the concept fields and try again." };
  }
  const title = trimmedString(input.title);
  const summary = trimmedString(input.summary);
  const details = trimmedString(input.details);
  const feasibility = trimmedString(input.feasibility);
  const bodyStyle = trimmedString(input.bodyStyle);
  const make = trimmedString(input.make);
  if (
    title === null ||
    summary === null ||
    details === null ||
    feasibility === null ||
    bodyStyle === null ||
    make === null
  ) {
    return { ok: false, error: "Check the concept fields and try again." };
  }

  if (title.length < 8 || title.length > 90)
    return { ok: false, error: "Use 8–90 characters for the title." };
  if (summary.length < 20 || summary.length > 300)
    return {
      ok: false,
      error: "Use 20–300 characters for the summary.",
    };
  if (details.length > 2000)
    return { ok: false, error: "Keep the argument within 2,000 characters." };
  if (feasibility.length > 2000)
    return {
      ok: false,
      error:
        "Keep the explanation of how it could work within 2,000 characters.",
    };
  if (bodyStyle.length < 3 || bodyStyle.length > 24)
    return { ok: false, error: "Use 3–24 characters for the body style." };
  if (make.length > 0 && (make.length < 2 || make.length > 40))
    return {
      ok: false,
      error:
        "Use 2–40 characters for the brand, or leave it blank for any brand.",
    };

  if (!Array.isArray(input.specs)) {
    return { ok: false, error: "Add at least one spec." };
  }
  // Keep only complete string spec rows, bounded like the DB expects.
  const specs = input.specs
    .flatMap((spec) => {
      if (!isRecord(spec)) return [];
      const label = trimmedString(spec.label);
      const value = trimmedString(spec.value);
      return label === null || value === null ? [] : [{ label, value }];
    })
    .filter((spec) => spec.label.length > 0 && spec.value.length > 0)
    .slice(0, 8);
  if (specs.length === 0) return { ok: false, error: "Add at least one spec." };
  if (specs.some((s) => s.label.length > 24 || s.value.length > 24))
    return {
      ok: false,
      error: "Spec labels and values max out at 24 characters.",
    };

  if (!Array.isArray(input.tags)) {
    return { ok: false, error: "Pick at least one topic." };
  }
  const tags = input.tags.filter(
    (tag): tag is string =>
      typeof tag === "string" && (ALL_TAGS as string[]).includes(tag),
  );
  if (tags.length === 0)
    return {
      ok: false,
      error: "Pick at least one topic so reviewers know what to discuss.",
    };

  // the studio design: strictly parsed (grammar, bounds, known skeletons) —
  // anything malformed is refused rather than silently stripped, and a
  // parsed-clean copy is what gets stored, never the raw client object
  let design = null;
  if (input.design !== undefined && input.design !== null) {
    design = parseDesign(input.design);
    if (!design)
      return {
        ok: false,
        error: "The sketch could not be saved. Check it and try again.",
      };
    if (JSON.stringify(design).length > DESIGN_LIMITS.maxJsonChars)
      return {
        ok: false,
        error: "The sketch is too large. Remove some strokes and try again.",
      };
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
    return { ok: false, error: "The concept could not be saved. Try again." };

  revalidatePath("/");
  revalidatePath("/explore");
  return { ok: true, id: data.id };
}
