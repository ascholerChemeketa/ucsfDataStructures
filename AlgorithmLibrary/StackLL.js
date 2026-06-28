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
import {
  describeSinglyLinkedChain,
  describeSinglyLinkedChainFromState,
} from "./DescribeHelpers.js";

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

var STACK_LABEL_X = TOP_POS_X + TOP_ELEM_WIDTH * 5;
var STACK_LABEL_Y = 25;
var STACK_ELEMENT_X = STACK_LABEL_X;
var STACK_ELEMENT_Y = 50;

var SIZE = 32;

export function StackLL(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Stack (Linked List)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;

  if (opts.size) SIZE = opts.size;

  let am = initAnimationManager(opts);
  this.init(am, 800, 400);

  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.push.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

StackLL.prototype = new Algorithm();
StackLL.prototype.constructor = StackLL;
StackLL.superclass = Algorithm.prototype;

StackLL.prototype.init = function (am, w, h) {
  StackLL.superclass.init.call(this, am, w, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.setup();
  this.initialIndex = this.nextIndex;

  this.doPush = function (val) {
    this.implementAction(this.push.bind(this), val);
  };
  this.doPop = function () {
    this.implementAction(this.pop.bind(this));
  };
  this.doPeek = function () {
    this.implementAction(this.peek.bind(this));
  };
};

StackLL.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();
  this.controls = [];

  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.setAttribute("placeholder", "Value to push");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.pushCallback.bind(this),
    6,
  );

  this.pushButton = addControlToAlgorithmBar("Button", "Push");
  this.pushButton.onclick = this.pushCallback.bind(this);
  this.controls.push(this.pushButton);

  this.popButton = addControlToAlgorithmBar("Button", "Pop");
  this.popButton.onclick = this.popCallback.bind(this);
  this.controls.push(this.popButton);

  this.peekButton = addControlToAlgorithmBar("Button", "Peek");
  this.peekButton.onclick = this.peekCallback.bind(this);
  this.controls.push(this.peekButton);

  this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  // Hide the button but keep the logic wired up.
  this.clearButton.style.display = "none";
};

StackLL.prototype.enableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};

StackLL.prototype.disableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

StackLL.prototype.setup = function () {
  this.linkedListElemID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.topID = this.nextIndex++;
  this.topLabelID = this.nextIndex++;

  this.arrayData = new Array(SIZE);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;

  this.cmd("CreateLabel", this.topLabelID, "Top", TOP_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.topID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TOP_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetNull", this.topID, 1);

  this.cmd(
    "CreateLabel",
    this.leftoverLabelID,
    "",
    STACK_LABEL_X,
    STACK_LABEL_Y,
    0,
  );

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

StackLL.prototype.resetLinkedListPositions = function () {
  for (var i = this.top - 1; i >= 0; i--) {
    var nextX =
      ((this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_ELEM_SPACING +
      LINKED_LIST_START_X;
    var nextY =
      Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE) *
        LINKED_LIST_LINE_SPACING +
      LINKED_LIST_START_Y +
      ((this.top - 1 - i) % 2) * 15;
    this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
  }
};

StackLL.prototype.reset = function () {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};

StackLL.prototype.beginStackLLAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "StackLL", operation, ...meta });
};

StackLL.prototype.markAnimationStep = function (label, meta = {}) {
  this.step(label, {
    source: "StackLL",
    operation: this.currentAnimationOperation,
    ...meta,
  });
};

StackLL.prototype.finishStackLLAnimation = function () {
  this.currentAnimationOperation = null;
  return this.finishAnimation();
};

StackLL.prototype.describe = function () {
  const values = [];
  for (let i = this.top - 1; i >= 0; i--) {
    values.push(this.arrayData[i]);
  }
  return describeSinglyLinkedChain(values, {
    emptyText: "Stack is empty.",
    headLabel: "Top",
  });
};

StackLL.prototype.describeFromState = function (state) {
  return describeSinglyLinkedChainFromState(state, this.topID, {
    emptyText: "Stack is empty.",
    headLabel: "Top",
  });
};

StackLL.prototype.pushCallback = function (event) {
  if (this.inputField.value !== "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.push.bind(this), pushVal);
  }
};

StackLL.prototype.popCallback = function (event) {
  this.implementAction(this.pop.bind(this), "");
};

StackLL.prototype.clearCallback = function (event) {
  this.implementAction(this.clearAll.bind(this), "");
};

StackLL.prototype.peekCallback = function (event) {
  this.implementAction(this.peek.bind(this), "");
};

