import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareConnectedComponent,
  replayAnimation,
} from "./shared.js";

test("ConnectedComponent emits major phase blocks across both DFS passes", () => {
  const algo = createBareConnectedComponent([[0, 1], [1, 0]]);
  const animation = algo.doCC();

  assert.equal(animation[0].label, "compute connected components");
  assert.ok(blockLabels(animation).includes("start first dfs pass"));
  assert.ok(blockLabels(animation).includes("pass 1 root 0"));
  assert.ok(blockLabels(animation).includes("transpose graph"));
  assert.ok(blockLabels(animation).includes("sort by finish time"));
  assert.ok(blockLabels(animation).includes("start component at 0"));
  assert.ok(blockLabels(animation).includes("visit 0"));
  assert.ok(blockLabels(animation).includes("finish 0"));

  const state = replayAnimation(animation);
  assert.equal(state.objects.has(algo.sortedLabelsIDs[0]), true);
});
