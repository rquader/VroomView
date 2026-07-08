/**
 * The drafting table's spec vocabulary — developer-curated presets with
 * value placeholders that match their label (a "Range" row should suggest
 * miles, not pounds). Constants, not component state: the service layer
 * excludes these when deriving community-used labels, so both sides need
 * one source of truth. Labels obey the DB bound (≤ 24 chars).
 */
export type SpecPreset = { label: string; placeholder: string };

export const SPEC_PRESETS: SpecPreset[] = [
  { label: "Est. price", placeholder: "e.g. $32,000" },
  { label: "Range", placeholder: "e.g. 320 mi" },
  { label: "Powertrain", placeholder: "e.g. Hybrid" },
  { label: "Drivetrain", placeholder: "e.g. AWD" },
  { label: "0–60", placeholder: "e.g. 6.4 s" },
  { label: "Top speed", placeholder: "e.g. 130 mph" },
  { label: "Horsepower", placeholder: "e.g. 280 hp" },
  { label: "Torque", placeholder: "e.g. 310 lb-ft" },
  { label: "Curb weight", placeholder: "e.g. 3,100 lb" },
  { label: "Payload", placeholder: "e.g. 1,400 lb" },
  { label: "Towing", placeholder: "e.g. 5,000 lb" },
  { label: "Seats", placeholder: "e.g. 5" },
  { label: "Cargo", placeholder: "e.g. 38 cu ft" },
  { label: "Battery", placeholder: "e.g. 75 kWh" },
  { label: "Charge time", placeholder: "e.g. 25 min (10–80%)" },
  { label: "MPG", placeholder: "e.g. 42 mpg" },
  { label: "Wheelbase", placeholder: "e.g. 112 in" },
  { label: "Length", placeholder: "e.g. 185 in" },
];

/** Preset labels, for datalists and for excluding from community suggestions. */
export const SPEC_PRESET_LABELS = SPEC_PRESETS.map((p) => p.label);

/** The value placeholder that matches a label; a neutral example otherwise. */
export function specPlaceholder(label: string): string {
  const key = label.trim().toLowerCase();
  return (
    SPEC_PRESETS.find((p) => p.label.toLowerCase() === key)?.placeholder ??
    "e.g. 1,400 lb"
  );
}

/**
 * Common manufacturers for the "proposed maker" datalist. Plain nominative
 * use of the names (who should build it) — no marks, no logos; see the
 * asset policy note. Free text is still allowed: the list assists, it
 * doesn't gate.
 */
export const COMMON_MAKES = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ferrari",
  "Fiat",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Polestar",
  "Porsche",
  "Ram",
  "Rivian",
  "Rolls-Royce",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];
