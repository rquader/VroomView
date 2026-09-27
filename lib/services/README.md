# Services

Services are server-side reads. They query through the server Supabase client, map database rows into domain types, and centralize joins and viewer-specific fields. Routes and components should consume service results rather than query Supabase directly.

## Read contracts

| Service               | Responsibilities                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `concepts.service.ts` | Board and related-concept summaries, full concept details, and community specification-label suggestions. |
| `comments.service.ts` | A concept's comments, author data, vote counts, and the viewer's ownership/support state.                 |
| `viewer.service.ts`   | Verified session identity and public profile information, reused within a request.                        |

Board and related-concept reads return `ConceptSummary`; `getConcept()` returns the full `Concept` for the detail view. The summary omits long-form details and feasibility. Query result types are inferred with Supabase `QueryData` against the generated `Database` type. Shared mapping checks live in `lib/domain/concept-mapping.ts`.

Viewer identity and repeated concept-detail reads use React `cache()` within one server request. Do not put viewer-specific fields into a shared cross-user cache. Concept/comment list queries and their viewer-vote lookups throw on failure so route error handling can respond. The viewer service separately handles a missing profile with its existing fallback; do not assume every lookup has identical error behavior.

## Changing or extending a read

1. Identify the domain fields the caller needs. Keep long-form detail fields out of summary queries unless the caller actually uses them.
2. Update the query and row-to-domain mapping together, using generated database types and the shared parsing helpers.
3. Keep reusable rules independent of React and Supabase in `lib/domain/`; add a focused local test for changed behavior.
4. Preserve viewer identity, authorization, error behavior, and the documented read limits. Pagination needs explicit filter, ranking, and count semantics.

These services currently query Supabase directly. A future Python or Java service could be called behind this server-side boundary, with its response mapped into app domain types. No adapter or external-service contract is implemented; authentication, timeouts, failures, and integration tests would need to be designed with that integration. Writes remain in `lib/actions/` and must be considered separately. See [the architecture guide](../../docs/architecture.md).
