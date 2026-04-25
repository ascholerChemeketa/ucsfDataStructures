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

export function HeapSort(arg) {
  // New-style usage: `new HeapSort({ ...opts })` (preferred)
  // Legacy usage: `new HeapSort(canvas)`
  let am;
  if (arg && typeof arg.getContext === "function") {
    am = initCanvas(arg);
  } else {
    const opts = arg || {};
    am = initAnimationManager({
      title: opts.title || "Heap Sort",
      height: opts.height || 500,
      ...opts,
    });
  }
  this.init(am);
}

HeapSort.prototype = new Algorithm();
HeapSort.prototype.constructor = HeapSort;
HeapSort.superclass = Algorithm.prototype;

var ARRAY_SIZE = 15;
var ARRAY_ELEM_WIDTH = 30;
var ARRAY_ELEM_HEIGHT = 25;
var ARRAY_INITIAL_X = 30;

var ARRAY_Y_POS = 50;
var ARRAY_LABEL_Y_POS = 70;

var DEFAULT_ARRAY_BACKGROUND = "#FFFFFF";
var SORTED_ARRAY_BACKGROUND = "#bdbdbdff";

// 0-based heap: indices 0..(HEAP_CAPACITY-1)
var HEAP_CAPACITY = ARRAY_SIZE;
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

HeapSort.prototype.init = function (am) {
  var sc = HeapSort.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;
  // this.HeapXPositions = [
  //   0, 450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600, 700,
  //   800, 75, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575, 625, 675, 725,
  //   775, 825,
  // ];
  // this.HeapYPositions = [
  //   0, 100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310, 310,
  //   310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380,
  //   380, 380,
  // ];
  
  const heapRootX = ARRAY_INITIAL_X + HEAP_ROOT_UNDER_ARRAY_INDEX * ARRAY_ELEM_WIDTH;
  this.HeapXPositions = buildHeapXPositions(heapRootX);
  this.HeapYPositions = buildHeapYPositions();

  this.commands = [];
  this.createArray();

  // Programmatic action bindings (used by tests / external controllers)
  this.doHeapify = function () {
    this.implementAction(this.heapify.bind(this), "");
  };
  this.doSort = function () {
    this.implementAction(this.heapsort.bind(this), "");
  };

  // Heapification status: only allow Heap Sort after Heapify
  this.isHeapified = false;
  this.heapsortButton.disabled = true;

  /*this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 50, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory(); */
};

HeapSort.prototype.addControls = function () {
  this.randomizeArrayButton = addControlToAlgorithmBar(
    "Button",
    "Randomize Array",
  );
  this.randomizeArrayButton.onclick = this.randomizeCallback.bind(this);
  this.heapifyButton = addControlToAlgorithmBar("Button", "Heapify");
  this.heapifyButton.onclick = this.heapifyCallback.bind(this);
  this.heapsortButton = addControlToAlgorithmBar("Button", "Heap Sort");
  this.heapsortButton.onclick = this.heapsortCallback.bind(this);
};

HeapSort.prototype.beginHeapSortAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "HeapSort", operation, ...meta });
};

HeapSort.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "HeapSort",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

HeapSort.prototype.finishHeapSortAnimation = function () {
  return this.finishAnimation();
};

HeapSort.prototype.createArray = function () {
  this.arrayData = new Array(ARRAY_SIZE);
  this.arrayLabels = new Array(ARRAY_SIZE);
  this.arrayRects = new Array(ARRAY_SIZE);
  this.circleObjs = new Array(ARRAY_SIZE);
  this.ArrayXPositions = new Array(ARRAY_SIZE);
  this.oldData = new Array(ARRAY_SIZE);
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;

  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.oldData[i] = this.arrayData[i];

    this.ArrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH;
    this.arrayLabels[i] = this.nextIndex++;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      this.arrayData[i],
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      this.ArrayXPositions[i],
      ARRAY_Y_POS,
    );
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
    this.cmd(
      "CreateLabel",
      this.arrayLabels[i],
      i,
      this.ArrayXPositions[i],
      ARRAY_LABEL_Y_POS,
    );
    this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
  }
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  this.cmd("CreateLabel", this.descriptLabel1, "", 20, 40, 0);
  //this.cmd("CreateLabel", this.descriptLabel2, "", this.nextIndex, 40, 120, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

HeapSort.prototype.heapsortCallback = function (event) {
  this.implementAction(this.heapsort.bind(this), "");
};

HeapSort.prototype.heapifyCallback = function (event) {
  this.implementAction(this.heapify.bind(this), "");
};

HeapSort.prototype.randomizeCallback = function (ignored) {
  this.implementAction(this.randomizeArray.bind(this), "");
};

HeapSort.prototype.randomizeArray = function () {
  this.beginHeapSortAnimation("randomize", "randomize array", {
    tags: ["randomize"],
  });
  this.clearHeapDrawing();
  this.isHeapified = false;
  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
    this.oldData[i] = this.arrayData[i];
  }
  this.markAnimationStep("randomization complete", { tags: ["randomize", "complete"] });
  return this.finishHeapSortAnimation();
};

HeapSort.prototype.reset = function () {
  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.arrayData[i] = this.oldData[i];
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
  }
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;
  this.commands = new Array();
};

