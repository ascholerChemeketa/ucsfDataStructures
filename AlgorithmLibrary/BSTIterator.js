// Based on BST.js (UCSF visualization library)

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

BSTIterator.FOREGROUND_COLOR = "var(--svgColor)";
BSTIterator.BACKGROUND_COLOR = "var(--svgFillColor)";
BSTIterator.LINK_COLOR = "var(--svgColor)";
BSTIterator.HIGHLIGHT_CIRCLE_COLOR = "var(--svgColor--highlight)";

BSTIterator.WIDTH_DELTA = 50;
BSTIterator.HEIGHT_DELTA = 50;
BSTIterator.ROOT_Y = 20;
BSTIterator.STARTING_Y = 80;

BSTIterator.STACK_X = 0;
BSTIterator.STACK_Y = 40;
BSTIterator.STACK_SPACING = 22;
BSTIterator.STACK_TOP_COLOR = "var(--svgColor--red)";

export function BSTIterator(opts = {}) {
  if (!opts.title) opts.title = opts.title || "BST Iterator";
  opts.centered = true;

  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;

  let am = initAnimationManager(opts);
  this.init(am, 1000, 400);

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

BSTIterator.prototype = new Algorithm();
BSTIterator.prototype.constructor = BSTIterator;
BSTIterator.superclass = Algorithm.prototype;

BSTIterator.prototype.init = function (am, w, h) {
  var sc = BSTIterator.superclass;
  var fn = sc.init;
  fn.call(this, am);

  this.nextIndex = 0;
  this.commands = [];

  // Leave space on the right for the iterator stack labels.
  this.startingX = 250;

  this.rootIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    50,
    25,
    this.startingX - 70,
    BSTIterator.ROOT_Y,
  );
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "root",
    this.startingX - 120,
    BSTIterator.ROOT_Y,
  );

  // Iterator stack UI
  this.stackTitleID = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    this.stackTitleID,
    "Iterator stack (bottom)",
    BSTIterator.STACK_X,
    BSTIterator.STACK_Y - 20,
  );

  this.treeRoot = null;

  this.iteratorReady = false;
  this.iteratorStack = []; // { node, labelID }
  this.iteratorCurrentNode = null;

  // Programmatic binding
  this.doMakeIterator = function () {
    this.implementAction(this.makeIterator.bind(this), "");
  };

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

BSTIterator.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();

  this.makeIteratorButton = addControlToAlgorithmBar("Button", "Make Iterator");
  this.makeIteratorButton.onclick = this.makeIteratorCallback.bind(this);

  this.advanceIteratorButton = addControlToAlgorithmBar(
    "Button",
    "Advance iterator",
  );
  this.advanceIteratorButton.onclick = this.advanceIteratorCallback.bind(this);
  this.advanceIteratorButton.disabled = true;
};

BSTIterator.prototype.syncControlState = function () {
  const canAdvance = this.iteratorReady && this.iteratorStack.length > 0;
  if (this.advanceIteratorButton) {
    this.advanceIteratorButton.disabled = !canAdvance;
  }
};

BSTIterator.prototype.enableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
  this.syncControlState();
};

BSTIterator.prototype.disableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};

BSTIterator.prototype.makeIteratorCallback = function () {
  this.implementAction(this.makeIterator.bind(this), "");
};

BSTIterator.prototype.advanceIteratorCallback = function () {
  this.implementAction(this.advanceIterator.bind(this), "");
};

BSTIterator.prototype.clearIterator = function () {
  for (let item of this.iteratorStack) {
    this.cmd("SetText", item.labelID, "");
    this.cmd("SetAlpha", item.labelID, 0);
  }
  this.iteratorStack = [];
  this.iteratorReady = false;

  if (this.iteratorCurrentNode != null) {
    this.cmd("SetHighlight", this.iteratorCurrentNode.graphicID, 0);
    this.iteratorCurrentNode = null;
  }

  this.syncControlState();
};

BSTIterator.prototype.updateStackTopColor = function () {
  // Default all labels to normal color, then set the top label to red.
  for (let item of this.iteratorStack) {
    this.cmd("SetForegroundColor", item.labelID, BSTIterator.FOREGROUND_COLOR);
  }
  if (this.iteratorStack.length > 0) {
    const top = this.iteratorStack[this.iteratorStack.length - 1];
    this.cmd("SetForegroundColor", top.labelID, BSTIterator.STACK_TOP_COLOR);
  }
};

BSTIterator.prototype.stackLabelY = function (index) {
  return BSTIterator.STACK_Y + index * BSTIterator.STACK_SPACING;
};

BSTIterator.prototype.pushIterator = function (node) {
  // Push = add a new label at the bottom.
  const labelID = this.nextIndex++;
  const idx = this.iteratorStack.length;
  const y = this.stackLabelY(idx);

  this.cmd("CreateLabel", labelID, String(node.data), BSTIterator.STACK_X, y);
  this.cmd("SetAlpha", labelID, 1);
  this.iteratorStack.push({ node, labelID });

  this.updateStackTopColor();

  this.cmd("SetHighlight", node.graphicID, 1);
  this.cmd(
    "SetMessage",
    `push ${node.data} onto iterator stack`,
  );
  this.cmd("Step");
  this.cmd("SetHighlight", node.graphicID, 0);
};

BSTIterator.prototype.popIterator = function () {
  const item = this.iteratorStack.pop();
  if (!item) return null;

  this.cmd("SetMessage", `Done at ${item.node.data}, pop from iterator stack`);
  this.cmd("Step");

  // Do not Delete labels (breaks undo/redo); hide them instead.
  this.cmd("SetHighlight", item.node.graphicID, 0);
  this.cmd("SetText", item.labelID, "");
  this.cmd("SetAlpha", item.labelID, 0);
  
  this.updateStackTopColor();

  return item.node;
};

