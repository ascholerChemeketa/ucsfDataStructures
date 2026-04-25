import { assert, test } from "./harness.js";
import { blockLabels, createBareBFS, replayAnimation } from "./shared.js";

test("BFS doBFS emits labeled canonical blocks for explore, discover, skip, and complete phases", () => {
  const bfs = createBareBFS();
  const animation = bfs.doBFS(0);
  const labels = blockLabels(animation);

  assert.equal(animation[0].label, "bfs from 0");
  assert.deepEqual(animation[0].meta.tags, ["search", "bfs"]);
  assert.ok(labels.includes("explore 0"));
  assert.ok(labels.includes("check edge 0 -> 1"));
  assert.ok(labels.includes("discover 1 from 0"));
  assert.ok(labels.includes("skip visited 2"));
  assert.ok(labels.includes("explore 2"));
  assert.equal(labels.at(-1), "complete bfs");

  const discoverBlock = animation.find((block) => block.label === "discover 1 from 0");
  assert.deepEqual(discoverBlock.meta.tags, ["search", "discover", "enqueue"]);
  assert.equal(discoverBlock.meta.focusNodeId, 101);

  const skipBlock = animation.find((block) => block.label === "skip visited 2");
  assert.deepEqual(skipBlock.meta.tags, ["search", "skip", "visited"]);
  assert.equal(skipBlock.meta.focusNodeId, 102);
});

test("BFS doBFS replay exposes visited state, parent links, and final highlighted tree edges", () => {
  const bfs = createBareBFS();
  const animation = bfs.doBFS(0);
  const state = replayAnimation(animation);

  assert.equal(state.message, "Queue is empty. BFS complete. Search tree highlighted.");
  assert.equal(state.objects.get(200).text[0], "f");
  assert.equal(state.objects.get(201).text[0], "T");
  assert.equal(state.objects.get(202).text[0], "T");
  assert.equal(state.objects.get(211).text[0], "0");
  assert.equal(state.objects.get(212).text[0], "0");
  assert.equal(state.edges.get("100->101").color, "var(--svgColor--althighlight)");
  assert.equal(state.edges.get("100->101").highlighted, true);
  assert.equal(state.edges.get("100->102").color, "var(--svgColor--althighlight)");
  assert.equal(state.edges.get("100->102").highlighted, true);
  assert.equal(state.edges.get("101->102").highlighted, false);
  assert.equal(state.objects.has(350), false);
  assert.equal(state.objects.has(351), false);
  assert.equal(state.objects.has(352), false);
});