HeapSort.prototype.heapsort = function (ignored) {
  this.beginHeapSortAnimation("sort", "heap sort", {
    tags: ["sort", "heap"],
  });

  // Only enabled when heapified; keep as a safety check.
  if (!this.isHeapified) {
    this.cmd(
      "SetMessage",
      "Heap Sort is disabled until the array is heapified.",
    );
    this.markAnimationStep("heap not heapified", { tags: ["sort", "blocked"] });
    return this.finishHeapSortAnimation();
  }

  // Data is already heapified; do NOT rebuild the heap here.
  // Reset any prior sorted highlighting.
  for (var a = 0; a < ARRAY_SIZE; a++) {
    this.cmd("SetAlpha", this.arrayRects[a], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[a], DEFAULT_ARRAY_BACKGROUND);
  }

  this.cmd("SetMessage", "Starting heapsort...");
  this.markAnimationStep("start heapsort", { tags: ["sort", "start"] });

  for (var i = ARRAY_SIZE - 1; i > 0; i--) {
    this.cmd("SetMessage", "Removing max value");
    this.markAnimationStep(`swap root with index ${i}`, {
      focusNodeId: this.circleObjs[0],
      tags: ["sort", "extract"],
    });
    this.swap(i, 0);
    
  this.cmd("SetMessage", "Reduce logical heap size by 1");
    this.cmd("SetBackgroundColor", this.arrayRects[i], SORTED_ARRAY_BACKGROUND);
    this.cmd("Delete", this.circleObjs[i]);
    this.currentHeapSize = i;
    
    this.markAnimationStep(`lock index ${i} in sorted suffix`, {
      tags: ["sort", "sorted-suffix"],
    });
    this.pushDown(0);
  }
  // After the final extraction, index 0 is also in sorted position.
  this.beginBlock("heapsort complete", {
    source: "HeapSort",
    operation: this.currentAnimationOperation,
    tags: ["sort", "complete"],
  });
  this.cmd("SetBackgroundColor", this.arrayRects[0], SORTED_ARRAY_BACKGROUND);
  this.cmd("Delete", this.circleObjs[0]);
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;
  this.cmd("SetMessage", "Heapsort complete");
  return this.finishHeapSortAnimation();
};

HeapSort.prototype.heapify = function (ignored) {
  this.beginHeapSortAnimation("heapify", "heapify array", {
    tags: ["heapify"],
  });
  this.clearHeapDrawing();
  this.isHeapified = false;
  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
  }
  this.buildHeap("");
  this.beginBlock("heapify complete", {
    source: "HeapSort",
    operation: this.currentAnimationOperation,
    tags: ["heapify", "complete"],
  });
  this.cmd("SetMessage", "Heapify complete: array now satisfies heap order");
  this.isHeapified = true;
  return this.finishHeapSortAnimation();
};

HeapSort.prototype.clearHeapDrawing = function () {
  if (!this.heapDrawn) {
    this.currentHeapSize = 0;
    return;
  }
  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.cmd("Delete", this.circleObjs[i]);
  }
  this.currentHeapSize = 0;
  this.heapDrawn = false;
};

HeapSort.prototype.swap = function (index1, index2) {
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
  this.cmd(
    "SetMessage",
    "Swap: values between indices " + index1 + " and " + index2,
  );
  this.markAnimationStep(`swap ${index1} and ${index2}`, {
    tags: ["swap"],
  });
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};

HeapSort.prototype.setIndexHighlight = function (index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};

HeapSort.prototype.pushDown = function (index) {
  var largestIndex;

  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (left >= this.currentHeapSize) {
      return;
    }
    this.cmd(
        "SetMessage",
        "Heapify down at " + index,
      );
      this.setIndexHighlight(index, 1);
      this.markAnimationStep(`push down from index ${index}`, {
        focusNodeId: this.circleObjs[index],
        tags: ["heapify", "push-down"],
      });
      this.setIndexHighlight(index, 0);

    largestIndex = left;

    if (right < this.currentHeapSize) {
      this.cmd(
        "SetMessage",
        "Heapify down: compare left and right children to choose the larger child",
      );
      this.setIndexHighlight(left, 1);
      this.setIndexHighlight(right, 1);
      this.markAnimationStep(`compare children of index ${index}`, {
        focusNodeId: this.circleObjs[index],
        tags: ["heapify", "compare", "children"],
      });
      this.setIndexHighlight(left, 0);
      this.setIndexHighlight(right, 0);
      if (this.arrayData[right] > this.arrayData[left]) {
        largestIndex = right;
      }
    }
    this.cmd(
      "SetMessage",
      "Heapify down: compare current node with selected child",
    );
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(largestIndex, 1);
    this.markAnimationStep(`compare index ${index} with child ${largestIndex}`, {
      focusNodeId: this.circleObjs[index],
      tags: ["heapify", "compare", "parent-child"],
    });
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(largestIndex, 0);

    if (this.arrayData[largestIndex] > this.arrayData[index]) {
      this.swap(largestIndex, index);
      index = largestIndex;
    } else {
      return;
    }
  }
};

HeapSort.prototype.buildHeap = function (ignored) {
  for (var i = 0; i < ARRAY_SIZE; i++) {
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

  this.currentHeapSize = ARRAY_SIZE;
  var nextElem = Math.floor((this.currentHeapSize - 2) / 2);
  this.cmd(
    "SetMessage",
    "Heapify: Calculate parent index of last element: " + nextElem,
  );
  this.markAnimationStep("build heap drawing", { tags: ["heapify", "build"] });
  this.heapDrawn = true;
  while (nextElem >= 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};

HeapSort.prototype.disableUI = function (event) {
  this.heapsortButton.disabled = true;
  this.randomizeArrayButton.disabled = true;
  this.heapifyButton.disabled = true;
};

HeapSort.prototype.enableUI = function (event) {
  this.heapsortButton.disabled = !this.isHeapified;
  this.randomizeArrayButton.disabled = false;
  this.heapifyButton.disabled = false;
};
