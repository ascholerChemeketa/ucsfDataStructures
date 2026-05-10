// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

// Minimal Skip List visualization leveraging CreateLinkedList nodes across levels.
// Focus: insert/find with coin-flip messaging, vertical towers, and horizontal links.

const START_X = 120;
const LEVEL_START_Y = 120;
const LEVEL_SPACING_Y = 80;
const NODE_WIDTH = 60;
const NODE_HEIGHT = 25;
const SPACING_X = 80;

// Sentinel labels for head/tail per level.
const HEAD_LABEL = "HEAD";
const TAIL_LABEL = "TAIL";

// Max levels safeguard. We will grow as needed up to this cap.
const MAX_LEVELS = 6;

export function SkipList(opts = {}) {
  if (!opts.title) opts.title = "SkipList";
  opts.heightSingleMode = 420;
  opts.height = 480;
  opts.heightMobile = 620;

  let am = initAnimationManager(opts);
  this.init(am, 900, 500);

  // Seed initial data if provided.
  const seed = Array.isArray(opts.initialData) ? opts.initialData.slice() : [];
  for (let v of seed) {
    this.implementAction(this.insertElement.bind(this), v);
    // Commit each seed insert so nodes exist before the next insert,
    // without clearing history.
    this.animationManager.skipForward();
  }
  // Keep full animation history; no mid-seed clear.
  if (seed.length > 0) {
    this.animationManager.animatedObjects.draw();
  }
}

SkipList.prototype = new Algorithm();
SkipList.prototype.constructor = SkipList;
SkipList.superclass = Algorithm.prototype;

SkipList.prototype.init = function (am, w, h) {
  SkipList.superclass.init.call(this, am, w, h);
  // Use a high starting ID to avoid any potential collisions
  // with small IDs that may be reserved or used elsewhere.
  this.nextIndex = 1000;
  this.commands = [];

  // UI controls
  this.addControls();

  // Levels: each level has ordered nodes (including sentinels) and value list.
  // nodesByLevel[L] = [{ id, value, isSentinel } ...]
  this.nodesByLevel = [];
  this.valueSet = new Set(); // Track unique inserted values for simple demo.

  // Map value -> tower IDs per level for vertical connections.
  this.towerByValue = new Map(); // value -> { levelToID: Map(level -> id) }
  this.knownIDs = new Set();
  this.levelMembers = [];
  // Track next-pointer neighbor per level to avoid duplicate edges.
  this.nextByLevel = [];

  // Start with one level (0) containing just HEAD -> TAIL.
  this.ensureLevel(0);
  // Flush initial sentinel creation so nodes exist before any actions.
  this.animationManager.StartNewAnimation(this.commands);
  // Do not clear history here; allow initial sentinel animation to be retained.
  this.commands = [];
};

SkipList.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6,
  );

  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);

  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.removeCallback.bind(this);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);

  this.insertRandomButton = addControlToAlgorithmBar("Button", "Add Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
};

SkipList.prototype.insertCallback = function () {
  var insertedValue = this.normalizeNumber(this.inputField.value, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

SkipList.prototype.findCallback = function () {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

SkipList.prototype.removeCallback = function () {
  var deletedValue = this.normalizeNumber(this.inputField.value, 4);
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.removeElement.bind(this), deletedValue);
  }
};

SkipList.prototype.clearCallback = function () {
  this.implementAction(this.clearAll.bind(this), 0);
};

SkipList.prototype.reset = function () {
  // We reset to a single empty level.
  this.nextIndex = 0;
  this.commands = [];
  this.nodesByLevel = [];
  this.valueSet = new Set();
  this.towerByValue = new Map();
  this.ensureLevel(0);
};

SkipList.prototype.beginSkipListAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "SkipList", operation, ...meta });
};

SkipList.prototype.markAnimationStep = function (label, meta = {}) {
  this.step(label, {
    source: "SkipList",
    operation: this.currentAnimationOperation,
    ...meta,
  });
};

