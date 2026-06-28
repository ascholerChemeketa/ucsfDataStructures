import { assert, test } from "./harness.js";
import { blockLabels, createBareHeapMax, replayAnimation } from "./shared.js";

test("HeapMax insertElement bubbles larger values upward with canonical blocks", () => {
  const heap = createBareHeapMax();
  const insert10 = heap.insertElement("10");
  const insert40 = heap.insertElement("40");

  assert.deepEqual(blockLabels(insert10), [
    "insert 10",
    "create node 10",
    "place 10 at index 0",
    "insertion complete",
  ]);
  assert.ok(blockLabels(insert40).includes("compare 40 with parent"));

  const state = replayAnimation([...insert10, ...insert40]);
  assert.equal(heap.arrayData[0], "40");
  assert.equal(heap.arrayData[1], "10");
  assert.equal(state.edges.has("300->301"), true);
});

test("HeapMax removeLargest emits max-removal flow and updates heap state", () => {
  const heap = createBareHeapMax();
  const insert10 = heap.insertElement("10");
  const insert40 = heap.insertElement("40");
  const insert7 = heap.insertElement("7");
  const removeAnimation = heap.removeLargest("");

  assert.equal(removeAnimation[0].label, "remove largest");
  assert.ok(blockLabels(removeAnimation).includes("remove root 40"));
  assert.ok(blockLabels(removeAnimation).includes("move last value 2 to root"));

  const state = replayAnimation([...insert10, ...insert40, ...insert7, ...removeAnimation]);
  assert.equal(heap.arrayData[0], "10");
  assert.equal(heap.currentHeapSize, 2);
  assert.equal(state.objects.has(302), false);
});

test("HeapMax describe summarizes the heap structure", () => {
  const heap = createBareHeapMax();
  heap.arrayData[0] = "40";
  heap.arrayData[1] = "10";
  heap.arrayData[2] = "7";
  heap.currentHeapSize = 3;

  assert.equal(
    heap.describe(),
    "Heap has 3 values. Root is 40. Index 0 stores 40 with left child 10 and right child 7. Index 1 stores 10 with no children. Index 2 stores 7 with no children.",
  );
});

test("HeapMax describeFromState summarizes the replayed heap state", () => {
  const heap = createBareHeapMax();
  const state = replayAnimation([
    ...heap.insertElement("10"),
    ...heap.insertElement("40"),
  ]);

  assert.equal(
    heap.describeFromState(state),
    "Heap has 2 values. Root is 40. Index 0 stores 40 with left child 10. Index 1 stores 10 with no children.",
  );
});
