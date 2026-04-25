import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareTreap,
  replayAnimation,
} from "./shared.js";

function withRandomSequence(values, callback) {
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => values[Math.min(index++, values.length - 1)];
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

test("Treap insert emits priority, compare, and rotation blocks", () => {
  const tree = createBareTreap();
  const animations = withRandomSequence([0.2, 0.8], () => [
    tree.insertElement(10),
    tree.insertElement(5),
  ]);
  const labels = blockLabels(animations.flat());

  assert.ok(labels.includes("insert 10"));
  assert.ok(labels.includes("assign priority 200"));
  assert.ok(labels.includes("create root"));
  assert.ok(labels.includes("insert 5"));
  assert.ok(labels.includes("assign priority 800"));
  assert.ok(labels.includes("compare 5 with 10"));
  assert.ok(labels.includes("rotate right at 10"));
  assert.equal(tree.treeRoot.data, 5);

  const state = replayAnimation(animations.flat());
  assert.equal(state.objects.get(tree.treeRoot.graphicID).text, "5");
});

test("Treap find and delete emit outcome blocks", () => {
  const tree = createBareTreap();
  withRandomSequence([0.8, 0.2], () => {
    tree.insertElement(10);
    tree.insertElement(5);
  });

  const findAnimation = tree.findElement(5);
  const deleteAnimation = tree.deleteElement(5);
  const findLabels = blockLabels(findAnimation);
  const deleteLabels = blockLabels(deleteAnimation);

  assert.equal(findLabels.at(-1), "found 5");
  assert.ok(deleteLabels.includes("delete node 5"));
  assert.equal(deleteLabels.at(-1), "delete complete");
  assert.equal(tree.treeRoot.data, 10);
});
