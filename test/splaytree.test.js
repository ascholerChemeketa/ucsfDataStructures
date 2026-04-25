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
