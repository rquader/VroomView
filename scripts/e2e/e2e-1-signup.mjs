// E2E part 1: sign up a fresh test account against the REAL stack.
// (Email confirmation is ON; part 2 runs after the account is SQL-confirmed.)
import { createRequire } from "node:module";
import { e2eCredentials } from "./_creds.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = "http://localhost:3100";
const { email, password } = e2eCredentials("e2e-1-signup.mjs");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));

await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password", { exact: true }).fill(password);
await page.getByRole("button", { name: "Create account" }).click();
await page.getByText("Confirmation filed").waitFor({ timeout: 15000 });
console.log("PASS: signup submitted, confirmation-sent state shown");
await page.screenshot({ path: "e2e-signup-sent.png" });
await browser.close();
console.log("PART1 DONE");
