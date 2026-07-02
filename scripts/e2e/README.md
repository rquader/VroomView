# E2E verification scripts

Playwright flows that exercise the REAL stack (local prod server + the live
Supabase project). Run against `PORT=3100 npm run start`.

```bash
# 1 · the signup UI path (stops at the confirmation-sent state — the free-tier
#     mailer only delivers to real MX domains, so E2E accounts are created
#     directly instead; see below)
node scripts/e2e/e2e-1-signup.mjs <email> <password>

# 2 · the full engagement story: login → middleware bounce → optimistic vote →
#     persistence → comment → edit-in-place → cross-"device" (second browser
#     context) visibility + delete → sign-out → independent sessions
node scripts/e2e/e2e-2-flows.mjs <email> <password>
```

**Test account:** create it admin-side (SQL insert into auth.users with a
bcrypt `extensions.crypt(...)` password and `email_confirmed_at` set — and
note the GoTrue gotcha: the token columns must be `''`, not NULL, or login
fails with a generic invalid-credentials). Reset fixture state between runs
(delete the account's votes/comments) so the flow always starts from zero.

Verified passing 13/13 on 2026-07-02 (details: team note 23 status log).
