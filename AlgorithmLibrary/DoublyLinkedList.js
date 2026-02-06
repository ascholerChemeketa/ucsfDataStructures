// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
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

var LINKED_LIST_START_X = 100;
var LINKED_LIST_START_Y = 150;
var LINKED_LIST_ELEM_WIDTH = 70;
var LINKED_LIST_ELEM_HEIGHT = 25;

var LINKED_LIST_ELEMS_PER_LINE = 10;
var LINKED_LIST_ELEM_SPACING = 80;

var TOP_POS_X = 150;
var TOP_POS_Y = 50;
var TOP_LABEL_X = TOP_POS_X;
var TOP_LABEL_Y = 25;

var TOP_ELEM_WIDTH = 40;
var TOP_ELEM_HEIGHT = 25;

var SIZE_POS_X = TOP_POS_X - TOP_ELEM_WIDTH * 2;
var SIZE_LABEL_X = SIZE_POS_X;
var HEAD_PTR_POS_X = TOP_POS_X;
var HEAD_PTR_LABEL_X = HEAD_PTR_POS_X;

var TAIL_PTR_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 2;
var TAIL_PTR_LABEL_X = TAIL_PTR_POS_X;

var TEMP_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 4;
var TEMP_LABEL_X = TEMP_POS_X;
var TEMP_POS_Y = LINKED_LIST_START_Y + 100;
var TEMP_LABEL_Y = TEMP_POS_Y - 25;

var CURRENT_POS_X = TOP_POS_X;
var CURRENT_LABEL_X = CURRENT_POS_X;
var CURRENT_POS_Y = TEMP_POS_Y;
var CURRENT_LABEL_Y = CURRENT_POS_Y - 25;

var ACTION_LABEL_X = TAIL_PTR_POS_X + TOP_ELEM_WIDTH * 3;
var ACTION_LABEL_Y = 25;
var ACTION_ELEMENT_X = ACTION_LABEL_X;
var ACTION_ELEMENT_Y = 50;

var SIZE = 32;

const LINK_INDEX_NEXT = 0;
const LINK_INDEX_PREV = 1;
const NUM_LINKS_DOUBLY = 2;

export function DoublyLinkedList(opts = {}) {
  if (!opts.title) opts.title = "Doubly Linked List (Dummy Head/Tail)";
  opts.heightSingleMode = 260;
  opts.height = 320;
  opts.heightMobile = 470;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertBack.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

DoublyLinkedList.prototype = new Algorithm();
DoublyLinkedList.prototype.constructor = DoublyLinkedList;
DoublyLinkedList.superclass = Algorithm.prototype;

DoublyLinkedList.prototype.init = function (am, w, h) {
  DoublyLinkedList.superclass.init.call(this, am, w, h);
  this.addControls();

  this.nextIndex = 0;
  this.commands = [];

  this.nodeIDs = [];
  this.values = [];

  this.hasCurrentPointer = false;
  this.currentNodeID = null;

  this.setup();
  this.initialIndex = this.nextIndex;

  this.doInsertBack = function (val) {
    this.implementAction(this.insertBack.bind(this), val);
  };
  this.doInsertFront = function (val) {
    this.implementAction(this.insertFront.bind(this), val);
  };
  this.doDeleteFront = function () {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function (val) {
    this.implementAction(this.findElement.bind(this), val);
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
  this.doDeleteCurrent = function () {
    this.implementAction(this.deleteCurrent.bind(this), "");
  };
  this.doInsertAfterCurrent = function (val) {
    this.implementAction(this.insertAfterCurrent.bind(this), val);
  };
};

DoublyLinkedList.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.controls = [];

  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);

  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6,
  );

  this.insertButton = addControlToAlgorithmBar("Button", "Insert Back");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.controls.push(this.insertButton);

  this.insertFrontButton = addControlToAlgorithmBar("Button", "Insert Front");
  this.insertFrontButton.onclick = this.insertFrontCallback.bind(this);
  this.controls.push(this.insertFrontButton);

  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.controls.push(this.findButton);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);

  addSeparatorToAlgorithmBar();

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

  this.advanceCurrentButton = addControlToAlgorithmBar("Button", "Advance current");
  this.advanceCurrentButton.onclick = this.advanceCurrentCallback.bind(this);
  this.advanceCurrentButton.disabled = true;
  this.controls.push(this.advanceCurrentButton);

  this.deleteNextButton = addControlToAlgorithmBar("Button", "Delete Current");
  this.deleteNextButton.onclick = this.deleteCurrentCallback.bind(this);
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

