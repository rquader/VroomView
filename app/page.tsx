import Link from "next/link";
import { FeedView } from "@/components/concepts/FeedView";
import { listConcepts } from "@/lib/services/concepts.service";
import { getViewer } from "@/lib/services/viewer.service";
import { ROUTES } from "@/constants/app";

export default async function HomePage() {
  const [concepts, viewer] = await Promise.all([listConcepts(), getViewer()]);
  return (
    <main className="page-shell pt-7 sm:pt-9">
      <section className="mb-7 flex flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:pb-7">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-[2.75rem]">
            Community
          </h1>
        </div>
        <Link
          href={ROUTES.about}
          className="shrink-0 self-start text-sm text-accent underline decoration-accent/40 underline-offset-4 sm:self-auto"
        >
          About VroomView
        </Link>
      </section>
      <FeedView
        concepts={concepts}
        signedIn={viewer !== null}
        viewerName={viewer?.displayName || viewer?.username}
      />
    </main>
  );
}
