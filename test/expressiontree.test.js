import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareExpressionTree,
  replayAnimation,
} from "./shared.js";

function sampleExpressionTree() {
  return {
    label: "+",
    children: [
      { label: "3", children: [] },
      { label: "*", children: [{ label: "4", children: [] }, { label: "5", children: [] }] },
    ],
  };
}

test("ExpressionTree buildTree emits canonical create-node blocks", () => {
  const tree = createBareExpressionTree();
  const animation = tree.buildTree(sampleExpressionTree());

  assert.equal(animation[0].label, "build expression tree");
  assert.deepEqual(animation[0].meta.tags, ["build"]);
  assert.ok(blockLabels(animation).includes("create node +"));
  assert.ok(blockLabels(animation).includes("create node 3"));
  assert.ok(blockLabels(animation).includes("create node *"));

  const state = replayAnimation(animation);
  assert.equal(state.objects.size, 5);
  assert.equal(state.edges.size, 4);
});

test("ExpressionTree printTree and evaluateTree emit readable traversal/evaluation blocks", () => {
  const tree = createBareExpressionTree();
  const buildAnimation = tree.buildTree(sampleExpressionTree());
  const printAnimation = tree.printTree("In");
  const evaluateAnimation = tree.evaluateTree();

  assert.equal(printAnimation[0].label, "print In order");
  assert.ok(blockLabels(printAnimation).includes("visit root"));
  assert.ok(blockLabels(printAnimation).includes("print +"));
  assert.ok(blockLabels(printAnimation).includes("final print output"));

  assert.equal(evaluateAnimation[0].label, "evaluate expression tree");
  assert.ok(blockLabels(evaluateAnimation).includes("start evaluation"));
  assert.ok(blockLabels(evaluateAnimation).includes("compute *"));
  assert.ok(blockLabels(evaluateAnimation).includes("compute +"));
  assert.equal(blockLabels(evaluateAnimation).at(-1), "final result 23");

  const state = replayAnimation([...buildAnimation, ...printAnimation, ...evaluateAnimation]);
  assert.equal(state.message, "Final result: 23");
});

test("ExpressionTree describe summarizes the current expression tree", () => {
  const tree = createBareExpressionTree();
  tree.treeRoot = sampleExpressionTree();

  assert.equal(
    tree.describe(),
    "Root is + has left child 3 and right child *. 3 has no children. * has left child 4 and right child 5. 4 has no children. 5 has no children.",
  );
});

test("ExpressionTree describeFromState summarizes the replayed expression tree", () => {
  const tree = createBareExpressionTree();
  const state = replayAnimation(tree.buildTree(sampleExpressionTree()));

  assert.equal(
    tree.describeFromState(state),
    "Root is + has left child 3 and right child *. 3 has no children. * has left child 4 and right child 5. 4 has no children. 5 has no children.",
  );
});
