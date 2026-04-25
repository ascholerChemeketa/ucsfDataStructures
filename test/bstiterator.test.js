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
