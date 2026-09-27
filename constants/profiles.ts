/**
 * The board's vehicle profile geometry — shared vocabulary for the
 * <Silhouette> component, the Design Studio's skeleton library, and the
 * design renderer. All ORIGINAL abstract elevations (see "13 - Asset and
 * Licensing Policy"): generic body styles, never a specific vehicle.
 *
 * Path grammar is deliberately limited to M/L/Q/Z — the Lottie synthesizer
 * (lib/design/lottie.ts) and the animation generator promote quadratics to
 * cubics, and arcs would break both. Canvas: 96×40, wheel centers y=31.5.
 *
 * scripts/build-animations.mjs keeps its own copy of the hero/empty shapes
 * (it's a Node script, outside the TS graph) — keep in sync.
 */

export type Profile = {
  /** closed body outline, wheel arches included */
  body: string;
  /** closed daylight-opening (window band); "" for open-top profiles */
  dlo: string;
  /** pillar + door seams (roof-to-sill verticals) */
  seams: string[];
  /** small marks: lights, handles, cladding, bed/track lines */
  accents: string[];
  /** wheel centers (cy is always 31.5) */
  wheels: [number, number];
  /** tire radius — trucks and lifted profiles ride on taller rubber */
  wheelR: number;
};

export const PROFILES: Record<string, Profile> = {
  sedan: {
    body: "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.4 32.5,19.5 L34.5,19.3 L47,10.4 Q50,9.7 53,9.6 L66,9.6 Q70.5,9.8 73.5,11.2 L82,16.4 Q86.5,17 90.5,17.6 Q93,18 93,20 L93,27.5 Q93,31.5 90.5,33.5 L84.3,33.5 Q83.8,25.2 75.5,25.2 Q67.2,25.2 66.7,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M36.2,18.9 L47.6,10.9 Q50.2,10.5 53,10.4 L65.5,10.4 Q69.5,10.6 72.3,11.9 L80,16.2 L36.2,18.9 Z",
    seams: ["M58.5,10.4 L60,33", "M36.4,19.3 L37.4,33"],
    accents: [
      "M4,22.9 L10,22.3",
      "M89,18.4 L92.6,19.2",
      "M52,20.6 L56,20.5",
      "M62.5,20.5 L66.5,20.4",
    ],
    wheels: [20.5, 75.5],
    wheelR: 5.5,
  },
  minivan: {
    body: "M5.5,33.5 L4,31.5 Q3,30.5 3,28 L3,25.5 Q3,23.2 6.5,22.9 L9,22.7 Q14,22.1 19.5,21.4 L22.5,20.9 L37.5,7.6 Q39.5,6.1 42.5,6 L83,6 Q86.5,6.1 88.5,7.6 L91,10.5 Q92.8,12.7 93,17 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L29.3,33.5 Q28.8,25.2 20.5,25.2 Q12.2,25.2 11.7,33.5 Z",
    dlo: "M25.5,19.6 L38.5,8.2 Q40.3,7 42.8,7 L82.5,7 Q85.5,7.1 87,8.6 L89.5,11.5 Q90.8,13.2 91,16 L91.2,18 L64,18.9 L25.5,19.6 Z",
    seams: [
      "M47.5,7 L48.2,19.2",
      "M67.5,7 L68.2,18.8",
      "M48.2,19.4 L48.8,33",
      "M68.2,19 L68.8,33",
    ],
    accents: [
      "M69.5,23.8 L88.5,23.3",
      "M4,23.5 L9.5,23.1",
      "M52.5,21.4 L56.5,21.3",
      "M62.5,21.3 L66.5,21.2",
    ],
    wheels: [20.5, 75],
    wheelR: 5.5,
  },
  wagon: {
    body: "M5.5,33.5 L4,31 Q3,30 3,27.5 L3,25 Q3,22.6 6.5,22.2 L10.5,21.8 Q20,20.5 31,19.6 L33,19.4 L45,10.6 Q48,9.8 52.5,9.7 L83.5,10 Q86.3,10.2 87.7,11.8 L91.5,17.6 Q93,18.4 93,20.5 L93,27.5 Q93,31.5 90.5,33.5 L83.8,33.5 Q83.3,25.2 75,25.2 Q66.7,25.2 66.2,33.5 L28.8,33.5 Q28.3,25.2 20,25.2 Q11.7,25.2 11.2,33.5 Z",
    dlo: "M34.7,19 L45.8,11.2 Q48.5,10.5 52.5,10.4 L82.8,10.7 Q85.2,10.9 86.3,12.2 L89.7,17.3 L58,18.2 L34.7,19 Z",
    seams: ["M58,10.4 L59.5,33", "M79,10.6 L80,17.7", "M34.9,19.4 L35.9,33"],
    accents: [
      "M4,22.9 L10,22.3",
      "M89.5,18.6 L92.7,19.4",
      "M51,20.8 L55,20.7",
      "M62,20.6 L66,20.5",
    ],
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
    seams: [
      "M45.5,7 L46,15 L46.5,31.6",
      "M63.5,12.7 L63.8,31.8",
      "M91.5,13 L91.8,31.5",
    ],
    accents: ["M4.5,18.4 L9.5,18.1", "M52,17.3 L56,17.2", "M64,14.5 L92,14.5"],
    wheels: [18, 75.5],
    wheelR: 6.2,
  },
  hatchback: {
    body: "M13.5,33.5 L12,31 Q11,30 11,27.5 L11,25 Q11,22.7 14.5,22.3 L17.5,22 Q22.5,21.2 27.5,20.2 L29.5,19.8 L40.5,10.6 Q43,9.5 46.5,9.4 L63.5,9.4 Q67.5,9.8 69,11.3 L76,21.5 Q80,22.3 82.5,23 Q84.5,23.7 84.7,25.7 L85,29.5 Q85,32.5 82.5,33.4 L82.7,33.5 Q82.2,25.2 74.5,25.2 Q66.7,25.2 66.2,33.5 L34.8,33.5 Q34.3,25.2 26.5,25.2 Q18.7,25.2 18.2,33.5 Z",
    dlo: "M31.4,19.4 L41.4,11.1 Q43.7,10.3 46.5,10.2 L62.5,10.2 Q66,10.4 67.6,11.8 L74.2,20.7 L51,19.2 L31.4,19.4 Z",
    seams: ["M51.5,10.2 L52.5,33", "M31.6,19.8 L32.6,33"],
    accents: [
      "M12,23 L17,22.5",
      "M80.5,23.4 L84.2,26.8",
      "M45.5,21 L49.5,20.9",
      "M57.5,20.8 L61.5,20.7",
    ],
    wheels: [26.5, 74.5],
    wheelR: 5.5,
  },
};

