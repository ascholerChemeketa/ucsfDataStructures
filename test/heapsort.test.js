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

test("HeapSort describe summarizes the active heap prefix and sorted suffix", () => {
  const heap = createBareHeapSort([4, 10, 7, 20, 30]);
  heap.arrayData = [4, 10, 7, 20, 30];
  heap.currentHeapSize = 3;

  assert.equal(
    heap.describe(),
    "Active heap has 3 values. Root is 4. Index 0 stores 4 with left child 10 and right child 7. Index 1 stores 10 with no children. Index 2 stores 7 with no children. Sorted suffix has 2 values. Index 3 stores 20. Index 4 stores 30.",
  );
});

test("HeapSort describeFromState summarizes the replayed heapified array", () => {
  const heap = createBareHeapSort([9, 4, 7, 1, 3]);
  const state = replayAnimation(heap.heapify(""));

  assert.equal(
    heap.describeFromState(state),
    "Active heap has 15 values. Root is 9. Index 0 stores 9 with left child 4 and right child 7. Index 1 stores 4 with left child 1 and right child 3. Index 2 stores 7 with left child 0 and right child 0. Index 3 stores 1 with left child 0 and right child 0. Index 4 stores 3 with left child 0 and right child 0. Index 5 stores 0 with left child 0 and right child 0. Index 6 stores 0 with left child 0 and right child 0. Index 7 stores 0 with no children. Index 8 stores 0 with no children. Index 9 stores 0 with no children. Index 10 stores 0 with no children. Index 11 stores 0 with no children. Index 12 stores 0 with no children. Index 13 stores 0 with no children. Index 14 stores 0 with no children.",
  );
});
