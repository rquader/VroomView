import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      kicker="Reset"
      title="Reset your password"
      lede="Tell us the account email and we'll send a reset link."
      footer={
        <Link
          href={ROUTES.login}
          className="text-accent underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
