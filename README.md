# VroomView

An independent review board for automotive concepts — proposals with real numbers, debated like a design review ("spec sheet meets forum").

**Status:** full UI foundation on mock data — responsive multi-theme design system (4 themes, WCAG-AA verified), feed with lens filtering + sorting, concept detail with spec title block + meta rail, explore catalogue, structured submit preview. No database/auth yet; that's the next milestone.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB / Auth / Storage | Supabase (Postgres, Auth, Storage, RLS) |
| Animations | lottie-react |
| Hosting | Vercel |

## Prerequisites

- **Node 22 LTS** (see `.nvmrc`). With nvm: `nvm use`.
- A Supabase project (for the env values below).

## Setup

```bash
nvm use                      # use Node 22 (matches Vercel)
npm install                  # install dependencies
cp .env.example .env.local   # then fill in the values (never commit .env.local)
npm run dev                  # http://localhost:3000
```

### Environment variables

Set these in `.env.local` (names only — see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Both are public / client-safe. **Never** put a Supabase secret key in a `NEXT_PUBLIC_*` variable.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (no emit) |
| `node scripts/check-contrast.mjs` | WCAG contrast gate for the theme tokens |

## Project structure

See `05 - Folder Structure` in the team docs. Quick map:

```
app/            routes (App Router); (auth) & (protected) route groups
components/     ui/  layout/  concepts/  animations/
lib/            supabase/ (clients + middleware), services/ (data-access layer),
                mock/ (TEMPORARY UI data), env.ts
hooks/          reusable React hooks
types/          domain types + generated Database types (placeholder)
constants/      app constants, route map, lens vocabulary, animation paths
utils/          small helpers (cn, timeAgo, …)
scripts/        quality gates (contrast checker)
public/         static assets (public/animations for Lottie JSON)
```

## Deployment

**Production:** https://vroom-view.vercel.app (Vercel project `vroom-view`, GitHub `main` → auto deploy).

Set the same env vars in **Vercel → Project Settings → Environment Variables**. Node is pinned to 22.x via `engines` + `.nvmrc` + the Vercel project setting — keep them aligned.

**Important:** Vercel **Framework Preset** must be **Next.js**. If set to "Other" with output directory `public`, only static files deploy and app routes 404. See team doc `08 - Development Workflow`.

## Team learning docs

Architecture, auth, Supabase, and onboarding notes live in a separate private Markdown/Obsidian repo (**VroomViewNotes**). Start with `00 - VroomView Index`.
