import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareBPlusTree,
  createBPlusNode,
  replayAnimation,
} from "./shared.js";

test("BPlusTree insertElement emits canonical blocks for root creation", () => {
  const tree = createBareBPlusTree();
  const animation = tree.insertElement("0010");

  assert.deepEqual(blockLabels(animation), [
    "insert 0010",
    "start insert 0010",
    "create root 0010",
  ]);
  assert.deepEqual(animation[0].meta.tags, ["insert"]);
  assert.deepEqual(animation[1].meta.tags, ["insert", "start"]);
  assert.deepEqual(animation[2].meta.tags, ["insert", "root"]);

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(3).kind, "btreeNode");
  assert.equal(state.objects.get(3).text[0], "0010");
  assert.equal(tree.treeRoot.keys[0], "0010");
});

test("BPlusTree findElement emits readable search metadata for found and missing values", () => {
  const tree = createBareBPlusTree();
  const root = createBPlusNode({ graphicID: 10, keys: ["0010", "0020"], x: 200, y: 30 });
  tree.treeRoot = root;

  const foundAnimation = tree.findElement("0020");
  assert.deepEqual(blockLabels(foundAnimation), [
    "find 0020",
    "inspect node 10",
    "found 0020",
  ]);
  assert.deepEqual(foundAnimation[2].meta.tags, ["search", "found"]);
  assert.equal(foundAnimation[2].meta.focusNodeId, 10);

  const missingAnimation = tree.findElement("0015");
  assert.deepEqual(blockLabels(missingAnimation), [
    "find 0015",
    "inspect node 10",
    "value 0015 not found",
  ]);
  assert.deepEqual(missingAnimation[2].meta.tags, ["search", "not-found"]);
});

test("BPlusTree printTree emits traversal and output blocks across linked leaves", () => {
  const tree = createBareBPlusTree();
  const leftLeaf = createBPlusNode({
    graphicID: 11,
    keys: ["0005", "0010"],
    x: 140,
    y: 80,
  });
  const rightLeaf = createBPlusNode({
    graphicID: 12,
    keys: ["0015", "0020"],
    x: 260,
    y: 80,
  });
  leftLeaf.next = rightLeaf;
  const root = createBPlusNode({
    graphicID: 10,
    keys: ["0015"],
    x: 200,
    y: 30,
    isLeaf: false,
    children: [leftLeaf, rightLeaf],
  });
  leftLeaf.parent = root;
  rightLeaf.parent = root;
  tree.treeRoot = root;

  const animation = tree.printTree("");

  assert.equal(animation[0].label, "print tree");
  assert.ok(blockLabels(animation).includes("find leftmost leaf"));
  assert.ok(blockLabels(animation).includes("descend to child 0 from node 10"));
  assert.ok(blockLabels(animation).includes("print key 0005"));
  assert.ok(blockLabels(animation).includes("print key 0020"));
  assert.ok(blockLabels(animation).includes("advance to next leaf from 11"));

  const outputBlocks = animation.filter((block) => block.label && block.label.startsWith("print key "));
  assert.deepEqual(
    outputBlocks.map((block) => block.meta.tags),
    [["print", "output"], ["print", "output"], ["print", "output"], ["print", "output"]],
  );
});

test("BPlusTree insertElement split path emits split and resize metadata and rewires replayed edges", () => {
  const tree = createBareBPlusTree();
  const insert10 = tree.insertElement("0010");
  const insert20 = tree.insertElement("0020");
  const insert30 = tree.insertElement("0030");

  const labels = blockLabels(insert30);
  assert.ok(labels.includes("inspect node 3 for insert"));
  assert.ok(labels.includes("resize tree"));
  assert.ok(labels.includes("split node 3"));

  const splitBlock = insert30.find((block) => block.label === "split node 3");
  assert.deepEqual(splitBlock.meta.tags, ["insert", "split"]);
  assert.equal(splitBlock.meta.focusNodeId, 3);

  const resizeBlock = insert30.find((block) => block.label === "resize tree");
  assert.deepEqual(resizeBlock.meta.tags, ["layout", "resize"]);

  const state = replayAnimation([...insert10, ...insert20, ...insert30]);
  assert.equal(tree.treeRoot.isLeaf, false);
  assert.equal(state.objects.get(tree.treeRoot.graphicID).text[0], "0020");
  assert.equal(state.edges.has(`${tree.treeRoot.graphicID}->3`), true);
  assert.equal(state.edges.has(`${tree.treeRoot.graphicID}->4`), true);
});
