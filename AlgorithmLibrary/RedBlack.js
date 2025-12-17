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

export function RedBlack(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Red Black Tree";
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


RedBlack.prototype = new Algorithm();
RedBlack.prototype.constructor = RedBlack;
RedBlack.superclass = Algorithm.prototype;

RedBlack.prototype.init = function (am, w, h) {
  var sc = RedBlack.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.groupBoxes = {};
  this.rootIndex = 0;
  this.startingX = w / 2;
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
  
  this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  
  addSeparatorToAlgorithmBar();
  
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
  
  addSeparatorToAlgorithmBar();
  
  this.showNullLeaves = addCheckboxToAlgorithmBar("Show Null Leaves", 'NullLeavesCheck');
  this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
  this.showNullLeaves.checked = false;
};

RedBlack.prototype.reset = function () {
  this.nextIndex = 2;
  this.treeRoot = null;
};

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

var EXPLANITORY_TEXT_Y = 10;

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


RedBlack.prototype.updateGroupingsRec = function (tree, show) {
  console.log("in", tree)
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.updateGroupingsRec(tree.left, show);
  }
  if(tree.blackLevel == 1 && show) {
    let minX = tree.x - NODE_SIZE;
    let minY = tree.y - NODE_SIZE;
    let maxX = tree.x + NODE_SIZE;
    let maxY = tree.y + NODE_SIZE;
    if(tree.left && tree.left.blackLevel == 0) {
      minX = tree.left.x - NODE_SIZE;
      maxY = tree.left.y + NODE_SIZE;
    }
    if(tree.right && tree.right.blackLevel == 0) {
      maxX = tree.right.x + NODE_SIZE;
      maxY = tree.right.y + NODE_SIZE;
    }
    maxY -= 5;
    let width = maxX - minX;
    let height = maxY - minY;

    if(tree.containerBoxID) {
      console.log("move" , tree.containerBoxID)
      this.cmd("MOVE", tree.containerBoxID, minX, minY);
      this.cmd("SETHEIGHT", tree.containerBoxID, height);
      this.cmd("SETWIDTH", tree.containerBoxID, width);
    } else {
      tree.containerBoxID = this.nextIndex + 1;
      this.cmd("CreateRectangle", this.nextIndex++, "", width, height, minX, minY, "left", "top");
      this.cmd("SetLayer", this.nextIndex - 1, -1);
      //this.cmd("MOVE", this.nextIndex - 1, minX, minY);
      console.log("CreateRectangle", this.nextIndex - 1, "", width, height, minX, minY);
      console.log("SetMessage", "Box for " + tree.graphicID);
      this.cmd("SetMessage", "Box for " + tree.graphicID);
    }

  } else {
    //red - do we need to cleanup box?
    if(tree.containerBoxID) {
      this.cmd("Delete", this.containerBoxID);
      this.containerBoxID = null;
    }
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.updateGroupingsRec(tree.right, show);
  }
}

RedBlack.prototype.updateGroupings = function (unused) {
  console.log("updateGroupings", this.treeRoot)
  console.log(this.recordAnimation)
  this.commands = [];
  let show = this.showNullLeaves.checked;
  if(this.treeRoot)
    this.updateGroupingsRec(this.treeRoot, show);
  console.log(this.commands)
  return this.commands;
}

RedBlack.prototype.showNullLeavesCallback = function (event) {
  //this.commands = [];
  this.implementAction(this.updateGroupings.bind(this), "") ;
  //console.log("show layers callback");
  // if (this.showNullLeaves.checked) {
  //   console.log("show layers 0 1");
  //   this.animationManager.setAllLayers([0, 1]);
  // } else {
  //   console.log("show layers 0");
  //   this.animationManager.setAllLayers([0]);
  // }
};

RedBlack.prototype.printTree = function (unused) {
  this.commands = [];

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
    this.cmd("Step");
    for (var i = firstLabel; i < this.nextIndex; i++) this.cmd("Delete", i);
    this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
  }
  return this.commands;
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
  this.commands = [];

  this.highlightID = this.nextIndex++;

  this.findImpl(this.treeRoot, findValue);

  return this.commands;
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
  var treeNodeID = this.nextIndex++;
  var labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    this.startingX + 20,
    startingY - 20,
  );
  node.left = new RedBlackNode("", treeNodeID, labelID, this.startingX, startingY);
  node.left.phantomLeaf = true;
  this.cmd("SetLayer", treeNodeID, 1);
  node.left.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};

RedBlack.prototype.attachRightNullLeaf = function (node) {
  // Add phantom right leaf
  let treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    this.startingX + 20,
    startingY - 20,
  );
  node.right = new RedBlackNode("", treeNodeID, labelID, this.startingX, startingY);
  this.cmd("SetLayer", treeNodeID, 1);

  node.right.phantomLeaf = true;
  node.right.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};
RedBlack.prototype.attachNullLeaves = function (node) {
  this.attachLeftNullLeaf(node);
  this.attachRightNullLeaf(node);
};

