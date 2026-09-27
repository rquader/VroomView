import { ALL_TAGS } from "@/constants/lenses";
import type { ConceptSummary, ConceptTag } from "@/types";
import { controversyScore, hotScore, referenceClock } from "@/utils/rank";

export const FEED_SORTS = [
  {
    key: "trending",
    label: "Trending",
    description: "Recent ideas gaining support",
  },
  { key: "newest", label: "Newest", description: "The latest ideas" },
  {
    key: "popular",
    label: "Top rated",
    description: "Highest community score",
  },
  {
    key: "discussed",
    label: "Most discussed",
    description: "The busiest conversations",
  },
  {
    key: "controversial",
    label: "Most debated",
    description: "Ideas with split opinions",
  },
  { key: "oldest", label: "Oldest", description: "Start at the beginning" },
  {
    key: "unpopular",
    label: "Lowest rated",
    description: "Lowest community score",
  },
] as const;

export type FeedSort = (typeof FEED_SORTS)[number]["key"];
export type FeedFilters = {
  query: string;
  body: string | null;
  tags: ConceptTag[];
  sort: FeedSort;
};

/** URL state is validated against the vocabulary and the available body styles. */
export function parseFeedFilters(
  params: URLSearchParams,
  bodyStyles: string[],
): FeedFilters {
  const body = params.get("body");
  const sort =
    FEED_SORTS.find((option) => option.key === params.get("sort"))?.key ??
    "trending";
  const tags = ALL_TAGS.filter((tag) => params.getAll("tag").includes(tag));
  return {
    query: params.get("q")?.slice(0, 120) ?? "",
    body:
      bodyStyles.find((style) => style.toLowerCase() === body?.toLowerCase()) ??
      null,
    tags,
    sort,
  };
}

/** Pure selection makes feed behavior testable without React or a database. */
export function filterConcepts(
  concepts: ConceptSummary[],
  filters: FeedFilters,
): ConceptSummary[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = concepts.filter(
    (concept) =>
      (!filters.body || concept.bodyStyle === filters.body) &&
      filters.tags.every((tag) => concept.tags.includes(tag)) &&
      (!query ||
        [
          concept.title,
          concept.summary,
          concept.make,
          concept.bodyStyle,
          concept.author.username,
          concept.author.displayName,
        ].some((value) => value?.toLowerCase().includes(query))),
  );
  const newest = (a: ConceptSummary, b: ConceptSummary) =>
    b.postedAt.localeCompare(a.postedAt) || a.id.localeCompare(b.id);
  const reference = referenceClock(concepts);
  const comparisons: Record<
    FeedSort,
    (a: ConceptSummary, b: ConceptSummary) => number
  > = {
    trending: (a, b) =>
      hotScore(b, reference) - hotScore(a, reference) || newest(a, b),
    newest,
    oldest: (a, b) => -newest(a, b),
    popular: (a, b) => b.score - a.score || newest(a, b),
    unpopular: (a, b) => a.score - b.score || newest(a, b),
    discussed: (a, b) => b.comments - a.comments || newest(a, b),
    controversial: (a, b) =>
      controversyScore(b) - controversyScore(a) || newest(a, b),
  };
  return filtered.sort(comparisons[filters.sort]);
}
