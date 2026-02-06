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

// Based on LinkedListTail.js, but without a tail pointer and without Insert Back.

var LINKED_LIST_START_X = 150;
var LINKED_LIST_START_Y = 150;
var LINKED_LIST_ELEM_WIDTH = 50;
var LINKED_LIST_ELEM_HEIGHT = 25;

var LINKED_LIST_ELEMS_PER_LINE = 10;
var LINKED_LIST_ELEM_SPACING = 70;
var LINKED_LIST_LINE_SPACING = 100;

var TOP_POS_X = 70;
var TOP_POS_Y = 50;
var TOP_LABEL_X = TOP_POS_X;
var TOP_LABEL_Y = 25;

var TOP_ELEM_WIDTH = 40;
var TOP_ELEM_HEIGHT = 25;

// Keep the same overall top-row spacing as LinkedListTail.js so the rest of the
// coordinates (Temp/Current/toDelete) can stay consistent.
var TAIL_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 2;

var TEMP_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 4;
var TEMP_LABEL_X = TEMP_POS_X;
var TEMP_POS_Y = LINKED_LIST_START_Y + 100;
var TEMP_LABEL_Y = TEMP_POS_Y - 25;

var CURRENT_POS_X = TOP_POS_X;
var CURRENT_LABEL_X = CURRENT_POS_X;
var CURRENT_POS_Y = TEMP_POS_Y;
var CURRENT_LABEL_Y = CURRENT_POS_Y - 25;

var TODELETE_POS_X = TEMP_POS_X + TOP_ELEM_WIDTH * 2;
var TODELETE_LABEL_X = TODELETE_POS_X;
var TODELETE_POS_Y = TEMP_POS_Y;
var TODELETE_LABEL_Y = TODELETE_POS_Y - 25;

var ACTION_LABEL_X = TAIL_POS_X + TOP_ELEM_WIDTH * 3;
var ACTION_LABEL_Y = 25;
var ACTION_ELEMENT_X = ACTION_LABEL_X;
var ACTION_ELEMENT_Y = 50;

var SIZE = 32;

