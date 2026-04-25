import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareQueueLL,
  replayAnimation,
} from "./shared.js";

test("QueueLL enqueue emits pointer-update canonical blocks", () => {
  const queue = createBareQueueLL();
  const animation = queue.enqueue("11");

  assert.deepEqual(
    blockLabels(animation),
    [
      "enqueue 11",
      "allocate node 11",
      "create node 11",
      "initialize head and tail",
      "enqueue complete",
    ],
  );

  const state = replayAnimation(animation);
  assert.equal(state.edges.has(`${queue.headID}->${queue.linkedListElemID[0]}`), true);
  assert.equal(state.edges.has(`${queue.tailID}->${queue.linkedListElemID[0]}`), true);
});

test("QueueLL dequeue clears head and tail when removing the final node", () => {
  const queue = createBareQueueLL();
  const enqueueAnimation = queue.enqueue("11");
  const dequeueAnimation = queue.dequeue("");

  assert.ok(blockLabels(dequeueAnimation).includes("clear head and tail"));
  assert.ok(blockLabels(dequeueAnimation).includes("delete old head node"));

  const state = replayAnimation([...enqueueAnimation, ...dequeueAnimation]);
  assert.equal(state.objects.has(queue.linkedListElemID[0]), false);
  assert.equal(state.edges.has(`${queue.headID}->${queue.linkedListElemID[0]}`), false);
  assert.equal(state.edges.has(`${queue.tailID}->${queue.linkedListElemID[0]}`), false);
});
