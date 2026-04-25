import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareBTree,
  createBTreeNode,
  replayAnimation,
} from "./shared.js";

test("BTree insertElement emits canonical blocks for root creation", () => {
  const tree = createBareBTree();
  const animation = tree.insertElement("0010");

  assert.deepEqual(blockLabels(animation), [
    "insert 0010",
    "start insert 0010",
    "create root",
  ]);
  assert.deepEqual(animation[0].meta.tags, ["insert"]);
  assert.deepEqual(animation[2].meta.tags, ["insert", "root"]);

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(3).kind, "btreeNode");
  assert.equal(state.objects.get(3).text[0], "0010");
});

test("BTree findElement emits inspect and outcome blocks", () => {
  const tree = createBareBTree();
  tree.treeRoot = createBTreeNode({ graphicID: 10, keys: ["0010", "0020"] });

  const foundAnimation = tree.findElement("0020");
  assert.deepEqual(blockLabels(foundAnimation), ["find 0020", "inspect node 10", "found 0020"]);
  assert.deepEqual(foundAnimation[2].meta.tags, ["search", "found"]);

  const missingAnimation = tree.findElement("0015");
  assert.deepEqual(blockLabels(missingAnimation), ["find 0015", "inspect node 10", "value 0015 not found"]);
  assert.deepEqual(missingAnimation[2].meta.tags, ["search", "not-found"]);
});

test("BTree printTree emits traversal and final output metadata", () => {
  const tree = createBareBTree();
  const leftLeaf = createBTreeNode({
    graphicID: 11,
    keys: ["0005"],
    x: 60,
    y: 80,
  });
  const rightLeaf = createBTreeNode({
    graphicID: 12,
    keys: ["0020"],
    x: 140,
    y: 80,
  });
  const root = createBTreeNode({
    graphicID: 10,
    keys: ["0010"],
    x: 100,
    y: 30,
    isLeaf: false,
    children: [leftLeaf, rightLeaf],
  });
  leftLeaf.parent = root;
  rightLeaf.parent = root;
  tree.treeRoot = root;

  const animation = tree.printTree("");

  assert.equal(animation[0].label, "print tree");
  assert.ok(blockLabels(animation).includes("descend leftmost from 10"));
  assert.ok(blockLabels(animation).includes("print leaf 11"));
  assert.ok(blockLabels(animation).includes("print key 0010"));
  assert.ok(blockLabels(animation).includes("print leaf 12"));
  assert.equal(blockLabels(animation).at(-1), "final print output");

  const state = replayAnimation(animation);
  assert.equal(state.message, "At end of root node. Final output:\n0005 0010 0020 ");
});
