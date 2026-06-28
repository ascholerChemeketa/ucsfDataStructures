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

test("DoublyLinkedList describe summarizes next and prev links", () => {
  const list = createBareDoublyLinkedList();
  list.values = ["10", "20"];

  assert.equal(
    list.describe(),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points at 20 node and prev points at null. 20 node's next points at null and prev points at 10 node.",
  );
});

test("DoublyLinkedList describeFromState summarizes the replayed chain", () => {
  const list = createBareDoublyLinkedList();
  const state = {
    objects: new Map([
      [list.headID, { id: list.headID, kind: "rectangle" }],
      [100, { id: 100, kind: "linkedList", text: { 0: "H" }, x: 100, y: 150 }],
      [101, { id: 101, kind: "linkedList", text: { 0: "10" }, x: 180, y: 150 }],
      [102, { id: 102, kind: "linkedList", text: { 0: "20" }, x: 260, y: 150 }],
      [103, { id: 103, kind: "linkedList", text: { 0: "T" }, x: 340, y: 150 }],
    ]),
    edges: new Map([
      [`${list.headID}->100`, { from: list.headID, to: 100 }],
      ["100->101", { from: 100, to: 101 }],
      ["101->102", { from: 101, to: 102 }],
      ["102->103", { from: 102, to: 103 }],
    ]),
    message: "",
    blocksApplied: 0,
    history: [],
  };

  assert.equal(
    list.describeFromState(state),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points at 20 node and prev points at null. 20 node's next points at null and prev points at 10 node.",
  );
});