BSTIterator.prototype.makeIterator = function () {
  this.commands = [];

  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty; cannot create iterator.");
    this.cmd("Step");
    return this.commands;
  }

  this.clearIterator();

  this.cmd(
    "SetMessage",
    "Create iterator: push root onto stack, then walk left pushing each node.",
  );
  this.cmd("Step");

  // current = root
  let current = this.treeRoot;
  this.pushIterator(current);

  // while left child
  while (current.left != null) {
    this.cmd(
      "SetMessage",
      `Have left child. current = current->left (${current.data} -> ${current.left.data})`,
    );
    this.cmd("SetHighlight", current.graphicID, 1);
    this.cmd("SetEdgeHighlight", current.graphicID, current.left.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", current.graphicID, current.left.graphicID, 0);
    this.cmd("SetHighlight", current.graphicID, 0);

    current = current.left;
    this.pushIterator(current);
  }

  this.iteratorReady = true;
  this.syncControlState();

  this.cmd("SetHighlight", current.graphicID, 1);
  this.cmd("SetMessage", "No more left children; iterator ready.");
  return this.commands;
};

BSTIterator.prototype.advanceIterator = function () {
  this.commands = [];

  if (!this.iteratorReady) {
    this.cmd("SetMessage", "Iterator not created yet. Click 'Make Iterator'.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  if (this.iteratorStack.length === 0) {
    this.cmd("SetMessage", "Iterator finished (stack is empty).");
    this.advanceIteratorButton.disabled = true;
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  // current = pop
  const current = this.popIterator();
  if (current == null) {
    this.cmd("SetMessage", "Iterator finished.");
    this.syncControlState();
    return this.commands;
  }

  if (this.iteratorCurrentNode != null) {
    this.cmd("SetHighlight", this.iteratorCurrentNode.graphicID, 0);
  }
  this.iteratorCurrentNode = current;
  

  // this.cmd("SetHighlight", current.graphicID, 1);
  // this.cmd("SetMessage", `return ${current.data}`);
  this.cmd("Step");

  // if current has right child
  if (current.right != null) {
    let walk = current.right;
    this.cmd(
      "SetMessage",
      `Popped node has right child; set current = right (${current.data} -> ${walk.data})`,
    );
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 0);

    // push current
    this.pushIterator(walk);

    // while left child
    while (walk.left != null) {
      this.cmd(
        "SetMessage",
        `Has left child; current = current->left (${walk.data} -> ${walk.left.data})`,
      );
      this.cmd("SetHighlight", walk.graphicID, 1);
      this.cmd("SetEdgeHighlight", walk.graphicID, walk.left.graphicID, 1);
      this.cmd("Step");
      this.cmd("SetEdgeHighlight", walk.graphicID, walk.left.graphicID, 0);
      this.cmd("SetHighlight", walk.graphicID, 0);

      walk = walk.left;
      this.pushIterator(walk);
    }

    // Safety: ensure the right edge is definitely unhighlighted.
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 0);
  } else {
    this.cmd(
      "SetMessage",
      `Popped node has no right child. Nothing to do.`,
    );
      this.cmd("Step");
  }

  this.syncControlState();

  if (this.iteratorStack.length === 0) {
    this.cmd("SetMessage", "Iterator is now finished (stack is empty).");
  } else {
    this.cmd("SetHighlight", this.iteratorStack[this.iteratorStack.length - 1].node.graphicID, 1);
    this.cmd("SetMessage", "Iterator advanced.");
  }
  // this.cmd("Step");
  // this.cmd("SetMessage", "");

  return this.commands;
};

// ---- BST building (no UI; used for initialData) ----

BSTIterator.prototype.insertElement = function (insertedValue) {
  this.commands = [];

  const nodeID = this.nextIndex++;
  const newNode = new BSTIteratorNode(insertedValue, nodeID, 100, 100);

  this.cmd(
    "CreateCircle",
    newNode.graphicID,
    newNode.data,
    newNode.x,
    newNode.y,
  );
  this.cmd("SetForegroundColor", newNode.graphicID, BSTIterator.FOREGROUND_COLOR);
  this.cmd("SetBackgroundColor", newNode.graphicID, BSTIterator.BACKGROUND_COLOR);

  if (this.treeRoot == null) {
    this.treeRoot = newNode;
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", this.rootIndex, newNode.graphicID, BSTIterator.LINK_COLOR);
  } else {
    this.insert(newNode, this.treeRoot);
  }

  this.resizeTree();
  this.cmd("Step");

  return this.commands;
};

BSTIterator.prototype.insert = function (elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);

  if (elem.data < tree.data) {
    if (tree.left != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree",
    );
  } else {
    if (tree.right != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree",
    );
  }

  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);

  if (elem.data < tree.data) {
    if (tree.left == null) {
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTIterator.LINK_COLOR);
    } else {
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTIterator.LINK_COLOR);
    } else {
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insert(elem, tree.right);
    }
  }
};

BSTIterator.prototype.resizeTree = function () {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    this.setNewPositions(this.treeRoot, startingPoint, BSTIterator.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};

BSTIterator.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + BSTIterator.HEIGHT_DELTA,
      -1,
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + BSTIterator.HEIGHT_DELTA,
      1,
    );
  }
};

BSTIterator.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

BSTIterator.prototype.resizeWidths = function (tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(
    this.resizeWidths(tree.left),
    BSTIterator.WIDTH_DELTA / 2,
  );
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    BSTIterator.WIDTH_DELTA / 2,
  );
  return tree.leftWidth + tree.rightWidth;
};

function BSTIteratorNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}
