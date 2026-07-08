import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { SPEC_PRESET_LABELS } from "@/constants/specs";
import { getViewer } from "@/lib/services/viewer.service";
import { listCommunitySpecLabels } from "@/lib/services/concepts.service";
import { DraftingTable } from "@/components/concepts/DraftingTable";
import { SpecList } from "@/components/concepts/SpecList";
import { Silhouette } from "@/components/ui/Silhouette";

export const metadata: Metadata = { title: "Propose a concept" };

/**
 * REAL posting. Signed-in reviewers get the drafting table (live preview,
 * files through createConcept → RLS). Guests get an honest gate — browsing
 * is free; filing needs an account — with sign-in carrying them back here.
 */
export default async function SubmitPage() {
  const [viewer, communityLabels] = await Promise.all([
    getViewer(),
    // labels the board's authors use beyond the presets, for the spec picker
    listCommunitySpecLabels(SPEC_PRESET_LABELS),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        Draft a proposal
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em]">
        Propose a concept
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">
        Lay out the vehicle you think should exist — the idea, and the numbers
        that make it real.
      </p>

      <div className="mt-10">
        {viewer ? (
          <DraftingTable
            username={viewer.username}
            communityLabels={communityLabels}
          />
        ) : (
          <div className="lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,28rem)] lg:items-start lg:gap-12">
            <div className="sheet overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-5 py-2.5">
                <span className="overline text-accent">Filing desk</span>
                <span className="dateline text-ink-2">Account required</span>
              </div>
              <div className="px-5 py-6">
                <p className="leading-relaxed text-ink-2">
                  Browsing the board is open to everyone. Filing a proposal —
                  and voting, and arguing in the notes — needs an account, so
                  every idea has a name behind it.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${ROUTES.login}?next=${encodeURIComponent(ROUTES.submit)}`}
                    className="btn btn-primary"
                  >
                    Sign in to file
                  </Link>
                  <Link
                    href={`${ROUTES.signup}?next=${encodeURIComponent(ROUTES.submit)}`}
                    className="btn btn-secondary"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>

            {/* what the desk is FOR — a sample of the drafting table's live
                preview, so the value of an account is visible, not asserted.
                Static and clearly stamped as a sample; numbers are invented
                for the vignette only. */}
            <div aria-hidden className="mt-10 lg:mt-0">
              <p className="overline mb-3 border-b border-line pb-2.5">
                The drafting table — a live preview forms as you type
              </p>
              <div className="sheet overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-4 py-2">
                  <span className="overline text-[10px] text-ink-2">
                    Sample sheet
                  </span>
                  <span className="dateline text-[10px] text-ink-2">
                    Unfiled
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5 text-[11px]">
                    <span className="font-semibold uppercase tracking-[0.14em] text-accent">
                      Minivan
                    </span>
                    <span className="dateline">
                      just now · <span className="normal-case">@you</span>
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-serif text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
                    Solar-assisted camper van
                  </h2>
                  <p className="mt-1.5 leading-relaxed text-ink-2">
                    A compact camper whose roof of panels adds real daily range
                    — sized for two people and a weekend.
                  </p>
                  <div className="mt-4 rounded-[8px] border border-line bg-well/60 px-4 pt-3 pb-2">
                    <Silhouette
                      bodyStyle="Minivan"
                      className="mx-auto h-auto w-full max-w-[190px] text-ink-2"
                    />
                  </div>
                  <div className="mt-5">
                    <SpecList
                      lead
                      specs={[
                        { label: "Est. price", value: "$48,000" },
                        { label: "Solar gain", value: "+18 mi/day" },
                        { label: "Sleeps", value: "2" },
                      ]}
                    />
                  </div>
                  <div className="mt-5 border-t border-line pt-3.5 text-[11px] uppercase tracking-wide text-ink-3">
                    Environment · Market fit
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