SkipList.prototype.finishSkipListAnimation = function () {
  this.currentAnimationOperation = null;
  return this.finishAnimation();
};

// Public programmatic bindings
SkipList.prototype.doInsert = function (v) {
  this.implementAction(this.insertElement.bind(this), v);
};
SkipList.prototype.doFindValue = function (v) {
  this.implementAction(this.findElement.bind(this), v);
};
// Alias for consistency with other algorithms
SkipList.prototype.doFind = function (v) {
  this.implementAction(this.findElement.bind(this), v);
};
SkipList.prototype.doRemove = function (v) {
  this.implementAction(this.removeElement.bind(this), v);
};
SkipList.prototype.doInsertRandom = function (count = 10, maxValue = 999) {
  for (let i = 0; i < count; i++) {
    const v = Math.floor(1 + Math.random() * maxValue);
    this.implementAction(this.insertElement.bind(this), v);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
SkipList.prototype.doClear = function () {
  this.implementAction(this.clearAll.bind(this), 0);
};

SkipList.prototype.insertRandomCallback = function () {
  const numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const v = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), v);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};

SkipList.prototype.clearAll = function () {
  this.beginSkipListAnimation("clear", "clear skip list", { tags: ["clear"] });
  // Delete all graphics and reset.
  for (let lvl = 0; lvl < this.nodesByLevel.length; lvl++) {
    for (let n of this.nodesByLevel[lvl]) {
      this.cmd("Delete", n.id);
    }
  }
  this.nodesByLevel = [];
  this.valueSet = new Set();
  this.towerByValue = new Map();
  this.knownIDs = new Set();
  this.ensureLevel(0);
  this.markAnimationStep("skip list cleared", {
    tags: ["clear", "complete"],
  });
  return this.finishSkipListAnimation();
};

SkipList.prototype.ensureLevel = function (level) {
  while (this.nodesByLevel.length <= level) {
    const L = this.nodesByLevel.length;
    const y = LEVEL_START_Y + L * LEVEL_SPACING_Y;

    const headID = this.nextIndex++;
    const tailID = this.nextIndex++;

    this.cmd(
      "CreateLinkedList",
      headID,
      "",
      NODE_WIDTH,
      NODE_HEIGHT,
      START_X,
      y,
      0.25,
      0,
      1,
      1,
    );
    this.cmd("SetText", headID, HEAD_LABEL);
    this.cmd("SetNull", headID, 0);
    this.knownIDs.add(headID);

    this.cmd(
      "CreateLinkedList",
      tailID,
      "",
      NODE_WIDTH,
      NODE_HEIGHT,
      START_X + SPACING_X,
      y,
      0.25,
      0,
      1,
      1,
    );
    this.cmd("SetText", tailID, TAIL_LABEL);
    this.cmd("SetNull", tailID, 1);
    this.knownIDs.add(tailID);
    // Do not connect HEAD→TAIL here; relayout will manage edges to prevent duplicates.

    this.nodesByLevel.push([
      { id: headID, value: -Infinity, isSentinel: true },
      { id: tailID, value: +Infinity, isSentinel: true },
    ]);
    this.levelMembers[L] = new Set([headID, tailID]);
    this.nextByLevel[L] = new Map();
    
  }
};

