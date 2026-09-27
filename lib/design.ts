import { skeletonById } from "@/constants/profiles";
import type { ConceptDesign } from "@/types";

/**
 * Parsing and provenance for the concept design document (the shape itself
 * is the domain type ConceptDesign in @/types).
 *
 * SECURITY POSTURE: this is user-authored structured data, so it is parsed
 * STRICTLY on both sides — createConcept validates before writing, and the
 * services re-validate on read (defense in depth; the DB CHECK only bounds
 * size/shape). Path data is limited to an M/L/Q/Z grammar with bounded,
 * finite coordinates: nothing here can smuggle markup or scripts, and the
 * Lottie synthesizer can consume it directly.
 *
 * kind is a discriminator on purpose: "studio" is the only kind today;
 * "image" is RESERVED for future photo uploads (Storage + moderation +
 * copyright pipeline — documented in the team notes, deliberately not
 * built yet).
 */

export const DESIGN_LIMITS = {
  maxStrokes: 24,
  maxPathChars: 500,
  wheelScale: { min: 0.8, max: 1.3 },
  rideHeight: { min: -2, max: 4 },
  /** guard before insert; the DB CHECK allows a little more headroom */
  maxJsonChars: 16000,
} as const;

/** coordinates may overshoot the 96×40 canvas a little, never wildly */
const COORD_MIN = -40;
const COORD_MAX = 160;

const NUMBER_RE = /^-?(?:\d+\.?\d*|\.\d+)$/;

/**
 * One stroke of M/L/Q/Z path data: right grammar, bounded finite numbers.
 * Returns the CANONICAL serialization ("M1,2 L3,4 …") or null — storing the
 * rebuilt string (never the raw input) means every renderer downstream sees
 * exactly one, unambiguous form of the path.
 */
export function canonicalStrokePath(d: string): string | null {
  if (
    typeof d !== "string" ||
    d.length === 0 ||
    d.length > DESIGN_LIMITS.maxPathChars
  )
    return null;
  if (!/^[MLQZ0-9\-.,\s]*$/.test(d)) return null;
  const tokens = d.match(/[MLQZ]|-?[\d.]+/g);
  if (!tokens || tokens[0] !== "M") return null;
  let k = 0;
  let points = 0;
  const parts: string[] = [];
  const num = (): string | null => {
    const t = tokens[k++];
    if (t === undefined || !NUMBER_RE.test(t)) return null;
    const v = parseFloat(t);
    if (v < COORD_MIN || v > COORD_MAX) return null;
    return String(Math.round(v * 10) / 10);
  };
  while (k < tokens.length) {
    const cmd = tokens[k++] as string;
    const need =
      cmd === "M" || cmd === "L" ? 2 : cmd === "Q" ? 4 : cmd === "Z" ? 0 : -1;
    if (need < 0) return null;
    const nums: string[] = [];
    for (let i = 0; i < need; i++) {
      const n = num();
      if (n === null) return null;
      nums.push(n);
    }
    points += need / 2;
    parts.push(
      cmd === "Z"
        ? "Z"
        : cmd === "Q"
          ? `Q${nums[0]},${nums[1]} ${nums[2]},${nums[3]}`
          : `${cmd}${nums[0]},${nums[1]}`,
    );
  }
  if (points < 1) return null;
  const canonical = parts.join(" ");
  return canonical.length <= DESIGN_LIMITS.maxPathChars ? canonical : null;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

/**
 * Strict parse of an unknown value into a ConceptDesign, or null. Builds a
 * CLEAN object (unknown keys dropped), clamps the knobs, verifies the base
 * skeleton exists, and validates every stroke. A design that draws nothing
 * (no base, no strokes) parses to null — it isn't a design.
 */
export function parseDesign(raw: unknown): ConceptDesign | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw))
    return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1 || o.kind !== "studio") return null;

  const base =
    typeof o.base === "string" && skeletonById(o.base) ? o.base : null;

  const wheelScale =
    typeof o.wheelScale === "number" && Number.isFinite(o.wheelScale)
      ? clamp(
          o.wheelScale,
          DESIGN_LIMITS.wheelScale.min,
          DESIGN_LIMITS.wheelScale.max,
        )
      : 1;
  const rideHeight =
    typeof o.rideHeight === "number" && Number.isFinite(o.rideHeight)
      ? clamp(
          o.rideHeight,
          DESIGN_LIMITS.rideHeight.min,
          DESIGN_LIMITS.rideHeight.max,
        )
      : 0;

  if (!Array.isArray(o.strokes) || o.strokes.length > DESIGN_LIMITS.maxStrokes)
    return null;
  const strokes: { d: string }[] = [];
  for (const s of o.strokes) {
    if (typeof s !== "object" || s === null) return null;
    const d = (s as { d?: unknown }).d;
    if (typeof d !== "string") return null;
    const canonical = canonicalStrokePath(d);
    if (canonical === null) return null;
    strokes.push({ d: canonical });
  }

  if (base === null && strokes.length === 0) return null;
  // a blank plate has no body to lift and no wheels to size — normalize the
  // knobs so every renderer (static SVG, Lottie) agrees on the geometry
  if (base === null) {
    return {
      v: 1,
      kind: "studio",
      base,
      wheelScale: 1,
      rideHeight: 0,
      strokes,
    };
  }
  return { v: 1, kind: "studio", base, wheelScale, rideHeight, strokes };
}

/** Honest provenance line for a published design — labelling is the deal. */
export function designProvenance(design: ConceptDesign): string {
  const skeleton = design.base ? skeletonById(design.base) : null;
  const drew = design.strokes.length > 0;
  if (!skeleton) return "drawn freehand in the studio";
  const origin =
    skeleton.origin === "ai" ? "an AI-drafted skeleton" : "a board skeleton";
  return drew ? `adapted from ${origin}` : `from ${origin}`;
}
