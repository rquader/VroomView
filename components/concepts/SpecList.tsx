import type { SpecMetric } from "@/types";

/**
 * The "spec sheet" — VroomView's signature element. A proposal has numbers, so
 * numbers get the drafting treatment: each metric is set like a measured
 * callout on a technical drawing — quiet caps label, confident mono value, and
 * a dimension rule (hairline with end ticks) underneath. `hero` scales it up
 * for the concept page, where the spec IS the lead image.
 */
export function SpecList({
  specs,
  size = "card",
}: {
  specs: SpecMetric[];
  size?: "card" | "hero";
}) {
  const hero = size === "hero";

  return (
    <dl
      className={
        hero
          ? "grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4"
          : "grid grid-cols-2 gap-x-6 gap-y-3.5 min-[440px]:grid-cols-4"
      }
    >
      {specs.map((s) => (
        <div key={s.label} className="min-w-0">
          <dt
            className={`overline ${hero ? "" : "text-[10px] tracking-[0.12em]"}`}
          >
            {s.label}
          </dt>
          <dd
            title={s.value}
            className={`mt-1 truncate font-mono font-medium tabular-nums text-ink ${
              hero ? "text-[1.45rem] leading-tight" : "text-[15px]"
            }`}
          >
            {s.value}
          </dd>
          <div className={`dim-rule ${hero ? "mt-2.5" : "mt-2"}`} aria-hidden />
        </div>
      ))}
    </dl>
  );
}

export default SpecList;
