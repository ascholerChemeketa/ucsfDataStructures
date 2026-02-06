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
import { Algorithm, addControlToAlgorithmBar } from "./Algorithm.js";

export function HeapMax(arg) {
  // New-style usage: `new Heap({ ...opts })` (preferred)
  // Legacy usage: `new Heap(canvas)`
  let am;
  // if (arg && typeof arg.getContext === "function") {
  //   am = initCanvas(arg);
  // } else {
    const opts = arg || {};
    am = initAnimationManager({
      title: opts.title || "Max Heap",
      height: opts.height || 500,
      ...opts,
    });
  // }
  this.init(am);
  
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}

HeapMax.prototype = new Algorithm();
HeapMax.prototype.constructor = HeapMax;
HeapMax.superclass = Algorithm.prototype;

var ARRAY_SIZE = 15;
var ARRAY_ELEM_WIDTH = 30;
var ARRAY_ELEM_HEIGHT = 25;
var ARRAY_INITIAL_X = 30;

// 0-based heap: indices 0..(HEAP_CAPACITY-1)
var HEAP_CAPACITY = ARRAY_SIZE;

var ARRAY_Y_POS = 50;
var ARRAY_LABEL_Y_POS = 70;

// Align the heap-tree root (index 0) under this array slot label.
// (Array slots are labeled 0..(ARRAY_SIZE-1), so "5th element" here means the slot labeled 5.)
var HEAP_ROOT_UNDER_ARRAY_INDEX = 7;

function buildHeapXPositions(rootX) {
  // 0-based heap indices: 0..30 => depths 0..4.
  // Use offsets that keep the leftmost node >= 0 when rootX is ~180.
  const offsetsByDepth = [0, 96, 48, 24, 12];
  const xPositions = new Array(ARRAY_SIZE);
  for (let i = 0; i < ARRAY_SIZE; i++) xPositions[i] = 0;

  xPositions[0] = rootX;
  for (let i = 1; i < HEAP_CAPACITY; i++) {
    const parent = Math.floor((i - 1) / 2);
    const depth = Math.floor(Math.log2(i + 1));
    const offset = offsetsByDepth[depth] || 0;
    // For 0-based heaps, left child is odd (2p+1) and right child is even (2p+2).
    const isRight = i % 2 === 0;
    xPositions[i] = xPositions[parent] + (isRight ? offset : -offset);
  }
  return xPositions;
}

function buildHeapYPositions() {
  const yPositions = new Array(ARRAY_SIZE);
  for (let i = 0; i < ARRAY_SIZE; i++) yPositions[i] = 0;

  // Match the old levels: root=100, then +70 per depth.
  for (let i = 0; i < HEAP_CAPACITY; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    yPositions[i] = 120 + depth * 70;
  }
  return yPositions;
}

