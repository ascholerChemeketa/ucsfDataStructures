// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addCheckboxToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";
import {
  classifySingleReplayChildByValue,
  compareReplayObjectsByValue,
  describeBinaryTree,
  describeBinaryTreeFromState,
  getReplayObjectText,
} from "./DescribeHelpers.js";

export function RedBlack(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Red Black Tree";
  opts.centered = true;

  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;

  let am = initAnimationManager(opts);
  this.init(am, 600, 400);

  this.addControls();

  if(opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}


var FIRST_PRINT_POS_X = 50;
var PRINT_VERTICAL_GAP = 20;
var PRINT_HORIZONTAL_GAP = 50;

var NODE_SIZE = 30;

var LINK_COLOR = "var(--svgColor)";

var FOREGROUND_RED = "var(--svgColor--red)";
var BACKGROUND_RED = "var(--svgColor--redback)";

var FOREGROUND_BLACK = "var(--svgColor--black)";
var BACKGROUND_BLACK = "var(--svgColor--blackback)";
var BACKGROUND_DOUBLE_BLACK = "#777777";

// var HIGHLIGHT_LABEL_COLOR = RED
// var HIGHLIGHT_LINK_COLOR = RED

var BLUE = "#0000FF";

var HIGHLIGHT_COLOR = "#007700";
var FOREGROUND_COLOR = FOREGROUND_BLACK;
var PRINT_COLOR = FOREGROUND_COLOR;

var widthDelta = 50;
var heightDelta = 60;
var startingY = 50;
var GROUP_RED_X_DELTA = 36;
var GROUP_RED_Y_DELTA = 36;
var GROUP_HEIGHT_DELTA = 125;
var GROUP_MIN_WIDTH = 125;
var GROUP_CHILD_SPACING = 32;

var EXPLANITORY_TEXT_Y = 10;


RedBlack.prototype = new Algorithm();
RedBlack.prototype.constructor = RedBlack;
RedBlack.superclass = Algorithm.prototype;

RedBlack.prototype.init = function (am, w, h) {
  var sc = RedBlack.superclass;
  var fn = sc.init;
  fn.call(this, am, w, h);
  this.nextIndex = 0;
  this.commands = [];
  this.groupBoxes = {};
  this.rootIndex = 0;
  this.startingX = 100;  // w / 2;
  this.print_max = w - PRINT_HORIZONTAL_GAP;
  this.first_print_pos_y = h - 2 * PRINT_VERTICAL_GAP;
  
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, EXPLANITORY_TEXT_Y + 20);
  this.cmd("SetNull", this.rootIndex, 1);
	this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, EXPLANITORY_TEXT_Y + 20);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  
  this.doInsert = function (val) {
    this.implementAction( this.insertElement.bind(this), val);
  };
  this.doDelete = function (val) {
    this.implementAction( this.deleteElement.bind(this), val);
  };
  this.doFind = function (val) {
    this.implementAction( this.findElement.bind(this), val);
  };
  this.doPrint = function (order = "In") {
    this.implementAction( this.printTree.bind(this), order);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const raw = Math.floor(1 + Math.random() * maxValue);
      const insertedValue = this.normalizeNumber(String(raw), 4);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};

RedBlack.prototype.addControls = function () {
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

  this.insertRandomButton = addControlToAlgorithmBar("Button", "Add Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  
  addSeparatorToAlgorithmBar();
  
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
  
  addSeparatorToAlgorithmBar();
  
  this.showNullLeaves = addCheckboxToAlgorithmBar("Show Null Leaves", 'NullLeavesCheck');
  this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
  this.showNullLeaves.checked = false;

  this.show234Groups = addCheckboxToAlgorithmBar("Show 2-3-4 Groups", "Groups234Check");
  this.show234Groups.onclick = this.show234GroupsCallback.bind(this);
  this.show234Groups.checked = false;
};

RedBlack.prototype.reset = function () {
  this.nextIndex = 2;
  this.treeRoot = null;
};

RedBlack.prototype.beginRedBlackAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "RedBlack", operation, ...meta });
};

RedBlack.prototype.markAnimationStep = function (label, meta = {}) {
  this.step(label, {
    source: "RedBlack",
    operation: this.currentAnimationOperation,
    ...meta,
  });
};

RedBlack.prototype.finishRedBlackAnimation = function () {
  this.currentAnimationOperation = null;
  return this.finishAnimation();
};

