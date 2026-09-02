import { assert, test } from "./harness.js";
import { setAnimationMessage } from "../AnimationLibrary/Message.js";

test("animation messages update the visible control and live status text", () => {
  const elements = {
    message: { value: "" },
    messageStatus: { textContent: "" },
  };
  const originalGetElementById = document.getElementById;
  document.getElementById = (id) => elements[id] ?? null;

  try {
    setAnimationMessage("Visiting node 7");

    assert.equal(elements.message.value, "Visiting node 7");
    assert.equal(elements.messageStatus.textContent, "Visiting node 7");
  } finally {
    if (originalGetElementById) {
      document.getElementById = originalGetElementById;
    } else {
      delete document.getElementById;
    }
  }
});

