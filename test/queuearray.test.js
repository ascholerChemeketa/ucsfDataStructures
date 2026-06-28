import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareQueueArray,
  replayAnimation,
} from "./shared.js";

test("QueueArray enqueue and dequeue emit slot-oriented canonical blocks", () => {
  const queue = createBareQueueArray();
  const enqueueAnimation = queue.enqueue("7");
  const dequeueAnimation = queue.dequeue("");

  assert.deepEqual(
    blockLabels(enqueueAnimation),
    [
      "enqueue 7",
      "stage 7",
      "identify slot 0",
      "move to slot 0",
      "place 7 at 0",
      "advance end pointer",
      "enqueue complete",
    ],
  );
  assert.equal(dequeueAnimation[0].label, "dequeue");
  assert.ok(blockLabels(dequeueAnimation).includes("extract 7"));
  assert.ok(blockLabels(dequeueAnimation).includes("dequeue complete"));

  const state = replayAnimation([...enqueueAnimation, ...dequeueAnimation]);
  assert.equal(state.objects.get(queue.headID).text[0], "1");
  assert.equal(state.objects.get(queue.tailID).text[0], "1");
  assert.equal(state.objects.get(queue.arrayID[0]).text[0], "");
});

test("QueueArray full enqueue emits explicit full-state metadata", () => {
  const queue = createBareQueueArray();
  queue.head = 0;
  queue.tail = 7;
  const animation = queue.enqueue("9");

  assert.deepEqual(blockLabels(animation), ["queue full"]);
  assert.deepEqual(animation[0].meta.tags, ["queue", "enqueue", "full"]);
});

test("QueueArray describe summarizes active circular queue cells", () => {
  const queue = createBareQueueArray();
  queue.arrayData[1] = "20";
  queue.arrayData[2] = "30";
  queue.head = 1;
  queue.tail = 3;

  assert.equal(
    queue.describe(),
    "Start is 1. End is 3. Index 1 stores 20. Index 2 stores 30.",
  );
});

test("QueueArray describeFromState summarizes the replayed queue slots", () => {
  const queue = createBareQueueArray();
  const enqueue10 = queue.enqueue("10");
  const enqueue20 = queue.enqueue("20");
  const state = replayAnimation([...enqueue10, ...enqueue20]);

  assert.equal(
    queue.describeFromState(state),
    "Start is 0. End is 2. Index 0 stores 10. Index 1 stores 20.",
  );
});
