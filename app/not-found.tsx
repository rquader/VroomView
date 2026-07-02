import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { ArrowLeftIcon } from "@/components/ui/Icon";

// Custom 404 — an unfiled drawing sheet, in the editorial voice. Server Component.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-14 text-center">
      <div className="sheet w-full max-w-xs overflow-hidden text-left">
        {/* ink-2 tiers: this strip is well-tinted, where ink-3/rubric dip below AA */}
        <div className="flex items-center justify-between border-b border-line bg-well/60 px-4 py-2">
          <span className="overline text-[10px] text-ink-2">Sheet 404</span>
          <span className="dateline text-[10px] text-ink-2">Not filed</span>
        </div>
        <div className="px-4 py-5">
          <div
            aria-hidden
            className="flex h-24 items-center justify-center rounded-[8px] border border-dashed border-control"
          >
            <span className="dateline">No drawing here</span>
          </div>
        </div>
      </div>

      <h1 className="mt-7 font-serif text-3xl font-medium tracking-[-0.02em]">
        This concept is not on the board
      </h1>
      <p className="mt-2 leading-relaxed text-ink-2">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href={ROUTES.home} className="btn btn-secondary">
          <ArrowLeftIcon size={16} />
          Back to the feed
        </Link>
        <Link href={ROUTES.explore} className="btn btn-ghost">
          Browse the catalogue
        </Link>
      </div>
    </main>
  );
}
