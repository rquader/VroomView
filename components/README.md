# Components

| Folder | What lives here |
|--------|-----------------|
| `ui/` | Small reusable **presentational** primitives — Button, Input, Card, Avatar, … No data fetching. |
| `layout/` | Structural pieces — Navbar, Sidebar, Footer, page shells. |
| `animations/` | The Lottie animation system (see `07 - Lottie Animation System` in the docs). |

Guidelines:

- Keep components **presentational**. Fetch data in Server Components / `lib/services`
  and pass it down as props.
- A component is a **Server Component by default**. Add `"use client"` only when it
  needs state, effects, event handlers, or browser APIs — then keep that boundary as
  small as possible (see how `animations/` isolates `"use client"` to `LottiePlayer`).
