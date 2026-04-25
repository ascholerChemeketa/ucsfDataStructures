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

// Reuses QueueLL's visualization logic (linked list node objects + head/tail pointers).

var LINKED_LIST_START_X = 100;
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

var TAIL_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 2;
var TAIL_LABEL_X = TAIL_POS_X;

var TEMP_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 4;
var TEMP_LABEL_X = TEMP_POS_X;
var TEMP_POS_Y = LINKED_LIST_START_Y + 100;
var TEMP_LABEL_Y = TEMP_POS_Y - 25;

var ACTION_LABEL_X = TAIL_POS_X + TOP_ELEM_WIDTH * 3;
var ACTION_LABEL_Y = 25;
var ACTION_ELEMENT_X = ACTION_LABEL_X;
var ACTION_ELEMENT_Y = 50;

var SIZE = 32;

export function LinkedList(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Singly Linked List";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;

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

LinkedList.prototype = new Algorithm();
LinkedList.prototype.constructor = LinkedList;
LinkedList.superclass = Algorithm.prototype;

LinkedList.prototype.init = function (am, w, h) {
  LinkedList.superclass.init.call(this, am, w, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];

  this.tail_pos_y = h / 2 - LINKED_LIST_ELEM_HEIGHT;
  this.tail_label_y = this.tail_pos_y;

  this.setup();
  this.initialIndex = this.nextIndex;

  this.doInsertBack = function (val) {
    this.implementAction(this.insertBack.bind(this), val);
  };
  this.doDeleteFront = function () {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function (val) {
    this.implementAction(this.findElement.bind(this), val);
  };

  this.createdNodeCount = 0;
};

LinkedList.prototype.beginLinkedListAnimation = function (
  operation,
  label,
  meta = {},
) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "LinkedList", operation, ...meta });
};

LinkedList.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "LinkedList",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

LinkedList.prototype.finishLinkedListAnimation = function () {
  return this.finishAnimation();
};

LinkedList.prototype.addControls = function () {
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

  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.controls.push(this.findButton);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
};

LinkedList.prototype.enableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
LinkedList.prototype.disableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

LinkedList.prototype.setup = function () {
  this.linkedListElemID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }

  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;

  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;

  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;

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

  this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TAIL_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetNull", this.tailID, 1);

  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y, 0);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

LinkedList.prototype.reset = function () {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};

LinkedList.prototype.insertCallback = function (event) {
  if (this.top < SIZE && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertBack.bind(this), value);
  }
};

LinkedList.prototype.deleteFrontCallback = function (event) {
  if (this.top > 0) {
    this.implementAction(this.deleteFront.bind(this), "");
  }
};

LinkedList.prototype.findCallback = function (event) {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

LinkedList.prototype.clearCallback = function (event) {
  this.implementAction(this.clearData.bind(this), "");
};

// Insert at tail (like QueueLL enqueue)
LinkedList.prototype.insertBack = function (value) {
  this.beginLinkedListAnimation("insertBack", `insert back ${value}`, {
    tags: ["insert", "tail"],
  });

  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;

  // Internal storage uses index 0 as tail, index (top-1) as head, matching QueueLL.
  for (var i = this.top; i > 0; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }

  this.arrayData[0] = value;
  this.linkedListElemID[0] = this.nextIndex++;

  this.cmd("SetMessage", "Insert at tail: " + value);
  this.markAnimationStep(`allocate tail node ${value}`, { tags: ["insert", "allocate"] });

  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[0],
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    LINKED_LIST_START_X +
      LINKED_LIST_ELEM_SPACING * ((this.createdNodeCount - 1) % LINKED_LIST_ELEMS_PER_LINE),
    LINKED_LIST_START_Y +
      ((this.createdNodeCount - 1) % 2) * 15 +
      Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_LINE_SPACING,
    0.25,
    0,
    1,
    1,
  );

  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[0], 1);
  this.cmd("SetText", this.linkedListElemID[0], value);
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
  this.cmd("connect", this.tempID, this.linkedListElemID[0], "#000000", 0.1);
  this.markAnimationStep("track new tail node", {
    focusNodeId: this.linkedListElemID[0],
    tags: ["insert", "track"],
  });

  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1,
    );
    this.cmd("SetMessage", "List was empty; head and tail point to this node.");
    this.markAnimationStep("initialize head and tail", { tags: ["insert", "empty"] });
  } else {
    this.cmd("SetNull", this.linkedListElemID[1], 0);
    this.cmd(
      "Connect",
      this.linkedListElemID[1],
      this.linkedListElemID[0],
      "#000000",
      0.1,
    );
    this.cmd("SetMessage", "Set old tail->next to new node.");
    this.markAnimationStep("link old tail to new tail", { tags: ["insert", "link"] });
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
    this.cmd("SetMessage", "Update tail pointer to new node.");
  }

  this.cmd(
    "connect",
    this.tailID,
    this.linkedListElemID[0],
    "#000000",
    -0.1,
    true,
    "",
    1,
  );

  this.cmd("Disconnect", this.tempID, this.linkedListElemID[0]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.markAnimationStep("update tail pointer", { tags: ["insert", "tail-pointer"] });
  this.top = this.top + 1;
  this.beginBlock("insert complete", {
    source: "LinkedList",
    operation: this.currentAnimationOperation,
    tags: ["insert", "complete"],
  });
  this.cmd("SetMessage", "");
  return this.finishLinkedListAnimation();
};

