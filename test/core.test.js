import { assert, test } from "./harness.js";
import { Algorithm, normalizeAnimation, replayAnimation } from "./shared.js";

test("normalizeAnimation converts legacy commands into canonical blocks", () => {
  const normalized = normalizeAnimation([
    "SetMessage<;>Searching",
    "SetHighlight<;>7<;>1",
    "Step",
    "Move<;>7<;>100<;>120",
  ]);

  assert.equal(normalized.length, 2);
  assert.deepEqual(normalized[0], {
    steps: [
      { type: "setMessage", message: "Searching" },
      { type: "setHighlight", id: 7, value: true },
    ],
  });
  assert.deepEqual(normalized[1], {
    steps: [{ type: "move", objectId: 7, toX: 100, toY: 120 }],
  });
});

test("normalizeAnimation preserves metadata blocks and tolerates mixed input", () => {
  const normalized = normalizeAnimation([
    {
      label: "visit root",
      meta: { source: "BST", operation: "find", focusNodeId: 7, tags: ["search"] },
      steps: [{ type: "setMessage", message: "At root" }],
    },
    { type: "setHighlight", id: 7, value: true },
    { type: "step" },
  ]);

  assert.equal(normalized.length, 2);
  assert.deepEqual(normalized[0], {
    label: "visit root",
    meta: { source: "BST", operation: "find", focusNodeId: 7, tags: ["search"] },
    steps: [{ type: "setMessage", message: "At root" }],
  });
  assert.deepEqual(normalized[1], {
    steps: [{ type: "setHighlight", id: 7, value: true }],
  });
});

test("replayAnimation returns inspectable state at any block boundary", () => {
  const state = replayAnimation([
    {
      label: "create root",
      steps: [
        { type: "createCircle", id: 1, label: "10", x: 200, y: 40 },
        { type: "connect", from: 0, to: 1, color: "#007700", curve: 0, directed: true, label: "", connectionPoint: 0 },
      ],
    },
    {
      label: "highlight root",
      steps: [{ type: "setHighlight", id: 1, value: true }],
    },
  ], { upToBlockIndex: 0 });

  assert.equal(state.blocksApplied, 1);
  assert.equal(state.history[0].label, "create root");
  assert.deepEqual(state.objects.get(1), {
    id: 1,
    kind: "circle",
    text: "10",
    x: 200,
    y: 40,
  });
  assert.deepEqual(state.edges.get("0->1"), {
    type: "connect",
    from: 0,
    to: 1,
    color: "#007700",
    curve: 0,
    directed: true,
    label: "",
    connectionPoint: 0,
  });
});

test("Algorithm block helpers produce metadata-rich canonical blocks", () => {
  const algorithm = new Algorithm();
  algorithm.recordAnimation = true;

  algorithm.beginAnimation();
  algorithm.beginBlock("visit root", { source: "BST", operation: "find", focusNodeId: 7 });
  algorithm.emit({ type: "setMessage", message: "Searching for 7" });
  algorithm.emit({ type: "setHighlight", id: 7, value: true });
  algorithm.step("clear root");
  algorithm.emit({ type: "setHighlight", id: 7, value: false });
  const animation = algorithm.finishAnimation();

  assert.deepEqual(animation, [
    {
      label: "visit root",
      meta: { source: "BST", operation: "find", focusNodeId: 7 },
      steps: [
        { type: "setMessage", message: "Searching for 7" },
        { type: "setHighlight", id: 7, value: true },
      ],
    },
    {
      label: "clear root",
      steps: [{ type: "setHighlight", id: 7, value: false }],
    },
  ]);
});

test("Algorithm.cmd remains compatible for legacy producers", () => {
  const algorithm = new Algorithm();
  algorithm.recordAnimation = true;
  algorithm.commands = [];

  algorithm.cmd("SetMessage", "Searching");
  algorithm.cmd("Step");
  algorithm.cmd("Move", 3, 100, 120);

  assert.deepEqual(normalizeAnimation(algorithm.commands), [
    {
      steps: [{ type: "setMessage", message: "Searching" }],
    },
    {
      steps: [{ type: "move", objectId: 3, toX: 100, toY: 120 }],
    },
  ]);
});
