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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

// Constants.
import { initAnimationManager, doPlayPause } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

// BST.LINK_COLOR = "#007700";
// BST.HIGHLIGHT_CIRCLE_COLOR = "#007700";
// BST.FOREGROUND_COLOR = "#007700";

BST.FOREGROUND_COLOR = "var(--svgColor)";
// BST.BACKGROUND_COLOR = "#EEFFEE";
// BST.PRINT_COLOR = BST.FOREGROUND_COLOR;

BST.WIDTH_DELTA = 50;
BST.HEIGHT_DELTA = 50;
BST.STARTING_Y = 40;

BST.FIRST_PRINT_POS_X = 50;
BST.PRINT_VERTICAL_GAP = 20;
BST.PRINT_HORIZONTAL_GAP = 50;

export function BST(opts = {}) { 
  if(!opts.title) opts.title = opts.title || "Binary Search Tree";
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

BST.prototype = new Algorithm();
BST.prototype.constructor = BST;
BST.superclass = Algorithm.prototype;

BST.prototype.init = function (am, w, h) {
  var sc = BST.superclass;
  this.startingX = 200; //w / 2 + 50;
  this.first_print_pos_y = h - 2 * BST.PRINT_VERTICAL_GAP;
  this.print_max = w - 10;

  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;

  this.valuesList = [];
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, BST.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
	this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, BST.STARTING_Y - 10);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();

  this.doInsert = function (val) {
    this.implementAction( this.insertElement.bind(this), val);
  };
  this.doDelete = function (val) {
    this.implementAction( this.deleteElement.bind(this), val);
  };
  this.doRemove = function (val) {
    this.implementAction( this.deleteElement.bind(this), val);
  };
  this.doFind = function (val) {
    this.implementAction( this.findElement.bind(this), val);
  };
  this.doPrint = function (order = "In") {
    this.implementAction( this.printTree.bind(this), order);
  };

  // Programmatic traversal bindings
  this.doPre = function () {
    this.implementAction(this.printTree.bind(this), "Pre");
  };
  this.doIn = function () {
    this.implementAction(this.printTree.bind(this), "In");
  };
  this.doPost = function () {
    this.implementAction(this.printTree.bind(this), "Post");
  };

  // Programmatic rotation bindings
  this.doRotateLeft = function (val) {
    this.implementAction(this.rotateLeftAtValue.bind(this), val);
  };
  this.doRotateRight = function (val) {
    this.implementAction(this.rotateRightAtValue.bind(this), val);
  };

  // Programmatic random insert binding
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};

BST.prototype.addControls = function () {
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

  this.rotateLeftButton = addControlToAlgorithmBar("Button", "Rotate Left");
  this.rotateLeftButton.onclick = this.rotateLeftCallback.bind(this);

  this.rotateRightButton = addControlToAlgorithmBar("Button", "Rotate Right");
  this.rotateRightButton.onclick = this.rotateRightCallback.bind(this);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);

  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);

  addSeparatorToAlgorithmBar();

  this.printpreButton = addControlToAlgorithmBar("Button", "Print PreOrder");
  this.printpreButton.onclick = this.print.bind(this, "Pre");

  this.printButton = addControlToAlgorithmBar("Button", "Print InOrder");
  this.printButton.onclick = this.print.bind(this);

  this.printpostButton = addControlToAlgorithmBar("Button", "Print PostOrder");
  this.printpostButton.onclick = this.print.bind(this);
};


BST.prototype.rotateLeftCallback = function (event) {
  var rotateValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  if (rotateValue != "") {
    this.implementAction(this.rotateLeftAtValue.bind(this), rotateValue);
  }
};

BST.prototype.rotateRightCallback = function (event) {
  var rotateValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  if (rotateValue != "") {
    this.implementAction(this.rotateRightAtValue.bind(this), rotateValue);
  }
};

BST.prototype.findNode = function (tree, value) {
  var current = tree;
  while (current != null) {
    if (value == current.data) {
      return current;
    } else if (value < current.data) {
      current = current.left;
    } else {
      current = current.right;
    }
  }
  return null;
};

