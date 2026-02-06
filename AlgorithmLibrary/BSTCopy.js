// Based on BST.js (UCSF visualization library)

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

BSTCopy.FOREGROUND_COLOR = "var(--svgColor)";
BSTCopy.BACKGROUND_COLOR = "var(--svgFillColor)";
BSTCopy.LINK_COLOR = "var(--svgColor)";
BSTCopy.HIGHLIGHT_CIRCLE_COLOR = "var(--svgColor--highlight)";

BSTCopy.WIDTH_DELTA = 50;
BSTCopy.HEIGHT_DELTA = 50;
BSTCopy.ROOT_Y = 20;
BSTCopy.STARTING_Y = 80;

export function BSTCopy(opts = {}) {
  if (!opts.title) opts.title = opts.title || "BST Copy";
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

BSTCopy.prototype = new Algorithm();
BSTCopy.prototype.constructor = BSTCopy;
BSTCopy.superclass = Algorithm.prototype;

BSTCopy.prototype.init = function (am, w, h) {
  var sc = BSTCopy.superclass;
  var fn = sc.init;
  fn.call(this, am);

  this.nextIndex = 0;
  this.commands = [];

  // Source BST position (left side)
  this.startingX = 50;

  // Copy BST position (right side)
  this.copyStartingX = 300;

  // Root pointers
  this.rootIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    50,
    25,
    this.startingX - 70,
    BSTCopy.ROOT_Y,
  );
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "root",
    this.startingX - 120,
    BSTCopy.ROOT_Y,
  );

  this.rootCopyIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    70,
    25,
    this.copyStartingX - 80,
    BSTCopy.ROOT_Y,
  );
  this.cmd("SetNull", this.rootCopyIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "rootCopy",
    this.copyStartingX - 150,
    BSTCopy.ROOT_Y,
  );

  this.treeRoot = null;
  this.rootCopy = null;
  this.copyDone = false;
  this.sourceToCopyID = new Map();

  // Programmatic binding
  this.doCopy = function () {
    this.implementAction(this.copyTree.bind(this), "");
  };

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

BSTCopy.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.copyButton = addControlToAlgorithmBar("Button", "Copy");
  this.copyButton.onclick = this.copyCallback.bind(this);
};

BSTCopy.prototype.copyCallback = function () {
  this.implementAction(this.copyTree.bind(this), "");
};

BSTCopy.prototype.copyTree = function () {
  this.commands = [];

  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Source tree is empty; nothing to copy.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  if (this.rootCopy != null) {
    this.clearCopyOnly();
  }

  this.sourceToCopyID = new Map();

  this.cmd("SetMessage", "Preorder traversal: copy each visited node into the new tree.");
  this.cmd("Step");

  // this.highlightID = this.nextIndex++;
  // this.cmd(
  //   "CreateHighlightCircle",
  //   this.highlightID,
  //   BSTCopy.HIGHLIGHT_CIRCLE_COLOR,
  //   this.treeRoot.x,
  //   this.treeRoot.y,
  // );

  // Build the copied structure. Edges are drawn when recursion returns.
  // The rootCopy pointer is shown only after the whole copy completes.
  this.rootCopy = null;
  const builtRoot = this.copyTreeRec(this.treeRoot, null, false);
  this.rootCopy = builtRoot;

  if (this.rootCopy != null) {
    this.cmd("SetNull", this.rootCopyIndex, 0);
    this.cmd("Step");
    this.cmd(
      "Connect",
      this.rootCopyIndex,
      this.rootCopy.graphicID,
      BSTCopy.LINK_COLOR,
    );
    this.cmd("SetMessage", "Set rootCopy pointer.");
    this.cmd("Step");
  }

  // this.cmd("Delete", this.highlightID);
  this.cmd("SetMessage", "Copy complete.");

  this.copyDone = true;
  if (this.copyButton) {
    this.copyButton.disabled = true;
  }
  return this.commands;
};

BSTCopy.prototype.setSourceAndCopyHighlight = function (sourceNode, highlight) {
  this.cmd("SetHighlight", sourceNode.graphicID, highlight);
  const copyID = this.sourceToCopyID.get(sourceNode.graphicID);
  if (copyID != null) {
    this.cmd("SetHighlight", copyID, highlight);
  }
};

