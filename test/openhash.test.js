import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareOpenHash,
  replayAnimation,
} from "./shared.js";

test("OpenHash insertElement emits bucket-oriented canonical blocks", () => {
  const hash = createBareOpenHash();
  const animation = hash.insertElement("15");

  assert.equal(animation[0].label, "insert 15");
  assert.ok(blockLabels(animation).includes("hash to bucket 2"));
  assert.ok(blockLabels(animation).includes("insert into bucket 2"));

  const state = replayAnimation(animation);
  assert.equal([...state.edges.keys()].some((key) => key.startsWith("102->")), true);
});

test("OpenHash findElement and deleteElement emit found/not-found outcomes", () => {
  const hash = createBareOpenHash();
  const insert15 = hash.insertElement("15");
  const insert28 = hash.insertElement("28");
  const findAnimation = hash.findElement("28");
  const deleteAnimation = hash.deleteElement("15");

  assert.deepEqual(blockLabels(findAnimation), ["find 28", "hash to bucket 2", "inspect 28", "found 28"]);
  assert.ok(blockLabels(deleteAnimation).includes("hash to bucket 2"));
  assert.ok(blockLabels(deleteAnimation).includes("delete 15 from bucket 2"));

  const state = replayAnimation([...insert15, ...insert28, ...findAnimation, ...deleteAnimation]);
  assert.equal(state.message.includes("Element deleted"), true);
});

test("OpenHash describe summarizes bucket chains", () => {
  const hash = createBareOpenHash();
  hash.hashTableValues[2] = {
    data: "28",
    next: {
      data: "15",
      next: null,
    },
  };

  assert.equal(
    hash.describe(),
    "Table size is 13. Bucket 0 is empty. Bucket 1 is empty. Bucket 2 contains 28, then 15. Bucket 3 is empty. Bucket 4 is empty. Bucket 5 is empty. Bucket 6 is empty. Bucket 7 is empty. Bucket 8 is empty. Bucket 9 is empty. Bucket 10 is empty. Bucket 11 is empty. Bucket 12 is empty.",
  );
});

test("OpenHash describeFromState summarizes the replayed bucket chains", () => {
  const hash = createBareOpenHash();
  const state = replayAnimation([
    ...hash.insertElement("15"),
    ...hash.insertElement("28"),
  ]);

  assert.equal(
    hash.describeFromState(state),
    "Table size is 13. Bucket 0 is empty. Bucket 1 is empty. Bucket 2 contains 28, then 15. Bucket 3 is empty. Bucket 4 is empty. Bucket 5 is empty. Bucket 6 is empty. Bucket 7 is empty. Bucket 8 is empty. Bucket 9 is empty. Bucket 10 is empty. Bucket 11 is empty. Bucket 12 is empty.",
  );
});