SkipList.prototype.relayoutLevel = function (level) {
  const y = LEVEL_START_Y + (this.nodesByLevel.length - 1 - level) * LEVEL_SPACING_Y;
  const arr = this.nodesByLevel[level];
  const base = this.nodesByLevel[0];
  const baseX = new Map();
  for (let i = 0; i < base.length; i++) {
    const colX = START_X + i * SPACING_X;
    baseX.set(base[i].value, colX);
  }
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];
    const mappedX = baseX.get(node.value);
    const x = typeof mappedX === "number" ? mappedX : START_X + i * SPACING_X;
    this.cmd("Move", node.id, x, y);
  }
  // this.cmd("Step");

  // Reconnect next pointers according to order.
  const prevMembers = this.levelMembers[level] || new Set();
  const prevNext = this.nextByLevel[level] || new Map();
  const newNext = new Map();

  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    const b = arr[i + 1];

    // Remove stale same-level edges from 'a' to any node previously in this level
    // other than the intended next 'b'.
    for (let id of prevMembers) {
      if (id !== a.id && (!b || id !== b.id)) {
        if (this.knownIDs.has(a.id) && this.knownIDs.has(id)) {
          this.cmd("Disconnect", a.id, id);
        }
      }
    }

    const prevNextId = prevNext.get(a.id);
    if (!b) {
      // No next: ensure any prior next edge is removed and mark null.
      if (prevNextId && this.knownIDs.has(a.id) && this.knownIDs.has(prevNextId)) {
        this.cmd("Disconnect", a.id, prevNextId);
      }
      this.cmd("SetNull", a.id, 1);
    } else {
      // Has next: clear null and ensure a single edge a→b with no duplicates.
      this.cmd("SetNull", a.id, 0);

      if (this.knownIDs.has(a.id) && this.knownIDs.has(b.id)) {
        // If the next changed (or wasn't set), remove any lingering duplicates first.
        if (prevNextId !== b.id) {
          // Proactively disconnect a→b to clear any duplicate edge instances, then connect once.
          this.cmd("Disconnect", a.id, b.id);
          this.cmd("SetMessage", "Connect L" + level + " from " + a.id + " -> " + b.id);
          this.cmd("Connect", a.id, b.id, "#000000", 0);
        }
        // Record the next neighbor for de-dup in future relayouts.
        newNext.set(a.id, b.id);
      } else {
        this.cmd("SetMessage", "Skip connect: missing node " + (!this.knownIDs.has(a.id) ? a.id : b.id));
      }

      if (i === arr.length - 2) {
        this.cmd("SetNull", b.id, 1);
      }
    }
  }

  // Update tracking to current state.
  this.levelMembers[level] = new Set(arr.map(n => n.id));
  this.nextByLevel[level] = newNext;
};

