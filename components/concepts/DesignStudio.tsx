"use client";

import { useRef, useState } from "react";
import { SKELETONS, skeletonById } from "@/constants/profiles";
import { DESIGN_LIMITS, designProvenance } from "@/lib/design";
import { ProfileSvg } from "@/components/ui/Silhouette";
import { DesignPlate } from "./DesignPlate";
import { CloseIcon } from "@/components/ui/Icon";
import type { ConceptDesign } from "@/types";

/**
 * The design bay — open on the table by default, because giving the concept
 * a face is half the fun of filing one. Three moves, all optional:
 *
 *   1. pick a SKELETON: the six board profiles, or the AI-drafted variants
 *      (labelled as such here AND on the published sheet — provenance is
 *      the deal), or a blank plate for pure pen work;
 *   2. set the STANCE: wheel size and ride height — the two knobs that
 *      can't produce a broken drawing (they only exist once a skeleton is
 *      on the plate; a blank plate has no body to lift);
 *   3. take the PEN: pointer strokes over the plate, smoothed to quadratics
 *      in the same M/L/Q grammar everything else speaks. Strokes are stored
 *      in BODY space, so they ride with the body when the stance changes.
 *
 * Controlled component: the drafting table owns the design state (null =
 * nothing on the plate yet — untouched, nothing files) and sends it with
 * the proposal. Everything here stays inside the validation bounds
 * (lib/design.ts) by construction, so what previews is what validates.
 */

// Sixteen points fit the stored path limit without dropping intermediate points.
const MAX_COORDINATE_POINTS = 16;

const BLANK: ConceptDesign = {
  v: 1,
  kind: "studio",
  base: null,
  wheelScale: 1,
  rideHeight: 0,
  strokes: [],
};

/** round to one decimal — keeps stored paths short */
const r1 = (n: number) => Math.round(n * 10) / 10;

/** points → M/L/Q path: midpoint-smoothed so pen lines read as drafting ink */
function pointsToPath(pts: [number, number][]): string | null {
  if (pts.length < 2) return null;
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  if (pts.length === 2) {
    d += ` L${r1(pts[1][0])},${r1(pts[1][1])}`;
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const [cx, cy] = pts[i];
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      const seg = ` Q${r1(cx)},${r1(cy)} ${r1(mx)},${r1(my)}`;
      // never emit a stroke the validator would refuse
      if (d.length + seg.length > DESIGN_LIMITS.maxPathChars - 24) break;
      d += seg;
    }
    const last = pts[pts.length - 1];
    d += ` L${r1(last[0])},${r1(last[1])}`;
  }
  return d.length <= DESIGN_LIMITS.maxPathChars ? d : null;
}

