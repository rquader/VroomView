"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { ErrorAnimation } from "@/components/animations";

// Route error boundary (Next.js convention) — MUST be a Client Component.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to an error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <ErrorAnimation />
      <h1 className="font-serif text-3xl font-medium tracking-[-0.02em]">
        This page failed to load
      </h1>
      <p role="alert" className="leading-relaxed text-ink-2">
        Please try again. If the problem continues, come back later.
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-secondary">
          Try again
        </button>
        <Link href={ROUTES.home} className="btn btn-ghost">
          Back to community
        </Link>
      </div>
    </main>
  );
}