RedBlack.prototype.insertCallback = function (event) {
  var insertedValue = this.inputField.value;
  // Get text value
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    // set text value
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

RedBlack.prototype.deleteCallback = function (event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};

RedBlack.prototype.findCallback = function (event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    findValue = this.normalizeNumber(findValue, 4);
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

RedBlack.prototype.printCallback = function (event) {
  this.implementAction(this.printTree.bind(this), "");
};

RedBlack.prototype.clearCallback = function (event) {
  this.implementAction(this.clearData.bind(this), "");
};

RedBlack.prototype.clearData = function () {
  this.beginRedBlackAnimation("clear", "clear tree", { tags: ["clear"] });
  if (this.treeRoot == null) {
    this.markAnimationStep("tree already empty", { tags: ["clear", "empty"] });
    return this.finishRedBlackAnimation();
  }

  function clearTree(tree, handler) {
    if (tree == null) return;
    if (tree.left != null) {
      clearTree(tree.left, handler);
    }
    if (tree.right != null) {
      clearTree(tree.right, handler);
    }
    if (tree.containerBoxID) {
      handler.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
    handler.cmd("Delete", tree.graphicID);
    if (tree.colorLabelID != null) {
      handler.cmd("Delete", tree.colorLabelID);
    }
  }

  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.groupBoxes = {};
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("SetMessage", "");
  this.markAnimationStep("tree cleared", { tags: ["clear", "complete"] });
  return this.finishRedBlackAnimation();
};

RedBlack.prototype.insertRandomCallback = function (event) {
  var numToInsert = 10; // this.inputField.value;
  for (let i = 0; i < numToInsert; i++) {
    const raw = Math.floor(1 + Math.random() * 999);
    const insertedValue = this.normalizeNumber(String(raw), 4);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};


RedBlack.prototype.show234GroupsEnabled = function () {
  return this.show234Groups && this.show234Groups.checked;
};

RedBlack.prototype.isNodeVisible = function (node) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  return node != null && (showNullLeaves || !node.phantomLeaf);
};

RedBlack.prototype.isRedNonNullNode = function (node) {
  return node != null && !node.phantomLeaf && node.blackLevel == 0;
};

RedBlack.prototype.get234GroupNodes = function (tree) {
  if (!this.isNodeVisible(tree) || tree.phantomLeaf || tree.blackLevel != 1) {
    return [];
  }
  const group = [tree];
  if (this.isRedNonNullNode(tree.left)) group.push(tree.left);
  if (this.isRedNonNullNode(tree.right)) group.push(tree.right);
  return group;
};

RedBlack.prototype.get234ChildRoots = function (tree) {
  if (!this.isNodeVisible(tree)) {
    return [];
  }
  if (tree.blackLevel == 0) {
    return [tree.left, tree.right].filter((child) => this.isNodeVisible(child));
  }

  const children = [];
  if (this.isRedNonNullNode(tree.left)) {
    children.push(tree.left.left, tree.left.right);
  } else {
    children.push(tree.left);
  }
  if (this.isRedNonNullNode(tree.right)) {
    children.push(tree.right.left, tree.right.right);
  } else {
    children.push(tree.right);
  }
  return children.filter((child) => this.isNodeVisible(child));
};

RedBlack.prototype.updateGroupingsRec = function (tree, show) {
  if (!this.isNodeVisible(tree) || tree.phantomLeaf) {
    return;
  }
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.updateGroupingsRec(tree.left, show);
  }
  if(tree.blackLevel == 1 && show) {
    // Bounds should include:
    // - the black node (circle)
    // - its color label ("B")
    // - any red children (circle + color label)
    const OUTER_PAD = 8;
    const LABEL_PAD_X = 10;
    const LABEL_PAD_Y = 10;
    const R = NODE_SIZE;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const addNodeBounds = (n) => {
      if (!n || n.phantomLeaf) return;

      minX = Math.min(minX, n.x - R - OUTER_PAD);
      maxX = Math.max(maxX, n.x + R + OUTER_PAD);
      minY = Math.min(minY, n.y - R - OUTER_PAD);
      maxY = Math.max(maxY, n.y + R + OUTER_PAD);

      // The B/R label is positioned near (heightLabelX, heightLabelY)
      // (computed during layout); include it in the group box.
      const lx = Number.isFinite(n.heightLabelX) ? n.heightLabelX : n.x + 20;
      const ly = Number.isFinite(n.heightLabelY) ? n.heightLabelY : n.y - 20;
      minX = Math.min(minX, lx - LABEL_PAD_X - OUTER_PAD);
      maxX = Math.max(maxX, lx + LABEL_PAD_X + OUTER_PAD);
      minY = Math.min(minY, ly - LABEL_PAD_Y - OUTER_PAD);
      maxY = Math.max(maxY, ly + LABEL_PAD_Y + OUTER_PAD);
    };

    const groupNodes = this.get234GroupNodes(tree);
    for (const node of groupNodes) {
      addNodeBounds(node);
    }

    const width = Math.max(0, maxX - minX);
    const height = Math.max(0, maxY - minY);

    if(tree.containerBoxID) {
      this.cmd("Move", tree.containerBoxID, minX, minY);
      this.cmd("SetHeight", tree.containerBoxID, height);
      this.cmd("SetWidth", tree.containerBoxID, width);
    } else {
      const rectID = this.nextIndex++;
      tree.containerBoxID = rectID;
      this.cmd("CreateRectangle", rectID, "", width, height, minX, minY, "left", "top");
      // Make it an outline only, and ensure it's on a visible layer.
      this.cmd("SetBackgroundColor", rectID, "rgba(255, 255, 255, 0)");
      this.cmd("SetForegroundColor", rectID, LINK_COLOR);
      this.cmd("SetLineDash", rectID, "6 4");
      this.cmd("SetLayer", rectID, 0);
    }

  } else {
    //red - do we need to cleanup box?
    if(tree.containerBoxID) {
      this.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.updateGroupingsRec(tree.right, show);
  }
}

RedBlack.prototype.updateGroupings = function (unused) {
  this.commands = [];
  if (this.treeRoot) {
    this.resizeTree();
  } else {
    this.updateGroupingsInternal();
  }
  return this.commands;
}

RedBlack.prototype.updateGroupingsInternal = function () {
  const show = this.show234GroupsEnabled();
  const deleteBoxesRec = (tree) => {
    if (tree == null) return;
    if (tree.containerBoxID) {
      this.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
    if (tree.left != null && !tree.left.phantomLeaf) deleteBoxesRec(tree.left);
    if (tree.right != null && !tree.right.phantomLeaf) deleteBoxesRec(tree.right);
  };

  if (!this.treeRoot) {
    return;
  }
  if (show) {
    this.updateGroupingsRec(this.treeRoot, true);
  } else {
    deleteBoxesRec(this.treeRoot);
  }
};

RedBlack.prototype.deleteNodeVisuals = function (node) {
  if (node == null) {
    return;
  }
  if (node.containerBoxID) {
    this.cmd("Delete", node.containerBoxID);
    node.containerBoxID = null;
  }
  this.cmd("Delete", node.graphicID);
  if (node.colorLabelID != null) {
    this.cmd("Delete", node.colorLabelID);
  }
};

RedBlack.prototype.setNullLeafLayers = function (tree, layer) {
  if (tree == null) return;
  if (tree.phantomLeaf) {
    this.cmd("SetLayer", tree.graphicID, layer);
    if (tree.colorLabelID != null) {
      this.cmd("SetLayer", tree.colorLabelID, layer);
    }
  }
  this.setNullLeafLayers(tree.left, layer);
  this.setNullLeafLayers(tree.right, layer);
};

RedBlack.prototype.showNullLeavesCallback = function (event) {
  this.implementAction(this.toggleNullLeaves.bind(this), "");
};

RedBlack.prototype.show234GroupsCallback = function (event) {
  this.implementAction(this.updateGroupings.bind(this), "");
};

RedBlack.prototype.deleteNullLeavesRec = function (tree) {
  if (tree == null) return;

  // Recurse only through real nodes.
  if (tree.left != null && tree.left.phantomLeaf) {
    // Important: remove the edge first, otherwise the line renderer may
    // keep referencing a deleted endpoint.
    this.cmd("Disconnect", tree.graphicID, tree.left.graphicID);
    this.cmd("Delete", tree.left.graphicID);
    if (tree.left.colorLabelID != null) {
      this.cmd("Delete", tree.left.colorLabelID);
    }
    tree.left = null;
  } else {
    this.deleteNullLeavesRec(tree.left);
  }

  if (tree.right != null && tree.right.phantomLeaf) {
    this.cmd("Disconnect", tree.graphicID, tree.right.graphicID);
    this.cmd("Delete", tree.right.graphicID);
    if (tree.right.colorLabelID != null) {
      this.cmd("Delete", tree.right.colorLabelID);
    }
    tree.right = null;
  } else {
    this.deleteNullLeavesRec(tree.right);
  }
};

RedBlack.prototype.ensureNullLeavesRec = function (tree) {
  if (tree == null || tree.phantomLeaf) return;

  if (tree.left == null) {
    this.attachLeftNullLeaf(tree);
  }
  if (tree.right == null) {
    this.attachRightNullLeaf(tree);
  }

  if (tree.left != null && !tree.left.phantomLeaf) {
    this.ensureNullLeavesRec(tree.left);
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.ensureNullLeavesRec(tree.right);
  }
};

RedBlack.prototype.toggleNullLeaves = function (unused) {
  this.commands = [];
  let show = this.showNullLeaves && this.showNullLeaves.checked;

  if (this.treeRoot) {
    if (show) {
      // Recreate any missing phantom leaves and show them.
      this.ensureNullLeavesRec(this.treeRoot);
      this.setNullLeafLayers(this.treeRoot, 0);
    } else {
      // If null leaves are currently visible, delete them from the SVG entirely.
      this.deleteNullLeavesRec(this.treeRoot);
      // this.cmd("Step");
    }
  }

  // Re-layout so nodes remain visible when leaves are hidden/shown
  this.resizeTree();
  return this.commands;
};

RedBlack.prototype.printTree = function (unused) {
  this.beginRedBlackAnimation("print", "print tree", { tags: ["print", "in"] });

  if (this.treeRoot != null) {
    this.highlightID = this.nextIndex++;
    var firstLabel = this.nextIndex;
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      HIGHLIGHT_COLOR,
      this.treeRoot.x,
      this.treeRoot.y,
    );
    this.xPosOfNextLabel = FIRST_PRINT_POS_X;
    this.yPosOfNextLabel = this.first_print_pos_y;
    this.printTreeRec(this.treeRoot);
    this.cmd("Delete", this.highlightID);
    this.markAnimationStep("finish print", { tags: ["print", "complete"] });
    for (var i = firstLabel; i < this.nextIndex; i++) this.cmd("Delete", i);
    this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
  } else {
    this.markAnimationStep("tree empty", { tags: ["print", "empty"] });
  }
  return this.finishRedBlackAnimation();
};

RedBlack.prototype.printTreeRec = function (tree) {
  this.cmd("Step");
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
    this.printTreeRec(tree.left);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  var nextLabelID = this.nextIndex++;
  this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
  this.cmd("SetForegroundColor", nextLabelID, PRINT_COLOR);
  this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
  this.cmd("Step");

  this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
  if (this.xPosOfNextLabel > this.print_max) {
    this.xPosOfNextLabel = FIRST_PRINT_POS_X;
    this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
    this.printTreeRec(tree.right);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  return;
};

RedBlack.prototype.findElement = function (findValue) {
  this.beginRedBlackAnimation("find", `find ${findValue}`, {
    tags: ["search", "find"],
  });

  this.highlightID = this.nextIndex++;

  this.findImpl(this.treeRoot, findValue);

  return this.finishRedBlackAnimation();
};

RedBlack.prototype.findImpl = function (tree, value) {
  this.cmd("SetMessage", "Searching for " + value);
  if (tree != null && !tree.phantomLeaf) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " +
          value +
          " : " +
          value +
          " = " +
          value +
          " (Element found!)",
      );
      this.cmd("Step");
      this.cmd("SetMessage", "Found:" + value);
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.beginBlock(`found ${value}`, {
        source: "RedBlack",
        operation: this.currentAnimationOperation,
        tags: ["search", "found"],
        focusNodeId: tree.graphicID,
      });
      this.cmd("SetMessage", "Found:" + value);
    } else {
      if (tree.data > value) {
        this.cmd(
          "SetMessage",
          "Searching for " +
            value +
            " : " +
            value +
            " < " +
            tree.data +
            " (look to left subtree)",
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.left != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            HIGHLIGHT_COLOR,
            tree.x,
            tree.y,
          );
          this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.markAnimationStep(`${tree.data}: search left`, {
          tags: ["search", "compare", "left"],
          focusNodeId: tree.graphicID,
        });
        this.findImpl(tree.left, value);
      } else {
        this.cmd(
          "SetMessage",
          " Searching for " +
            value +
            " : " +
            value +
            " > " +
            tree.data +
            " (look to right subtree)",
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.right != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            HIGHLIGHT_COLOR,
            tree.x,
            tree.y,
          );
          this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.markAnimationStep(`${tree.data}: search right`, {
          tags: ["search", "compare", "right"],
          focusNodeId: tree.graphicID,
        });
        this.findImpl(tree.right, value);
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      " Searching for " + value + " : " + "< Empty Tree > (Element not found)",
    );
    this.cmd("Step");
    this.cmd(
      "SetMessage",
      " Searching for " + value + " : " + " (Element not found)",
    );
    this.beginBlock("value not found", {
      source: "RedBlack",
      operation: this.currentAnimationOperation,
      tags: ["search", "not-found"],
    });
    this.cmd(
      "SetMessage",
      " Searching for " + value + " : " + " (Element not found)",
    );
  }
};

RedBlack.prototype.findUncle = function (tree) {
  if (tree.parent == null) {
    return null;
  }
  var par = tree.parent;
  if (par.parent == null) {
    return null;
  }
  var grandPar = par.parent;

  if (grandPar.left == par) {
    return grandPar.right;
  } else {
    return grandPar.left;
  }
};

RedBlack.prototype.blackLevel = function (tree) {
  if (tree == null) {
    return 1;
  } else {
    return tree.blackLevel;
  }
};

RedBlack.prototype.attachLeftNullLeaf = function (node) {
  // Add phantom left leaf
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  var treeNodeID = this.nextIndex++;
  var labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    node.x + 20,
    node.y - 20,
  );
  node.left = new RedBlackNode("", treeNodeID, labelID, node.x, node.y);
  node.left.phantomLeaf = true;
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  node.left.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};

RedBlack.prototype.attachRightNullLeaf = function (node) {
  // Add phantom right leaf
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  let treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    node.x + 20,
    node.y - 20,
  );
  node.right = new RedBlackNode("", treeNodeID, labelID, node.x, node.y);
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);

  node.right.phantomLeaf = true;
  node.right.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};
