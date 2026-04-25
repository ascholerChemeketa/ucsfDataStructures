import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareSkipList,
  replayAnimation,
} from "./shared.js";

test("SkipList insert/find/remove emit canonical milestone blocks", () => {
  const list = createBareSkipList();
  const insertAnimation = list.insertElement(10);
  const findAnimation = list.findElement(10);
  const removeAnimation = list.removeElement(10);

  assert.equal(insertAnimation[0].label, "insert 10");
  assert.ok(blockLabels(insertAnimation).includes("locate predecessors"));
  assert.ok(blockLabels(insertAnimation).includes("create tower for 10"));
  assert.equal(findAnimation[0].label, "find 10");
  assert.ok(blockLabels(removeAnimation).includes("remove complete 10"));

  const state = replayAnimation([...insertAnimation, ...findAnimation, ...removeAnimation]);
  assert.equal(list.valueSet.has(10), false);
  assert.equal(list.towerByValue.has(10), false);
});
