# CLAUDE.md — VroomView

Instructions for Claude Code (and any AI agent) working in this repo. These override default behavior.

## Project

VroomView — a social web app for car enthusiasts. **Currently a skeleton**; features are built incrementally.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres / Auth / Storage / RLS) · lottie-react · hosted on Vercel · Node 22 LTS.

## Priorities

**Excellence and security come first.** Aim for zero known vulnerabilities; when a trade-off or residual risk is unavoidable, document it honestly in the team `16 - Security` note (don't hide it). Correctness and quality over speed.

## Security rules (non-negotiable)

1. **Never read, print, copy, or expose secret values** — `.env`, `.env.local`, `.env.*`, tokens, DB passwords, API keys, Vercel/Supabase/GitHub secrets. The hook `.claude/hooks/block-secret-access.sh` blocks Bash commands that would.
2. You may verify env variable **names** exist, never their values. To see expected names, read `.env.example`.
3. Never commit `.env.local` or any secret. Never put secrets in code, docs, comments, or examples — placeholders only.
4. Frontend/browser code uses only the Supabase **URL** + **publishable** key. Never use a secret / service-role key where the browser can see it (i.e. never in a `NEXT_PUBLIC_*` var or client component).
5. `npm install` / `npm prune` / `npm ci` require approval (see `.claude/settings.json` → `ask`). Don't run installs, network, or destructive commands without asking first.
6. **No commits or pushes without explicit approval.** No destructive commands. No permission-bypass mode.
7. If unsure whether a command could reveal secrets, stop and ask.
8. Keep dependencies clean: run `npm audit`, then fix or document findings. `package-lock.json` is committed; baseline security headers live in `next.config.mjs`. Full posture + trade-offs: the team `16 - Security` note.

## Architecture conventions

- **Server-first.** Components are Server Components by default. Add `"use client"` only when needed (state, effects, events, browser APIs), and keep the boundary small.
- **Data-access boundary.** UI/pages never import `@/lib/supabase` directly — go through `lib/services/*`, which return domain types from `@/types`. This keeps adding/swapping a backend (Java/Python/AI) cheap.
- **Supabase clients:** `@/lib/supabase/client` (client components), `server` (server components / actions / route handlers), `middleware` (root `middleware.ts` only). All use the publishable key; RLS enforces access.
- **Path alias:** `@/*` → repo root. Prefer it over long relative imports.
- **Tailwind v4:** configured in `app/globals.css` (`@import "tailwindcss"`, `@theme`). There is no `tailwind.config.js`.
- **Constants over magic strings:** routes in `constants/app.ts` (`ROUTES`), animation paths in `constants/animations.ts`.
- **Types:** regenerate `types/database.ts` via `supabase gen types` after schema changes.
- **Don't create DB tables** as a side effect — schema work is its own deliberate step.

## Comments

Comment the non-obvious: architecture decisions, auth/session flow, client/server boundaries. Don't comment obvious code.

## Documentation expectations

Teammate-facing learning docs live in the separate **VroomViewNotes** repo (Markdown/Obsidian). When you make an architectural change, update the relevant note. Docs may be pushed to a private repo — **private ≠ secret-safe** — so no secrets in docs (placeholders only), and avoid absolute local paths / personal info.

## Working style

This project is also for learning. Explain non-obvious decisions clearly (like a senior engineer mentoring a student), but don't pad. Propose a short plan for anything architectural and wait for approval before large changes.