RedBlack.prototype.attachNullLeaves = function (node) {
  this.attachLeftNullLeaf(node);
  this.attachRightNullLeaf(node);
};

RedBlack.prototype.insertElement = function (insertedValue) {
  this.beginRedBlackAnimation("insert", `insert ${insertedValue}`, {
    tags: ["insert"],
  });
  this.cmd("SetMessage", " Inserting " + insertedValue);
  this.markAnimationStep(`start insert ${insertedValue}`, {
    tags: ["insert", "start"],
  });

  this.highlightID = this.nextIndex++;
  var treeNodeID;
  if (this.treeRoot == null) {
    treeNodeID = this.nextIndex++;
    let labelID = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX,
      startingY,
    );
    this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
    this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
    
    this.cmd(
      "CreateLabel",
      labelID,
      "B",
      this.startingX + 20,
      startingY - 20,
    );
    this.cmd("SetMessage", "Root node must always be Black.");
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, treeNodeID, LINK_COLOR);
    this.treeRoot = new RedBlackNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX,
      startingY,
    );
    this.treeRoot.blackLevel = 1;

    this.attachNullLeaves(this.treeRoot);
    this.resizeTree();
    this.markAnimationStep("create root", {
      tags: ["insert", "root"],
      focusNodeId: treeNodeID,
    });
  } else {
    treeNodeID = this.nextIndex++;
    let labelID = this.nextIndex++;

    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX - 200,
      startingY,
    );
    this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_RED);
    this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_RED);
    this.cmd("Step");
    this.cmd(
      "CreateLabel",
      labelID,
      "R",
      this.startingX - 180,
      startingY - 20,
    );

    var insertElem = new RedBlackNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX - 200,
      startingY,
    );

    this.cmd("SetHighlight", insertElem.graphicID, 1);
    insertElem.height = 1;
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
    this.markAnimationStep(`insert node ${insertedValue}`, {
      tags: ["insert", "node"],
      focusNodeId: treeNodeID,
    });
  }
  this.cmd("SetMessage", " ");
  return this.finishRedBlackAnimation();
};

