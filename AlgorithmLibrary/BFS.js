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
import { Graph, VERTEX_INDEX_COLOR } from "./Graph.js";

import {
  addControlToAlgorithmBar,
  addLabelToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 50;

var VISITED_START_X = 175;
var PARENT_START_X = 250;

var HIGHLIGHT_CIRCLE_COLOR = "#9c0303ff";
var BFS_TREE_COLOR = "#0000FF";
var BFS_QUEUE_HEAD_COLOR = "#0000FF";

var QUEUE_START_X = 30;
var QUEUE_START_Y = 40;
var QUEUE_SPACING = 30;

export function BFS(canvas) {
  // New-style usage: `new BFS({ ...opts })` (preferred)
  // Legacy usage: `new BFS(canvas)`
  let am;
  let w;
  let h;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Breadth-First Search", false, {
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
      title: opts.title || "Breadth-First Search",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts,
    });
    w = viewWidth;
    h = viewHeight;
  }

  this.init(am, w, h);
}

BFS.prototype = new Graph();
BFS.prototype.constructor = BFS;
BFS.superclass = Graph.prototype;

BFS.prototype.addControls = function () {
  addLabelToAlgorithmBar("Start Vertex: ");
  this.startField = addControlToAlgorithmBar("Text", "");
  this.startField.setAttribute("placeholder", "Vertex #");
  this.startField.onkeydown = this.returnSubmit(
    this.startField,
    this.startCallback.bind(this),
    2,
    true,
  );
  this.startField.size = 2;
  this.startButton = addControlToAlgorithmBar("Button", "Run BFS");
  this.startButton.onclick = this.startCallback.bind(this);
  BFS.superclass.addControls.call(this);
};

BFS.prototype.init = function (am, w, h) {
  this.showEdgeCosts = false;
  BFS.superclass.init.call(this, am, w, h); // TODO:  add no edge label flag to this?
  // Setup called in base class constructor
};

