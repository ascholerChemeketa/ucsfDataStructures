import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareStringHash,
  replayAnimation,
} from "./shared.js";

test("StringHash runHash emits canonical start/complete blocks and replayable labels", () => {
  const hash = createBareStringHash();
  const animation = hash.runHash("abc");

  assert.equal(animation[0].label, "hash abc");
  assert.ok(blockLabels(animation).includes("start hash"));
  assert.ok(blockLabels(animation).includes("hash complete"));

  const state = replayAnimation(animation);
  assert.equal(state.message, "");
  assert.equal(animation.length >= 3, true);
});
