type ProposalIdeaFieldsProps = {
  title: string;
  summary: string;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
};

/** Renders the written rationale while the parent retains the draft. */
export function ProposalIdeaFields({
  title,
  summary,
  onTitleChange,
  onSummaryChange,
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
            placeholder="e.g. Honda Odyssey with four-wheel drive"
            className="field"
          />
          <span className="text-xs text-ink-3">8–90 characters</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            One-line pitch{" "}
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
            placeholder="e.g. A family van with all-wheel drive for snowy school runs."
            className="field resize-none"
          />
          <span className="text-xs text-ink-3">
            20–300 characters. Tell people what changes and why it matters.
          </span>
        </label>
      </div>
    </fieldset>
  );
}
