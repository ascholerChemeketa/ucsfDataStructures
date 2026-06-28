import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareBSTIterator,
  replayAnimation,
} from "./shared.js";

test("BSTIterator makeIterator emits setup blocks and replayed stack labels", () => {
  const bst = createBareBSTIterator();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const insert15 = bst.insertElement(15);
  const iteratorAnimation = bst.makeIterator();

  assert.deepEqual(
    blockLabels(iteratorAnimation),
    [
      "make iterator",
      "start iterator setup",
      "push 10",
      "walk left from 10",
      "push 5",
      "iterator ready",
    ],
  );
  assert.deepEqual(iteratorAnimation[0].meta.tags, ["iterator", "create"]);
  assert.deepEqual(iteratorAnimation[2].meta.tags, ["iterator", "push"]);
  assert.deepEqual(iteratorAnimation[5].meta.tags, ["iterator", "ready"]);

  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...iteratorAnimation]);
  assert.equal(state.objects.get(7).text, "10");
  assert.equal(state.objects.get(8).text, "5");
  assert.equal(state.objects.get(8).foregroundColor, "var(--svgColor--red)");
  assert.equal(state.message, "No more left children; iterator ready.");
});

test("BSTIterator advanceIterator emits return flow and can finish iteration", () => {
  const bst = createBareBSTIterator();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const insert15 = bst.insertElement(15);
  const makeAnimation = bst.makeIterator();
  const advanceOne = bst.advanceIterator();
  const advanceTwo = bst.advanceIterator();
  const advanceThree = bst.advanceIterator();

  assert.ok(blockLabels(advanceOne).includes("return 5"));
  assert.ok(blockLabels(advanceOne).includes("no right child for 5"));
  assert.ok(blockLabels(advanceOne).includes("iterator advanced"));
  assert.ok(blockLabels(advanceTwo).includes("return 10"));
  assert.ok(blockLabels(advanceTwo).includes("move to right child of 10"));
  assert.ok(blockLabels(advanceTwo).includes("push 15"));
  assert.ok(blockLabels(advanceThree).includes("return 15"));
  assert.ok(blockLabels(advanceThree).includes("iterator finished"));

  const state = replayAnimation([
    ...insert10,
    ...insert5,
    ...insert15,
    ...makeAnimation,
    ...advanceOne,
    ...advanceTwo,
    ...advanceThree,
  ]);
  assert.equal(state.message, "Iterator is now finished (stack is empty).");
  assert.equal(bst.iteratorStack.length, 0);
});

test("BSTIterator advanceIterator reports invalid setup cleanly", () => {
  const bst = createBareBSTIterator();
  const animation = bst.advanceIterator();

  assert.deepEqual(blockLabels(animation), ["advance iterator", "iterator not ready"]);
  assert.deepEqual(animation[1].meta.tags, ["iterator", "invalid"]);
});

test("BSTIterator describe summarizes the tree, iterator stack, and highlighted node", () => {
  const bst = createBareBSTIterator();
  bst.treeRoot = {
    data: 10,
    left: { data: 5, left: null, right: null },
    right: { data: 15, left: null, right: null },
  };
  bst.iteratorStack = [
    { node: bst.treeRoot, labelID: 7 },
    { node: bst.treeRoot.left, labelID: 8 },
  ];
  bst.iteratorCurrentNode = bst.treeRoot.left;

  assert.equal(
    bst.describe(),
    "Root is 10 has a left child 5 and right child 15. 5 has no children. 15 has no children. IteratorStack from bottom to top is 10, 5. Highlighted node is 5. Iterator current node is 5.",
  );
});

test("BSTIterator describeFromState summarizes the replayed iterator setup state", () => {
  const bst = createBareBSTIterator();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const insert15 = bst.insertElement(15);
  const iteratorAnimation = bst.makeIterator();
  const state = replayAnimation(
    [...insert10, ...insert5, ...insert15, ...iteratorAnimation],
  );

  assert.equal(
    bst.describeFromState(state),
    "Root is 10 has a left child 5 and right child 15. 5 has no children. 15 has no children. IteratorStack from bottom to top is 10, 5. Highlighted node is 5.",
  );
});

test("BSTIterator describeFromState reflects a partially played advance animation", () => {
  const bst = createBareBSTIterator();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const insert15 = bst.insertElement(15);
  const makeAnimation = bst.makeIterator();
  const advanceOne = bst.advanceIterator();
  const state = replayAnimation(
    [...insert10, ...insert5, ...insert15, ...makeAnimation, ...advanceOne],
    { upToBlockIndex: insert10.length + insert5.length + insert15.length + makeAnimation.length + 2 },
  );

  assert.equal(
    bst.describeFromState(state),
    "Root is 10 has a left child 5 and right child 15. 5 has no children. 15 has no children. IteratorStack from bottom to top is 10. No node is highlighted.",
  );
});
