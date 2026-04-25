import { assert, test } from "./harness.js";
import { blockLabels, createBareDFS, replayAnimation } from "./shared.js";

test("DFS recursive emits canonical visit/recurse/complete blocks", () => {
  const algo = createBareDFS({ iterative: false, edges: [[0, 1], [1, 2]] });
  const animation = algo.doDFSRecursive(0);

  assert.equal(animation[0].label, "dfs recursive from 0");
  assert.ok(blockLabels(animation).includes("visit 0"));
  assert.ok(blockLabels(animation).includes("consider edge 0 -> 1"));
  assert.ok(blockLabels(animation).includes("recurse to 1"));
  assert.ok(blockLabels(animation).includes("return to 0"));
  assert.equal(blockLabels(animation).at(-1), "dfs complete");

  const state = replayAnimation(animation);
  assert.equal(state.message, "DFS complete. Search tree highlighted.");
});

test("DFS iterative emits stack-oriented blocks and replayed parent state", () => {
  const algo = createBareDFS({ iterative: true, edges: [[0, 1], [0, 2]] });
  const animation = algo.doDFSIterative(0);

  assert.equal(animation[0].label, "dfs iterative from 0");
  assert.ok(blockLabels(animation).includes("initialize stack with 0"));
  assert.ok(blockLabels(animation).includes("pop 0"));
  assert.ok(blockLabels(animation).includes("push 2"));
  assert.ok(blockLabels(animation).includes("finish 0"));

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(221).text[0], "0");
  assert.equal(state.objects.get(222).text[0], "0");
});