export function LinkedListSimple(opts = {}) {
  if (!opts.title) opts.title = opts.title || "SimpleLinkedList";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

  if (opts.initialData) {
    // When seeding via repeated Insert Front operations, the head (last inserted)
    // would otherwise drift left. Offset the first inserted node so that after all
    // inserts, the head ends up slightly to the right of the head pointer.
    const n = opts.initialData.length;
    if (n > 0) {
      const desiredHeadX = LINKED_LIST_START_X;
      this._initialFirstNodeX = desiredHeadX + (n - 1) * LINKED_LIST_ELEM_SPACING;
    }
    for (let d of opts.initialData) {
      this.implementAction(this.insertFront.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

LinkedListSimple.prototype = new Algorithm();
LinkedListSimple.prototype.constructor = LinkedListSimple;
LinkedListSimple.superclass = Algorithm.prototype;

LinkedListSimple.prototype.init = function (am, w, h) {
  LinkedListSimple.superclass.init.call(this, am, w, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];

  this.nodeXByID = new Map();
  this.leftMostX = LINKED_LIST_START_X;

  this.hasCurrentPointer = false;
  this.currentNodeID = null;

  this.setup();
  this.initialIndex = this.nextIndex;

  this.doInsertFront = function (val) {
    this.implementAction(this.insertFront.bind(this), val);
  };
  this.doDeleteFront = function () {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function (val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function () {
    this.implementAction(this.printList.bind(this), "");
  };
  this.doClear = function () {
    this.implementAction(this.clearData.bind(this), "");
  };

  // Current-pointer mode buttons
  this.doMakeCurrentPointer = function () {
    this.implementAction(this.makeHeadPointer.bind(this), "");
  };
  this.doRemoveCurrentPointer = function () {
    this.implementAction(this.removeCurrentPointer.bind(this), "");
  };
  this.doAdvanceCurrent = function () {
    this.implementAction(this.advanceCurrent.bind(this), "");
  };
  this.doDeleteNext = function () {
    this.implementAction(this.deleteNext.bind(this), "");
  };
  this.doInsertAfterCurrent = function (val) {
    this.implementAction(this.insertAfterCurrent.bind(this), val);
  };

  this.createdNodeCount = 0;
};

LinkedListSimple.prototype.recomputeLeftMostX = function () {
  if (this.top <= 0) {
    this.leftMostX = LINKED_LIST_START_X;
    return;
  }

  let minX = Number.POSITIVE_INFINITY;
  for (let i = 0; i < this.top; i++) {
    const id = this.linkedListElemID[i];
    const x = this.nodeXByID.get(id);
    if (typeof x === "number") {
      minX = Math.min(minX, x);
    }
  }

  this.leftMostX =
    minX === Number.POSITIVE_INFINITY ? LINKED_LIST_START_X : minX;
};

LinkedListSimple.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.controls = [];

  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);

  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertFrontCallback.bind(this),
    6,
  );

  this.insertFrontButton = addControlToAlgorithmBar("Button", "Insert Front");
  this.insertFrontButton.onclick = this.insertFrontCallback.bind(this);
  this.controls.push(this.insertFrontButton);

  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);

  // Replace Find with Print (leave find logic in place for potential reuse)
  this.findButton = addControlToAlgorithmBar("Button", "Print");
  this.findButton.onclick = this.printCallback.bind(this);
  this.controls.push(this.findButton);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);

  this.makeHeadPointerButton = addControlToAlgorithmBar(
    "Button",
    "Make current pointer",
  );
  this.makeHeadPointerButton.onclick = this.makeHeadPointerCallback.bind(this);
  this.controls.push(this.makeHeadPointerButton);

  this.removeCurrentPointerButton = addControlToAlgorithmBar(
    "Button",
    "Remove current pointer",
  );
  this.removeCurrentPointerButton.onclick =
    this.removeCurrentPointerCallback.bind(this);
  this.removeCurrentPointerButton.disabled = true;
  this.controls.push(this.removeCurrentPointerButton);

  this.advanceCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Advance current",
  );
  this.advanceCurrentButton.onclick = this.advanceCurrentCallback.bind(this);
  this.advanceCurrentButton.disabled = true;
  this.controls.push(this.advanceCurrentButton);

  this.deleteNextButton = addControlToAlgorithmBar("Button", "Delete Next");
  this.deleteNextButton.onclick = this.deleteNextCallback.bind(this);
  this.deleteNextButton.disabled = true;
  this.controls.push(this.deleteNextButton);

  this.insertAfterCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Insert After Current",
  );
  this.insertAfterCurrentButton.onclick =
    this.insertAfterCurrentCallback.bind(this);
  this.insertAfterCurrentButton.disabled = true;
  this.controls.push(this.insertAfterCurrentButton);
};

LinkedListSimple.prototype.enableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }

  if (this.hasCurrentPointer) {
    if (this.insertFrontButton) this.insertFrontButton.disabled = true;
    if (this.deleteFrontButton) this.deleteFrontButton.disabled = true;
    if (this.findButton) this.findButton.disabled = true;
    if (this.clearButton) this.clearButton.disabled = true;
    if (this.makeHeadPointerButton) this.makeHeadPointerButton.disabled = true;

    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = false;
    if (this.deleteNextButton) this.deleteNextButton.disabled = false;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = false;

    if (this.inputField) this.inputField.disabled = false;
  } else {
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = true;
    if (this.deleteNextButton) this.deleteNextButton.disabled = true;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = true;
  }

  if (this.advanceCurrentButton) {
    this.advanceCurrentButton.disabled = !this.hasCurrentPointer;
  }
};

LinkedListSimple.prototype.disableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

LinkedListSimple.prototype.setup = function () {
  this.linkedListElemID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }

  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;

  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;

  this.currentID = this.nextIndex++;
  this.currentLabelID = this.nextIndex++;

  this.arrayData = new Array(SIZE);
  this.top = 0;

  this.leftoverLabelID = this.nextIndex++;

  this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TOP_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetNull", this.headID, 1);

  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y, 0);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

LinkedListSimple.prototype.reset = function () {
  this.top = 0;
  this.nextIndex = this.initialIndex;
  this.nodeXByID = new Map();
  this.leftMostX = LINKED_LIST_START_X;

  this.hasCurrentPointer = false;
  this.currentNodeID = null;
};

LinkedListSimple.prototype.makeHeadPointerCallback = function (event) {
  this.implementAction(this.makeHeadPointer.bind(this), "");
};

