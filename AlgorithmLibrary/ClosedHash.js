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

import {
  initAnimationManager,
  initCanvas,
} from "../AnimationLibrary/AnimationMain.js";
import {
  addControlToAlgorithmBar,
  addRadioButtonGroupToAlgorithmBar,
} from "./Algorithm.js";
import { Hash } from "./Hash.js";

export function ClosedHash(canvas) {
  // New-style usage: `new ClosedHash({ ...opts })` (preferred)
  // Legacy usage: `new ClosedHash(canvas)`
  let am;
  let w;
  let h;

    const opts = canvas || {};
  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Closed Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height,
    });
    w = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const viewWidth =
      Number.isFinite(opts.viewWidth) && opts.viewWidth > 0
        ? opts.viewWidth
        : Number.isFinite(opts.width) && opts.width > 0
          ? opts.width
          : 1000;
    const viewHeight =
      Number.isFinite(opts.viewHeight) && opts.viewHeight > 0
        ? opts.viewHeight
        : Number.isFinite(opts.height) && opts.height > 0
          ? opts.height
          : 500;

    am = initAnimationManager({
      title: opts.title || "Closed Hashing",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts,
    });
    w = viewWidth;
    h = viewHeight;

  }

  this.init(am, w, h);
          
  if(opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

var ARRAY_ELEM_WIDTH = 90;
var ARRAY_ELEM_HEIGHT = 30;
var ARRAY_ELEM_START_X = 50;
var ARRAY_ELEM_START_Y = 100;
var ARRAY_VERTICAL_SEPARATION = 100;

var CLOSED_HASH_TABLE_SIZE = 8;

var ARRAY_Y_POS = 350;

var INDEX_COLOR = "#0000FF";

var MAX_DATA_VALUE = 999;

var HASH_TABLE_SIZE = 13;

var ARRAY_Y_POS = 350;

var INDEX_COLOR = "#0000FF";

ClosedHash.prototype = new Hash();
ClosedHash.prototype.constructor = ClosedHash;
ClosedHash.superclass = Hash.prototype;

ClosedHash.prototype.init = function (am, w, h) {
  var sc = ClosedHash.superclass;
  var fn = sc.init;
  this.elements_per_row = 8; // Math.floor(w / ARRAY_ELEM_WIDTH);

  fn.call(this, am, w, h);

  //Change me!
  this.nextIndex = 0;
  this.hasGrown = false;
  //this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
  this.setup();
};

ClosedHash.prototype.addControls = function () {
  ClosedHash.superclass.addControls.call(this);

  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    [
      "Linear Probing: f(i) = i",
      "Quadratic Probing: f(i) = i * i",
      "Double Hashing: f(i) = i * hash2(elem)",
    ],
    "CollisionStrategy",
  );
  this.linearProblingButton = radioButtonList[0];
  this.linearProblingButton.onclick = this.linearProbeCallback.bind(this);
  this.quadraticProbingButton = radioButtonList[1];
  this.quadraticProbingButton.onclick = this.quadraticProbeCallback.bind(this);
  this.doubleHashingButton = radioButtonList[2];
  this.doubleHashingButton.onclick = this.doubleHashingCallback.bind(this);

  this.linearProblingButton.checked = true;
  this.currentHashingTypeButtonState = this.linearProblingButton;

  this.growButton = addControlToAlgorithmBar("Button","Grow table");
  this.growButton.onclick = this.growCallback.bind(this);
  this.growButton.disabled = false;
};

ClosedHash.prototype.growCallback = function (event) {
  if (!this.hasGrown) {
    this.implementAction(this.growTable.bind(this), 16);
  }
};

