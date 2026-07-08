"use client";

import type { ConceptTag } from "@/types";
import { LENS_GROUPS, lensLabel } from "@/constants/lenses";

/**
 * The "review lenses" — the 11 tags grouped into meaningful families and
 * rendered as ink-stamp checkboxes with live counts. Presentational; the
 * parent owns the state. One implementation serves both the desktop rail
 * (compact) and the mobile drawer (`roomy` → 44px touch rows).
 */

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
    <div className={`flex flex-col ${roomy ? "gap-6" : "gap-7"}`}>
      {LENS_GROUPS.map((group) => (
        <div key={group.label}>
          <p className={`overline ${roomy ? "mb-2" : "mb-3.5"}`}>
            {group.label}
          </p>
          <ul className={`flex flex-col ${roomy ? "gap-0.5" : "gap-0"}`}>
            {group.tags.map((tag) => (
              <li key={tag}>
                <label
                  className={`flex cursor-pointer items-center gap-2.5 text-sm text-ink-2 transition-colors hover:text-ink ${
                    roomy
                      ? "min-h-11 rounded-btn px-1.5 hover:bg-well"
                      : "min-h-9" /* the lg rail is touch-reachable on tablets */
                  }`}
                >
                  <input
                    type="checkbox"
                    className="lens-check"
                    checked={active.includes(tag)}
                    onChange={() => onToggle(tag)}
                  />
                  {/* "Other" reads plainly inside its family; screen readers
                      still get the disambiguated name */}
                  <span className="flex-1">
                    {lensLabel(tag)}
                    {lensLabel(tag) !== tag ? (
                      <span className="sr-only"> ({group.label})</span>
                    ) : null}
                  </span>
                  <span className="font-mono text-xs text-ink-3">
                    {counts[tag] ?? 0}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default LensControls;
