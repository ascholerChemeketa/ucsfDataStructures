// Treap (Cartesian tree) visualization based on BST, with heap priorities.
// Supports insert/find/remove and insert random values. Priority shown next to node.

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

export function Treap(opts = {}) {
  if (!opts.title) opts.title = "Treap";
  opts.centered = true;

  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

  this.addControls();

  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

Treap.prototype = new Algorithm();
Treap.prototype.constructor = Treap;
Treap.superclass = Algorithm.prototype;

Treap.FOREGROUND_COLOR = "var(--svgColor)";
Treap.LINK_COLOR = Treap.FOREGROUND_COLOR;
Treap.HIGHLIGHT_CIRCLE_COLOR = Treap.FOREGROUND_COLOR;
Treap.PRIORITY_LABEL_COLOR = Treap.FOREGROUND_COLOR;
Treap.STARTING_Y = 40;
Treap.WIDTH_DELTA = 30;
Treap.HEIGHT_DELTA = 50;
// Priority label styling & placement
Treap.PRIORITY_FONT_PERCENT = 85; // slightly smaller text
Treap.PRIORITY_OFFSET_LEFT_X = 28; // move further left to avoid overlap
Treap.PRIORITY_OFFSET_RIGHT_X = 28; // right placement is good
Treap.PRIORITY_OFFSET_Y = 18;
// Priority-based node color (medium blue with alpha by priority)
Treap.PRIORITY_BASE_RGB = { r: 180, g: 220, b: 240 };
// Compute rgba color for a given priority (0..999/1000). Higher priority → lower alpha.
Treap.prototype.priorityColor = function (prio) {
  const a = Math.max(0, Math.min(1,  prio / 1000));
  const { r, g, b } = Treap.PRIORITY_BASE_RGB;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

Treap.prototype.init = function (am, w, h) {
  var sc = Treap.superclass;
  var fn = sc.init;
  fn.call(this, am, w, h);

  this.startingX = 150;
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;
  this.treeRoot = null;

  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, Treap.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, Treap.STARTING_Y - 10);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();

  // Programmatic bindings
  this.doInsert = (val) => this.implementAction(this.insertElement.bind(this), val);
  this.doRemove = (val) => this.implementAction(this.deleteElement.bind(this), val);
  this.doFind = (val) => this.implementAction(this.findElement.bind(this), val);
  this.doClear = () => this.implementAction(this.clearData.bind(this), "");
  this.doInsertRandom = (count = 10, maxValue = 999) => {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};

Treap.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6,
  );

  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);

  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);

  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
};

Treap.prototype.reset = function () {
  this.nextIndex = 2;
  this.treeRoot = null;
};

Treap.prototype.beginTreapAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, {
    source: "Treap",
    operation,
    ...meta,
  });
};

Treap.prototype.markAnimationStep = function (label, meta = {}) {
  this.step(label, {
    source: "Treap",
    operation: this.currentAnimationOperation,
    ...meta,
  });
};

Treap.prototype.finishTreapAnimation = function () {
  this.currentAnimationOperation = null;
  return this.finishAnimation();
};