export function DesignStudio({
  design,
  onChange,
}: {
  design: ConceptDesign | null;
  onChange: (design: ConceptDesign | null) => void;
}) {
  const [penDown, setPenDown] = useState(false);
  const [drawing, setDrawing] = useState<[number, number][] | null>(null);
  const [keyboardPoints, setKeyboardPoints] = useState<[number, number][]>([]);
  const [coordinateX, setCoordinateX] = useState<number | "">(48);
  const [coordinateY, setCoordinateY] = useState<number | "">(20);
  const surfaceRef = useRef<SVGSVGElement>(null);

  const set = (patch: Partial<ConceptDesign>) =>
    onChange({ ...(design ?? BLANK), ...patch });

  const toCanvas = (e: React.PointerEvent): [number, number] | null => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const x = ((e.clientX - rect.left) / rect.width) * 96;
    const y = ((e.clientY - rect.top) / rect.height) * 40;
    if (x < -2 || x > 98 || y < -2 || y > 42) return null;
    return [x, y];
  };

  const penStart = (e: React.PointerEvent) => {
    if (
      !penDown ||
      !design ||
      design.strokes.length >= DESIGN_LIMITS.maxStrokes
    )
      return;
    const p = toCanvas(e);
    if (!p) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrawing([p]);
  };
  const penMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const p = toCanvas(e);
    if (!p) return;
    const last = drawing[drawing.length - 1];
    const dist = Math.hypot(p[0] - last[0], p[1] - last[1]);
    if (dist >= 0.8) setDrawing([...drawing, p]);
  };
  const penEnd = () => {
    if (!drawing || !design) return;
    // pointer coords are PLATE space; strokes live in BODY space so they
    // ride with the body when the stance changes — shift by rideHeight
    const d = pointsToPath(
      drawing.map(([x, y]) => [x, y + design.rideHeight] as [number, number]),
    );
    setDrawing(null);
    if (d) set({ strokes: [...design.strokes, { d }] });
  };

  const hasValidCoordinate =
    typeof coordinateX === "number" &&
    typeof coordinateY === "number" &&
    Number.isFinite(coordinateX) &&
    Number.isFinite(coordinateY) &&
    coordinateX >= 0 &&
    coordinateX <= 96 &&
    coordinateY >= 0 &&
    coordinateY <= 40;

  const addKeyboardPoint = () => {
    if (
      !design ||
      !hasValidCoordinate ||
      keyboardPoints.length >= MAX_COORDINATE_POINTS ||
      design.strokes.length >= DESIGN_LIMITS.maxStrokes
    )
      return;
    setKeyboardPoints((points) => [...points, [coordinateX, coordinateY]]);
  };

  const finishKeyboardStroke = () => {
    if (
      !design ||
      keyboardPoints.length < 2 ||
      design.strokes.length >= DESIGN_LIMITS.maxStrokes
    )
      return;
    const d = pointsToPath(
      keyboardPoints.map(
        ([x, y]) => [x, y + design.rideHeight] as [number, number],
      ),
    );
    if (d) {
      set({ strokes: [...design.strokes, { d }] });
      setKeyboardPoints([]);
    }
  };

  const clearSketch = () => {
    setDrawing(null);
    setKeyboardPoints([]);
    if (design) set({ strokes: [] });
  };

  // Keyboard points never share the pointer buffer, so leaving the plate
  // cannot accidentally save an unfinished coordinate stroke.
  const livePreview = pointsToPath(drawing ?? keyboardPoints);
  const skeleton = design?.base ? skeletonById(design.base) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* the plate: preview and (when the pen is up) drawing surface */}
      <div className="sheet overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line bg-well/60 px-4 py-2">
          <span className="ui-label text-xs text-ink-2">Sketch</span>
          <span className="dateline text-xs text-ink-2">
            {design ? designProvenance(design) : "No sketch"}
          </span>
        </div>
        <div className="relative px-4 py-3">
          <div
            aria-hidden
            className="drafting-grid pointer-events-none absolute inset-0 opacity-60"
          />
          <div className="relative mx-auto max-w-[420px]">
            {design ? (
              <DesignPlate design={design} className="h-auto w-full text-ink" />
            ) : (
              /* nothing chosen yet — keep the plate's proportions and invite */
              <div className="flex aspect-[96/40] w-full items-center justify-center">
                <p className="max-w-[36ch] text-center text-sm leading-relaxed text-ink-2">
                  Choose a base or a blank canvas to add a sketch. A design is
                  optional.
                </p>
              </div>
            )}
            {/* the pen surface sits over the plate only while drawing */}
            <svg
              ref={surfaceRef}
              viewBox="0 0 96 40"
              aria-label="Drawing surface — draw strokes onto the plate"
              role="img"
              onPointerDown={penStart}
              onPointerMove={penMove}
              onPointerUp={penEnd}
              onPointerCancel={penEnd}
              onPointerLeave={penEnd}
              className={`absolute inset-0 h-full w-full ${
                penDown && design
                  ? "cursor-crosshair touch-none"
                  : "pointer-events-none"
              }`}
              fill="none"
              stroke="currentColor"
            >
              {livePreview ? (
                <path
                  d={livePreview}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  className="text-accent"
                />
              ) : null}
            </svg>
          </div>
        </div>
      </div>

      {/* 1 · the skeleton library */}
      <div>
        <p className="ui-label mb-2 text-xs">Choose a base</p>
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1.5 scrollbar-thin">
          <button
            type="button"
            aria-pressed={design !== null && design.base === null}
            onClick={() => set({ base: null })}
            className={`flex min-h-11 w-24 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-btn border px-2 py-2 transition-colors ${
              design !== null && design.base === null
                ? "border-accent bg-well text-ink"
                : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
            }`}
          >
            <span className="text-xs font-semibold">Blank canvas</span>
            <span className="dateline text-xs text-ink-2">sketch only</span>
          </button>
          {SKELETONS.map((s) => {
            const selected = design?.base === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => set({ base: s.id })}
                className={`flex w-28 shrink-0 snap-start flex-col items-center gap-1 rounded-btn border px-2 pt-2 pb-1.5 transition-colors ${
                  selected
                    ? "border-accent bg-well text-ink"
                    : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
                }`}
              >
                <ProfileSvg
                  profile={s.profile}
                  className={`h-8 w-auto ${selected ? "text-ink" : "text-ink-3"}`}
                />
                <span className="text-xs font-semibold">{s.name}</span>
                {/* provenance in the picker, not just the fine print */}
                <span className="dateline text-xs text-ink-2">
                  {s.origin === "ai" ? "AI-drafted" : "board"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {design ? (
        <>
          {/* 2 · stance knobs — only a body can be lifted or re-shod */}
          {design.base !== null ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="ui-label flex items-baseline justify-between text-xs">
                  Wheel size
                  <span className="font-mono normal-case tracking-normal text-ink-2">
                    {Math.round(design.wheelScale * 100)}%
                  </span>
                </span>
                <input
                  type="range"
                  min={DESIGN_LIMITS.wheelScale.min}
                  max={DESIGN_LIMITS.wheelScale.max}
                  step={0.05}
                  value={design.wheelScale}
                  onChange={(e) => set({ wheelScale: Number(e.target.value) })}
                  className="min-h-9 w-full accent-[var(--accent)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ui-label flex items-baseline justify-between text-xs">
                  Ride height
                  <span className="font-mono normal-case tracking-normal text-ink-2">
                    {design.rideHeight > 0 ? "+" : ""}
                    {design.rideHeight.toFixed(1)}
                  </span>
                </span>
                <input
                  type="range"
                  min={DESIGN_LIMITS.rideHeight.min}
                  max={DESIGN_LIMITS.rideHeight.max}
                  step={0.5}
                  value={design.rideHeight}
                  onChange={(e) => set({ rideHeight: Number(e.target.value) })}
                  className="min-h-9 w-full accent-[var(--accent)]"
                />
              </label>
            </div>
          ) : null}

          {/* 3 · the pen */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={penDown}
              onClick={() => setPenDown((v) => !v)}
              disabled={
                design.strokes.length >= DESIGN_LIMITS.maxStrokes && !penDown
              }
              className={`btn btn-sm min-h-11 border transition-colors ${
                penDown
                  ? "border-accent bg-well text-ink"
                  : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
              }`}
            >
              {penDown ? "Stop drawing" : "Draw"}
            </button>
            <span className="dateline text-xs text-ink-2">
              {design.strokes.length}/{DESIGN_LIMITS.maxStrokes} strokes
            </span>
            {design.strokes.length > 0 ? (
              <button
                type="button"
                onClick={() => set({ strokes: design.strokes.slice(0, -1) })}
                className="btn btn-ghost btn-sm min-h-11"
              >
                Undo stroke
              </button>
            ) : null}
            {design.strokes.length > 0 ||
            keyboardPoints.length > 0 ||
            drawing ? (
              <button
                type="button"
                onClick={clearSketch}
                className="btn btn-ghost btn-sm min-h-11"
              >
                Clear sketch
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setPenDown(false);
                setDrawing(null);
                setKeyboardPoints([]);
                onChange(null);
              }}
              className="btn btn-ghost btn-sm ml-auto min-h-11 hover:text-danger"
            >
              <CloseIcon size={13} />
              Reset design
            </button>
          </div>

          <details className="rounded-btn border border-line bg-card px-3 py-2.5">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Draw with coordinates
            </summary>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-24 flex-col gap-1 text-xs font-medium text-ink">
                X (0–96)
                <input
                  type="number"
                  min={0}
                  max={96}
                  step={0.1}
                  value={coordinateX}
                  onChange={(event) =>
                    setCoordinateX(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  className="field min-h-11 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex min-w-24 flex-col gap-1 text-xs font-medium text-ink">
                Y (0–40)
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={0.1}
                  value={coordinateY}
                  onChange={(event) =>
                    setCoordinateY(
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  className="field min-h-11 px-2 py-1 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={addKeyboardPoint}
                disabled={
                  !hasValidCoordinate ||
                  keyboardPoints.length >= MAX_COORDINATE_POINTS ||
                  design.strokes.length >= DESIGN_LIMITS.maxStrokes
                }
                className="btn btn-sm min-h-11 border border-control bg-card text-ink hover:bg-well"
              >
                Add point
              </button>
              <button
                type="button"
                onClick={finishKeyboardStroke}
                disabled={
                  keyboardPoints.length < 2 ||
                  design.strokes.length >= DESIGN_LIMITS.maxStrokes
                }
                className="btn btn-sm min-h-11 border border-control bg-card text-ink hover:bg-well"
              >
                Finish stroke
              </button>
              <span aria-live="polite" className="text-xs text-ink-2">
                Draft: {keyboardPoints.length}/{MAX_COORDINATE_POINTS} points
              </span>
              {keyboardPoints.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setKeyboardPoints([])}
                  className="btn btn-ghost btn-sm min-h-11 text-ink-2 hover:text-ink"
                >
                  Clear draft
                </button>
              ) : null}
            </div>
          </details>

          {/* the skeleton's own name keeps the provenance honest at a glance */}
          {skeleton?.origin === "ai" ? (
            <p className="note text-xs">
              This skeleton is <strong>AI-drafted</strong> — it was drawn by an
              AI assistant for the studio library, and sheets that use it say
              so.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default DesignStudio;
