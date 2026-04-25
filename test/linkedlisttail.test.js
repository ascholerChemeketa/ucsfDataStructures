import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareLinkedListTail,
  replayAnimation,
} from "./shared.js";

test("LinkedListTail insertBack emits tail-pointer and size blocks", () => {
  const list = createBareLinkedListTail();
  const animation = list.insertBack("10");

  assert.equal(animation[0].label, "insert back 10");
  assert.ok(blockLabels(animation).includes("allocate tail node 10"));
  assert.ok(blockLabels(animation).includes("track new tail node"));
  assert.ok(blockLabels(animation).includes("update size"));
  assert.equal(blockLabels(animation).at(-1), "insert complete");

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(1).text[0], "1");
});

test("LinkedListTail insertFront and current-pointer flow emit readable blocks", () => {
  const list = createBareLinkedListTail();
  const insertTail = list.insertBack("10");
  const insertFront = list.insertFront("20");
  const makeCurrent = list.makeHeadPointer();
  const advance = list.advanceCurrent();

  assert.equal(insertFront[0].label, "insert front 20");
  assert.ok(blockLabels(insertFront).includes("link new head to old head"));
  assert.deepEqual(blockLabels(makeCurrent), [
    "make current pointer",
    "create current pointer",
    "point current at head",
  ]);
  assert.equal(advance[0].label, "advance current");

  const state = replayAnimation([...insertTail, ...insertFront, ...makeCurrent, ...advance]);
  assert.equal(list.currentNodeID, list.LinkedListTailElemID[0]);
  assert.equal(state.objects.get(1).text[0], "2");
});
