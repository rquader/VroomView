# Contributing to VroomView

VroomView is a community for sharing and discussing automotive ideas. A concept can propose a new vehicle or make a case for a change or variant of an existing model, such as an all-wheel-drive Honda Odyssey. Call contributors Ideators; use “Ideator” for author metadata and “Ideator’s sketch” for their drawing. Keep changes useful to real people: plain language, clear controls, room for different opinions, and a warm paper-and-serif visual identity. Preserve all four themes. Use concise, functional labels such as “Share a concept,” “Comments,” and “Topics.” Explanatory copy should help someone browse, post, or comment; avoid brand slogans, fake cheerleading, generic gradients, visual clutter, and copy that sounds generated.

## Get it running

Use Node 22, install dependencies with `npm install`, copy `.env.example` to `.env.local`, and add only the public Supabase URL and publishable key. Never commit local environment files or expose secret/service-role credentials. Then run `npm run dev`.

## A guided tour

An App Router page is a file named `page.tsx` inside `app/`; for example `app/page.tsx` is `/`, while `app/concepts/[id]/page.tsx` is a concept detail route. Parentheses create route groups without adding a URL segment.

React components are functions that take props and return UI. Most components here are server-rendered by default. Add `"use client"` only where an interactive feature needs state, event handlers, or browser APIs, and keep that boundary small. TypeScript types describe the shapes passed between those components and the rest of the app; domain types in `types/index.ts` are intentionally separate from generated database types.

Follow the board page as an example: `app/page.tsx` loads the viewer and concept summaries through `lib/services`, then passes them to `FeedView`. The service translates database rows into app types. `lib/domain/feed.ts` handles URL-backed search, lens filters, and sorting as pure functions, separate from React and the database. `FeedView` renders the resulting board.

For a write, the proposal form calls a Server Action in `lib/actions`. The action validates input and checks the signed-in user; Postgres constraints and Row Level Security enforce the final data rules. UI checks make errors clear, but they do not replace database authorization. See [docs/architecture.md](docs/architecture.md) for the complete flow.

## Make a change

1. Find the closest existing page, component, service, action, or pure domain function and follow its pattern.
2. Keep components focused on presentation. Put data reads in `lib/services`, writes in `lib/actions`, and reusable framework-independent rules in `lib/domain`.
3. Preserve the warm paper palette and all four themes. The gallery is three columns on desktop, two on tablet, and one on phones; authored drawings get sketch previews and proposals without drawings stay text-led. Keep authors, votes, and comments visible. Use the single cycling theme control, native modal dialogs for topic selection, mobile navigation, and mobile preview, and concise functional labels. Avoid sidebars, repeated calls to action, slogans, and fake cheerleading. Use semantic CSS tokens from `app/globals.css`, check keyboard and small-screen behavior, and honor reduced-motion preferences.
4. Add or adjust a focused test for pure behavior when it matters. Do not add a test framework dependency without discussion.
5. Before describing the change as complete, run `npm run check` and `npm run build`; report any check you could not run.

## Test boundary

The default test command is local and must not contact or mutate production data. Any test involving writes must use an isolated local/test Supabase project, disposable test identity, and clearly bounded fixtures. Never use a real user's account or production as a test target. Do not add live-write tests unless the owner has explicitly set up and authorized that test environment.

## Data-source flexibility

The UI depends on app domain types and service/action interfaces, not directly on Supabase clients. Keep that seam clean. A Python or Java adapter is a future option only if a concrete need appears; it should sit behind the service boundary and preserve current user-facing behavior. Do not add another backend or duplicate the data layer preemptively.

## Checks

- `npm run check`: lint, TypeScript, tests, and contrast across all four themes.
- `npm run build`: production compilation.

Use the project learning notes for deeper explanations of Next.js, Supabase, auth, RLS, and the visual system. They live in VroomViewNotes; the index is “00 - VroomView Index.”