SkipList.prototype.insertElement = function (value) {
  this.beginSkipListAnimation("insert", `insert ${value}`, {
    tags: ["insert"],
  });

  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.finishSkipListAnimation();
  }
  value = Number(value);

  if (this.valueSet.has(value)) {
    this.cmd("SetMessage", "Value already exists: " + value);
    this.markAnimationStep("value already exists", {
      tags: ["insert", "duplicate"],
    });
    this.cmd("SetMessage", "");
    return this.finishSkipListAnimation();
  }

  this.cmd("SetMessage", "Insert " + value);
  this.markAnimationStep(`start insert ${value}`, {
    tags: ["insert", "start"],
  });

  // 1) Search from the top level to locate predecessors on each level.
  const topLevel = this.nodesByLevel.length - 1;
  const prevIndexByLevel = new Map(); // level -> index of predecessor
  let lvl = topLevel;
  let idx = 0; // start at HEAD on top
  const searchHi = this.nextIndex++;
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  this.cmd("CreateHighlightCircle", searchHi, "#0088cc", this.animationManager.animatedObjects.getNodeX(topHeadID), this.animationManager.animatedObjects.getNodeY(topHeadID));
  this.cmd("SetMessage", "Start search at top HEAD");
  this.cmd("Step");

  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];
    // Move to current position
    this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(arr[idx].id), this.animationManager.animatedObjects.getNodeY(arr[idx].id));
    this.cmd("Step");
    // Examine next and either advance or drop, highlighting the check.
    while (true) {
      const nextNode = arr[idx + 1];
      if (!nextNode) {
        this.cmd("SetMessage", "At L" + lvl + ": no next → drop");
        this.cmd("Step");
        break;
      }
      const nextText = nextNode.isSentinel ? (nextNode.value === Infinity ? "TAIL" : "HEAD") : String(nextNode.value);
      this.cmd("SetHighlight", nextNode.id, 1);
      this.cmd("SetMessage", "Check next at L" + lvl + ": " + nextText + (nextNode.value < value ? " < " : nextNode.value === value ? " = " : " ≥ ") + value);
      this.cmd("Step");
      if (nextNode.value < value) {
        // advance right
        this.cmd("SetMessage", "Advance right: " + nextText + " < " + value);
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(nextNode.id), this.animationManager.animatedObjects.getNodeY(nextNode.id));
        this.cmd("Step");
        continue;
      } else {
        // drop down
        this.cmd("SetMessage", "Drop down: " + nextText + (nextNode.value === value ? " = " : " ≥ ") + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break;
      }
    }
    // Record predecessor index at this level (current idx)
    prevIndexByLevel.set(lvl, idx);
    if (lvl > 0) {
      const curNode = arr[idx];
      let downID = null;
      if (curNode.isSentinel && curNode.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (curNode.isSentinel && curNode.value === +Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower = this.towerByValue.get(curNode.value);
        downID = tower && tower.levelToID.get(lvl - 1);
      }
      this.cmd("SetMessage", "Drop to L" + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(downID), this.animationManager.animatedObjects.getNodeY(downID));
        this.cmd("Step");
        // Update idx to node we dropped onto
        const lowerArr = this.nodesByLevel[lvl - 1];
        let newIdx = lowerArr.findIndex((n) => n.id === downID);
        idx = newIdx >= 0 ? newIdx : 0;
      } else {
        // If no vertical link (first insert), stay at HEAD
        idx = 0;
      }
    }
    lvl = lvl - 1;
  }
  // Finished search; remove the search highlight.
  this.cmd("Delete", searchHi);
  this.markAnimationStep("locate predecessors", {
    tags: ["insert", "search"],
  });

  // Base insertion index is predecessor+1 on level 0.
  const base = this.nodesByLevel[0];
  const idx0 = (prevIndexByLevel.get(0) || 0) + 1;
  this.cmd("SetMessage", "Base insert between " + (base[idx0 - 1].isSentinel ? "HEAD" : base[idx0 - 1].value) + " and " + (base[idx0].isSentinel ? "TAIL" : base[idx0].value));
  this.markAnimationStep(`identify base slot ${idx0}`, {
    tags: ["insert", "slot"],
  });

  // 2) Flip coins to decide height after we know location.
  let height = 0;
  while (height < MAX_LEVELS - 1) {
    this.cmd("SetMessage", "Flip for level " + (height + 1));
    this.cmd("Step");
    const flip = Math.random() < 0.5;
    if (flip) {
      this.cmd("SetMessage", "Heads — promote");
      this.cmd("Step");
      height++;
    } else {
      this.cmd("SetMessage", "Tails — stop");
      this.cmd("Step");
      break;
    }
  }
  this.ensureLevel(height);

  const nodeIDs = [];
  const totalLevels = this.nodesByLevel.length; // after ensureLevel
  const columnX = START_X + idx0 * SPACING_X;
  for (let L = 0; L <= height; L++) {
    const y = LEVEL_START_Y + (totalLevels - 1 - L) * LEVEL_SPACING_Y;
    const id = this.nextIndex++;
    this.cmd("CreateLinkedList", id, "", NODE_WIDTH, NODE_HEIGHT, columnX, y, 0.25, 0, 1, 1);
    this.cmd("SetText", id, String(value));
    this.knownIDs.add(id);
    nodeIDs.push(id);
  }
  this.markAnimationStep(`create tower for ${value}`, {
    tags: ["insert", "tower"],
    focusNodeId: nodeIDs[0],
  });


  // Insert into level 0 at idx0.
  base.splice(idx0, 0, { id: nodeIDs[0], value, isSentinel: false });
  this.relayoutLevel(0);
  // Pause after base relayout.
  // this.cmd("Step");
  // After base changes, realign HEAD/TAIL columns across all existing levels.
  if (this.nodesByLevel.length > 1) {
    for (let lvl = 1; lvl < this.nodesByLevel.length; lvl++) {
      this.relayoutLevel(lvl);
    }
    // this.cmd("Step");
  }
  
  // Insert into higher levels, keeping relative sorted order.
  for (let L = 1; L <= height; L++) {
    const arr = this.nodesByLevel[L];
    const i = (prevIndexByLevel.get(L) || 0) + 1;
    this.cmd("SetMessage", "Insert on L" + L + " after predecessor at index " + (i - 1));
    // this.cmd("Step");
    arr.splice(i, 0, { id: nodeIDs[L], value, isSentinel: false });
    this.relayoutLevel(L);
    // Pause to show level relayout before tower connect.
    // this.cmd("Step");
    // Connect vertical tower link between this level and below.
    const belowID = nodeIDs[L - 1];
    const aboveID = nodeIDs[L];
    this.cmd("SetMessage", "Connect tower: level " + L + " node → lower level node");
    if (this.knownIDs.has(aboveID) && this.knownIDs.has(belowID)) {
      this.cmd("Connect", aboveID, belowID, "#6666ff", 0);
    } else {
      this.cmd("SetMessage", "Skip vertical connect: missing node");
    }
  }

  // Final pass: relayout any levels above the tower height so their TAILs
  // align to the base-level tail column.
  if (height + 1 < this.nodesByLevel.length) {
    for (let lvl = height + 1; lvl < this.nodesByLevel.length; lvl++) {
      this.relayoutLevel(lvl);
    }
    // this.cmd("Step");
  }

  // Remember tower mapping.
  this.valueSet.add(value);
  const tower = new Map();
  for (let lvl = 0; lvl <= height; lvl++) {
    tower.set(lvl, nodeIDs[lvl]);
  }
  this.towerByValue.set(value, { levelToID: tower });

  this.cmd("SetMessage", "Inserted " + value + (height > 0 ? " with height " + (height + 1) : ""));
  this.markAnimationStep(`insert complete ${value}`, {
    tags: ["insert", "complete"],
    focusNodeId: nodeIDs[0],
  });
  this.cmd("SetMessage", "");
  return this.finishSkipListAnimation();
};

