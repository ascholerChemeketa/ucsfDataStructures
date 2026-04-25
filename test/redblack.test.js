import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareRedBlack,
  replayAnimation,
} from "./shared.js";

test("RedBlack insertElement emits root creation blocks", () => {
  const tree = createBareRedBlack();
  const animation = tree.insertElement(10);

  assert.deepEqual(blockLabels(animation), ["insert 10", "start insert 10", "create root"]);
  assert.equal(animation[2].meta.focusNodeId, 3);

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(3).text, "10");
  assert.equal(state.edges.has("0->3"), true);
});

test("RedBlack find and delete emit readable outcome blocks", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const findAnimation = tree.findElement(5);
  const deleteAnimation = tree.deleteElement(5);

  assert.ok(blockLabels(findAnimation).includes("10: search left"));
  assert.ok(blockLabels(findAnimation).includes("found 5"));
  assert.ok(blockLabels(deleteAnimation).includes("start delete"));
  assert.equal(blockLabels(deleteAnimation).at(-1), "delete complete");

  const state = replayAnimation([...insert10, ...insert5, ...findAnimation, ...deleteAnimation]);
  assert.equal(state.message.trim(), "");
});
