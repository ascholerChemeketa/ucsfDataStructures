import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareLinkedListSimple,
  replayAnimation,
} from "./shared.js";

test("LinkedListSimple insertFront emits head-insert canonical blocks", () => {
  const list = createBareLinkedListSimple();
  const animation = list.insertFront("10");

  assert.equal(animation[0].label, "insert front 10");
  assert.ok(blockLabels(animation).includes("allocate head node 10"));
  assert.ok(blockLabels(animation).includes("create node 10"));
  assert.ok(blockLabels(animation).includes("track new head node"));
  assert.equal(blockLabels(animation).at(-1), "insert complete");

  const state = replayAnimation(animation);
  assert.equal(state.edges.has("1->50"), true);
});

test("LinkedListSimple current-pointer flow emits pointer blocks", () => {
  const list = createBareLinkedListSimple();
  const insertA = list.insertFront("10");
  const insertB = list.insertFront("20");
  const makeCurrent = list.makeHeadPointer();
  const advance = list.advanceCurrent();

  assert.deepEqual(blockLabels(makeCurrent), [
    "make current pointer",
    "create current pointer",
    "point current at head",
  ]);
  assert.equal(advance[0].label, "advance current");

  const state = replayAnimation([...insertA, ...insertB, ...makeCurrent, ...advance]);
  assert.equal(list.currentNodeID, list.linkedListElemID[0]);
  assert.equal(state.message, "");
});

test("LinkedListSimple describe summarizes the head and next chain", () => {
  const list = createBareLinkedListSimple();
  list.arrayData[0] = "20";
  list.arrayData[1] = "10";
  list.top = 2;

  assert.equal(
    list.describe(),
    "Head points to 10 node. 10 node's next points to 20 node. 20 node's next points to null.",
  );
});

test("LinkedListSimple describeFromState summarizes the replayed chain", () => {
  const list = createBareLinkedListSimple();
  const insert10 = list.insertFront("10");
  const insert20 = list.insertFront("20");
  const state = replayAnimation([...insert10, ...insert20]);

  assert.equal(
    list.describeFromState(state),
    "Head points to 20 node. 20 node's next points to 10 node. 10 node's next points to null.",
  );
});
