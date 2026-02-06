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
} from "../AlgorithmLibrary/Algorithm.js";

var ARRAY_START_X = 100;
var ARRAY_START_Y = 100;
var ARRAY_ELEM_WIDTH = 50;
var ARRAY_ELEM_HEIGHT = 30;

var ARRAY_ELEMS_PER_LINE = 10;
var ARRAY_LINE_SPACING = 130;

var TOP_LABEL_X = 100;
var TOP_POS_X = TOP_LABEL_X + 50;
var TOP_POS_Y = 30;
var TOP_LABEL_Y = TOP_POS_Y;

var STACK_LABEL_X = TOP_LABEL_X + 180;
var STACK_LABEL_Y = 30;
var STACK_ELEMENT_X = STACK_LABEL_X;
var STACK_ELEMENT_Y = 30;

var INDEX_COLOR = "#0000FF";

var SIZE = 8;

export function StackArray(opts = {}) {
  if (!opts.title) opts.title = opts.title || "Stack (Array)";
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

StackArray.prototype = new Algorithm();
StackArray.prototype.constructor = StackArray;
StackArray.superclass = Algorithm.prototype;

StackArray.prototype.init = function (am, w, h) {
  StackArray.superclass.init.call(this, am, w, h);
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

StackArray.prototype.addControls = function () {
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

StackArray.prototype.enableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};

StackArray.prototype.disableUI = function (event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};

StackArray.prototype.setup = function () {
  this.nextIndex = 0;

  this.arrayID = new Array(SIZE);
  this.arrayLabelID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.arrayID[i] = this.nextIndex++;
    this.arrayLabelID[i] = this.nextIndex++;
  }

  this.topID = this.nextIndex++;
  this.topLabelID = this.nextIndex++;

  this.arrayData = new Array(SIZE);
  this.top = 0;

  this.leftoverLabelID = this.nextIndex++;
  this.commands = new Array();

  for (var i = 0; i < SIZE; i++) {
    var xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    var ypos =
      Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

    this.cmd(
      "CreateRectangle",
      this.arrayID[i],
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      xpos,
      ypos,
    );

    this.cmd(
      "CreateLabel",
      this.arrayLabelID[i],
      i,
      xpos,
      ypos + ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetForegroundColor", this.arrayLabelID[i], INDEX_COLOR);
  }

  this.cmd("CreateLabel", this.topLabelID, "Top", TOP_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.topID,
    0,
    ARRAY_ELEM_WIDTH,
    ARRAY_ELEM_HEIGHT,
    TOP_POS_X,
    TOP_POS_Y,
  );

  this.cmd("CreateLabel", this.leftoverLabelID, "", STACK_LABEL_X, STACK_LABEL_Y);

  this.highlight1ID = this.nextIndex++;
  this.highlight2ID = this.nextIndex++;

  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

StackArray.prototype.reset = function () {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};

StackArray.prototype.pushCallback = function (event) {
  if (this.inputField.value !== "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.push.bind(this), pushVal);
  }
};

StackArray.prototype.popCallback = function (event) {
  this.implementAction(this.pop.bind(this), "");
};

StackArray.prototype.clearCallback = function (event) {
  this.implementAction(this.clearAll.bind(this), "");
};

StackArray.prototype.peekCallback = function (event) {
  this.implementAction(this.peek.bind(this), "");
};

StackArray.prototype.push = function (elemToPush) {
  this.commands = new Array();

  if (this.top >= SIZE) {
    this.cmd("SetMessage", "Top == size. Stack is full. Cannot push.");
    this.cmd("Step");
    return this.commands;
  }

  var labPushValID = this.nextIndex++;
  this.arrayData[this.top] = elemToPush;

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Pushing Value: " + elemToPush);
  this.cmd(
    "CreateLabel",
    labPushValID,
    elemToPush,
    STACK_ELEMENT_X,
    STACK_ELEMENT_Y,
  );

  this.cmd("Step");
  this.cmd("SetMessage", "Top gives next available location.");
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR,
    TOP_POS_X,
    TOP_POS_Y,
  );
  this.cmd("Step");

  var xpos = (this.top % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
  var ypos =
    Math.floor(this.top / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
  this.cmd("Step");

  this.cmd("Move", labPushValID, xpos, ypos);
  this.cmd("Step");

  this.cmd("Settext", this.arrayID[this.top], elemToPush);
  this.cmd("Delete", labPushValID);
  this.cmd("Delete", this.highlight1ID);

  this.cmd("SetHighlight", this.topID, 1);
  this.cmd("SetMessage", "Advance top to next location.");
  this.cmd("Step");
  this.top = this.top + 1;
  this.cmd("SetText", this.topID, this.top);
  this.cmd("Step");
  this.cmd("SetHighlight", this.topID, 0);
  this.cmd("SetMessage", "");

  return this.commands;
};

StackArray.prototype.pop = function (ignored) {
  this.commands = new Array();

  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }

  var labPopValID = this.nextIndex++;

  this.cmd("SetText", this.leftoverLabelID, "");

  this.cmd("SetHighlight", this.topID, 1);
  this.cmd("SetMessage", "Decrement top to previous location.");
  this.cmd("Step");
  this.top = this.top - 1;
  this.cmd("SetText", this.topID, this.top);
  this.cmd("Step");
  this.cmd("SetHighlight", this.topID, 0);

  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR,
    TOP_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetMessage", "Top gives location of last value.");
  this.cmd("Step");

  var xpos = (this.top % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
  var ypos =
    Math.floor(this.top / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
  this.cmd("Step");
  this.cmd("Delete", this.highlight1ID);

  var poppedVal = this.arrayData[this.top];
  this.cmd("CreateLabel", labPopValID, poppedVal, xpos, ypos);
  this.cmd("Settext", this.arrayID[this.top], "");
  this.cmd("Move", labPopValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.cmd("SetMessage", `Pop ${poppedVal}`);
  this.cmd("Step");

  this.cmd("Delete", labPopValID);
  this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + poppedVal);
  this.cmd("SetMessage", "");

  return this.commands;
};

StackArray.prototype.peek = function (ignored) {
  this.commands = new Array();

  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }

  const labPeekValID = this.nextIndex++;
  const peekIndex = this.top - 1;
  const peekedVal = this.arrayData[peekIndex];

  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Peek at top value");
  this.cmd("Step");

  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR,
    TOP_POS_X,
    TOP_POS_Y,
  );
  this.cmd("SetMessage", "Top-1 gives location of last value.");
  this.cmd("Step");

  const xpos = (peekIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
  const ypos =
    Math.floor(peekIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
  this.cmd("Step");
  this.cmd("Delete", this.highlight1ID);

  this.cmd("CreateLabel", labPeekValID, peekedVal, xpos, ypos);
  this.cmd("Move", labPeekValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.cmd("SetMessage", "Peeked Value: " + peekedVal);
  this.cmd("Step");

  this.cmd("Delete", labPeekValID);
  this.cmd("SetText", this.leftoverLabelID, "Peeked Value: " + peekedVal);
  this.cmd("SetMessage", "");

  return this.commands;
};

StackArray.prototype.clearAll = function () {
  this.commands = new Array();
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "");

  for (var i = 0; i < SIZE; i++) {
    this.cmd("SetText", this.arrayID[i], "");
  }

  this.top = 0;
  this.cmd("SetText", this.topID, "0");
  return this.commands;
};
