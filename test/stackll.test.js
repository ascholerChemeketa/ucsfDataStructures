import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareStackLL,
  replayAnimation,
} from "./shared.js";

test("StackLL push/pop/peek emit pointer-oriented canonical blocks", () => {
  const stack = createBareStackLL();
  const pushAnimation = stack.push("12");
  const peekAnimation = stack.peek("");
  const popAnimation = stack.pop("");

  assert.ok(blockLabels(pushAnimation).includes("update top pointer"));
  assert.ok(blockLabels(peekAnimation).includes("peek 12"));
  assert.ok(blockLabels(popAnimation).includes("advance top pointer"));

  const state = replayAnimation([...pushAnimation, ...popAnimation]);
  assert.equal(state.edges.has(`${stack.topID}->${stack.linkedListElemID[0]}`), false);
});

test("StackLL describe summarizes top and next chain", () => {
  const stack = createBareStackLL();
  stack.arrayData[0] = "10";
  stack.arrayData[1] = "20";
  stack.top = 2;

  assert.equal(
    stack.describe(),
    "Top points to 20 node. 20 node's next points to 10 node. 10 node's next points to null.",
  );
});

test("StackLL describeFromState summarizes the replayed stack chain", () => {
  const stack = createBareStackLL();
  const push10 = stack.push("10");
  const push20 = stack.push("20");
  const state = replayAnimation([...push10, ...push20]);

  assert.equal(
    stack.describeFromState(state),
    "Top points to 20 node. 20 node's next points to 10 node. 10 node's next points to null.",
  );
});
