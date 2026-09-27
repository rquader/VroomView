# VroomView studio refresh

Approved direction, 2026-09-27: improve usability and maintainability while keeping the warm paper, serif identity and all four themes. The product is a usable creative social community. Use plain language and functional labels; avoid slogans, fake cheerleading, repeated CTAs, sidebars, and overworked decorative UI. Preserve existing product and data flows. Do not change the Next.js, Supabase, or Vercel architecture without a separate decision.

## Approved design outcome

- The community board is the main destination. Its gallery is three columns on desktop, two on tablet, and one on phones.
- A proposal with an authored design shows a sketch preview. A proposal without a drawing uses a text-led preview. Keep the social context visible: author, votes, and comments.
- “Concept” covers a new vehicle and an argued change or variant to an existing model (for example, an all-wheel-drive Honda Odyssey). Call contributors Ideators; label author metadata “Ideator” and authored art “Ideator’s sketch.”
- Keep the masthead and one cycling theme button for Vellum, Moss, Clay, and Graphite. A saved choice wins; Vellum is the default. The proposal action is “Share a concept,” without a plus icon.
- Use concise labels such as Community, Share a concept, Comments, and Topics. Explain only what helps people browse, post, or comment.
- Topic selection, mobile navigation, and mobile preview use native modal dialogs. Remove sidebars and repeated calls to action.
- Preserve Newsreader for display type, warm-paper surfaces, semantic tokens, and Clay's corrected interactive contrast. Auth completion focuses and announces success; vote errors remain visible. Coordinate-based sketch input is available alongside pointer drawing.
- Avoid fake community statistics, manufacturer affiliation, and capabilities the product does not have. Do not make AI authorship claims for community work.

## Architecture decisions

Routes remain server-side composition; reads go through services and return domain types; writes go through validated Server Actions and remain protected by database constraints and RLS. Board/related reads use ConceptSummary; detail reads load full Concept. React cache deduplicates viewer identity within one request only. Feed search, topic/body filtering, and sorting are pure URL-backed domain logic.

Keep state close to each feed or form. Do not add a state library, repository framework, new backend, or speculative Python/Java service. A future adapter belongs behind the existing service/action boundary only if a concrete need appears. The board's 1,000-row read cap is a known scaling limit; pagination and cross-page aggregation/ranking need product semantics before raising it.

## Progress and checks

- [x] Approved gallery hierarchy and responsive 3/2/1 column layout; keep sketch previews for drawn concepts and text-led previews otherwise.
- [x] Remove sidebars, repeated calls to action, and slogan-heavy copy; retain author, vote, and comment context.
- [x] Use one cycling four-theme control with saved-theme preference and Vellum fallback; remove the plus icon from the proposal action.
- [x] Use native modal dialogs for topics, mobile navigation, and mobile preview; surface auth success and vote errors accessibly; correct Clay control contrast.
- [x] Separate summary/detail reads, extract pure feed behavior, and split proposal form sections.
- [x] On 2026-09-27, npm run check passed lint, TypeScript, 16 tests, and contrast checks for all four themes; format check, diff check, and npm audit (zero findings) passed.
- [x] Final production build passed all 13 routes on Node 22.23.3 with Next.js 16.3.6. Targeted browser and local sketch-harness checks are recorded in docs/architecture.md.
- [x] Coordinate-based sketch input serialization was checked in an isolated local harness; no proposal was published.
- [ ] Authenticated live writes, cross-browser behavior, and manual screen-reader review remain untested. Do not claim full accessibility certification.
- [ ] Refresh the staged VroomViewNotes copies after current branch/build/browser results are settled; do not write those notes directly from this workspace.
- [x] Independent security review of integrated changes; malformed submission guards and focused tests added.
- [ ] Publish the verified application and notes branches with review links.

## Runtime and dependency notes

Next.js 16.3.6 is pinned, patched from 16.2.9 following the dependency audit. The reported current npm audit has zero findings. Node 22.23.3 is the test runtime; Vercel remains on Node 22.x. Prettier 3.6.2 is development-only.

## Limits

This is a UI and maintainability refresh, not a database redesign. The board reads at most 1,000 concept summaries per request. Do not imply this scales indefinitely. Visual checks do not certify production security. Do not run destructive account tests or publish test content to the live database.