ClosedHash.prototype.growTable = function (newSize) {
  this.commands = [];

  if (this.hasGrown) {
    return this.commands;
  }

  const targetSize = newSize || 16;
  CLOSED_HASH_TABLE_SIZE = targetSize;

  const oldSize = this.table_size;
  const oldHashTableVisual = this.hashTableVisual.slice();
  const oldHashTableIndices = this.hashTableIndices.slice();
  const oldIndexXPos = this.indexXPos.slice();
  const oldIndexYPos = this.indexYPos.slice();

  // Staging array (same box/index layout as the hash table), placed below.
  const elemsToRehash = [];
  const stagingSlots = [];
  const stagingRects = new Array(oldSize);
  const stagingIndices = new Array(oldSize);
  const stagingXPos = new Array(oldSize);
  const stagingYPos = new Array(oldSize);

  const oldRows = Math.max(1, Math.ceil(oldSize / this.elements_per_row));
  const stagingStartY =
    ARRAY_ELEM_START_Y + oldRows * ARRAY_VERTICAL_SEPARATION + 100;

  // this.cmd(
  //   "SetMessage",
  //   `Grow table: collect elements and expand to ${targetSize}`,
  // );
  // this.cmd("Step");

  // Create the staging array boxes/indices.
  for (let i = 0; i < oldSize; i++) {
    const nextXPos =
      ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
    const nextYPos =
      stagingStartY +
      Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;

    stagingXPos[i] = nextXPos;
    stagingYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;

    const rectID = this.nextIndex++;
    stagingRects[i] = rectID;
    this.cmd(
      "CreateRectangle",
      rectID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos,
    );

    const idxID = this.nextIndex++;
    stagingIndices[i] = idxID;
    this.cmd("CreateLabel", idxID, i, stagingXPos[i], stagingYPos[i]);
    this.cmd("SetForegroundColor", idxID, INDEX_COLOR);
  }

  this.cmd("SetMessage", "Old array becomes staging array");

  // Scan each original slot, showing whether it contains a value. If it does,
  // move it into the corresponding staging slot.
  for (let i = 0; i < oldSize; i++) {
    const hasValue = !this.empty[i] && !this.deleted[i];

    // this.cmd("SetHighlight", oldHashTableVisual[i], 1);
    // this.cmd("SetHighlight", stagingRects[i], 1);

    // let movingLabelID = -1;
    // if (hasValue) {
    //   const value = this.hashTableValues[i];
    //   movingLabelID = this.nextIndex++;
    //   this.cmd(
    //     "CreateLabel",
    //     movingLabelID,
    //     value,
    //     oldIndexXPos[i],
    //     oldIndexYPos[i] - ARRAY_ELEM_HEIGHT,
    //   );
    //   this.cmd(
    //     "Move",
    //     movingLabelID,
    //     stagingXPos[i],
    //     stagingYPos[i] - ARRAY_ELEM_HEIGHT,
    //   );
    //   this.cmd("SetMessage", `Slot ${i} contains ${value}; move to staging`);
    // } else {
    //   this.cmd("SetMessage", `Slot ${i} is empty; nothing to move`);
    // }

    // this.cmd("Step");

    // this.cmd("SetHighlight", oldHashTableVisual[i], 0);
    // this.cmd("SetHighlight", stagingRects[i], 0);

    if (this.deleted[i]) {
      this.cmd("SetText", stagingRects[i], "<deleted>");
    } else if (hasValue) {
      const value = this.hashTableValues[i];
      elemsToRehash.push(value);
      stagingSlots.push(i);
      this.cmd("SetText", stagingRects[i], value);
    }
  }
  
  this.cmd("Step");

  // Delete old table visuals (keep ExplainLabel).
  for (let i = 0; i < oldSize; i++) {
    this.cmd("Delete", oldHashTableVisual[i]);
    this.cmd("Delete", oldHashTableIndices[i]);
  }

  // Reset the model + create a fresh table of the new size.
  this.table_size = targetSize;
  this.skipDist = new Array(this.table_size);
  this.hashTableVisual = new Array(this.table_size);
  this.hashTableIndices = new Array(this.table_size);
  this.hashTableValues = new Array(this.table_size);
  this.indexXPos = new Array(this.table_size);
  this.indexYPos = new Array(this.table_size);
  this.empty = new Array(this.table_size);
  this.deleted = new Array(this.table_size);

  for (let i = 0; i < this.table_size; i++) {
    // Initialize skip distances based on the currently selected probe type.
    if (this.currentHashingTypeButtonState == this.quadraticProbingButton) {
      this.skipDist[i] = i * i;
    } else {
      // Linear probing (and a safe default for double hashing until hash2 is computed)
      this.skipDist[i] = i;
    }
    this.empty[i] = true;
    this.deleted[i] = false;

    const nextRectID = this.nextIndex++;
    const nextXPos =
      ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
    const nextYPos =
      ARRAY_ELEM_START_Y +
      Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;

    this.cmd(
      "CreateRectangle",
      nextRectID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos,
    );
    this.hashTableVisual[i] = nextRectID;

    const nextIndexLabelID = this.nextIndex++;
    this.hashTableIndices[i] = nextIndexLabelID;
    this.indexXPos[i] = nextXPos;
    this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
    this.cmd(
      "CreateLabel",
      nextIndexLabelID,
      i,
      this.indexXPos[i],
      this.indexYPos[i],
    );
    this.cmd("SetForegroundColor", nextIndexLabelID, INDEX_COLOR);
  }

  this.cmd("SetMessage", `Created new table of size ${targetSize}`);
  this.cmd("Step");

  // Reinsert from the staging list, one-by-one.
  for (let k = 0; k < elemsToRehash.length; k++) {
    const value = elemsToRehash[k];
    const fromSlot = stagingSlots[k];
    const labelID = this.nextIndex++;

    this.cmd("SetHighlight", stagingRects[fromSlot], 1);
    this.cmd("SetMessage", `Take ${value} from staging slot ${fromSlot}`);
    this.cmd("Step");

    this.cmd(
      "CreateLabel",
      labelID,
      value,
      stagingXPos[fromSlot],
      stagingYPos[fromSlot] - ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetText", stagingRects[fromSlot], "");
    
      this.cmd("Step");

    // Hash + probing are animated inside doHash/getEmptyIndex.
    let index = this.doHash(value);
    index = this.getEmptyIndex(index, value);

    if (index !== -1) {
      this.cmd(
        "Move",
        labelID,
        this.indexXPos[index],
        this.indexYPos[index] - ARRAY_ELEM_HEIGHT,
      );
      this.cmd("SetMessage", `Reinsert ${value} at index ${index}`);
      this.cmd("Step");
      this.cmd("Delete", labelID);
      this.cmd("SetText", this.hashTableVisual[index], value);
      this.hashTableValues[index] = value;
      this.empty[index] = false;
      this.deleted[index] = false;
    } else {
      // Shouldn't happen with an empty table, but keep a graceful path.
      this.cmd("SetMessage", `Table full while reinserting ${value}`);
      this.cmd("Step");
      this.cmd("Delete", labelID);
    }

    this.cmd("SetHighlight", stagingRects[fromSlot], 0);
  }

  this.cmd("SetMessage", "Grow complete");
  this.cmd("Step");

  this.hasGrown = true;
  if (this.growButton) {
    this.growButton.disabled = true;
  }

  // Remove the staging array once rehashing completes.
  for (let i = 0; i < oldSize; i++) {
    this.cmd("Delete", stagingRects[i]);
    this.cmd("Delete", stagingIndices[i]);
  }

  return this.commands;
};

ClosedHash.prototype.changeProbeType = function (newProbingType) {
  if (newProbingType == this.linearProblingButton) {
    this.linearProblingButton.checked = true;
    this.currentHashingTypeButtonState = this.linearProblingButton;
    for (var i = 0; i < this.table_size; i++) {
      this.skipDist[i] = i;
    }
  } else if (newProbingType == this.quadraticProbingButton) {
    this.quadraticProbingButton.checked = true;
    this.currentHashingTypeButtonState = this.quadraticProbingButton;

    for (var i = 0; i < this.table_size; i++) {
      this.skipDist[i] = i * i;
    }
  } else if (newProbingType == this.doubleHashingButton) {
    this.doubleHashingButton.checked = true;
    this.currentHashingTypeButtonState = this.doubleHashingButton;
  }
  this.commands = this.resetAll();
  return this.commands;
};

ClosedHash.prototype.quadraticProbeCallback = function (event) {
  if (this.currentHashingTypeButtonState != this.quadraticProbingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.quadraticProbingButton,
    );
  }
};

