import assert from "node:assert/strict";
import test from "node:test";
import { loadVoteControl } from "./helpers/vote-control";

test("pending upvote preserves other votes from refreshed server data", async () => {
  const control = await loadVoteControl();
  await control.press({ score: 0, viewerVote: 0 }, 1);

  assert.deepEqual(control.rebase({ score: 3, viewerVote: 0 }), {
    score: 4,
    viewerVote: 1,
  });
});

test("pending vote does not double-count when server data already contains it", async () => {
  const control = await loadVoteControl();
  await control.press({ score: 0, viewerVote: 0 }, 1);

  assert.deepEqual(control.rebase({ score: 4, viewerVote: 1 }), {
    score: 4,
    viewerVote: 1,
  });
});

test("directional voting toggles and switches with the correct score delta", async () => {
  const cases = [
    { vote: 0, direction: 1, score: 1, next: 1 },
    { vote: 0, direction: -1, score: -1, next: -1 },
    { vote: 1, direction: 1, score: -1, next: 0 },
    { vote: -1, direction: -1, score: 1, next: 0 },
    { vote: -1, direction: 1, score: 2, next: 1 },
    { vote: 1, direction: -1, score: -2, next: -1 },
  ] as const;
  for (const row of cases) {
    const control = await loadVoteControl();
    const state = { score: 0, viewerVote: row.vote };
    await control.press(state, row.direction);

    assert.deepEqual(control.rebase(state), {
      score: row.score,
      viewerVote: row.next,
    });
  }
});
