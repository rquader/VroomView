// Authors VroomView's Lottie animations from scratch and writes them to
// public/animations/. Run after changing any animation:
//
//   node scripts/build-animations.mjs
//
// WHY A GENERATOR: the asset policy (docs: "13 - Asset and Licensing Policy")
// forbids third-party animation JSON. These four are original works authored
// as code — this script is their source and their provenance record. They are
// stroke-only drawings in the app's drafting language (dial, sheet, stamp,
// broken dimension), and every layer carries a `cl` class (vv-ink-2,
// vv-accent, …) that lottie-web writes onto the rendered SVG so globals.css
// can re-ink them with the active theme's tokens. Colors baked below are
// only fallbacks for that CSS mapping.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/animations",
);

// ── tiny lottie-authoring kit ───────────────────────────────────────────
// Baked fallback colors (theme CSS overrides them at runtime).
const COLORS = {
  "vv-ink": [0.13, 0.11, 0.09, 1],
  "vv-ink-2": [0.36, 0.34, 0.29, 1],
  "vv-ink-3": [0.44, 0.42, 0.36, 1],
  "vv-control": [0.55, 0.53, 0.47, 1],
  "vv-accent": [0.05, 0.36, 0.37, 1],
  "vv-danger": [0.63, 0.16, 0.12, 1],
};

const stat = (k) => ({ a: 0, k });
/** eased keyframes: [[frame, value], ...] — value may be number or array */
const anim = (pairs) => ({
  a: 1,
  k: pairs.map(([t, v], idx) => ({
    t,
    s: Array.isArray(v) ? v : [v],
    ...(idx < pairs.length - 1
      ? { i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } }
      : {}),
  })),
});

const strokeItem = (cl, width, dash) => ({
  ty: "st",
  c: stat(COLORS[cl]),
  o: stat(100),
  w: stat(width),
  lc: 2,
  lj: 2,
  ...(dash
    ? {
        d: [
          { n: "d", nm: "dash", v: stat(dash[0]) },
          { n: "g", nm: "gap", v: stat(dash[1]) },
        ],
      }
    : {}),
});

const groupTransform = () => ({
  ty: "tr",
  p: stat([0, 0]),
  a: stat([0, 0]),
  s: stat([100, 100]),
  r: stat(0),
  o: stat(100),
  sk: stat(0),
  sa: stat(0),
});

/** polyline path shape (open) from absolute points */
const line = (...pts) => ({
  ty: "sh",
  ks: stat({
    c: false,
    v: pts,
    i: pts.map(() => [0, 0]),
    o: pts.map(() => [0, 0]),
  }),
});

const ellipse = (cx, cy, w, h = w) => ({
  ty: "el",
  p: stat([cx, cy]),
  s: stat([w, h]),
});

const roundRect = (cx, cy, w, h, r) => ({
  ty: "rc",
  p: stat([cx, cy]),
  s: stat([w, h]),
  r: stat(r),
});

/** trim-path draw-on; s/e are ({a,k}) props */
const trim = (s, e) => ({ ty: "tm", s, e, o: stat(0), m: 1 });

/**
 * Parse an absolute M/L/Q/Z SVG path into a lottie bezier — quadratics are
 * promoted to cubics (cp1 = P0 + 2/3(Q−P0), cp2 = P1 + 2/3(Q−P1)); tangents
 * are stored relative to their vertex, per the lottie schema.
 */
