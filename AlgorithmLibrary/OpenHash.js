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
import { Algorithm, addRadioButtonGroupToAlgorithmBar, addControlToAlgorithmBar} from "./Algorithm.js";
import { Hash } from "./Hash.js";
import {
  describeOpenHashTable,
  describeOpenHashTableFromState,
} from "./DescribeHelpers.js";

export function OpenHash(canvas) {
  // New-style usage: `new OpenHash({ ...opts })` (preferred)
  // Legacy usage: `new OpenHash(canvas)`
  let am;
  let w;
  let h;

    const opts = canvas || {};
  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Open Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height,
    });
    w = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas || {};
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
      title: opts.title || "Open Hashing",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts,
    });
    w = viewWidth;
    h = viewHeight;
  }

  this.init(am, w, h);
  // If any initial data is a string, default to String Mode
  if (opts && Array.isArray(opts.initialData)) {
    const hasString = opts.initialData.some((d) => typeof d === "string");
    if (hasString) {
      // Use the wrapped callback to keep undo/redo semantics consistent
      this.changeHashTypeCallback(false);
    }
  }
  if(opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

var POINTER_ARRAY_ELEM_WIDTH = 50;
var POINTER_ARRAY_ELEM_HEIGHT = 30;
var POINTER_ARRAY_ELEM_START_X = 30;

var LINKED_ITEM_HEIGHT = 30;
var LINKED_ITEM_WIDTH = 50;

var LINKED_ITEM_Y_DELTA = 50;
var LINKED_ITEM_POINTER_PERCENT = 0.25;

var MAX_DATA_VALUE = 999;

var HASH_TABLE_SIZE = 13;

var ARRAY_Y_POS = 300;

var INDEX_COLOR = "#0000FF";

OpenHash.prototype = new Hash();
OpenHash.prototype.constructor = OpenHash;
OpenHash.superclass = Hash.prototype;

OpenHash.prototype.init = function (am, w, h) {
  var sc = OpenHash.superclass;
  var fn = sc.init;
  fn.call(this, am, w, h);
  this.nextIndex = 0;
  this.POINTER_ARRAY_ELEM_Y = ARRAY_Y_POS; // = h - POINTER_ARRAY_ELEM_WIDTH;
  this.setup();
};

OpenHash.prototype.addControls = function () {
  OpenHash.superclass.addControls.call(this);

  // Add new controls
};

OpenHash.prototype.beginOpenHashAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "OpenHash", operation, ...meta });
};

OpenHash.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "OpenHash",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

OpenHash.prototype.finishOpenHashAnimation = function () {
  return this.finishAnimation();
};

OpenHash.prototype.describe = function () {
  const buckets = [];
  for (let i = 0; i < this.table_size; i++) {
    const values = [];
    let node = this.hashTableValues[i];
    while (node != null) {
      values.push(String(node.data));
      node = node.next;
    }
    buckets.push(values);
  }

  return describeOpenHashTable(buckets, {
    tableSize: this.table_size,
  });
};

OpenHash.prototype.describeFromState = function (state) {
  return describeOpenHashTableFromState(state, this.hashTableVisual, {
    tableSize: this.table_size,
  });
};

OpenHash.prototype.insertElement = function (elem) {
  this.beginOpenHashAnimation("insert", `insert ${elem}`, { tags: ["insert"] });
  // this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
  this.cmd("SetMessage", "Inserting element: " + String(elem));
  var index = this.doHash(elem);
  this.markAnimationStep(`hash to bucket ${index}`, { tags: ["insert", "hash"] });
  var node = new LinkedListNode(elem, this.nextIndex++, 100, 75);
  this.cmd(
    "CreateLinkedList",
    node.graphicID,
    elem,
    LINKED_ITEM_WIDTH,
    LINKED_ITEM_HEIGHT,
    100,
    75,
  );
  if (
    this.hashTableValues[index] != null &&
    this.hashTableValues[index] != undefined
  ) {
    this.cmd("connect", node.graphicID, this.hashTableValues[index].graphicID);
    this.cmd(
      "disconnect",
      this.hashTableVisual[index],
      this.hashTableValues[index].graphicID,
    );
  } else {
    this.cmd("SetNull", node.graphicID, 1);
    this.cmd("SetNull", this.hashTableVisual[index], 0);
  }
  this.cmd("connect", this.hashTableVisual[index], node.graphicID);
  node.next = this.hashTableValues[index];
  this.hashTableValues[index] = node;

  this.beginBlock(`insert into bucket ${index}`, {
    source: "OpenHash",
    operation: this.currentAnimationOperation,
    tags: ["insert", "bucket"],
  });
  this.repositionList(index);

  // this.cmd("SetText", this.ExplainLabel, "");
  this.cmd("SetMessage", "");

  return this.finishOpenHashAnimation();
};

