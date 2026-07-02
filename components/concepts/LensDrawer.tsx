"use client";

import { useEffect, useId } from "react";
import type { ConceptTag } from "@/types";
import { LensControls } from "./LensControls";
import { CloseIcon } from "@/components/ui/Icon";

/**
 * Small-screen home of the review lenses: a bottom sheet (thumb-reachable,
 * standard drawer affordance) wrapping the same <LensControls> the desktop
 * rail uses — one filter implementation, two placements. Filters apply live;
 * the primary action just confirms and closes with the resulting count.
 */
export function LensDrawer({
  open,
  onClose,
  resultCount,
  active,
  counts,
  onToggle,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  active: ConceptTag[];
  counts: Partial<Record<ConceptTag, number>>;
  onToggle: (tag: ConceptTag) => void;
  onClear: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Close lenses"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-black/30 motion-safe:animate-[vv-fade-in_0.15s_ease]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80dvh] flex-col rounded-t-2xl border-t border-line bg-page shadow-[var(--shadow-raise)] motion-safe:animate-[vv-slide-up_0.22s_var(--ease-out-soft)]"
      >
        <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-2" />
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <h2 id={titleId} className="overline">
            Review lenses
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lenses"
            className="btn btn-ghost -mr-2 min-h-11 min-w-11"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-4">
          <LensControls active={active} counts={counts} onToggle={onToggle} roomy />
        </div>

        <div className="flex items-center gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClear}
            disabled={active.length === 0}
            className="btn btn-ghost"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary ml-auto"
          >
            Show {resultCount} {resultCount === 1 ? "concept" : "concepts"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LensDrawer;
