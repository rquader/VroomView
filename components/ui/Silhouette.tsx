import type { SVGProps } from "react";

/**
 * Original blueprint-style body-style profiles ("elevations"). Redrawn 2026-07
 * to real automotive proportions — correct wheelbase-to-length, wheels pushed
 * to the corners, a proper greenhouse (window band), wheel arches, door seams
 * and small marks (lights, handles) — while staying ORIGINAL single-stroke
 * geometry that reads as a generic body style, never a specific vehicle (see
 * "13 - Asset and Licensing Policy"). They inherit currentColor, so context
 * sets the ink.
 *
 * Path grammar is deliberately limited to M/L/Q/Z: scripts/build-animations.mjs
 * re-consumes these shapes for the hero Lottie and its parser promotes
 * quadratics to cubics — arcs would break it. Wheel arches are Q-pairs.
 * Canvas: 96×40, wheel centers at y=31.5.
 */

type Profile = {
  /** closed body outline, wheel arches included */
  body: string;
  /** closed daylight-opening (window band) */
  dlo: string;
  /** pillar + door seams (roof-to-sill verticals) */
  seams: string[];
  /** small marks: lights, handles, bed/track lines */
  accents: string[];
  /** wheel centers (cy is always 31.5) */
  wheels: [number, number];
  /** tire radius — trucks ride on taller rubber */
  wheelR: number;
};

