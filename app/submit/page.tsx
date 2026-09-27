import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { SPEC_PRESET_LABELS } from "@/constants/specs";
import { getViewer } from "@/lib/services/viewer.service";
import { listCommunitySpecLabels } from "@/lib/services/concepts.service";
import { DraftingTable } from "@/components/concepts/DraftingTable";
import { ConceptArtwork } from "@/components/concepts/ConceptArtwork";

export const metadata: Metadata = { title: "Share a concept" };

export default async function SubmitPage() {
  const viewer = await getViewer();
  // Guests do not need the community-label query to see the sign-in prompt.
  const communityLabels = viewer
    ? await listCommunitySpecLabels(SPEC_PRESET_LABELS)
    : [];
  return (
    <main className="page-shell pt-9 sm:pt-12">
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
        Share a concept
      </h1>
      <p className="mt-3 text-ink-2">
        Propose a new vehicle or a change to an existing model. Explain your
        reasoning; sketches are optional.
      </p>
      <div className="mt-9">
        {viewer ? (
          <DraftingTable
            username={viewer.username}
            communityLabels={communityLabels}
          />
        ) : (
          <div className="grid max-w-5xl gap-8 md:grid-cols-2 md:items-center">
            <section className="sheet p-6 sm:p-8">
              <h2 className="section-heading">Sign in to post</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                You’ll need an account to share concepts, comment, and vote.
                Browsing is open to everyone.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`${ROUTES.login}?next=${encodeURIComponent(ROUTES.submit)}`}
                  className="btn btn-primary"
                >
                  Sign in
                </Link>
                <Link
                  href={`${ROUTES.signup}?next=${encodeURIComponent(ROUTES.submit)}`}
                  className="btn btn-secondary"
                >
                  Create an account
                </Link>
              </div>
            </section>
            <div>
              <ConceptArtwork bodyStyle="Coupe" large />
              <p className="mt-3 text-center text-xs text-ink-3">
                Sketch with a body-style template or start from a blank canvas.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
