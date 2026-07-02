"use client";

import { useEffect, useMemo, useState } from "react";
import type { Concept, ConceptTag } from "@/types";
import { ConceptCard } from "./ConceptCard";
import { LensControls } from "./LensControls";
import { LensDrawer } from "./LensDrawer";
import { EmptyState } from "@/components/animations";
import { SlidersIcon, ChevronDownIcon, CloseIcon } from "@/components/ui/Icon";

type SortKey = "support" | "newest" | "discussed";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "support", label: "Most support" },
  { key: "newest", label: "Newest" },
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
}: {
  concepts: Concept[];
  signedIn: boolean;
}) {
  const [active, setActive] = useState<ConceptTag[]>([]);
  const [sort, setSort] = useState<SortKey>("support");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    const filtered =
      active.length === 0
        ? concepts
        : concepts.filter((c) => active.every((t) => c.tags.includes(t)));
    const bySort: Record<SortKey, (a: Concept, b: Concept) => number> = {
      support: (a, b) => b.votes - a.votes,
      newest: (a, b) => b.postedAt.localeCompare(a.postedAt),
      discussed: (a, b) => b.comments - a.comments,
    };
    return [...filtered].sort(bySort[sort]);
  }, [concepts, active, sort]);

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
            {active.length ? " · narrowed" : ""}
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
            title="Nothing matches every lens"
            description="Each lens narrows the board further. Remove one, or propose the concept that fits."
            action={
              <button
                type="button"
                onClick={() => setActive([])}
                className="btn btn-secondary btn-sm min-h-10"
              >
                Clear lenses
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {visible.map((c, i) => (
              <ConceptCard key={c.id} concept={c} index={i + 1} signedIn={signedIn} />
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
