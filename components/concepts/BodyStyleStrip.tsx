"use client";

import { Silhouette } from "@/components/ui/Silhouette";

/**
 * The body-style shelf as a filter you can SEE: one chip per style on the
 * board, each carrying its elevation drawing and live count. Horizontal
 * scroll on phones (edge-to-edge with snap stops), a wrapped row on wide
 * screens. Controlled by the parent — selection is the same state the
 * ?body= deep link drives, so Explore's shelves and this strip agree.
 */
export function BodyStyleStrip({
  shelves,
  active,
  onSelect,
}: {
  shelves: { style: string; count: number }[];
  active: string | null;
  /** null = show every body style */
  onSelect: (style: string | null) => void;
}) {
  if (shelves.length < 2) return null;

  const total = shelves.reduce((n, s) => n + s.count, 0);

  const chip = (selected: boolean) =>
    `flex min-h-11 shrink-0 snap-start items-center gap-2.5 rounded-btn border px-3 py-1.5 text-left transition-colors ${
      selected
        ? "border-accent bg-accent/10 text-accent"
        : "border-control bg-card text-ink-2 hover:bg-well hover:text-ink"
    }`;

  return (
    <div
      role="group"
      aria-label="Filter by body style"
      className="-mx-5 flex snap-x snap-proximity gap-2 overflow-x-auto px-5 pb-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 scrollbar-thin"
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onSelect(null)}
        className={chip(active === null)}
      >
        <span className="text-xs font-semibold">Every body</span>
        <span className="font-mono text-[10px] text-ink-3">{total}</span>
      </button>
      {shelves.map(({ style, count }) => {
        const selected = active === style;
        return (
          <button
            key={style}
            type="button"
            aria-pressed={selected}
            // re-tapping the active shelf releases the filter
            onClick={() => onSelect(selected ? null : style)}
            className={chip(selected)}
          >
            <Silhouette
              bodyStyle={style}
              className={`h-6 w-auto shrink-0 ${
                selected ? "text-accent" : "text-ink-3"
              }`}
            />
            <span className="text-xs font-semibold">{style}</span>
            <span className="font-mono text-[10px] text-ink-3">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default BodyStyleStrip;