BFS.prototype.setup = function () {
  BFS.superclass.setup.call(this);
  this.messageID = new Array();
  this.commands = new Array();
  this.visitedID = new Array(this.size);
  this.visitedIndexID = new Array(this.size);
  this.parentID = new Array(this.size);
  this.parentIndexID = new Array(this.size);

  for (var i = 0; i < this.size; i++) {
    this.visitedID[i] = this.nextIndex++;
    this.visitedIndexID[i] = this.nextIndex++;
    this.parentID[i] = this.nextIndex++;
    this.parentIndexID[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.visitedID[i],
      "F",
      AUX_ARRAY_WIDTH,
      AUX_ARRAY_HEIGHT,
      VISITED_START_X,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd(
      "CreateLabel",
      this.visitedIndexID[i],
      i,
      VISITED_START_X - AUX_ARRAY_WIDTH,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd("SetForegroundColor", this.visitedIndexID[i], VERTEX_INDEX_COLOR);
    this.cmd(
      "CreateRectangle",
      this.parentID[i],
      "",
      AUX_ARRAY_WIDTH,
      AUX_ARRAY_HEIGHT,
      PARENT_START_X,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd(
      "CreateLabel",
      this.parentIndexID[i],
      i,
      PARENT_START_X - AUX_ARRAY_WIDTH,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd("SetForegroundColor", this.parentIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Parent",
    PARENT_START_X - AUX_ARRAY_WIDTH,
    AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
    0,
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Visited",
    VISITED_START_X - AUX_ARRAY_WIDTH,
    AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
    0,
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "BFS Queue",
    QUEUE_START_X,
    QUEUE_START_Y - 30,
    0,
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
};

BFS.prototype.startCallback = function (event) {
  var startvalue;

  if (this.startField.value != "") {
    startvalue = this.startField.value;
    this.startField.value = "";
    if (parseInt(startvalue) < this.size)
      this.implementAction(this.doBFS.bind(this), startvalue);
  }
};

BFS.prototype.doBFS = function (startVetex) {
  this.visited = new Array(this.size);
  this.parent = new Array(this.size);
  this.commands = new Array();
  this.queue = new Array(this.size);
  var head = 0;
  var tail = 0;
  var queueID = new Array(this.size);
  var queueSize = 0;

  if (this.messageID != null) {
    for (var i = 0; i < this.messageID.length; i++) {
      this.cmd("Delete", this.messageID[i]);
    }
  }

  this.rebuildEdges();
  this.messageID = new Array();
  for (i = 0; i < this.size; i++) {
    this.cmd("SetText", this.visitedID[i], "f");
    this.cmd("SetText", this.parentID[i], "");
    this.visited[i] = false;
    this.parent[i] = -1;
    queueID[i] = this.nextIndex++;
  }
  var vertex = parseInt(startVetex);
  this.visited[vertex] = true;
  this.parent[vertex] = -1;
  this.queue[tail] = vertex;
  this.cmd(
    "CreateLabel",
    queueID[tail],
    vertex,
    QUEUE_START_X,
    QUEUE_START_Y + queueSize * QUEUE_SPACING,
  );
  queueSize = queueSize + 1;
  tail = (tail + 1) % this.size;

  while (queueSize > 0) {
    vertex = this.queue[head];
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleL,
      HIGHLIGHT_CIRCLE_COLOR,
      this.x_pos_logical[vertex],
      this.y_pos_logical[vertex],
    );
    this.cmd("SetLayer", this.highlightCircleL, 1);
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleAL,
      HIGHLIGHT_CIRCLE_COLOR,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + vertex * this.adj_list_height,
    );
    this.cmd("SetLayer", this.highlightCircleAL, 2);
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleAM,
      HIGHLIGHT_CIRCLE_COLOR,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + vertex * this.adj_matrix_height,
    );
    this.cmd("SetLayer", this.highlightCircleAM, 3);

    this.cmd("SetTextColor", queueID[head], BFS_QUEUE_HEAD_COLOR);

    this.cmd("SetMessage", `Explore node at front of queue (${vertex}).`);
    this.cmd("Step");

    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[vertex][neighbor] > 0) {
        this.highlightEdge(vertex, neighbor, 1);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        this.cmd("SetMessage", `Explore edge ${vertex} -> ${neighbor} (check whether ${neighbor} is unvisited).`);
        this.cmd("Step");
        if (!this.visited[neighbor]) {
          this.visited[neighbor] = true;
          this.parent[neighbor] = vertex;
          this.cmd("SetText", this.visitedID[neighbor], "T");
          this.cmd("SetText", this.parentID[neighbor], vertex);
          this.highlightEdge(vertex, neighbor, 0);
          this.cmd(
            "Disconnect",
            this.circleID[vertex],
            this.circleID[neighbor],
          );
          this.cmd(
            "Connect",
            this.circleID[vertex],
            this.circleID[neighbor],
            BFS_TREE_COLOR,
            this.curve[vertex][neighbor],
            1,
            "",
          );
          this.queue[tail] = neighbor;
          this.cmd(
            "CreateLabel",
            queueID[tail],
            neighbor,
            QUEUE_START_X,
            QUEUE_START_Y + queueSize * QUEUE_SPACING,
          );
          tail = (tail + 1) % this.size;
          queueSize = queueSize + 1;
          this.cmd(
            "SetMessage",
            `Discovered ${neighbor}; set parent to ${vertex}, add to BFS tree, and enqueue ${neighbor}.`,
          );
        } else {
          this.highlightEdge(vertex, neighbor, 0);
          this.cmd("SetMessage", `Neighbor ${neighbor} was already visited; ignore this edge.`);
        }
        this.cmd("Step");
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);
        this.cmd("Step");
      }
    }
    this.cmd("Delete", queueID[head]);
    head = (head + 1) % this.size;
    queueSize = queueSize - 1;
    for (i = 0; i < queueSize; i++) {
      var nextQueueIndex = (i + head) % this.size;
      this.cmd(
        "Move",
        queueID[nextQueueIndex],
        QUEUE_START_X,
        QUEUE_START_Y + i * QUEUE_SPACING,
      );
    }

    this.cmd("Delete", this.highlightCircleL);
    this.cmd("Delete", this.highlightCircleAM);
    this.cmd("Delete", this.highlightCircleAL);

  this.cmd("SetMessage", "BFS complete. Search tree highlighted.");
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.highlightEdge(this.parent[i], i, 1);
    }
  }
  this.cmd("Step");
    
          this.cmd("SetMessage", `Done exploring ${vertex}.`);
        this.cmd("Step");
  }
  
    this.cmd("SetMessage", `Queue is empty. Done.`);
    this.cmd("Step");


  return this.commands;
};

// NEED TO OVERRIDE IN PARENT
BFS.prototype.reset = function () {
  // Throw an error?
};

BFS.prototype.enableUI = function (event) {
  this.startField.disabled = false;
  this.startButton.disabled = false;
  this.startButton;

  BFS.superclass.enableUI.call(this, event);
};
BFS.prototype.disableUI = function (event) {
  this.startField.disabled = true;
  this.startButton.disabled = true;

  BFS.superclass.disableUI.call(this, event);
};

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new BFS(animManag, canvas.width, canvas.height);
}
