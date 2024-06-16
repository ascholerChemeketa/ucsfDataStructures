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
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

// var currentAlg;

// function init()
// {
// 	var animManag = initCanvas(canvas);
// 	currentAlg = new AVL(animManag, canvas.width, canvas.height);
// }

export function AVL(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Binary Search Tree";
  opts.centered = true;

  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

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

AVL.prototype = new Algorithm();
AVL.prototype.constructor = AVL;
AVL.superclass = Algorithm.prototype;

AVL.HIGHLIGHT_LABEL_COLOR = "#FF0000";
AVL.HIGHLIGHT_LINK_COLOR = "#FF0000";

// AVL.HIGHLIGHT_COLOR = "#007700";
// AVL.HEIGHT_LABEL_COLOR = "#007700";

// AVL.LINK_COLOR = "#007700";
// AVL.HIGHLIGHT_CIRCLE_COLOR = "#007700";
// AVL.FOREGROUND_COLOR = "0x007700";
// AVL.BACKGROUND_COLOR = "#DDFFDD";
// AVL.PRINT_COLOR = AVL.FOREGROUND_COLOR;

AVL.WIDTH_DELTA = 50;
AVL.HEIGHT_DELTA = 50;
AVL.STARTING_Y = 50;

AVL.FIRST_PRINT_POS_X = 50;
AVL.PRINT_VERTICAL_GAP = 20;
AVL.PRINT_HORIZONTAL_GAP = 50;
AVL.EXPLANITORY_TEXT_X = 10;
AVL.EXPLANITORY_TEXT_Y = 10;

AVL.prototype.init = function (am, w, h) {
  var sc = AVL.superclass;
  var fn = sc.init;
  this.first_print_pos_y = h - 2 * AVL.PRINT_VERTICAL_GAP;
  this.print_max = w - 10;

  fn.call(this, am, w, h);
  this.startingX = w / 2;
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, AVL.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
	this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, AVL.STARTING_Y - 10);

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
};

AVL.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(  
    this.inputField,
    this.insertCallback.bind(this),
    6,
  );

  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);

  this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
  this.deleteButton.onclick = this.deleteCallback.bind(this);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);

  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert X Random");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);

  addSeparatorToAlgorithmBar();

  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this, "Print");
};

AVL.prototype.reset = function () {
  this.nextIndex = 1;
  this.treeRoot = null;
};

AVL.prototype.insertCallback = function (event) {
  var insertedValue = this.inputField.value;
  // Get text value
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    // set text value
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

AVL.prototype.deleteCallback = function (event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};

AVL.prototype.findCallback = function (event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    findValue = this.normalizeNumber(findValue, 4);
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

AVL.prototype.printCallback = function (event) {
  this.implementAction(this.printTree.bind(this), "");
};

AVL.prototype.clearCallback = function (event) {
  this.implementAction(this.clearData.bind(this), "");
};

AVL.prototype.clearData = function () {
  if (this.treeRoot == null)
  return;
  this.commands = new Array();
  
  function clearTree(tree, handler) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left, handler);
      }
      if (tree.right != null) {
        clearTree(tree.right, handler);
      }
    }
    handler.cmd("Delete", tree.graphicID);
  }

  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("SetMessage", "");
  return this.commands;
};


AVL.prototype.insertRandomCallback = function (event) {
  var numToInsert = this.inputField.value;
  for (let i = 0; i < numToInsert; i++) {
    const insertedValue = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};


AVL.prototype.sizeChanged = function (newWidth, newHeight) {
  this.startingX = newWidth / 2;
};

AVL.prototype.printTree = function (unused) {
  this.commands = [];

  if (this.treeRoot != null) {
    this.highlightID = this.nextIndex++;
    var firstLabel = this.nextIndex;
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      AVL.HIGHLIGHT_COLOR,
      this.treeRoot.x,
      this.treeRoot.y,
    );
    this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
    this.yPosOfNextLabel = this.first_print_pos_y;
    this.printTreeRec(this.treeRoot);
    this.cmd("Delete", this.highlightID);
    this.cmd("Step");
    for (var i = firstLabel; i < this.nextIndex; i++) this.cmd("Delete", i);
    this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
  }
  return this.commands;
};

