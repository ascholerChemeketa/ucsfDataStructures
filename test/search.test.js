import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareSearch,
  replayAnimation,
} from "./shared.js";

test("Search linearSearch emits inspect/found blocks", () => {
  const search = createBareSearch();
  const animation = search.linearSearch(30);

  assert.equal(animation[0].label, "linear search 30");
  assert.ok(blockLabels(animation).includes("inspect index 2"));
  assert.equal(blockLabels(animation).at(-1), "found at 2");

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(search.resultString).text[0], "   Element found");
});

test("Search binarySearch emits inspect/not-found blocks", () => {
  const search = createBareSearch();
  const animation = search.binarySearch(35);

  assert.equal(animation[0].label, "binary search 35");
  assert.ok(blockLabels(animation).includes("inspect mid 2"));
  assert.equal(blockLabels(animation).at(-1), "element not found");

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(search.resultBoxID).text[0], "-1");
});

test("Search describe summarizes the indexed array values", () => {
  const search = createBareSearch();

  assert.equal(
    search.describe(),
    "Array has 5 values. Index 0 stores 10. Index 1 stores 20. Index 2 stores 30. Index 3 stores 40. Index 4 stores 50.",
  );
});

test("Search describeFromState summarizes the replayed array values", () => {
  const search = createBareSearch();
  const state = {
    objects: new Map([
      [search.arrayID[0], { id: search.arrayID[0], kind: "rectangle", text: "10" }],
      [search.arrayID[1], { id: search.arrayID[1], kind: "rectangle", text: "20" }],
      [search.arrayID[2], { id: search.arrayID[2], kind: "rectangle", text: "30" }],
      [search.arrayID[3], { id: search.arrayID[3], kind: "rectangle", text: "40" }],
      [search.arrayID[4], { id: search.arrayID[4], kind: "rectangle", text: "50" }],
    ]),
    edges: new Map(),
    message: "",
    blocksApplied: 0,
    history: [],
  };

  assert.equal(
    search.describeFromState(state),
    "Array has 5 values. Index 0 stores 10. Index 1 stores 20. Index 2 stores 30. Index 3 stores 40. Index 4 stores 50.",
  );
});