HeapMax.prototype.init = function (am) {
  var sc = HeapMax.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;
  const heapRootX = ARRAY_INITIAL_X + HEAP_ROOT_UNDER_ARRAY_INDEX * ARRAY_ELEM_WIDTH;
  this.HeapXPositions = buildHeapXPositions(heapRootX);
  this.HeapYPositions = buildHeapYPositions();
  this.commands = [];
  this.createArray();

  // Programmatic action bindings (used by tests / external controllers)
  this.doInsert = function (val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doRemove = function () {
    this.implementAction(this.removeLargest.bind(this), "");
  };
  this.doBuildHeap = function () {
    this.implementAction(this.buildHeap.bind(this), "");
  };

  /*this.nextIndex = 0;
\tthis.this.commands = [];
\tthis.cmd("CreateLabel", 0, "", 20, 50, 0);
\tthis.animationManager.StartNewAnimation(this.this.commands);
\tthis.animationManager.skipForward();
\tthis.animationManager.clearHistory(); */
};

HeapMax.prototype.addControls = function () {
  this.insertField = addControlToAlgorithmBar("Text", "");
  this.insertField.setAttribute("placeholder", "Value to insert");
  this.insertField.onkeydown = this.returnSubmit(
    this.insertField,
    this.insertCallback.bind(this),
    4,
    true,
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.removeLargestButton = addControlToAlgorithmBar(
    "Button",
    "Remove Max",
  );
  this.removeLargestButton.onclick = this.removeLargestCallback.bind(this);
  this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
  this.clearHeapButton.onclick = this.clearCallback.bind(this);
  this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
  this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
};

HeapMax.prototype.createArray = function () {
  this.arrayData = new Array(ARRAY_SIZE);
  this.arrayLabels = new Array(ARRAY_SIZE);
  this.arrayRects = new Array(ARRAY_SIZE);
  this.circleObjs = new Array(ARRAY_SIZE);
  this.ArrayXPositions = new Array(ARRAY_SIZE);
  this.currentHeapSize = 0;

  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.ArrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH;
    this.arrayLabels[i] = this.nextIndex++;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      this.ArrayXPositions[i],
      ARRAY_Y_POS,
    );
    this.cmd(
      "CreateLabel",
      this.arrayLabels[i],
      i,
      this.ArrayXPositions[i],
      ARRAY_LABEL_Y_POS,
    );
    this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
  }
  // 0-based heap: slot 0 holds the root value; no sentinel.
  this.cmd("SetText", this.arrayRects[0], "");
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  // Left-align status text with the left edge of the array (not centered on slot 0).
  this.cmd(
    "CreateLabel",
    this.descriptLabel1,
    "",
    ARRAY_INITIAL_X - ARRAY_ELEM_WIDTH / 2,
    10,
    0,
  );
  //this.cmd("CreateLabel", this.descriptLabel2, "", this.nextIndex, 40, 120, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

HeapMax.prototype.insertCallback = function (event) {
  var insertedValue;

  insertedValue = this.normalizeNumber(this.insertField.value, 4);
  if (insertedValue != "") {
    this.insertField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

//TODO:  Make me undoable!!
HeapMax.prototype.clearCallback = function (event) {
  this.commands = new Array();
  this.implementAction(this.clear.bind(this), "");
};

//TODO:  Make me undoable!!
HeapMax.prototype.clear = function () {
  for (let i = 0; i < this.currentHeapSize; i++) {
    this.cmd("Delete", this.circleObjs[i]);
    this.cmd("SetText", this.arrayRects[i], "");
  }
  this.currentHeapSize = 0;
  return this.commands;
};

HeapMax.prototype.reset = function () {
  this.currentHeapSize = 0;
};

HeapMax.prototype.removeLargestCallback = function (event) {
  this.implementAction(this.removeLargest.bind(this), "");
};

HeapMax.prototype.swap = function (index1, index2) {
  this.cmd("SetText", this.arrayRects[index1], "");
  this.cmd("SetText", this.arrayRects[index2], "");
  this.cmd("SetText", this.circleObjs[index1], "");
  this.cmd("SetText", this.circleObjs[index2], "");
  this.cmd(
    "CreateLabel",
    this.swapLabel1,
    this.arrayData[index1],
    this.ArrayXPositions[index1],
    ARRAY_Y_POS,
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel2,
    this.arrayData[index2],
    this.ArrayXPositions[index2],
    ARRAY_Y_POS,
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel3,
    this.arrayData[index1],
    this.HeapXPositions[index1],
    this.HeapYPositions[index1],
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel4,
    this.arrayData[index2],
    this.HeapXPositions[index2],
    this.HeapYPositions[index2],
  );
  this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2], ARRAY_Y_POS);
  this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1], ARRAY_Y_POS);
  this.cmd(
    "Move",
    this.swapLabel3,
    this.HeapXPositions[index2],
    this.HeapYPositions[index2],
  );
  this.cmd(
    "Move",
    this.swapLabel4,
    this.HeapXPositions[index1],
    this.HeapYPositions[index1],
  );
  var tmp = this.arrayData[index1];
  this.arrayData[index1] = this.arrayData[index2];
  this.arrayData[index2] = tmp;
  this.cmd("Step");
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};

HeapMax.prototype.setIndexHighlight = function (index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};

HeapMax.prototype.pushDown = function (index, narrateComparisons) {
  var largestIndex;

  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    
      if (narrateComparisons) {
        this.cmd("SetMessage", "Heapifying down at index " + index);
      this.setIndexHighlight(index, 1);
        this.cmd("Step");
      }
      this.setIndexHighlight(index, 0);

    if (left >= this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd("SetMessage", "No children: value is in its final location");
        this.cmd("Step");
      }
      return;
    }

    largestIndex = left;

    if (right < this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Compare left and right children to find the larger child",
        );
      }
      this.setIndexHighlight(left, 1);
      this.setIndexHighlight(right, 1);
      this.cmd("Step");
      this.setIndexHighlight(left, 0);
      this.setIndexHighlight(right, 0);
      if (Number(this.arrayData[right]) > Number(this.arrayData[left])) {
        largestIndex = right;
      }
    }

    if (narrateComparisons) {
      this.cmd(
        "SetMessage",
        "Compare the current value with the larger child",
      );
    }
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(largestIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(largestIndex, 0);

    if (Number(this.arrayData[largestIndex]) > Number(this.arrayData[index])) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Child is larger than current: swap and continue pushing down",
        );
      }
      this.swap(largestIndex, index);
      index = largestIndex;
    } else {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Current value is >= its children: heap order restored",
        );
      }
      return;
    }
  }
};

