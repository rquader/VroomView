"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/app";
import type { ConceptSummary, ConceptTag } from "@/types";
import {
  FEED_SORTS,
  filterConcepts,
  parseFeedFilters,
  type FeedFilters,
} from "@/lib/domain/feed";
import { BodyStyleStrip } from "./BodyStyleStrip";
import { ConceptCard } from "./ConceptCard";
import { LensDrawer } from "./LensDrawer";
import { SortMenu } from "./SortMenu";
import { CloseIcon, SearchIcon, SlidersIcon } from "@/components/ui/Icon";

/** URL-backed filters survive navigation and can be shared with other readers. */
export function FeedView({
  concepts,
  signedIn,
}: {
  concepts: ConceptSummary[];
  signedIn: boolean;
}) {
  const params = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const shelves = useMemo(() => {
    const counts = new Map<string, number>();
    for (const concept of concepts)
      counts.set(concept.bodyStyle, (counts.get(concept.bodyStyle) ?? 0) + 1);
    return [...counts]
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => a.style.localeCompare(b.style));
  }, [concepts]);
  const filters = parseFeedFilters(
    params,
    shelves.map((shelf) => shelf.style),
  );
  const updateFilters = (patch: Partial<FeedFilters>) => {
    const next = { ...filters, ...patch };
    const query = new URLSearchParams();
    if (next.query) query.set("q", next.query);
    if (next.body) query.set("body", next.body);
    for (const tag of next.tags) query.append("tag", tag);
    if (next.sort !== "trending") query.set("sort", next.sort);
    window.history.replaceState(
      null,
      "",
      query.size ? `/?${query}` : ROUTES.home,
    );
  };
  const toggleTag = (tag: ConceptTag) =>
    updateFilters({
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((value) => value !== tag)
        : [...filters.tags, tag],
    });
  const clearFilters = () => updateFilters({ query: "", body: null, tags: [] });
  const counts = useMemo(() => {
    const result: Partial<Record<ConceptTag, number>> = {};
    for (const concept of concepts)
      for (const tag of concept.tags) result[tag] = (result[tag] ?? 0) + 1;
    return result;
  }, [concepts]);
  const visible = filterConcepts(concepts, filters);
  const hasFilters = Boolean(
    filters.query || filters.body || filters.tags.length,
  );

  return (
    <div>
      <div className="gallery-heading">
        <h1 className="font-serif text-4xl font-medium tracking-[-0.035em] sm:text-5xl">
          Community
        </h1>
        <label className="relative w-full sm:max-w-sm">
          <span className="sr-only">Search concepts</span>
          <SearchIcon
            size={18}
            className="pointer-events-none absolute top-3.5 left-4 text-ink-3"
          />
          <input
            type="search"
            value={filters.query}
            maxLength={120}
            onChange={(event) => updateFilters({ query: event.target.value })}
            placeholder="Search concepts"
            className="field gallery-search pl-11"
          />
        </label>
      </div>
      <div className="gallery-toolbar">
        <BodyStyleStrip
          shelves={shelves}
          active={filters.body}
          onSelect={(body) => updateFilters({ body })}
        />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn btn-secondary rounded-full"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <SlidersIcon size={14} /> Topics
            {filters.tags.length > 0 ? ` (${filters.tags.length})` : ""}
          </button>
          <SortMenu
            value={filters.sort}
            options={[...FEED_SORTS]}
            onChange={(sort) => updateFilters({ sort })}
          />
        </div>
      </div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2" role="status">
          {visible.length} {visible.length === 1 ? "concept" : "concepts"}
          {hasFilters ? " found" : ""}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="min-h-11 rounded-btn px-3 text-sm text-accent hover:bg-well hover:text-ink"
          >
            Clear filters
          </button>
        ) : null}
      </div>
      {concepts.length >= 1000 ? (
        <p className="mb-4 text-sm text-ink-2">
          Showing the latest 1,000 concepts. Filters apply to these results.
        </p>
      ) : null}
      {filters.tags.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-label={`Remove ${tag} topic`}
              className="topic-tag min-h-11"
            >
              {tag}
              <CloseIcon size={12} />
            </button>
          ))}
        </div>
      ) : null}
      {visible.length ? (
        <div className="concept-gallery">
          {visible.map((concept) => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              signedIn={signedIn}
            />
          ))}
        </div>
      ) : (
        <div className="sheet px-6 py-12 text-center">
          <h2 className="font-serif text-3xl">
            {hasFilters ? "No concepts found" : "No concepts yet"}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-2">
            {hasFilters
              ? "Try another search or remove a topic to see more ideas."
              : "Share the first concept to start a discussion."}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-secondary mt-6"
            >
              Clear filters
            </button>
          ) : (
            <Link href={ROUTES.submit} className="btn btn-primary mt-6">
              Share a concept
            </Link>
          )}
        </div>
      )}
      <LensDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={visible.length}
        active={filters.tags}
        counts={counts}
        onToggle={toggleTag}
        onClear={() => updateFilters({ tags: [] })}
      />
    </div>
  );
}
