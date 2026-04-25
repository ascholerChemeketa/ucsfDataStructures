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
