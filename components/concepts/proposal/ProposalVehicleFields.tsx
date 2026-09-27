import { useId } from "react";
import { COMMON_MAKES } from "@/constants/specs";
import type { ConceptDesign } from "@/types";
import { DesignStudio } from "../DesignStudio";

const BODY_STYLES = [
  "Sedan",
  "Minivan",
  "Wagon",
  "Coupe",
  "Truck",
  "Hatchback",
];

type ProposalVehicleFieldsProps = {
  bodyStyle: string;
  makeMode: "any" | "specific";
  make: string;
  design: ConceptDesign | null;
  onBodyStyleChange: (value: string) => void;
  onMakeModeChange: (mode: "any" | "specific") => void;
  onMakeChange: (value: string) => void;
  onDesignChange: (design: ConceptDesign | null) => void;
};

export function ProposalVehicleFields({
  bodyStyle,
  makeMode,
  make,
  design,
  onBodyStyleChange,
  onMakeModeChange,
  onMakeChange,
  onDesignChange,
}: ProposalVehicleFieldsProps) {
  const makerGroupId = useId();

  return (
    <fieldset>
      <legend className="ui-label mb-4 w-full border-b border-line pb-2.5">
        The vehicle
      </legend>
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="ui-label">
            Body style{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · required
            </span>
          </span>
          <input
            value={bodyStyle}
            onChange={(event) => onBodyStyleChange(event.target.value)}
            minLength={3}
            maxLength={24}
            required
            list="body-styles"
            placeholder="Wagon"
            className="field"
          />
          <datalist id="body-styles">
            {BODY_STYLES.map((style) => (
              <option key={style} value={style} />
            ))}
          </datalist>
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="ui-label" id={makerGroupId}>
            Who could make it?
          </span>
          <div
            role="radiogroup"
            aria-labelledby={makerGroupId}
            className="flex flex-wrap gap-2"
          >
            {(
              [
                ["any", "Any maker"],
                ["specific", "Name a maker"],
              ] as const
            ).map(([mode, label]) => (
              <label key={mode} className="cursor-pointer">
                <input
                  type="radio"
                  name="maker-mode"
                  value={mode}
                  checked={makeMode === mode}
                  onChange={() => onMakeModeChange(mode)}
                  className="peer sr-only"
                />
                <span
                  className={[
                    "inline-flex min-h-9 items-center rounded-btn border",
                    "border-control bg-card px-3 text-sm text-ink-2",
                    "transition-colors hover:text-ink peer-checked:border-accent",
                    "peer-checked:bg-accent/10 peer-checked:text-accent",
                    "peer-focus-visible:outline-2",
                    "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rubric",
                  ].join(" ")}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
          {makeMode === "specific" ? (
            <input
              value={make}
              onChange={(event) => onMakeChange(event.target.value)}
              minLength={2}
              maxLength={40}
              required
              list="common-makes"
              placeholder="e.g. Volvo"
              aria-label="Proposed maker name"
              className="field"
            />
          ) : null}
          <datalist id="common-makes">
            {COMMON_MAKES.map((maker) => (
              <option key={maker} value={maker} />
            ))}
          </datalist>
        </div>
        <DesignStudio design={design} onChange={onDesignChange} />
      </div>
    </fieldset>
  );
}
