# Components

This folder contains the UI building blocks for the board.

| Folder              | What lives here                                                                         |
| ------------------- | --------------------------------------------------------------------------------------- |
| `ui/`               | Small reusable visual elements such as icons, avatars, theme controls, and silhouettes. |
| `layout/`           | Site header, navigation, account menu, and footer.                                      |
| `concepts/`         | Board cards, feed controls, discussion, proposal form, and concept artwork.             |
| `animations/`       | Lottie playback with accessible static fallbacks.                                       |
| `account/`, `auth/` | Account and sign-in forms.                                                              |

Components receive data through props. Page-level Server Components call `lib/services/`; components and pages never create a Supabase client themselves. Writes go through `lib/actions/`.

Components are Server Components by default. Use `"use client"` only for state, browser events, or browser APIs, and keep the client boundary around the smallest interactive piece that needs it. Prefer clear props and plain language. Preserve the warm paper palette, serif display type, four themes, keyboard access, and mobile layouts described by the product design notes.

The proposal form is split into focused pieces under `concepts/proposal/`; its coordinating form keeps the shared draft state. A concept can describe a new vehicle or a change or variant to an existing model. The gallery is three columns on desktop, two on tablet, and one on phones. Authored designs get an “Ideator’s sketch” preview, while concepts without a drawing use text-led previews; keep the Ideator, votes, and comments with the concept. Use the single cycling four-theme control and native modal dialogs for topic selection, mobile navigation, and mobile preview. Keep reusable visual parts in `concepts/` and avoid turning each field into a standalone abstraction without a second real use.

Authentication success should focus and announce its result. Keep vote errors visible. Coordinate-based sketch drawing still needs its keyboard interaction completed; do not describe accessibility review as finished until that work and browser checks are complete.
