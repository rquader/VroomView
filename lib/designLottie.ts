import { skeletonById, type Profile } from "@/constants/profiles";
import type { ConceptDesign } from "@/types";

/**
 * Synthesizes a Lottie document from a concept design so the author's
 * elevation DRAFTS ITSELF on the concept page (body inks on, glass and
 * seams follow, wheels land, then the author's own pen strokes replay).
 *
 * This is the same tiny authoring kit as scripts/build-animations.mjs,
 * ported for the client: stroke-only shapes whose layers carry `cl`
 * classes (vv-ink, vv-ink-2) that lottie-web writes onto the rendered
 * SVG — globals.css re-inks them with the active theme, exactly like the
 * hero animation. Colors baked here are only fallbacks.
 *
 * Pure data-in/data-out (no DOM), so it runs anywhere; the consuming
 * component decides autoplay/reduced-motion.
 */

type LottieShape = Record<string, unknown>;

const COLORS: Record<string, [number, number, number, number]> = {
  "vv-ink": [0.13, 0.11, 0.09, 1],
  "vv-ink-2": [0.36, 0.34, 0.29, 1],
};

const stat = (k: unknown) => ({ a: 0, k });
const anim = (pairs: [number, number | number[]][]) => ({
  a: 1,
  k: pairs.map(([t, v], idx) => ({
    t,
    s: Array.isArray(v) ? v : [v],
    ...(idx < pairs.length - 1
      ? { i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } }
      : {}),
  })),
});

const strokeItem = (cl: string, width: number): LottieShape => ({
  ty: "st",
  c: stat(COLORS[cl] ?? COLORS["vv-ink"]),
  o: stat(100),
  w: stat(width),
  lc: 2,
  lj: 2,
});

const groupTransform = (): LottieShape => ({
  ty: "tr",
  p: stat([0, 0]),
  a: stat([0, 0]),
  s: stat([100, 100]),
  r: stat(0),
  o: stat(100),
  sk: stat(0),
  sa: stat(0),
});

const ellipse = (cx: number, cy: number, d: number): LottieShape => ({
  ty: "el",
  p: stat([cx, cy]),
  s: stat([d, d]),
});

const trim = (s: unknown, e: unknown): LottieShape => ({
  ty: "tm",
  s,
  e,
  o: stat(0),
  m: 1,
});

/** absolute M/L/Q/Z path → lottie bezier (quadratics promoted to cubics) */
function pathFromSvg(d: string): LottieShape {
  const tokens = d.match(/[MLQZ]|-?[\d.]+/g) ?? [];
  const v: number[][] = [];
  const iT: number[][] = [];
  const oT: number[][] = [];
  let closed = false;
  let k = 0;
  const num = () => parseFloat(tokens[k++] as string);
  while (k < tokens.length) {
    const cmd = tokens[k++];
    if (cmd === "M" || cmd === "L") {
      v.push([num(), num()]);
      iT.push([0, 0]);
      oT.push([0, 0]);
    } else if (cmd === "Q") {
      const qx = num();
      const qy = num();
      const x = num();
      const y = num();
      const p0 = v[v.length - 1];
      oT[oT.length - 1] = [(2 / 3) * (qx - p0[0]), (2 / 3) * (qy - p0[1])];
      v.push([x, y]);
      iT.push([(2 / 3) * (qx - x), (2 / 3) * (qy - y)]);
      oT.push([0, 0]);
    } else if (cmd === "Z") {
      closed = true;
    }
  }
  return { ty: "sh", ks: stat({ c: closed, v, i: iT, o: oT }) };
}

// comp geometry: the 96×40 canvas at 5× → 480×200
const W = 480;
const H = 200;
const S = 5;

