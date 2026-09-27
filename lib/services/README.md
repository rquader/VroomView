# Services

Services are server-side reads. They query through the server Supabase client, map database rows into domain types, and centralize joins and viewer-specific fields. Routes and components should consume service results rather than query Supabase directly.

Board and related-concept reads return `ConceptSummary`; `getConcept()` returns the full `Concept` for the detail view. The summary intentionally omits long-form details and feasibility. Viewer identity uses React `cache()` within one request, not a cross-user shared cache. See [the architecture guide](../../docs/architecture.md).
