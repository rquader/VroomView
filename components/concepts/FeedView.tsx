"use client";

import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/constants/app";
import { controversyScore, hotScore, referenceClock } from "@/utils/rank";
import type { Concept, ConceptTag } from "@/types";
import { BodyStyleStrip } from "./BodyStyleStrip";
import { ConceptCard } from "./ConceptCard";
import { LensControls } from "./LensControls";
import { LensDrawer } from "./LensDrawer";
import { SortMenu, type SortOption } from "./SortMenu";
import { EmptyState } from "@/components/animations";
import { CloseIcon, SlidersIcon } from "@/components/ui/Icon";

type SortKey =
  | "trending"
  | "newest"
  | "oldest"
  | "popular"
  | "unpopular"
  | "controversial"
  | "discussed";

const SORTS: SortOption<SortKey>[] = [
  { key: "trending", label: "Trending", description: "Fresh support first" },
  { key: "newest", label: "Newest", description: "Latest filings" },
  { key: "oldest", label: "Oldest", description: "The register, front to back" },
  { key: "popular", label: "Most popular", description: "Highest score" },
  { key: "unpopular", label: "Least popular", description: "Lowest score" },
  {
    key: "controversial",
    label: "Most controversial",
    description: "Big, split arguments",
  },
  {
    key: "discussed",
    label: "Most discussed",
    description: "Most notes filed",
  },
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
  const [active, setActive] = useState<ConceptTag[]>([]);
  const [bodyFilter, setBodyFilter] = useState<string | null>(initialBody);
  const [sort, setSort] = useState<SortKey>("trending");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // keep ?body= shareable without paying a server round-trip per tap:
  // shallow history update — client state is the source of truth here
  const selectBody = (style: string | null) => {
    setBodyFilter(style);
    window.history.replaceState(
      null,
      "",
      style ? `${ROUTES.home}?body=${encodeURIComponent(style)}` : ROUTES.home,
    );
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

  // the shelf strip: every body style on the board with its live count
  const shelves = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of concepts) m.set(c.bodyStyle, (m.get(c.bodyStyle) ?? 0) + 1);
    return [...m.entries()]
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count || a.style.localeCompare(b.style));
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

      {/* min-w-0: the shelf strip inside is a scroll container, and a grid
          item's default min-width:auto would let it stretch the track instead
          of scrolling */}
      <div className="min-w-0">
        {/* the shelf strip — body styles as drawn, tappable chips. Replaces
            the old lone "?body= chip": the filter state is always visible,
            not just when set, and Explore's deep links land on it selected */}
        <div className="mb-5">
          <BodyStyleStrip
            shelves={shelves}
            active={bodyFilter}
            onSelect={selectBody}
          />
        </div>

        {/* Toolbar: count · (lenses on small screens) · sort. Wraps rather
            than overflowing on narrow phones */}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line pb-3">
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

            <SortMenu value={sort} options={SORTS} onChange={setSort} />
          </div>
        </div>

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
                  if (bodyFilter) selectBody(null);
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