AVL.prototype.printTreeRec = function (tree) {
  this.cmd("Step");
  if (tree.left != null) {
    this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
    this.printTreeRec(tree.left);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  var nextLabelID = this.nextIndex++;
  this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
  this.cmd("SetForegroundColor", nextLabelID, AVL.PRINT_COLOR);
  this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
  this.cmd("Step");

  this.xPosOfNextLabel += AVL.PRINT_HORIZONTAL_GAP;
  if (this.xPosOfNextLabel > this.print_max) {
    this.xPosOfNextLabel = AVL.FIRST_PRINT_POS_X;
    this.yPosOfNextLabel += AVL.PRINT_VERTICAL_GAP;
  }
  if (tree.right != null) {
    this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
    this.printTreeRec(tree.right);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  return;
};

AVL.prototype.findElement = function (findValue) {
  this.commands = [];

  this.highlightID = this.nextIndex++;

  this.doFind(this.treeRoot, findValue);

  return this.commands;
};

AVL.prototype.doFind = function (tree, value) {
  this.cmd("SetMessage", "Searchiing for " + value);
  if (tree != null) {
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
            AVL.HIGHLIGHT_COLOR,
            tree.x,
            tree.y,
          );
          this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.doFind(tree.left, value);
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
            AVL.HIGHLIGHT_COLOR,
            tree.x,
            tree.y,
          );
          this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.doFind(tree.right, value);
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
  }
};

AVL.prototype.insertElement = function (insertedValue) {
  this.commands = [];
  this.cmd("SetMessage", " Inserting " + insertedValue);

  if (this.treeRoot == null) {
    var treeNodeID = this.nextIndex++;
    var labelID = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX,
      AVL.STARTING_Y,
    );
    this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);


    this.cmd(
      "SetMessage",
      `Root is null. Inserting ${insertedValue} as the root`,
    );
    this.cmd("Step");

    this.cmd(
      "CreateLabel",
      labelID,
      1,
      this.startingX - 20,
      AVL.STARTING_Y - 20,
    );
    this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("Step");
    
    
    this.cmd("SetNull", this.rootIndex, 0);

    this.cmd("Connect", 0, treeNodeID, AVL.LINK_COLOR);
    this.treeRoot = new AVLNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX,
      AVL.STARTING_Y,
    );
    this.treeRoot.height = 1;
  } else {
    treeNodeID = this.nextIndex++;
    labelID = this.nextIndex++;
    this.highlightID = this.nextIndex++;

    this.cmd("CreateCircle", treeNodeID, insertedValue, 30, AVL.STARTING_Y);

    this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
    this.cmd("CreateLabel", labelID, "", 100 - 20, 100 - 20);
    this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("Step");
    var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 100, 100);

    this.cmd("SetHighlight", insertElem.graphicID, 1);
    insertElem.height = 1;
    this.insert(insertElem, this.treeRoot);
    //				this.resizeTree();
  }
  this.cmd("SetMessage", " ");
  return this.commands;
};

AVL.prototype.singleRotateRight = function (tree) {
  var B = tree;
  var t3 = B.right;
  var A = tree.left;
  var t1 = A.left;
  var t2 = A.right;

  this.cmd("SetMessage", `Single Rotation of ${A.data}`);
  this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
  this.cmd("Step");

  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, AVL.LINK_COLOR);
    t2.parent = B;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, AVL.LINK_COLOR);
  A.parent = B.parent;
  if (this.treeRoot == B) {
    this.treeRoot = A;
    this.cmd("Disconnect", 0, B.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", 0, A.graphicID, AVL.LINK_COLOR);
  } else {
    this.cmd("Disconnect", B.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", B.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
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
};

AVL.prototype.singleRotateLeft = function (tree) {
  var A = tree;
  var B = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;

  this.cmd("SetMessage", `Single Rotation of ${B.data}`);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.cmd("Step");

  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
    t2.parent = A;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
  B.parent = A.parent;
  if (this.treeRoot == A) {
    this.treeRoot = B;
    this.cmd("Disconnect", 0, A.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", 0, B.graphicID, AVL.LINK_COLOR);
  } else {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", A.parent.graphicID, B.graphicID, AVL.LINK_COLOR);

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
};

AVL.prototype.getHeight = function (tree) {
  if (tree == null) {
    return 0;
  }
  return tree.height;
};

AVL.prototype.resetHeight = function (tree) {
  if (tree != null) {
    var newHeight =
      Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    if (tree.height != newHeight) {
      tree.height =
        Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
      this.cmd("SetText", tree.heightLabelID, newHeight);
      //			this.cmd("SetText",tree.heightLabelID, newHeight);
    }
  }
};

AVL.prototype.doubleRotateRight = function (tree) {
  var A = tree.left;
  var B = tree.left.right;
  var C = tree;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetMessage", `Zig-Zag Rotate. ${C.data}'s left subtree is too tall and the left child's right subtree is taller than its left.  Rotate ${B.data} twice.`);


  this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 1);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);

  this.cmd("Step");

  this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 0);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 0);

  this.singleRotateLeft(A);
  this.singleRotateRight(C);
};

