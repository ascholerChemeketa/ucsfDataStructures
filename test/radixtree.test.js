import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareRadixTree,
  replayAnimation,
} from "./shared.js";

test("RadixTree add emits canonical insert blocks and creates a root node", () => {
  const tree = createBareRadixTree();
  const animation = tree.add("CAT");

  assert.deepEqual(blockLabels(animation), ["insert CAT", "start insert CAT", "create node CAT"]);

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(4).text, "CAT");
});

test("RadixTree find and delete emit outcome blocks", () => {
  const tree = createBareRadixTree();
  const insertAnimation = tree.add("CAT");
  const findAnimation = tree.findElement("CAT");
  const deleteAnimation = tree.deleteElement("CAT");

  assert.equal(blockLabels(findAnimation).at(-1), "found CAT");
  assert.ok(blockLabels(deleteAnimation).includes("unset word flag for CAT"));
  assert.ok(blockLabels(deleteAnimation).includes("cleanup CAT"));

  const state = replayAnimation([...insertAnimation, ...findAnimation, ...deleteAnimation]);
  assert.equal(tree.root, null);
  assert.equal(state.objects.has(4), false);
});

test("RadixTree describe summarizes stored prefixes and word markers", () => {
  const tree = createBareRadixTree();
  tree.add("CAT");

  assert.equal(
    tree.describe(),
    "Root node stores prefix CAT, marks a complete word, and has no children.",
  );
});

test("RadixTree describeFromState summarizes the replayed radix tree state", () => {
  const tree = createBareRadixTree();
  const state = replayAnimation(tree.add("CAT"));

  assert.equal(
    tree.describeFromState(state),
    "Root node stores prefix CAT, marks a complete word, and has no children.",
  );
});
