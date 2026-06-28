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

test("StringHash describe summarizes configuration and last result", () => {
  const hash = createBareStringHash();
  hash.currHash = 1234;

  assert.equal(
    hash.describe(),
    "Table size is 13. Mode is string hashing. Last computed hash value is 1234. Last computed bucket is 12.",
  );
});

test("StringHash describeFromState uses the current string hash summary", () => {
  const hash = createBareStringHash();
  hash.currHash = 1234;

  assert.equal(
    hash.describeFromState({ objects: new Map(), edges: new Map(), message: "" }),
    "Table size is 13. Mode is string hashing. Last computed hash value is 1234. Last computed bucket is 12.",
  );
});

test("StringHash describeFromState can recover the visible hash labels without currHash", () => {
  const hash = createBareStringHash();
  hash.currHash = undefined;

  const state = {
    objects: new Map([
      [1, { id: 1, kind: "label", text: 'hash("abc") = 1234' }],
      [2, { id: 2, kind: "label", text: "1234 % 13 = 12" }],
    ]),
    edges: new Map(),
    message: 'Computed hash("abc") = 1234',
  };

  assert.equal(
    hash.describeFromState(state),
    "Table size is 13. Mode is string hashing. Last computed hash value is 1234. Last computed bucket is 12.",
  );
});
