import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/services/viewer.service";
import { AuthShell } from "@/components/auth/AuthShell";
import { UpdatePasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Set a new password" };

/**
 * Where the recovery-email link lands (after /auth/callback signs the user
 * in) — and where the account page sends routine password changes. Requires
 * a session either way; walking here logged-out bounces to the request form.
 */
export default async function UpdatePasswordPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/forgot-password");

  return (
    <AuthShell
      kicker="Password"
      title="Set a new password"
      lede={`Signed in as @${viewer.username} — the new password takes over everywhere, and every other device is signed out.`}
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
