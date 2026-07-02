import type { SVGProps } from "react";

/**
 * Original blueprint-style body-style profiles ("elevations"), hand-drawn as
 * abstract single-stroke geometry — deliberately generic so they can't read as
 * any real vehicle (see "13 - Asset and Licensing Policy"). They inherit
 * currentColor, so context sets the ink. Used where a drawing earns its keep
 * (detail meta rail, explore, empty sheet) — feed cards stay typographic.
 */

type Profile = {
  /** closed body outline, drawn on a 96×40 canvas with its sill at y≈29 */
  body: string;
  /** one interior stroke — a belt line, door seam, or tailgate */
  detail: string;
  /** wheel centers (cy is always 31.5) */
  wheels: [number, number];
};

const PROFILES: Record<string, Profile> = {
  sedan: {
    body: "M3,29 L3,25.5 Q3,23.5 6,23 L15,21.5 L25,14.5 Q26.5,13.5 29,13.5 L54,13.5 Q57,13.5 59.5,15 L67,21 L85,23.5 Q93,24.5 93,26.5 L93,29 Z",
    detail: "M30,14 L28,21.5",
    wheels: [25, 73],
  },
  minivan: {
    body: "M3,29 L3,23 Q3,19.5 7,18.5 L12,17 L20,10 Q21.5,8.5 24,8.5 L78,8.5 Q84,8.5 87,11.5 L91,19 Q93,21 93,25 L93,29 Z",
    detail: "M57,9 L57,28",
    wheels: [24, 74],
  },
  wagon: {
    body: "M3,29 L3,25 Q3,22.5 6,22 L15,20.5 L24,13 Q25.5,12 28,12 L80,12 Q84,12 84.5,14.5 L85.5,26 Q85.7,29 82.5,29 Z",
    detail: "M62,12.5 L62,28",
    wheels: [25, 72],
  },
  coupe: {
    body: "M3,29 L3,26.5 Q3,24.5 6,24 L13,23 L24,15.5 Q26,14.5 29,14.5 L45,14.5 Q49,14.5 53,16 L88,24.5 Q93,25.5 93,27.5 L93,29 Z",
    detail: "M31,15 L28.5,23",
    wheels: [26, 74],
  },
  truck: {
    body: "M3,29 L3,24.5 Q3,22.5 6,22 L14,20.5 L22,12 Q23.5,11 26,11 L44,11 Q47,11 47,13.5 L47,19.5 L88,19.5 Q90,19.5 90,21.5 L90,29 Z",
    detail: "M87.5,20 L87.5,28.5",
    wheels: [24, 76],
  },
  hatchback: {
    body: "M3,29 L3,25.5 Q3,23 6,22.5 L14,21 L22,13 Q23.5,12 26,12 L58,12 Q61,12 63,14 L72,23.5 Q74,25.5 74,27.5 L74,29 Z",
    detail: "M50,12.5 L50,28",
    wheels: [22, 58],
  },
};

/** Loose mapping from free-text body styles to a drawn profile. */
function profileFor(bodyStyle: string): Profile {
  const key = bodyStyle.trim().toLowerCase();
  if (key in PROFILES) return PROFILES[key];
  if (key.includes("van")) return PROFILES.minivan;
  if (key.includes("truck") || key.includes("pickup")) return PROFILES.truck;
  if (key.includes("wagon") || key.includes("estate")) return PROFILES.wagon;
  if (key.includes("coupe")) return PROFILES.coupe;
  if (key.includes("hatch") || key.includes("city")) return PROFILES.hatchback;
  return PROFILES.sedan;
}

export function Silhouette({
  bodyStyle,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { bodyStyle: string }) {
  const p = profileFor(bodyStyle);
  return (
    <svg
      viewBox="0 0 96 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      <path d={p.body} />
      <path d={p.detail} strokeWidth={1.1} opacity={0.55} />
      {p.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={31.5} r={5.5} />
          <circle cx={cx} cy={31.5} r={1.4} fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export default Silhouette;
