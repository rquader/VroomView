import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";
import { getViewer } from "@/lib/services/viewer.service";
import { PlusIcon } from "@/components/ui/Icon";
import { ThemeCycleButton } from "@/components/ui/ThemeSwitcher";
import { HeaderNav } from "./HeaderNav";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";

const NAV = [
  { label: "Feed", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
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
      <div className="h-[3px] bg-accent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8 md:py-3.5">
        <div className="flex min-w-0 items-baseline gap-3">
          <Link
            href={ROUTES.home}
            className="font-serif text-2xl font-semibold tracking-[-0.02em] text-ink"
          >
            {APP_NAME}
          </Link>
          <span className="dateline hidden lg:inline">
            Independent concept review
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <HeaderNav items={NAV} />
          <ThemeCycleButton />
          {/* icon-only below sm so the theme button always fits; label returns at sm */}
          <Link
            href={ROUTES.submit}
            className="btn btn-primary"
            aria-label="Propose a concept"
          >
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Propose</span>
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