HeapMax.prototype.removeLargest = function (dummy) {
  this.commands = new Array();
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Remove largest (max): check if heap is empty");

  if (this.currentHeapSize == 0) {
    this.cmd(
      "SetText",
      this.descriptLabel1,
      "Heap is empty, cannot remove largest element",
    );
    this.cmd("SetMessage", "Heap is empty; nothing to remove");
    return this.commands;
  }

  this.cmd("SetMessage", "Largest element is at the root");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Removing element:" + this.arrayData[0],
  );
  this.cmd("Step");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Removing element: " + this.arrayData[0],
  );
  if (this.currentHeapSize > 1) {
    const lastIndex = this.currentHeapSize - 1;
    this.cmd("SetMessage", "Move last element to the root");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.swap(0, lastIndex);
    this.cmd("SetMessage", "Delete the old last node");
    this.cmd("Delete", this.circleObjs[lastIndex]);
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.arrayData[lastIndex] = "";
    this.currentHeapSize--;
  this.cmd("Step");
    this.cmd("SetMessage", "Push down to restore heap order");
    this.pushDown(0, true);
  } else {
    this.cmd("SetMessage", "Heap had one element; delete it");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("Delete", this.circleObjs[0]);
    this.arrayData[0] = "";
    this.currentHeapSize--;
  }
  this.cmd("SetMessage", "");
  return this.commands;
};

HeapMax.prototype.buildHeapCallback = function (event) {
  this.implementAction(this.buildHeap.bind(this), "");
};

HeapMax.prototype.buildHeap = function (ignored) {
  this.commands = [];
  this.clear();
  for (var i = 0; i < HEAP_CAPACITY; i++) {
    const randVal = Math.floor(Math.random() * 100) + 1;
    this.arrayData[i] = this.normalizeNumber(String(randVal), 4);
    this.cmd(
      "CreateCircle",
      this.circleObjs[i],
      this.arrayData[i],
      this.HeapXPositions[i],
      this.HeapYPositions[i],
    );
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    if (i > 0) {
      this.cmd(
        "Connect",
        this.circleObjs[Math.floor((i - 1) / 2)],
        this.circleObjs[i],
      );
    }
  }
  this.cmd("Step");
  this.currentHeapSize = HEAP_CAPACITY;
  var nextElem = this.currentHeapSize - 1;
  while (nextElem >= 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};

HeapMax.prototype.insertElement = function (insertedValue) {
  this.commands = new Array();

  if (this.currentHeapSize >= HEAP_CAPACITY) {
    this.cmd("SetText", this.descriptLabel1, "Heap Full!");
    this.cmd("SetMessage", "Heap is full; cannot insert");
    return this.commands;
  }

  this.cmd("SetMessage", "Insert: place new value at the next open spot");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Inserting Element: " + insertedValue,
  );
  this.cmd("Step");
  this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
  const insertIndex = this.currentHeapSize;
  this.currentHeapSize++;
  this.arrayData[insertIndex] = insertedValue;
  this.cmd(
    "CreateCircle",
    this.circleObjs[insertIndex],
    "",
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex],
  );
  this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45, 1);
  if (insertIndex > 0) {
    // this.cmd("SetMessage", "Connect new node to its parent");
    this.cmd(
      "Connect",
      this.circleObjs[Math.floor((insertIndex - 1) / 2)],
      this.circleObjs[insertIndex],
    );
  }
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);

  // this.cmd("SetMessage", "Move value label into the new node");
  this.cmd(
    "Move",
    this.descriptLabel2,
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex],
  );
  this.cmd("Step");
  this.cmd("SetText", this.circleObjs[insertIndex], insertedValue);
  this.cmd("delete", this.descriptLabel2);
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);

  var currentIndex = insertIndex;
  var parentIndex = Math.floor((currentIndex - 1) / 2);

  if (currentIndex > 0) {
    this.cmd("SetMessage", "Compare with parent");
    this.setIndexHighlight(currentIndex, 1);
    this.setIndexHighlight(parentIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(currentIndex, 0);
    this.setIndexHighlight(parentIndex, 0);
  }

  while (
    currentIndex > 0 &&
    Number(this.arrayData[currentIndex]) > Number(this.arrayData[parentIndex])
  ) {
    this.cmd("SetMessage", "Swap with parent to restore heap order");
    this.swap(currentIndex, parentIndex);
    currentIndex = parentIndex;
    parentIndex = Math.floor((parentIndex - 1) / 2);
    if (currentIndex > 0) {
      this.cmd("SetMessage", "Compare with parent");
      this.setIndexHighlight(currentIndex, 1);
      this.setIndexHighlight(parentIndex, 1);
      this.cmd("Step");
      this.setIndexHighlight(currentIndex, 0);
      this.setIndexHighlight(parentIndex, 0);
    }
  }
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Insertion complete");

  return this.commands;
};

HeapMax.prototype.disableUI = function (event) {
  this.insertField.disabled = true;
  this.insertButton.disabled = true;
  this.removeLargestButton.disabled = true;
  this.clearHeapButton.disabled = true;
  this.buildHeapButton.disabled = true;
};

HeapMax.prototype.enableUI = function (event) {
  this.insertField.disabled = false;
  this.insertButton.disabled = false;
  this.removeLargestButton.disabled = false;
  this.clearHeapButton.disabled = false;
  this.buildHeapButton.disabled = false;
};
