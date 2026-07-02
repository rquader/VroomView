# `(auth)` route group

A **route group** — the parentheses mean the folder name is NOT part of the URL.
It groups the public authentication pages and (later) gives them a shared layout
(e.g. a centered card), without adding an `/auth` segment to the path.

Planned routes (not built yet):

| File (later) | URL |
|--------------|-----|
| `login/page.tsx` | `/login` |
| `signup/page.tsx` | `/signup` |
| `auth/callback/route.ts` | OAuth / email confirmation callback handler |

See `06 - Auth Architecture` in the docs for the planned flow.
