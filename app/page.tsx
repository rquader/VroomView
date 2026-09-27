import { FeedView } from "@/components/concepts/FeedView";
import { listConcepts } from "@/lib/services/concepts.service";
import { getViewer } from "@/lib/services/viewer.service";

export default async function HomePage() {
  const [concepts, viewer] = await Promise.all([listConcepts(), getViewer()]);
  return (
    <main className="page-shell pt-8 sm:pt-12">
      <FeedView concepts={concepts} signedIn={viewer !== null} />
    </main>
  );
}
