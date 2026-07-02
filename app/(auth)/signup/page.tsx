import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";

  return (
    <AuthShell
      kicker="New reviewer"
      title="Join the review"
      lede="An account lets you file concepts, support the strong ones, and argue in the notes."
      footer={
        <>
          Already reviewing?{" "}
          <Link
            href={`${ROUTES.login}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-accent underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm next={next} />
    </AuthShell>
  );
}
