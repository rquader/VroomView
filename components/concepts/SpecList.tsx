import type { SpecMetric } from "@/types";

/**
 * The "spec sheet" — VroomView's signature element. A proposal has numbers, so
 * numbers get the drafting treatment: each metric is set like a measured
 * callout on a technical drawing — quiet caps label, confident mono value, and
 * a dimension rule (hairline with end ticks) underneath. `hero` scales it up
 * for the concept page, where the spec IS the lead image. `lead` gives a card
 * its headline number: authors order their specs, so the first one is the
 * number that sells the concept — it reads larger, with an accent-tinted rule.
 */
export function SpecList({
  specs,
  size = "card",
  columns = "auto",
  lead = false,
}: {
  specs: SpecMetric[];
  size?: "card" | "hero";
  /** "auto" = responsive 2→4; 3 = always three-up (e.g. a three-stat strip) */
  columns?: "auto" | 3;
  /** emphasize the first spec as the headline number (card size only) */
  lead?: boolean;
}) {
  const hero = size === "hero";

  return (
    <dl
      className={
        columns === 3
          ? "grid grid-cols-3 gap-x-6 gap-y-3.5"
          : hero
            ? "grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4"
            : "grid grid-cols-2 gap-x-6 gap-y-3.5 min-[440px]:grid-cols-4"
      }
    >
      {specs.map((s, i) => {
        const isLead = lead && !hero && i === 0;
        return (
          <div key={s.label} className="min-w-0">
            <dt
              className={`ui-label ${hero ? "" : "text-[10px] tracking-[0.12em]"} ${
                isLead ? "text-accent" : ""
              }`}
            >
              {s.label}
            </dt>
            {/* values WRAP, never clip — a spec sheet that hides its numbers on
                a phone has failed at its one job */}
            <dd
              className={`mt-1 break-words font-mono font-medium tabular-nums text-ink ${
                hero
                  ? "text-[1.25rem] leading-tight sm:text-[1.45rem]"
                  : isLead
                    ? "text-[1.3rem] leading-tight"
                    : "text-[15px]"
              }`}
            >
              {s.value}
            </dd>
            <div
              className={`${isLead ? "dim-rule dim-rule-accent" : "dim-rule"} ${
                hero ? "mt-2.5" : "mt-2"
              }`}
              aria-hidden
            />
          </div>
        );
      })}
    </dl>
  );
}

export default SpecList;
