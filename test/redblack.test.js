import { assert, test } from "./harness.js";
import {
  blockLabels,
  createBareRedBlack,
  replayAnimation,
} from "./shared.js";

test("RedBlack insertElement emits root creation blocks", () => {
  const tree = createBareRedBlack();
  const animation = tree.insertElement(10);

  assert.deepEqual(blockLabels(animation), ["insert 10", "start insert 10", "create root"]);
  assert.equal(animation[2].meta.focusNodeId, 3);

  const state = replayAnimation(animation);
  assert.equal(state.objects.get(3).text, "10");
  assert.equal(state.edges.has("0->3"), true);
});

test("RedBlack find and delete emit readable outcome blocks", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const findAnimation = tree.findElement(5);
  const deleteAnimation = tree.deleteElement(5);

  assert.ok(blockLabels(findAnimation).includes("10: search left"));
  assert.ok(blockLabels(findAnimation).includes("found 5"));
  assert.ok(blockLabels(deleteAnimation).includes("start delete"));
  assert.equal(blockLabels(deleteAnimation).at(-1), "delete complete");

  const state = replayAnimation([...insert10, ...insert5, ...findAnimation, ...deleteAnimation]);
  assert.equal(state.message.trim(), "");
});

test("RedBlack describe includes node color and ignores phantom leaves", () => {
  const tree = createBareRedBlack();
  tree.treeRoot = {
    data: 10,
    blackLevel: 1,
    phantomLeaf: false,
    left: {
      data: 5,
      blackLevel: 0,
      phantomLeaf: false,
      left: null,
      right: null,
    },
    right: {
      data: null,
      blackLevel: 1,
      phantomLeaf: true,
      left: null,
      right: null,
    },
  };

  assert.equal(
    tree.describe(),
    "Root is 10 (black) has a left child 5. 5 (red) has no children.",
  );
});

test("RedBlack describeFromState summarizes the replayed colored tree state", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const state = replayAnimation([...insert10, ...insert5]);

  assert.equal(
    tree.describeFromState(state),
    "Root is 10 (black) has a left child 5. 5 (red) has no children.",
  );
});

test("RedBlack 2-3-4 overlay groups red children with their black parent", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);
  const insert15 = tree.insertElement(15);

  tree.show234Groups.checked = true;
  const overlayAnimation = tree.updateGroupings();
  const state = replayAnimation([...insert10, ...insert5, ...insert15, ...overlayAnimation]);

  const groupBoxes = [...state.objects.values()].filter(
    (object) =>
      object.kind === "rectangle" &&
      object.backgroundColor === "rgba(255, 255, 255, 0)" &&
      object.foregroundColor === "var(--svgColor)",
  );
  assert.equal(groupBoxes.length, 1);
  assert.equal(groupBoxes[0].lineDash, "6 4");

  const circlesByText = new Map(
    [...state.objects.values()]
      .filter((object) => object.kind === "circle")
      .map((object) => [object.text, object]),
  );
  assert.equal(circlesByText.get("5").y - circlesByText.get("10").y, 36);
  assert.equal(circlesByText.get("15").y - circlesByText.get("10").y, 36);
});

test("RedBlack 2-3-4 overlay can be turned off", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);
  const insert5 = tree.insertElement(5);

  tree.show234Groups.checked = true;
  const overlayOn = tree.updateGroupings();
  tree.show234Groups.checked = false;
  const overlayOff = tree.updateGroupings();

  const state = replayAnimation([...insert10, ...insert5, ...overlayOn, ...overlayOff]);
  const groupBoxes = [...state.objects.values()].filter(
    (object) =>
      object.kind === "rectangle" &&
      object.backgroundColor === "rgba(255, 255, 255, 0)" &&
      object.foregroundColor === "var(--svgColor)",
  );
  assert.equal(groupBoxes.length, 0);
});

test("RedBlack 2-3-4 overlay cleans up boxes when deleting a black node", () => {
  const tree = createBareRedBlack();
  const insert10 = tree.insertElement(10);

  tree.show234Groups.checked = true;
  const overlayOn = tree.updateGroupings();
  const delete10 = tree.deleteElement(10);

  const state = replayAnimation([...insert10, ...overlayOn, ...delete10]);
  const groupBoxes = [...state.objects.values()].filter(
    (object) =>
      object.kind === "rectangle" &&
      object.backgroundColor === "rgba(255, 255, 255, 0)" &&
      object.foregroundColor === "var(--svgColor)",
  );
  assert.equal(groupBoxes.length, 0);
});