Treap.prototype.insertCallback = function () {
  var insertedValue = this.normalizeNumber(this.inputField.value, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

Treap.prototype.deleteCallback = function () {
  var deletedValue = this.normalizeNumber(this.inputField.value, 4);
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};

Treap.prototype.findCallback = function () {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

Treap.prototype.clearCallback = function () {
  this.implementAction(this.clearData.bind(this), "");
};

Treap.prototype.insertRandomCallback = function () {
  this.doInsertRandom();
};

// Node class
function TreapNode(val, prio, id, labelID, initialX, initialY) {
  this.data = val;
  this.priority = prio;
  this.graphicID = id;
  this.priorityLabelID = labelID;
  this.x = initialX;
  this.y = initialY;
  this.left = null;
  this.right = null;
  this.parent = null;
  this.leftWidth = Treap.WIDTH_DELTA / 2;
  this.rightWidth = Treap.WIDTH_DELTA / 2;
}

Treap.prototype.insertElement = function (insertedValue) {
  this.commands = [];
  this.beginTreapAnimation("insert", "insert " + insertedValue, {
    value: insertedValue,
    tags: ["insert"],
  });
  this.cmd("SetMessage", "Insert " + insertedValue);

  const prio = Math.floor(Math.random() * 1000);
  this.markAnimationStep("assign priority " + prio, {
    value: insertedValue,
    priority: prio,
    tags: ["priority"],
  });
  this.cmd("SetMessage", "Set priority " + prio + " for " + insertedValue);
  this.cmd("Step");

  if (this.treeRoot == null) {
    this.markAnimationStep("create root", {
      value: insertedValue,
      priority: prio,
      tags: ["create", "root"],
    });
    const nodeID = this.nextIndex++;
    const labelID = this.nextIndex++;
    this.cmd("CreateCircle", nodeID, insertedValue, this.startingX, Treap.STARTING_Y);
    this.cmd("SetForegroundColor", nodeID, Treap.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", nodeID, this.priorityColor(prio));
    // Create smaller priority label
    this.cmd("CreateLabel", labelID, prio, this.startingX - Treap.PRIORITY_OFFSET_LEFT_X, Treap.STARTING_Y - Treap.PRIORITY_OFFSET_Y, 1, Treap.PRIORITY_FONT_PERCENT);
    this.cmd("SetForegroundColor", labelID, Treap.PRIORITY_LABEL_COLOR);

    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, nodeID, Treap.LINK_COLOR);

    this.treeRoot = new TreapNode(insertedValue, prio, nodeID, labelID, this.startingX, Treap.STARTING_Y);
  } else {
    this.markAnimationStep("create node " + insertedValue, {
      value: insertedValue,
      priority: prio,
      tags: ["create"],
    });
    const nodeID = this.nextIndex++;
    const labelID = this.nextIndex++;
    this.cmd("CreateCircle", nodeID, insertedValue, this.startingX - 200, Treap.STARTING_Y);
    this.cmd("SetForegroundColor", nodeID, Treap.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", nodeID, this.priorityColor(prio));
    // Position relative to the temporary insert circle at startingX - 200
    this.cmd("CreateLabel", labelID, prio, this.startingX - 200 - Treap.PRIORITY_OFFSET_LEFT_X, Treap.STARTING_Y - Treap.PRIORITY_OFFSET_Y, 1, Treap.PRIORITY_FONT_PERCENT);
    this.cmd("SetForegroundColor", labelID, Treap.PRIORITY_LABEL_COLOR);
    this.cmd("Step");

    const elem = new TreapNode(insertedValue, prio, nodeID, labelID, 50, 100);
    this.cmd("SetHighlight", elem.graphicID, 1);
    this.insertBST(elem, this.treeRoot);

    // Heap fix-up: bubble up by priority (max-heap)
    this.heapifyUp(elem);
    this.resizeTree();
  }

  this.cmd("SetMessage", "");
  return this.finishTreapAnimation();
};

Treap.prototype.insertBST = function (elem, tree) {
  this.markAnimationStep("compare " + elem.data + " with " + tree.data, {
    value: elem.data,
    node: tree.data,
    tags: ["compare"],
  });
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);

  if (elem.data < tree.data) {
    this.cmd("SetMessage", elem.data + " < " + tree.data + ". Looking at left subtree");
    if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
  } else {
    this.cmd("SetMessage", elem.data + " >= " + tree.data + ". Looking at right subtree");
    if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);

  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, Treap.LINK_COLOR);
    } else {
      if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insertBST(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, Treap.LINK_COLOR);
      elem.x = tree.x + Treap.WIDTH_DELTA / 2;
      elem.y = tree.y + Treap.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
      // For a right child, place priority on the top-right
      this.cmd("Move", elem.priorityLabelID, elem.x + Treap.PRIORITY_OFFSET_RIGHT_X, elem.y - Treap.PRIORITY_OFFSET_Y);
    } else {
      if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insertBST(elem, tree.right);
    }
  }
};

Treap.prototype.heapifyUp = function (node) {
  while (node && node.parent && node.priority > node.parent.priority) {
    const p = node.parent;
    if (p.left === node) {
      this.singleRotateRight(p);
    } else {
      this.singleRotateLeft(p);
    }
  }
};