DoublyLinkedList.prototype.enableUI = function () {
  for (let i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }

  if (this.hasCurrentPointer) {
    // Lock down everything except current-mode actions + input.
    if (this.insertButton) this.insertButton.disabled = true;
    if (this.insertFrontButton) this.insertFrontButton.disabled = true;
    if (this.deleteFrontButton) this.deleteFrontButton.disabled = true;
    if (this.findButton) this.findButton.disabled = true;
    if (this.clearButton) this.clearButton.disabled = true;

    if (this.makeHeadPointerButton) this.makeHeadPointerButton.disabled = true;

    if (this.advanceCurrentButton) this.advanceCurrentButton.disabled = false;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = false;
    if (this.deleteNextButton) this.deleteNextButton.disabled = false;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = false;
  } else {
    if (this.advanceCurrentButton) this.advanceCurrentButton.disabled = true;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = true;
    if (this.deleteNextButton) this.deleteNextButton.disabled = true;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = true;
  }
};

DoublyLinkedList.prototype.disableUI = function () {
  for (let i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

DoublyLinkedList.prototype.setup = function () {
  this.commands = [];

  this.sizeID = this.nextIndex++;
  this.sizeLabelID = this.nextIndex++;

  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;

  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;

  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;

  this.currentID = this.nextIndex++;
  this.currentLabelID = this.nextIndex++;

  this.leftoverLabelID = this.nextIndex++;

  this.dummyHeadID = this.nextIndex++;
  this.dummyTailID = this.nextIndex++;
  this.cmd("CreateLabel", this.sizeLabelID, "Size", SIZE_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.sizeID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    SIZE_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetText", this.sizeID, "0");

  this.cmd("CreateLabel", this.headLabelID, "Head", HEAD_PTR_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    HEAD_PTR_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetNull", this.headID, 0);

  this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_PTR_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TAIL_PTR_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetNull", this.tailID, 0);

  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y, 0);

  // Dummy nodes (always present)
  this.cmd(
    "CreateLinkedList",
    this.dummyHeadID,
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    LINKED_LIST_START_X,
    LINKED_LIST_START_Y,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY,
  );
  this.cmd("SetText", this.dummyHeadID, "H");

  this.cmd(
    "CreateLinkedList",
    this.dummyTailID,
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING,
    LINKED_LIST_START_Y + 15,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY,
  );
  this.cmd("SetText", this.dummyTailID, "T");

  // Dummy head.prev is null. Dummy tail.next is null.
  this.cmd("SetNull", this.dummyHeadID, 1, LINK_INDEX_PREV);
  this.cmd("SetNull", this.dummyTailID, 1, LINK_INDEX_NEXT);

  // Initial empty list: H.next -> T, T.prev -> H
  this.cmd("SetNull", this.dummyHeadID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", this.dummyTailID, 0, LINK_INDEX_PREV);
  this.cmd("Connect", this.dummyHeadID, this.dummyTailID, "#000000", 0.1);
  this.cmd(
    "Connect",
    this.dummyTailID,
    this.dummyHeadID,
    "#000000",
    0.1,
    true,
    "",
    1,
  );

  // Head/Tail pointer boxes point at dummy nodes
  this.cmd("Connect", this.headID, this.dummyHeadID, "#000000", 0.1);
  this.cmd("Connect", this.tailID, this.dummyTailID, "#000000", -0.1, true);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

DoublyLinkedList.prototype.resetPositions = function () {
  const all = [this.dummyHeadID, ...this.nodeIDs, this.dummyTailID];
  for (let i = 0; i < all.length; i++) {
    const x = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * i;
    const y = LINKED_LIST_START_Y + (i % 2) * 15;
    this.cmd("Move", all[i], x, y);
  }
};

DoublyLinkedList.prototype.insertCallback = function () {
  if (this.hasCurrentPointer) return;
  if (this.nodeIDs.length >= SIZE) return;
  if (this.inputField.value === "") return;
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertBack.bind(this), value);
};

DoublyLinkedList.prototype.insertFrontCallback = function () {
  if (this.hasCurrentPointer) return;
  if (this.nodeIDs.length >= SIZE) return;
  if (this.inputField.value === "") return;
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertFront.bind(this), value);
};

DoublyLinkedList.prototype.deleteFrontCallback = function () {
  if (this.hasCurrentPointer) return;
  this.implementAction(this.deleteFront.bind(this), "");
};

DoublyLinkedList.prototype.findCallback = function () {
  if (this.hasCurrentPointer) return;
  const findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue !== "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

DoublyLinkedList.prototype.clearCallback = function () {
  if (this.hasCurrentPointer) return;
  this.implementAction(this.clearData.bind(this), "");
};

DoublyLinkedList.prototype.makeHeadPointerCallback = function () {
  this.implementAction(this.makeHeadPointer.bind(this), "");
};

DoublyLinkedList.prototype.removeCurrentPointerCallback = function () {
  this.implementAction(this.removeCurrentPointer.bind(this), "");
};

DoublyLinkedList.prototype.advanceCurrentCallback = function () {
  this.implementAction(this.advanceCurrent.bind(this), "");
};

DoublyLinkedList.prototype.deleteCurrentCallback = function () {
  this.implementAction(this.deleteCurrent.bind(this), "");
};

DoublyLinkedList.prototype.insertAfterCurrentCallback = function () {
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertAfterCurrent.bind(this), value);
};

DoublyLinkedList.prototype.makeHeadPointer = function () {
  this.commands = [];

  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "List is empty; no node to point at.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const headNodeID = this.nodeIDs[0];

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

  this.cmd("Connect", this.currentID, headNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = headNodeID;
  this.cmd("Step");
  this.cmd("SetMessage", "");

  return this.commands;
};

DoublyLinkedList.prototype.removeCurrentPointer = function () {
  this.commands = [];
  if (!this.hasCurrentPointer) return this.commands;

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

DoublyLinkedList.prototype.advanceCurrent = function () {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }

  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  const next = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;

  if (next === this.dummyTailID) {
    this.cmd("SetMessage", "Current is at last node; advancing reaches dummy tail");
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

  this.cmd("SetMessage", "Advance current to next node (current = current->next)");
  this.cmd("Step");
  this.cmd("Disconnect", this.currentID, this.currentNodeID);
  this.cmd("Connect", this.currentID, next, "#000000", 0.1, true, "", 2);
  this.currentNodeID = next;
  this.cmd("SetMessage", "");

  return this.commands;
};

DoublyLinkedList.prototype.createTempPointer = function (label, x, y, targetID) {
  const ptrID = this.nextIndex++;
  const ptrLabelID = this.nextIndex++;

  this.cmd("CreateLabel", ptrLabelID, label, x, y - 25);
  this.cmd("CreateRectangle", ptrID, "", TOP_ELEM_WIDTH, TOP_ELEM_HEIGHT, x, y);
  this.cmd("SetNull", ptrID, 0);
  this.cmd("Connect", ptrID, targetID, "#000000", 0.1);

  return { ptrID, ptrLabelID };
};

DoublyLinkedList.prototype.insertBack = function (value) {
  this.commands = [];

  const newNodeID = this.nextIndex++;
  const oldLast = this.nodeIDs.length > 0 ? this.nodeIDs[this.nodeIDs.length - 1] : this.dummyHeadID;

  let tailX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * (this.nodeIDs.length + 1);
  let tailY = LINKED_LIST_START_Y + ((this.nodeIDs.length + 1) % 2) * 15;
  try {
    tailX = this.animationManager.animatedObjects.getNodeX(this.dummyTailID);
    tailY = this.animationManager.animatedObjects.getNodeY(this.dummyTailID);
  } catch (e) {}

  this.cmd("SetMessage", "Insert at tail: " + value);
  this.cmd("Step");

  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    tailX,
    tailY + 50,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY,
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
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
  this.cmd("Connect", this.tempID, newNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("SetMessage", "Set newNode->prev and newNode->next");
  this.cmd("Connect", newNodeID, this.dummyTailID, "#000000", 0.1);
  this.cmd("Connect", newNodeID, oldLast, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Update oldLast.next and dummyTail.prev");
  this.cmd("Disconnect", oldLast, this.dummyTailID);
  this.cmd("Connect", oldLast, newNodeID, "#000000", 0.1);

  this.cmd("Disconnect", this.dummyTailID, oldLast);
  this.cmd("Connect", this.dummyTailID, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("Disconnect", this.tempID, newNodeID);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);

  this.nodeIDs.push(newNodeID);
  this.values.push(value);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes. (Just for clarity, not part of algorithm)");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("SetMessage", "");
  return this.commands;
};

DoublyLinkedList.prototype.insertFront = function (value) {
  this.commands = [];

  const newNodeID = this.nextIndex++;
  const oldFirst = this.nodeIDs.length > 0 ? this.nodeIDs[0] : this.dummyTailID;

  let headX = LINKED_LIST_START_X;
  let headY = LINKED_LIST_START_Y;
  try {
    headX = this.animationManager.animatedObjects.getNodeX(this.dummyHeadID);
    headY = this.animationManager.animatedObjects.getNodeY(this.dummyHeadID);
  } catch (e) {}

  this.cmd("SetMessage", "insertStart(" + value + ")");
  this.cmd("Step");

  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    headX,
    headY + 50,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY,
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
  this.cmd("Step");

  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  const { ptrID: newPtrID, ptrLabelID: newPtrLabelID } = this.createTempPointer(
    "newNode",
    TEMP_POS_X + TOP_ELEM_WIDTH * 2,
    TEMP_POS_Y,
    newNodeID,
  );
  this.cmd("Step");

  this.cmd("SetMessage", "Set newNode->prev and newNode->next");
  this.cmd("Connect", newNodeID, oldFirst, "#000000", 0.1);
  this.cmd("Connect", newNodeID, this.dummyHeadID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Update dummyHead.next and oldFirst.prev");
  this.cmd("Disconnect", this.dummyHeadID, oldFirst);
  this.cmd("Connect", this.dummyHeadID, newNodeID, "#000000", 0.1);

  this.cmd("Disconnect", oldFirst, this.dummyHeadID);
  this.cmd("Connect", oldFirst, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.nodeIDs.unshift(newNodeID);
  this.values.unshift(value);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("Disconnect", newPtrID, newNodeID);
  this.cmd("SetNull", newPtrID, 1);
  this.cmd("Delete", newPtrID);
  this.cmd("Delete", newPtrLabelID);

  this.cmd("SetMessage", "");
  return this.commands;
};

DoublyLinkedList.prototype.deleteFront = function () {
  this.commands = [];

  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "List is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const deleteNodeID = this.nodeIDs[0];
  const after = this.nodeIDs.length > 1 ? this.nodeIDs[1] : this.dummyTailID;

  this.cmd("SetMessage", "Delete front: bypass first node");
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");

  this.cmd("Disconnect", this.dummyHeadID, deleteNodeID);
  this.cmd("Connect", this.dummyHeadID, after, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("Disconnect", after, deleteNodeID);
  this.cmd("Connect", after, this.dummyHeadID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");

  this.nodeIDs.shift();
  this.values.shift();
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("SetMessage", "");
  return this.commands;
};

DoublyLinkedList.prototype.deleteNext = function () {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }

  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  if (idx + 1 >= this.nodeIDs.length) {
    this.cmd("SetMessage", "Current has no next node (next is dummy tail)");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  const deleteNodeID = this.nodeIDs[idx + 1];
  const after = idx + 2 < this.nodeIDs.length ? this.nodeIDs[idx + 2] : this.dummyTailID;

  this.cmd("SetMessage", "Delete next: identify node after current. (current->next)");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");

  const { ptrID: toDeleteID, ptrLabelID: toDeleteLabelID } =
    this.createTempPointer("toDelete", TEMP_POS_X + TOP_ELEM_WIDTH * 2, TEMP_POS_Y, deleteNodeID);
  this.cmd("Step");

  this.cmd(
    "SetMessage",
    "Update current->next to skip over next node (toDelete still points at it)",
  );
  this.cmd("Disconnect", this.currentNodeID, deleteNodeID);
  this.cmd("Connect", this.currentNodeID, after, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("SetMessage", "Update after.prev to point back to current");
  this.cmd("Disconnect", after, deleteNodeID);
  this.cmd("Connect", after, this.currentNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Delete the removed node");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");

  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);

  this.nodeIDs.splice(idx + 1, 1);
  this.values.splice(idx + 1, 1);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("SetHighlight", this.currentNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};

// Delete the node that Current points to
DoublyLinkedList.prototype.deleteCurrent = function () {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }

  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  const deleteNodeID = this.currentNodeID;
  const prevNodeID = idx - 1 >= 0 ? this.nodeIDs[idx - 1] : this.dummyHeadID;
  const nextNodeID = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;

  this.cmd("SetMessage", "Delete current: identify node to remove");
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");

  const { ptrID: toDeleteID, ptrLabelID: toDeleteLabelID } = this.createTempPointer(
    "toDelete",
    TEMP_POS_X + TOP_ELEM_WIDTH * 2,
    TEMP_POS_Y,
    deleteNodeID,
  );
  this.cmd("Step");

  this.cmd("SetMessage", "Update prev->next to skip current");
  this.cmd("Disconnect", prevNodeID, deleteNodeID);
  this.cmd("Connect", prevNodeID, nextNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("SetMessage", "Update next->prev to skip current");
  this.cmd("Disconnect", nextNodeID, deleteNodeID);
  this.cmd("Connect", nextNodeID, prevNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Move Current pointer off the deleted node");
  this.cmd("Disconnect", this.currentID, deleteNodeID);

  // Pick a new current node: prefer next real node; else previous; else end current mode.
  let newCurrentNodeID = null;
  if (nextNodeID !== this.dummyTailID) {
    newCurrentNodeID = nextNodeID;
  } else if (prevNodeID !== this.dummyHeadID) {
    newCurrentNodeID = prevNodeID;
  }

  if (newCurrentNodeID != null) {
    this.cmd("Connect", this.currentID, newCurrentNodeID, "#000000", 0.1, true, "", 2);
    this.currentNodeID = newCurrentNodeID;
  } else {
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  this.cmd("Step");

  this.cmd("SetMessage", "Delete the removed node (tracked by toDelete)");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");

  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);

  this.nodeIDs.splice(idx, 1);
  this.values.splice(idx, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("SetHighlight", deleteNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};

DoublyLinkedList.prototype.insertAfterCurrent = function (value) {
  this.commands = [];

  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    this.cmd("SetMessage", "No current pointer");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  if (this.nodeIDs.length >= SIZE) {
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

  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }

  const oldNext = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;
  const newNodeID = this.nextIndex++;

  let spawnX = LINKED_LIST_START_X;
  let spawnY = LINKED_LIST_START_Y;
  try {
    spawnX = this.animationManager.animatedObjects.getNodeX(this.currentNodeID);
    spawnY = this.animationManager.animatedObjects.getNodeY(this.currentNodeID);
  } catch (e) {}

  this.cmd("SetMessage", "Insert after current: create new node");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  if (oldNext !== this.dummyTailID) this.cmd("SetHighlight", oldNext, 1);
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
    NUM_LINKS_DOUBLY,
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
  this.cmd("Step");

  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  const { ptrID: newPtrID, ptrLabelID: newPtrLabelID } = this.createTempPointer(
    "newNode",
    TEMP_POS_X + TOP_ELEM_WIDTH * 2,
    TEMP_POS_Y,
    newNodeID,
  );
  this.cmd("Step");

  this.cmd("SetMessage", "Set newNode->next to current->next");
  this.cmd("Connect", newNodeID, oldNext, "#000000", 0.1);
  this.cmd("Step");

  this.cmd("SetMessage", "Set newNode->prev to current");
  this.cmd("Connect", newNodeID, this.currentNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  
  this.cmd("SetMessage", "Update newNode->next->prev to newNode");
  this.cmd("Disconnect", oldNext, this.currentNodeID);
  this.cmd("Connect", oldNext, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");

  this.cmd("SetMessage", "Update current->next to new node");
  this.cmd("Disconnect", this.currentNodeID, oldNext);
  this.cmd("Connect", this.currentNodeID, newNodeID, "#000000", 0.1);
  this.cmd("Step");

  this.nodeIDs.splice(idx + 1, 0, newNodeID);
  this.values.splice(idx + 1, 0, value);
  this.cmd("Step");
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");

  this.cmd("SetMessage", "Position nodes (just for clarity, not part of algorithm)");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("Disconnect", newPtrID, newNodeID);
  this.cmd("SetNull", newPtrID, 1);
  this.cmd("Delete", newPtrID);
  this.cmd("Delete", newPtrLabelID);

  this.cmd("SetHighlight", this.currentNodeID, 0);
  if (oldNext !== this.dummyTailID) this.cmd("SetHighlight", oldNext, 0);
  this.cmd("SetMessage", "");

  return this.commands;
};

DoublyLinkedList.prototype.findElement = function (valueToFind) {
  this.commands = [];

  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }

  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");

  for (let i = 0; i < this.nodeIDs.length; i++) {
    const id = this.nodeIDs[i];
    this.cmd("SetHighlight", id, 1);
    this.cmd("Step");

    if (String(this.values[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", id, 0);
      this.cmd("SetMessage", "");
      return this.commands;
    }

    this.cmd("SetHighlight", id, 0);
  }

  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};

DoublyLinkedList.prototype.clearData = function () {
  this.commands = [];

  this.cmd("SetMessage", "Clear list");
  this.cmd("Step");

  // Remove current pointer if it exists
  if (this.hasCurrentPointer) {
    if (this.currentNodeID != null) {
      this.cmd("Disconnect", this.currentID, this.currentNodeID);
    }
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }

  for (let i = 0; i < this.nodeIDs.length; i++) {
    this.cmd("Delete", this.nodeIDs[i]);
  }
  this.nodeIDs = [];
  this.values = [];
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, "0");
  this.cmd("Step");

  // Restore empty-dummy connections
  this.cmd("Disconnect", this.dummyHeadID, this.dummyTailID);
  this.cmd("Disconnect", this.dummyTailID, this.dummyHeadID);
  this.cmd("Connect", this.dummyHeadID, this.dummyTailID, "#000000", 0.1);
  this.cmd(
    "Connect",
    this.dummyTailID,
    this.dummyHeadID,
    "#000000",
    -0.1,
    true,
    "",
    1,
  );

  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");

  this.cmd("SetMessage", "");
  return this.commands;
};