const PROFILES: Record<string, Profile> = {
  sedan: {
    body: "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.4 32.5,19.5 L34.5,19.3 L47,10.4 Q50,9.7 53,9.6 L66,9.6 Q70.5,9.8 73.5,11.2 L82,16.4 Q86.5,17 90.5,17.6 Q93,18 93,20 L93,27.5 Q93,31.5 90.5,33.5 L84.3,33.5 Q83.8,25.2 75.5,25.2 Q67.2,25.2 66.7,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M36.2,18.9 L47.6,10.9 Q50.2,10.5 53,10.4 L65.5,10.4 Q69.5,10.6 72.3,11.9 L80,16.2 L36.2,18.9 Z",
    seams: ["M58.5,10.4 L60,33", "M36.4,19.3 L37.4,33"],
    accents: ["M4,22.9 L10,22.3", "M89,18.4 L92.6,19.2", "M52,20.6 L56,20.5", "M62.5,20.5 L66.5,20.4"],
    wheels: [20.5, 75.5],
    wheelR: 5.5,
  },
  minivan: {
    body: "M5.5,33.5 L4,31.5 Q3,30.5 3,28 L3,25.5 Q3,23.2 6.5,22.9 L9,22.7 Q14,22.1 19.5,21.4 L22.5,20.9 L37.5,7.6 Q39.5,6.1 42.5,6 L83,6 Q86.5,6.1 88.5,7.6 L91,10.5 Q92.8,12.7 93,17 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M25.5,19.6 L38.5,8.2 Q40.3,7 42.8,7 L82.5,7 Q85.5,7.1 87,8.6 L89.5,11.5 Q90.8,13.2 91,16 L91.2,18 L64,18.9 L25.5,19.6 Z",
    seams: ["M47.5,7 L48.2,19.2", "M67.5,7 L68.2,18.8", "M48.2,19.4 L48.8,33", "M68.2,19 L68.8,33"],
    accents: ["M69.5,23.8 L88.5,23.3", "M4,23.5 L9.5,23.1", "M52.5,21.4 L56.5,21.3", "M62.5,21.3 L66.5,21.2"],
    wheels: [20.5, 75],
    wheelR: 5.5,
  },
  wagon: {
    body: "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.5 31,19.6 L33,19.4 L45,10.6 Q48,9.8 52.5,9.7 L83.5,10 Q86.3,10.2 87.7,11.8 L91.5,17.6 Q93,18.4 93,20.5 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L28.8,33.5 Q28.3,25.2 20,25.2 Q11.7,25.2 11.2,33.5 Z",
    dlo: "M34.7,19 L45.8,11.2 Q48.5,10.5 52.5,10.4 L82.8,10.7 Q85.2,10.9 86.3,12.2 L89.7,17.3 L58,18.2 L34.7,19 Z",
    seams: ["M58,10.4 L59.5,33", "M79,10.6 L80,17.7", "M34.9,19.4 L35.9,33"],
    accents: ["M4,22.9 L10,22.3", "M89.5,18.6 L92.7,19.4", "M51,20.8 L55,20.7", "M62,20.6 L66,20.5"],
    wheels: [20, 75],
    wheelR: 5.5,
  },
  coupe: {
    body: "M7.5,34 L6,31.5 Q5,30.5 5,28.5 L5,25.5 Q5,23.3 8.5,23 L12.5,22.6 Q24,21 37,19.2 L39.5,18.9 L50.5,11.9 Q53.5,10.5 57,10.4 L60,10.4 Q63.5,10.6 66,11.9 Q71.5,14.9 77.5,16.4 L87,16.1 Q90.8,16.4 91,18.4 L91.5,26.5 Q91.5,30.8 89,33 L84.8,33.2 Q84.3,25 76,25 Q67.7,25 67.2,34 L30.3,34 Q29.8,25.4 21.5,25.4 Q13.2,25.4 12.7,34 Z",
    dlo: "M41.3,18.6 L51.3,12.1 Q54,11 57,10.9 L59.5,10.9 Q62.8,11.1 65.3,12.4 L74.5,16.9 L41.3,18.6 Z",
    seams: ["M62.5,17.9 L64.5,33.6"],
    accents: ["M6,23.6 L12,23", "M87.8,17 L91,17.8", "M55.5,19.9 L59.5,19.8"],
    wheels: [22, 76],
    wheelR: 5.7,
  },
  truck: {
    body: "M5,32 L4,30 Q3.5,29 3.5,27 L3.5,19.5 Q3.5,17.4 6.5,17.2 L24.5,16.3 Q26.5,16.1 27.5,15.4 L33.5,7.3 Q34.8,6 37.5,6 L59.5,6 Q62.2,6.2 62.7,8.5 L63.2,12.5 L91,12.5 Q93,12.7 93,14.7 L93,27 Q93,30.5 91,32 L84.5,32 Q84,25 76,25 Q68,25 67.5,32 L26.5,32 Q26,24.6 18,24.6 Q10,24.6 9.5,32 Z",
    dlo: "M29.8,15.2 L34.3,7.7 Q35.3,7 37.5,7 L58.7,7 Q61.2,7.2 61.6,9 L62,14.6 L44,14.9 L29.8,15.2 Z",
    seams: ["M45.5,7 L46,15 L46.5,31.6", "M63.5,12.7 L63.8,31.8", "M91.5,13 L91.8,31.5"],
    accents: ["M4.5,18.4 L9.5,18.1", "M52,17.3 L56,17.2", "M64,14.5 L92,14.5"],
    wheels: [18, 75.5],
    wheelR: 6.2,
  },
  hatchback: {
    body: "M13.5,33.5 L12,31 Q11,30 11,27.5 L11,25 Q11,22.7 14.5,22.3 L17.5,22 Q22.5,21.2 27.5,20.2 L29.5,19.8 L40.5,10.6 Q43,9.5 46.5,9.4 L63.5,9.4 Q67.5,9.8 69,11.3 L76,21.5 Q80,22.3 82.5,23 Q84.5,23.7 84.7,25.7 L85,29.5 Q85,32.5 82.5,33.4 L82.7,33.5 Q82.2,25.2 74.5,25.2 Q66.7,25.2 66.2,33.5 L34.8,33.5 Q34.3,25.2 26.5,25.2 Q18.7,25.2 18.2,33.5 Z",
    dlo: "M31.4,19.4 L41.4,11.1 Q43.7,10.3 46.5,10.2 L62.5,10.2 Q66,10.4 67.6,11.8 L74.2,20.7 L51,19.2 L31.4,19.4 Z",
    seams: ["M51.5,10.2 L52.5,33", "M31.6,19.8 L32.6,33"],
    accents: ["M12,23 L17,22.5", "M80.5,23.4 L84.2,26.8", "M45.5,21 L49.5,20.9", "M57.5,20.8 L61.5,20.7"],
    wheels: [26.5, 74.5],
    wheelR: 5.5,
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
  strokeWidth = 1.3,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { bodyStyle: string; strokeWidth?: number }) {
  const p = profileFor(bodyStyle);
  return (
    <svg
      viewBox="0 0 96 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      <path d={p.body} />
      {/* glass band a touch lighter than the body — how a draftsman would ink it */}
      <path d={p.dlo} strokeWidth={strokeWidth * 0.72} opacity={0.75} />
      {[...p.seams, ...p.accents].map((d) => (
        <path key={d} d={d} strokeWidth={strokeWidth * 0.7} opacity={0.5} />
      ))}
      {p.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={31.5} r={p.wheelR} />
          <circle
            cx={cx}
            cy={31.5}
            r={p.wheelR * 0.58}
            strokeWidth={strokeWidth * 0.77}
          />
          <circle cx={cx} cy={31.5} r={1} fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export default Silhouette;