LinkedListSimple.prototype.removeCurrentPointerCallback = function (event) {
  this.implementAction(this.removeCurrentPointer.bind(this), "");
};

LinkedListSimple.prototype.makeHeadPointer = function (ignored) {
  this.commands = [];

  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty; no head to point at.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const headNodeID = this.linkedListElemID[this.top - 1];

  this.cmd("SetMessage", "Create current pointer at head");
  this.cmd("Step");
  if (!this.hasCurrentPointer) {
    this.cmd(
      "CreateLabel",
      this.currentLabelID,
      "Current",
      CURRENT_LABEL_X,
      CURRENT_LABEL_Y,
    );
    this.cmd(
      "CreateRectangle",
      this.currentID,
      "",
      TOP_ELEM_WIDTH,
      TOP_ELEM_HEIGHT,
      CURRENT_POS_X,
      CURRENT_POS_Y,
    );
    this.cmd("SetNull", this.currentID, 0);
    this.hasCurrentPointer = true;
  } else {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 0);
  }

  this.cmd("connect", this.currentID, headNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = headNodeID;
  this.cmd("Step");
  this.cmd("SetMessage", "");

  return this.commands;
};

LinkedListSimple.prototype.removeCurrentPointer = function (ignored) {
  this.commands = [];

  if (!this.hasCurrentPointer) {
    return this.commands;
  }

  this.cmd("SetMessage", "Remove current pointer");
  if (this.currentNodeID != null) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
  }
  this.cmd("Delete", this.currentID);
  this.cmd("Delete", this.currentLabelID);
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};

LinkedListSimple.prototype.advanceCurrentCallback = function (event) {
  this.implementAction(this.advanceCurrent.bind(this), "");
};

LinkedListSimple.prototype.deleteNextCallback = function (event) {
  this.implementAction(this.deleteNext.bind(this), "");
};

LinkedListSimple.prototype.insertAfterCurrentCallback = function (event) {
  if (!this.hasCurrentPointer) {
    return;
  }
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertAfterCurrent.bind(this), value);
};

LinkedListSimple.prototype.advanceCurrent = function (ignored) {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }

  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }

  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; advancing reaches null");
    this.cmd("Step");
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const nextNodeID = this.linkedListElemID[currentIndex - 1];
  this.cmd("SetMessage", "Advance current to next node (current = current->next)");
  this.cmd("Step");
  this.cmd("Disconnect", this.currentID, this.currentNodeID);
  this.cmd("connect", this.currentID, nextNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = nextNodeID;
  this.cmd("SetMessage", "");

  return this.commands;
};

LinkedListSimple.prototype.deleteNext = function (ignored) {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }

  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }

  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; there is no next node to delete");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const deleteIndex = currentIndex - 1;
  const deleteNodeID = this.linkedListElemID[deleteIndex];
  const hasAfterNext = deleteIndex - 1 >= 0;
  const afterNextID = hasAfterNext ? this.linkedListElemID[deleteIndex - 1] : null;

  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;

  this.cmd("SetMessage", "Delete next: identify node after current. (current->next)");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Create toDelete pointer so we can track the node being removed");
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X,
    TODELETE_LABEL_Y,
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TODELETE_POS_X,
    TODELETE_POS_Y,
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deleteNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.cmd(
    "SetMessage",
    "Update current->next to skip over the next node (toDelete still points at it)",
  );
  this.cmd("Disconnect", this.currentNodeID, deleteNodeID);
  if (hasAfterNext) {
    this.cmd("SetNull", this.currentNodeID, 0);
    this.cmd("Connect", this.currentNodeID, afterNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", this.currentNodeID, 1);
  }
  this.cmd("Step");

  this.cmd("SetMessage", "Delete the removed node (tracked by toDelete)");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");

  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);

  for (let i = deleteIndex; i < this.top - 1; i++) {
    this.arrayData[i] = this.arrayData[i + 1];
    this.linkedListElemID[i] = this.linkedListElemID[i + 1];
  }
  this.top = this.top - 1;

  this.nodeXByID.delete(deleteNodeID);
  this.recomputeLeftMostX();

  this.cmd("SetHighlight", this.currentNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};

