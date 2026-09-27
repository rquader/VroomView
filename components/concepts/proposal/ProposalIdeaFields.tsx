type ProposalIdeaFieldsProps = {
  title: string;
  summary: string;
  details: string;
  feasibility: string;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onDetailsChange: (value: string) => void;
  onFeasibilityChange: (value: string) => void;
};

/** Renders the written rationale while the parent retains the draft. */
export function ProposalIdeaFields({
  title,
  summary,
  details,
  feasibility,
  onTitleChange,
  onSummaryChange,
  onDetailsChange,
  onFeasibilityChange,
}: ProposalIdeaFieldsProps) {
  return (
    <fieldset>
      <legend className="ui-label mb-4 w-full border-b border-line pb-2.5">
        The idea
      </legend>
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            Title{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · required
            </span>
          </span>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            minLength={8}
            maxLength={90}
            required
            placeholder="e.g. Compact EV wagon concept"
            className="field"
          />
          <span className="text-xs text-ink-3">8–90 characters</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            Summary{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · required
            </span>
          </span>
          <textarea
            value={summary}
            onChange={(event) => onSummaryChange(event.target.value)}
            rows={2}
            minLength={20}
            maxLength={300}
            required
            placeholder="One or two sentences on the idea…"
            className="field resize-none"
          />
          <span className="text-xs text-ink-3">
            20–300 characters. This is what people first read.
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            Why it should exist{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · optional
            </span>
          </span>
          <textarea
            value={details}
            onChange={(event) => onDetailsChange(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Who is it for, and what does the market keep getting wrong?"
            className="field resize-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            How it could be built{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · optional
            </span>
          </span>
          <textarea
            value={feasibility}
            onChange={(event) => onFeasibilityChange(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Existing platforms, parts-bin components, or a price that pencils out…"
            className="field resize-none"
          />
        </label>
      </div>
    </fieldset>
  );
}