RedBlack.prototype.singleRotateRight = function (tree) {
  var B = tree;
  var t3 = B.right;
  var A = tree.left;
  var t1 = A.left;
  var t2 = A.right;

  this.cmd("SetMessage", `Rotate Right at ${B.data}`);

  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, LINK_COLOR);
    t2.parent = B;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, LINK_COLOR);

  A.parent = B.parent;
  if (this.treeRoot == B) {
    this.treeRoot = A;
    this.cmd("Disconnect", 0, B.graphicID, LINK_COLOR);
    this.cmd("Connect", 0, A.graphicID, LINK_COLOR);
  } else {
    this.cmd("Disconnect", B.parent.graphicID, B.graphicID, LINK_COLOR);
    this.cmd("Connect", B.parent.graphicID, A.graphicID, LINK_COLOR);
    if (B.isLeftChild()) {
      B.parent.left = A;
    } else {
      B.parent.right = A;
    }
  }

  A.right = B;
  B.parent = A;
  B.left = t2;
  this.resetHeight(B);
  this.resetHeight(A);
  this.resizeTree();
  
  if(B.blackLevel > 0) {
    this.cmd("SetMessage", `${A.data} is now root of logical group. It and ${B.data} switch colors.`);
    this.setColor(A, "B");
    this.setColor(B, "R");
    this.cmd("Step");
  }
  return A;
};

RedBlack.prototype.setColor = function (node, color) {
  let label = "B";
  let fgColor = FOREGROUND_BLACK;
  let bgColor = BACKGROUND_BLACK;
  if(color == "R") {
    label = "R";
    fgColor = FOREGROUND_RED;
    bgColor = BACKGROUND_RED;
  }
  this.cmd("SetText", node.colorLabelID, label);
  this.cmd("SetBackgroundColor", node.graphicID, bgColor);
  this.cmd("SetForegroundColor", node.graphicID, fgColor);
};

RedBlack.prototype.singleRotateLeft = function (tree) {
  var A = tree;
  var B = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;

  this.cmd("SetMessage", `Rotate Left at ${A.data}`);

  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, LINK_COLOR);
    t2.parent = A;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, LINK_COLOR);
  B.parent = A.parent;
  if (this.treeRoot == A) {
    this.treeRoot = B;
    this.cmd("Disconnect", 0, A.graphicID, LINK_COLOR);
    this.cmd("Connect", 0, B.graphicID, LINK_COLOR);
  } else {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID, LINK_COLOR);
    this.cmd("Connect", A.parent.graphicID, B.graphicID, LINK_COLOR);

    if (A.isLeftChild()) {
      A.parent.left = B;
    } else {
      A.parent.right = B;
    }
  }
  B.left = A;
  A.parent = B;
  A.right = t2;
  this.resetHeight(A);
  this.resetHeight(B);

  this.resizeTree();
  
  if(A.blackLevel > 0) {
    this.cmd("SetMessage", `${B.data} is now root of logical group. It and ${A.data} switch colors.`);
    this.setColor(B, "B");
    this.setColor(A, "R");
    this.cmd("Step");
  }
  return B;
};

RedBlack.prototype.getHeight = function (tree) {
  if (tree == null) {
    return 0;
  }
  return tree.height;
};

RedBlack.prototype.resetHeight = function (tree) {
  if (tree != null) {
    var newHeight =
      Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    if (tree.height != newHeight) {
      tree.height =
        Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    }
  }
};

