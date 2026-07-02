import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * A tiny, cohesive, hand-built stroke-icon set (24-grid, 1.75 stroke, round caps).
 * Original SVGs — no icon-library dependency, no licensing concerns. Icons inherit
 * `currentColor`, so color them with text utilities.
 */
function Svg({
  size = 18,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const ChevronUpIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 14l7-6 7 6" />
  </Svg>
);

export const CommentIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4-4h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
  </Svg>
);

export const TagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 3H4a1 1 0 0 0-1 1v7l9 9 8-8-9-9z" />
    <path d="M7.5 7.5h.01" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const FunnelIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16l-6 7.5V19l-4-2v-4.5L4 5z" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const SortIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 5v14M8 5L4.5 8.5M8 5l3.5 3.5" />
    <path d="M16 19V5M16 19l-3.5-3.5M16 19l3.5-3.5" />
  </Svg>
);

export const SlidersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 6h14M5 12h14M5 18h14" />
    <circle cx="9" cy="6" r="2.2" fill="var(--card)" />
    <circle cx="15" cy="12" r="2.2" fill="var(--card)" />
    <circle cx="8" cy="18" r="2.2" fill="var(--card)" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 10l7 6 7-6" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
);
