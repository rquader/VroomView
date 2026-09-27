"use client";

import { useSyncExternalStore } from "react";
import { CheckIcon } from "@/components/ui/Icon";

/**
 * Curated themes (nature / car-studio inspired). Each maps to a token table in
 * styles/themes.css via data-theme on <html>. Order defines the cycle.
 */
const THEMES = [
  {
    id: "vellum",
    label: "Vellum",
    note: "Studio paper · petrol",
    paper: "#f2eee5",
    accent: "#0c5b5e",
  },
  {
    id: "moss",
    label: "Moss",
    note: "Stone · racing green",
    paper: "#eef0e8",
    accent: "#2f5d3a",
  },
  {
    id: "clay",
    label: "Clay",
    note: "Sand · terracotta",
    paper: "#f4ece1",
    accent: "#a5502f",
  },
  {
    id: "graphite",
    label: "Graphite",
    note: "Night studio",
    paper: "#1e1b15",
    accent: "#58c2b0",
  },
];

/**
 * The theme's color chip: a disc split on the 135° diagonal — paper above,
 * accent below — drawn as true SVG halves (crisper than a CSS gradient).
 * The seam is the paper showing through a hairline gap.
 */
function SwatchDisc({
  paper,
  accent,
  className,
}: {
  paper: string;
  accent: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <circle cx="12" cy="12" r="11.5" fill={paper} />
      {/* lower-right half: chord runs 45° corner-to-corner, arc sweeps clockwise */}
      <path
        d="M19.85 4.5 A11.5 11.5 0 0 1 4.5 19.85 Z"
        fill={accent}
        transform="translate(0.4 0.4)"
      />
    </svg>
  );
}

const THEME_EVENT = "vv-theme-change";

/**
 * Theme state shared across every consumer. The DOM attribute is the source
 * of truth — set before
 * paint by the no-flash script in layout.tsx. useSyncExternalStore hydrates
 * with the server snapshot ("vellum") and immediately reconciles to the real
 * client value, so instances can't drift.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
const getSnapshot = () => document.documentElement.dataset.theme || "vellum";
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

/** Cycles the four themes in their published order. */
export function ThemePicker() {
  const { theme, pick } = useTheme();
  const current = THEMES.find((item) => item.id === theme) ?? THEMES[0];
  const currentIndex = THEMES.findIndex((item) => item.id === current.id);
  const next = THEMES[(currentIndex + 1) % THEMES.length];

  return (
    <button
      type="button"
      onClick={() => pick(next.id)}
      aria-label={`Theme: ${current.label}. Switch to ${next.label}.`}
      title={`Theme: ${current.label}. Next: ${next.label}.`}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-well hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rubric"
    >
      <SwatchDisc
        paper={current.paper}
        accent={current.accent}
        className="h-6 w-6 rounded-full ring-1 ring-control"
      />
    </button>
  );
}

/** Labelled list for the mobile menu — full-width rows, 44px tap targets. */
export function ThemeList({ onPick }: { onPick?: () => void } = {}) {
  const { theme, pick } = useTheme();

  return (
    <div role="group" aria-label="Colour theme" className="flex flex-col gap-1">
      {THEMES.map((t) => {
        const on = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              pick(t.id);
              onPick?.();
            }}
            aria-pressed={on}
            suppressHydrationWarning
            className={`flex min-h-11 items-center gap-3 rounded-btn px-2.5 text-left transition-colors ${
              on ? "bg-well" : "hover:bg-well"
            }`}
          >
            <SwatchDisc
              paper={t.paper}
              accent={t.accent}
              className="h-7 w-7 shrink-0 rounded-full ring-1 ring-control"
            />
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

export default ThemePicker;
