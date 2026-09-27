import assert from "node:assert/strict";
import test from "node:test";
import {
  createEngagementMock,
  loadEngagementActions,
} from "./helpers/engagement";

test("comment edits revalidate only the concept returned by the database", async () => {
  const { client, mock } = createEngagementMock({
    update: {
      data: { id: "comment-a", concept_id: "actual-concept" },
      error: null,
    },
  });
  const actions = await loadEngagementActions(client, mock.revalidated);

  const result = await actions.updateComment("comment-a", "Updated topic", [
    "Design",
  ]);

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(mock.revalidated, ["/concepts/actual-concept"]);
});

test("missing or unauthorized comment rows reject mutations without invalidation", async () => {
  const { client, mock } = createEngagementMock();
  const actions = await loadEngagementActions(client, mock.revalidated);

  const update = await actions.updateComment("missing", "Updated topic", [
    "Design",
  ]);
  const deletion = await actions.deleteComment("missing");

  assert.equal(update.ok, false);
  assert.equal(deletion.ok, false);
  assert.deepEqual(mock.revalidated, []);
});

test("comment-vote errors and absent comment relationships do not report success or invalidate", async () => {
  const missing = createEngagementMock();
  const missingActions = await loadEngagementActions(
    missing.client,
    missing.mock.revalidated,
  );
  const missingResult = await missingActions.setCommentVote("missing", true);

  assert.equal(missingResult.ok, false);
  assert.deepEqual(missing.mock.writes, []);
  assert.deepEqual(missing.mock.revalidated, []);

  const failed = createEngagementMock({
    lookup: { data: { concept_id: "actual-concept" }, error: null },
    vote: { data: null, error: { message: "write failed" } },
  });
  const failedActions = await loadEngagementActions(
    failed.client,
    failed.mock.revalidated,
  );
  const failedResult = await failedActions.setCommentVote("comment-a", true);

  assert.equal(failedResult.ok, false);
  assert.deepEqual(failed.mock.revalidated, []);
});

test("comment-vote desired state must be a boolean before any lookup or write", async () => {
  for (const desiredVoted of ["false", null, {}]) {
    const { client, mock } = createEngagementMock({
      lookup: { data: { concept_id: "actual-concept" }, error: null },
    });
    const actions = await loadEngagementActions(client, mock.revalidated);

    const result = await actions.setCommentVote("comment-a", desiredVoted);

    assert.equal(result.ok, false);
    assert.deepEqual(mock.writes, []);
    assert.deepEqual(mock.revalidated, []);
  }
});

test("comment-vote treats a duplicate insert as the desired existing vote", async () => {
  const { client, mock } = createEngagementMock({
    lookup: { data: { concept_id: "actual-concept" }, error: null },
    vote: { data: null, error: { code: "23505", message: "already exists" } },
  });
  const actions = await loadEngagementActions(client, mock.revalidated);

  const result = await actions.setCommentVote("comment-a", true);

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(mock.writes, ["vote:insert"]);
  assert.deepEqual(mock.revalidated, ["/concepts/actual-concept"]);
});

test("comment-vote removal scopes the deletion to the signed-in voter", async () => {
  const { client, mock } = createEngagementMock({
    lookup: { data: { concept_id: "actual-concept" }, error: null },
  });
  const actions = await loadEngagementActions(client, mock.revalidated);

  const result = await actions.setCommentVote("comment-a", false);

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(mock.scopes.slice(-2), [
    { table: "comment_votes", column: "comment_id", value: "comment-a" },
    { table: "comment_votes", column: "voter_id", value: "viewer" },
  ]);
});

test("malformed comment bodies and topics return errors before writes", async () => {
  const { client, mock } = createEngagementMock();
  const actions = await loadEngagementActions(client, mock.revalidated);

  const bodyResult = await actions.addComment("concept-a", { body: "nope" }, [
    "Design",
  ]);
  const tagsResult = await actions.addComment(
    "concept-a",
    "Valid comment",
    "Design",
  );

  assert.equal(bodyResult.ok, false);
  assert.equal(tagsResult.ok, false);
  assert.deepEqual(mock.writes, []);
  assert.deepEqual(mock.revalidated, []);
});