Treap.prototype.singleRotateLeft = function (x) {
  const y = x.right;
  if (!y) return;

  const B = y.left;
  const p = x.parent;
  const xWasLeft = p && p.left === x;

  this.markAnimationStep("rotate left at " + x.data, {
    pivot: x.data,
    promoted: y.data,
    tags: ["rotate", "left"],
  });
  this.cmd("SetMessage", "Rotate left at " + x.data + " (promote " + y.data + ")");
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");

  // Rewire parent -> y
  if (!p) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, Treap.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, Treap.LINK_COLOR);
    y.parent = p;
    if (xWasLeft) p.left = y; else p.right = y;
  }

  // x loses y as right child; y adopts x as left
  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, Treap.LINK_COLOR);

  // Move subtree B under x
  if (B) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, Treap.LINK_COLOR);
  }

  // Pointer updates
  x.parent = y;
  x.right = B; if (B) B.parent = x;
  y.left = x;

  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};

Treap.prototype.singleRotateRight = function (x) {
  const y = x.left;
  if (!y) return;

  const B = y.right;
  const p = x.parent;
  const xWasLeft = p && p.left === x;

  this.markAnimationStep("rotate right at " + x.data, {
    pivot: x.data,
    promoted: y.data,
    tags: ["rotate", "right"],
  });
  this.cmd("SetMessage", "Rotate right at " + x.data + " (promote " + y.data + ")");
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");

  if (!p) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, Treap.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, Treap.LINK_COLOR);
    y.parent = p;
    if (xWasLeft) p.left = y; else p.right = y;
  }

  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, Treap.LINK_COLOR);

  if (B) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, Treap.LINK_COLOR);
  }

  x.parent = y;
  x.left = B; if (B) B.parent = x;
  y.right = x;

  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};

Treap.prototype.findElement = function (findValue) {
  this.commands = [];
  this.beginTreapAnimation("find", "find " + findValue, {
    value: findValue,
    tags: ["find", "search"],
  });
  this.cmd("SetMessage", "Search " + findValue + " from root");
  this.cmd("Step");
  const found = this.findImpl(this.treeRoot, findValue);
  this.beginBlock((found ? "found " : "not found ") + findValue, {
    source: "Treap",
    operation: this.currentAnimationOperation,
    value: findValue,
    tags: [found ? "found" : "not-found"],
  });
  this.cmd("SetMessage", found ? "Found " + findValue : "Hit null: not found");
  return this.finishTreapAnimation();
};

Treap.prototype.findImpl = function (tree, value) {
  if (tree != null) {
    this.markAnimationStep("compare " + value + " with " + tree.data, {
      value,
      node: tree.data,
      tags: ["compare"],
    });
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd("SetMessage", "Found " + value);
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      return tree;
    } else if (value < tree.data) {
      this.cmd("SetMessage", value + " < " + tree.data + ": go left");
      if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
      this.cmd("Step");
      if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.cmd("SetHighlight", tree.graphicID, 0);
      return this.findImpl(tree.left, value);
    } else {
      this.cmd("SetMessage", value + " > " + tree.data + ": go right");
      if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
      this.cmd("Step");
      if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.cmd("SetHighlight", tree.graphicID, 0);
      return this.findImpl(tree.right, value);
    }
  } else {
    this.cmd("SetMessage", "Hit null: not found");
    this.cmd("Step");
    return null;
  }
};

Treap.prototype.deleteElement = function (deletedValue) {
  this.commands = [];
  this.beginTreapAnimation("delete", "delete " + deletedValue, {
    value: deletedValue,
    tags: ["delete"],
  });
  this.cmd("SetMessage", "Remove " + deletedValue);
  this.cmd("Step");
  this.treapDelete(this.treeRoot, deletedValue);
  this.beginBlock("delete complete", {
    source: "Treap",
    operation: this.currentAnimationOperation,
    value: deletedValue,
    tags: ["complete"],
  });
  this.cmd("SetMessage", "");
  return this.finishTreapAnimation();
};

