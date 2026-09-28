import assert from "node:assert/strict";
import test from "node:test";
import * as designLib from "../lib/design";
import { designToLottie } from "../lib/designLottie";
import type { ConceptDesign } from "../types";

const legacy: ConceptDesign = {
  v: 1,
  kind: "studio",
  base: "sedan",
  wheelScale: 1,
  rideHeight: 0,
  strokes: [{ d: "M1,2 L3,4" }],
};

test("old designs retain their document shape and animation framing", () => {
  assert.deepEqual(designLib.parseDesign(legacy), legacy);
  const animation = designToLottie(legacy) as { w: number; h: number };
  assert.equal(animation.w, 480);
  assert.equal(animation.h, 200);
});

test("roomy designs and named pen colors survive strict parsing", () => {
  const raw = {
    ...legacy,
    viewport: "roomy",
    strokes: [{ d: "M-10,-8 L110,50", color: "blue", ignored: "drop" }],
  };
  assert.deepEqual(designLib.parseDesign(raw), {
    ...raw,
    strokes: [{ d: "M-10,-8 L110,50", color: "blue" }],
  });
  assert.equal(designLib.parseDesign({ ...raw, viewport: "huge" }), null);
  assert.equal(
    designLib.parseDesign({
      ...raw,
      strokes: [{ d: "M1,2 L3,4", color: "url(evil)" }],
    }),
    null,
  );
});

test("roomy animation offsets the car and preserves colored pen ink", () => {
  const design = {
    ...legacy,
    viewport: "roomy",
    strokes: [{ d: "M1,2 L3,4", color: "blue" }],
  } as ConceptDesign;
  const animation = designToLottie(design) as {
    w: number;
    h: number;
    layers: {
      nm: string;
      cl: string;
      ks: { p: { k: number[] } };
      shapes: { it: { ty: string; c?: { k: number[] } }[] }[];
    }[];
  };
  assert.equal(animation.w, 640);
  assert.equal(animation.h, 360);
  const pen = animation.layers.find((layer) => layer.nm === "pen-0")!;
  assert.equal(pen.cl, "vv-pen");
  assert.deepEqual(pen.ks.p.k, [320, 180, 0]);
  assert.notDeepEqual(
    pen.shapes[0].it.find((item) => item.ty === "st")!.c!.k,
    [0.13, 0.11, 0.09, 1],
  );
});

test("long strokes preserve bends near the end instead of jumping to the endpoint", () => {
  const api = designLib as unknown as {
    pointsToPath: (points: [number, number][]) => string | null;
  };
  assert.equal(typeof api.pointsToPath, "function");
  const points: [number, number][] = Array.from({ length: 1500 }, (_, i) => {
    const x = (i / 1499) * 96;
    return [x, 20 + 12 * Math.sin((x / 96) * Math.PI * 6)];
  });
  const path = api.pointsToPath(points)!;
  assert.ok(path.length <= designLib.DESIGN_LIMITS.maxPathChars);
  assert.equal(designLib.canonicalStrokePath(path), path);
  assert.ok(path.endsWith("L96,20"));
  const pairs = Array.from(path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g), (match) => [
    Number(match[1]),
    Number(match[2]),
  ]);
  assert.ok(
    pairs.some(([x, y]) => x > 65 && y > 28),
    "keeps late crest",
  );
  assert.ok(
    pairs.some(([x, y]) => x > 80 && y < 12),
    "keeps late trough",
  );
});

test("stroke generation refuses nonfinite coordinates and parsing retains size bounds", () => {
  const api = designLib as unknown as {
    pointsToPath: (points: [number, number][]) => string | null;
  };
  assert.equal(typeof api.pointsToPath, "function");
  assert.equal(
    api.pointsToPath([
      [0, 0],
      [NaN, 2],
    ]),
    null,
  );
  assert.equal(
    designLib.parseDesign({
      ...legacy,
      strokes: [{ d: `M0,0 ${"L1,1 ".repeat(110)}` }],
    }),
    null,
  );
  assert.equal(
    designLib.parseDesign({
      ...legacy,
      strokes: Array.from({ length: 25 }, () => ({ d: "M1,2 L3,4" })),
    }),
    null,
  );
});

test("every allowed color works and blank designs retain normalized geometry", () => {
  for (const color of designLib.DESIGN_PEN_COLORS) {
    const design = designLib.parseDesign({
      ...legacy,
      base: null,
      viewport: "roomy",
      wheelScale: 1.3,
      rideHeight: 4,
      strokes: [{ d: "M1,2 L3,4", color: color.id }],
    })!;
    assert.equal(design.wheelScale, 1);
    assert.equal(design.rideHeight, 0);
    assert.equal(design.strokes[0].color, color.id);
    assert.equal(design.viewport, "roomy");
  }
  assert.equal(
    designLib.parseDesign({ ...legacy, base: null, strokes: [] }),
    null,
  );
});

test("oversampled strokes and a full palette sketch remain within storage bounds", () => {
  const points: [number, number][] = Array.from({ length: 10000 }, (_, i) => [
    i * 0.0096,
    20 + 10 * Math.sin(i / 500),
  ]);
  const path = designLib.pointsToPath(points)!;
  assert.ok(path.length <= designLib.DESIGN_LIMITS.maxPathChars);
  assert.equal(designLib.canonicalStrokePath(path), path);
  const design = designLib.parseDesign({
    ...legacy,
    viewport: "roomy",
    strokes: Array.from({ length: designLib.DESIGN_LIMITS.maxStrokes }, () => ({
      d: path,
      color: "green",
    })),
  })!;
  assert.ok(design);
  assert.ok(
    JSON.stringify(design).length <= designLib.DESIGN_LIMITS.maxJsonChars,
  );
});
