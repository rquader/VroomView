import Link from "next/link";
import { ROUTES } from "@/constants/app";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm text-ink-2">404</p>
      <h1 className="mt-4 font-serif text-4xl font-medium">Page not found</h1>
      <p className="mt-3 leading-relaxed text-ink-2">
        This page may have moved or been removed.
      </p>
      <Link href={ROUTES.home} className="btn btn-primary mt-6">
        Back to community
      </Link>
    </main>
  );
}
