import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareDoublyLinkedList,
  replayAnimation,
} from "./shared.js";

test("DoublyLinkedList insertBack emits canonical tail-insert phases", () => {
  const list = createBareDoublyLinkedList();
  const animation = list.insertBack("10");

  assert.equal(animation[0].label, "insert back 10");
  assert.ok(blockLabels(animation).includes("create new tail node"));
  assert.ok(blockLabels(animation).includes("track new node"));
  assert.ok(blockLabels(animation).includes("link new node"));
  assert.ok(blockLabels(animation).includes("update tail neighbors"));
  assert.ok(blockLabels(animation).includes("update size"));
  assert.ok(blockLabels(animation).includes("position nodes"));

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(0).text[0], "1");
});

test("DoublyLinkedList current-pointer flow emits pointer blocks", () => {
  const list = createBareDoublyLinkedList();
  const insertA = list.insertBack("10");
  const insertB = list.insertBack("20");
  const makeCurrent = list.makeHeadPointer();
  const advance = list.advanceCurrent();

  assert.deepEqual(blockLabels(makeCurrent), [
    "make current pointer",
    "create current pointer",
    "point current at head",
  ]);
  assert.ok(blockLabels(advance).includes("advance to next node"));

  const state = replayAnimation([...insertA, ...insertB, ...makeCurrent, ...advance]);
  assert.equal(state.edges.has("5->21"), true);
});

test("DoublyLinkedList clearData emits canonical clear phases", () => {
  const list = createBareDoublyLinkedList();
  const insertA = list.insertBack("10");
  const insertB = list.insertBack("20");
  const clear = list.clearData();

  assert.deepEqual(blockLabels(clear), [
    "clear list",
    "start clear",
    "clear nodes",
    "restore empty layout",
  ]);

  const state = replayAnimation([...insertA, ...insertB, ...clear]);
  assert.equal(state.objects.get(0).text[0], "0");
});
