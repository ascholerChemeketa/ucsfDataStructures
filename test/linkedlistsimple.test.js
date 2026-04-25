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
