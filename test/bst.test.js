import { assert, test } from "./harness.js";
import { BST, blockLabels, createBareBST, replayAnimation } from "./shared.js";

test("BST insertElement emits labeled canonical blocks and replayable state", () => {
  const bst = createBareBST();
  const animation = bst.insertElement(10);

  assert.equal(animation[0].label, "insert 10");
  assert.equal(animation[0].meta.source, "BST");
  assert.equal(animation[0].meta.operation, "insert");
  assert.equal(animation[1].label, "create root");

  const state = replayAnimation(animation);
  assert.equal(state.history[1].label, "create root");
  assert.deepEqual(state.objects.get(2), {
    id: 2,
    kind: "circle",
    text: "10",
    x: 200,
    y: 40,
    foregroundColor: BST.FOREGROUND_COLOR,
    backgroundColor: BST.BACKGROUND_COLOR,
  });
  assert.deepEqual(state.edges.get("0->2"), {
    from: 0,
    to: 2,
    color: "#000000",
    curve: 0,
    directed: true,
    label: "",
    connectionPoint: 0,
    type: "connect",
  });
});

test("BST findElement emits readable search blocks and replay reaches found message", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const findAnimation = bst.findElement(5);

  assert.deepEqual(blockLabels(findAnimation), ["find 5", "start search", "10: search left", "found 5"]);
  assert.deepEqual(findAnimation[0].meta.tags, ["search", "find"]);
  assert.deepEqual(findAnimation[2].meta.tags, ["search", "compare", "left"]);
  assert.equal(findAnimation[2].meta.focusNodeId, 2);
  assert.deepEqual(findAnimation[3].meta.tags, ["search", "found"]);
  assert.equal(findAnimation[3].meta.focusNodeId, 3);

  const state = replayAnimation([...insertRoot, ...insertLeft, ...findAnimation]);
  assert.equal(state.message, "Found:5");
  assert.equal(state.objects.get(3).text, "5");
  assert.equal(state.objects.get(3).highlighted, false);
});

test("BST deleteElement removes a leaf in replayed state", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const deleteAnimation = bst.deleteElement(5);

  assert.deepEqual(
    blockLabels(deleteAnimation),
    ["delete 5", "start delete", "inspect 10", "inspect 5", "resize tree", "delete leaf 5"],
  );
  assert.deepEqual(deleteAnimation[0].meta.tags, ["delete"]);
  assert.deepEqual(deleteAnimation[1].meta.tags, ["delete", "start"]);
  assert.deepEqual(deleteAnimation[2].meta.tags, ["delete", "inspect"]);
  assert.equal(deleteAnimation[2].meta.focusNodeId, 2);
  assert.deepEqual(deleteAnimation[4].meta.tags, ["layout", "resize"]);
  assert.deepEqual(deleteAnimation[5].meta.tags, ["delete", "leaf"]);
  assert.equal(deleteAnimation[5].meta.focusNodeId, 3);

  const state = replayAnimation([...insertRoot, ...insertLeft, ...deleteAnimation]);
  assert.equal(state.objects.has(3), false);
  assert.equal(state.edges.has("2->3"), false);
  assert.equal(state.objects.get(2).text, "10");
});

test("BST deleteElement successor path emits successor metadata and updates replayed state", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const insertRight = bst.insertElement(15);
  const insertRightLeft = bst.insertElement(12);
  const deleteAnimation = bst.deleteElement(10);

  assert.deepEqual(
    blockLabels(deleteAnimation),
    [
      "delete 10",
      "start delete",
      "inspect 10",
      "find successor for 10",
      "move to right subtree",
      "walk to leftmost node",
      "found successor 12",
      "copy successor 12",
      "remove successor 12",
      "inspect 15",
      "inspect 12",
      "resize tree",
      "delete leaf 12",
    ],
  );

  assert.deepEqual(deleteAnimation[3].meta.tags, ["delete", "successor"]);
  assert.equal(deleteAnimation[3].meta.focusNodeId, 2);
  assert.deepEqual(deleteAnimation[4].meta.tags, ["delete", "successor", "right"]);
  assert.equal(deleteAnimation[4].meta.focusNodeId, 4);
  assert.deepEqual(deleteAnimation[5].meta.tags, ["delete", "successor", "left-walk"]);
  assert.equal(deleteAnimation[5].meta.focusNodeId, 5);
  assert.deepEqual(deleteAnimation[6].meta.tags, ["delete", "successor", "found"]);
  assert.equal(deleteAnimation[6].meta.focusNodeId, 5);
  assert.deepEqual(deleteAnimation[7].meta.tags, ["delete", "successor", "copy"]);
  assert.equal(deleteAnimation[7].meta.focusNodeId, 2);
  assert.deepEqual(deleteAnimation[8].meta.tags, ["delete", "successor", "remove"]);
  assert.equal(deleteAnimation[8].meta.focusNodeId, 5);
  assert.deepEqual(deleteAnimation[11].meta.tags, ["layout", "resize"]);
  assert.deepEqual(deleteAnimation[12].meta.tags, ["delete", "leaf"]);
  assert.equal(deleteAnimation[12].meta.focusNodeId, 5);

  const state = replayAnimation([
    ...insertRoot,
    ...insertLeft,
    ...insertRight,
    ...insertRightLeft,
    ...deleteAnimation,
  ]);

  assert.equal(bst.treeRoot.data, 12);
  assert.equal(state.objects.get(2).text[0], "12");
  assert.equal(state.objects.has(5), false);
  assert.equal(state.edges.has("4->5"), false);
  assert.equal(state.edges.has("0->2"), true);
  assert.equal(state.edges.has("2->3"), true);
  assert.equal(state.edges.has("2->4"), true);
});