OpenHash.prototype.repositionList = function (index) {
  var startX = POINTER_ARRAY_ELEM_START_X + index * POINTER_ARRAY_ELEM_WIDTH;
  var startY = this.POINTER_ARRAY_ELEM_Y - LINKED_ITEM_Y_DELTA;
  var tmp = this.hashTableValues[index];
  while (tmp != null) {
    tmp.x = startX;
    tmp.y = startY;
    this.cmd("Move", tmp.graphicID, tmp.x, tmp.y);
    startY = startY - LINKED_ITEM_Y_DELTA;
    tmp = tmp.next;
  }
};

OpenHash.prototype.deleteElement = function (elem) {
  this.beginOpenHashAnimation("delete", `delete ${elem}`, { tags: ["delete"] });
  // this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
  this.cmd("SetMessage", "Deleting element: " + elem);
  var index = this.doHash(elem);
  this.markAnimationStep(`hash to bucket ${index}`, { tags: ["delete", "hash"] });
  if (this.hashTableValues[index] == null) {
    // this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");
    this.beginBlock(`bucket ${index} empty`, {
      source: "OpenHash",
      operation: this.currentAnimationOperation,
      tags: ["delete", "empty"],
    });
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
    return this.finishOpenHashAnimation();
  }
  this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 1);
  this.markAnimationStep(`inspect bucket ${index} head`, { tags: ["delete", "inspect"] });
  this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 0);
  if (this.hashTableValues[index].data == elem) {
    if (this.hashTableValues[index].next != null) {
      this.cmd(
        "Connect",
        this.hashTableVisual[index],
        this.hashTableValues[index].next.graphicID,
      );
    } else {
      this.cmd("SetNull", this.hashTableVisual[index], 1);
    }
    this.cmd("Delete", this.hashTableValues[index].graphicID);
    this.hashTableValues[index] = this.hashTableValues[index].next;
    this.beginBlock(`delete ${elem} from bucket ${index}`, {
      source: "OpenHash",
      operation: this.currentAnimationOperation,
      tags: ["delete", "found"],
    });
    this.repositionList(index);
    return this.finishOpenHashAnimation();
  }
  var tmpPrev = this.hashTableValues[index];
  var tmp = this.hashTableValues[index].next;
  var found = false;
  while (tmp != null && !found) {
    this.cmd("SetHighlight", tmp.graphicID, 1);
    this.markAnimationStep(`inspect chained node ${tmp.data}`, {
      focusNodeId: tmp.graphicID,
      tags: ["delete", "inspect"],
    });
    this.cmd("SetHighlight", tmp.graphicID, 0);
    if (tmp.data == elem) {
      found = true;
      // this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element deleted");
      this.cmd("SetMessage", "Deleting element: " + elem + "  Element deleted");
      if (tmp.next != null) {
        this.cmd("Connect", tmpPrev.graphicID, tmp.next.graphicID);
      } else {
        this.cmd("SetNull", tmpPrev.graphicID, 1);
      }
      tmpPrev.next = tmpPrev.next.next;
      this.cmd("Delete", tmp.graphicID);
      this.beginBlock(`delete ${elem} from bucket ${index}`, {
        source: "OpenHash",
        operation: this.currentAnimationOperation,
        tags: ["delete", "found"],
      });
      this.repositionList(index);
    } else {
      tmpPrev = tmp;
      tmp = tmp.next;
    }
  }
  if (!found) {
    // this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
  }
  if (!found) {
    this.beginBlock(`not found ${elem}`, {
      source: "OpenHash",
      operation: this.currentAnimationOperation,
      tags: ["delete", "not-found"],
    });
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
  }
  return this.finishOpenHashAnimation();
};
OpenHash.prototype.findElement = function (elem) {
  this.beginOpenHashAnimation("find", `find ${elem}`, { tags: ["search", "find"] });
  // this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);
  this.cmd("SetMessage", "Finding Element: " + elem);

  var index = this.doHash(elem);
  this.markAnimationStep(`hash to bucket ${index}`, { tags: ["search", "hash"] });
  var compareIndex = this.nextIndex++;
  var found = false;
  var tmp = this.hashTableValues[index];
  this.cmd("CreateLabel", compareIndex, "", 10, 40, 0);
  while (tmp != null && !found) {
    this.cmd("SetHighlight", tmp.graphicID, 1);
    if (tmp.data == elem) {
      this.cmd("SetText", compareIndex, tmp.data + "==" + elem);
      found = true;
    } else {
      this.cmd("SetText", compareIndex, tmp.data + "!=" + elem);
    }
    this.markAnimationStep(`inspect ${tmp.data}`, {
      focusNodeId: tmp.graphicID,
      tags: ["search", "inspect"],
    });
    this.cmd("SetHighlight", tmp.graphicID, 0);
    tmp = tmp.next;
  }
  if (found) {
    // this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem + "  Found!");
    this.beginBlock(`found ${elem}`, {
      source: "OpenHash",
      operation: this.currentAnimationOperation,
      tags: ["search", "found"],
    });
    this.cmd("SetMessage", "Finding Element: " + elem + "  Found!");
  } else {
    // this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem + "  Not Found!");
    this.beginBlock(`not found ${elem}`, {
      source: "OpenHash",
      operation: this.currentAnimationOperation,
      tags: ["search", "not-found"],
    });
    this.cmd("SetMessage", "Finding Element: " + elem + "  Not Found!");
  }
  this.cmd("Delete", compareIndex);
  this.nextIndex--;
  return this.finishOpenHashAnimation();
};

