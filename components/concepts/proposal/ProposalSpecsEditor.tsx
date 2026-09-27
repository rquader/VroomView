import { useRef } from "react";
import { SPEC_PRESETS, specPlaceholder } from "@/constants/specs";
import { CloseIcon, PlusIcon } from "@/components/ui/Icon";
import type { SpecMetric } from "@/types";

type ProposalSpecsEditorProps = {
  specs: SpecMetric[];
  communityLabels: string[];
  onSpecChange: (index: number, patch: Partial<SpecMetric>) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onAddLabel: (label: string) => void;
};

export function ProposalSpecsEditor({
  specs,
  communityLabels,
  onSpecChange,
  onRemove,
  onAdd,
  onAddLabel,
}: ProposalSpecsEditorProps) {
  const labelInputs = useRef<(HTMLInputElement | null)[]>([]);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const usedLabels = new Set(
    specs.map((spec) => spec.label.trim().toLowerCase()),
  );
  const presets = SPEC_PRESETS.filter(
    (preset) => !usedLabels.has(preset.label.toLowerCase()),
  ).slice(0, 10);
  const community = communityLabels
    .filter((label) => !usedLabels.has(label.toLowerCase()))
    .slice(0, 6);

  const removeSpec = (index: number) => {
    onRemove(index);
    requestAnimationFrame(() => {
      if (index > 0) {
        labelInputs.current[index - 1]?.focus();
        return;
      }
      addButtonRef.current?.focus();
    });
  };

  return (
    <fieldset>
      <legend className="ui-label mb-4 w-full border-b border-line pb-2.5">
        The numbers
      </legend>
      <div className="flex flex-col gap-2.5">
        <span className="ui-label">
          Specifications{" "}
          <span className="normal-case tracking-normal text-ink-3">
            · at least one, up to 8
          </span>
        </span>
        {specs.map((spec, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              ref={(element) => {
                labelInputs.current[index] = element;
              }}
              value={spec.label}
              onChange={(event) =>
                onSpecChange(index, { label: event.target.value })
              }
              maxLength={24}
              list="spec-labels"
              placeholder="e.g. Payload"
              aria-label={`Specification ${index + 1} label`}
              className="field flex-1"
            />
            <input
              value={spec.value}
              onChange={(event) =>
                onSpecChange(index, { value: event.target.value })
              }
              maxLength={24}
              placeholder={specPlaceholder(spec.label)}
              aria-label={`Specification ${index + 1} value`}
              className="field flex-1 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => removeSpec(index)}
              aria-label={`Remove specification ${index + 1}`}
              className="btn btn-ghost min-h-10 min-w-10 shrink-0 px-2"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
        <datalist id="spec-labels">
          {SPEC_PRESETS.map((preset) => (
            <option key={preset.label} value={preset.label} />
          ))}
          {communityLabels.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
        {specs.length < 8 ? (
          <button
            ref={addButtonRef}
            type="button"
            onClick={onAdd}
            className="btn btn-secondary btn-sm min-h-9 self-start"
          >
            <PlusIcon size={14} />
            Add a specification
          </button>
        ) : null}
        {specs.length < 8 && presets.length > 0 ? (
          <SuggestionRow
            label="Quick add"
            labels={presets.map((preset) => preset.label)}
            onAdd={onAddLabel}
          />
        ) : null}
        {specs.length < 8 && community.length > 0 ? (
          <SuggestionRow
            label="Used by the community"
            labels={community}
            onAdd={onAddLabel}
          />
        ) : null}
      </div>
    </fieldset>
  );
}

function SuggestionRow({
  label,
  labels,
  onAdd,
}: {
  label: string;
  labels: string[];
  onAdd: (label: string) => void;
}) {
  return (
    <div className="mt-1.5">
      <p className="dateline mb-1.5 text-[10px]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {labels.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onAdd(item)}
            className="inline-flex min-h-8 items-center gap-1 rounded-btn border border-line bg-card px-2 text-xs text-ink-2 transition-colors hover:border-control hover:text-ink"
          >
            <PlusIcon size={11} />
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
