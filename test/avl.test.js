import { assert, test } from "./harness.js";
import { AVL, blockLabels, createBareAVL, replayAnimation } from "./shared.js";

test("AVL insertElement emits labeled canonical blocks and replayable root state", () => {
  const avl = createBareAVL();
  const animation = avl.insertElement(10);

  assert.equal(animation[0].label, "insert 10");
  assert.deepEqual(animation[0].meta.tags, ["insert"]);
  assert.equal(animation[1].label, "create root");
  assert.deepEqual(animation[1].meta.tags, ["insert", "root"]);
  assert.equal(animation[2].label, "create height label");
  assert.deepEqual(animation[2].meta.tags, ["insert", "height"]);

  const state = replayAnimation(animation);
  assert.deepEqual(state.objects.get(2), {
    id: 2,
    kind: "circle",
    text: "10",
    x: 150,
    y: 50,
    foregroundColor: AVL.FOREGROUND_COLOR,
    backgroundColor: AVL.BACKGROUND_COLOR,
  });
  assert.equal(state.objects.get(3).text, "0");
  assert.equal(state.edges.has("0->2"), true);
});

test("AVL insertElement left-left case emits right rotation and updates root", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert2 = avl.insertElement(2);

  assert.ok(blockLabels(insert2).includes("rotate right around 10"));
  const rotationBlock = insert2.find((block) => block.label === "rotate right around 10");
  assert.deepEqual(rotationBlock.meta.tags, ["rotate", "right"]);
  assert.equal(rotationBlock.meta.focusNodeId, 2);
  assert.ok(blockLabels(insert2).includes("resize tree"));

  const state = replayAnimation([...insert10, ...insert5, ...insert2]);
  assert.equal(avl.treeRoot.data, 5);
  assert.equal(state.edges.has("0->4"), true);
  assert.equal(state.edges.has("4->2"), true);
  assert.equal(state.edges.has("4->8"), true);
});

test("AVL findElement emits search flow and replay reaches found message", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const findAnimation = avl.findElement(5);

  assert.equal(findAnimation[0].label, "find 5");
  assert.deepEqual(findAnimation[0].meta.tags, ["search", "find"]);
  assert.ok(findAnimation.some((block) => block.steps.some((step) => step.type === "setMessage" && String(step.message).includes("Element found"))));

  const state = replayAnimation([...insert10, ...insert5, ...findAnimation]);
  assert.equal(state.message, "Found:5");
});

test("AVL printTree inorder emits final output message", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert15 = avl.insertElement(15);
  const printAnimation = avl.printTree("In");

  assert.equal(printAnimation[0].label, "print In order");
  assert.deepEqual(printAnimation[0].meta.tags, ["print", "in"]);
  assert.ok(blockLabels(printAnimation).includes("visit root"));

  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...printAnimation]);
  assert.equal(state.message, "Final output: 5, 10, 15");
});

test("AVL insertElement left-right case emits double right rotation and updates root", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert7 = avl.insertElement(7);

  assert.ok(blockLabels(insert7).includes("double rotate right around 10"));
  const doubleBlock = insert7.find((block) => block.label === "double rotate right around 10");
  assert.deepEqual(doubleBlock.meta.tags, ["rotate", "double", "right"]);
  assert.equal(doubleBlock.meta.focusNodeId, 2);
  assert.ok(blockLabels(insert7).includes("finish left half of double right rotation"));
  assert.ok(blockLabels(insert7).includes("rotate left around 5"));
  assert.ok(blockLabels(insert7).includes("rotate right around 10"));

  const state = replayAnimation([...insert10, ...insert5, ...insert7]);
  assert.equal(avl.treeRoot.data, 7);
  assert.equal(state.edges.has("0->8"), true);
  assert.equal(state.edges.has("8->4"), true);
  assert.equal(state.edges.has("8->2"), true);
});

test("AVL deleteElement removes a leaf without rebalancing", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert15 = avl.insertElement(15);
  const deletedNodeId = avl.treeRoot.right.graphicID;
  const deleteAnimation = avl.deleteElement(15);

  assert.deepEqual(blockLabels(deleteAnimation), ["delete 15", "start delete"]);
  assert.deepEqual(deleteAnimation[0].meta.tags, ["delete"]);
  assert.deepEqual(deleteAnimation[1].meta.tags, ["delete", "start"]);

  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...deleteAnimation]);
  assert.equal(avl.treeRoot.data, 10);
  assert.equal(state.objects.has(deletedNodeId), false);
  assert.equal(state.edges.has(`2->${deletedNodeId}`), false);
  assert.equal(state.edges.has("0->2"), true);
});

test("AVL deleteElement can trigger right rotation rebalancing", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert15 = avl.insertElement(15);
  const insert2 = avl.insertElement(2);
  const deletedNodeId = avl.treeRoot.right.graphicID;
  const deleteAnimation = avl.deleteElement(15);

  assert.deepEqual(
    blockLabels(deleteAnimation),
    ["delete 15", "start delete", "rotate right around 10", "resize tree"],
  );
  const rotationBlock = deleteAnimation.find((block) => block.label === "rotate right around 10");
  assert.deepEqual(rotationBlock.meta.tags, ["rotate", "right"]);
  assert.equal(rotationBlock.meta.focusNodeId, 2);
  const resizeBlock = deleteAnimation.find((block) => block.label === "resize tree");
  assert.deepEqual(resizeBlock.meta.tags, ["layout", "resize"]);

  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...insert2, ...deleteAnimation]);
  assert.equal(avl.treeRoot.data, 5);
  assert.equal(state.objects.has(deletedNodeId), false);
  assert.equal(state.edges.has(`2->${deletedNodeId}`), false);
  assert.equal(state.edges.has(`0->${avl.treeRoot.graphicID}`), true);
  assert.equal(state.edges.has(`${avl.treeRoot.graphicID}->${avl.treeRoot.left.graphicID}`), true);
  assert.equal(state.edges.has(`${avl.treeRoot.graphicID}->${avl.treeRoot.right.graphicID}`), true);
});

test("AVL describe returns a readable preorder text description", () => {
  const avl = createBareAVL();
  avl.treeRoot = {
    data: 100,
    height: 3,
    left: {
      data: 50,
      height: 2,
      left: {
        data: 20,
        height: 1,
        left: {
          data: 10,
          height: 0,
          left: null,
          right: null,
        },
        right: null,
      },
      right: null,
    },
    right: {
      data: 150,
      height: 0,
      left: null,
      right: null,
    },
  };

  assert.equal(
    avl.describe(),
    "Root is 100 (height 3) has a left child 50 and right child 150. " +
      "50 (height 2) has a left child 20. " +
      "20 (height 1) has a left child 10. " +
      "10 (height 0) has no children. " +
      "150 (height 0) has no children.",
  );
});

test("AVL describe reports an empty tree", () => {
  const avl = createBareAVL();
  assert.equal(avl.describe(), "Tree is empty.");
});

test("AVL describeFromState summarizes the replayed tree state", () => {
  const avl = createBareAVL();
  const insert10 = avl.insertElement(10);
  const insert5 = avl.insertElement(5);
  const insert15 = avl.insertElement(15);
  const state = replayAnimation([...insert10, ...insert5, ...insert15]);

  assert.equal(
    avl.describeFromState(state),
    "Root is 10 (height 1) has a left child 5 and right child 15. 5 (height 0) has no children. 15 (height 0) has no children.",
  );
});