LinkedListSimple.prototype.insertAfterCurrent = function (value) {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    this.cmd("SetMessage", "No current pointer");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  if (this.top >= SIZE) {
    this.cmd("SetMessage", "List is full");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  if (value == null || String(value).trim() === "") {
    this.cmd("SetMessage", "Enter a value to insert");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }

  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  const oldNextID = currentIndex > 0 ? this.linkedListElemID[currentIndex - 1] : null;
  const newNodeID = this.nextIndex++;

  for (let i = this.top; i > currentIndex; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }
  this.arrayData[currentIndex] = value;
  this.linkedListElemID[currentIndex] = newNodeID;
  this.top = this.top + 1;

  let spawnX = LINKED_LIST_START_X;
  let spawnY = LINKED_LIST_START_Y;
  try {
    spawnX = this.animationManager.animatedObjects.getNodeX(this.currentNodeID);
    spawnY = this.animationManager.animatedObjects.getNodeY(this.currentNodeID);
  } catch (e) {
    // Fallback to defaults if something is out of sync.
  }

  this.cmd("SetMessage", "Insert after current: create new node");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 1);
  }
  this.cmd("Step");

  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    spawnX,
    spawnY + 50,
    0.25,
    0,
    1,
    1,
  );
  this.nodeXByID.set(newNodeID, spawnX);
  this.cmd("SetNull", newNodeID, 1);
  this.cmd("SetText", newNodeID, value);
  this.cmd("Step");

  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  this.cmd(
    "CreateLabel",
    this.tempLabelID,
    "newNode",
    TEMP_LABEL_X,
    TEMP_LABEL_Y,
  );
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TEMP_POS_X,
    TEMP_POS_Y,
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("connect", this.tempID, newNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("SetMessage", "Set newNode->next to be copy of current->next");
  if (oldNextID != null) {
    this.cmd("SetNull", newNodeID, 0);
    this.cmd("Connect", newNodeID, oldNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", newNodeID, 1);
  }
  this.cmd("Step");

  this.cmd("SetMessage", "Update current->next to new node");
  if (oldNextID != null) {
    this.cmd("Disconnect", this.currentNodeID, oldNextID);
  }
  this.cmd("SetNull", this.currentNodeID, 0);
  this.cmd("Connect", this.currentNodeID, newNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.recomputeLeftMostX();

  this.cmd("Disconnect", this.tempID, newNodeID);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);

  this.cmd("SetHighlight", this.currentNodeID, 0);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 0);
  }
  this.cmd("SetMessage", "");

  return this.commands;
};

LinkedListSimple.prototype.insertFrontCallback = function (event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top < SIZE && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertFront.bind(this), value);
  }
};

LinkedListSimple.prototype.deleteFrontCallback = function (event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top > 0) {
    this.implementAction(this.deleteFront.bind(this), "");
  }
};

LinkedListSimple.prototype.findCallback = function (event) {
  if (this.hasCurrentPointer) {
    return;
  }
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

LinkedListSimple.prototype.printCallback = function (event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.printList.bind(this), "");
};

LinkedListSimple.prototype.clearCallback = function (event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.clearData.bind(this), "");
};

// Insert at head
LinkedListSimple.prototype.insertFront = function (value) {
  this.commands = [];

  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;

  this.arrayData[this.top] = value;
  this.linkedListElemID[this.top] = this.nextIndex++;

  this.cmd("SetMessage", "insertStart(" + value + ")");
  this.cmd("Step");

  const insertX =
    this.top === 0
      ? (typeof this._initialFirstNodeX === "number"
          ? this._initialFirstNodeX
          : LINKED_LIST_START_X)
      : this.leftMostX - LINKED_LIST_ELEM_SPACING;
  if (this.top === 0) {
    this._initialFirstNodeX = undefined;
  }

  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[this.top],
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    insertX,
    LINKED_LIST_START_Y +
      ((this.createdNodeCount - 1) % 2) * 15 +
      Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_LINE_SPACING,
    0.25,
    0,
    1,
    1,
  );

  this.nodeXByID.set(this.linkedListElemID[this.top], insertX);
  this.leftMostX = insertX;

  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[this.top], 1);
  this.cmd("SetText", this.linkedListElemID[this.top], value);
  this.cmd("Step");

  this.cmd("SetMessage", "Temporary newNode pointer gets address of new node");
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X, TEMP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TEMP_POS_X,
    TEMP_POS_Y,
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd(
    "connect",
    this.tempID,
    this.linkedListElemID[this.top],
    "#000000",
    0.1,
  );
  this.cmd("Step");

  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1,
    );
    this.cmd("SetMessage", "List was empty; head points to this node.");
  } else {
    const oldHeadIndex = this.top - 1;

    this.cmd("SetMessage", "Set newNode->next to old head.");
    this.cmd("SetNull", this.linkedListElemID[this.top], 0);
    this.cmd(
      "Connect",
      this.linkedListElemID[this.top],
      this.linkedListElemID[oldHeadIndex],
      "#000000",
      0.1,
    );
    this.cmd("Step");

    this.cmd("SetMessage", "Update head pointer to new node.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[oldHeadIndex]);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1,
    );
  }

  this.cmd("Step");

  this.cmd("Disconnect", this.tempID, this.linkedListElemID[this.top]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.top = this.top + 1;
  this.cmd("SetMessage", "");
  this.cmd("Step");

  return this.commands;
};

