"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/ui/Icon";

// Curated themes (nature / car-inspired). Each maps to a token table in
// globals.css via data-theme on <html>. Swatch preview = paper + accent.
const THEMES = [
  { id: "vellum", label: "Vellum", note: "Studio paper · petrol", paper: "#f2eee5", accent: "#0c5b5e" },
  { id: "moss", label: "Moss", note: "Stone · racing green", paper: "#eef0e8", accent: "#2f5d3a" },
  { id: "clay", label: "Clay", note: "Sand · terracotta", paper: "#f4ece1", accent: "#a5502f" },
  { id: "graphite", label: "Graphite", note: "Night studio", paper: "#1e1b15", accent: "#58c2b0" },
];

const THEME_EVENT = "vv-theme-change";

/**
 * Theme state shared across every switcher instance (masthead swatches AND the
 * mobile-menu list render at once). The DOM attribute is the source of truth —
 * set before paint by the no-flash script in layout.tsx — and instances sync
 * through a custom event instead of duplicated useState islands.
 */
function useTheme() {
  const [theme, setThemeState] = useState<string>(() =>
    typeof document !== "undefined"
      ? document.documentElement.dataset.theme || "vellum"
      : "vellum",
  );

  useEffect(() => {
    const sync = () =>
      setThemeState(document.documentElement.dataset.theme || "vellum");
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const pick = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem("vv-theme", id);
    } catch {
      /* localStorage may be unavailable — theme still applies for this session */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return { theme, pick };
}

/** Compact swatch row for the masthead (pointer-first surfaces). */
export function ThemeSwitcher() {
  const { theme, pick } = useTheme();

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Colour theme"
    >
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => pick(t.id)}
          title={t.label}
          aria-label={`${t.label} theme`}
          aria-pressed={theme === t.id}
          suppressHydrationWarning
          className={`h-[22px] w-[22px] rounded-full transition-transform hover:scale-110 ${
            theme === t.id
              ? "ring-2 ring-accent ring-offset-2 ring-offset-page"
              : "ring-1 ring-control"
          }`}
          style={{
            background: `linear-gradient(135deg, ${t.paper} 0 50%, ${t.accent} 50% 100%)`,
          }}
        />
      ))}
    </div>
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
              className="h-6 w-6 shrink-0 rounded-full ring-1 ring-control"
              style={{
                background: `linear-gradient(135deg, ${t.paper} 0 50%, ${t.accent} 50% 100%)`,
              }}
            />
            <span className="flex-1">
              <span className="block text-sm font-medium">{t.label}</span>
              <span className="block text-xs text-ink-3">{t.note}</span>
            </span>
            {on ? <CheckIcon size={16} className="text-accent" /> : null}
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSwitcher;
