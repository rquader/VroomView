// E2E part 3: real posting — the drafting table files a concept through
// createConcept + RLS and lands on the live page. Also checks the guest gate.
// Clean up afterwards: delete the created concept (SQL) to keep the board tidy.
import { createRequire } from "node:module";
import { e2eCredentials } from "./_creds.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = "http://localhost:3100";
const { email, password } = e2eCredentials("e2e-3-posting.mjs");
const TITLE = `E2E microbus concept ${String(Date.now()).slice(-6)}`;

let failures = 0;
const check = (ok, label) => {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failures++;
};

const browser = await chromium.launch();

// guest gate
const guest = await (await browser.newContext()).newPage();
await guest.goto(`${BASE}/submit`, { waitUntil: "networkidle" });
check(
  await guest.getByRole("link", { name: "Sign in to file" }).isVisible(),
  "guests get the filing-desk gate, not a dead form",
);

// signed-in drafting
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password", { exact: true }).fill(password);
await page.getByRole("button", { name: "Sign in" }).click();
await page.waitForURL(`${BASE}/`);

await page.goto(`${BASE}/submit`, { waitUntil: "networkidle" });
await page.getByLabel("Title").fill(TITLE);
await page
  .getByLabel("Summary")
  .fill("A friendly electric microbus for car-share fleets — flat floor, swappable seats, honest range.");
await page.getByLabel("Body style").fill("Minivan");
// default rows are Est. price / Range / Powertrain / Drivetrain now
await page.getByLabel("Spec 1 value").fill("$26,000");
await page.getByLabel("Spec 2 value").fill("210 mi");
await page.getByLabel("Spec 3 value").fill("EV");
await page.getByLabel("Spec 4 value").fill("FWD");
// name a maker through the radio-chip control
await page.getByRole("radio", { name: "Name a maker" }).check();
await page.getByLabel("Proposed maker name").fill("Volkswagen");
await page.getByRole("button", { name: "Price" }).click();
await page.getByRole("button", { name: "Environment" }).click();

// live preview reflects the draft before filing
check(
  await page.locator("aside").getByText(TITLE).isVisible(),
  "live preview mirrors the draft (title on the preview sheet)",
);

await page.getByRole("button", { name: "File this proposal" }).click();
await page.waitForURL(/\/concepts\/[0-9a-f-]{36}$/, { timeout: 20000 });
check(true, "filing lands on the real concept page");
// the URL changes on navigation commit; the streamed content paints just after
await page.getByRole("heading", { name: TITLE }).waitFor({ timeout: 15000 });
check(true, "the filed concept renders live");
await page.getByText("$26,000").first().waitFor({ timeout: 15000 });
check(true, "spec callouts render from the filed jsonb");
await page.getByText("Volkswagen").first().waitFor({ timeout: 15000 });
check(true, "the proposed maker renders on the sheet");
const conceptUrl = page.url();
console.log("created:", conceptUrl);

// it's on the board too
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
check(await page.getByText(TITLE).first().isVisible(), "the new concept appears in the feed");

await browser.close();
console.log(failures === 0 ? "\nPOSTING E2E PASSED" : `\n${failures} FAILURES`);
console.log(`cleanup: delete from public.concepts where title = '${TITLE}';`);
process.exit(failures === 0 ? 0 : 1);
