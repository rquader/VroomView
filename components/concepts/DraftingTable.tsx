"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { createConcept } from "@/lib/actions/concepts";
import {
  COMMON_MAKES,
  SPEC_PRESETS,
  specPlaceholder,
} from "@/constants/specs";
import type { ConceptDesign, ConceptTag, SpecMetric } from "@/types";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { DesignPlate } from "./DesignPlate";
import { DesignStudio } from "./DesignStudio";
import { SpecList } from "./SpecList";
import { TagFilterBar } from "./TagFilterBar";
import { Silhouette } from "@/components/ui/Silhouette";
import { ChevronUpIcon, CloseIcon, PlusIcon } from "@/components/ui/Icon";

const BODY_STYLES = ["Sedan", "Minivan", "Wagon", "Coupe", "Truck", "Hatchback"];
// powertrain (how it's powered) and drivetrain (which wheels) are separate
// facts — the defaults teach the distinction by asking for both
const DEFAULT_SPECS: SpecMetric[] = [
  { label: "Est. price", value: "" },
  { label: "Range", value: "" },
  { label: "Powertrain", value: "" },
  { label: "Drivetrain", value: "" },
];

/**
 * The drafting table: form on the left, a LIVE preview sheet rendering exactly
 * what the board will show (same SpecList, same anatomy) — the preview isn't a
 * mockup, it's the card. On lg+ it rides sticky beside the form. Below lg the
 * form used to bury it a full scroll away, so phones get a pinned draft strip
 * instead: title + headline number always in view, expanding into a bottom
 * sheet with the full preview. Filing calls createConcept and lands on the
 * real page.
 */