AVL.prototype.doubleRotateLeft = function (tree) {
  var A = tree;
  var B = tree.right.left;
  var C = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetMessage", `Zig-Zag Rotate. ${A.data}'s right subtree is too tall and the right child's left subtree is taller than its right.  Rotate ${B.data} twice.`);

  this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 1);
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);

  this.cmd("Step");

  this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 0);
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 0);

  this.singleRotateRight(C);
  this.singleRotateLeft(A);
};

AVL.prototype.insert = function (elem, tree) {
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
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetText", elem.heightLabelID, 1);

      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);

      this.resizeTree();
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.left.x,
        tree.left.y,
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", "Unwinding Recursion");
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);

      if (tree.height < tree.left.height + 1) {
        tree.height = tree.left.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.x,
        tree.y,
      );
      this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.left);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.left.x,
        tree.left.y,
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", "Unwinding Recursion");
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);

      if (tree.height < tree.left.height + 1) {
        tree.height = tree.left.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
      if (
        (tree.right != null && tree.left.height > tree.right.height + 1) ||
        (tree.right == null && tree.left.height > 1)
      ) {
        if (elem.data < tree.left.data) {
          this.cmd("SetMessage", `Single rotation. ${tree.data}'s left subtree is too tall and the left child's left subtree is taller than its right.`);
          this.cmd("Step");
          this.singleRotateRight(tree);
        } else {
          this.doubleRotateRight(tree);
        }
      }
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetText", elem.heightLabelID, 1);
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
      elem.x = tree.x + AVL.WIDTH_DELTA / 2;
      elem.y = tree.y + AVL.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);

      this.resizeTree();

      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.right.x,
        tree.right.y,
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", "Unwinding Recursion");
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);

      if (tree.height < tree.right.height + 1) {
        tree.height = tree.right.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.x,
        tree.y,
      );
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.right);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.right.x,
        tree.right.y,
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", "Unwinding Recursion");
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      if (tree.height < tree.right.height + 1) {
        tree.height = tree.right.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
      if (
        (tree.left != null && tree.right.height > tree.left.height + 1) ||
        (tree.left == null && tree.right.height > 1)
      ) {
        if (elem.data >= tree.right.data) {
          this.cmd("SetMessage", `Single rotation. ${tree.data}'s right subtree is too tall and the right child's right subtree is taller than its left.`);
          this.cmd("Step");
          this.singleRotateLeft(tree);
        } else {
          this.doubleRotateLeft(tree);
        }
      }
    }
  }
};

AVL.prototype.deleteElement = function (deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", " ");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", " ");
  return this.commands;
};

