import assert from "node:assert/strict";
import test from "node:test";
import {
  parseConceptTags,
  parseSpecs,
  parseVoteDirection,
} from "../lib/domain/concept-mapping";

test("keeps only known concept tags and well-formed spec metrics", () => {
  assert.deepEqual(parseConceptTags(["Design", "Not a lens", "Safety"]), [
    "Design",
    "Safety",
  ]);
  assert.deepEqual(
    parseSpecs([
      { label: "Range", value: "320 mi" },
      { label: "Power" },
      "not a metric",
    ]),
    [{ label: "Range", value: "320 mi" }],
  );
});

test("accepts only the three stored vote directions", () => {
  assert.equal(parseVoteDirection(1), 1);
  assert.equal(parseVoteDirection(-1), -1);
  assert.equal(parseVoteDirection(0), 0);
  assert.equal(parseVoteDirection(2), null);
});
