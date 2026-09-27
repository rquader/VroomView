"use client";

import type { ConceptTag } from "@/types";
import { LENS_GROUPS, lensLabel } from "@/constants/lenses";
import { CheckIcon } from "@/components/ui/Icon";

/** One controlled topic picker for the desktop sidebar and mobile drawer. */
export function LensControls({
  active,
  counts,
  onToggle,
  roomy = false,
}: {
  active: ConceptTag[];
  counts: Partial<Record<ConceptTag, number>>;
  onToggle: (tag: ConceptTag) => void;
  roomy?: boolean;
}) {
  return (
    <div className={`flex flex-col ${roomy ? "gap-6" : "gap-5"}`}>
      {LENS_GROUPS.map((group) => (
        <fieldset key={group.label}>
          <legend className="mb-2 px-2 text-xs font-medium text-ink-3">
            {group.label}
          </legend>
          <div className="space-y-1">
            {group.tags.map((tag) => {
              const selected = active.includes(tag);
              return (
                <label key={tag} className="block cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={selected}
                    onChange={() => onToggle(tag)}
                    aria-label={tag}
                  />
                  <span
                    className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${selected ? "bg-accent text-accent-ink" : "text-ink-2 hover:bg-well hover:text-ink"}`}
                  >
                    <span className="flex-1">{lensLabel(tag)}</span>
                    <span className="text-xs tabular-nums opacity-80">
                      {counts[tag] ?? 0}
                    </span>
                    {selected ? <CheckIcon size={14} /> : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
