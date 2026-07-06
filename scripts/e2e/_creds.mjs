// Shared credential loading for the E2E scripts.
//
// Credentials come from the environment (E2E_EMAIL / E2E_PASSWORD) so the test
// password never appears on the command line, in shell history, or in an AI /
// model transcript. A visible CLI password arg is a LEGACY FALLBACK only — it
// is discouraged and warned about, because anything typed on the command line
// can leak. Store the rotated credential in a gitignored `.e2e.local` and
// source it before running:
//
//   set -a; . ./.e2e.local; set +a
//   node scripts/e2e/e2e-2-flows.mjs
//
// See scripts/e2e/README.md for the full safe-credential policy.
export function e2eCredentials(scriptName) {
  const email = process.env.E2E_EMAIL || process.argv[2];
  const password = process.env.E2E_PASSWORD || process.argv[3];
  if (!email || !password) {
    throw new Error(
      `missing credentials — set E2E_EMAIL and E2E_PASSWORD in the environment, ` +
        `then run: node scripts/e2e/${scriptName}  (see scripts/e2e/README.md)`,
    );
  }
  // If the password arrived as a visible CLI arg (not from the env), nudge
  // toward the safe path — the value is now in the process table / history.
  if (!process.env.E2E_PASSWORD && process.argv[3]) {
    console.warn(
      "WARNING: password passed as a visible CLI arg — prefer E2E_PASSWORD in " +
        "the environment (see scripts/e2e/README.md).",
    );
  }
  return { email, password };
}
