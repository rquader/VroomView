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
    <main className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <ErrorAnimation message="This page failed to load. It's us, not you." />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-secondary">
          Try again
        </button>
        <Link href={ROUTES.home} className="btn btn-ghost">
          Back to the feed
        </Link>
      </div>
    </main>
  );
}
