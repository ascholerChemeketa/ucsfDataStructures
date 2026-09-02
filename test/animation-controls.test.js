import { assert, test } from "./harness.js";
import { makeNavigationButton } from "../AnimationLibrary/AnimationMain.js";

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
