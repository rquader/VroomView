"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { createConcept } from "@/lib/actions/concepts";
import type { ConceptTag, SpecMetric } from "@/types";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { SpecList } from "./SpecList";
import { TagFilterBar } from "./TagFilterBar";
import { Silhouette } from "@/components/ui/Silhouette";
import { ChevronUpIcon, CloseIcon, PlusIcon } from "@/components/ui/Icon";

const BODY_STYLES = ["Sedan", "Minivan", "Wagon", "Coupe", "Truck", "Hatchback"];
const DEFAULT_SPECS: SpecMetric[] = [
  { label: "Est. price", value: "" },
  { label: "Range", value: "" },
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
export function DraftingTable({ username }: { username: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [specs, setSpecs] = useState<SpecMetric[]>(DEFAULT_SPECS);
  const [tags, setTags] = useState<ConceptTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewTitleId = useId();
  const panelRef = useDialogFocus<HTMLDivElement>(previewOpen);

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
  const toggleTag = (tag: ConceptTag) =>
    setTags((cur) =>
      cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
    );

  const previewSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
  const headline = previewSpecs[0] ?? null;

  const file = () => {
    setError(null);
    startTransition(async () => {
      const result = await createConcept({
        title,
        summary,
        details,
        bodyStyle,
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

        {bodyStyle.trim() ? (
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

            <div className="flex flex-col gap-2.5">
              <span className="overline">Spec sheet (up to 8 rows)</span>
              {specs.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => setSpec(i, { label: e.target.value })}
                    maxLength={24}
                    placeholder="e.g. Payload"
                    aria-label={`Spec ${i + 1} label`}
                    className="field flex-1"
                  />
                  <input
                    value={s.value}
                    onChange={(e) => setSpec(i, { value: e.target.value })}
                    maxLength={24}
                    placeholder="e.g. 1,400 lb"
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
            </div>
          </div>
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
