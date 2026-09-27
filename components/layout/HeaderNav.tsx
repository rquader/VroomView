"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Desktop nav links. Client only because active state needs the pathname;
 * kept tiny so the masthead itself stays a Server Component.
 */
export function HeaderNav({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center md:flex" aria-label="Site">
      {items.map((item) => {
        const current = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`rounded-btn px-3 py-2 text-sm transition-colors ${
              current
                ? "bg-well font-medium text-ink"
                : "text-ink-2 hover:bg-well hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default HeaderNav;
