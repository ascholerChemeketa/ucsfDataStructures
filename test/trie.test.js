import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareTrie,
  replayAnimation,
} from "./shared.js";

test("Trie add emits canonical root, node, descend, and complete blocks", () => {
  const trie = createBareTrie();
  const animation = trie.add("CAT");
  const labels = blockLabels(animation);

  assert.equal(animation[0].label, "insert CAT");
  assert.ok(labels.includes("create root"));
  assert.ok(labels.includes("create node C"));
  assert.ok(labels.includes("create node A"));
  assert.ok(labels.includes("create node T"));
  assert.ok(labels.includes("descend C"));
  assert.equal(labels.at(-1), "insert complete");

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(trie.root.graphicID).text, "");
});

test("Trie find and delete emit outcome and cleanup blocks", () => {
  const trie = createBareTrie();
  const insertAnimation = trie.add("CAT");
  const findAnimation = trie.findElement("CAT");
  const deleteAnimation = trie.deleteElement("CAT");

  assert.equal(blockLabels(findAnimation).at(-1), "found CAT");
  assert.ok(blockLabels(deleteAnimation).includes("unset word flag for CAT"));
  assert.ok(blockLabels(deleteAnimation).includes("cleanup T"));
  assert.ok(blockLabels(deleteAnimation).includes("cleanup root"));
  assert.equal(blockLabels(deleteAnimation).at(-1), "delete complete");
  assert.equal(trie.root, null);

  const state = replayAnimation([...insertAnimation, ...findAnimation, ...deleteAnimation]);
  assert.equal(state.message, "");
});