ClosedHash.prototype.doubleHashingCallback = function (event) {
  if (this.currentHashingTypeButtonState != this.doubleHashingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.doubleHashingButton,
    );
  }
};

ClosedHash.prototype.linearProbeCallback = function (event) {
  if (this.currentHashingTypeButtonState != this.linearProblingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.linearProblingButton,
    );
  }
};

ClosedHash.prototype.insertElement = function (elem) {
  this.commands = new Array();
  this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
  var index = this.doHash(elem);

  index = this.getEmptyIndex(index, elem);
  this.cmd("SetText", this.ExplainLabel, "");
  if (index != -1) {
    var labID = this.nextIndex++;
    this.cmd("CreateLabel", labID, elem, 20, 25);
    this.cmd(
      "Move",
      labID,
      this.indexXPos[index],
      this.indexYPos[index] - ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetMessage", `Insert at index ${index}`);
    this.cmd("Step");
    this.cmd("Delete", labID);
    this.cmd("SetText", this.hashTableVisual[index], elem);
    this.hashTableValues[index] = elem;
    this.empty[index] = false;
    this.deleted[index] = false;
  }
  return this.commands;
};

ClosedHash.prototype.resetSkipDist = function (elem, labelID) {
  var skipVal = 7 - (this.currHash % 7);
  this.cmd(
    "CreateLabel",
    labelID,
    "hash2(" +
      String(elem) +
      ") = 1 - " +
      String(this.currHash) +
      " % 7 = " +
      String(skipVal),
    20,
    45,
    0,
  );
      this.cmd("SetMessage", "Calculate hash2(" +
      String(elem) +
      ") = 1 - " +
      String(this.currHash) +
      " % 7 = " +
      String(skipVal)
      );
   this.cmd("Step");
  this.skipDist[0] = 0;
  for (var i = 1; i < this.table_size; i++) {
    this.skipDist[i] = this.skipDist[i - 1] + skipVal;
  }
};

ClosedHash.prototype.getEmptyIndex = function (index, elem) {
  var foundIndex = -1;
  for (var i = 0; i < this.table_size; i++) {
    var candidateIndex = (index + this.skipDist[i]) % this.table_size;
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
    if (i == 0) {
      this.cmd("SetMessage", `Probe slot ${candidateIndex} for empty`);
    } else {
      if(this.currentHashingTypeButtonState == this.doubleHashingButton)
        this.cmd("SetMessage", `Advance distance determined by hash2. Probe ${candidateIndex} for empty.`);
      else {
        let moveDist = this.skipDist[i];
        this.cmd("SetMessage", `Probe number ${i}. Advance ${moveDist} to ${candidateIndex} and probe for empty`);
      }
    }
    this.cmd("Step");
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
    if (this.empty[candidateIndex]) {
      foundIndex = candidateIndex;
      break;
    } else {
      
      if (i == 0 && this.currentHashingTypeButtonState == this.doubleHashingButton) {
        this.resetSkipDist(elem, this.nextIndex++);
      }
    }
  }
  if (this.currentHashingTypeButtonState == this.doubleHashingButton) {
    this.cmd("Delete", --this.nextIndex);
  }
  return foundIndex;
};

ClosedHash.prototype.getElemIndex = function (index, elem) {
  if (this.currentHashingTypeButtonState == this.doubleHashingButton) {
    this.resetSkipDist(elem, this.nextIndex++);
  }
  var foundIndex = -1;
  for (var i = 0; i < this.table_size; i++) {
    var candidateIndex = (index + this.skipDist[i]) % this.table_size;
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
    this.cmd("SetMessage", `Probe slot ${candidateIndex} for element ${elem}`);
    this.cmd("Step");
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
    if (
      !this.empty[candidateIndex] &&
      this.hashTableValues[candidateIndex] == elem
    ) {
      foundIndex = candidateIndex;
      break;
    } else if (this.empty[candidateIndex] && !this.deleted[candidateIndex]) {
      break;
    }
  }
  if (this.currentHashingTypeButtonState == this.doubleHashingButton) {
    this.cmd("Delete", --this.nextIndex);
  }
  return foundIndex;
};

ClosedHash.prototype.deleteElement = function (elem) {
  this.commands = new Array();
  this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
  var index = this.doHash(elem);

  index = this.getElemIndex(index, elem);

  if (index > 0) {
    this.cmd(
      "SetText",
      this.ExplainLabel,
      "Deleting element: " + elem + "  Adding tombstone.",
    );
    this.empty[index] = true;
    this.deleted[index] = true;
    this.cmd("SetText", this.hashTableVisual[index], "<deleted>");
  } else {
    this.cmd(
      "SetText",
      this.ExplainLabel,
      "Deleting element: " + elem + "  Element not in table",
    );
  }
  return this.commands;
};
ClosedHash.prototype.findElement = function (elem) {
  this.commands = new Array();

  this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);
  var index = this.doHash(elem);

  var found = this.getElemIndex(index, elem) != -1;
  if (found) {
    this.cmd(
      "SetText",
      this.ExplainLabel,
      "Finding Element: " + elem + "  Found!",
    );
  } else {
    this.cmd(
      "SetText",
      this.ExplainLabel,
      "Finding Element: " + elem + "  Not Found!",
    );
  }
  return this.commands;
};

