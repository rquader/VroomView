# E2E verification scripts

Playwright flows that exercise the REAL stack (local prod server + the live
Supabase project). Run against a **production** server on port 3100
(`PORT=3100 npm run start` — a dev server's devtools badge pollutes screenshots
and may already own :3000).

## Credentials — env-based, never on the command line

The scripts read the test account from the **environment**, so the password
never appears on the command line, in shell history, or in an AI/model
transcript:

- `E2E_EMAIL` — the test account email
- `E2E_PASSWORD` — the test account password

Store them in a **gitignored** `.e2e.local` at the repo root (already ignored;
never committed) and source it before running:

```bash
# .e2e.local  (gitignored — local only, never commit, never paste into chats)
#   export E2E_EMAIL="…"
#   export E2E_PASSWORD="…"

set -a; . ./.e2e.local; set +a          # load creds into the environment
PORT=3100 npm run start &                # prod server on :3100 (stop it after)

node scripts/e2e/e2e-1-signup.mjs        # signup UI path (stops at confirmation-sent)
node scripts/e2e/e2e-2-flows.mjs         # login → vote → comment → cross-device → delete
node scripts/e2e/e2e-3-posting.mjs       # real posting via the drafting table + guest gate
```

> A visible CLI password arg (`node … <email> <password>`) still works as a
> **legacy fallback**, but it is discouraged — the scripts warn when you use it,
> because anything typed on the command line can leak (process table, history).
> Prefer the environment.

**Never** paste an E2E password into an AI chat, a terminal transcript, a
commit message, a doc/README, or these notes. If one leaks, treat it as
compromised and rotate it (see below).

## Test account

Create it admin-side (SQL insert into `auth.users` with a bcrypt
`extensions.crypt(...)` password and `email_confirmed_at` set — GoTrue gotcha:
the token columns must be `''`, not NULL, or login fails with a generic
invalid-credentials). Reset fixture state between runs (delete the account's
votes/comments) so the flow always starts from zero. The account is
`@e2e_driver` (profile username `e2e_driver`).

## ⚠️ Credential status (2026-07-06)

The previous E2E password appeared in a prior AI session log, so it is treated
as **exposed**. It has been **invalidated** in the database (the account's
`encrypted_password` was set to an unknown DB-generated random value — no one,
including the model, knows it). **E2E cannot run again until the owner sets a
new password for `e2e_driver`** and stores it local-only in `.e2e.local`.

To rotate (owner, outside any AI transcript): reset the `e2e_driver` password
via the Supabase dashboard (Authentication → Users) or a local-only SQL update,
then put the new value in `.e2e.local`. Do not paste the new value anywhere
else.

## Last live run

Full suite (parts 2 + 3) last passed **2026-07-02** against the pre-elevation
build. It has **not** been re-run since the UI/UX elevation pass (the credential
above was invalidated first). Re-run after rotating the password to confirm the
elevated UI still passes; part 2's optimistic-note and delete checks are now
stall-tolerant (reload fallback if the post-action refresh stream stalls).
