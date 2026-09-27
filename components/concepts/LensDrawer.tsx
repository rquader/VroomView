"use client";

import { useEffect, useId, useRef } from "react";
import type { ConceptTag } from "@/types";
import { LensControls } from "./LensControls";
import { CloseIcon } from "@/components/ui/Icon";

/**
 * A modal filter panel: bottom sheet on phones, right rail on wider screens.
 * Filters apply live; the primary action confirms and closes with the count.
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-black/30 p-0 text-ink backdrop:bg-transparent"
    >
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-line bg-page shadow-[var(--shadow-raise)] sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:max-h-none sm:w-96 sm:rounded-2xl motion-safe:animate-[vv-slide-up_0.22s_var(--ease-out-soft)]">
        <div
          aria-hidden
          className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-2"
        />
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <h2 id={titleId} className="font-serif text-2xl">
            Filter by topic
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close topic filters"
            className="btn btn-ghost -mr-2 min-h-11 min-w-11"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-4">
          <LensControls
            active={active}
            counts={counts}
            onToggle={onToggle}
            roomy
          />
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
            View {resultCount} {resultCount === 1 ? "concept" : "concepts"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default LensDrawer;
