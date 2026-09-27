"use client";

import { useEffect, useMemo, useState } from "react";
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
import { LensControls } from "./LensControls";
import { LensDrawer } from "./LensDrawer";
import { SortMenu } from "./SortMenu";
import { Avatar } from "@/components/ui/Avatar";
import {
  CloseIcon,
  PlusIcon,
  SearchIcon,
  SlidersIcon,
} from "@/components/ui/Icon";

/** URL-backed filters survive navigation and can be shared with other readers. */
export function FeedView({
  concepts,
  signedIn,
  viewerName,
}: {
  concepts: ConceptSummary[];
  signedIn: boolean;
  viewerName?: string;
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

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) setDrawerOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_240px] xl:gap-9">
      <aside
        className="hidden lg:sticky lg:top-28 lg:block"
        aria-label="Filter concepts"
      >
        <h2 className="font-serif text-xl font-medium">Topics</h2>
        <p className="mt-2 mb-6 text-xs leading-relaxed text-ink-3">
          Filter by one or more topics.
        </p>
        <LensControls
          active={filters.tags}
          counts={counts}
          onToggle={toggleTag}
        />
        {filters.tags.length > 0 ? (
          <button
            type="button"
            onClick={() => updateFilters({ tags: [] })}
            className="mt-4 min-h-11 text-sm text-accent hover:underline"
          >
            Clear topics
          </button>
        ) : null}
      </aside>

      <div className="min-w-0">
        <Link href={ROUTES.submit} className="composer-invite mb-6">
          <Avatar name={viewerName || "You"} />
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-xl font-medium">
              Share a concept
            </span>
            <span className="mt-1 block text-xs text-ink-2">
              Add an idea, sketch, and specifications.
            </span>
          </span>
          <PlusIcon size={22} className="shrink-0 text-accent" />
        </Link>
        <label className="relative mb-5 block">
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
            placeholder="Search ideas, makers, or people"
            className="field min-h-12 pl-11"
          />
        </label>
        <BodyStyleStrip
          shelves={shelves}
          active={filters.body}
          onSelect={(body) => updateFilters({ body })}
        />
        <div className="my-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-ink-2" role="status">
            {visible.length} {visible.length === 1 ? "concept" : "concepts"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn btn-secondary btn-sm min-h-10 lg:hidden"
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
        {filters.tags.length > 0 ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {filters.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-label={`Remove ${tag} topic`}
                className="topic-tag min-h-9"
              >
                {tag}
                <CloseIcon size={12} />
              </button>
            ))}
          </div>
        ) : null}
        {visible.length ? (
          <div className="flex flex-col gap-6">
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
      </div>

      <aside className="hidden xl:sticky xl:top-28 xl:block">
        <section className="community-note">
          <h2 className="font-serif text-2xl font-medium">About VroomView</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            A community for proposing vehicles and discussing their design,
            cost, and engineering.
          </p>
          <dl className="mt-5 grid grid-cols-2 border-y border-line py-4">
            <div>
              <dt className="text-xs text-ink-3">Concepts</dt>
              <dd className="mt-1 text-lg font-medium">{concepts.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Comments</dt>
              <dd className="mt-1 text-lg font-medium">
                {concepts.reduce(
                  (total, concept) => total + concept.comments,
                  0,
                )}
              </dd>
            </div>
          </dl>
          <Link
            href={signedIn ? ROUTES.submit : ROUTES.signup}
            className="btn btn-primary mt-5 w-full"
          >
            {signedIn ? "Share a concept" : "Create an account"}
          </Link>
          <Link
            href={ROUTES.about}
            className="mt-3 block py-2 text-center text-sm text-accent hover:underline"
          >
            How it works
          </Link>
        </section>
      </aside>
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
