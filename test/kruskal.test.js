import { assert, test } from "./harness.js";
import { blockLabels, createBareKruskal, replayAnimation } from "./shared.js";

test("Kruskal doKruskal emits readable MST decision blocks and final highlighted edges", () => {
  const algo = createBareKruskal();
  const animation = algo.doKruskal("");

  assert.equal(animation[0].label, "run kruskal");
  assert.deepEqual(animation[0].meta.tags, ["mst", "kruskal"]);
  assert.ok(blockLabels(animation).includes("create edge list"));
  assert.ok(blockLabels(animation).includes("sort edges by weight"));
  assert.ok(blockLabels(animation).includes("consider edge 0-1"));
  assert.ok(blockLabels(animation).includes("add edge 0-1"));
  assert.ok(blockLabels(animation).includes("add edge 1-2"));
  assert.equal(blockLabels(animation).at(-1), "highlight mst");

  const state = replayAnimation(animation);
  assert.equal(state.edges.get("100->101").color, "#FF0000");
  assert.equal(state.edges.get("101->102").color, "#FF0000");
  assert.notEqual(state.edges.get("100->102")?.highlighted, true);
  assert.equal(state.edges.get("100->101").highlighted, true);
  assert.equal(state.edges.get("101->102").highlighted, true);
});
