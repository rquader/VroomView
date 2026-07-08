"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { controversyScore, hotScore, referenceClock } from "@/utils/rank";
import type { Concept, ConceptTag } from "@/types";
import { ConceptCard } from "./ConceptCard";
import { LensControls } from "./LensControls";
import { LensDrawer } from "./LensDrawer";
import { EmptyState } from "@/components/animations";
import { SlidersIcon, ChevronDownIcon, CloseIcon } from "@/components/ui/Icon";

type SortKey =
  | "trending"
  | "newest"
  | "oldest"
  | "popular"
  | "unpopular"
  | "controversial"
  | "discussed";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "popular", label: "Most popular" },
  { key: "unpopular", label: "Least popular" },
  { key: "controversial", label: "Most controversial" },
  { key: "discussed", label: "Most discussed" },
];

/**
 * Client feed: review-lens filtering + sorting over data handed down by a
 * Server Component (currently mock) — stays presentational so mock → Supabase
 * later won't touch it. A concept must match ALL active lenses ("narrow by").
 *
 * Responsive split: at lg+ the lenses live in a sticky rail; below lg the SAME
 * <LensControls> renders inside a bottom-sheet drawer, with active lenses
 * echoed as dismissible chips so state is never hidden behind the drawer.
 */
export function FeedView({
  concepts,
  signedIn,
  initialBody = null,
}: {
  concepts: Concept[];
  signedIn: boolean;
  /** validated ?body= deep link (Explore's shelves land here) */
  initialBody?: string | null;
}) {
  const router = useRouter();
  const [active, setActive] = useState<ConceptTag[]>([]);
  const [bodyFilter, setBodyFilter] = useState<string | null>(initialBody);
  const [sort, setSort] = useState<SortKey>("trending");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const clearBody = () => {
    setBodyFilter(null);
    router.replace(ROUTES.home, { scroll: false }); // drop ?body= from the URL
  };

  // The drawer trigger hides at lg (the rail takes over) — close on crossing
  // that line so the scroll lock can't outlive its visible UI.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = (tag: ConceptTag) =>
    setActive((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const counts = useMemo(() => {
    const m: Partial<Record<ConceptTag, number>> = {};
    for (const c of concepts) for (const t of c.tags) m[t] = (m[t] ?? 0) + 1;
    return m;
  }, [concepts]);

  const visible = useMemo(() => {
    const byLens =
      active.length === 0
        ? concepts
        : concepts.filter((c) => active.every((t) => c.tags.includes(t)));
    const filtered = bodyFilter
      ? byLens.filter((c) => c.bodyStyle === bodyFilter)
      : byLens;
    // ties fall through to recency so equal-primary orderings stay stable
    const newest = (a: Concept, b: Concept) =>
      b.postedAt.localeCompare(a.postedAt);
    const ref = referenceClock(concepts);
    const bySort: Record<SortKey, (a: Concept, b: Concept) => number> = {
      trending: (a, b) => hotScore(b, ref) - hotScore(a, ref) || newest(a, b),
      newest,
      oldest: (a, b) => -newest(a, b),
      popular: (a, b) => b.score - a.score || newest(a, b),
      unpopular: (a, b) => a.score - b.score || newest(a, b),
      controversial: (a, b) =>
        controversyScore(b) - controversyScore(a) || newest(a, b),
      discussed: (a, b) => b.comments - a.comments || newest(a, b),
    };
    return [...filtered].sort(bySort[sort]);
  }, [concepts, active, bodyFilter, sort]);

  return (
    <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-14">
      {/* Desktop lens rail — sticky below the masthead */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="overline">Review lenses</h2>
          {active.length > 0 ? (
            <button
              type="button"
              onClick={() => setActive([])}
              className="text-xs text-accent hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="mt-6">
          <LensControls active={active} counts={counts} onToggle={toggle} />
        </div>
      </aside>

      <div>
        {/* Toolbar: count · (lenses on small screens) · sort */}
        <div className="mb-6 flex items-center gap-3 border-b border-line pb-3">
          <p className="dateline">
            {visible.length} {visible.length === 1 ? "concept" : "concepts"}
            {active.length || bodyFilter ? " · narrowed" : ""}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn btn-secondary btn-sm min-h-9 lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              <SlidersIcon size={14} />
              Lenses
              {active.length > 0 ? (
                <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] leading-none text-accent-ink">
                  {active.length}
                </span>
              ) : null}
            </button>

            <label className="relative inline-flex items-center">
              <span className="sr-only">Sort concepts</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="btn btn-sm min-h-9 cursor-pointer appearance-none border border-control bg-card pr-7 pl-2.5 text-ink-2 hover:bg-well"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={13}
                className="pointer-events-none absolute right-2 text-ink-3"
              />
            </label>
          </div>
        </div>

        {/* The body-style deep link (from Explore) shows at every size —
            it's URL state, not rail state, so it must never hide */}
        {bodyFilter ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearBody}
              aria-label={`Stop filtering by ${bodyFilter}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-btn border border-accent bg-accent/10 px-2.5 text-xs text-accent transition-colors hover:bg-accent/20"
            >
              {bodyFilter} shelf
              <CloseIcon size={11} />
            </button>
          </div>
        ) : null}

        {/* Active lenses echoed as dismissible chips where the rail is hidden */}
        {active.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2 lg:hidden">
            {active.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                aria-label={`Remove ${tag} lens`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-btn border border-control bg-card px-2.5 text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
              >
                {tag}
                <CloseIcon size={11} />
              </button>
            ))}
          </div>
        ) : null}

        {visible.length === 0 ? (
          <EmptyState
            heading="h2"
            title="Nothing matches every filter"
            description="Each filter narrows the board further. Loosen one, or propose the concept that fits."
            action={
              <button
                type="button"
                onClick={() => {
                  setActive([]);
                  if (bodyFilter) clearBody();
                }}
                className="btn btn-secondary btn-sm min-h-10"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {visible.map((c, i) => (
              // staggered rise on arrival (capped so long boards don't lag the tail)
              <div
                key={c.id}
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                className="motion-safe:animate-[vv-rise_0.4s_var(--ease-out-soft)_backwards]"
              >
                <ConceptCard concept={c} index={i + 1} signedIn={signedIn} />
              </div>
            ))}
          </div>
        )}
      </div>

      <LensDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={visible.length}
        active={active}
        counts={counts}
        onToggle={toggle}
        onClear={() => setActive([])}
      />
    </div>
  );
}

export default FeedView;
