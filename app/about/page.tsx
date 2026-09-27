import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/app";
import { ChevronDownIcon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About VroomView",
  description: "An independent community for vehicle concepts and discussion.",
};

const FAQS = [
  {
    question: "Do I need an account?",
    answer:
      "Anyone can browse. Create an account to share a concept, comment, or vote.",
  },
  {
    question: "What belongs in a concept?",
    answer:
      "A new vehicle or an improvement to an existing model, with your reasoning. Include a title, summary, body style, and at least one specification. Sketches are optional.",
  },
  {
    question: "How do votes work?",
    answer:
      "An upvote adds one to the score; a downvote subtracts one. You can change or withdraw your vote. Comment votes mark contributions you found useful.",
  },
  {
    question: "Are these real vehicles?",
    answer:
      "These are community proposals, not vehicles for sale or verified engineering specifications. VroomView is not affiliated with any vehicle manufacturer.",
  },
  {
    question: "Does it cost anything?",
    answer: "Browsing, posting concepts, commenting, and voting are free.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
        About VroomView
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
        VroomView is a community for proposing vehicles and discussing their
        design, cost, and engineering.
      </p>
      <section className="mt-12" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="section-heading">
          How it works
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            [
              "Share a concept",
              "Describe what you would change or create, and why. Add specifications and an optional sketch.",
            ],
            [
              "Discuss the details",
              "Ask questions, suggest changes, and add context in the comments. Topics help organize the discussion.",
            ],
            [
              "Vote",
              "Support concepts you like and comments you find useful. Scores help others browse the community’s ideas.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-line-2 pt-4">
              <h3 className="font-serif text-2xl font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-12" aria-labelledby="faq">
        <h2 id="faq" className="section-heading">
          Common questions
        </h2>
        <div className="mt-5">
          {FAQS.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDownIcon
                  size={16}
                  className="shrink-0 text-ink-3 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="max-w-2xl pb-5 text-sm leading-relaxed text-ink-2">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
      <section className="mt-12" aria-labelledby="team">
        <h2 id="team" className="section-heading">
          The team
        </h2>
        <p className="mt-4 leading-relaxed text-ink-2">
          VroomView is an independent project by Rafan Quader and Mahir Islam,
          Computer Science students at San José State University.
        </p>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={ROUTES.home} className="btn btn-secondary">
          Browse concepts
        </Link>
        <Link href={ROUTES.submit} className="btn btn-primary">
          Share a concept
        </Link>
      </div>
    </main>
  );
}