// Delete from head
// If called from Clear, pass a truthy 2nd arg so we append into the existing command list.
LinkedListSimple.prototype.deleteFront = function (ignored, inClear) {
  if (!inClear) {
    this.commands = [];
  }

  const deletedID = this.linkedListElemID[this.top - 1];
  const newHeadID = this.top > 1 ? this.linkedListElemID[this.top - 2] : null;

  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;

  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Deleting front (head) node");
  this.cmd("Step");

  this.cmd(
    "CreateLabel",
    labPopID,
    "Deleted Value: ",
    ACTION_LABEL_X + 20,
    ACTION_LABEL_Y,
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X,
    LINKED_LIST_START_Y,
  );

  this.cmd("Move", labPopValID, ACTION_ELEMENT_X + 20, ACTION_ELEMENT_Y);
  this.cmd("Step");

  this.cmd(
    "SetMessage",
    "Create toDelete pointer to track the node being removed",
  );
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X,
    TODELETE_LABEL_Y,
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TODELETE_POS_X,
    TODELETE_POS_Y,
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deletedID, "#000000", 0.1);
  this.cmd("Step");

  if (this.top == 1) {
    this.cmd("SetMessage", "That was the last node; head becomes null.");
    this.cmd("Step");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "Advance head to the next node.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd(
      "Connect",
      this.headID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1,
    );
  }

  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.cmd("Step");

  this.cmd("Disconnect", toDeleteID, deletedID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);

  this.nodeXByID.delete(deletedID);

  if (this.hasCurrentPointer && this.currentNodeID === deletedID) {
    this.cmd("Disconnect", this.currentID, deletedID);
    if (newHeadID != null) {
      this.cmd("connect", this.currentID, newHeadID, "#000000", 0.1, true, "", 2);
      this.currentNodeID = newHeadID;
    } else {
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
  }

  this.top = this.top - 1;
  this.recomputeLeftMostX();
  if (this.top === 0) {
    this.cmd("SetNull", this.headID, 1);
  }
  this.cmd("Step");

  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);

  this.cmd("SetMessage", "Deleted Value: " + this.arrayData[this.top]);
  this.cmd("Step");

  return this.commands;
};

LinkedListSimple.prototype.findElement = function (valueToFind) {
  this.commands = [];

  if (this.top == 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    return this.commands;
  }

  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");

  // Show a temporary "Current" pointer that walks the list during search.
  const searchCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const searchCurrentLabelID = this.hasCurrentPointer
    ? this.nextIndex++
    : this.currentLabelID;

  this.cmd(
    "CreateLabel",
    searchCurrentLabelID,
    "Current",
    CURRENT_LABEL_X,
    CURRENT_LABEL_Y,
  );
  this.cmd(
    "CreateRectangle",
    searchCurrentID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    CURRENT_POS_X,
    CURRENT_POS_Y,
  );
  this.cmd("SetNull", searchCurrentID, 0);
  this.cmd(
    "connect",
    searchCurrentID,
    this.linkedListElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2,
  );
  this.cmd("Step");

  for (let i = this.top - 1; i >= 0; i--) {
    this.cmd("SetHighlight", this.linkedListElemID[i], 1);
    this.cmd("Step");

    if (String(this.arrayData[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", this.linkedListElemID[i], 0);
      this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[i]);
      this.cmd("Delete", searchCurrentID);
      this.cmd("Delete", searchCurrentLabelID);
      return this.commands;
    }

    this.cmd("SetHighlight", this.linkedListElemID[i], 0);

    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)",
      );
      this.cmd("Step");
      this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[i]);
      this.cmd(
        "connect",
        searchCurrentID,
        this.linkedListElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2,
      );
      this.cmd("Step");
    }
  }

  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[0]);
  this.cmd("Delete", searchCurrentID);
  this.cmd("Delete", searchCurrentLabelID);
  return this.commands;
};

