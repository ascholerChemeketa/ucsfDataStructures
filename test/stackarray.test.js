import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareStackArray,
  replayAnimation,
} from "./shared.js";

test("StackArray push/pop/peek emit slot-based canonical blocks", () => {
  const stack = createBareStackArray();
  const pushAnimation = stack.push("9");
  const peekAnimation = stack.peek("");
  const popAnimation = stack.pop("");

  assert.ok(blockLabels(pushAnimation).includes("place 9 at 0"));
  assert.ok(blockLabels(peekAnimation).includes("peek 9"));
  assert.ok(blockLabels(popAnimation).includes("extract 9"));

  const state = replayAnimation([...pushAnimation, ...popAnimation]);
  assert.equal(state.objects.get(stack.topID).text[0], "0");
});

test("StackArray describe summarizes top and occupied slots", () => {
  const stack = createBareStackArray();
  stack.arrayData[0] = "10";
  stack.arrayData[1] = "20";
  stack.top = 2;

  assert.equal(
    stack.describe(),
    "Top is 2. Index 0 stores 10. Index 1 stores 20.",
  );
});

test("StackArray describeFromState summarizes the replayed stack slots", () => {
  const stack = createBareStackArray();
  const push10 = stack.push("10");
  const push20 = stack.push("20");
  const state = replayAnimation([...push10, ...push20]);

  assert.equal(
    stack.describeFromState(state),
    "Top is 2. Index 0 stores 10. Index 1 stores 20.",
  );
});
