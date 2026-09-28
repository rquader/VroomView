import { skeletonById } from "@/constants/profiles";
import type { ConceptDesign, DesignPenColor } from "@/types";

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
  maxSampledPoints: 2048,
  wheelScale: { min: 0.8, max: 1.3 },
  rideHeight: { min: -2, max: 4 },
  /** guard before insert; the DB CHECK allows a little more headroom */
  maxJsonChars: 16000,
} as const;

export const DESIGN_PEN_COLORS: {
  id: DesignPenColor;
  name: string;
  value: string;
}[] = [
  { id: "ink", name: "Ink", value: "currentColor" },
  { id: "blue", name: "Blue", value: "#4b86b4" },
  { id: "red", name: "Red", value: "#c96b62" },
  { id: "green", name: "Green", value: "#57947b" },
  { id: "gold", name: "Gold", value: "#b88b41" },
];

export function designPenValue(color?: DesignPenColor): string {
  return (
    DESIGN_PEN_COLORS.find((pen) => pen.id === color)?.value ?? "currentColor"
  );
}

/** Framing is explicit so historical drawings keep their original crop. */
export function designViewport(
  design?: Pick<ConceptDesign, "viewport"> | null,
) {
  return design?.viewport === "roomy"
    ? { x: -16, y: -16, width: 128, height: 72, viewBox: "-16 -16 128 72" }
    : { x: 0, y: 0, width: 96, height: 40, viewBox: "0 0 96 40" };
}

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

type Point = readonly [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Iterative Ramer–Douglas–Peucker keeps bends throughout a whole stroke. */
function simplifyPoints(points: readonly Point[], tolerance: number): Point[] {
  const keep = new Set([0, points.length - 1]);
  const pending: [number, number][] = [[0, points.length - 1]];
  while (pending.length > 0) {
    const [start, end] = pending.pop()!;
    const [ax, ay] = points[start];
    const [bx, by] = points[end];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    let farthest = -1;
    let distanceSquared = tolerance * tolerance;
    for (let i = start + 1; i < end; i++) {
      const [x, y] = points[i];
      const t = lengthSquared
        ? clamp(((x - ax) * dx + (y - ay) * dy) / lengthSquared, 0, 1)
        : 0;
      const distance = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2;
      if (distance > distanceSquared) {
        farthest = i;
        distanceSquared = distance;
      }
    }
    if (farthest >= 0) {
      keep.add(farthest);
      pending.push([start, farthest], [farthest, end]);
    }
  }
  return [...keep].sort((a, b) => a - b).map((i) => points[i]);
}

function smoothPath(points: readonly Point[]): string {
  let d = `M${r1(points[0][0])},${r1(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const next = points[i + 1];
    d += ` Q${r1(x)},${r1(y)} ${r1((x + next[0]) / 2)},${r1((y + next[1]) / 2)}`;
  }
  const last = points[points.length - 1];
  return `${d} L${r1(last[0])},${r1(last[1])}`;
}

/** Simplify the entire gesture to fit the stored limit; never truncate it. */
export function pointsToPath(points: readonly Point[]): string | null {
  if (
    points.length < 2 ||
    points.some(
      ([x, y]) =>
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < COORD_MIN ||
        x > COORD_MAX ||
        y < COORD_MIN ||
        y > COORD_MAX,
    )
  )
    return null;
  const bounded =
    points.length <= DESIGN_LIMITS.maxSampledPoints
      ? points
      : Array.from(
          { length: DESIGN_LIMITS.maxSampledPoints },
          (_, i) =>
            points[
              Math.round(
                (i * (points.length - 1)) /
                  (DESIGN_LIMITS.maxSampledPoints - 1),
              )
            ],
        );
  let tolerance = 0.12;
  while (tolerance <= 512) {
    const path = smoothPath(simplifyPoints(bounded, tolerance));
    if (path.length <= DESIGN_LIMITS.maxPathChars)
      return canonicalStrokePath(path);
    tolerance *= 1.6;
  }
  return null;
}

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
  if (o.viewport !== undefined && o.viewport !== "roomy") return null;
  const viewport = o.viewport === "roomy" ? { viewport: "roomy" as const } : {};

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
  const strokes: ConceptDesign["strokes"] = [];
  for (const s of o.strokes) {
    if (typeof s !== "object" || s === null) return null;
    const d = (s as { d?: unknown }).d;
    if (typeof d !== "string") return null;
    const canonical = canonicalStrokePath(d);
    if (canonical === null) return null;
    const color = (s as { color?: unknown }).color;
    if (
      color !== undefined &&
      !DESIGN_PEN_COLORS.some((pen) => pen.id === color)
    )
      return null;
    strokes.push({
      d: canonical,
      ...(color !== undefined ? { color: color as DesignPenColor } : {}),
    });
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
      ...viewport,
      strokes,
    };
  }
  return {
    v: 1,
    kind: "studio",
    base,
    wheelScale,
    rideHeight,
    ...viewport,
    strokes,
  };
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
