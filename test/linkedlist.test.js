import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareLinkedList,
  replayAnimation,
} from "./shared.js";

test("LinkedList insertBack emits tail-focused canonical blocks", () => {
  const list = createBareLinkedList();
  const animation = list.insertBack("10");

  assert.equal(animation[0].label, "insert back 10");
  assert.ok(blockLabels(animation).includes("allocate tail node 10"));
  assert.ok(blockLabels(animation).includes("track new tail node"));
  assert.ok(blockLabels(animation).includes("initialize head and tail"));
  assert.equal(blockLabels(animation).at(-1), "insert complete");

  const state = replayAnimation(animation);
  assert.equal(state.edges.has("1->50"), true);
  assert.equal(state.edges.has("2->50"), true);
});

test("LinkedList deleteFront and findElement emit readable outcome blocks", () => {
  const list = createBareLinkedList();
  const insertA = list.insertBack("10");
  const insertB = list.insertBack("20");
  const deleteAnimation = list.deleteFront("");
  const findAnimation = list.findElement("10");

  assert.equal(deleteAnimation[0].label, "delete front");
  assert.ok(blockLabels(deleteAnimation).includes("capture deleted value"));
  assert.ok(blockLabels(deleteAnimation).includes("delete complete"));

  assert.deepEqual(blockLabels(findAnimation), ["find 10", "start search", "inspect 20", "not found 10"]);

  const state = replayAnimation([...insertA, ...insertB, ...deleteAnimation, ...findAnimation]);
  assert.equal(list.top, 1);
  assert.equal(state.message, "Not found: 10");
});

test("LinkedList describe summarizes head, tail, and next chain", () => {
  const list = createBareLinkedList();
  list.arrayData[0] = "20";
  list.arrayData[1] = "10";
  list.top = 2;

  assert.equal(
    list.describe(),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points to 20 node. 20 node's next points to null.",
  );
});

test("LinkedList describeFromState summarizes the replayed chain", () => {
  const list = createBareLinkedList();
  const insert10 = list.insertBack("10");
  const insert20 = list.insertBack("20");
  const state = replayAnimation([...insert10, ...insert20]);

  assert.equal(
    list.describeFromState(state),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points to 20 node. 20 node's next points to null.",
  );
});