StackLL.prototype.push = function (elemToPush) {
  this.beginStackLLAnimation("push", `push ${elemToPush}`, {
    tags: ["stack", "push"],
  });

  if (this.top >= SIZE) {
    this.cmd("SetMessage", "Top == size. Stack is full. Cannot push.");
    this.markAnimationStep("stack full", { tags: ["stack", "push", "full"] });
    return this.finishStackLLAnimation();
  }

  var labPushValID = this.nextIndex++;
  this.arrayData[this.top] = elemToPush;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Pushing Value: " + elemToPush);

  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[this.top],
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    LINKED_LIST_INSERT_X,
    LINKED_LIST_INSERT_Y,
    0.25,
    0,
    1,
    1,
  );

  this.cmd(
    "CreateLabel",
    labPushValID,
    elemToPush,
    STACK_ELEMENT_X,
    STACK_ELEMENT_Y,
  );

  // this.cmd("Step");
  this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
  this.markAnimationStep(`allocate node ${elemToPush}`, {
    tags: ["stack", "push", "allocate"],
    focusNodeId: this.linkedListElemID[this.top],
  });
  this.cmd("SetText", this.linkedListElemID[this.top], elemToPush);
  this.cmd("Delete", labPushValID);

  if (this.top == 0) {
    this.cmd("SetNull", this.topID, 0);
    this.cmd("SetNull", this.linkedListElemID[this.top], 1);
  } else {
    this.cmd(
      "Connect",
      this.linkedListElemID[this.top],
      this.linkedListElemID[this.top - 1],
      "#000000",
      0.1,
    );
    this.markAnimationStep("link new top to previous top", {
      tags: ["stack", "push", "link"],
      focusNodeId: this.linkedListElemID[this.top],
    });
    this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
  }
  this.cmd("Connect", this.topID, this.linkedListElemID[this.top], "#000000", 0.1);

  this.markAnimationStep("update top pointer", {
    tags: ["stack", "push", "top-pointer"],
    focusNodeId: this.linkedListElemID[this.top],
  });
  this.top = this.top + 1;
  this.resetLinkedListPositions();
  this.cmd("SetMessage", "");
  this.markAnimationStep("push complete", {
    tags: ["stack", "push", "complete"],
  });

  return this.finishStackLLAnimation();
};

StackLL.prototype.pop = function (ignored) {
  this.beginStackLLAnimation("pop", "pop", {
    tags: ["stack", "pop"],
  });

  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.markAnimationStep("stack empty", { tags: ["stack", "pop", "empty"] });
    return this.finishStackLLAnimation();
  }

  var labPopValID = this.nextIndex++;
  var poppedVal = this.arrayData[this.top - 1];

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Popping top value");
  this.markAnimationStep("start pop", { tags: ["stack", "pop", "start"] });

  this.cmd(
    "CreateLabel",
    labPopValID,
    poppedVal,
    LINKED_LIST_START_X,
    LINKED_LIST_START_Y,
  );

  this.cmd("Move", labPopValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.markAnimationStep(`capture ${poppedVal}`, {
    tags: ["stack", "pop", "capture"],
    focusNodeId: this.linkedListElemID[this.top - 1],
  });

  this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
  if (this.top == 1) {
    this.cmd("SetNull", this.topID, 1);
  } else {
    this.cmd(
      "Connect",
      this.topID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1,
    );
  }

  this.markAnimationStep("advance top pointer", {
    tags: ["stack", "pop", "top-pointer"],
  });
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.top = this.top - 1;
  this.resetLinkedListPositions();

  this.cmd("Delete", labPopValID);
  this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + poppedVal);
  this.cmd("SetMessage", "");
  this.markAnimationStep("pop complete", {
    tags: ["stack", "pop", "complete"],
  });

  return this.finishStackLLAnimation();
};

StackLL.prototype.peek = function (ignored) {
  this.beginStackLLAnimation("peek", "peek", {
    tags: ["stack", "peek"],
  });

  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.markAnimationStep("stack empty", { tags: ["stack", "peek", "empty"] });
    return this.finishStackLLAnimation();
  }

  const labPeekValID = this.nextIndex++;
  const peekedVal = this.arrayData[this.top - 1];

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Peeking at top value");
  this.markAnimationStep("start peek", { tags: ["stack", "peek", "start"] });

  let srcX = LINKED_LIST_START_X;
  let srcY = LINKED_LIST_START_Y;
  try {
    srcX = this.animationManager.animatedObjects.getNodeX(
      this.linkedListElemID[this.top - 1],
    );
    srcY = this.animationManager.animatedObjects.getNodeY(
      this.linkedListElemID[this.top - 1],
    );
  } catch (e) {}

  this.cmd("CreateLabel", labPeekValID, peekedVal, srcX, srcY);
  this.cmd("Move", labPeekValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.cmd("SetMessage", "Peeked Value: " + peekedVal);
  this.markAnimationStep(`peek ${peekedVal}`, {
    tags: ["stack", "peek", "value"],
    focusNodeId: this.linkedListElemID[this.top - 1],
  });

  this.cmd("Delete", labPeekValID);
  this.cmd("SetText", this.leftoverLabelID, "Peeked Value: " + peekedVal);
  this.cmd("SetMessage", "");
  this.markAnimationStep("peek complete", {
    tags: ["stack", "peek", "complete"],
  });

  return this.finishStackLLAnimation();
};

StackLL.prototype.clearAll = function () {
  this.beginStackLLAnimation("clear", "clear stack", {
    tags: ["stack", "clear"],
  });
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "");

  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }
  this.top = 0;
  this.cmd("SetNull", this.topID, 1);
  this.markAnimationStep("stack cleared", {
    tags: ["stack", "clear", "complete"],
  });
  return this.finishStackLLAnimation();
};
