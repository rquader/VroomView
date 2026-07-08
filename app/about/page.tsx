import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { HeroSketch } from "@/components/animations/HeroSketch";
import { ChevronDownIcon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About",
  description:
    "What VroomView is, who's drafting it, and how the review board works.",
};

/**
 * The story page. The hero (headline + the animated elevation studies) moved
 * here from the feed so the home page can be the working board. Sections that
 * are still being written carry the register's own language for it — a
 * "To be issued" stamp — so placeholder copy reads as deliberate, not broken.
 */

/** dateline-styled stamp for sections whose copy is still being drafted */
function ToBeIssued() {
  return (
    <span className="dateline rounded-[4px] border border-line px-1.5 py-0.5 text-[10px] text-ink-3">
      To be issued
    </span>
  );
}

const STEPS = [
  {
    title: "File a proposal",
    body: "Lay out the car you think should exist — body style, proposed maker, and a measured spec sheet. Numbers first: a concept here is an argument, not a wish.",
  },
  {
    title: "Review through lenses",
    body: "Every concept invites review through named lenses — price, mileage, safety, design, and the rest — so the discussion stays on the drawing, not in the weeds.",
  },
  {
    title: "Back it — or red-pencil it",
    body: "Voting is directional. Backing stamps approval; a downvote is the reviewer's red pencil. The score is the argument's running balance.",
  },
];

const TEAM = [
  {
    name: "Rafan Quader",
    role: "SJSU Computer Science student",
    initial: "R",
    story:
      "Rafan is drafting VroomView end to end — the review board, the data model, and the drafting room it all lives in. His full story lands here soon.",
  },
  {
    name: "Mahir Islam",
    role: "SJSU Computer Science student · car enthusiast",
    initial: "M",
    story:
      "Mahir is the board's resident car enthusiast. Why he's here and what this place means to him — in his own words — is still being written.",
  },
];

const FAQS = [
  {
    q: "Is VroomView free?",
    a: "Yes. Browsing, filing proposals, voting, and arguing in the notes are all free — by design, not as a trial.",
  },
  {
    q: "Do I need an account?",
    a: "Browsing the board is open to everyone. Filing, voting, and posting notes need an account, so every idea has a name behind it.",
  },
  {
    q: "How is a concept's score counted?",
    a: "Backing a concept adds one; a red-pencil downvote subtracts one. The score you see is that running balance, and sorts like Trending and Most controversial read the two sides separately.",
  },
  {
    q: "Are these real cars?",
    a: "No — they're proposals. VroomView is independent and enthusiast-run, not affiliated with any manufacturer. Concepts are community arguments about what should exist.",
  },
  {
    q: "What's coming next?",
    a: "A design studio for drawing your concept's elevation, profile pages, and threaded discussions are all on the drafting table. This answer will age quickly — on purpose.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* faint graph-vellum grid behind the hero only */}
      <div
        aria-hidden
        className="drafting-grid pointer-events-none absolute inset-x-0 top-0 h-72"
      />

      {/* the hero that used to open the feed — this is its home now */}
      <section className="relative lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:gap-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            The proving ground
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.02em] sm:text-5xl">
            The cars that should exist, inspired by you.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
            An open review board for automotive concepts — proposals with real
            numbers, debated like a design review.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={ROUTES.submit} className="btn btn-primary">
              Propose a concept
            </Link>
            <Link href={ROUTES.home} className="btn btn-secondary">
              Browse the board
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md lg:mt-0 lg:max-w-none">
          <HeroSketch />
        </div>
      </section>

      {/* how the board works — the product's three verbs */}
      <section className="mt-16" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="overline border-b border-line pb-3">
          How the board works
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="sheet p-5">
              <span className="font-mono text-sm text-rubric">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-serif text-xl font-medium tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* the company — copy still being drafted, and honest about it */}
      <section className="mt-16" aria-labelledby="company">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 id="company" className="overline">
            About our company
          </h2>
          <ToBeIssued />
        </div>
        <div className="mt-6 max-w-3xl">
          <p className="leading-relaxed text-ink-2">
            VroomView is an independent, student-built review board — a place
            where the cars manufacturers keep not making get argued for
            properly. No affiliation, no ad deals with automakers, no pretending
            a rendering is a product.
          </p>
          <p className="note mt-4">
            The fuller company story — where this is going and why — is being
            drafted and will be issued here.
          </p>
        </div>
      </section>

      {/* the team — identity plates; both stories are placeholders for now */}
      <section className="mt-16" aria-labelledby="team">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 id="team" className="overline">
            About our team
          </h2>
          <ToBeIssued />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TEAM.map((member) => (
            <div key={member.name} className="sheet p-5">
              <div className="flex items-center gap-3.5">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-control bg-well font-serif text-lg font-semibold text-ink"
                >
                  {member.initial}
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-medium tracking-[-0.01em]">
                    {member.name}
                  </h3>
                  <p className="dateline mt-0.5">{member.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {member.story}
              </p>
              <p className="dateline mt-3 text-[10px]">
                Full story · to be issued
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — native disclosure, first honest answers */}
      <section className="mt-16" aria-labelledby="faq">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 id="faq" className="overline">
            FAQ
          </h2>
          <span className="dateline text-[10px]">
            First answers · more to be issued
          </span>
        </div>
        <div className="sheet mt-6 max-w-3xl overflow-hidden">
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              className={`group ${i > 0 ? "border-t border-line" : ""}`}
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-[15px] font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDownIcon
                  size={16}
                  className="shrink-0 text-ink-3 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-ink-2">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* closing CTA */}
      <section className="mt-16 border-t border-line pt-10 text-center">
        <h2 className="font-serif text-2xl font-medium tracking-[-0.01em]">
          Ready to argue a car into existence?
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href={ROUTES.submit} className="btn btn-primary">
            Propose a concept
          </Link>
          <Link href={ROUTES.explore} className="btn btn-ghost">
            Explore the catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}
