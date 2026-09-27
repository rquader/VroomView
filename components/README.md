# Components

This folder contains presentation and interaction code. Routes load data through services and pass domain objects into components; mutations go through Server Actions.

| Folder               | What lives here                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- |
| `ui/`                | Small reusable visual elements such as icons, avatars, theme controls, and silhouettes. |
| `layout/`            | Site header, navigation, account menu, and footer.                                      |
| `concepts/`          | Board cards, feed controls, discussion, proposal form, and concept artwork.             |
| `concepts/proposal/` | Idea fields, vehicle fields, specification editing, and the live proposal preview.      |
| `animations/`        | Lottie playback with accessible static fallbacks.                                       |
| `account/`, `auth/`  | Account and sign-in forms.                                                              |

Components receive data through props. Page-level Server Components call `lib/services/`; components and pages never create a Supabase client themselves. Writes go through `lib/actions/`.

Components are Server Components by default. Use `"use client"` only for state, browser events, or browser APIs, and keep the client boundary around the smallest interactive piece that needs it. Prefer clear props and plain language. Preserve the warm paper palette, serif display type, four themes, keyboard access, and mobile layouts described by the product design notes.

## Finding the right component

- `FeedView` renders the community controls and results. Search, filter parsing, and sorting belong in `lib/domain/feed.ts`, where they can be tested without React.
- `ConceptCard` presents a gallery item. Authored drawings are labeled “Ideator’s sketch”; concepts without drawings use text-led previews. Keep the Ideator, votes, and comments visible.
- `DraftingTable` owns shared draft state and submission. The four `proposal/` components receive values and callbacks through props; keep a single owner for each value instead of duplicating state in the sections.
- `DesignStudio` owns sketch interaction. Both pointer drawing and the implemented “Draw with coordinates” workflow produce data for the existing design parser.
- `LensDrawer`, `MobileMenu`, and the mobile preview in `DraftingTable` use native modal dialogs. Preserve background isolation, dismissal, focus return, and scroll restoration when changing them.

Keep reusable visual parts near their feature. Extract a component when it gives a coherent responsibility a clear name; avoid introducing an abstraction for every individual field.

## Interaction and accessibility checks

Authentication success focuses and announces its result; vote failures remain visible as text. An isolated local form harness checked coordinate entry and stroke serialization; targeted browser checks covered mobile-preview dismissal, focus, and resize behavior. Manual screen-reader, cross-browser, and authenticated live-write testing remain unverified. See the dated [verification record](../docs/architecture.md#verification-status) for the exact coverage; implemented keyboard controls alone do not establish full accessibility conformance.