export function DraftingTable({
  username,
  communityLabels = [],
}: {
  username: string;
  /** spec labels the board's authors actually use (server-derived, ranked) */
  communityLabels?: string[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [feasibility, setFeasibility] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [makeMode, setMakeMode] = useState<"any" | "specific">("any");
  const [make, setMake] = useState("");
  const [specs, setSpecs] = useState<SpecMetric[]>(DEFAULT_SPECS);
  const [design, setDesign] = useState<ConceptDesign | null>(null);
  const [tags, setTags] = useState<ConceptTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewTitleId = useId();
  const makerGroupId = useId();
  const panelRef = useDialogFocus<HTMLDivElement>(previewOpen);

  const chosenMake = makeMode === "specific" ? make.trim() : "";

  // bottom-sheet housekeeping (same pattern as LensDrawer): Escape closes,
  // the page behind doesn't scroll, and crossing into lg closes it because
  // its trigger strip disappears there.
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setPreviewOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
      document.documentElement.style.overflow = "";
    };
  }, [previewOpen]);

  const setSpec = (i: number, patch: Partial<SpecMetric>) =>
    setSpecs((cur) => cur.map((s, n) => (n === i ? { ...s, ...patch } : s)));
  const removeSpec = (i: number) =>
    setSpecs((cur) => cur.filter((_, n) => n !== i));
  const addSpec = () =>
    setSpecs((cur) =>
      cur.length >= 8 ? cur : [...cur, { label: "", value: "" }],
    );
  // quick-add: fill the first blank row before growing the sheet
  const addLabelledSpec = (label: string) =>
    setSpecs((cur) => {
      const blank = cur.findIndex((s) => !s.label.trim() && !s.value.trim());
      if (blank >= 0)
        return cur.map((s, n) => (n === blank ? { ...s, label } : s));
      return cur.length >= 8 ? cur : [...cur, { label, value: "" }];
    });
  const toggleTag = (tag: ConceptTag) =>
    setTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const usedLabels = new Set(specs.map((s) => s.label.trim().toLowerCase()));
  const presetSuggestions = SPEC_PRESETS.filter(
    (p) => !usedLabels.has(p.label.toLowerCase()),
  ).slice(0, 10);
  const communitySuggestions = communityLabels
    .filter((l) => !usedLabels.has(l.toLowerCase()))
    .slice(0, 6);

  const previewSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
  const headline = previewSpecs[0] ?? null;

  const file = () => {
    setError(null);
    startTransition(async () => {
      const result = await createConcept({
        title,
        summary,
        details,
        feasibility,
        bodyStyle,
        make: chosenMake,
        design,
        specs,
        tags,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(ROUTES.concept(result.id));
    });
  };

  // The one preview, rendered in two homes: the lg rail and the phone sheet.
  const previewSheet = (
    <div className="sheet overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-4 py-2">
        <span className="overline text-[10px] text-ink-2">Draft sheet</span>
        <span className="dateline text-[10px] text-ink-2">Unfiled</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="font-semibold uppercase tracking-[0.14em] text-accent">
            {bodyStyle.trim() || "Body style"}
          </span>
          <span className="dateline">
            just now · <span className="normal-case">@{username}</span>
            {chosenMake ? (
              <>
                {" "}
                · for <span className="normal-case">{chosenMake}</span>
              </>
            ) : null}
          </span>
        </div>
        <h2 className="mt-2.5 font-serif text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
          {title.trim() || <span className="text-ink-3">Untitled proposal</span>}
        </h2>
        <p className="mt-1.5 leading-relaxed text-ink-2">
          {summary.trim() || (
            <span className="text-ink-3">
              The summary lands here — the one-breath version of the idea.
            </span>
          )}
        </p>

        {design ? (
          /* the author's own design outranks the generic body-style plate */
          <div className="mt-4 rounded-[8px] border border-line bg-well/60 px-4 pt-3 pb-2">
            <DesignPlate
              design={design}
              className="mx-auto h-auto w-full max-w-[190px] text-ink-2"
            />
          </div>
        ) : bodyStyle.trim() ? (
          <div className="mt-4 rounded-[8px] border border-line bg-well/60 px-4 pt-3 pb-2">
            <Silhouette
              bodyStyle={bodyStyle}
              className="mx-auto h-auto w-full max-w-[190px] text-ink-2"
            />
          </div>
        ) : null}

        {previewSpecs.length > 0 ? (
          <div className="mt-5">
            <SpecList specs={previewSpecs} lead />
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-3">
            Numbers appear here as measured callouts.
          </p>
        )}

        {tags.length > 0 ? (
          <div className="mt-5 border-t border-line pt-3.5 text-[11px] uppercase tracking-wide text-ink-3">
            {tags.join(" · ")}
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="pb-20 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pb-0">
      <form
        className="flex flex-col gap-10"
        onSubmit={(e) => {
          e.preventDefault();
          file();
        }}
      >
        <fieldset>
          <legend className="overline mb-4 w-full border-b border-line pb-2.5">
            The idea
          </legend>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="overline">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={90}
                placeholder="e.g. Compact EV wagon concept"
                className="field"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="overline">Summary</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="One or two sentences on the idea…"
                className="field resize-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="overline">The case for it</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Why should this exist? Who is it for, and what does the market keep getting wrong?"
                className="field resize-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="overline">
                The production case{" "}
                <span className="normal-case tracking-normal text-ink-3">
                  · optional
                </span>
              </span>
              <textarea
                value={feasibility}
                onChange={(e) => setFeasibility(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Why could this actually be built? Existing platforms, parts-bin components, a price that pencils out…"
                className="field resize-none"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="overline mb-4 w-full border-b border-line pb-2.5">
            The numbers
          </legend>
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="overline">Body style</span>
              <input
                value={bodyStyle}
                onChange={(e) => setBodyStyle(e.target.value)}
                maxLength={24}
                list="body-styles"
                placeholder="Wagon"
                className="field"
              />
              <datalist id="body-styles">
                {BODY_STYLES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>

            {/* who should build it — "any maker" is a real answer, so it gets
                a real control instead of a meaningfully-empty text field */}
            <div className="flex flex-col gap-1.5">
              <span className="overline" id={makerGroupId}>
                Proposed maker
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
                      onChange={() => setMakeMode(mode)}
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-9 items-center rounded-btn border border-control bg-card px-3 text-sm text-ink-2 transition-colors hover:text-ink peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rubric">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              {makeMode === "specific" ? (
                <>
                  <input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    maxLength={40}
                    list="common-makes"
                    placeholder="e.g. Volvo"
                    aria-label="Proposed maker name"
                    className="field"
                  />
                  <datalist id="common-makes">
                    {COMMON_MAKES.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="overline">Spec sheet (up to 8 rows)</span>
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => setSpec(i, { label: e.target.value })}
                    maxLength={24}
                    list="spec-labels"
                    placeholder="e.g. Payload"
                    aria-label={`Spec ${i + 1} label`}
                    className="field flex-1"
                  />
                  <input
                    value={s.value}
                    onChange={(e) => setSpec(i, { value: e.target.value })}
                    maxLength={24}
                    // the value hint follows the label: Range suggests miles,
                    // not the same "1,400 lb" for every row
                    placeholder={specPlaceholder(s.label)}
                    aria-label={`Spec ${i + 1} value`}
                    className="field flex-1 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    aria-label={`Remove spec row ${i + 1}`}
                    className="btn btn-ghost min-h-10 min-w-10 shrink-0 px-2"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
              ))}
              <datalist id="spec-labels">
                {SPEC_PRESETS.map((p) => (
                  <option key={p.label} value={p.label} />
                ))}
                {communityLabels.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              {specs.length < 8 ? (
                <button
                  type="button"
                  onClick={addSpec}
                  className="btn btn-secondary btn-sm min-h-9 self-start"
                >
                  <PlusIcon size={14} />
                  Add a number
                </button>
              ) : null}

              {/* the measured vocabulary, one tap away — presets first, then
                  labels the community has already used */}
              {specs.length < 8 && presetSuggestions.length > 0 ? (
                <div className="mt-1.5">
                  <p className="dateline mb-1.5 text-[10px]">Quick add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {presetSuggestions.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => addLabelledSpec(p.label)}
                        className="inline-flex min-h-8 items-center gap-1 rounded-btn border border-line bg-card px-2 text-xs text-ink-2 transition-colors hover:border-control hover:text-ink"
                      >
                        <PlusIcon size={11} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {specs.length < 8 && communitySuggestions.length > 0 ? (
                <div className="mt-1">
                  <p className="dateline mb-1.5 text-[10px]">
                    Seen on the board
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {communitySuggestions.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => addLabelledSpec(l)}
                        className="inline-flex min-h-8 items-center gap-1 rounded-btn border border-line bg-card px-2 text-xs text-ink-2 transition-colors hover:border-control hover:text-ink"
                      >
                        <PlusIcon size={11} />
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="overline mb-4 w-full border-b border-line pb-2.5">
            The design bay{" "}
            <span className="normal-case tracking-normal text-ink-3">
              · optional
            </span>
          </legend>
          <DesignStudio design={design} onChange={setDesign} />
        </fieldset>

        <fieldset>
          <legend className="overline mb-4 w-full border-b border-line pb-2.5">
            Lenses it invites
          </legend>
          <TagFilterBar active={tags} onToggle={toggleTag} />
        </fieldset>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-4 border-t border-line pt-5">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Filing…" : "File this proposal"}
          </button>
          <span className="dateline">Files as @{username}</span>
        </div>
      </form>

      {/* lg+: the drawing forming beside your hand */}
      <aside
        aria-label="Live preview"
        className="hidden lg:sticky lg:top-24 lg:block"
      >
        <p className="overline mb-3 border-b border-line pb-2.5">
          Live preview — how it files
        </p>
        {previewSheet}
      </aside>

      {/* below lg: the pinned draft strip — the preview stays one thumb away */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={previewOpen}
          className="flex min-h-11 w-full items-center gap-3"
        >
          <span className="overline shrink-0 text-[10px] text-accent">
            Draft
          </span>
          <span className="truncate text-sm font-medium">
            {title.trim() || <span className="text-ink-3">Untitled proposal</span>}
          </span>
          <span className="dateline ml-auto shrink-0">
            {headline ? (
              <span className="normal-case">{headline.value}</span>
            ) : (
              "preview"
            )}
          </span>
          <ChevronUpIcon size={16} className="shrink-0 text-ink-3" />
        </button>
      </div>

      {previewOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/30 motion-safe:animate-[vv-fade-in_0.15s_ease]"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={previewTitleId}
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-line bg-page shadow-[var(--shadow-raise)] outline-none motion-safe:animate-[vv-slide-up_0.22s_var(--ease-out-soft)]"
          >
            <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-2" />
            <div className="flex items-center justify-between px-5 pt-3 pb-3">
              <h2 id={previewTitleId} className="overline">
                Live preview — how it files
              </h2>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
                className="btn btn-ghost -mr-2 min-h-11 min-w-11"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {previewSheet}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DraftingTable;
