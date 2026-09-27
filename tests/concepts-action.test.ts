import assert from "node:assert/strict";
import test from "node:test";
import {
  createConceptsActionMock,
  loadConceptActions,
} from "./helpers/concepts-action";

const validInput = {
  title: "A practical electric wagon",
  summary: "A calm family vehicle with space, range, and repairable parts.",
  details: "",
  feasibility: "",
  bodyStyle: "Wagon",
  make: "",
  specs: [{ label: "Range", value: "320 mi" }],
  tags: ["Design"],
};

test("malformed proposal fields return errors before an insert", async () => {
  const { client, mock } = createConceptsActionMock();
  const actions = await loadConceptActions(client, mock.revalidated);

  const malformedText = await actions.createConcept({
    ...validInput,
    title: {},
  });
  const malformedSpecs = await actions.createConcept({
    ...validInput,
    specs: [null],
  });
  const malformedTopics = await actions.createConcept({
    ...validInput,
    tags: "Design",
  });

  assert.equal(malformedText.ok, false);
  assert.equal(malformedSpecs.ok, false);
  assert.equal(malformedTopics.ok, false);
  assert.deepEqual(mock.inserted, []);
  assert.deepEqual(mock.revalidated, []);
});

test("signed-out proposal creation stops before validation or insert", async () => {
  const { client, mock } = createConceptsActionMock(null);
  const actions = await loadConceptActions(client, mock.revalidated);

  const result = await actions.createConcept({ title: {} });

  assert.equal(result.ok, false);
  assert.deepEqual(mock.inserted, []);
});

test("a valid proposal uses the verified session user and unsafe designs are rejected", async () => {
  const { client, mock } = createConceptsActionMock("verified-user");
  const actions = await loadConceptActions(client, mock.revalidated);

  const invalidDesign = await actions.createConcept({
    ...validInput,
    design: {
      v: 1,
      kind: "studio",
      base: null,
      wheelScale: 1,
      rideHeight: 0,
      strokes: [{ d: "M0,0 <script>" }],
    },
  });
  const result = await actions.createConcept(validInput);

  assert.equal(invalidDesign.ok, false);
  assert.deepEqual(result, { ok: true, id: "concept-a" });
  assert.deepEqual(mock.inserted, [
    {
      author_id: "verified-user",
      title: validInput.title,
      summary: validInput.summary,
      details: null,
      feasibility: null,
      body_style: validInput.bodyStyle,
      make: null,
      design: null,
      specs: validInput.specs,
      tags: validInput.tags,
    },
  ]);
});
