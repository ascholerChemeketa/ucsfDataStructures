import { assert, test } from "./harness.js";
import {
  focusEnabledControl,
  focusFirstEnabledControl,
  isAnimationActionControl,
  makeNavigationButton,
} from "../AnimationLibrary/AnimationMain.js";

test("animation navigation buttons hide their symbolic values from accessible names", () => {
  const originalCreateElement = document.createElement;
  document.createElement = (tagName) => {
    const attributes = new Map();
    return {
      tagName,
      attributes,
      children: [],
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      appendChild(child) {
        this.children.push(child);
      },
    };
  };

  try {
    const button = makeNavigationButton(
      ">>",
      "Skip Forward",
      "skipForwardButton",
      "Skip to end of animation",
    );

    assert.equal(button.tagName, "button");
    assert.equal(button.attributes.has("value"), false);
    assert.equal(button.attributes.get("aria-label"), "Skip to end of animation");
    assert.equal(button.children[0].textContent, ">>");
    assert.equal(button.children[0].attributes.get("aria-hidden"), "true");
  } finally {
    if (originalCreateElement) {
      document.createElement = originalCreateElement;
    } else {
      delete document.createElement;
    }
  }
});

test("focus moves only from animation action buttons to an enabled step control", () => {
  const actionButton = { tagName: "INPUT", type: "button" };
  const textInput = { tagName: "INPUT", type: "text" };
  const controls = { contains: (element) => element === actionButton || element === textInput };

  assert.equal(isAnimationActionControl(actionButton, controls), true);
  assert.equal(isAnimationActionControl(textInput, controls), false);
  assert.equal(isAnimationActionControl({ tagName: "BUTTON" }, controls), false);

  let focusCalls = 0;
  const stepButton = {
    disabled: false,
    focus() {
      focusCalls += 1;
    },
  };

  assert.equal(focusEnabledControl(stepButton), true);
  assert.equal(focusCalls, 1);

  stepButton.disabled = true;
  assert.equal(focusEnabledControl(stepButton), false);
  assert.equal(focusCalls, 1);
});

test("focus fallback skips disabled playback controls", () => {
  let focused = "";
  const disabledPreferredControl = { disabled: true, focus() { focused = "disabled"; } };
  const enabledFallbackControl = { disabled: false, focus() { focused = "fallback"; } };

  assert.equal(
    focusFirstEnabledControl([disabledPreferredControl, enabledFallbackControl]),
    true,
  );
  assert.equal(focused, "fallback");
});
