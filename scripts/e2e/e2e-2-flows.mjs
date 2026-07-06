// E2E part 2: the full engagement story on the REAL stack, across two
// "devices" (independent browser contexts = independent cookie jars).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = "http://localhost:3100";
const TRUCK = `${BASE}/concepts/c0000000-0000-4000-8000-000000000004`;
const email = process.argv[2];
const password = process.argv[3];
const NOTE = `E2E note ${Date.now()}: the five-foot bed is the whole ballgame.`;
const NOTE_EDITED = `${NOTE} (measured twice)`;

let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failures++;
};

const browser = await chromium.launch();

async function login(ctx) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE}/`, { timeout: 15000 });
  return page;
}

// ── DEVICE A ─────────────────────────────────────────────────────────────
const ctxA = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const a = await login(ctxA);
check(true, "login lands on the feed (device A)");

// middleware: signed-in users bounce off /login
await a.goto(`${BASE}/login`);
await a.waitForURL(`${BASE}/`);
check(true, "signed-in visit to /login redirects home");

// header shows the account disc
check(
  await a.getByRole("button", { name: /Account: @/ }).isVisible(),
  "masthead shows the account menu",
);

// vote on the truck concept
await a.goto(TRUCK, { waitUntil: "networkidle" });
const vote = a.getByRole("button", { name: /Support this|Remove your support/ }).first();
const before = parseInt(await vote.locator("span").first().innerText(), 10);
await vote.click();
await a.waitForTimeout(1500);
const after = parseInt(await vote.locator("span").first().innerText(), 10);
check(after === before + 1, `vote count ${before} → ${after} (optimistic + settled)`);

await a.reload({ waitUntil: "networkidle" });
const votedState = await a
  .getByRole("button", { name: "Remove your support" })
  .first()
  .getAttribute("aria-pressed");
check(votedState === "true", "vote persists across reload (server truth)");

// comment: compose with a lens tag
await a.getByPlaceholder("Add your take on this proposal…").fill(NOTE);
await a.getByRole("button", { name: "Market fit" }).first().click();
await a.getByRole("button", { name: "Post note" }).click();
// target the RENDERED note (a <p> in the thread), not any text on the page —
// optimistic append means the note and the still-clearing composer textarea
// briefly hold the same text, which trips getByText's strict mode
await a
  .getByRole("paragraph")
  .filter({ hasText: NOTE })
  .waitFor({ timeout: 15000 });
check(true, "comment posts and appears in the thread");

// edit it
const myCard = a.locator("article", { hasText: NOTE });
await myCard.getByRole("button", { name: "Edit" }).click();
const editBox = myCard.locator("textarea");
await editBox.fill(NOTE_EDITED);
await myCard.getByRole("button", { name: "Save note" }).click();
await a
  .getByRole("paragraph")
  .filter({ hasText: NOTE_EDITED })
  .waitFor({ timeout: 15000 });
await a.getByText(/· edited/i).first().waitFor();
check(true, "comment edits in place and shows the edited mark");

// ── DEVICE B (separate cookie jar = separate session) ────────────────────
const ctxB = await browser.newContext({ viewport: { width: 390, height: 844 } });
const b = await login(ctxB);
await b.goto(TRUCK, { waitUntil: "networkidle" });
check(
  await b.getByText(NOTE_EDITED, { exact: true }).isVisible(),
  "device B sees the note written on device A",
);
const bVoted = await b
  .getByRole("button", { name: "Remove your support" })
  .first()
  .getAttribute("aria-pressed");
check(bVoted === "true", "device B sees the vote from device A (account state, not device state)");

// delete from device B — editing rights follow the ACCOUNT
const bCard = b.locator("article", { hasText: NOTE_EDITED });
b.once("dialog", (d) => d.accept());
await bCard.getByRole("button", { name: "Delete" }).click();
await b.waitForTimeout(2000);
check(
  !(await b.getByText(NOTE_EDITED, { exact: true }).isVisible().catch(() => false)),
  "note deleted from device B",
);

// device A sees the deletion after refresh
await a.reload({ waitUntil: "networkidle" });
check(
  !(await a.getByText(NOTE_EDITED, { exact: true }).isVisible().catch(() => false)),
  "deletion propagates to device A",
);

// un-vote to leave the seed data tidy, then sign out on A
await a.getByRole("button", { name: "Remove your support" }).first().click();
await a.waitForTimeout(1200);
await a.getByRole("button", { name: /Account: @/ }).click();
await a.getByRole("button", { name: "Sign out", exact: true }).click();
await a.waitForURL(`${BASE}/`);
await a.getByRole("link", { name: "Sign in" }).first().waitFor();
check(true, "sign out returns to a guest masthead (device A)");

// device B's session is INDEPENDENT — still signed in after A's local logout
await b.goto(`${BASE}/`, { waitUntil: "networkidle" });
check(
  await b.getByRole("button", { name: /menu/i }).isVisible(),
  "device B still has its own session (per-device refresh tokens)",
);

await browser.close();
console.log(failures === 0 ? "\nALL E2E CHECKS PASSED" : `\n${failures} E2E FAILURES`);
process.exit(failures === 0 ? 0 : 1);