ClosedHash.prototype.setup = function () {
  this.table_size = CLOSED_HASH_TABLE_SIZE;
  this.skipDist = new Array(this.table_size);
  this.hashTableVisual = new Array(this.table_size);
  this.hashTableIndices = new Array(this.table_size);
  this.hashTableValues = new Array(this.table_size);

  this.indexXPos = new Array(this.table_size);
  this.indexYPos = new Array(this.table_size);

  this.empty = new Array(this.table_size);
  this.deleted = new Array(this.table_size);

  this.ExplainLabel = this.nextIndex++;

  this.commands = [];

  for (var i = 0; i < this.table_size; i++) {
    this.skipDist[i] = i; // Start with linear probing
    var nextID = this.nextIndex++;
    this.empty[i] = true;
    this.deleted[i] = false;

    var nextXPos =
      ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
    var nextYPos =
      ARRAY_ELEM_START_Y +
      Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
    this.cmd(
      "CreateRectangle",
      nextID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos,
    );
    this.hashTableVisual[i] = nextID;
    nextID = this.nextIndex++;
    this.hashTableIndices[i] = nextID;
    this.indexXPos[i] = nextXPos;
    this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;

    this.cmd("CreateLabel", nextID, i, this.indexXPos[i], this.indexYPos[i]);
    this.cmd("SetForegroundColor", nextID, INDEX_COLOR);
  }
  this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.resetIndex = this.nextIndex;
};

ClosedHash.prototype.resetAll = function () {
  this.commands = ClosedHash.superclass.resetAll.call(this);

  for (var i = 0; i < this.table_size; i++) {
    this.empty[i] = true;
    this.deleted[i] = false;
    this.cmd("SetText", this.hashTableVisual[i], "");
  }
  return this.commands;
  // Clear array, etc
};

// NEED TO OVERRIDE IN PARENT
ClosedHash.prototype.reset = function () {
  for (var i = 0; i < this.table_size; i++) {
    this.empty[i] = true;
    this.deleted[i] = false;
  }
  this.nextIndex = this.resetIndex;
  ClosedHash.superclass.reset.call(this);
};

function resetCallback(event) {}

ClosedHash.prototype.disableUI = function (event) {
  ClosedHash.superclass.disableUI.call(this);
  this.linearProblingButton.disabled = true;
  this.quadraticProbingButton.disabled = true;
  this.doubleHashingButton.disabled = true;
};

ClosedHash.prototype.enableUI = function (event) {
  ClosedHash.superclass.enableUI.call(this);
  this.linearProblingButton.disabled = false;
  this.quadraticProbingButton.disabled = false;
  this.doubleHashingButton.disabled = false;
};

var currentAlg;