BST.prototype.rotateLeftAtValue = function (value) {
  this.commands = [];

  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  var x = this.findNode(this.treeRoot, value);
  if (x == null) {
    this.cmd("SetMessage", "Cannot rotate: " + value + " not found");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  this.singleRotateLeft(x);
  this.cmd("SetMessage", "");
  return this.commands;
};

BST.prototype.rotateRightAtValue = function (value) {
  this.commands = [];

  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  var x = this.findNode(this.treeRoot, value);
  if (x == null) {
    this.cmd("SetMessage", "Cannot rotate: " + value + " not found");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  this.singleRotateRight(x);
  this.cmd("SetMessage", "");
  return this.commands;
};

// Single rotation helpers (adapted to BST's pointer + animation style)
BST.prototype.singleRotateLeft = function (x) {
  var y = x.right;
  if (y == null) {
    this.cmd("SetMessage", "Cannot rotate left at " + x.data + ": no right child");
    this.cmd("SetHighlight", x.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", x.graphicID, 0);
    return;
  }

  var B = y.left;
  var p = x.parent;
  var xWasLeftChild = p != null && p.left == x;

  this.cmd("SetMessage", "Rotate left at " + x.data + ": pull up " + y.data);
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");

  if (B != null) {
    this.cmd(
      "SetMessage",
      "Subtree " + B.data + " becomes the right subtree of " + x.data,
    );
    this.cmd("SetHighlight", B.graphicID, 1);
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 0);
    this.cmd("SetHighlight", B.graphicID, 0);
  }

  // Rewire parent -> (x) to parent -> (y)
  if (p == null) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, BST.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, BST.LINK_COLOR);
    y.parent = p;
    if (xWasLeftChild) {
      p.left = y;
    } else {
      p.right = y;
    }
  }

  // x loses y as right child
  this.cmd("Disconnect", x.graphicID, y.graphicID);

  // y adopts x as left child
  this.cmd("Connect", y.graphicID, x.graphicID, BST.LINK_COLOR);

  // Move subtree B
  if (B != null) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, BST.LINK_COLOR);
  }

  // Pointer updates
  x.parent = y;
  x.right = B;
  if (B != null) {
    B.parent = x;
  }
  y.left = x;

  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);

  this.resizeTree();
};

BST.prototype.singleRotateRight = function (x) {
  var y = x.left;
  if (y == null) {
    this.cmd("SetMessage", "Cannot rotate right at " + x.data + ": no left child");
    this.cmd("SetHighlight", x.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", x.graphicID, 0);
    return;
  }

  var B = y.right;
  var p = x.parent;
  var xWasLeftChild = p != null && p.left == x;

  this.cmd("SetMessage", "Rotate right at " + x.data + ": pull up " + y.data);
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");

  if (B != null) {
    this.cmd(
      "SetMessage",
      "Subtree " + B.data + " becomes the left subtree of " + x.data,
    );
    this.cmd("SetHighlight", B.graphicID, 1);
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 0);
    this.cmd("SetHighlight", B.graphicID, 0);
  }

  // Rewire parent -> (x) to parent -> (y)
  if (p == null) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, BST.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, BST.LINK_COLOR);
    y.parent = p;
    if (xWasLeftChild) {
      p.left = y;
    } else {
      p.right = y;
    }
  }

  // x loses y as left child
  this.cmd("Disconnect", x.graphicID, y.graphicID);

  // y adopts x as right child
  this.cmd("Connect", y.graphicID, x.graphicID, BST.LINK_COLOR);

  // Move subtree B
  if (B != null) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, BST.LINK_COLOR);
  }

  // Pointer updates
  x.parent = y;
  x.left = B;
  if (B != null) {
    B.parent = x;
  }
  y.right = x;

  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);

  this.resizeTree();
};

BST.prototype.reset = function () {
  this.nextIndex = 2;
  this.treeRoot = null;
};

