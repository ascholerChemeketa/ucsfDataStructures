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