RedBlack.prototype.insertElement = function (insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", " Inserting " + insertedValue);
  this.cmd("Step");

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
  } else {
    treeNodeID = this.nextIndex++;
    let labelID = this.nextIndex++;

    this.cmd("CreateCircle", treeNodeID, insertedValue, NODE_SIZE, startingY);
    this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_RED);
    this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_RED);
    this.cmd("Step");
    this.cmd(
      "CreateLabel",
      labelID,
      "R",
      80,
      80,
    );
    var insertElem = new RedBlackNode(insertedValue, treeNodeID, labelID, 100, 100);

    this.cmd("SetHighlight", insertElem.graphicID, 1);
    insertElem.height = 1;
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }
  this.cmd("SetMessage", " ");
  return this.commands;
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
  this.commands = new Array();
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", " ");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", " ");
  // Do delete
  return this.commands;
};

RedBlack.prototype.fixLeftNull = function (tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
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
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, labelID, tree.x, tree.y);
  nullLeaf.blackLevel = 2;
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  tree.left = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);

  this.resizeTree();
  this.fixExtraBlackChild(tree, true);
  this.cmd("SetLayer", nullLeaf.graphicID, 1);
  nullLeaf.blackLevel = 1;
  this.fixNodeColor(nullLeaf);
};

RedBlack.prototype.fixRightNull = function (tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
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
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  nullLeaf.blackLevel = 2;
  tree.right = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);

  this.resizeTree();

  this.fixExtraBlackChild(tree, false);

  this.cmd("SetLayer", nullLeaf.graphicID, 1);
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
        this.cmd("Delete", tree.graphicID);
        this.cmd("Delete", tree.colorLabelID);

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
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
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
          this.cmd("Delete", tree.graphicID);
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
          this.cmd("Delete", tree.graphicID);
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
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
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
          "Node to delete has two childern.  \nFind largest node in left subtree.",
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
        tmp = tree.left;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd("Step");
        while (tmp.right != null && !tmp.right.phantomLeaf) {
          tmp = tmp.right;
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        if (tmp.right != null) {
          this.cmd("Delete", tmp.right.graphicID);
          tmp.right = null;
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
          "Copy largest value of left subtree into node to delete.",
        );

        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetMessage", "Remove node whose value we copied.");

        needFix = tmp.blackLevel > 0;

        if (tmp.left == null) {
          this.cmd("Delete", tmp.graphicID);
          if (tmp.parent != tree) {
            tmp.parent.right = null;
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
          } else {
            tree.left = null;
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
          }
        } else {
          this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
          this.cmd(
            "Connect",
            tmp.parent.graphicID,
            tmp.left.graphicID,
            LINK_COLOR,
          );
          this.cmd("Step");
          this.cmd("Delete", tmp.graphicID);

          if (tmp.parent != tree) {
            tmp.parent.right = tmp.left;
            tmp.left.parent = tmp.parent;
            this.resizeTree();

            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.left.blackLevel++;
              if (tmp.left.phantomLeaf) {
                this.cmd("SetLayer", tmp.left.graphicID, 0);
              }
              this.fixNodeColor(tmp.left);
              this.fixExtraBlack(tmp.left);
              if (tmp.left.phantomLeaf) {
                this.cmd("SetLayer", tmp.left.graphicID, 1);
              }
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required.",
              );
              this.cmd("Step");
            }
          } else {
            tree.left = tmp.left;
            tmp.left.parent = tree;
            this.resizeTree();
            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.left.blackLevel++;
              if (tmp.left.phantomLeaf) {
                this.cmd("SetLayer", tmp.left.graphicID, 0);
              }

              this.fixNodeColor(tmp.left);
              this.fixExtraBlack(tmp.left);
              if (tmp.left.phantomLeaf) {
                this.cmd("SetLayer", tmp.left.graphicID, 1);
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

RedBlack.prototype.resizeTree = function () {
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
    this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
    this.animateNewPositions(this.treeRoot);
    this.updateGroupings();
    this.cmd("Step");
  }
};

RedBlack.prototype.setNewPositions = function (
  tree,
  xPosition,
  yPosition,
  side,
) {
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
    console.log(tree.data)
    console.log(tree.blackLevel)
    if(tree.left)console.log(tree.left.blackLevel, tree.left.data)
    if(tree.right) console.log(tree.right.blackLevel, tree.right.data)
    let leftHeight = yPosition + heightDelta;
    if( tree.right && tree.right.blackLevel === 0)
      leftHeight += heightDelta;
    let rightHeight = yPosition + heightDelta;
    if( tree.left && tree.left.blackLevel === 0)
      rightHeight += heightDelta;
    this.setNewPositions(tree.left, xPosition, leftHeight, -1);
    this.setNewPositions(tree.right, xPosition, rightHeight, 1);
  }
};
RedBlack.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.cmd("Move", tree.colorLabelID, tree.heightLabelX, tree.heightLabelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

RedBlack.prototype.resizeWidths = function (tree) {
  if (tree == null) {
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