function layer({
  name,
  cl,
  items,
  op,
  transform = {},
  opacity,
  ind,
}: {
  name: string;
  cl: string;
  items: LottieShape[];
  op: number;
  transform?: Record<string, unknown>;
  opacity?: unknown;
  ind: number;
}) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    cl,
    sr: 1,
    ks: {
      o: opacity ?? stat(100),
      r: stat(0),
      p: transform.p ?? stat([0, 0, 0]),
      a: transform.a ?? stat([0, 0, 0]),
      s: transform.s ?? stat([100, 100, 100]),
    },
    ao: 0,
    ip: 0,
    op,
    st: 0,
    shapes: [{ ty: "gr", nm: name, it: [...items, groupTransform()] }],
  };
}

/**
 * The draw-on document. Plays once and holds — the sheet stays inked.
 * `blank` designs (no base) draw only the author's strokes over the plate.
 */
export function designToLottie(design: ConceptDesign): object {
  const profile: Profile | null = design.base
    ? (skeletonById(design.base)?.profile ?? null)
    : null;

  const strokesStart = profile ? 96 : 12;
  const strokeFrames = 16;
  const op = strokesStart + Math.max(design.strokes.length, 1) * strokeFrames + 30;

  // the body group rides rideHeight units above the axles
  const bodyTransform = {
    p: stat([W / 2, H / 2 - design.rideHeight * S, 0]),
    a: stat([48, 20, 0]),
    s: stat([S * 100, S * 100, 100]),
  };

  const layers: object[] = [];
  let ind = 0;

  if (profile) {
    layers.push(
      layer({
        ind: ++ind,
        name: "body",
        cl: "vv-ink",
        op,
        transform: bodyTransform,
        items: [
          pathFromSvg(profile.body),
          trim(stat(0), anim([[4, 0], [64, 100]])),
          strokeItem("vv-ink", 1.35),
        ],
      }),
    );
    if (profile.dlo) {
      layers.push(
        layer({
          ind: ++ind,
          name: "dlo",
          cl: "vv-ink-2",
          op,
          transform: bodyTransform,
          opacity: anim([[40, 0], [46, 75]]),
          items: [
            pathFromSvg(profile.dlo),
            trim(stat(0), anim([[44, 0], [72, 100]])),
            strokeItem("vv-ink-2", 1),
          ],
        }),
      );
    }
    layers.push(
      layer({
        ind: ++ind,
        name: "seams",
        cl: "vv-ink-2",
        op,
        transform: bodyTransform,
        opacity: anim([[64, 0], [78, 50]]),
        items: [
          ...[...profile.seams, ...profile.accents].map(pathFromSvg),
          strokeItem("vv-ink-2", 0.95),
        ],
      }),
    );
    profile.wheels.forEach((cx, n) => {
      const t = 58 + n * 8;
      layers.push(
        layer({
          ind: ++ind,
          name: `wheel-${n}`,
          cl: "vv-ink",
          op,
          transform: { p: stat([cx * S, 31.5 * S, 0]) },
          opacity: anim([[t, 0], [t + 4, 100]]),
          items: [
            ellipse(0, 0, profile.wheelR * design.wheelScale * 2 * S),
            ellipse(0, 0, profile.wheelR * design.wheelScale * 1.16 * S),
            ellipse(0, 0, 2 * S),
            strokeItem("vv-ink", 1.35 * S),
          ],
        }),
      );
    });
  }

  // the author's pen replays in filing order
  design.strokes.forEach((stroke, n) => {
    const t = strokesStart + n * strokeFrames;
    layers.push(
      layer({
        ind: ++ind,
        name: `pen-${n}`,
        cl: "vv-ink",
        op,
        transform: bodyTransform,
        opacity: anim([[t, 0], [t + 2, 100]]),
        items: [
          pathFromSvg(stroke.d),
          trim(stat(0), anim([[t, 0], [t + strokeFrames, 100]])),
          strokeItem("vv-ink", 1.15),
        ],
      }),
    );
  });

  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op,
    w: W,
    h: H,
    nm: "vv-design",
    ddd: 0,
    assets: [],
    layers,
  };
}
