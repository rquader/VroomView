"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { signOutAction } from "@/lib/actions/auth";
import { MenuIcon, CloseIcon } from "@/components/ui/Icon";
import { ThemeList } from "@/components/ui/ThemeSwitcher";

const NAV = [
  { label: "Community", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
  { label: "About", href: ROUTES.about },
  { label: "Share a concept", href: ROUTES.submit },
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
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Route changed → the user navigated; close during render (the "adjust
  // state when props change" pattern — an effect here would double-render
  // and trips react-hooks/set-state-in-effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    if (!dialog || !panel) return;

    const updatePanelPosition = () => {
      const headerBottom =
        triggerRef.current?.closest("header")?.getBoundingClientRect().bottom ??
        0;
      panel.style.top = `${headerBottom}px`;
      panel.style.maxHeight = `calc(100dvh - ${headerBottom}px)`;
    };

    updatePanelPosition();
    dialog.showModal();
    window.addEventListener("resize", updatePanelPosition);
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
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
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost relative z-40 -mr-1.5 min-h-11 min-w-11 md:hidden"
      >
        {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-black/30 p-0 text-ink backdrop:bg-transparent md:hidden"
      >
        <div
          id={panelId}
          ref={panelRef}
          className="absolute inset-x-0 overflow-y-auto border-b border-line bg-page shadow-[var(--shadow-raise)] motion-safe:animate-[vv-drop-in_0.18s_var(--ease-out-soft)]"
        >
          <nav
            className="mx-auto max-w-6xl px-5 py-4 sm:px-8"
            aria-label="Site"
          >
            <div className="flex items-center justify-between gap-3 pb-2">
              <h2 id={titleId} className="ui-label">
                Menu
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="btn btn-ghost min-h-11 min-w-11"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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
            <p className="ui-label mt-5 mb-2">Appearance</p>
            <ThemeList />

            <p className="ui-label mt-5 mb-2">Account</p>
            {username ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <span className="text-sm text-ink-2">
                  Signed in as{" "}
                  <span className="font-medium text-ink">@{username}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Link
                    href={ROUTES.account}
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost btn-sm min-h-11"
                  >
                    Account settings
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      name="scope"
                      value="local"
                      className="btn btn-secondary btn-sm min-h-11"
                    >
                      Sign out
                    </button>
                  </form>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 pb-2">
                <Link
                  href={ROUTES.login}
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary btn-sm min-h-11"
                >
                  Sign in
                </Link>
                <Link
                  href={ROUTES.signup}
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-sm min-h-11"
                >
                  Create account
                </Link>
              </div>
            )}
          </nav>
        </div>
      </dialog>
    </>
  );
}

export default MobileMenu;
