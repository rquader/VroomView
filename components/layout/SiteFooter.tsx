import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants/app";

const FOOTER_NAV = [
  { label: "Feed", href: ROUTES.home },
  { label: "Explore", href: ROUTES.explore },
  { label: "About", href: ROUTES.about },
  { label: "Propose", href: ROUTES.submit },
];

/**
 * Colophon-style footer: wordmark, quiet nav, and the independence disclaimer
 * (reinforces the copyright stance — see "13 - Asset and Licensing Policy").
 */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-9 sm:px-8 md:flex-row md:items-baseline md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-5">
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-lg font-semibold tracking-[-0.02em]">
              {APP_NAME}
            </span>
            <span className="dateline">Concept review · Est. 2026</span>
          </div>
          <nav aria-label="Footer" className="flex items-center gap-1">
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-btn px-2 py-2 text-xs text-ink-3 transition-colors hover:bg-well hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-ink-3 md:text-right">
          Independent and enthusiast-run. Not affiliated with any vehicle
          manufacturer. Concepts are community proposals, not products.
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