AVL.prototype.treeDelete = function (tree, valueToDelete) {
  var leftchild = false;
  if (tree != null) {
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
      if (tree.left == null && tree.right == null) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.cmd("Delete", tree.graphicID);
        this.cmd("Delete", tree.heightLabelID);
        if (leftchild && tree.parent != null) {
          tree.parent.left = null;
        } else if (tree.parent != null) {
          tree.parent.right = null;
        } else {
          this.treeRoot = null;
        }
        this.resizeTree();
        this.cmd("Step");
      } else if (tree.left == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.",
        );
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            AVL.LINK_COLOR,
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          if (leftchild) {
            tree.parent.left = tree.right;
          } else {
            tree.parent.right = tree.right;
          }
          tree.right.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          this.treeRoot = tree.right;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } else if (tree.right == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.",
        );
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            AVL.LINK_COLOR,
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          if (leftchild) {
            tree.parent.left = tree.left;
          } else {
            tree.parent.right = tree.left;
          }
          tree.left.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } // tree.left != null && tree.right != null
      else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind largest node in left subtree.",
        );

        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        var tmp = tree;
        tmp = tree.left;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd("Step");
        while (tmp.right != null) {
          tmp = tmp.right;
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
        this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
        tree.data = tmp.data;
        this.cmd("Move", labelID, tree.x, tree.y);
        this.cmd(
          "SetMessage",
          "Copy largest value of left subtree into node to delete.",
        );

        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetMessage", "Remove node whose value we copied.");

        if (tmp.left == null) {
          if (tmp.parent != tree) {
            tmp.parent.right = null;
          } else {
            tree.left = null;
          }
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.heightLabelID);
          this.resizeTree();
        } else {
          this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
          this.cmd(
            "Connect",
            tmp.parent.graphicID,
            tmp.left.graphicID,
            AVL.LINK_COLOR,
          );
          this.cmd("Step");
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.heightLabelID);
          if (tmp.parent != tree) {
            tmp.parent.right = tmp.left;
            tmp.left.parent = tmp.parent;
          } else {
            tree.left = tmp.left;
            tmp.left.parent = tree;
          }
          this.resizeTree();
        }
        tmp = tmp.parent;

        if (
          this.getHeight(tmp) !=
          Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1
        ) {
          tmp.height =
            Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1;
          this.cmd("SetText", tmp.heightLabelID, tmp.height);
          this.cmd("SetMessage", "Adjusting height after recursive call");
          this.cmd(
            "SetForegroundColor",
            tmp.heightLabelID,
            AVL.HIGHLIGHT_LABEL_COLOR,
          );
          this.cmd("Step");
          this.cmd(
            "SetForegroundColor",
            tmp.heightLabelID,
            AVL.HEIGHT_LABEL_COLOR,
          );
        }

        while (tmp != tree) {
          var tmpPar = tmp.parent;
          // TODO:  Add extra animation here?
          if (this.getHeight(tmp.left) - this.getHeight(tmp.right) > 1) {
            if (
              this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left)
            ) {
              this.doubleRotateRight(tmp);
            } else {
              this.singleRotateRight(tmp);
            }
          }
          if (tmpPar.right != null) {
            if (tmpPar == tree) {
              this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                AVL.HIGHLIGHT_COLOR,
                tmpPar.left.x,
                tmpPar.left.y,
              );
            } else {
              this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                AVL.HIGHLIGHT_COLOR,
                tmpPar.right.x,
                tmpPar.right.y,
              );
            }
            this.cmd("Move", this.highlightID, tmpPar.x, tmpPar.y);
            this.cmd("SetMessage", "Backing up ...");

            if (
              this.getHeight(tmpPar) !=
              Math.max(
                this.getHeight(tmpPar.left),
                this.getHeight(tmpPar.right),
              ) +
              1
            ) {
              tmpPar.height =
                Math.max(
                  this.getHeight(tmpPar.left),
                  this.getHeight(tmpPar.right),
                ) + 1;
              this.cmd("SetText", tmpPar.heightLabelID, tree.height);
              this.cmd("SetMessage", "Adjusting height after recursive call");
              this.cmd(
                "SetForegroundColor",
                tmpPar.heightLabelID,
                AVL.HIGHLIGHT_LABEL_COLOR,
              );
              this.cmd("Step");
              this.cmd(
                "SetForegroundColor",
                tmpPar.heightLabelID,
                AVL.HEIGHT_LABEL_COLOR,
              );
            }

            //28,15,50,7,22,39,55,10,33,42,63,30 .

            this.cmd("Step");
            this.cmd("Delete", this.highlightID);
          }
          tmp = tmpPar;
        }
        if (this.getHeight(tree.right) - this.getHeight(tree.left) > 1) {
          if (
            this.getHeight(tree.right.left) > this.getHeight(tree.right.right)
          ) {
            this.doubleRotateLeft(tree);
          } else {
            this.singleRotateLeft(tree);
          }
        }
      }
    } else if (valueToDelete < tree.data) {
      if (tree.left != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.left, valueToDelete);
      if (tree.left != null) {
        this.cmd("SetMessage", "Unwinding recursion.");
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.left.x,
          tree.left.y,
        );
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      if (this.getHeight(tree.right) - this.getHeight(tree.left) > 1) {
        if (
          this.getHeight(tree.right.left) > this.getHeight(tree.right.right)
        ) {
          this.doubleRotateLeft(tree);
        } else {
          this.singleRotateLeft(tree);
        }
      }
      if (
        this.getHeight(tree) !=
        Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
      ) {
        tree.height =
          Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
    } else {
      if (tree.right != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y,
        );
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.right, valueToDelete);
      if (tree.right != null) {
        this.cmd("SetMessage", "Unwinding recursion.");
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.right.x,
          tree.right.y,
        );
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }

      if (this.getHeight(tree.left) - this.getHeight(tree.right) > 1) {
        if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left)) {
          this.doubleRotateRight(tree);
        } else {
          this.singleRotateRight(tree);
        }
      }
      if (
        this.getHeight(tree) !=
        Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
      ) {
        tree.height =
          Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", "Adjusting height after recursive call");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR,
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR,
        );
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete",
    );
  }
};

AVL.prototype.resizeTree = function () {
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
    this.setNewPositions(this.treeRoot, startingPoint, AVL.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};

AVL.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
  if (tree != null) {
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
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + AVL.HEIGHT_DELTA,
      -1,
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + AVL.HEIGHT_DELTA,
      1,
    );
  }
};
AVL.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.cmd("Move", tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

AVL.prototype.resizeWidths = function (tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), AVL.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    AVL.WIDTH_DELTA / 2,
  );
  return tree.leftWidth + tree.rightWidth;
};


AVL.prototype.disableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};

AVL.prototype.enableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};


function AVLNode(val, id, hid, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.heightLabelID = hid;
  this.height = 1;

  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}

AVLNode.prototype.isLeftChild = function () {
  if (this.parent == null) {
    return true;
  }
  return this.parent.left == this;
};