BST.prototype.insertCallback = function (event) {
  var insertedValue = this.inputField.value;
  // Get text value
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    // set text value
    this.inputField.value = "";
    this.valuesList.push(insertedValue);
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

BST.prototype.deleteCallback = function (event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.valuesList.splice(this.valuesList.indexOf(deletedValue), 1);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};

BST.prototype.print = function (order) {
  if (order == undefined) {
    order = "In";
  }
  this.implementAction(this.printTree.bind(this, order));
};

BST.prototype.clearCallback = function (event) {
  this.implementAction(this.clearData.bind(this), "");
};

BST.prototype.clearData = function () {
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


BST.prototype.insertRandomCallback = function (event) {
  var numToInsert = 10; // this.inputField.value;
  for (let i = 0; i < numToInsert; i++) {
    const insertedValue = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};


BST.prototype.printTree = function (order) {
  this.commands = [];
  this.printOutput = "";

  if (this.treeRoot != null) {
    this.cmd("SetMessage", "Starting from root");
    this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
    this.cmd("Step");

    this.cmd("SetHighlight", this.treeRoot.graphicID, 0);
    this.printTreeRec(this.treeRoot, order);

    this.cmd("SetMessage", "Final output: " + this.printOutput);
  }
  return this.commands;
};

BST.prototype.printLeft = function (tree, order) {
  if (tree.left != null) {
    this.cmd("SetMessage", tree.data + " has left child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    this.printTreeRec(tree.left, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no left child");
    this.cmd("Step");
  }
};
BST.prototype.printRight = function (tree, order) {
  if (tree.right != null) {
    this.cmd("SetMessage", tree.data + " has right child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
    this.printTreeRec(tree.right, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no right child");
    this.cmd("Step");
  }
};

BST.prototype.printSelf = function (tree) {
  if (this.printOutput.length > 0) {
    this.printOutput += ", ";
  }
  this.printOutput += tree.data;
  this.cmd(
    "SetMessage",
    "Print " + tree.data + "\nCurrent output: " + this.printOutput,
  );
  this.cmd("Step");
};

BST.prototype.printTreeRec = function (tree, order) {
  this.cmd("SetHighlight", tree.graphicID, 1);

  if (order == "Pre") {
    this.printSelf(tree);
    this.printLeft(tree, order);
    this.printRight(tree, order);
  } else if (order == "Post") {
    this.printLeft(tree, order);
    this.printRight(tree, order);
    this.printSelf(tree);
  } else {
    this.printLeft(tree, order);
    this.printSelf(tree);
    this.printRight(tree, order);
  }

  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetMessage", "Done with " + tree.data + " return to parent");
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
};

BST.prototype.findCallback = function (event) {
  var findValue;
  findValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  this.implementAction(this.findElement.bind(this), findValue);
};

BST.prototype.findElement = function (findValue) {
  this.commands = [];

  this.highlightID = this.nextIndex++;

  this.cmd("SetMessage", "Searching for " + findValue + "\nstarting from root");
  this.cmd("Step");
  this.findImpl(this.treeRoot, findValue);

  return this.commands;
};

BST.prototype.findImpl = function (tree, value) {
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " +
          value +
          " \n" +
          value +
          " = " +
          value +
          "\n(Element found!)",
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
            " \n" +
            value +
            " < " +
            tree.data +
            "\n(look to left subtree)",
        );

        if(tree.left != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
        this.cmd("Step");

        if(tree.left != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.findImpl(tree.left, value);
      } else {
        this.cmd(
          "SetMessage",
          "Searching for " +
            value +
            " \n" +
            value +
            " > " +
            tree.data +
            "\n(look to right subtree)",
        );
        if(tree.right != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
        this.cmd("Step");
        if(tree.right != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.findImpl(tree.right, value);
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      "Searching for " + value + " \n" + "hit null (Element not found)",
    );
  }
};

BST.prototype.insertElement = function (insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting " + insertedValue);

  if (this.treeRoot == null) {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      insertedValue,
      this.startingX,
      BST.STARTING_Y,
    );
    this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);

    this.cmd(
      "SetMessage",
      `Root is null. Inserting ${insertedValue} as the root`,
    );
    this.cmd("Step");
    
    this.cmd("SetNull", this.rootIndex, 0);

    this.cmd("Connect", 0, this.nextIndex, BST.LINK_COLOR);
    //this.cmd("SetHighlight", this.nextIndex, 1);
    this.treeRoot = new BSTNode(
      insertedValue,
      this.nextIndex,
      this.startingX,
      BST.STARTING_Y,
    );
    this.nextIndex += 1;
  } else {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      insertedValue,
      this.startingX - 200,
      BST.STARTING_Y,
    );
    this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
    //this.cmd("SetHighlight", this.nextIndex, 1);
    this.cmd("Step");
    var insertElem = new BSTNode(insertedValue, this.nextIndex, 50, 100);

    this.nextIndex += 1;
    this.cmd("SetHighlight", insertElem.graphicID, 1);
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }
  this.cmd("SetMessage", "");
  return this.commands;
};

BST.prototype.insert = function (elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);

  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree",
    );
    if(tree.left != null)
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree",
    );
    if(tree.right != null)
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);

  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");

      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
    } else {
      if(tree.left != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
      elem.x = tree.x + BST.WIDTH_DELTA / 2;
      elem.y = tree.y + BST.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
    } else {
      if(tree.right != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insert(elem, tree.right);
    }
  }
};

