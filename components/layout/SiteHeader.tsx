import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";
import { getViewer } from "@/lib/services/viewer.service";
import { ThemePicker } from "@/components/ui/ThemeSwitcher";
import { HeaderNav } from "./HeaderNav";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";

const NAV = [
  { label: "Community", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
  { label: "About", href: ROUTES.about },
];

/** Viewer data is request-scoped; interactive controls stay in client children. */
export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-8 md:py-4">
        <div className="flex min-w-0 items-baseline">
          <Link
            href={ROUTES.home}
            className="flex min-h-11 items-center font-serif text-[1.55rem] font-semibold tracking-[-0.035em] text-ink sm:text-[1.7rem]"
          >
            {APP_NAME}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <HeaderNav items={NAV} />
          <ThemePicker />
          <Link
            href={ROUTES.submit}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-3 text-sm sm:px-4 font-medium text-accent-ink transition-colors hover:bg-accent-2"
          >
            <span className="hidden sm:inline">Share a concept</span>
            <span className="sm:hidden">Share</span>
          </Link>
          {viewer ? (
            <div className="hidden md:block">
              <AccountMenu
                username={viewer.username}
                displayName={viewer.displayName}
              />
            </div>
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
