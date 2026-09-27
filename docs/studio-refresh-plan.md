# VroomView studio refresh

Approved direction, 2026-09-27: overhaul the website and improve maintainability while retaining the warm paper and serif visual identity. Preserve the current Next.js / Supabase / Vercel stack and existing product flows. Make focused commits, verify, then push the branch together.

## Design

VroomView is a community review board for proposed vehicles. The drawings, proposal, and numbers should lead. Keep Newsreader for titles, Archivo for controls and prose, and JetBrains Mono only for measurements. Retain Vellum, Moss, Clay, and Graphite with semantic color tokens and tested contrast.

Use a spacious masthead, a compact introduction, and a featured real concept with a large elevation. Feed entries pair a visible drawing with the proposal, concise metadata, specifications, and review controls. Avoid decorative numbering, repeated uppercase labels, background grain, and entrance animation on every card. Mobile has its own compact card composition and accessible filter drawer.

Carry the same hierarchy through Explore, concept detail, proposal creation, authentication/account, and loading/empty/error states. Keep authored designs distinct from generic body-style illustrations. Do not invent community statistics, manufacturer affiliation, or product capability.

## Architecture

Keep routes as server-side composition; services own Supabase reads and return domain objects; server actions validate writes; interactive components own only UI state. Use lean concept summaries for listing, separate from detail records. Strengthen inferred query types and explicit failure handling. Deduplicate viewer reads within a request, never across users.

Extract pure feed filtering/ranking and focused proposal form sections. Keep state ownership close to the form/feed; do not introduce a state library, repository framework, new backend, or speculative Python/Java service. Future remote services belong behind existing service/action boundaries.

## Work and acceptance

- [ ] Refresh shared styles, navigation, feed, and visible concept drawings; check desktop, tablet, phone, keyboard and all themes.
- [ ] Separate list/detail reads, validate untrusted values, and surface vote-read failures; typecheck and cover pure mapping/filter behavior.
- [ ] Split proposal form/preview/spec editor while preserving publishing payload, design studio, and responsive preview behavior.
- [ ] Reconcile README and contributor architecture guide; update the relevant VroomViewNotes, keeping historical notes clearly labeled.
- [ ] Add repeatable targeted checks; run lint, typecheck, tests, contrast, production build, and browser flows. Record anything not exercised, especially authenticated writes.
- [ ] Independently review integrated changes, make focused commits, push branch, and inspect GitHub/Vercel checks.

## Baseline

Clean `main` at start. Existing lint, typecheck, and four-theme token contrast checks pass. The local homepage loads five Supabase concepts. Build initially blocked by sandbox access to Google Fonts; retry with authorized network access. Existing notes incorrectly describe several completed backend features as mock-only.

## Limits

This is a UI and maintainability overhaul, not a database redesign. Pagination and server-wide aggregate/ranking queries need deliberate semantics before the board grows beyond the current small community dataset. Do not claim unlimited scalability or certify production security from visual checks. Do not run destructive account tests or publish test content to the live database.