Treap.prototype.treapDelete = function (tree, valueToDelete) {
  if (!tree) return;
  this.markAnimationStep("compare " + valueToDelete + " with " + tree.data, {
    value: valueToDelete,
    node: tree.data,
    tags: ["compare"],
  });
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (valueToDelete < tree.data) {
    this.cmd("SetMessage", valueToDelete + " < " + tree.data + ": go left");
    if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd("Step");
    if (tree.left) this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.treapDelete(tree.left, valueToDelete);
  } else if (valueToDelete > tree.data) {
    this.cmd("SetMessage", valueToDelete + " > " + tree.data + ": go right");
    if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd("Step");
    if (tree.right) this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.treapDelete(tree.right, valueToDelete);
  } else {
    // Found node to delete
    this.markAnimationStep("delete node " + tree.data, {
      value: tree.data,
      priority: tree.priority,
      tags: ["delete", "found"],
    });
    this.cmd("SetMessage", "Found node " + tree.data + " (prio " + tree.priority + ")");
    this.cmd("Step");
    // Rotate down until at most one child
    while (tree.left && tree.right) {
      if (tree.left.priority > tree.right.priority) {
        this.singleRotateRight(tree);
      } else {
        this.singleRotateLeft(tree);
      }
    }
    // Now delete node with at most one child
    const p = tree.parent;
    if (!tree.left && !tree.right) {
      this.cmd("Delete", tree.graphicID);
      this.cmd("Delete", tree.priorityLabelID);
      if (p) {
        if (p.left === tree) p.left = null; else p.right = null;
      } else {
        this.treeRoot = null;
        this.cmd("SetNull", this.rootIndex, 1);
        this.cmd("Disconnect", 0, tree.graphicID);
      }
    } else {
      const child = tree.left ? tree.left : tree.right;
      // Connect parent to child
      if (p) {
        this.cmd("Disconnect", p.graphicID, tree.graphicID);
        this.cmd("Connect", p.graphicID, child.graphicID, Treap.LINK_COLOR);
        if (p.left === tree) p.left = child; else p.right = child;
        child.parent = p;
      } else {
        this.cmd("Disconnect", 0, tree.graphicID);
        this.cmd("Connect", 0, child.graphicID, Treap.LINK_COLOR);
        child.parent = null;
        this.treeRoot = child;
      }
      // Delete current node
      this.cmd("Delete", tree.graphicID);
      this.cmd("Delete", tree.priorityLabelID);
    }
    this.resizeTree();
  }
};

Treap.prototype.clearData = function () {
  this.commands = [];
  this.beginTreapAnimation("clear", "clear treap", {
    tags: ["clear"],
  });
  this.clearRec(this.treeRoot);
  this.treeRoot = null;
  this.cmd("SetNull", this.rootIndex, 1);
  this.beginBlock("treap cleared", {
    source: "Treap",
    operation: this.currentAnimationOperation,
    tags: ["complete"],
  });
  this.cmd("SetMessage", "");
  return this.finishTreapAnimation();
};

Treap.prototype.clearRec = function (tree) {
  if (!tree) return;
  this.clearRec(tree.left);
  this.clearRec(tree.right);
  this.cmd("Delete", tree.graphicID);
  this.cmd("Delete", tree.priorityLabelID);
};

Treap.prototype.resizeTree = function () {
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    var startingPoint = this.startingX;
    var startingY = Treap.STARTING_Y;
    this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};

Treap.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    var leftWidth = this.resizeWidths(tree.left);
    var rightWidth = this.resizeWidths(tree.right);
    tree.leftWidth = Math.max(leftWidth, Treap.WIDTH_DELTA / 2);
    tree.rightWidth = Math.max(rightWidth, Treap.WIDTH_DELTA / 2);
    this.setNewPositions(
      tree.left,
      xPosition - tree.rightWidth,
      yPosition + Treap.HEIGHT_DELTA,
      -1,
    );
    this.setNewPositions(
      tree.right,
      xPosition + tree.leftWidth,
      yPosition + Treap.HEIGHT_DELTA,
      1,
    );
  }
};

Treap.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    // Place label away from the parent pointer:
    // - left child (or root): top-left
    // - right child: top-right
    const isRightChild = !tree.parent || tree.parent.right === tree;
    const labelX = isRightChild ? (tree.x + Treap.PRIORITY_OFFSET_RIGHT_X) : (tree.x - Treap.PRIORITY_OFFSET_LEFT_X);
    const labelY = tree.y - Treap.PRIORITY_OFFSET_Y;
    this.cmd("Move", tree.priorityLabelID, labelX, labelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

Treap.prototype.resizeWidths = function (tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), Treap.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), Treap.WIDTH_DELTA / 2);
  return tree.leftWidth + tree.rightWidth;
};

// Disable/enable algorithm-specific UI during animations
Treap.prototype.disableUI = function () {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.clearButton,
    this.insertRandomButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = true;
  }
};

Treap.prototype.enableUI = function () {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.clearButton,
    this.insertRandomButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = false;
  }
};
