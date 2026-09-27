// Full-app visual audit: screenshots pages × themes × viewports against a
// production server (expects `npm run start` already running).
// Usage: AUDIT_BASE_URL=http://localhost:3100 node scripts/visual-audit.mjs [quick]
//        (quick = vellum+graphite, / only; base defaults to :3000)
// Run against a PROD server — NOT a dev server (its devtools badge pollutes
// shots); a leftover dev server may own :3000, hence the configurable base.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = new URL("../.visual-audit", import.meta.url).pathname; // git-ignored output
import { mkdirSync } from "node:fs";
mkdirSync(out, { recursive: true });

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const quick = process.argv[2] === "quick";
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};
const THEMES = quick
  ? ["vellum", "graphite"]
  : ["vellum", "moss", "clay", "graphite"];
const PAGES = quick
  ? [["home", "/"]]
  : [
      ["home", "/"],
      // Seeded founding concept (see supabase/seed.sql) — a stable, real detail page.
      ["concept", "/concepts/c0000000-0000-4000-8000-000000000004"],
      ["explore", "/explore"],
      ["submit", "/submit"],
      ["404", "/nope"],
    ];

const browser = await chromium.launch();
for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("pageerror", (e) =>
    console.log(`PAGE ERROR [${vpName}]:`, e.message),
  );
  for (const theme of THEMES) {
    await page.addInitScript((t) => localStorage.setItem("vv-theme", t), theme);
    for (const [pageName, path] of PAGES) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600); // let lottie + fonts settle
      await page.screenshot({
        path: `${out}/${pageName}-${theme}-${vpName}.png`,
        fullPage: true,
      });
    }
    console.log(`done: ${theme} × ${vpName}`);
  }
  await ctx.close();
}
await browser.close();
console.log("AUDIT COMPLETE →", out);
