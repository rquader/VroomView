"use client";

/** Body-style filters share state with Explore links and the URL. */
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
    `flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 py-2 text-left transition-colors ${
      selected
        ? "bg-accent text-accent-ink"
        : "bg-card text-ink-2 hover:bg-well hover:text-ink"
    }`;

  return (
    <div
      role="group"
      aria-label="Filter by body style"
      className="-mx-5 flex snap-x snap-proximity gap-1 overflow-x-auto px-5 pb-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 scrollbar-thin"
    >
      <button
        type="button"
        aria-pressed={active === null}
        onClick={() => onSelect(null)}
        className={chip(active === null)}
      >
        <span className="text-[13px] font-medium">All styles</span>
        <span className="text-xs">{total}</span>
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
            <span className="text-[13px] font-medium">{style}</span>
            <span className="text-xs">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default BodyStyleStrip;
