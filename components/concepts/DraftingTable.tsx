"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { createConcept } from "@/lib/actions/concepts";
import type { ConceptDesign, ConceptTag, SpecMetric } from "@/types";
import { ChevronUpIcon, CloseIcon } from "@/components/ui/Icon";
import { DesignStudio } from "./DesignStudio";
import { TagFilterBar } from "./TagFilterBar";
import { ProposalIdeaFields } from "./proposal/ProposalIdeaFields";
import { ProposalPreview } from "./proposal/ProposalPreview";
import { ProposalSpecsEditor } from "./proposal/ProposalSpecsEditor";
import { ProposalVehicleFields } from "./proposal/ProposalVehicleFields";

/** Owns the draft and submission flow; sections receive only the state they render. */
export function DraftingTable({
  username,
  communityLabels = [],
}: {
  username: string;
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
  const [specs, setSpecs] = useState<SpecMetric[]>([]);
  const [design, setDesign] = useState<ConceptDesign | null>(null);
  const [tags, setTags] = useState<ConceptTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [followPreview, setFollowPreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewTitleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const chosenMake = makeMode === "specific" ? make.trim() : "";
  const completeSpecs = specs.filter(
    (spec) => spec.label.trim() && spec.value.trim(),
  );

  useEffect(() => {
    if (!previewOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [previewOpen]);

  // The mobile trigger is hidden on desktop. Close an already-open preview
  // when crossing that boundary so its modal and scroll lock do not linger.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setPreviewOpen(false);
    };
    mediaQuery.addEventListener("change", onViewportChange);
    return () => mediaQuery.removeEventListener("change", onViewportChange);
  }, []);

  const setSpec = (index: number, patch: Partial<SpecMetric>) => {
    setSpecs((current) =>
      current.map((spec, itemIndex) =>
        itemIndex === index ? { ...spec, ...patch } : spec,
      ),
    );
  };
  const removeSpec = (index: number) => {
    setSpecs((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };
  const addSpec = () => {
    setSpecs((current) =>
      current.length >= 8 ? current : [...current, { label: "", value: "" }],
    );
  };
  const addLabelledSpec = (label: string) => {
    setSpecs((current) => {
      const blankIndex = current.findIndex(
        (spec) => !spec.label.trim() && !spec.value.trim(),
      );
      if (blankIndex >= 0) {
        return current.map((spec, index) =>
          index === blankIndex ? { ...spec, label } : spec,
        );
      }
      return current.length >= 8 ? current : [...current, { label, value: "" }];
    });
  };
  const toggleTag = (tag: ConceptTag) => {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };
  const shareConcept = () => {
    setError(null);
    const filedDesign =
      design && (design.base !== null || design.strokes.length > 0)
        ? design
        : null;

    startTransition(async () => {
      const result = await createConcept({
        title,
        summary,
        details,
        feasibility,
        bodyStyle,
        make: chosenMake,
        design: filedDesign,
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

  const preview = (
    <ProposalPreview
      username={username}
      title={title}
      summary={summary}
      bodyStyle={bodyStyle}
      make={chosenMake}
      design={design}
      specs={specs}
      tags={tags}
    />
  );

  return (
    <div className="pb-20 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pb-0">
      <form
        className="flex min-w-0 flex-col gap-6"
        onInvalidCapture={(event) => {
          // Native validation must be able to reveal and focus collapsed fields.
          let ancestor = (event.target as HTMLElement).parentElement;
          while (ancestor) {
            if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
            ancestor = ancestor.parentElement;
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          shareConcept();
        }}
      >
        <ProposalIdeaFields
          title={title}
          summary={summary}
          onTitleChange={setTitle}
          onSummaryChange={setSummary}
        />
        <details className="rounded-panel border border-line bg-card p-4 sm:p-5">
          <summary className="cursor-pointer font-medium">
            Add a sketch{" "}
            <span className="ml-2 text-sm font-normal text-ink-2">
              Optional
            </span>
          </summary>
          <p className="mt-2 text-sm text-ink-2">
            Start from a vehicle outline or draw your own. A rough sketch is
            enough.
          </p>
          <div className="mt-5">
            <DesignStudio design={design} onChange={setDesign} />
          </div>
        </details>
        <details className="rounded-panel border border-line bg-card p-4 sm:p-5">
          <summary className="cursor-pointer font-medium">
            Advanced details{" "}
            <span className="ml-2 text-sm font-normal text-ink-2">
              Optional
            </span>
          </summary>
          <p className="mt-2 text-sm text-ink-2">
            Vehicle, reasoning, specifications, and topics for feedback.
          </p>
          <div className="mt-6 flex flex-col gap-8">
            <ProposalVehicleFields
              bodyStyle={bodyStyle}
              makeMode={makeMode}
              make={make}
              onBodyStyleChange={setBodyStyle}
              onMakeModeChange={setMakeMode}
              onMakeChange={setMake}
            />
            <fieldset className="flex flex-col gap-5">
              <legend className="ui-label mb-4 w-full border-b border-line pb-2.5">
                Develop the idea · optional
              </legend>
              <label className="flex flex-col gap-1.5">
                <span className="ui-label">Why this should exist</span>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Who would use it? What problem does it solve?"
                  className="field resize-y"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="ui-label">How it could work</span>
                <textarea
                  value={feasibility}
                  onChange={(event) => setFeasibility(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Possible engineering, costs, and trade-offs. It is okay to have open questions."
                  className="field resize-y"
                />
              </label>
            </fieldset>
            <ProposalSpecsEditor
              specs={specs}
              communityLabels={communityLabels}
              onSpecChange={setSpec}
              onRemove={removeSpec}
              onAdd={addSpec}
              onAddLabel={addLabelledSpec}
            />
            <fieldset>
              <legend className="ui-label mb-4 w-full border-b border-line pb-2.5">
                Feedback topics · optional
              </legend>
              <p className="mb-3 text-sm text-ink-2">
                Choose the areas where you would most value feedback.
              </p>
              <TagFilterBar active={tags} onToggle={toggleTag} />
            </fieldset>
          </div>
        </details>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-4 border-t border-line pt-5">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Sharing…" : "Share a concept"}
          </button>
          <span className="dateline">Sharing as @{username}</span>
        </div>
      </form>

      <aside
        aria-label="Live preview"
        className={`hidden min-w-0 lg:block ${followPreview ? "lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto" : ""}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2.5">
          <p className="ui-label">Preview</p>
          <button
            type="button"
            aria-pressed={followPreview}
            onClick={() => setFollowPreview((current) => !current)}
            className="btn btn-ghost btn-sm min-h-11"
          >
            {followPreview ? "Keep at top" : "Follow as I scroll"}
          </button>
        </div>
        {preview}
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-page/95 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={previewOpen}
          className="flex min-h-11 w-full items-center gap-3"
        >
          <span className="ui-label shrink-0 text-[10px] text-accent">
            Preview
          </span>
          <span className="truncate text-sm font-medium">
            {title.trim() || (
              <span className="text-ink-3">Untitled concept</span>
            )}
          </span>
          <span className="dateline ml-auto shrink-0">
            {completeSpecs[0] ? (
              <span className="normal-case">{completeSpecs[0].value}</span>
            ) : (
              "Open"
            )}
          </span>
          <ChevronUpIcon size={16} className="shrink-0 text-ink-3" />
        </button>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={previewTitleId}
        onCancel={() => setPreviewOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPreviewOpen(false);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-black/30 p-0 text-ink backdrop:bg-transparent lg:hidden"
      >
        <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-line bg-page shadow-[var(--shadow-raise)] motion-safe:animate-[vv-slide-up_0.22s_var(--ease-out-soft)]">
          <div
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-2"
          />
          <div className="flex items-center justify-between px-5 pt-3 pb-3">
            <h2 id={previewTitleId} className="ui-label">
              Preview
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
            {preview}
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default DraftingTable;
