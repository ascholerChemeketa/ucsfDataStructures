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
