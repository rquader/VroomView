import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";
import { getViewer } from "@/lib/services/viewer.service";
import { PlusIcon } from "@/components/ui/Icon";
import { ThemePicker } from "@/components/ui/ThemeSwitcher";
import { HeaderNav } from "./HeaderNav";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";

const NAV = [
  { label: "Community", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
  { label: "About", href: ROUTES.about },
];

/**
 * Editorial masthead. Async Server Component: it reads the viewer once per
 * request (session cookie → getUser → profile) and renders the right account
 * affordance — the initial-disc menu when signed in, a quiet Sign in link
 * otherwise. Interactivity lives in small client children. Below md, nav +
 * themes + account move into <MobileMenu>; the Propose CTA never hides.
 */
export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8 md:py-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href={ROUTES.home}
            className="flex items-center gap-2.5 font-serif text-[1.7rem] font-semibold tracking-[-0.035em] text-ink"
          >
            <span className="brand-mark" aria-hidden>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
                <path
                  d="m3 5 5 14h3L6 5H3Zm10 0-3.5 9M21 5l-5 14h-3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {APP_NAME}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <HeaderNav items={NAV} />
          <ThemePicker />
          {/* icon-only below sm so the theme button always fits; label returns at sm */}
          <Link
            href={ROUTES.submit}
            className="btn btn-primary"
            aria-label="Share a concept"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Share a concept</span>
          </Link>
          {viewer ? (
            <AccountMenu
              username={viewer.username}
              displayName={viewer.displayName}
            />
          ) : (
            <Link
              href={ROUTES.login}
              className="btn btn-ghost hidden text-sm md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <MobileMenu username={viewer?.username ?? null} />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
