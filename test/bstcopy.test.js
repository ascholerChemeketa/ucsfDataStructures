import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareBSTCopy,
  replayAnimation,
} from "./shared.js";

test("BSTCopy copyTree emits readable copy phases and replay creates mirrored copy root", () => {
  const bst = createBareBSTCopy();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const insert15 = bst.insertElement(15);
  const copyAnimation = bst.copyTree();

  assert.deepEqual(
    blockLabels(copyAnimation),
    [
      "copy tree",
      "start preorder copy",
      "copy node 10",
      "copy node 5",
      "attach left child of 10",
      "reveal left edge of 10",
      "copy node 15",
      "attach right child of 10",
      "prepare rootCopy pointer",
      "set rootCopy pointer",
    ],
  );
  assert.deepEqual(copyAnimation[0].meta.tags, ["copy"]);
  assert.deepEqual(copyAnimation[2].meta.tags, ["copy", "node"]);
  assert.deepEqual(copyAnimation[4].meta.tags, ["copy", "attach", "left"]);
  assert.deepEqual(copyAnimation[8].meta.tags, ["copy", "root"]);

  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...copyAnimation]);
  assert.equal(state.edges.has("0->4"), true);
  assert.equal(state.edges.has("4->5"), true);
  assert.equal(state.edges.has("4->6"), true);
  assert.equal(state.edges.has("2->7"), true);
  assert.equal(state.edges.has("7->8"), true);
  assert.equal(state.edges.has("7->9"), true);
  assert.equal(state.objects.get(7).text, "10");
  assert.equal(state.objects.get(8).text, "5");
  assert.equal(state.objects.get(9).text, "15");
});

test("BSTCopy copyTree reports empty source trees with explicit metadata", () => {
  const bst = createBareBSTCopy();
  const animation = bst.copyTree();

  assert.deepEqual(blockLabels(animation), ["copy tree", "source tree empty"]);
  assert.deepEqual(animation[1].meta.tags, ["copy", "empty"]);

  const state = replayAnimation(animation);
  assert.equal(state.message, "");
  assert.equal(state.edges.has("2->"), false);
});
