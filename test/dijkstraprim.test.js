import { assert, test } from "./harness.js";
import { blockLabels, createBareDijkstraPrim, replayAnimation } from "./shared.js";

test("DijkstraPrim emits choose/known/path blocks for Dijkstra mode", () => {
  const algo = createBareDijkstraPrim({ runningDijkstra: true });
  const animation = algo.doDijkstraPrim(0);

  assert.equal(animation[0].label, "dijkstra from 0");
  assert.ok(blockLabels(animation).includes("select cheapest unknown 0"));
  assert.ok(blockLabels(animation).includes("choose vertex 0"));
  assert.ok(blockLabels(animation).includes("mark 0 known"));
  assert.ok(blockLabels(animation).includes("trace path for 1"));
  assert.ok(blockLabels(animation).includes("extend path for 1"));
  assert.equal(blockLabels(animation).at(-1), "algorithm complete");

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(221).text[0], "3");
  assert.equal(state.objects.get(231).text[0], "2");
});

test("DijkstraPrim emits tree-edge blocks for Prim mode", () => {
  const algo = createBareDijkstraPrim({ runningDijkstra: false });
  const animation = algo.doDijkstraPrim(0);

  assert.equal(animation[0].label, "prim from 0");
  assert.ok(blockLabels(animation).includes("select tree edge 2-1"));
  assert.equal(blockLabels(animation).at(-1), "algorithm complete");
});