// Disable/enable algorithm-specific UI during animations
SkipList.prototype.disableUI = function () {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.findButton,
    this.deleteButton,
    this.clearButton,
    this.insertRandomButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = true;
  }
};

SkipList.prototype.enableUI = function () {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.findButton,
    this.deleteButton,
    this.clearButton,
    this.insertRandomButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = false;
  }
};

SkipList.prototype.findElement = function (value) {
  this.beginSkipListAnimation("find", `find ${value}`, {
    tags: ["search", "find"],
  });
  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.finishSkipListAnimation();
  }
  value = Number(value);

  if (this.nodesByLevel.length === 0) return this.finishSkipListAnimation();

  this.cmd("SetMessage", "Find " + value);
  this.markAnimationStep(`start find ${value}`, {
    tags: ["search", "start"],
  });

  // Start from the highest level HEAD, move right while next.value < target, then drop.
  const topLevel = this.nodesByLevel.length - 1;
  let lvl = topLevel;
  let idx = 0; // Start at HEAD

  // Create a single highlight circle at the exact position of the top HEAD.
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  const highlightID = this.nextIndex++;
  this.cmd(
    "CreateHighlightCircle",
    highlightID,
    "#00aa00",
    this.animationManager.animatedObjects.getNodeX(topHeadID),
    this.animationManager.animatedObjects.getNodeY(topHeadID),
  );
  this.cmd("Step");

  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];

    // Ensure highlight sits on the current node before moving right.
    const currentID = arr[idx].id;
    this.cmd(
      "Move",
      highlightID,
      this.animationManager.animatedObjects.getNodeX(currentID),
      this.animationManager.animatedObjects.getNodeY(currentID),
    );
    this.cmd("Step");

    // Examine the next node to the right and decide to advance or drop.
    let advanced = false;
    while (true) {
      const nextNode = arr[idx + 1];
      if (!nextNode) {
        this.cmd("SetMessage", "At level " + lvl + ": no next → drop down");
        this.cmd("Step");
        break; // proceed to drop
      }

      // Highlight the node we're checking and describe the comparison.
      this.cmd("SetHighlight", nextNode.id, 1);
      const nextValText = nextNode.isSentinel ? (nextNode.value === Infinity ? "TAIL" : "HEAD") : String(nextNode.value);
      this.cmd("SetMessage", "Check next at L" + lvl + ": " + nextValText + (nextNode.value < value ? " < " : nextNode.value === value ? " = " : " ≥ ") + value);
      this.cmd("Step");

      if (nextNode.value < value) {
        // Advance right to the checked node.
        this.cmd("SetMessage", "Advance right: " + nextValText + " < " + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        const nid = arr[idx].id;
        this.cmd(
          "Move",
          highlightID,
          this.animationManager.animatedObjects.getNodeX(nid),
          this.animationManager.animatedObjects.getNodeY(nid),
        );
        this.cmd("Step");
        advanced = true;
        // Continue examining the next neighbor on the same level.
        continue;
      } else if (nextNode.value === value) {
        // Found target
        const targetID = nextNode.id;
        this.cmd("SetMessage", "Found " + value + " at level " + lvl);
        this.cmd(
          "CreateHighlightCircle",
          this.nextIndex++,
          "#ff8800",
          this.animationManager.animatedObjects.getNodeX(targetID),
          this.animationManager.animatedObjects.getNodeY(targetID),
        );
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        this.cmd("SetMessage", "");
        this.cmd("Delete", highlightID);
        this.markAnimationStep(`found ${value}`, {
          tags: ["search", "found"],
          focusNodeId: targetID,
        });
        return this.finishSkipListAnimation();
      } else {
        // Next is >= target: drop down.
        this.cmd("SetMessage", "Drop down: " + nextValText + " ≥ " + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break; // proceed to drop
      }
    }

    // Drop down a level by moving the same highlight circle.
    if (lvl > 0) {
      const cur = arr[idx];
      let downID = null;
      if (cur.isSentinel && cur.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (cur.isSentinel && cur.value === +Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower = this.towerByValue.get(cur.value);
        downID = tower && tower.levelToID.get(lvl - 1);
      }

      this.cmd("SetMessage", "Drop down to level " + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd(
          "Move",
          highlightID,
          this.animationManager.animatedObjects.getNodeX(downID),
          this.animationManager.animatedObjects.getNodeY(downID),
        );
      }
      this.cmd("Step");

      // Update index to match the node we dropped onto.
      const lowerArr = this.nodesByLevel[lvl - 1];
      let newIdx = lowerArr.findIndex((n) => n.id === downID);
      idx = newIdx >= 0 ? newIdx : 0; // default to HEAD if not found
    }

    lvl = lvl - 1;
  }

  this.cmd("SetMessage", "Not found: " + value);
  this.markAnimationStep(`not found ${value}`, {
    tags: ["search", "not-found"],
  });
  this.cmd("SetMessage", "");
  // Clean up the moving highlight circle.
  this.cmd("Delete", highlightID);
  return this.finishSkipListAnimation();
};

// Remove a value: top-down search animation, then delete tower nodes and relayout
SkipList.prototype.removeElement = function (value) {
  this.beginSkipListAnimation("remove", `remove ${value}`, {
    tags: ["delete"],
  });
  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.finishSkipListAnimation();
  }
  value = Number(value);

  if (this.nodesByLevel.length === 0) return this.finishSkipListAnimation();

  this.cmd("SetMessage", "Remove " + value);
  this.markAnimationStep(`start remove ${value}`, {
    tags: ["delete", "start"],
  });

  const topLevel = this.nodesByLevel.length - 1;
  let lvl = topLevel;
  let idx = 0; // Start at HEAD
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  const hi = this.nextIndex++;
  this.cmd("CreateHighlightCircle", hi, "#cc0000", this.animationManager.animatedObjects.getNodeX(topHeadID), this.animationManager.animatedObjects.getNodeY(topHeadID));
  this.cmd("Step");

  let found = false;
  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];
    // Move to current node
    this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(arr[idx].id), this.animationManager.animatedObjects.getNodeY(arr[idx].id));
    this.cmd("Step");

    // Repeatedly consider the NEXT node at this level with highlight
    while (true) {
      const hasNext = idx + 1 < arr.length;
      if (!hasNext) {
        // No next at this level: drop down
        break;
      }
      const nextNode = arr[idx + 1];
      const nextLabel = nextNode.isSentinel ? (nextNode.value === Infinity ? "TAIL" : "HEAD") : String(nextNode.value);
      this.cmd("SetHighlight", nextNode.id, 1);
      this.cmd("SetMessage", "L" + lvl + ": check next " + nextLabel + " vs " + value);
      this.cmd("Step");

      if (nextNode.value < value) {
        // Move right to next
        this.cmd("SetMessage", "L" + lvl + ": move right → " + nextLabel);
        this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(nextNode.id), this.animationManager.animatedObjects.getNodeY(nextNode.id));
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        continue;
      }

      if (nextNode.value === value) {
        found = true;
        this.cmd("SetMessage", "Found " + value + " — removing tower");
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break;
      }

      // next.value > value → drop down
      this.cmd("SetMessage", "L" + lvl + ": cannot move right (" + nextLabel + ">" + value + ") — drop");
      this.cmd("Step");
      this.cmd("SetHighlight", nextNode.id, 0);
      break;
    }

    if (found) {
      break;
    }

    // Drop down
    if (lvl > 0) {
      const cur = arr[idx];
      let downID = null;
      if (cur.isSentinel && cur.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (cur.isSentinel && cur.value === +Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower = this.towerByValue.get(cur.value);
        downID = tower && tower.levelToID.get(lvl - 1);
      }
      this.cmd("SetMessage", "Drop down to level " + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(downID), this.animationManager.animatedObjects.getNodeY(downID));
      }
      this.cmd("Step");
      const lowerArr = this.nodesByLevel[lvl - 1];
      let newIdx = lowerArr.findIndex((n) => n.id === downID);
      idx = newIdx >= 0 ? newIdx : 0;
    }
    lvl = lvl - 1;
  }

  if (!found) {
    this.cmd("SetMessage", "Not found: " + value);
    this.markAnimationStep(`not found ${value}`, {
      tags: ["delete", "not-found"],
    });
    this.cmd("Delete", hi);
    this.cmd("SetMessage", "");
    return this.finishSkipListAnimation();
  }

  // Remove tower nodes from top to base
  const tower = this.towerByValue.get(value);
  if (tower) {
    const levels = Array.from(tower.levelToID.keys()).sort((a,b)=>b-a);
    for (const L of levels) {
      const id = tower.levelToID.get(L);
      const arr = this.nodesByLevel[L];
      const pos = arr.findIndex((n) => n.id === id);
      if (pos >= 0) {
        // Disconnect vertical edge to below (if exists)
        const belowId = tower.levelToID.get(L-1);
        if (belowId && this.knownIDs.has(id) && this.knownIDs.has(belowId)) {
          this.cmd("Disconnect", id, belowId);
        }
        arr.splice(pos, 1);
        if (this.knownIDs.has(id)) {
          this.cmd("Delete", id);
          this.knownIDs.delete(id);
        }
        this.relayoutLevel(L);
        // this.cmd("Step");
      }
    }
  }

  // Align remaining levels after base change
  if (this.nodesByLevel.length > 1) {
    for (let L = 0; L < this.nodesByLevel.length; L++) {
      this.relayoutLevel(L);
    }
    // this.cmd("Step");
  }

  this.valueSet.delete(value);
  this.towerByValue.delete(value);

  this.cmd("Delete", hi);
  this.cmd("SetMessage", "Removed " + value);
  this.markAnimationStep(`remove complete ${value}`, {
    tags: ["delete", "complete"],
  });
  this.cmd("SetMessage", "");
  return this.finishSkipListAnimation();
};
