import { useId } from "react";
import { COMMON_MAKES } from "@/constants/specs";

const BODY_STYLES = [
  "Sedan",
  "SUV",
  "Crossover",
  "Van",
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
  onBodyStyleChange: (value: string) => void;
  onMakeModeChange: (mode: "any" | "specific") => void;
  onMakeChange: (value: string) => void;
};

export function ProposalVehicleFields({
  bodyStyle,
  makeMode,
  make,
  onBodyStyleChange,
  onMakeModeChange,
  onMakeChange,
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
              · optional
            </span>
          </span>
          <input
            value={bodyStyle}
            onChange={(event) => onBodyStyleChange(event.target.value)}
            minLength={3}
            maxLength={24}
            list="body-styles"
            placeholder="Choose a style, or leave it open"
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
            Brand
          </span>
          <div
            role="radiogroup"
            aria-labelledby={makerGroupId}
            className="flex flex-wrap gap-2"
          >
            {(
              [
                ["any", "Any brand"],
                ["specific", "Specific brand"],
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
                    "inline-flex min-h-11 items-center rounded-btn border",
                    "border-control bg-card px-3 text-sm text-ink-2",
                    "transition-colors hover:text-ink peer-checked:border-accent",
                    "peer-checked:bg-well peer-checked:text-ink",
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
              list="common-makes"
              placeholder="e.g. Honda"
              aria-label="Existing or proposed brand"
              className="field"
            />
          ) : null}
          <datalist id="common-makes">
            {COMMON_MAKES.map((maker) => (
              <option key={maker} value={maker} />
            ))}
          </datalist>
        </div>
      </div>
    </fieldset>
  );
}