RedBlack.prototype.insert = function (elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);

  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree",
    );
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree",
    );
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);

  if (elem.data < tree.data) {
    if (tree.left == null || tree.left.phantomLeaf) {
      this.cmd(
        "SetMessage",
        "Found null, inserting red node at that location",
      );
      if (tree.left != null) {
        this.cmd("Delete", tree.left.graphicID);
      }
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);

      this.attachNullLeaves(elem);
      this.resizeTree();

      this.resizeTree();

      this.fixDoubleRed(elem);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        HIGHLIGHT_COLOR,
        tree.x,
        tree.y,
      );
      this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null || tree.right.phantomLeaf) {
      this.cmd(
        "SetMessage",
        "Found null, inserting red node at that location",
      );
      if (tree.right != null) {
        this.cmd("Delete", tree.right.graphicID);
      }

      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);
      elem.x = tree.x + widthDelta / 2;
      elem.y = tree.y + heightDelta;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);

      this.attachNullLeaves(elem);
      this.resizeTree();

      this.resizeTree();
      this.fixDoubleRed(elem);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        HIGHLIGHT_COLOR,
        tree.x,
        tree.y,
      );
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.right);
    }
  }
};

RedBlack.prototype.fixDoubleRed = function (tree) {
  if (tree.parent != null) {
    if (tree.parent.blackLevel > 0) {
      return;
    }
    if (tree.parent.parent == null) {
      this.cmd("SetMessage", "Tree root is red, color it black.");
      this.cmd("Step");
      tree.parent.blackLevel = 1;
      this.setColor(tree.parent, "B");
      return;
    }
    var uncle = this.findUncle(tree);
    if (this.blackLevel(uncle) == 0) {
      this.cmd(
        "SetMessage",
        `Node (${tree.data}) and parent are both red. 4 nodes in logical group. Split into two groups.`,
      );
      this.cmd("Step");

      this.setColor(uncle, "B");
      uncle.blackLevel = 1;

      tree.parent.blackLevel = 1;
      this.setColor(tree.parent, "B");
      
      this.cmd("SetMessage", "Parent and parent's sibling become roots of new logical groups (turn black). Grandparent is pushed up (becomes red).");

      tree.parent.parent.blackLevel = 0;
      this.setColor(tree.parent.parent, "R");
      this.cmd("Step");
      this.fixDoubleRed(tree.parent.parent);
    } else {
      let isDouble = false;
      if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
        this.cmd(
          "SetMessage",
          `Node (${tree.data}) and parent are both red in zig-zag from black grandparent. Only 3 nodes in logical group. Two rotations needed.`,
        );
        isDouble = true;
        this.cmd("Step");

        this.singleRotateRight(tree.parent);
        tree = tree.right;
      } else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
        this.cmd(
          "SetMessage",
          `Node (${tree.data}) and parent are both red in zig-zag from black grandparent. Only 3 nodes in logical group. Two rotations needed.`,
        );
        isDouble = true;
        this.cmd("Step");

        this.singleRotateLeft(tree.parent);
        tree = tree.left;
      }

      let msg = isDouble ? 
        `Now do second rotation to move (${tree.parent.data}) up to be root of logical group.`
        :
        `Node (${tree.data}) and parent are both red in a straight line from black grandparent. Only 3 nodes in logical group. Fix with single rotation.`;

      if (tree.isLeftChild()) {
        this.cmd(
          "SetMessage",
          msg,
        );
        this.cmd("Step");

        this.singleRotateRight(tree.parent.parent);
        tree.parent.blackLevel = 1;
        this.setColor(tree.parent, "B");

        tree.parent.right.blackLevel = 0;
        this.setColor(tree.parent.right, "R");
      } else {
        this.cmd(
          "SetMessage",
          msg,
        );
        this.cmd("Step");

        this.singleRotateLeft(tree.parent.parent);
        tree.parent.blackLevel = 1;
        this.setColor(tree.parent, "B");

        tree.parent.left.blackLevel = 0;
        this.setColor(tree.parent.left, "R");
      }
    }
  } else {
    if (tree.blackLevel == 0) {
      this.cmd("SetMessage", "Root of the tree is red.  Color it black");
      this.cmd("Step");

      tree.blackLevel = 1;
      this.setColor(tree, "B");
    }
  }
};

RedBlack.prototype.deleteElement = function (deletedValue) {
  this.beginRedBlackAnimation("delete", `delete ${deletedValue}`, {
    tags: ["delete"],
  });
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.markAnimationStep("start delete", { tags: ["delete", "start"] });
  this.cmd("SetMessage", " ");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);

  // Ensure phantom leaves end in the correct visibility layer after delete/rotations.
  let show = this.showNullLeaves && this.showNullLeaves.checked;
  if (this.treeRoot) {
    this.setNullLeafLayers(this.treeRoot, show ? 0 : 1);
  }

  // Final layout pass after any deletion, so widths/positions are consistent.
  this.resizeTree();
  if (this.treeRoot == null) {
    // resizeTree() doesn't Step when the tree is empty; force a refresh.
    this.markAnimationStep("tree empty after delete", {
      tags: ["delete", "empty"],
    });
  }

  this.beginBlock("delete complete", {
    source: "RedBlack",
    operation: this.currentAnimationOperation,
    tags: ["delete", "complete"],
  });
  this.cmd("SetMessage", " ");
  return this.finishRedBlackAnimation();
};

RedBlack.prototype.fixLeftNull = function (tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  this.cmd("SetMessage", "Coloring 'Null Leaf' double black");

  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", tree.x, tree.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
  
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    tree.x - 20,
    tree.y - 20,
  );
  // Keep null leaves hidden when checkbox is unchecked (no flash during fixup)
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, labelID, tree.x, tree.y);
  nullLeaf.blackLevel = 2;
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  tree.left = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);

  this.resizeTree();
  this.fixExtraBlackChild(tree, true);
  this.cmd("SetLayer", nullLeaf.graphicID, showNullLeaves ? 0 : 1);
  nullLeaf.blackLevel = 1;
  this.fixNodeColor(nullLeaf);
};

RedBlack.prototype.fixRightNull = function (tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  this.cmd("SetMessage", "Coloring 'Null Leaf' double black");

  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", tree.x, tree.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    tree.x - 20,
    tree.y - 20,
  );
  // Keep null leaves hidden when checkbox is unchecked (no flash during fixup)
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, labelID, tree.x, tree.y);
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  nullLeaf.blackLevel = 2;
  tree.right = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);

  this.resizeTree();

  this.fixExtraBlackChild(tree, false);

  this.cmd("SetLayer", nullLeaf.graphicID, showNullLeaves ? 0 : 1);
  nullLeaf.blackLevel = 1;
  this.fixNodeColor(nullLeaf);
};

