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

var LINKED_LIST_START_X = 100;
var LINKED_LIST_START_Y = 150;
var LINKED_LIST_ELEM_WIDTH = 50;
var LINKED_LIST_ELEM_HEIGHT = 25;

var LINKED_LIST_INSERT_X = 250;
var LINKED_LIST_INSERT_Y = 50;

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

var PUSH_LABEL_X = TAIL_POS_X + TOP_ELEM_WIDTH * 3;
var PUSH_LABEL_Y = 25;
var PUSH_ELEMENT_X = PUSH_LABEL_X;
var PUSH_ELEMENT_Y = 50;

var SIZE = 32;

export function QueueLL(opts = {}) {
  if(!opts.title) opts.title = opts.title || "Queue (Linked List)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

  if(opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.enqueue.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
  
}

QueueLL.prototype = new Algorithm();
QueueLL.prototype.constructor = QueueLL;
QueueLL.superclass = Algorithm.prototype;

QueueLL.prototype.init = function (am, w, h) {
  QueueLL.superclass.init.call(this, am, w, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.tail_pos_y = h/2 - LINKED_LIST_ELEM_HEIGHT;
  this.tail_label_y = this.tail_pos_y;
  this.setup();
  this.initialIndex = this.nextIndex;
  
  this.doEnqueue = function (val) {
    this.implementAction( this.enqueue.bind(this), val);
  };
  this.doDequeue = function () {
    this.implementAction( this.dequeue.bind(this) );
  };

  this.createdNodeCount = 0;
};

QueueLL.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);

  this.inputField.onkeydown = this.returnSubmit(  
    this.inputField,
    this.enqueueCallback.bind(this),
    6,
  );

  this.enqueueButton = addControlToAlgorithmBar("Button", "Enqueue");
  this.enqueueButton.onclick = this.enqueueCallback.bind(this);
  this.controls.push(this.enqueueButton);

  this.dequeueButton = addControlToAlgorithmBar("Button", "Dequeue");
  this.dequeueButton.onclick = this.dequeueCallback.bind(this);
  this.controls.push(this.dequeueButton);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear Queue");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
};

QueueLL.prototype.enableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
QueueLL.prototype.disableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

QueueLL.prototype.setup = function () {
  this.linkedListElemID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;

  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;

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

  this.cmd(
    "CreateLabel",
    this.tailLabelID,
    "Tail",
    TAIL_LABEL_X,
    TOP_LABEL_Y,
  );
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

  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, PUSH_LABEL_Y, 0);

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

QueueLL.prototype.resetLinkedListPositions = function () {
  for (var i = this.top - 1; i >= 0; i--) {
    var nextX =
      ((this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_ELEM_SPACING +
      LINKED_LIST_START_X;
    var nextY =
      Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_LINE_SPACING +
      LINKED_LIST_START_Y;
    this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
  }
};

QueueLL.prototype.reset = function () {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};

QueueLL.prototype.enqueueCallback = function (event) {
  if (this.top < SIZE && this.inputField.value != "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.enqueue.bind(this), pushVal);
  }
};

QueueLL.prototype.dequeueCallback = function (event) {
  if (this.top > 0) {
    this.implementAction(this.dequeue.bind(this), "");
  }
};

QueueLL.prototype.clearCallback = function (event) {
  this.implementAction(this.clearData.bind(this), "");
};

QueueLL.prototype.enqueue = function (elemToPush) {
  this.commands = new Array();

  this.arrayData[this.top] = elemToPush;

  this.cmd("SetText", this.leftoverLabelID, "");
  
  this.createdNodeCount++;

  for (var i = this.top; i > 0; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }
  this.arrayData[0] = elemToPush;
  this.linkedListElemID[0] = this.nextIndex++;

  //var labPushID = this.nextIndex++;
  this.cmd("SetMessage", "Enqueuing Value: " + elemToPush);
  // this.cmd(
  //   "CreateLabel",
  //   labPushID,
  //   "Enqueuing Value: ",
  //   PUSH_LABEL_X,
  //   PUSH_LABEL_Y,
  // );
  // this.cmd(
  //   "CreateLabel",
  //   labPushValID,
  //   elemToPush,
  //   PUSH_ELEMENT_X,
  //   PUSH_ELEMENT_Y,
  // );

  // this.cmd("Step");

  // this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

 this.cmd("Step");
 //var labPushValID = this.nextIndex++;
 this.cmd(
   "CreateLinkedList",
   this.linkedListElemID[0],
   "",
   LINKED_LIST_ELEM_WIDTH,
   LINKED_LIST_ELEM_HEIGHT,
   LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * ((this.createdNodeCount - 1) % LINKED_LIST_ELEMS_PER_LINE),
   LINKED_LIST_START_Y + (this.createdNodeCount - 1) % 2 * 15 + Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING,
   //LINKED_LIST_INSERT_X,
   //LINKED_LIST_INSERT_Y,
   0.25,
   0,
   1,
   1,
 );


 this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[0], 1);
  this.cmd("SetText", this.linkedListElemID[0], elemToPush);
  this.cmd("Step");
 // this.cmd("Delete", labPushValID);


  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd("connect", this.headID, this.linkedListElemID[this.top], "#000000", 0.1);
    this.cmd("SetMessage", "Queue is empty, head and tail point to this node.");
  } else {
    this.cmd("SetNull", this.linkedListElemID[1], 0);
    this.cmd("Connect", this.linkedListElemID[1], this.linkedListElemID[0], "#000000", 0.1);
    this.cmd("SetMessage", "Set tail->next to point to new node.");
    this.cmd("Step");
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
    this.cmd("SetMessage", "Update tail pointer to new node.");
  }
  this.cmd("connect", this.tailID, this.linkedListElemID[0], "#000000", -0.1, true, "", 1);

  this.cmd("Step");
  this.top = this.top + 1;
  //this.resetLinkedListPositions();
  // this.cmd("Delete", labPushID);
  this.cmd("SetMessage", "");

  this.cmd("Step");

  return this.commands;
};

QueueLL.prototype.dequeue = function (ignored) {
  this.commands = new Array();

  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;

  this.cmd("SetText", this.leftoverLabelID, "");

  this.cmd("SetMessage", "Dequeuing first value");
  this.cmd("Step");

  this.cmd(
    "CreateLabel",
    labPopID,
    "Dequeued Value: ",
    PUSH_LABEL_X + 20,
    PUSH_LABEL_Y,
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X,
    LINKED_LIST_START_Y,
  );

  this.cmd("Move", labPopValID, PUSH_ELEMENT_X + 20, PUSH_ELEMENT_Y);
  this.cmd("Step");
  

  if (this.top == 1) {
    this.cmd("SetMessage", "Head == tail, so that was last value.");
    this.cmd("Step");
    this.cmd("SetMessage", "Head and tail both become null.");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("SetNull", this.tailID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "Advance head.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Connect", this.headID, this.linkedListElemID[this.top - 2], "#000000", 0.1);
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.top = this.top - 1;
  //this.resetLinkedListPositions();
  this.cmd("Step");

  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);
  this.cmd("SetMessage", "Dequeued Value: " + this.arrayData[this.top]);
  this.cmd("Step");

  return this.commands;
};

QueueLL.prototype.clearData = function () {
  this.commands = new Array();
  
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("SetNull", this.headID, 1);
  this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  this.cmd("Disconnect", this.tailID, this.linkedListElemID[0]);
  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.top = 0;
  return this.commands;
};

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new QueueLL(animManag, canvas.width, canvas.height);
}
