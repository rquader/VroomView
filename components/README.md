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

The proposal form is split into focused pieces under `concepts/proposal/`; `DraftingTable` coordinates their shared form state. Keep reusable visual parts in `concepts/` and avoid turning each field into a standalone abstraction without a second real use.