function pathFromSvg(d) {
  const tokens = d.match(/[MLQZ]|-?[\d.]+/g);
  const v = [],
    iT = [],
    oT = [];
  let closed = false,
    k = 0;
  const num = () => parseFloat(tokens[k++]);
  while (k < tokens.length) {
    const cmd = tokens[k++];
    if (cmd === "M" || cmd === "L") {
      v.push([num(), num()]);
      iT.push([0, 0]);
      oT.push([0, 0]);
    } else if (cmd === "Q") {
      const [qx, qy] = [num(), num()];
      const [x, y] = [num(), num()];
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

let layerIndex = 0;
function layer({ name, cl, items, op, transform = {}, opacity }) {
  return {
    ddd: 0,
    ind: ++layerIndex,
    ty: 4,
    nm: name,
    cl,
    sr: 1,
    ks: {
      o: opacity ?? stat(100),
      r: transform.r ?? stat(0),
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

function comp({ name, w, h, op, layers }) {
  layerIndex = 0;
  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op,
    w,
    h,
    nm: name,
    ddd: 0,
    assets: [],
    layers: layers(),
  };
}

// ── the four animations ─────────────────────────────────────────────────

// loading: the drafting dial — dashed circle, one accent tick sweeping.
const loading = comp({
  name: "vv-loading",
  w: 200,
  h: 200,
  op: 84,
  layers: () => [
    layer({
      name: "tick",
      cl: "vv-accent",
      op: 84,
      transform: {
        p: stat([100, 100, 0]),
        r: anim([
          [0, 0],
          [84, 360],
        ]),
      },
      items: [line([0, -76], [0, -56]), strokeItem("vv-accent", 7)],
    }),
    layer({
      name: "dial",
      cl: "vv-control",
      op: 84,
      transform: { p: stat([100, 100, 0]) },
      items: [ellipse(0, 0, 124), strokeItem("vv-control", 5, [3, 15])],
    }),
  ],
});

// success: the approval stamp — rings land with overshoot, check draws on.
const success = comp({
  name: "vv-success",
  w: 200,
  h: 200,
  op: 60,
  layers: () => [
    layer({
      name: "check",
      cl: "vv-accent",
      op: 60,
      transform: { p: stat([100, 100, 0]), r: stat(-8) },
      items: [
        line([-30, 4], [-9, 24], [32, -18]),
        trim(
          stat(0),
          anim([
            [14, 0],
            [34, 100],
          ]),
        ),
        strokeItem("vv-accent", 9),
      ],
    }),
    layer({
      name: "ring",
      cl: "vv-accent",
      op: 60,
      opacity: anim([
        [0, 0],
        [10, 100],
      ]),
      transform: {
        p: stat([100, 100, 0]),
        a: stat([0, 0, 0]),
        s: anim([
          [0, [60, 60, 100]],
          [12, [106, 106, 100]],
          [20, [100, 100, 100]],
        ]),
        r: stat(-8),
      },
      items: [ellipse(0, 0, 156), strokeItem("vv-accent", 6)],
    }),
    layer({
      name: "ring-inner",
      cl: "vv-accent",
      op: 60,
      opacity: anim([
        [4, 0],
        [16, 55],
      ]),
      transform: {
        p: stat([100, 100, 0]),
        s: anim([
          [4, [60, 60, 100]],
          [18, [104, 104, 100]],
          [26, [100, 100, 100]],
        ]),
        r: stat(-8),
      },
      items: [ellipse(0, 0, 124), strokeItem("vv-accent", 2.5)],
    }),
  ],
});

// error: the broken dimension — rules draw in from each side, the break
// slashes stamp in.
const error = comp({
  name: "vv-error",
  w: 280,
  h: 140,
  op: 66,
  layers: () => [
    layer({
      name: "rule-left",
      cl: "vv-ink-3",
      op: 66,
      items: [
        line([16, 56], [16, 84]),
        line([16, 70], [118, 70]),
        trim(
          stat(0),
          anim([
            [0, 0],
            [16, 100],
          ]),
        ),
        strokeItem("vv-ink-3", 5),
      ],
    }),
    layer({
      name: "rule-right",
      cl: "vv-ink-3",
      op: 66,
      items: [
        line([264, 70], [264, 98]),
        line([264, 84], [162, 84]),
        trim(
          stat(0),
          anim([
            [4, 0],
            [20, 100],
          ]),
        ),
        strokeItem("vv-ink-3", 5),
      ],
    }),
    layer({
      name: "break",
      cl: "vv-danger",
      op: 66,
      opacity: anim([
        [22, 0],
        [26, 100],
      ]),
      transform: {
        p: stat([146, 66, 0]),
        a: stat([146, 66, 0]),
        s: anim([
          [22, [40, 40, 100]],
          [32, [112, 112, 100]],
          [40, [100, 100, 100]],
        ]),
        r: anim([
          [22, -14],
          [40, 0],
        ]),
      },
      items: [
        line([128, 96], [158, 32]),
        line([144, 100], [174, 36]),
        strokeItem("vv-danger", 7),
      ],
    }),
  ],
});

// empty: the blank sheet — the border draws itself, a wagon elevation is
// sketched on (body, then glass, then seams), wheels land, a dimension rule
// underlines it; holds, then fades and redraws (it loops). Geometry mirrors
// components/ui/Silhouette.tsx (canonical source — keep in sync).
const WAGON_BODY =
  "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.5 31,19.6 L33,19.4 L45,10.6 Q48,9.8 52.5,9.7 L83.5,10 Q86.3,10.2 87.7,11.8 L91.5,17.6 Q93,18.4 93,20.5 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L28.8,33.5 Q28.3,25.2 20,25.2 Q11.7,25.2 11.2,33.5 Z";
const WAGON_DLO =
  "M34.7,19 L45.8,11.2 Q48.5,10.5 52.5,10.4 L82.8,10.7 Q85.2,10.9 86.3,12.2 L89.7,17.3 L58,18.2 L34.7,19 Z";
const WAGON_SEAMS = [
  "M58,10.4 L59.5,33",
  "M79,10.6 L80,17.7",
  "M34.9,19.4 L35.9,33",
];
const fadeOut = (from = 100) =>
  anim([
    [0, from],
    [318, from],
    [344, 0],
  ]);
const wagonTransform = {
  p: stat([160, 96, 0]),
  a: stat([48, 22, 0]),
  s: stat([240, 240, 100]),
};

const empty = comp({
  name: "vv-empty",
  w: 320,
  h: 200,
  op: 360,
  layers: () => [
    layer({
      name: "sheet",
      cl: "vv-control",
      op: 360,
      opacity: fadeOut(100),
      transform: { p: stat([160, 100, 0]) },
      items: [
        roundRect(0, 0, 292, 168, 12),
        trim(
          stat(0),
          anim([
            [0, 0],
            [42, 100],
          ]),
        ),
        strokeItem("vv-control", 3.5, [9, 11]),
      ],
    }),
    layer({
      name: "body",
      cl: "vv-ink-2",
      op: 360,
      opacity: fadeOut(100),
      transform: wagonTransform,
      items: [
        pathFromSvg(WAGON_BODY),
        trim(
          stat(0),
          anim([
            [46, 0],
            [116, 100],
          ]),
        ),
        strokeItem("vv-ink-2", 1.6),
      ],
    }),
    layer({
      name: "dlo",
      cl: "vv-ink-2",
      op: 360,
      opacity: anim([
        [100, 0],
        [106, 75],
        [318, 75],
        [344, 0],
      ]),
      transform: wagonTransform,
      items: [
        pathFromSvg(WAGON_DLO),
        trim(
          stat(0),
          anim([
            [104, 0],
            [136, 100],
          ]),
        ),
        strokeItem("vv-ink-2", 1.15),
      ],
    }),
    layer({
      name: "seams",
      cl: "vv-ink-2",
      op: 360,
      opacity: anim([
        [132, 0],
        [146, 50],
        [318, 50],
        [344, 0],
      ]),
      transform: wagonTransform,
      items: [...WAGON_SEAMS.map(pathFromSvg), strokeItem("vv-ink-2", 1.1)],
    }),
    ...[20, 75].map((cx, n) =>
      layer({
        name: `wheel-${n}`,
        cl: "vv-ink-2",
        op: 360,
        opacity: fadeOut(100),
        transform: {
          p: stat([160 + (cx - 48) * 2.4, 96 + (31.5 - 22) * 2.4, 0]),
          s: anim([
            [118 + n * 8, [0, 0, 100]],
            [130 + n * 8, [112, 112, 100]],
            [138 + n * 8, [100, 100, 100]],
          ]),
        },
        items: [
          ellipse(0, 0, 26.4),
          ellipse(0, 0, 15.3),
          ellipse(0, 0, 3),
          strokeItem("vv-ink-2", 1.6 * 2.4),
        ],
      }),
    ),
    layer({
      name: "dim",
      cl: "vv-accent",
      op: 360,
      opacity: fadeOut(100),
      items: [
        line([76, 166], [76, 178]),
        line([76, 172], [244, 172]),
        line([244, 166], [244, 178]),
        trim(
          stat(0),
          anim([
            [150, 0],
            [176, 100],
          ]),
        ),
        strokeItem("vv-accent", 3),
      ],
    }),
  ],
});

// hero: "elevation studies" — three vehicles draft themselves in sequence on
// a registered plate, each measured by its own dimension rule. The profiles
// mirror components/ui/Silhouette.tsx (canonical source — keep in sync).
const PROFILES = {
  sedan: {
    body: "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.4 32.5,19.5 L34.5,19.3 L47,10.4 Q50,9.7 53,9.6 L66,9.6 Q70.5,9.8 73.5,11.2 L82,16.4 Q86.5,17 90.5,17.6 Q93,18 93,20 L93,27.5 Q93,31.5 90.5,33.5 L84.3,33.5 Q83.8,25.2 75.5,25.2 Q67.2,25.2 66.7,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M36.2,18.9 L47.6,10.9 Q50.2,10.5 53,10.4 L65.5,10.4 Q69.5,10.6 72.3,11.9 L80,16.2 L36.2,18.9 Z",
    seams: [
      "M58.5,10.4 L60,33",
      "M36.4,19.3 L37.4,33",
      "M4,22.9 L10,22.3",
      "M89,18.4 L92.6,19.2",
    ],
    wheels: [20.5, 75.5],
    wheelR: 5.5,
    span: [3, 93],
  },
  truck: {
    body: "M5,32 L4,30 Q3.5,29 3.5,27 L3.5,19.5 Q3.5,17.4 6.5,17.2 L24.5,16.3 Q26.5,16.1 27.5,15.4 L33.5,7.3 Q34.8,6 37.5,6 L59.5,6 Q62.2,6.2 62.7,8.5 L63.2,12.5 L91,12.5 Q93,12.7 93,14.7 L93,27 Q93,30.5 91,32 L84.5,32 Q84,25 76,25 Q68,25 67.5,32 L26.5,32 Q26,24.6 18,24.6 Q10,24.6 9.5,32 Z",
    dlo: "M29.8,15.2 L34.3,7.7 Q35.3,7 37.5,7 L58.7,7 Q61.2,7.2 61.6,9 L62,14.6 L44,14.9 L29.8,15.2 Z",
    seams: [
      "M45.5,7 L46,15 L46.5,31.6",
      "M63.5,12.7 L63.8,31.8",
      "M91.5,13 L91.8,31.5",
      "M64,14.5 L92,14.5",
    ],
    wheels: [18, 75.5],
    wheelR: 6.2,
    span: [3.5, 93],
  },
  minivan: {
    body: "M5.5,33.5 L4,31.5 Q3,30.5 3,28 L3,25.5 Q3,23.2 6.5,22.9 L9,22.7 Q14,22.1 19.5,21.4 L22.5,20.9 L37.5,7.6 Q39.5,6.1 42.5,6 L83,6 Q86.5,6.1 88.5,7.6 L91,10.5 Q92.8,12.7 93,17 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M25.5,19.6 L38.5,8.2 Q40.3,7 42.8,7 L82.5,7 Q85.5,7.1 87,8.6 L89.5,11.5 Q90.8,13.2 91,16 L91.2,18 L64,18.9 L25.5,19.6 Z",
    seams: [
      "M47.5,7 L48.2,19.2",
      "M67.5,7 L68.2,18.8",
      "M48.2,19.4 L48.8,33",
      "M68.2,19 L68.8,33",
      "M69.5,23.8 L88.5,23.3",
    ],
    wheels: [20.5, 75],
    wheelR: 5.5,
    span: [3, 93],
  },
};

const HERO = { w: 420, h: 250, scale: 3.4, cx: 210, cy: 118, seg: 172 };
const hx = (x) => HERO.cx + (x - 48) * HERO.scale;
const hy = (y) => HERO.cy + (y - 22) * HERO.scale;

/** one vehicle's drafting sequence, windowed via layer in/out points */
function heroSegment(profile, t) {
  const { seg } = HERO;
  const fade = (peak) =>
    anim([
      [t, 0],
      [t + 8, peak],
      [t + seg - 22, peak],
      [t + seg - 4, 0],
    ]);
  const carTransform = {
    p: stat([HERO.cx, HERO.cy, 0]),
    a: stat([48, 22, 0]),
    s: stat([HERO.scale * 100, HERO.scale * 100, 100]),
  };
  return [
    layer({
      name: `body-${t}`,
      cl: "vv-ink-2",
      op: t + seg,
      opacity: fade(100),
      transform: carTransform,
      items: [
        pathFromSvg(profile.body),
        trim(
          stat(0),
          anim([
            [t + 4, 0],
            [t + 74, 100],
          ]),
        ),
        strokeItem("vv-ink-2", 1.55),
      ],
    }),
    // the glass band inks itself once the body is mostly there
    layer({
      name: `dlo-${t}`,
      cl: "vv-ink-2",
      op: t + seg,
      opacity: anim([
        [t + 46, 0],
        [t + 52, 75],
        [t + seg - 22, 75],
        [t + seg - 4, 0],
      ]),
      transform: carTransform,
      items: [
        pathFromSvg(profile.dlo),
        trim(
          stat(0),
          anim([
            [t + 50, 0],
            [t + 82, 100],
          ]),
        ),
        strokeItem("vv-ink-2", 1.12),
      ],
    }),
    layer({
      name: `seams-${t}`,
      cl: "vv-ink-2",
      op: t + seg,
      opacity: anim([
        [t + 74, 0],
        [t + 88, 50],
        [t + seg - 22, 50],
        [t + seg - 4, 0],
      ]),
      transform: carTransform,
      items: [...profile.seams.map(pathFromSvg), strokeItem("vv-ink-2", 1.05)],
    }),
    ...profile.wheels.map((cx, n) =>
      layer({
        name: `wheel-${t}-${n}`,
        cl: "vv-ink-2",
        op: t + seg,
        opacity: anim([
          [t + 70 + n * 8, 0],
          [t + 74 + n * 8, 100],
          [t + seg - 22, 100],
          [t + seg - 4, 0],
        ]),
        transform: {
          p: stat([hx(cx), hy(31.5), 0]),
          s: anim([
            [t + 70 + n * 8, [0, 0, 100]],
            [t + 82 + n * 8, [112, 112, 100]],
            [t + 90 + n * 8, [100, 100, 100]],
          ]),
        },
        items: [
          ellipse(0, 0, profile.wheelR * 2 * HERO.scale),
          ellipse(0, 0, profile.wheelR * 1.16 * HERO.scale),
          ellipse(0, 0, 2.2 * HERO.scale),
          strokeItem("vv-ink-2", 1.55 * HERO.scale),
        ],
      }),
    ),
    layer({
      name: `dim-${t}`,
      cl: "vv-accent",
      op: t + seg,
      opacity: anim([
        [t + 88, 0],
        [t + 92, 100],
        [t + seg - 22, 100],
        [t + seg - 4, 0],
      ]),
      items: [
        line([hx(profile.span[0]), 216], [hx(profile.span[0]), 230]),
        line([hx(profile.span[0]), 223], [hx(profile.span[1]), 223]),
        line([hx(profile.span[1]), 216], [hx(profile.span[1]), 230]),
        trim(
          stat(0),
          anim([
            [t + 88, 0],
            [t + 116, 100],
          ]),
        ),
        strokeItem("vv-accent", 2.6),
      ],
    }),
  ];
}

/** small registration crosshair at (x, y) */
const regMark = (x, y) => [
  line([x - 7, y], [x + 7, y]),
  line([x, y - 7], [x, y + 7]),
];

const hero = comp({
  name: "vv-hero",
  w: HERO.w,
  h: HERO.h,
  op: HERO.seg * 3,
  layers: () => [
    ...Object.values(PROFILES).flatMap((p, i) => heroSegment(p, i * HERO.seg)),
    layer({
      name: "reg-marks",
      cl: "vv-ink-3",
      op: HERO.seg * 3,
      opacity: anim([
        [0, 0],
        [14, 60],
      ]),
      items: [
        ...regMark(22, 22),
        ...regMark(398, 22),
        strokeItem("vv-ink-3", 1.5),
      ],
    }),
    layer({
      name: "ground",
      cl: "vv-control",
      op: HERO.seg * 3,
      opacity: anim([
        [0, 0],
        [16, 100],
      ]),
      items: [
        line([34, hy(31.5) + 22], [386, hy(31.5) + 22]),
        strokeItem("vv-control", 2, [2, 10]),
      ],
    }),
  ],
});

// ── write + sanity-check ────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });
for (const [file, data] of Object.entries({
  loading,
  success,
  error,
  empty,
  hero,
})) {
  // structural sanity: every layer needs full ks + at least one shape group
  for (const l of data.layers) {
    for (const key of ["o", "r", "p", "a", "s"]) {
      if (!l.ks[key]) throw new Error(`${file}/${l.nm}: missing ks.${key}`);
    }
    if (!l.shapes?.length) throw new Error(`${file}/${l.nm}: no shapes`);
  }
  const path = join(OUT, `${file}.json`);
  writeFileSync(path, JSON.stringify(data));
  console.log(
    `wrote ${path} (${JSON.stringify(data).length} bytes, ${data.layers.length} layers)`,
  );
}
