import type { Metadata } from "next";
import { ALL_TAGS } from "@/constants/lenses";

export const metadata: Metadata = { title: "Propose a concept" };

/**
 * Placeholder proposal form. Intentionally non-functional (fields disabled,
 * nothing submits) — it previews the structured shape a real submission will
 * capture: the idea, the numbers, and the lenses it invites.
 */
export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        Draft a proposal
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em]">
        Propose a concept
      </h1>
      <p className="mt-3 leading-relaxed text-ink-2">
        Lay out the vehicle you think should exist — the idea, and the numbers
        that make it real.
      </p>

      <p className="note mt-6">
        Proposals open once accounts arrive. This is a preview of the form —
        nothing submits yet.
      </p>

      <form className="mt-10 flex flex-col gap-10">
        <fieldset>
          <legend className="overline mb-4 border-b border-line pb-2.5 w-full">
            The idea
          </legend>
          <div className="flex flex-col gap-5">
            <Field label="Title" placeholder="e.g. Compact EV wagon concept" />
            <Field
              label="Summary"
              placeholder="One or two sentences on the idea…"
              textarea
            />
            <Field
              label="The case for it"
              placeholder="Why should this exist? Who is it for, and what does the market keep getting wrong?"
              textarea
              rows={4}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="overline mb-4 border-b border-line pb-2.5 w-full">
            The numbers
          </legend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Body style" placeholder="Wagon" />
            <Field label="Estimated price" placeholder="$32,000" />
            <Field label="Range / mileage" placeholder="320 mi" />
            <Field label="Drivetrain" placeholder="AWD" />
            <Field label="Seats" placeholder="5" />
            <Field label="One more that matters" placeholder="Cargo — 38 cu ft" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="overline mb-4 border-b border-line pb-2.5 w-full">
            Lenses it invites
          </legend>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4">
            {ALL_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex min-h-9 cursor-not-allowed items-center gap-2.5 text-sm text-ink-3"
              >
                <input type="checkbox" disabled className="lens-check" />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center gap-4 border-t border-line pt-5">
          <button type="button" disabled className="btn btn-primary">
            Submit proposal
          </button>
          <span className="dateline">Opens with accounts</span>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  placeholder,
  textarea = false,
  rows = 3,
}: {
  label: string;
  placeholder: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="overline">{label}</span>
      {textarea ? (
        <textarea
          disabled
          rows={rows}
          placeholder={placeholder}
          className="field resize-none"
        />
      ) : (
        <input disabled placeholder={placeholder} className="field" />
      )}
    </label>
  );
}
