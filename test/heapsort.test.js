import { assert, test } from "./harness.js";
import { blockLabels, createBareHeapSort, replayAnimation } from "./shared.js";

test("HeapSort heapify emits build and completion blocks", () => {
  const heap = createBareHeapSort([9, 4, 7, 1, 3]);
  const animation = heap.heapify("");

  assert.deepEqual(blockLabels(animation).slice(0, 2), [
    "heapify array",
    "build heap drawing",
  ]);
  assert.ok(blockLabels(animation).some((label) => label.startsWith("push down from index ")));
  assert.equal(blockLabels(animation).at(-1), "heapify complete");

  const state = replayAnimation(animation);
  assert.equal(heap.isHeapified, true);
  assert.equal(state.message, "Heapify complete: array now satisfies heap order");
});

test("HeapSort heapsort emits extraction blocks and leaves array sorted", () => {
  const values = [9, 4, 7, 1, 3, 8, 6, 2, 5, 14, 12, 10, 11, 15, 13];
  const heap = createBareHeapSort(values);
  const heapifyAnimation = heap.heapify("");
  const sortAnimation = heap.heapsort("");

  assert.equal(sortAnimation[0].label, "heap sort");
  assert.ok(blockLabels(sortAnimation).includes("start heapsort"));
  assert.ok(blockLabels(sortAnimation).includes("swap root with index 4"));
  assert.equal(blockLabels(sortAnimation).at(-1), "heapsort complete");

  const state = replayAnimation([...heapifyAnimation, ...sortAnimation]);
  assert.deepEqual(heap.arrayData, [...values].sort((a, b) => a - b));
  assert.equal(state.objects.get(200).backgroundColor, "#bdbdbdff");
});
