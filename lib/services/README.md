# Services: reads and data mapping

Pages and components use functions here to read app data. They do not import a Supabase client. Services return domain types from `types/`, keeping database column names and query details at the boundary.

```text
Server page → lib/services read → Supabase (today)
                    ↓
              domain types → components
```

| File                  | Purpose                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `concepts.service.ts` | `listConcepts()` and `getRelated()` return compact `ConceptSummary` values; `getConcept(id)` returns the full `Concept`, including long proposal prose. |
| `comments.service.ts` | Reads notes for a concept and maps timestamps and viewer state.                                                                                         |
| `viewer.service.ts`   | `getViewer()` verifies the session and returns the public profile, or `null` for a guest.                                                               |

For lists, use the lean type that fits the screen. `ConceptSummary` deliberately omits `details` and `feasibility`; the detail page asks for the full concept. This avoids fetching long prose for every board card.

The services add per-viewer values such as a person's vote and whether they authored a concept. Keep these values scoped to the current request. `getViewer()` uses React's request-scoped `cache()` so concurrent server reads can share the verified viewer identity without sharing it across requests.

## Writes

Writes live in `lib/actions/` as Server Actions. Actions check the signed-in user and validate input for useful feedback. Database constraints and Row Level Security remain the final authorization boundary; application checks do not replace them. See the VroomViewNotes “23 - Data Layer and RLS” for the policy details.

## If the data source changes

Keep callers dependent on service/action signatures and domain types. A Python or Java service could be adapted behind this boundary if a concrete product need arises. There is no need to introduce a second backend preemptively; today, Supabase is the persistence layer.

The full flow and current board limit are in [docs/architecture.md](../../docs/architecture.md).
