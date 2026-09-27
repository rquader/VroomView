# VroomView

VroomView is an open review board for automotive concepts. People share proposals, compare specifications, and discuss what could make vehicles more useful. The interface uses warm paper, serif headlines, and four themes to support a clear, practical community experience.

## Start here

1. Use Node 22 (`nvm use` if you have nvm).
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the public Supabase URL and publishable key. Never commit `.env.local` or put a secret/service-role key in browser-visible configuration.
4. Run `npm run dev` and open <http://localhost:3000>.
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) for a project tour, change workflow, and checks.

The app uses Next.js App Router, React, TypeScript, Tailwind CSS v4, Supabase, and lottie-react. Vercel runs Node 22. The live feature and deployment state changes over time; check the VroomViewNotes current-session note rather than relying on an old status snapshot.

## Quality checks

- `npm run check` runs lint, type checking, unit tests, and the four-theme contrast check.
- `npm run build` checks the production build.

Tests run locally with Node's test runner and a small TypeScript loader that uses the existing TypeScript dependency. They do not need a new test dependency. Tests must not write to the live Supabase project. Any test that exercises a database write must use an isolated local/test project and explicit test data.

## Where things live

- `app/` contains URL routes and page composition.
- `components/` contains shared UI and feature components.
- `lib/services/` reads and maps data for the UI.
- `lib/actions/` validates and performs writes.
- `lib/supabase/` creates clients for server and browser runtimes.
- `lib/domain/` contains framework-independent domain logic.
- `types/` contains app domain types and generated database types.

See [docs/architecture.md](docs/architecture.md) for the data flow and [CONTRIBUTING.md](CONTRIBUTING.md) for a guided first contribution. Detailed design, security, auth, and data notes live in the separate VroomViewNotes vault; start there at “00 - VroomView Index.”
