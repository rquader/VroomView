import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";
import { PlusIcon } from "@/components/ui/Icon";
import { ThemeCycleButton } from "@/components/ui/ThemeSwitcher";
import { HeaderNav } from "./HeaderNav";
import { MobileMenu } from "./MobileMenu";

const NAV = [
  { label: "Feed", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
];

/**
 * Editorial masthead. Server Component; interactivity lives in small client
 * children (nav active state, theme switcher, mobile menu). A thin accent rule
 * above a hairline border makes the "Oxford rule". Below md, nav + themes move
 * into <MobileMenu> — the Propose CTA never hides.
 */
export function SiteHeader() {
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
          <Link href={ROUTES.submit} className="btn btn-primary" aria-label="Propose a concept">
            <PlusIcon size={16} />
            <span className="hidden sm:inline">Propose</span>
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
