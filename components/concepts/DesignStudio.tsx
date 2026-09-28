"use client";

import { useRef, useState } from "react";
import { SKELETONS, skeletonById } from "@/constants/profiles";
import {
  DESIGN_LIMITS,
  DESIGN_PEN_COLORS,
  designPenValue,
  designProvenance,
  designViewport,
  pointsToPath,
} from "@/lib/design";
import { ProfileSvg } from "@/components/ui/Silhouette";
import { DesignPlate } from "./DesignPlate";
import { CloseIcon } from "@/components/ui/Icon";
import type { ConceptDesign, DesignPenColor } from "@/types";

/** Optional sketch editor; strokes are stored in body space so they follow stance changes. */

// Sixteen points fit the stored path limit without dropping intermediate points.
const MAX_COORDINATE_POINTS = 16;

const BLANK: ConceptDesign = {
  v: 1,
  kind: "studio",
  base: null,
  wheelScale: 1,
  rideHeight: 0,
  viewport: "roomy",
  strokes: [],
};

export function DesignStudio({
  design,
  onChange,
}: {
  design: ConceptDesign | null;
  onChange: (design: ConceptDesign | null) => void;
}) {
  const [penDown, setPenDown] = useState(true);
  const [penColor, setPenColor] = useState<DesignPenColor>("ink");
  const [coordinateOpen, setCoordinateOpen] = useState(false);
  const [drawing, setDrawing] = useState<[number, number][] | null>(null);
  const [keyboardPoints, setKeyboardPoints] = useState<[number, number][]>([]);
  const [coordinateX, setCoordinateX] = useState<number | "">(48);
  const [coordinateY, setCoordinateY] = useState<number | "">(20);
  const surfaceRef = useRef<SVGSVGElement>(null);
  const drawingRef = useRef<[number, number][] | null>(null);
  const pointerRef = useRef<number | null>(null);
  const viewport = designViewport(design ?? BLANK);

  const set = (patch: Partial<ConceptDesign>) =>
    onChange({ ...(design ?? BLANK), ...patch });

  const toCanvas = (e: {
    clientX: number;
    clientY: number;
  }): [number, number] | null => {
    const svg = surfaceRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const { x, y } = point.matrixTransform(matrix.inverse());
    if (
      x < viewport.x ||
      x > viewport.x + viewport.width ||
      y < viewport.y ||
      y > viewport.y + viewport.height
    )
      return null;
    return [x, y];
  };

  const cancelDrawing = () => {
    drawingRef.current = null;
    pointerRef.current = null;
    setDrawing(null);
  };

  const penStart = (e: React.PointerEvent) => {
    if (
      !penDown ||
      e.button !== 0 ||
      pointerRef.current !== null ||
      !design ||
      design.strokes.length >= DESIGN_LIMITS.maxStrokes
    )
      return;
    const p = toCanvas(e);
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerRef.current = e.pointerId;
    drawingRef.current = [p];
    setDrawing([p]);
  };
  const penMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || pointerRef.current !== e.pointerId) return;
    // Coalesced samples recover bends between browser dispatches; refs avoid
    // losing samples to React's batched rendering while a gesture is active.
    const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? [];
    const samples = coalesced.length ? coalesced : [e];
    let points = drawingRef.current;
    for (const sample of samples) {
      const p = toCanvas(sample);
      if (!p) continue;
      const last = points[points.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.15) continue;
      if (points.length >= DESIGN_LIMITS.maxSampledPoints) {
        points = points.filter(
          (_, i) => i % 2 === 0 || i === points.length - 1,
        );
      }
      points = [...points, p];
    }
    drawingRef.current = points;
    setDrawing(points);
  };
  const penEnd = (e: React.PointerEvent) => {
    if (!drawingRef.current || !design || pointerRef.current !== e.pointerId)
      return;
    const finalPoint = toCanvas(e);
    const points = finalPoint
      ? [...drawingRef.current, finalPoint]
      : drawingRef.current;
    // pointer coords are PLATE space; strokes live in BODY space so they
    // ride with the body when the stance changes — shift by rideHeight
    const d = pointsToPath(
      points.map(([x, y]) => [x, y + design.rideHeight] as [number, number]),
    );
    cancelDrawing();
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (d) set({ strokes: [...design.strokes, { d, color: penColor }] });
  };

  const hasValidCoordinate =
    typeof coordinateX === "number" &&
    typeof coordinateY === "number" &&
    Number.isFinite(coordinateX) &&
    Number.isFinite(coordinateY) &&
    coordinateX >= viewport.x &&
    coordinateX <= viewport.x + viewport.width &&
    coordinateY >= viewport.y &&
    coordinateY <= viewport.y + viewport.height;

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
      set({ strokes: [...design.strokes, { d, color: penColor }] });
      setKeyboardPoints([]);
    }
  };

  const clearSketch = () => {
    cancelDrawing();
    setKeyboardPoints([]);
    if (design) set({ strokes: [] });
  };

  // Keyboard points never share the pointer buffer, so leaving the plate
  // cannot accidentally save an unfinished coordinate stroke.
  const livePreview = pointsToPath(drawing ?? keyboardPoints);
  const skeleton = design?.base ? skeletonById(design.base) : null;

  return (
    <div className="flex flex-col gap-4">
      {design ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={penDown}
            onClick={() => {
              cancelDrawing();
              setPenDown((v) => !v);
            }}
            disabled={
              design.strokes.length >= DESIGN_LIMITS.maxStrokes && !penDown
            }
            className={`btn btn-sm min-h-11 border ${penDown ? "border-accent bg-well text-ink" : "border-control bg-card text-ink-2 hover:bg-well"}`}
          >
            {penDown ? "Pen on" : "Draw"}
          </button>
          <div
            role="group"
            aria-label="Pen color"
            className="flex items-center gap-1 text-ink"
          >
            {DESIGN_PEN_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-label={`${color.name} pen`}
                title={`${color.name} pen`}
                aria-pressed={penColor === color.id}
                onClick={() => {
                  setPenColor(color.id);
                  setPenDown(true);
                }}
                className={`flex min-h-11 min-w-11 items-center justify-center rounded-btn border ${penColor === color.id ? "border-accent bg-well" : "border-transparent hover:bg-well"}`}
              >
                <span
                  aria-hidden
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: color.value }}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={design.strokes.length === 0}
            onClick={() => set({ strokes: design.strokes.slice(0, -1) })}
            className="btn btn-ghost btn-sm ml-auto min-h-11"
          >
            Undo
          </button>
          {design.strokes.length > 0 || keyboardPoints.length > 0 || drawing ? (
            <button
              type="button"
              onClick={clearSketch}
              className="btn btn-ghost btn-sm min-h-11"
            >
              Clear strokes
            </button>
          ) : null}
        </div>
      ) : null}
      {/* the plate: preview and (when the pen is up) drawing surface */}
      <div className="sheet overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line bg-well/60 px-4 py-2">
          <span className="ui-label text-xs text-ink-2">Sketch</span>
          <span className="dateline text-xs text-ink-2">
            {design
              ? `${design.strokes.length}/${DESIGN_LIMITS.maxStrokes} strokes`
              : "Optional"}
          </span>
        </div>
        <div className="relative px-2 py-2 sm:px-4 sm:py-3">
          <div
            aria-hidden
            className="drafting-grid pointer-events-none absolute inset-0 opacity-60"
          />
          <div className="relative mx-auto w-full">
            {design ? (
              <DesignPlate design={design} className="h-auto w-full text-ink" />
            ) : (
              /* nothing chosen yet — keep the plate's proportions and invite */
              <div className="flex aspect-[128/72] w-full items-center justify-center">
                <p className="max-w-[36ch] text-center text-sm leading-relaxed text-ink-2">
                  Choose a car below, or start with a blank canvas.
                </p>
              </div>
            )}
            {/* the pen surface sits over the plate only while drawing */}
            <svg
              ref={surfaceRef}
              viewBox={viewport.viewBox}
              aria-label="Drawing surface. Drag to sketch; keyboard drawing is available below."
              role="img"
              onPointerDown={penStart}
              onPointerMove={penMove}
              onPointerUp={penEnd}
              onPointerCancel={cancelDrawing}
              onLostPointerCapture={cancelDrawing}
              className={`absolute inset-0 h-full w-full ${
                penDown && design
                  ? "cursor-crosshair touch-none"
                  : "pointer-events-none"
              } text-ink`}
              fill="none"
              stroke="currentColor"
            >
              {livePreview ? (
                <path
                  d={livePreview}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  stroke={designPenValue(penColor)}
                />
              ) : null}
              {keyboardPoints.map(([x, y], i) => (
                <g key={i} stroke={designPenValue(penColor)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={0.8}
                    fill="var(--card)"
                    strokeWidth={0.4}
                  />
                  <text
                    x={x + 1.3}
                    y={y - 1.3}
                    fill="currentColor"
                    stroke="none"
                    fontSize={2.5}
                  >
                    {i + 1}
                  </text>
                </g>
              ))}
              {coordinateOpen && hasValidCoordinate ? (
                <g
                  stroke={designPenValue(penColor)}
                  strokeWidth={0.35}
                  opacity={0.8}
                >
                  <path
                    d={`M${coordinateX - 1.5},${coordinateY} L${coordinateX + 1.5},${coordinateY} M${coordinateX},${coordinateY - 1.5} L${coordinateX},${coordinateY + 1.5}`}
                  />
                </g>
              ) : null}
            </svg>
          </div>
        </div>
      </div>
      {design ? (
        <p className="text-xs leading-relaxed text-ink-2">
          {design.strokes.length >= DESIGN_LIMITS.maxStrokes
            ? "Stroke limit reached. Undo or clear strokes to keep drawing."
            : penDown
              ? "Drag on the canvas to sketch. Choose a color for your next stroke."
              : "Select Draw to sketch on the canvas."}
        </p>
      ) : null}

      {/* 1 · the skeleton library */}
      <details
        open={design === null}
        className="rounded-btn border border-line bg-card px-3 py-2.5"
      >
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          {design
            ? `Base: ${skeleton?.name ?? "Blank canvas"}`
            : "Choose a base"}
        </summary>
        <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-1.5 scrollbar-thin">
          <button
            type="button"
            aria-pressed={design !== null && design.base === null}
            onClick={() => {
              cancelDrawing();
              setKeyboardPoints([]);
              set({
                base: null,
                wheelScale: 1,
                rideHeight: 0,
                viewport: "roomy",
              });
            }}
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
                onClick={() => {
                  cancelDrawing();
                  setKeyboardPoints([]);
                  set({ base: s.id, viewport: "roomy" });
                }}
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
      </details>

      {design ? (
        <>
          {/* 2 · stance knobs — only a body can be lifted or re-shod */}
          {design.base !== null ? (
            <details className="rounded-btn border border-line bg-card px-3 py-2.5">
              <summary className="cursor-pointer text-sm font-semibold text-ink">
                Adjust wheels and ride height
              </summary>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                    onChange={(e) =>
                      set({ wheelScale: Number(e.target.value) })
                    }
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
                    onChange={(e) =>
                      set({ rideHeight: Number(e.target.value) })
                    }
                    className="min-h-9 w-full accent-[var(--accent)]"
                  />
                </label>
              </div>
            </details>
          ) : null}

          <details
            onToggle={(e) => setCoordinateOpen(e.currentTarget.open)}
            className="rounded-btn border border-line bg-card px-3 py-2.5"
          >
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Keyboard drawing
            </summary>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-2">
              Add points by position instead of dragging. X moves left to right;
              Y moves top to bottom. The crosshair previews your next point, and
              numbered dots show the points added. Add at least two, then finish
              the stroke to join them with a smooth line.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-24 flex-col gap-1 text-xs font-medium text-ink">
                X ({viewport.x}–{viewport.x + viewport.width})
                <input
                  type="number"
                  min={viewport.x}
                  max={viewport.x + viewport.width}
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
                Y ({viewport.y}–{viewport.y + viewport.height})
                <input
                  type="number"
                  min={viewport.y}
                  max={viewport.y + viewport.height}
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

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-ink-2">
              {designProvenance(design)}
            </span>
            <button
              type="button"
              onClick={() => {
                cancelDrawing();
                setPenDown(true);
                setKeyboardPoints([]);
                setPenColor("ink");
                setCoordinateOpen(false);
                onChange(null);
              }}
              className="btn btn-ghost btn-sm min-h-11 hover:text-danger"
            >
              <CloseIcon size={13} />
              Reset design
            </button>
          </div>

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
