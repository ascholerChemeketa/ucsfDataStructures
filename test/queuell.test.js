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

test("QueueLL describe summarizes head, tail, and next chain", () => {
  const queue = createBareQueueLL();
  queue.arrayData[0] = "20";
  queue.arrayData[1] = "10";
  queue.top = 2;

  assert.equal(
    queue.describe(),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points to 20 node. 20 node's next points to null.",
  );
});

test("QueueLL describeFromState summarizes the replayed queue chain", () => {
  const queue = createBareQueueLL();
  const enqueue10 = queue.enqueue("10");
  const enqueue20 = queue.enqueue("20");
  const state = replayAnimation([...enqueue10, ...enqueue20]);

  assert.equal(
    queue.describeFromState(state),
    "Head points to 10 node. Tail points to 20 node. 10 node's next points to 20 node. 20 node's next points to null.",
  );
});