/**
 * AI-drafted skeleton variants for the Design Studio — authored by an AI
 * assistant during development and labelled as such wherever they appear
 * (the studio picker and published sheets both surface the provenance).
 * Same original-geometry rules as the board profiles.
 */
export const AI_PROFILES: Record<string, Profile> = {
  "sport-sedan": {
    body: "M5.5,34 L4,31.5 Q3,30.5 3,28 L3,25.5 Q3,23.1 6.5,22.7 L10.5,22.3 Q20,21 33,19.7 L35.5,19.4 L48,11.9 Q51,11.1 54.5,11 L65,11 Q69.5,11.2 72.5,12.6 L81.5,17.4 Q86.5,18 90.5,18.4 Q93,18.8 93,20.6 L93,27.5 Q93,31.8 90.5,34 L84.3,34 Q83.8,25.6 75.5,25.6 Q67.2,25.6 66.7,34 L29.3,34 Q28.8,25.6 20.5,25.6 Q12.2,25.6 11.7,34 Z",
    dlo: "M37.2,19 L48.6,12.4 Q51.2,11.9 54.5,11.8 L64.5,11.8 Q68.5,12 71.3,13.3 L79.5,17.2 L37.2,19 Z",
    seams: ["M59.5,11.8 L61,33.5", "M37.4,19.4 L38.4,33.5"],
    accents: [
      "M4,23.4 L10,22.8",
      "M87,17.7 L92.5,18.2",
      "M53,21 L57,20.9",
      "M63.5,20.9 L67.5,20.8",
    ],
    wheels: [20.5, 75.5],
    wheelR: 5.8,
  },
  suv: {
    body: "M5.5,31.5 L4,29.5 Q3,28.5 3,26.5 L3,23.5 Q3,21.1 6.5,20.7 L10.5,20.3 Q19,19.2 29.5,18.4 L31.5,18.2 L43,9.6 Q46,8.5 50.5,8.4 L82.5,8.7 Q85.5,8.9 87,10.5 L91,15.9 Q93,16.7 93,18.7 L93,25.5 Q93,29.5 90.5,31.5 L84.6,31.5 Q84.1,23.4 75.5,23.4 Q66.9,23.4 66.4,31.5 L29.6,31.5 Q29.1,23.4 20.5,23.4 Q11.9,23.4 11.4,31.5 Z",
    dlo: "M33.2,17.8 L43.8,10.2 Q46.5,9.5 50.5,9.4 L81.8,9.7 Q84.4,9.9 85.5,11.2 L89.2,16 L56,16.9 L33.2,17.8 Z",
    seams: [
      "M56,9.4 L57.5,31.2",
      "M77.5,9.6 L78.5,16.4",
      "M33.4,18.2 L34.4,31.2",
    ],
    // lower-body cladding runs in segments so it never crosses the tires
    accents: [
      "M30,29.7 L66,29.7",
      "M84,29.7 L88.5,29.7",
      "M4,21.4 L10,20.9",
      "M50,19.4 L54,19.3",
      "M61,19.2 L65,19.1",
    ],
    wheels: [20.5, 75.5],
    wheelR: 6.3,
  },
  roadster: {
    body: "M10.5,34 L9,31.5 Q8,30.5 8,28.5 L8,26 Q8,23.8 11.5,23.5 L15.5,23.1 Q25,21.6 34,19.4 L36,19 L38.8,13.6 Q39.3,12.8 40.3,13 L41.3,13.2 L43.5,17.6 Q47,16.9 51,16.9 Q66,17 75,17.6 Q83.5,18.2 87.5,19 Q90,19.6 90,21.6 L90,27.5 Q90,31.8 87.5,34 L81.3,34 Q80.8,25.6 73,25.6 Q65.2,25.6 64.7,34 L32.3,34 Q31.8,25.6 24,25.6 Q16.2,25.6 15.7,34 Z",
    dlo: "M39.2,14.2 L40.8,14.4 L42.4,17.5 L39.8,17.8 Z",
    seams: ["M46.5,18 L47.5,33.5"],
    accents: [
      "M9,24 L14.5,23.4",
      "M85,19.6 L89.6,20.4",
      "M60,17.2 Q61.7,13.6 63.4,17.3",
      "M52,20.4 L56,20.3",
    ],
    wheels: [24, 72],
    wheelR: 5.6,
  },
  "trail-wagon": {
    body: "M5.5,32.5 L4,30.5 Q3,29.5 3,27 L3,24.5 Q3,22.1 6.5,21.7 L10.5,21.3 Q20,20 31,19.1 L33,18.9 L45,10.1 Q48,9.3 52.5,9.2 L83.5,9.5 Q86.3,9.7 87.7,11.3 L91.5,17.1 Q93,17.9 93,20 L93,26 Q93,30.5 90.5,32.5 L84.1,32.5 Q83.6,24.3 75,24.3 Q66.4,24.3 65.9,32.5 L29.1,32.5 Q28.6,24.3 20,24.3 Q11.4,24.3 10.9,32.5 Z",
    dlo: "M34.7,18.5 L45.8,10.7 Q48.5,10 52.5,9.9 L82.8,10.2 Q85.2,10.4 86.3,11.7 L89.7,16.8 L58,17.7 L34.7,18.5 Z",
    seams: ["M58,9.9 L59.5,32", "M79,10.1 L80,17.2", "M34.9,18.9 L35.9,32"],
    // cladding in segments, clear of both tires
    accents: [
      "M28.5,30.4 L67,30.4",
      "M83,30.4 L89,30.4",
      "M4,22.4 L10,21.8",
      "M51,20.3 L55,20.2",
      "M62,20.1 L66,20",
    ],
    wheels: [20, 75],
    wheelR: 6.0,
  },
};

