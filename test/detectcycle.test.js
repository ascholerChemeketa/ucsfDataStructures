import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareDetectCycle,
  replayAnimation,
} from "./shared.js";

test("DetectCycle emits cycle-found blocks and replayed cycle message", () => {
  const algo = createBareDetectCycle([[0, 1], [1, 2], [2, 1]]);
  const animation = algo.doDetectCycleAction();

  assert.equal(animation[0].label, "detect directed cycle");
  assert.ok(blockLabels(animation).includes("start dfs at 0"));
  assert.ok(blockLabels(animation).includes("visit 0"));
  assert.ok(blockLabels(animation).includes("recurse to 1"));
  assert.ok(blockLabels(animation).includes("back edge 2 -> 1"));
  assert.equal(blockLabels(animation).at(-1), "cycle detected");

  const state = replayAnimation(animation);
  assert.equal(
    state.message,
    "Cycle detected (found an edge to a node currently on the DFS stack).",
  );
});

test("DetectCycle emits no-cycle outcome for acyclic graphs", () => {
  const algo = createBareDetectCycle([[0, 1], [1, 2]]);
  const animation = algo.doDetectCycleAction();

  assert.ok(blockLabels(animation).includes("finish 2"));
  assert.equal(blockLabels(animation).at(-1), "no cycle found");
  assert.deepEqual(animation.at(-1).meta.tags, ["search", "cycle", "not-found"]);
});