BST.prototype.deleteElement = function (deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", "");
  // Do delete
  return this.commands;
};

BST.prototype.treeDelete = function (tree, valueToDelete) {
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
      if(tree.left != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    } else if (valueToDelete > tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " > " + tree.data + ".  Looking at right subtree",
      );
      if(tree.right != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    } else {
      this.cmd(
        "SetMessage",
        valueToDelete + " == " + tree.data + ".  Found node to delete",
      );
    }
    this.cmd("Step");

    if (valueToDelete == tree.data) {
      if (tree.left == null && tree.right == null) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.cmd("Delete", tree.graphicID);
        if (leftchild && tree.parent != null) {
          tree.parent.left = null;
        } else if (tree.parent != null) {
          tree.parent.right = null;
        } else {
          this.treeRoot = null;
          this.cmd("SetNull", this.rootIndex, 1);
          this.cmd("Disconnect", 0, tree.graphicID);
        }
        this.resizeTree();
        this.cmd("Step");
      } else if (tree.left == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.",
        );
        if (tree.parent != null) {
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            BST.LINK_COLOR,
          );
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          if (leftchild) {
            tree.parent.left = tree.right;
          } else {
            tree.parent.right = tree.right;
          }
          tree.right.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
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
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            BST.LINK_COLOR,
          );
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          if (leftchild) {
            tree.parent.left = tree.left;
          } else {
            tree.parent.right = tree.left;
          }
          tree.left.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } // tree.left != null && tree.right != null
      else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind smallest node in right subtree.",
        );
        this.cmd("Step");

        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          BST.HIGHLIGHT_CIRCLE_COLOR,
          tree.x,
          tree.y,
        );
        var tmp = tree;
        tmp = tree.right;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd(
          "SetMessage",
          "Go to right subtree.",
        );
        this.cmd("Step");
        while (tmp.left != null) {
          tmp = tmp.left;
          this.cmd(
            "SetMessage",
            "Move left to find smallest value.",
          );
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        this.cmd(
          "SetMessage",
          "No left child found.  Smallest value is " + tmp.data + ".",
        );
        this.cmd("Step");
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
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
        this.cmd(
          "SetMessage",
          "Now remove the original node we copied from (in the right subtree).",
        );
        this.cmd("Step");

        // The copied value came from the minimum of the right subtree.
        // Deleting that value from tree.right will remove the duplicate node
        // using the standard animated delete cases (0/1 child).
        this.treeDelete(tree.right, tree.data);
      }
    } else if (valueToDelete < tree.data) {
      
      this.cmd("SetHighlight", tree.graphicID, 0);
    
      if(tree.left != null)
       this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    
      this.treeDelete(tree.left, valueToDelete);
    } else {
      this.cmd("SetHighlight", tree.graphicID, 0);
      if(tree.right != null)
       this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      
      this.treeDelete(tree.right, valueToDelete);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete",
    );
  }
};

BST.prototype.resizeTree = function () {
  // Keep the root node fixed relative to the root pointer.
  // Children are laid out relative to this fixed x position.
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    this.setNewPositions(this.treeRoot, startingPoint, BST.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};

BST.prototype.setNewPositions = function (tree, xPosition, yPosition, side) {
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
      yPosition + BST.HEIGHT_DELTA,
      -1,
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + BST.HEIGHT_DELTA,
      1,
    );
  }
};
BST.prototype.animateNewPositions = function (tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};

BST.prototype.resizeWidths = function (tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), BST.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    BST.WIDTH_DELTA / 2,
  );
  return tree.leftWidth + tree.rightWidth;
};

function BSTNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}

BST.prototype.disableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};

BST.prototype.enableUI = function (event) {
  let inputs = document
    .getElementById("AlgorithmSpecificControls")
    .querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};