LinkedListSimple.prototype.printList = function (ignored) {
  this.commands = [];
  this.printOutput = "";

  if (this.top === 0) {
    this.cmd("SetMessage", "Printing list: <empty list>\nCurrent output: ");
    this.cmd("Step");
    this.cmd("SetMessage", "Final output: " + this.printOutput);
    this.cmd("Step");
    return this.commands;
  }

  this.cmd("SetMessage", "Printing list from head...");
  this.cmd("Step");

  // Temporary "Current" pointer that walks the list during print.
  const printCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const printCurrentLabelID = this.hasCurrentPointer
    ? this.nextIndex++
    : this.currentLabelID;

  this.cmd(
    "CreateLabel",
    printCurrentLabelID,
    "Current",
    CURRENT_LABEL_X,
    CURRENT_LABEL_Y,
  );
  this.cmd(
    "CreateRectangle",
    printCurrentID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    CURRENT_POS_X,
    CURRENT_POS_Y,
  );
  this.cmd("SetNull", printCurrentID, 0);

  this.cmd(
    "connect",
    printCurrentID,
    this.linkedListElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2,
  );
  this.cmd("Step");

  for (let i = this.top - 1; i >= 0; i--) {
    const nodeID = this.linkedListElemID[i];
    const nodeValue = this.arrayData[i];

    this.cmd("SetHighlight", nodeID, 1);

    if (this.printOutput.length > 0) {
      this.printOutput += ", ";
    }
    this.printOutput += nodeValue;
    this.cmd(
      "SetMessage",
      "Print " + nodeValue + "\nCurrent output: " + this.printOutput,
    );
    this.cmd("Step");
    this.cmd("SetHighlight", nodeID, 0);

    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)\nCurrent output: " +
          this.printOutput,
      );
      this.cmd("Step");
      this.cmd("Disconnect", printCurrentID, nodeID);
      this.cmd(
        "connect",
        printCurrentID,
        this.linkedListElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2,
      );
      this.cmd("Step");
    }
  }

  this.cmd(
    "SetMessage",
    "Advancing to next node. (current = current->next)\nCurrent output: " +
      this.printOutput,
  );
  this.cmd("Step");
  this.cmd("Disconnect", printCurrentID, this.linkedListElemID[0]);
  this.cmd("SetNull", printCurrentID, 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Final output: " + this.printOutput);
  this.cmd("Step");
  this.cmd("Delete", printCurrentID);
  this.cmd("Delete", printCurrentLabelID);
  return this.commands;
};

LinkedListSimple.prototype.clearData = function () {
  this.commands = [];

  if (this.top == 0) {
    this.cmd("SetMessage", "");
    if (this.hasCurrentPointer) {
      this.cmd("Disconnect", this.currentID, this.currentNodeID);
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
    this.cmd("SetNull", this.tempID, 1);
    this.cmd("SetAlpha", this.tempID, 0);
    this.cmd("SetAlpha", this.tempLabelID, 0);
    return this.commands;
  }

  this.cmd("SetMessage", "Clearing list...");
  this.cmd("Step");

  // Reuse Delete Front logic so Clear also animates the toDelete pointer.
  while (this.top > 0) {
    this.deleteFront("", true);
  }

  // Safety: ensure the head pointer visibly shows null when the list is empty.
  this.cmd("SetNull", this.headID, 1);

  this.cmd("SetNull", this.tempID, 1);
  this.cmd("SetAlpha", this.tempID, 0);
  this.cmd("SetAlpha", this.tempLabelID, 0);

  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.nodeXByID = new Map();
  this.leftMostX = LINKED_LIST_START_X;

  if (this.hasCurrentPointer) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  return this.commands;
};
