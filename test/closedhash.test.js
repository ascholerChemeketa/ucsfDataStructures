import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareClosedHash,
  replayAnimation,
} from "./shared.js";

test("ClosedHash insert, find, and delete emit canonical probing blocks", () => {
  const hash = createBareClosedHash();
  const insert10 = hash.insertElement(10);
  const insert18 = hash.insertElement(18);
  const find18 = hash.findElement(18);
  const delete18 = hash.deleteElement(18);

  assert.ok(blockLabels(insert10).includes("insert at 2"));
  assert.ok(blockLabels(insert18).includes("probe slot 2"));
  assert.ok(blockLabels(insert18).includes("probe slot 3"));
  assert.ok(blockLabels(insert18).includes("insert at 3"));
  assert.deepEqual(find18.at(-1).meta.tags, ["search", "found"]);
  assert.deepEqual(delete18.at(-1).meta.tags, ["delete", "tombstone"]);

  const state = replayAnimation([...insert10, ...insert18, ...find18, ...delete18]);
  assert.equal(state.objects.get(hash.hashTableVisual[2]).text[0], "10");
  assert.equal(state.objects.get(hash.hashTableVisual[3]).text[0], "<deleted>");
  assert.equal(state.message, "Deleting element: 18  Adding tombstone.");
});

test("ClosedHash growTable emits grow phases and replayed reinsertion state", () => {
  const hash = createBareClosedHash();
  const insert10 = hash.insertElement(10);
  const insert18 = hash.insertElement(18);
  const grow = hash.growTable(16);

  assert.equal(grow[0].label, "grow table to 16");
  assert.ok(blockLabels(grow).includes("start grow"));
  assert.ok(blockLabels(grow).includes("create grown table"));
  assert.ok(blockLabels(grow).includes("reinsert 10 at 10"));
  assert.ok(blockLabels(grow).includes("reinsert 18 at 2"));
  assert.equal(blockLabels(grow).at(-1), "grow complete");

  const state = replayAnimation([...insert10, ...insert18, ...grow]);
  assert.equal(hash.table_size, 16);
  assert.equal(state.objects.get(hash.hashTableVisual[10]).text[0], "10");
  assert.equal(state.objects.get(hash.hashTableVisual[2]).text[0], "18");
});

test("ClosedHash describe summarizes slots and tombstones", () => {
  const hash = createBareClosedHash();
  hash.empty[2] = false;
  hash.hashTableValues[2] = 10;
  hash.empty[3] = false;
  hash.deleted[3] = true;

  assert.equal(
    hash.describe(),
    "Table size is 8. Collision strategy is linear probing. Index 0 is empty. Index 1 is empty. Index 2 stores 10. Index 3 is deleted. Index 4 is empty. Index 5 is empty. Index 6 is empty. Index 7 is empty.",
  );
});

test("ClosedHash describeFromState summarizes the replayed table state", () => {
  const hash = createBareClosedHash();
  const state = replayAnimation([
    ...hash.insertElement(10),
    ...hash.insertElement(18),
    ...hash.deleteElement(18),
  ]);

  assert.equal(
    hash.describeFromState(state),
    "Table size is 8. Collision strategy is linear probing. Index 0 is empty. Index 1 is empty. Index 2 stores 10. Index 3 is deleted. Index 4 is empty. Index 5 is empty. Index 6 is empty. Index 7 is empty.",
  );
});