BSTCopy.prototype.copyTreeRec = function (sourceNode, parentCopyNode, isLeftChild) {
  if (sourceNode == null) return null;

  // Preorder: visit this node (highlight source; copy highlight will appear once created)
  // this.cmd("Move", this.highlightID, sourceNode.x, sourceNode.y);
  this.setSourceAndCopyHighlight(sourceNode, 1);
  this.cmd("SetMessage", `Visit ${sourceNode.data}. Create its copy.`);

  const newID = this.nextIndex++;
  const createX = this.copyStartingX - 200;
  const createY = BSTCopy.STARTING_Y;

  this.cmd("CreateCircle", newID, sourceNode.data, createX, createY);
  this.cmd("SetForegroundColor", newID, BSTCopy.FOREGROUND_COLOR);
  this.cmd("SetBackgroundColor", newID, BSTCopy.BACKGROUND_COLOR);

  const copyNode = new BSTCopyNode(sourceNode.data, newID, createX, createY);
  this.sourceToCopyID.set(sourceNode.graphicID, copyNode.graphicID);

  // Show the copy node appearing in its eventual "mirrored" location
  // (but do not connect pointers/edges until recursion returns).
  const dx = this.copyStartingX - this.startingX;
  copyNode.x = sourceNode.x + dx;
  copyNode.y = sourceNode.y;
  this.cmd("Move", copyNode.graphicID, copyNode.x, copyNode.y);

  // With the mapping established, keep the source highlight mirrored on the copy.
  this.cmd("SetHighlight", copyNode.graphicID, 1);
  this.cmd("Step");
  this.setSourceAndCopyHighlight(sourceNode, 0);

  // Make the copy root available immediately so resizeCopyTree() works
  // throughout the preorder recursion, but don't show the rootCopy pointer
  // connection until the full copy finishes.
  if (this.rootCopy == null) {
    this.rootCopy = copyNode;
  }

  // Create the edge immediately, but keep it invisible until the caller returns
  // and "sets" the pointer.
  if (parentCopyNode != null) {
    copyNode.parent = parentCopyNode;
    if (isLeftChild) {
      // Pointer assignment is animated on return; set structure now.
      parentCopyNode.left = copyNode;
    } else {
      parentCopyNode.right = copyNode;
    }

    this.cmd(
      "Connect",
      parentCopyNode.graphicID,
      copyNode.graphicID,
      BSTCopy.LINK_COLOR,
    );
    this.cmd(
      "SetEdgeAlpha",
      parentCopyNode.graphicID,
      copyNode.graphicID,
      0,
    );
  }

  // Recurse left
  const leftCopy = this.copyTreeRec(sourceNode.left, copyNode, true);
  if (leftCopy != null) {
    this.cmd(
      "SetMessage",
      `Returned from copying left child of ${copyNode.data}. Set left pointer to returned node.`,
    );
    this.cmd("SetHighlight", copyNode.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", copyNode.graphicID, 0);

    this.cmd("SetEdgeAlpha", copyNode.graphicID, leftCopy.graphicID, 1);
    this.cmd("Step");
  }

  // Recurse right
  const rightCopy = this.copyTreeRec(sourceNode.right, copyNode, false);
  if (rightCopy != null) {
    this.cmd(
      "SetMessage",
      `Returned from copying right child of ${copyNode.data}. Set right pointer to returned node.`,
    );
    this.cmd("SetHighlight", copyNode.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", copyNode.graphicID, 0);
  }

  return copyNode;
};

BSTCopy.prototype.clearCopyOnly = function () {
  const handler = this;

  function clearTree(tree) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left);
      }
      if (tree.right != null) {
        clearTree(tree.right);
      }
      handler.cmd("Delete", tree.graphicID);
    }
  }

  clearTree(this.rootCopy);
  this.rootCopy = null;
  this.cmd("SetNull", this.rootCopyIndex, 1);
  this.sourceToCopyID = new Map();
};

// Source BST building (no UI for insert/delete; used only for initialData)
BSTCopy.prototype.insertElement = function (insertedValue) {
  this.commands = [];

  if (this.treeRoot == null) {
    this.cmd("CreateCircle", this.nextIndex, insertedValue, this.startingX, BSTCopy.STARTING_Y);
    this.cmd("SetForegroundColor", this.nextIndex, BSTCopy.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BSTCopy.BACKGROUND_COLOR);

    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", this.rootIndex, this.nextIndex, BSTCopy.LINK_COLOR);

    this.treeRoot = new BSTCopyNode(insertedValue, this.nextIndex, this.startingX, BSTCopy.STARTING_Y);
    this.nextIndex += 1;
  } else {
    this.cmd("CreateCircle", this.nextIndex, insertedValue, this.startingX - 200, BSTCopy.STARTING_Y);
    this.cmd("SetForegroundColor", this.nextIndex, BSTCopy.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BSTCopy.BACKGROUND_COLOR);
    this.cmd("Step");
    const insertElem = new BSTCopyNode(insertedValue, this.nextIndex, this.startingX - 200, BSTCopy.STARTING_Y);
    this.nextIndex += 1;
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }

  this.cmd("SetMessage", "");
  return this.commands;
};

BSTCopy.prototype.insert = function (elem, tree) {
  if (elem.data < tree.data) {
    if (tree.left == null) {
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTCopy.LINK_COLOR);
    } else {
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTCopy.LINK_COLOR);
    } else {
      this.insert(elem, tree.right);
    }
  }
};

BSTCopy.prototype.resizeTree = function () {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth,
      );
    }
    this.setNewPositions(this.treeRoot, startingPoint, BSTCopy.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};

BSTCopy.prototype.resizeCopyTree = function () {
  var startingPoint = this.copyStartingX;
  this.resizeWidths(this.rootCopy);
  if (this.rootCopy != null) {
    if (this.rootCopy.leftWidth > startingPoint) {
      startingPoint = this.rootCopy.leftWidth;
    } else if (this.rootCopy.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.rootCopy.leftWidth,
        2 * startingPoint - this.rootCopy.rightWidth,
      );
    }
    this.setNewPositions(this.rootCopy, startingPoint, BSTCopy.STARTING_Y, 0);
    this.animateNewPositions(this.rootCopy);
    // this.cmd("Step");
  }
};

BSTCopy.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(tree.left, xPosition, yPosition + BSTCopy.HEIGHT_DELTA, -1);
    this.setNewPositions(tree.right, xPosition, yPosition + BSTCopy.HEIGHT_DELTA, 1);
  }
};

BSTCopy.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

BSTCopy.prototype.resizeWidths = function (tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), BSTCopy.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), BSTCopy.WIDTH_DELTA / 2);
  return tree.leftWidth + tree.rightWidth;
};

function BSTCopyNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}

BSTCopy.prototype.disableUI = function () {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};

BSTCopy.prototype.enableUI = function () {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }

  if (this.copyDone && this.copyButton) {
    this.copyButton.disabled = true;
  }
};

// Re-enable Copy when fully undone back to start
BSTCopy.prototype.undo = function (event) {
  BSTCopy.superclass.undo.call(this, event);
  if (this.actionHistory.length === 0) {
    this.copyDone = false;
    if (this.copyButton) this.copyButton.disabled = false;
  }
  this.enableUI(event);
};
