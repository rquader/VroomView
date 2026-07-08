"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { signOutAction } from "@/lib/actions/auth";
import { MenuIcon, CloseIcon } from "@/components/ui/Icon";
import { ThemeList } from "@/components/ui/ThemeSwitcher";

const NAV = [
  { label: "Feed", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
  { label: "About", href: ROUTES.about },
  { label: "Propose a concept", href: ROUTES.submit },
];

/**
 * Small-screen navigation: a panel that drops beneath the masthead (a section
 * index, not a generic side sheet) holding the nav plus the full theme list —
 * so no functionality is desktop-only. Closes on navigation, Escape, or the
 * backdrop; scroll locks while open so the page doesn't drift underneath.
 */
export function MobileMenu({ username }: { username: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Route changed → the user navigated; close during render (the "adjust
  // state when props change" pattern — an effect here would double-render
  // and trips react-hooks/set-state-in-effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const panelRef = useDialogFocus<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // The trigger hides at md — if the viewport crosses that line while open,
  // close so the scroll lock can't outlive its visible UI.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost relative z-40 -mr-1.5 min-h-11 min-w-11 md:hidden"
      >
        {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-black/30 motion-safe:animate-[vv-fade-in_0.15s_ease]"
          />
          <div
            id={panelId}
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-page shadow-[var(--shadow-raise)] outline-none motion-safe:animate-[vv-drop-in_0.18s_var(--ease-out-soft)]"
          >
            <nav className="mx-auto max-w-6xl px-5 py-4 sm:px-8" aria-label="Site">
              <ul className="flex flex-col">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={`flex min-h-12 items-center border-b border-line font-serif text-xl tracking-[-0.01em] transition-colors hover:text-accent ${
                        pathname === item.href ? "text-accent" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="overline mt-5 mb-2">Palette</p>
              <ThemeList />

              <p className="overline mt-5 mb-2">Account</p>
              {username ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                  <span className="text-sm text-ink-2">
                    Signed in as{" "}
                    <span className="font-medium text-ink">@{username}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Link
                      href={ROUTES.account}
                      className="btn btn-ghost btn-sm min-h-10"
                    >
                      Account settings
                    </Link>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        name="scope"
                        value="local"
                        className="btn btn-secondary btn-sm min-h-10"
                      >
                        Sign out
                      </button>
                    </form>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 pb-2">
                  <Link href={ROUTES.login} className="btn btn-secondary btn-sm min-h-10">
                    Sign in
                  </Link>
                  <Link href={ROUTES.signup} className="btn btn-ghost btn-sm min-h-10">
                    Create account
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default MobileMenu;
