import assert from "node:assert/strict";
import { test } from "node:test";
import { filterConcepts, parseFeedFilters } from "../lib/domain/feed";
import type { ConceptSummary } from "../types";

const concept = (
  id: string,
  patch: Partial<ConceptSummary> = {},
): ConceptSummary => ({
  id,
  title: "An everyday electric wagon",
  summary: "A practical idea",
  make: null,
  bodyStyle: "Wagon",
  design: null,
  specs: [],
  tags: ["Design", "Price"],
  author: { id: "author", username: "driver", displayName: null },
  upvotes: 0,
  downvotes: 0,
  score: 0,
  comments: 0,
  viewerVote: 0,
  isOwn: false,
  postedAt: "2026-07-01T12:00:00.000Z",
  ...patch,
});

test("search combines with body style and every selected topic", () => {
  const items = [
    concept("match"),
    concept("wrong-body", { bodyStyle: "Coupe" }),
    concept("wrong-topic", { tags: ["Design"] }),
    concept("wrong-text", { title: "Delivery van" }),
  ];
  const result = filterConcepts(items, {
    query: "  ELECTRIC  ",
    body: "Wagon",
    tags: ["Design", "Price"],
    sort: "newest",
  });
  assert.deepEqual(
    result.map((item) => item.id),
    ["match"],
  );
});

test("sorts a copy, with newest breaking a score tie", () => {
  const items = [
    concept("old"),
    concept("new", { postedAt: "2026-07-02T12:00:00.000Z" }),
  ];
  assert.deepEqual(
    filterConcepts(items, {
      query: "",
      body: null,
      tags: [],
      sort: "popular",
    }).map((item) => item.id),
    ["new", "old"],
  );
  assert.deepEqual(
    items.map((item) => item.id),
    ["old", "new"],
  );
});

test("filter links reject unknown values and deduplicate topics", () => {
  const result = parseFeedFilters(
    new URLSearchParams(
      "body=wAgOn&tag=Design&tag=invalid&tag=Design&sort=bogus&q=solar",
    ),
    ["Wagon"],
  );
  assert.deepEqual(result, {
    body: "Wagon",
    tags: ["Design"],
    sort: "trending",
    query: "solar",
  });
});

test("empty collections are valid search results", () => {
  assert.deepEqual(
    filterConcepts([], { query: "", body: null, tags: [], sort: "trending" }),
    [],
  );
});
