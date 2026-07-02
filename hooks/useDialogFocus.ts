"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus management for overlay panels (dialogs, menus): when `open` flips true,
 * moves focus to the first focusable element inside the panel, cycles Tab /
 * Shift+Tab within it, and restores focus to the previously-focused element on
 * close/unmount. Escape handling and scroll lock stay with the component —
 * this hook owns focus only.
 *
 * Attach the returned ref to the panel element (give it tabIndex={-1} as a
 * focus fallback for panels with no focusable children).
 */
export function useDialogFocus<T extends HTMLElement>(open: boolean) {
  const panelRef = useRef<T | null>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusables = () =>
      [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      );

    (focusables()[0] ?? panel).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && panel.contains(active);

      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    // capture phase so the trap wins even if inner elements stop propagation
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [open]);

  return panelRef;
}