test("BST rotateRightAtValue rewires replayed edges and updates the root", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const rotateAnimation = bst.rotateRightAtValue(10);

  assert.deepEqual(
    blockLabels(rotateAnimation),
    ["rotate right at 10", "highlight 10 and 5", "resize tree"],
  );
  assert.deepEqual(rotateAnimation[0].meta.tags, ["rotate", "right"]);
  assert.deepEqual(rotateAnimation[1].meta.tags, ["rotate", "right", "highlight"]);
  assert.equal(rotateAnimation[1].meta.focusNodeId, 2);
  assert.deepEqual(rotateAnimation[2].meta.tags, ["layout", "resize"]);

  const state = replayAnimation([...insertRoot, ...insertLeft, ...rotateAnimation]);
  assert.equal(bst.treeRoot.data, 5);
  assert.equal(state.edges.has("0->2"), false);
  assert.equal(state.edges.has("0->3"), true);
  assert.equal(state.edges.has("3->2"), true);
});

test("BST rotateLeftAtValue rewires replayed edges and updates the root", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertRight = bst.insertElement(15);
  const rotateAnimation = bst.rotateLeftAtValue(10);

  assert.deepEqual(
    blockLabels(rotateAnimation),
    ["rotate left at 10", "highlight 10 and 15", "resize tree"],
  );
  assert.deepEqual(rotateAnimation[0].meta.tags, ["rotate", "left"]);
  assert.deepEqual(rotateAnimation[1].meta.tags, ["rotate", "left", "highlight"]);
  assert.equal(rotateAnimation[1].meta.focusNodeId, 2);
  assert.deepEqual(rotateAnimation[2].meta.tags, ["layout", "resize"]);

  const state = replayAnimation([...insertRoot, ...insertRight, ...rotateAnimation]);
  assert.equal(bst.treeRoot.data, 15);
  assert.equal(state.edges.has("0->2"), false);
  assert.equal(state.edges.has("0->3"), true);
  assert.equal(state.edges.has("3->2"), true);
});

test("BST printTree inorder emits traversal metadata and final output message", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const insertRight = bst.insertElement(15);
  const printAnimation = bst.printTree("In");

  assert.equal(printAnimation[0].label, "print In order");
  assert.deepEqual(printAnimation[0].meta.tags, ["print", "in"]);
  assert.ok(blockLabels(printAnimation).includes("visit root"));
  assert.ok(blockLabels(printAnimation).includes("5: no left child"));
  assert.ok(blockLabels(printAnimation).includes("print 5"));
  assert.ok(blockLabels(printAnimation).includes("print 10"));
  assert.ok(blockLabels(printAnimation).includes("print 15"));
  const printBlocks = printAnimation.filter((block) => block.label && block.label.startsWith("print "));
  assert.deepEqual(
    printBlocks.map((block) => block.meta.tags),
    [["print", "in"], ["print", "output"], ["print", "output"], ["print", "output"]],
  );

  const state = replayAnimation([...insertRoot, ...insertLeft, ...insertRight, ...printAnimation]);
  assert.equal(state.message, "Final output: 5, 10, 15");
});

test("BST deleteElement reports not-found searches with delete metadata", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const deleteAnimation = bst.deleteElement(42);

  assert.deepEqual(
    blockLabels(deleteAnimation),
    ["delete 42", "start delete", "inspect 10", "value not found"],
  );
  assert.equal(deleteAnimation[2].steps[1].message, "Elemet 42 not found, could not delete");
  assert.deepEqual(deleteAnimation[3].meta.tags, ["delete", "not-found"]);

  const state = replayAnimation([...insertRoot, ...insertLeft, ...deleteAnimation]);
  assert.equal(state.message, "");
  assert.equal(state.objects.has(2), true);
  assert.equal(state.objects.has(3), true);
});

test("BST rotateLeftAtValue blocked case emits invalid-rotation metadata", () => {
  const bst = createBareBST();
  const insertRoot = bst.insertElement(10);
  const insertLeft = bst.insertElement(5);
  const rotateAnimation = bst.rotateLeftAtValue(10);

  assert.deepEqual(
    blockLabels(rotateAnimation),
    ["rotate left at 10", "cannot rotate left at 10"],
  );
  assert.deepEqual(rotateAnimation[1].meta.tags, ["rotate", "left", "invalid"]);
  assert.equal(rotateAnimation[1].meta.focusNodeId, 2);

  const state = replayAnimation([...insertRoot, ...insertLeft, ...rotateAnimation]);
  assert.equal(state.message, "");
  assert.equal(state.edges.has("0->2"), true);
  assert.equal(state.edges.has("2->3"), true);
});

test("BST describe summarizes the current tree structure", () => {
  const bst = createBareBST();
  bst.treeRoot = {
    data: 10,
    left: { data: 5, left: null, right: null },
    right: { data: 15, left: null, right: null },
  };

  assert.equal(
    bst.describe(),
    "Root is 10 has a left child 5 and right child 15. 5 has no children. 15 has no children.",
  );
});

test("BST describeFromState summarizes the replayed tree state", () => {
  const bst = createBareBST();
  const insert10 = bst.insertElement(10);
  const insert5 = bst.insertElement(5);
  const state = replayAnimation([...insert10, ...insert5]);

  assert.equal(
    bst.describeFromState(state),
    "Root is 10 has a left child 5. 5 has no children.",
  );
});
