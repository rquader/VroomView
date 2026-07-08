"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { signOutAction } from "@/lib/actions/auth";

/**
 * The signed-in disc: your initial in the masthead, opening a small sheet
 * with identity + the two sign-out scopes. "Sign out" ends THIS device's
 * session; "everywhere" revokes every session (the cross-device kill switch
 * — each device holds its own refresh token, so revocation is server-side).
 */
export function AccountMenu({
  username,
  displayName,
}: {
  username: string;
  displayName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  // navigation = a choice was made; put the menu away (render-adjust pattern)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account: @${username}`}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-well font-mono text-sm font-medium uppercase text-ink ring-1 ring-control transition-transform hover:scale-105"
      >
        {username.slice(0, 1)}
      </button>

      {open ? (
        <>
          {/* click-away catcher (below the panel, above the page) */}
          <button
            type="button"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            id={menuId}
            className="sheet absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden motion-safe:animate-[vv-drop-in_0.15s_var(--ease-out-soft)]"
          >
            <div className="border-b border-line bg-well/60 px-4 py-3">
              <p className="text-sm font-semibold">
                {displayName ?? `@${username}`}
              </p>
              <p className="dateline text-[10px] text-ink-2 normal-case">
                @{username}
              </p>
            </div>
            <div className="border-b border-line py-1.5">
              <Link
                href={ROUTES.account}
                className="flex min-h-10 items-center px-4 text-sm text-ink-2 transition-colors hover:bg-well hover:text-ink"
              >
                Account settings
              </Link>
            </div>
            <form action={signOutAction} className="flex flex-col py-1.5">
              <button
                type="submit"
                name="scope"
                value="local"
                className="min-h-10 px-4 text-left text-sm text-ink-2 transition-colors hover:bg-well hover:text-ink"
              >
                Sign out
              </button>
              <button
                type="submit"
                name="scope"
                value="global"
                title="Revokes your session on every device"
                className="min-h-10 px-4 text-left text-sm text-ink-2 transition-colors hover:bg-well hover:text-ink"
              >
                Sign out everywhere
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AccountMenu;