RedBlack.prototype.fixExtraBlackChild = function (parNode, isLeftChild) {
  var sibling;
  var doubleBlackNode;
  if (isLeftChild) {
    sibling = parNode.right;
    doubleBlackNode = parNode.left;
  } else {
    sibling = parNode.left;
    doubleBlackNode = parNode.right;
  }
  if (
    this.blackLevel(sibling) > 0 &&
    this.blackLevel(sibling.left) > 0 &&
    this.blackLevel(sibling.right) > 0
  ) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling and 2 black nephews.  Push up black level",
    );
    this.cmd("Step");
    sibling.blackLevel = 0;
    this.fixNodeColor(sibling);
    if (doubleBlackNode != null) {
      doubleBlackNode.blackLevel = 1;
      this.fixNodeColor(doubleBlackNode);
    }
    if (parNode.blackLevel == 0) {
      parNode.blackLevel = 1;
      this.fixNodeColor(parNode);
    } else {
      parNode.blackLevel = 2;
      this.fixNodeColor(parNode);
      this.cmd(
        "SetMessage",
        "Pushing up black level created another double black node.  Repeating ...",
      );
      this.cmd("Step");
      this.fixExtraBlack(parNode);
    }
  } else if (this.blackLevel(sibling) == 0) {
    this.cmd(
      "SetMessage",
      "Double black node has red sibling.  Rotate tree to make sibling black ...",
    );
    this.cmd("Step");
    if (isLeftChild) {
      var newPar = this.singleRotateLeft(parNode);
      newPar.blackLevel = 1;
      this.fixNodeColor(newPar);
      newPar.left.blackLevel = 0;
      this.fixNodeColor(newPar.left);
      this.cmd("Step"); // TODO:  REMOVE
      this.fixExtraBlack(newPar.left.left);
    } else {
      newPar = this.singleRotateRight(parNode);
      newPar.blackLevel = 1;
      this.fixNodeColor(newPar);
      newPar.right.blackLevel = 0;
      this.fixNodeColor(newPar.right);
      this.cmd("Step"); // TODO:  REMOVE

      this.fixExtraBlack(newPar.right.right);
    }
  } else if (isLeftChild && this.blackLevel(sibling.right) > 0) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, but double black node is a left child, \nand the right nephew is black.  Rotate tree to make opposite nephew red ...",
    );
    this.cmd("Step");

    var newSib = this.singleRotateRight(sibling);
    newSib.blackLevel = 1;
    this.fixNodeColor(newSib);
    newSib.right.blackLevel = 0;
    this.fixNodeColor(newSib.right);
    this.cmd("Step");
    this.fixExtraBlackChild(parNode, isLeftChild);
  } else if (!isLeftChild && this.blackLevel(sibling.left) > 0) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, but double black node is a right child, \nand the left nephew is black.  Rotate tree to make opposite nephew red ...",
    );
    this.cmd("Step");
    newSib = this.singleRotateLeft(sibling);
    newSib.blackLevel = 1;
    this.fixNodeColor(newSib);
    newSib.left.blackLevel = 0;
    this.fixNodeColor(newSib.left);
    this.cmd("Step");
    this.fixExtraBlackChild(parNode, isLeftChild);
  } else if (isLeftChild) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, is a left child, and its right nephew is red.\nOne rotation can fix double-blackness.",
    );
    this.cmd("Step");

    var oldParBlackLevel = parNode.blackLevel;
    newPar = this.singleRotateLeft(parNode);
    if (oldParBlackLevel == 0) {
      newPar.blackLevel = 0;
      this.fixNodeColor(newPar);
      newPar.left.blackLevel = 1;
      this.fixNodeColor(newPar.left);
    }
    newPar.right.blackLevel = 1;
    this.fixNodeColor(newPar.right);
    if (newPar.left.left != null) {
      newPar.left.left.blackLevel = 1;
      this.fixNodeColor(newPar.left.left);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, is a right child, and its left nephew is red.\nOne rotation can fix double-blackness.",
    );
    this.cmd("Step");

    oldParBlackLevel = parNode.blackLevel;
    newPar = this.singleRotateRight(parNode);
    if (oldParBlackLevel == 0) {
      newPar.blackLevel = 0;
      this.fixNodeColor(newPar);
      newPar.right.blackLevel = 1;
      this.fixNodeColor(newPar.right);
    }
    newPar.left.blackLevel = 1;
    this.fixNodeColor(newPar.left);
    if (newPar.right.right != null) {
      newPar.right.right.blackLevel = 1;
      this.fixNodeColor(newPar.right.right);
    }
  }
};

RedBlack.prototype.fixExtraBlack = function (tree) {
  if (tree.blackLevel > 1) {
    if (tree.parent == null) {
      this.cmd(
        "SetMessage",
        "Double black node is root.  Make it single black.",
      );
      this.cmd("Step");

      tree.blackLevel = 1;
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
    } else if (tree.parent.left == tree) {
      this.fixExtraBlackChild(tree.parent, true);
    } else {
      this.fixExtraBlackChild(tree.parent, false);
    }
  } else {
    // No extra blackness
  }
};

