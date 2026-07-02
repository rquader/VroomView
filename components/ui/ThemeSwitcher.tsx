"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckIcon } from "@/components/ui/Icon";

/**
 * Curated themes (nature / car-studio inspired). Each maps to a token table in
 * globals.css via data-theme on <html>. Order defines the cycle. Every theme
 * carries an original stroke glyph — the material of its studio: vellum sheet,
 * moss leaf, clay modeling buck, graphite crescent (night).
 */
const THEMES = [
  { id: "vellum", label: "Vellum", note: "Studio paper · petrol", paper: "#f2eee5", accent: "#0c5b5e" },
  { id: "moss", label: "Moss", note: "Stone · racing green", paper: "#eef0e8", accent: "#2f5d3a" },
  { id: "clay", label: "Clay", note: "Sand · terracotta", paper: "#f4ece1", accent: "#a5502f" },
  { id: "graphite", label: "Graphite", note: "Night studio", paper: "#1e1b15", accent: "#58c2b0" },
];

const GLYPHS: Record<string, React.ReactNode> = {
  // a drawing sheet with a folded corner
  vellum: (
    <>
      <path d="M6 3.5h7.5L19 9v11.5H6z" />
      <path d="M13.5 3.5V9H19" />
    </>
  ),
  // a leaf with its vein
  moss: (
    <>
      <path d="M11.5 20.5C11.5 13 14 7.5 20 4.5c.5 8-2.5 13.5-8.5 16z" />
      <path d="M11.5 20.5C7 19 4.5 16 4.5 12c3.5 0 6 1.5 7.5 4" />
    </>
  ),
  // a clay modeling buck on the bench
  clay: (
    <>
      <path d="M4.5 16c1.5-5.5 4-7.5 7.5-7.5s6 2 7.5 7.5z" />
      <path d="M3.5 19.5h17" />
    </>
  ),
  // the night studio's crescent
  graphite: <path d="M19.5 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10 10.5z" />,
};

const THEME_EVENT = "vv-theme-change";

/**
 * Theme state shared across every consumer (masthead cycle button AND the
 * mobile-menu list). The DOM attribute is the source of truth — set before
 * paint by the no-flash script in layout.tsx. useSyncExternalStore hydrates
 * with the server snapshot ("vellum") and immediately reconciles to the real
 * client value, so instances can't drift.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
const getSnapshot = () =>
  document.documentElement.dataset.theme || "vellum";
const getServerSnapshot = () => "vellum";

function pickTheme(id: string) {
  document.documentElement.setAttribute("data-theme", id);
  try {
    localStorage.setItem("vv-theme", id);
  } catch {
    /* localStorage may be unavailable — theme still applies for this session */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, pick: pickTheme };
}

/**
 * THE theme picker: one disc that wears the current theme (its paper, its
 * accent, its glyph) and advances to the next on click. Direct selection with
 * names lives in the mobile menu's <ThemeList> — this button is the fast lane.
 */
export function ThemeCycleButton() {
  const { theme, pick } = useTheme();
  const [announce, setAnnounce] = useState("");

  const index = Math.max(
    0,
    THEMES.findIndex((t) => t.id === theme),
  );
  const current = THEMES[index];
  const next = THEMES[(index + 1) % THEMES.length];

  const cycle = () => {
    pick(next.id);
    setAnnounce(`${next.label} theme`);
  };

  return (
    <>
      <button
        type="button"
        onClick={cycle}
        title={`Theme: ${current.label} — click for ${next.label}`}
        aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
        suppressHydrationWarning
        className="group relative flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-control transition-transform hover:scale-105 active:scale-95"
        style={{ background: current.paper }}
      >
        <svg
          key={current.id}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          suppressHydrationWarning
          className="h-[19px] w-[19px] motion-safe:animate-[vv-glyph-in_0.25s_var(--ease-spring)]"
          style={{ stroke: current.accent }}
        >
          {GLYPHS[current.id]}
        </svg>
      </button>
      <span aria-live="polite" className="sr-only">
        {announce}
      </span>
    </>
  );
}

/** Labelled list for the mobile menu — full-width rows, 44px tap targets. */
export function ThemeList() {
  const { theme, pick } = useTheme();

  return (
    <div role="group" aria-label="Colour theme" className="flex flex-col gap-1">
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            aria-pressed={on}
            suppressHydrationWarning
            className={`flex min-h-11 items-center gap-3 rounded-btn px-2.5 text-left transition-colors ${
              on ? "bg-well" : "hover:bg-well"
            }`}
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-control"
              style={{ background: t.paper }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-[15px] w-[15px]"
                style={{ stroke: t.accent }}
              >
                {GLYPHS[t.id]}
              </svg>
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{t.label}</span>
              {/* ink-2: the selected row is well-tinted, where ink-3 dips below AA */}
              <span
                className={`block text-xs ${on ? "text-ink-2" : "text-ink-3"}`}
              >
                {t.note}
              </span>
            </span>
            {on ? <CheckIcon size={16} className="text-accent" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export default ThemeCycleButton;
