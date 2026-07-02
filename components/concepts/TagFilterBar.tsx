"use client";

import type { ConceptTag } from "@/types";
import { ALL_TAGS } from "@/constants/lenses";

/**
 * A horizontal lens selector styled as editorial underline-tabs (not pills).
 * Controlled by the parent so one state can drive the visible list. Pass
 * `available` to show only the lenses that actually occur in the content
 * being filtered (an empty tab teaches nothing).
 */
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
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {tags.map((tag) => {
        const on = active.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(tag)}
            className={`min-h-10 border-b-2 pb-0.5 text-sm transition-colors ${
              on
                ? "border-accent text-ink"
                : "border-transparent text-ink-3 hover:border-line-2 hover:text-ink"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export default TagFilterBar;