/** One entry per skeleton the Design Studio offers, provenance included. */
export type Skeleton = {
  id: string;
  name: string;
  /** "board" = a canonical body-style profile; "ai" = AI-drafted variant */
  origin: "board" | "ai";
  profile: Profile;
};

export const SKELETONS: Skeleton[] = [
  ...Object.entries(PROFILES).map(([id, profile]) => ({
    id,
    name: id[0].toUpperCase() + id.slice(1),
    origin: "board" as const,
    profile,
  })),
  {
    id: "sport-sedan",
    name: "Sport sedan",
    origin: "ai" as const,
    profile: AI_PROFILES["sport-sedan"],
  },
  { id: "suv", name: "SUV", origin: "ai" as const, profile: AI_PROFILES.suv },
  {
    id: "roadster",
    name: "Roadster",
    origin: "ai" as const,
    profile: AI_PROFILES.roadster,
  },
  {
    id: "trail-wagon",
    name: "Trail wagon",
    origin: "ai" as const,
    profile: AI_PROFILES["trail-wagon"],
  },
];

export function skeletonById(id: string): Skeleton | null {
  return SKELETONS.find((s) => s.id === id) ?? null;
}

/** Loose mapping from free-text body styles to a drawn profile. */
export function profileFor(bodyStyle: string): Profile {
  const key = bodyStyle.trim().toLowerCase();
  if (key in PROFILES) return PROFILES[key];
  if (key.includes("van")) return PROFILES.minivan;
  if (key.includes("truck") || key.includes("pickup")) return PROFILES.truck;
  if (key.includes("wagon") || key.includes("estate")) return PROFILES.wagon;
  if (key.includes("coupe")) return PROFILES.coupe;
  if (key.includes("hatch") || key.includes("city")) return PROFILES.hatchback;
  if (key.includes("suv") || key.includes("crossover")) return AI_PROFILES.suv;
  if (
    key.includes("roadster") ||
    key.includes("convertible") ||
    key.includes("spider")
  )
    return AI_PROFILES.roadster;
  return PROFILES.sedan;
}
