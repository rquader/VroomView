import type { Concept } from "@/types";

/**
 * TEMPORARY mock data for UI drafting ONLY — this is not real data.
 *
 * When the `concepts` table + RLS exist, replace this with a real
 * `lib/services/concepts.service.ts` backed by Supabase and delete this file.
 * All examples are fictional and non-branded (no real manufacturers/models).
 */
export const MOCK_CONCEPTS: Concept[] = [
  {
    id: "c1",
    title: "Affordable AWD minivan proposal",
    summary:
      "A sub-$30k all-wheel-drive minivan for cold-climate families — sliding doors, a flat load floor, and a modest hybrid option instead of a giant battery.",
    details:
      "Cold-climate families keep getting pushed into three-row SUVs when a minivan does the job better: lower floor, sliding doors, more usable space. This proposal pairs standard AWD with a modest hybrid system — enough electric assist for efficiency and low-speed torque, without the cost and weight of a large pack. The target is a real starting price under $30k, not a base trim that becomes $45k once optioned.",
    author: "avery_lane",
    bodyStyle: "Minivan",
    specs: [
      { label: "Est. price", value: "$29,500" },
      { label: "Range", value: "560 mi" },
      { label: "Drivetrain", value: "AWD hybrid" },
      { label: "Seats", value: "7" },
    ],
    tags: ["Price", "Safety", "Environment"],
    votes: 214,
    comments: 38,
    postedAt: "2026-06-29T15:30:00Z",
  },
  {
    id: "c2",
    title: "Compact EV wagon concept",
    summary:
      "A small electric estate that prioritizes usable cargo height over a fastback roofline. Targeting real-world efficiency and a sane, repairable interior.",
    details:
      "Most 'EV wagons' are really jacked-up fastbacks that trade cargo height for a coupe roofline. This concept commits to a true estate profile: a long, tall, square load area you can actually stack boxes in. Efficiency and repairability come before 0–60 bragging rights, with a simple RWD layout and an interior designed to be fixed, not just replaced.",
    author: "nordwagen",
    bodyStyle: "Wagon",
    specs: [
      { label: "Est. price", value: "$34,000" },
      { label: "Range", value: "300 mi" },
      { label: "Drivetrain", value: "RWD" },
      { label: "Cargo", value: "38 cu ft" },
    ],
    tags: ["Environment", "Design", "Mileage"],
    votes: 176,
    comments: 52,
    postedAt: "2026-07-01T09:10:00Z",
  },
  {
    id: "c3",
    title: "Lightweight hybrid coupe redesign",
    summary:
      "Rethinking the affordable coupe around low mass: a small hybrid drivetrain, steel-and-aluminum body, and analog steering feel over screens.",
    details:
      "Affordable coupes died partly because they got heavy. This redesign starts from a mass budget: a small hybrid drivetrain, a mixed steel-and-aluminum body, and steering tuned for feel instead of a giant touchscreen. The goal is a genuinely fun, frugal two-door that a new grad could actually afford to buy and insure.",
    author: "gramsmatter",
    bodyStyle: "Coupe",
    specs: [
      { label: "Est. price", value: "$31,000" },
      { label: "Weight", value: "2,650 lb" },
      { label: "Drivetrain", value: "FWD hybrid" },
      { label: "0–60", value: "6.9 s" },
    ],
    tags: ["Performance", "Design", "Reliability"],
    votes: 143,
    comments: 41,
    postedAt: "2026-06-30T12:00:00Z",
  },
  {
    id: "c4",
    title: "Efficient small-truck package",
    summary:
      "A right-sized pickup for people who actually haul light loads: a real 5-ft bed, unibody ride, and a frugal hybrid — not a lifted highway cruiser.",
    details:
      "Most modern pickups are highway cruisers wearing work-truck styling. This package is deliberately small: a real five-foot bed, a car-like unibody ride, and a frugal hybrid drivetrain sized for light hauling — landscaping runs, home projects, bikes. Right-sized capability at a price that undercuts the midsize class.",
    author: "quarter_ton",
    bodyStyle: "Truck",
    specs: [
      { label: "Est. price", value: "$27,000" },
      { label: "Payload", value: "1,400 lb" },
      { label: "Drivetrain", value: "AWD hybrid" },
      { label: "Bed", value: "5 ft" },
    ],
    tags: ["Mileage", "Price", "Market fit"],
    votes: 261,
    comments: 63,
    postedAt: "2026-06-28T18:45:00Z",
  },
  {
    id: "c5",
    title: "Urban commuter hatch redesign",
    summary:
      "A tiny, tall city hatch built for tight parking and short trips — narrow footprint, big glass, swappable interior panels, and easy, cheap repairs.",
    details:
      "City driving punishes big cars. This hatch is built narrow and tall for tight parking and short trips, with big glass for visibility and a modest battery sized for real urban range rather than road-trip range. Swappable interior panels and cheap, standardized repairs keep it on the road — and out of the scrapyard — for longer.",
    author: "citypilot",
    bodyStyle: "Hatchback",
    specs: [
      { label: "Est. price", value: "$22,500" },
      { label: "Range", value: "180 mi" },
      { label: "Drivetrain", value: "FWD EV" },
      { label: "Length", value: "150 in" },
    ],
    tags: ["Price", "Environment", "Design"],
    votes: 98,
    comments: 27,
    postedAt: "2026-07-01T06:00:00Z",
  },
];
