import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareTopoSortDFS,
  replayAnimation,
} from "./shared.js";

test("TopoSortDFS emits canonical DFS and topological ordering blocks", () => {
  const algo = createBareTopoSortDFS();
  const animation = algo.doTopoSortAction("");
  const labels = blockLabels(animation);

  assert.equal(animation[0].label, "topological sort");
  assert.ok(labels.includes("initialize topological order"));
  assert.ok(labels.includes("start dfs root 0"));
  assert.ok(labels.includes("visit 0"));
  assert.ok(labels.includes("check edge 0 -> 1"));
  assert.ok(labels.includes("recurse 0 -> 1"));
  assert.ok(labels.includes("finish 2"));
  assert.equal(labels.at(-1), "topological sort complete");
  assert.equal(algo.topoOrderArrayL.length, 3);

  const state = replayAnimation(animation);
  assert.equal(state.message, "Topological sort complete.");
});
