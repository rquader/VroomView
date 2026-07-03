import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { getViewer } from "@/lib/services/viewer.service";
import { DraftingTable } from "@/components/concepts/DraftingTable";

export const metadata: Metadata = { title: "Propose a concept" };

/**
 * REAL posting. Signed-in reviewers get the drafting table (live preview,
 * files through createConcept → RLS). Guests get an honest gate — browsing
 * is free; filing needs an account — with sign-in carrying them back here.
 */
export default async function SubmitPage() {
  const viewer = await getViewer();

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
          <DraftingTable username={viewer.username} />
        ) : (
          <div className="sheet max-w-xl overflow-hidden">
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
        )}
      </div>
    </main>
  );
}