RedBlack.prototype.treeDelete = function (tree, valueToDelete) {
  var leftchild = false;
  if (tree != null && !tree.phantomLeaf) {
    if (tree.parent != null) {
      leftchild = tree.parent.left == tree;
    }
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (valueToDelete < tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " < " + tree.data + ".  Looking at left subtree",
      );
    } else if (valueToDelete > tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " > " + tree.data + ".  Looking at right subtree",
      );
    } else {
      this.cmd(
        "SetMessage",
        valueToDelete + " == " + tree.data + ".  Found node to delete",
      );
    }
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);

    if (valueToDelete == tree.data) {
      var needFix = tree.blackLevel > 0;
      if (
        (tree.left == null || tree.left.phantomLeaf) &&
        (tree.right == null || tree.right.phantomLeaf)
      ) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.deleteNodeVisuals(tree);

        if (tree.left != null) {
          this.cmd("Delete", tree.left.graphicID);
        }
        if (tree.right != null) {
          this.cmd("Delete", tree.right.graphicID);
        }

        if (leftchild && tree.parent != null) {
          tree.parent.left = null;
          this.resizeTree();

          if (needFix) {
            this.fixLeftNull(tree.parent);
          } else {
            this.attachLeftNullLeaf(tree.parent);
            this.resizeTree();
          }
        } else if (tree.parent != null) {
          tree.parent.right = null;
          this.resizeTree();
          if (needFix) {
            this.fixRightNull(tree.parent);
          } else {
            this.attachRightNullLeaf(tree.parent);
            this.resizeTree();
          }
        } else {
          this.treeRoot = null;
        }
      } else if (tree.left == null || tree.left.phantomLeaf) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.",
        );
        if (tree.left != null) {
          this.cmd("Delete", tree.left.graphicID);
          tree.left = null;
        }

        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            LINK_COLOR,
          );
          this.cmd("Step");
          this.deleteNodeVisuals(tree);
          if (leftchild) {
            tree.parent.left = tree.right;
            if (needFix) {
              this.cmd(
                "SetMessage",
                "Back node removed.  Increasing child's blackness level",
              );
              tree.parent.left.blackLevel++;
              this.fixNodeColor(tree.parent.left);
              this.fixExtraBlack(tree.parent.left);
            }
          } else {
            tree.parent.right = tree.right;
            if (needFix) {
              tree.parent.right.blackLevel++;
              this.cmd(
                "SetMessage",
                "Back node removed.  Increasing child's blackness level",
              );
              this.fixNodeColor(tree.parent.right);
              this.fixExtraBlack(tree.parent.right);
            }
          }
          tree.right.parent = tree.parent;
        } else {
          this.deleteNodeVisuals(tree);
          this.treeRoot = tree.right;
          this.treeRoot.parent = null;
          if (this.treeRoot.blackLevel == 0) {
            this.treeRoot.blackLevel = 1;
            this.cmd(
              "SetForegroundColor",
              this.treeRoot.graphicID,
              FOREGROUND_BLACK,
            );
            this.cmd(
              "SetBackgroundColor",
              this.treeRoot.graphicID,
              BACKGROUND_BLACK,
            );
          }
        }
        this.resizeTree();
      } else if (tree.right == null || tree.right.phantomLeaf) {
        this.cmd(
          "SetMessage",
          "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.",
        );
        if (tree.right != null) {
          this.cmd("Delete", tree.right.graphicID);
          tree.right = null;
        }
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            LINK_COLOR,
          );
          this.cmd("Step");
          this.deleteNodeVisuals(tree);
          if (leftchild) {
            tree.parent.left = tree.left;
            if (needFix) {
              tree.parent.left.blackLevel++;
              this.fixNodeColor(tree.parent.left);
              this.fixExtraBlack(tree.parent.left);
              this.resizeTree();
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.resizeTree();
            }
          } else {
            tree.parent.right = tree.left;
            if (needFix) {
              tree.parent.right.blackLevel++;
              this.fixNodeColor(tree.parent.right);
              this.fixExtraBlack(tree.parent.left);
              this.resizeTree();
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.resizeTree();
            }
          }
          tree.left.parent = tree.parent;
        } else {
          this.deleteNodeVisuals(tree);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
          if (this.treeRoot.blackLevel == 0) {
            this.treeRoot.blackLevel = 1;
            this.fixNodeColor(this.treeRoot);
          }
        }
      } // tree.left != null && tree.right != null
      else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind smallest node in right subtree.",
        );

        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        var tmp = tree;
        tmp = tree.right;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd("Step");
        while (tmp.left != null && !tmp.left.phantomLeaf) {
          tmp = tmp.left;
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        if (tmp.left != null) {
          this.cmd("Delete", tmp.left.graphicID);
          tmp.left = null;
        }
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
        this.cmd("SetForegroundColor", labelID, BLUE);
        tree.data = tmp.data;
        this.cmd("Move", labelID, tree.x, tree.y);
        this.cmd(
          "SetMessage",
          "Copy smallest value of right subtree over value being removed.",
        );

        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetMessage", "Remove node whose value we copied.");

        needFix = tmp.blackLevel > 0;

        if (tmp.right == null) {
          this.deleteNodeVisuals(tmp);
          if (tmp.parent != tree) {
            tmp.parent.left = null;
            this.resizeTree();
            if (needFix) {
              this.fixLeftNull(tmp.parent);
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.cmd("Step");
            }
          } else {
            tree.right = null;
            this.resizeTree();
            if (needFix) {
              this.fixRightNull(tmp.parent);
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.cmd("Step");
            }
          }
        } else {
          this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
          this.cmd(
            "Connect",
            tmp.parent.graphicID,
            tmp.right.graphicID,
            LINK_COLOR,
          );
          this.cmd("Step");
          this.deleteNodeVisuals(tmp);

          if (tmp.parent != tree) {
            tmp.parent.left = tmp.right;
            tmp.right.parent = tmp.parent;
            this.resizeTree();

            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.right.blackLevel++;
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
              this.fixNodeColor(tmp.right);
              this.fixExtraBlack(tmp.right);
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.cmd("Step");
            }
          } else {
            tree.right = tmp.right;
            tmp.right.parent = tree;
            this.resizeTree();
            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.right.blackLevel++;
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }

              this.fixNodeColor(tmp.right);
              this.fixExtraBlack(tmp.right);
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.cmd("Step");
            }
          }
        }
        tmp = tmp.parent;
      }
    } else if (valueToDelete < tree.data) {
      if (tree.left != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.left, valueToDelete);
    } else {
      if (tree.right != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.right, valueToDelete);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete",
    );
  }
};

RedBlack.prototype.fixNodeColor = function (tree) {
  // Keep the R/B label in sync with the node's current blackLevel.
  // (The fill/stroke colors are often updated via fixNodeColor, but the text
  // label can otherwise get out of date.)
  if (tree.colorLabelID != null) {
    if (tree.phantomLeaf) {
      this.cmd("SetText", tree.colorLabelID, "");
    } else {
      this.cmd("SetText", tree.colorLabelID, tree.blackLevel == 0 ? "R" : "B");
    }
  }

  if (tree.blackLevel == 0) {
    this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_RED);
    this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_RED);
  } else {
    this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_BLACK);
    if (tree.blackLevel > 1) {
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_DOUBLE_BLACK);
    } else {
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
    }
  }
};

RedBlack.prototype.describe = function () {
  return describeBinaryTree(this.treeRoot, {
    getDetails(node) {
      if (node.blackLevel > 1) {
        return ["double black"];
      }
      return [node.blackLevel === 0 ? "red" : "black"];
    },
    shouldInclude(node) {
      return node != null && !node.phantomLeaf;
    },
  });
};

