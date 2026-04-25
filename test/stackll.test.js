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