// Programmatic bindings
OpenHash.prototype.doInsert = function (value) {
  return this.implementAction(this.insertElement.bind(this), value);
};
OpenHash.prototype.doRemove = function (value) {
  return this.implementAction(this.deleteElement.bind(this), value);
};
OpenHash.prototype.doFind = function (value) {
  return this.implementAction(this.findElement.bind(this), value);
};
// Open hashing does not support grow; provide a no-op binding for API parity
OpenHash.prototype.doGrow = function (newSize) {
  return [];
};

OpenHash.prototype.setup = function () {
  this.hashTableVisual = new Array(HASH_TABLE_SIZE);
  this.hashTableIndices = new Array(HASH_TABLE_SIZE);
  this.hashTableValues = new Array(HASH_TABLE_SIZE);

  this.indexXPos = new Array(HASH_TABLE_SIZE);
  this.indexYPos = new Array(HASH_TABLE_SIZE);

  this.ExplainLabel = this.nextIndex++;

  this.table_size = HASH_TABLE_SIZE;

  this.commands = [];
  for (var i = 0; i < HASH_TABLE_SIZE; i++) {
    var nextID = this.nextIndex++;

    this.cmd(
      "CreateRectangle",
      nextID,
      "",
      POINTER_ARRAY_ELEM_WIDTH,
      POINTER_ARRAY_ELEM_HEIGHT,
      POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH,
      this.POINTER_ARRAY_ELEM_Y,
    );
    this.hashTableVisual[i] = nextID;
    this.cmd("SetNull", this.hashTableVisual[i], 1);

    nextID = this.nextIndex++;
    this.hashTableIndices[i] = nextID;
    this.indexXPos[i] =
      POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH;
    this.indexYPos[i] = this.POINTER_ARRAY_ELEM_Y + POINTER_ARRAY_ELEM_HEIGHT;
    this.hashTableValues[i] = null;

    this.cmd("CreateLabel", nextID, i, this.indexXPos[i], this.indexYPos[i]);
    this.cmd("SetForegroundColor", nextID, INDEX_COLOR);
  }
  this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.resetIndex = this.nextIndex;
};

OpenHash.prototype.resetAll = function () {
  var tmp;
  this.commands = OpenHash.superclass.resetAll.call(this);
  for (var i = 0; i < this.hashTableValues.length; i++) {
    tmp = this.hashTableValues[i];
    if (tmp != null) {
      while (tmp != null) {
        this.cmd("Delete", tmp.graphicID);
        tmp = tmp.next;
      }
      this.hashTableValues[i] = null;
      this.cmd("SetNull", this.hashTableVisual[i], 1);
    }
  }
  return this.commands;
};

// NEED TO OVERRIDE IN PARENT
OpenHash.prototype.reset = function () {
  for (var i = 0; i < this.table_size; i++) {
    this.hashTableValues[i] = null;
  }
  this.nextIndex = this.resetIndex;
  OpenHash.superclass.reset.call(this);
};

OpenHash.prototype.resetCallback = function (event) {};

/*this.nextIndex = 0;
 this.commands = [];
 this.cmd("CreateLabel", 0, "", 20, 50, 0);
 this.animationManager.StartNewAnimation(this.commands);
 this.animationManager.skipForward();
 this.animationManager.clearHistory(); */

OpenHash.prototype.disableUI = function (event) {
  var sc = OpenHash.superclass;
  var fn = sc.disableUI;
  fn.call(this);
};

OpenHash.prototype.enableUI = function (event) {
  OpenHash.superclass.enableUI.call(this);
};

function LinkedListNode(val, id, initialX, initialY) {
  this.data = val;
  this.graphicID = id;
  this.x = initialX;
  this.y = initialY;
  this.next = null;
}

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new OpenHash(animManag, canvas.width, canvas.height);
}
