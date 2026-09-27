import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { getViewer } from "@/lib/services/viewer.service";
import {
  ChangeUsernameForm,
  DeleteAccountForm,
} from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "Account" };

/**
 * Account settings — "the registration". Signed-in only; guests bounce to
 * sign-in with a return path. Three registers: the handle (updates through
 * own-row RLS + the column-scoped grant), the password (the one hardened
 * path at /update-password serves both recovery and routine changes), and
 * deletion (typed confirmation → the delete_account() definer function).
 */
export default async function AccountPage() {
  const viewer = await getViewer();
  if (!viewer)
    redirect(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.account)}`);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        Account
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em]">
        Account settings
      </h1>
      <p className="mt-3 leading-relaxed text-ink-2">
        Signed in as{" "}
        <span className="font-medium text-ink">@{viewer.username}</span>
        {viewer.displayName ? ` (${viewer.displayName})` : ""}.
      </p>

      <section className="sheet mt-10 overflow-hidden" aria-labelledby="handle">
        <div className="border-b border-line bg-well/60 px-5 py-2.5">
          <h2 id="handle" className="ui-label text-ink-2">
            Username
          </h2>
        </div>
        <div className="px-5 py-5">
          <ChangeUsernameForm current={viewer.username} />
        </div>
      </section>

      <section
        className="sheet mt-6 overflow-hidden"
        aria-labelledby="password"
      >
        <div className="border-b border-line bg-well/60 px-5 py-2.5">
          <h2 id="password" className="ui-label text-ink-2">
            Password
          </h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-ink-2">
            Setting a new password signs out other devices. The{" "}
            <Link
              href="/forgot-password"
              className="text-accent underline-offset-2 hover:underline"
            >
              email reset
            </Link>{" "}
            works signed out.
          </p>
          <Link href="/update-password" className="btn btn-secondary mt-4">
            Set a new password
          </Link>
        </div>
      </section>

      {/* the danger register — bordered in the ink reserved for it */}
      <section
        className="mt-6 overflow-hidden rounded-card border border-danger/50 bg-card shadow-[var(--shadow-paper)]"
        aria-labelledby="delete"
      >
        <div className="border-b border-danger/30 bg-well/60 px-5 py-2.5">
          <h2 id="delete" className="ui-label text-danger">
            Close the account
          </h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-ink-2">
            Deletion is immediate and irreversible: the account, its sessions on
            every device, and its concepts, sketches, comments, and votes — are
            removed together.
          </p>
          <div className="mt-4">
            <DeleteAccountForm username={viewer.username} />
          </div>
        </div>
      </section>
    </main>
  );
}
