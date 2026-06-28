import { assert, test } from "./harness.js";
import { blockLabels, createBareHeap, replayAnimation } from "./shared.js";

test("Heap insertElement emits canonical insert blocks and replayable heap edges", () => {
  const heap = createBareHeap();
  const insert10 = heap.insertElement("10");
  const insert4 = heap.insertElement("4");

  assert.deepEqual(blockLabels(insert10), [
    "insert 10",
    "create node 10",
    "place 10 at index 0",
    "insertion complete",
  ]);
  assert.ok(blockLabels(insert4).includes("compare 4 with parent"));

  const state = replayAnimation([...insert10, ...insert4]);
  assert.equal(heap.arrayData[0], "4");
  assert.equal(heap.arrayData[1], "10");
  assert.equal(state.edges.has("300->301"), true);
});

test("Heap removeSmallest emits root-removal flow and leaves smallest removed", () => {
  const heap = createBareHeap();
  const insert10 = heap.insertElement("10");
  const insert4 = heap.insertElement("4");
  const insert7 = heap.insertElement("7");
  const removeAnimation = heap.removeSmallest("");

  assert.equal(removeAnimation[0].label, "remove smallest");
  assert.ok(blockLabels(removeAnimation).includes("remove root 4"));
  assert.ok(blockLabels(removeAnimation).includes("move last value 2 to root"));

  const state = replayAnimation([...insert10, ...insert4, ...insert7, ...removeAnimation]);
  assert.equal(heap.arrayData[0], "7");
  assert.equal(heap.currentHeapSize, 2);
  assert.equal(state.objects.has(302), false);
});

test("Heap describe summarizes the heap structure", () => {
  const heap = createBareHeap();
  heap.arrayData[0] = "4";
  heap.arrayData[1] = "10";
  heap.arrayData[2] = "7";
  heap.currentHeapSize = 3;

  assert.equal(
    heap.describe(),
    "Heap has 3 values. Root is 4. Index 0 stores 4 with left child 10 and right child 7. Index 1 stores 10 with no children. Index 2 stores 7 with no children.",
  );
});

test("Heap describeFromState summarizes the replayed heap state", () => {
  const heap = createBareHeap();
  const state = replayAnimation([
    ...heap.insertElement("10"),
    ...heap.insertElement("4"),
  ]);

  assert.equal(
    heap.describeFromState(state),
    "Heap has 2 values. Root is 4. Index 0 stores 4 with left child 10. Index 1 stores 10 with no children.",
  );
});