// Delete from head (like QueueLL dequeue)
LinkedList.prototype.deleteFront = function (ignored) {
  this.beginLinkedListAnimation("deleteFront", "delete front", {
    tags: ["delete", "head"],
  });

  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Deleting front (head) node");
  this.markAnimationStep("start delete front", { tags: ["delete", "start"] });

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
  this.markAnimationStep("capture deleted value", { tags: ["delete", "capture"] });

  if (this.top == 1) {
    this.cmd("SetMessage", "head gets set to head->next which is null.");
    this.markAnimationStep("clear head and tail", { tags: ["delete", "empty"] });
    this.cmd("SetNull", this.headID, 1);
    this.cmd("SetNull", this.tailID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "head gets set to head->next.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd(
      "Connect",
      this.headID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1,
    );
    this.markAnimationStep("advance head pointer", { tags: ["delete", "head-pointer"] });
  }
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);

  this.top = this.top - 1;
  this.markAnimationStep("delete old head node", { tags: ["delete", "node"] });

  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);

  this.beginBlock("delete complete", {
    source: "LinkedList",
    operation: this.currentAnimationOperation,
    tags: ["delete", "complete"],
  });
  this.cmd("SetMessage", "Deleted Value: " + this.arrayData[this.top]);

  return this.finishLinkedListAnimation();
};

LinkedList.prototype.findElement = function (valueToFind) {
  this.beginLinkedListAnimation("find", `find ${valueToFind}`, {
    tags: ["search", "find"],
  });

  if (this.top == 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.markAnimationStep("empty list", { tags: ["search", "empty"] });
    return this.finishLinkedListAnimation();
  }

  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.markAnimationStep("start search", { tags: ["search", "start"] });

  // Head is at index (top - 1), then walk down to tail at index 0.
  for (let i = this.top - 1; i >= 0; i--) {
    this.cmd("SetHighlight", this.linkedListElemID[i], 1);
    this.markAnimationStep(`inspect ${this.arrayData[i]}`, {
      focusNodeId: this.linkedListElemID[i],
      tags: ["search", "inspect"],
    });

    if (String(this.arrayData[i]) === String(valueToFind)) {
      this.beginBlock(`found ${valueToFind}`, {
        source: "LinkedList",
        operation: this.currentAnimationOperation,
        tags: ["search", "found"],
      });
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("SetHighlight", this.linkedListElemID[i], 0);
      return this.finishLinkedListAnimation();
    }

    this.cmd("SetHighlight", this.linkedListElemID[i], 0);
  }

  this.beginBlock(`not found ${valueToFind}`, {
    source: "LinkedList",
    operation: this.currentAnimationOperation,
    tags: ["search", "not-found"],
  });
  this.cmd("SetMessage", "Not found: " + valueToFind);
  return this.finishLinkedListAnimation();
};

LinkedList.prototype.clearData = function () {
  this.beginLinkedListAnimation("clear", "clear list", { tags: ["clear"] });

  if (this.top == 0) {
    this.cmd("SetMessage", "");
    this.cmd("SetNull", this.tempID, 1);
    this.cmd("SetAlpha", this.tempID, 0);
    this.cmd("SetAlpha", this.tempLabelID, 0);
    this.markAnimationStep("already empty", { tags: ["clear", "empty"] });
    return this.finishLinkedListAnimation();
  }

  this.cmd("SetNull", this.tailID, 1);
  this.cmd("SetNull", this.headID, 1);
  this.cmd("SetNull", this.tempID, 1);
  this.cmd("SetAlpha", this.tempID, 0);
  this.cmd("SetAlpha", this.tempLabelID, 0);

  // Disconnect pointers if present
  this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  this.cmd("Disconnect", this.tailID, this.linkedListElemID[0]);
  this.cmd("Disconnect", this.tempID, this.linkedListElemID[0]);
  this.markAnimationStep("disconnect pointers", { tags: ["clear", "disconnect"] });

  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }

  this.beginBlock("clear nodes", {
    source: "LinkedList",
    operation: this.currentAnimationOperation,
    tags: ["clear", "nodes"],
  });
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.top = 0;
  return this.finishLinkedListAnimation();
};
