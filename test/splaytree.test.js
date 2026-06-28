import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareSplayTree,
  replayAnimation,
} from "./shared.js";

test("SplayTree insert/find/delete emit readable canonical blocks", () => {
  const tree = createBareSplayTree();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const findAnimation = tree.findElement(10);
  const deleteAnimation = tree.deleteElement(5);

  assert.deepEqual(blockLabels(insert10), ["insert 10", "create root"]);
  assert.ok(blockLabels(insert5).includes("insert node 5"));
  assert.equal(blockLabels(findAnimation).at(-1), "found 10");
  assert.equal(blockLabels(deleteAnimation).at(-1), "delete complete");

  const state = replayAnimation([...insert10, ...insert5, ...findAnimation]);
  assert.equal(state.message, "Element 10 found.");
});

test("SplayTree describe summarizes the current tree structure", () => {
  const tree = createBareSplayTree();
  tree.treeRoot = {
    data: 10,
    left: { data: 5, left: null, right: null },
    right: null,
  };

  assert.equal(
    tree.describe(),
    "Root is 10 has a left child 5. 5 has no children.",
  );
});

test("SplayTree describeFromState summarizes the replayed tree state", () => {
  const tree = createBareSplayTree();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const state = replayAnimation([...insert10, ...insert5]);

  assert.equal(
    tree.describeFromState(state),
    "Root is 5 has a right child 10. 10 has no children.",
  );
});
