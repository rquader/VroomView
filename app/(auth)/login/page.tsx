import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/";
  const notice =
    params.error === "link"
      ? "That link expired or was already used — sign in, or request a fresh one."
      : undefined;

  return (
    <AuthShell
      kicker="Sign in"
      title="Back to the board"
      lede="Your lenses, votes, and notes pick up where you left them — on any device."
      footer={
        <>
          New here?{" "}
          <Link
            href={`${ROUTES.signup}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-accent underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthShell>
  );
}
