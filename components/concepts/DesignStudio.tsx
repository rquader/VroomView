"use client";

import { useRef, useState } from "react";
import { SKELETONS, skeletonById } from "@/constants/profiles";
import { DESIGN_LIMITS, designProvenance } from "@/lib/design";
import { ProfileSvg } from "@/components/ui/Silhouette";
import { DesignPlate } from "./DesignPlate";
import { CloseIcon } from "@/components/ui/Icon";
import type { ConceptDesign } from "@/types";

/**
 * The design bay — where a proposal gets an elevation of its own. Three
 * moves, all optional and all composable:
 *
 *   1. pick a SKELETON: the six board profiles, or the AI-drafted variants
 *      (labelled as such here AND on the published sheet — provenance is
 *      the deal), or a blank plate;
 *   2. set the STANCE: wheel size and ride height, the two knobs that can't
 *      produce a broken drawing;
 *   3. take the PEN: pointer strokes over the plate, smoothed to quadratics
 *      in the same M/L/Q grammar everything else speaks.
 *
 * Controlled component: the drafting table owns the design state and files
 * it with the proposal. Everything here stays inside the validation bounds
 * (lib/design.ts) by construction, so what previews is what validates.
 */

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
  const surfaceRef = useRef<SVGSVGElement>(null);

  if (!design) {
    return (
      <button
        type="button"
        onClick={() => onChange({ ...BLANK, base: "sedan" })}
        className="btn btn-secondary btn-sm min-h-10 self-start"
      >
        Open the design bay — draft its elevation
      </button>
    );
  }

  const set = (patch: Partial<ConceptDesign>) =>
    onChange({ ...design, ...patch });

  const toCanvas = (e: React.PointerEvent): [number, number] | null => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const x = ((e.clientX - rect.left) / rect.width) * 96;
    const y = ((e.clientY - rect.top) / rect.height) * 40;
    if (x < -2 || x > 98 || y < -2 || y > 42) return null;
    return [x, y];
  };

  const penStart = (e: React.PointerEvent) => {
    if (!penDown || design.strokes.length >= DESIGN_LIMITS.maxStrokes) return;
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
    if (!drawing) return;
    const d = pointsToPath(drawing);
    setDrawing(null);
    if (d) set({ strokes: [...design.strokes, { d }] });
  };

  const livePreview = drawing ? pointsToPath(drawing) : null;
  const skeleton = design.base ? skeletonById(design.base) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* the plate: preview and (when the pen is up) drawing surface */}
      <div className="sheet overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line bg-well/60 px-4 py-2">
          <span className="overline text-[10px] text-ink-2">Design bay</span>
          <span className="dateline text-[10px] text-ink-2">
            {designProvenance(design)}
          </span>
        </div>
        <div className="relative px-4 py-3">
          <div
            aria-hidden
            className="drafting-grid pointer-events-none absolute inset-0 opacity-60"
          />
          <div className="relative mx-auto max-w-[420px]">
            <DesignPlate design={design} className="h-auto w-full text-ink" />
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
                penDown ? "cursor-crosshair touch-none" : "pointer-events-none"
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
        <p className="overline mb-2 text-[10px]">Start from a skeleton</p>
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1.5 scrollbar-thin">
          <button
            type="button"
            aria-pressed={design.base === null}
            onClick={() => set({ base: null })}
            className={`flex min-h-11 w-24 shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-btn border px-2 py-2 transition-colors ${
              design.base === null
                ? "border-accent bg-accent/10 text-accent"
                : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
            }`}
          >
            <span className="text-[11px] font-semibold">Blank plate</span>
            <span className="dateline text-[9px]">pen only</span>
          </button>
          {SKELETONS.map((s) => {
            const selected = design.base === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                onClick={() => set({ base: s.id })}
                className={`flex w-28 shrink-0 snap-start flex-col items-center gap-1 rounded-btn border px-2 pt-2 pb-1.5 transition-colors ${
                  selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
                }`}
              >
                <ProfileSvg
                  profile={s.profile}
                  className={`h-8 w-auto ${selected ? "text-accent" : "text-ink-3"}`}
                />
                <span className="text-[11px] font-semibold">{s.name}</span>
                {/* provenance in the picker, not just the fine print */}
                <span className="dateline text-[9px]">
                  {s.origin === "ai" ? "AI-drafted" : "board"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 · stance knobs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="overline flex items-baseline justify-between text-[10px]">
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
          <span className="overline flex items-baseline justify-between text-[10px]">
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

      {/* 3 · the pen */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={penDown}
          onClick={() => setPenDown((v) => !v)}
          disabled={design.strokes.length >= DESIGN_LIMITS.maxStrokes && !penDown}
          className={`btn btn-sm min-h-9 border transition-colors ${
            penDown
              ? "border-accent bg-accent/10 text-accent"
              : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
          }`}
        >
          {penDown ? "Pen down — draw on the plate" : "Take the pen"}
        </button>
        <span className="dateline">
          {design.strokes.length}/{DESIGN_LIMITS.maxStrokes} strokes
        </span>
        {design.strokes.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => set({ strokes: design.strokes.slice(0, -1) })}
              className="btn btn-ghost btn-sm min-h-9"
            >
              Undo stroke
            </button>
            <button
              type="button"
              onClick={() => set({ strokes: [] })}
              className="btn btn-ghost btn-sm min-h-9"
            >
              Clear pen
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setPenDown(false);
            setDrawing(null);
            onChange(null);
          }}
          className="btn btn-ghost btn-sm ml-auto min-h-9 hover:text-danger"
        >
          <CloseIcon size={13} />
          Remove design sheet
        </button>
      </div>

      {/* the skeleton's own name keeps the provenance honest at a glance */}
      {skeleton?.origin === "ai" ? (
        <p className="note text-xs">
          This skeleton is <strong>AI-drafted</strong> — it was drawn by an AI
          assistant for the studio library, and sheets that use it say so.
        </p>
      ) : null}
    </div>
  );
}

export default DesignStudio;
