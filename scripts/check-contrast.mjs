// WCAG contrast gate for VroomView's theme tokens.
//
//   node scripts/check-contrast.mjs
//
// Parses every `[data-theme="…"]` block in app/globals.css and verifies the
// contrast contract documented there: text tokens (ink, ink-2, ink-3, accent,
// rubric, danger) ≥ 4.5:1 on BOTH page and card (small-text AA), accent-ink
// ≥ 4.5:1 on accent (primary button label), and --control ≥ 3:1 on page and
// card (interactive borders, WCAG 1.4.11). Run this after ANY token change or
// new theme; exits non-zero on failure so it can gate CI later.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../app/globals.css"),
  "utf8",
);

// ── color math ──────────────────────────────────────────────────────────
const hexToRgb = (h) => {
  const s = h.replace("#", "");
  const full = s.length === 3 ? [...s].map((c) => c + c).join("") : s;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
};
const luminance = (rgb) =>
  rgb
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [hi, lo] = [luminance(hexToRgb(a)), luminance(hexToRgb(b))].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
};

// ── parse theme blocks ──────────────────────────────────────────────────
const themes = {};
for (const m of css.matchAll(
  /\[data-theme="([\w-]+)"\]\s*\{([^}]+)\}/g,
)) {
  const tokens = {};
  for (const t of m[2].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)) {
    tokens[t[1]] = t[2];
  }
  themes[m[1]] = tokens;
}

if (Object.keys(themes).length === 0) {
  console.error("No theme blocks found — has globals.css changed format?");
  process.exit(1);
}

// ── the contract ────────────────────────────────────────────────────────
const TEXT_TOKENS = ["ink", "ink-2", "ink-3", "accent", "rubric", "danger"];
let failures = 0;

for (const [name, t] of Object.entries(themes)) {
  console.log(`\n=== ${name.toUpperCase()} ===`);
  const check = (label, fg, bg, min) => {
    const r = contrast(fg, bg);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(
      `${ok ? "  pass" : "✗ FAIL"}  ${label.padEnd(22)} ${r
        .toFixed(2)
        .padStart(5)}  (needs ${min})`,
    );
  };

  for (const token of TEXT_TOKENS) {
    for (const surface of ["page", "card"]) {
      check(`${token} on ${surface}`, t[token], t[surface], 4.5);
    }
  }
  check("accent-ink on accent", t["accent-ink"], t.accent, 4.5);
  for (const surface of ["page", "card"]) {
    check(`control on ${surface}`, t.control, t[surface], 3.0);
  }
  // Well surfaces are darker (light themes) / lighter (dark) than page, so
  // only ink/ink-2 may carry text there — never ink-3/rubric (audited 4.1–4.4
  // in every theme). These checks keep the approved pairs honest.
  check("ink on well", t.ink, t.well, 4.5);
  check("ink-2 on well", t["ink-2"], t.well, 4.5);
}

console.log(
  failures === 0
    ? `\nALL PASS across ${Object.keys(themes).length} themes.`
    : `\n${failures} FAILURE(S) — fix tokens before shipping.`,
);
process.exit(failures === 0 ? 0 : 1);