RedBlack.prototype.describeFromState = function (state) {
  return describeBinaryTreeFromState(state, this.rootIndex, {
    childPredicate(object) {
      return object && object.kind === "circle";
    },
    classifySingleChild: classifySingleReplayChildByValue,
    getDetails(node) {
      if (node.object.backgroundColor === BACKGROUND_DOUBLE_BLACK) {
        return ["double black"];
      }
      return [node.object.backgroundColor === BACKGROUND_RED ? "red" : "black"];
    },
    shouldIncludeObject(object) {
      return getReplayObjectText(object) !== "NULL\nLEAF";
    },
    sortChildren: compareReplayObjectsByValue,
  });
};

RedBlack.prototype.resizeTree = function () {
  var startingPoint = this.startingX;
  if (this.show234GroupsEnabled()) {
    this.resizeWidths234(this.treeRoot);
  } else {
    this.resizeWidths(this.treeRoot);
  }
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth,
      );
    }
    if (this.show234GroupsEnabled()) {
      this.setNewPositions234(this.treeRoot, startingPoint, startingY);
    } else {
      this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
    }
    this.animateNewPositions(this.treeRoot);
    this.updateGroupingsInternal();
    this.cmd("Step");
  }
};

RedBlack.prototype.resizeWidths234 = function (tree) {
  if (!this.isNodeVisible(tree)) {
    return 0;
  }

  if (tree.blackLevel == 0) {
    tree.leftWidth = Math.max(this.resizeWidths234(tree.left), widthDelta / 2);
    tree.rightWidth = Math.max(this.resizeWidths234(tree.right), widthDelta / 2);
    return tree.leftWidth + tree.rightWidth;
  }

  const childRoots = this.get234ChildRoots(tree);
  const childWidths = childRoots.map((child) => this.resizeWidths234(child));
  const childrenWidth =
    childWidths.reduce((total, width) => total + width, 0) +
    Math.max(0, childWidths.length - 1) * GROUP_CHILD_SPACING;
  const groupNodeCount = this.get234GroupNodes(tree).length;
  const ownWidth = Math.max(GROUP_MIN_WIDTH, NODE_SIZE * 2 + (groupNodeCount - 1) * GROUP_RED_X_DELTA * 2);
  const totalWidth = Math.max(ownWidth, childrenWidth);

  tree.groupChildRoots = childRoots;
  tree.groupChildWidths = childWidths;
  tree.groupOwnWidth = ownWidth;
  tree.leftWidth = Math.max(totalWidth / 2, widthDelta / 2);
  tree.rightWidth = Math.max(totalWidth / 2, widthDelta / 2);
  return totalWidth;
};

RedBlack.prototype.setNewPositions234 = function (tree, xPosition, yPosition) {
  if (!this.isNodeVisible(tree)) {
    return;
  }

  if (tree.blackLevel == 0) {
    this.setNewPositions(tree, xPosition, yPosition, 0);
    return;
  }

  tree.x = xPosition;
  tree.y = yPosition;
  tree.heightLabelX = xPosition - 20;
  tree.heightLabelY = yPosition - 20;

  if (this.isRedNonNullNode(tree.left)) {
    tree.left.x = xPosition - GROUP_RED_X_DELTA;
    tree.left.y = yPosition + GROUP_RED_Y_DELTA;
    tree.left.heightLabelX = tree.left.x - 20;
    tree.left.heightLabelY = tree.left.y - 20;
  }
  if (this.isRedNonNullNode(tree.right)) {
    tree.right.x = xPosition + GROUP_RED_X_DELTA;
    tree.right.y = yPosition + GROUP_RED_Y_DELTA;
    tree.right.heightLabelX = tree.right.x + 20;
    tree.right.heightLabelY = tree.right.y - 20;
  }

  const childRoots = tree.groupChildRoots || this.get234ChildRoots(tree);
  const childWidths =
    tree.groupChildWidths || childRoots.map((child) => this.resizeWidths234(child));
  const childrenWidth =
    childWidths.reduce((total, width) => total + width, 0) +
    Math.max(0, childWidths.length - 1) * GROUP_CHILD_SPACING;
  let nextX = xPosition - childrenWidth / 2;

  for (let i = 0; i < childRoots.length; i++) {
    const childWidth = childWidths[i];
    this.setNewPositions234(childRoots[i], nextX + childWidth / 2, yPosition + GROUP_HEIGHT_DELTA);
    nextX += childWidth + GROUP_CHILD_SPACING;
  }
};

RedBlack.prototype.setNewPositions = function (
  tree,
  xPosition,
  yPosition,
  side,
) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree != null && (showNullLeaves || !tree.phantomLeaf)) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
      tree.heightLabelX = xPosition - 20;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
      tree.heightLabelX = xPosition + 20;
    } else {
      tree.heightLabelX = xPosition - 20;
    }
    tree.x = xPosition;
    tree.heightLabelY = tree.y - 20;
    // Children should always be placed exactly one level below the parent.
    // (Previously we sometimes pushed a subtree down an extra level when the
    // sibling was red, which caused red children to appear two levels lower.)
    const childY = yPosition + heightDelta;
    this.setNewPositions(tree.left, xPosition, childY, -1);
    this.setNewPositions(tree.right, xPosition, childY, 1);
  }
};
RedBlack.prototype.animateNewPositions = function (tree) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree != null && (showNullLeaves || !tree.phantomLeaf)) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.cmd("Move", tree.colorLabelID, tree.heightLabelX, tree.heightLabelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

RedBlack.prototype.resizeWidths = function (tree) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree == null || (!showNullLeaves && tree.phantomLeaf)) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), widthDelta / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), widthDelta / 2);
  return tree.leftWidth + tree.rightWidth;
};

RedBlack.prototype.disableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};

RedBlack.prototype.enableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};

/////////////////////////////////////////////////////////
// Red black node
////////////////////////////////////////////////////////

function RedBlackNode(val, id, cid, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.blackLevel = 0;
  this.phantomLeaf = false;
  this.graphicID = id;
  this.colorLabelID = cid;
  this.containerBoxID = null;
  this.left = null;
  this.right = null;
  this.parent = null;
  this.height = 0;
  this.leftWidth = 0;
  this.rightWidth = 0;
}

RedBlackNode.prototype.isLeftChild = function () {
  if (this.parent == null) {
    return true;
  }
  return this.parent.left == this;
};

/////////////////////////////////////////////////////////
// Setup stuff
////////////////////////////////////////////////////////

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new RedBlack(animManag, canvas.width, canvas.height);
}
