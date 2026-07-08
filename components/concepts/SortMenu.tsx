"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/Icon";

export type SortOption<K extends string> = {
  key: K;
  label: string;
  /** one line on what the ordering actually reads */
  description: string;
};

/**
 * The sort control, designed instead of defaulted: a listbox popover where
 * every ordering explains itself in one line — seven bare words in a native
 * select tell a newcomer nothing about what "controversial" reads.
 *
 * Accessibility is the listbox pattern done by hand: the trigger carries
 * aria-haspopup/expanded, options are focusable role="option" items, arrows
 * and Home/End rove focus, Escape returns it to the trigger, and a backdrop
 * click closes without stealing focus. Options activate on click, Enter, or
 * Space.
 */
export function SortMenu<K extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: K;
  options: SortOption<K>[];
  onChange: (key: K) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = options.find((o) => o.key === value) ?? options[0];

  // opening puts focus on the selected option — arrows continue from there
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.focus();
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const pick = (key: K) => {
    onChange(key);
    close(true);
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const items = [
      ...(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ??
        []),
    ];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[Math.min(at + 1, items.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[Math.max(at - 1, 0)]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-sm min-h-9 border border-control bg-card pr-2 pl-2.5 text-ink-2 hover:bg-well hover:text-ink"
      >
        <span className="text-ink-3">Sort</span>
        <span className="font-medium text-ink">{current.label}</span>
        <ChevronDownIcon
          size={13}
          className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <>
          {/* click-away surface; Escape is handled on the list itself */}
          <button
            type="button"
            aria-label="Close sort menu"
            tabIndex={-1}
            onClick={() => close(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Sort concepts"
            onKeyDown={onListKeyDown}
            className="sheet absolute right-0 top-[calc(100%+6px)] z-40 w-72 max-w-[calc(100vw-2.5rem)] p-1.5 shadow-[var(--shadow-raise)] motion-safe:animate-[vv-drop-in_0.15s_var(--ease-out-soft)]"
          >
            {options.map((option) => {
              const selected = option.key === value;
              return (
                <li
                  key={option.key}
                  role="option"
                  aria-selected={selected}
                  tabIndex={-1}
                  onClick={() => pick(option.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick(option.key);
                    }
                  }}
                  className={`flex cursor-pointer items-baseline justify-between gap-3 rounded-[6px] px-3 py-2 transition-colors ${
                    selected ? "bg-well" : "hover:bg-well"
                  }`}
                >
                  <span className="min-w-0">
                    <span
                      className={`block text-sm ${
                        selected ? "font-semibold text-ink" : "text-ink"
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-3">
                      {option.description}
                    </span>
                  </span>
                  {selected ? (
                    <CheckIcon size={14} className="shrink-0 text-accent" />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default SortMenu;
