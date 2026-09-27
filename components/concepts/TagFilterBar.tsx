"use client";

import type { ConceptTag } from "@/types";
import { ALL_TAGS } from "@/constants/lenses";

/** Shared topic toggles for comment filters and the composer. */
export function TagFilterBar({
  active,
  onToggle,
  available,
}: {
  active: ConceptTag[];
  onToggle: (tag: ConceptTag) => void;
  available?: ConceptTag[];
}) {
  const tags = available
    ? ALL_TAGS.filter((t) => available.includes(t))
    : ALL_TAGS;

  return (
    <div role="group" aria-label="Topics" className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const on = active.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(tag)}
            className={`min-h-11 rounded-full border px-3 text-sm transition-colors ${on ? "border-accent bg-accent text-accent-ink" : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export default TagFilterBar;
