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
  addLabelToAlgorithmBar,
  addRadioButtonGroupToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";
import { Graph, VERTEX_INDEX_COLOR, EDGE_COLOR } from "./Graph.js";

var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 50;

var VISITED_START_X = 200;
var PARENT_START_X = 275;

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var DFS_TREE_COLOR = "#0000FF";
var SEARCH_TREE_FINAL_COLOR = "var(--svgColor--althighlight)";
var EDGE_CHECK_COLOR = "var(--svgColor--althighlight)";
var BFS_QUEUE_HEAD_COLOR = "#0000FF";

var QUEUE_START_X = 30;
var QUEUE_START_Y = 50;
var QUEUE_SPACING = 30;

var DFS_CALLSTACK_FONT_SIZE_PERCENT = 80;

export function DFS(canvas) {
  // New-style usage: `new DFS({ ...opts })` (preferred)
  // Legacy usage: `new DFS(canvas)`
  let am;
  let w;
  let h;
  let graphOpts = null;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Depth-First Search", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height,
    });
    w = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas || {};
    graphOpts = opts;
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
      title: opts.title || "Depth-First Search",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts,
    });
    w = viewWidth;
    h = viewHeight;
  }

  this.init(am, w, h, graphOpts);
}

DFS.prototype = new Graph();
DFS.prototype.constructor = DFS;
DFS.superclass = Graph.prototype;

DFS.prototype.addControls = function () {
  addLabelToAlgorithmBar("Start Vertex: ");
  this.startField = addControlToAlgorithmBar("Text", "");
  this.startField.setAttribute("placeholder", "Vertex #");
  this.startField.onkeydown = this.returnSubmit(
    this.startField,
    this.startCallback.bind(this),
    2,
    true,
  );
  this.startButton = addControlToAlgorithmBar("Button", "Run DFS");
  this.startButton.onclick = this.startCallback.bind(this);

  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Recursive", "Iterative"],
    "DFSMode",
  );
  this.recursiveModeButton = radioButtonList[0];
  this.recursiveModeButton.onclick = this.dfsModeChangedCallback.bind(this, false);
  this.iterativeModeButton = radioButtonList[1];
  this.iterativeModeButton.onclick = this.dfsModeChangedCallback.bind(this, true);
  this.recursiveModeButton.checked = !this.useIterative;
  this.iterativeModeButton.checked = this.useIterative;

  DFS.superclass.addControls.call(this);
};

DFS.prototype.init = function (am, w, h, graphOpts) {
  this.useIterative = false;
  if (graphOpts && typeof graphOpts === "object") {
    if (typeof graphOpts.iterative === "boolean") {
      this.useIterative = graphOpts.iterative;
    } else if (typeof graphOpts.searchMode === "string") {
      this.useIterative = graphOpts.searchMode.toLowerCase() === "iterative";
    }
  }
  this.showEdgeCosts = false;
  DFS.superclass.init.call(this, am, w, h, true, false, graphOpts); // TODO:  add no edge label flag to this?
  // Setup called in base class constructor
};

DFS.prototype.beginDFSAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "DFS", operation, ...meta });
};

DFS.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "DFS",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

DFS.prototype.finishDFSAnimation = function () {
  return this.finishAnimation();
};

DFS.prototype.dfsModeChangedCallback = function (iterativeMode) {
  if (this.useIterative !== iterativeMode) {
    this.useIterative = iterativeMode;
  }
};

DFS.prototype.setup = function () {
  DFS.superclass.setup.call(this);
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
      "f",
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
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
};

DFS.prototype.startCallback = function (event) {
  if (this.startField.value != "") {
    const startvalue = this.startField.value;
    this.startField.value = "";
    this.doSearch(startvalue);
  }
};

DFS.prototype.doSearch = function (startVertex) {
  const parsedStart = parseInt(startVertex);
  if (
    !Number.isFinite(parsedStart) ||
    parsedStart < 0 ||
    parsedStart >= this.size
  ) {
    return false;
  }

  this.implementAction(this.doDFS.bind(this), parsedStart);
  return true;
};

DFS.prototype.initEdgeVisualState = function () {
  this.edgeColorState = new Array(this.size);
  this.edgeHighlightState = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.edgeColorState[i] = new Array(this.size);
    this.edgeHighlightState[i] = new Array(this.size);
    for (var j = 0; j < this.size; j++) {
      this.edgeColorState[i][j] = EDGE_COLOR;
      this.edgeHighlightState[i][j] = false;
    }
  }
};

DFS.prototype.recordEdgeVisualState = function (i, j, color, highlighted) {
  this.edgeColorState[i][j] = color;
  this.edgeHighlightState[i][j] = highlighted;
  if (!this.directed) {
    this.edgeColorState[j][i] = color;
    this.edgeHighlightState[j][i] = highlighted;
  }
};

DFS.prototype.applyEdgeVisualState = function (i, j, color, highlighted) {
  this.setEdgeColor(i, j, color);
  this.highlightEdge(i, j, highlighted ? 1 : 0);
  this.recordEdgeVisualState(i, j, color, highlighted);
};

DFS.prototype.clearAdjacencyRepEdgeHighlight = function (i, j) {
  if (this.adj_list_edges && this.adj_list_edges[i] && this.adj_list_edges[i][j]) {
    this.cmd("SetHighlight", this.adj_list_edges[i][j], 0);
  }
  if (this.adj_matrixID && this.adj_matrixID[i] && this.adj_matrixID[i][j]) {
    this.cmd("SetHighlight", this.adj_matrixID[i][j], 0);
  }
};

DFS.prototype.doDFS = function (startVetex) {
  if (this.useIterative) {
    return this.doDFSIterative(startVetex);
  }

  return this.doDFSRecursive(startVetex);
};

DFS.prototype.doDFSRecursive = function (startVetex) {
  this.visited = new Array(this.size);
  this.parent = new Array(this.size);
  this.beginDFSAnimation("searchRecursive", `dfs recursive from ${startVetex}`, {
    tags: ["search", "dfs", "recursive"],
  });
  if (this.messageID != null) {
    for (var i = 0; i < this.messageID.length; i++) {
      this.cmd("Delete", this.messageID[i]);
    }
  }
  this.rebuildEdges();
  this.initEdgeVisualState();
  this.messageID = new Array();
  for (i = 0; i < this.size; i++) {
    this.cmd("SetText", this.visitedID[i], "f");
    this.cmd("SetHighlight", this.visitedID[i], 0);
    this.cmd("SetText", this.parentID[i], "");
    this.visited[i] = false;
    this.parent[i] = -1;
  }
  var vertex = parseInt(startVetex);
  this.parent[vertex] = -1;
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

  this.messageY = 30;
  this.dfsVisit(vertex, 10);
  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);

  this.beginBlock("dfs complete", {
    source: "DFS",
    operation: this.currentAnimationOperation,
    tags: ["search", "complete"],
  });
  this.cmd(
    "SetMessage",
    "DFS complete. Search tree highlighted.",
  );
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.setEdgeColor(this.parent[i], i, SEARCH_TREE_FINAL_COLOR);
      this.highlightEdge(this.parent[i], i, 1);
    }
  }
  return this.finishDFSAnimation();
};

DFS.prototype.doDFSIterative = function (startVetex) {
  this.visited = new Array(this.size);
  this.parent = new Array(this.size);
  this.beginDFSAnimation("searchIterative", `dfs iterative from ${startVetex}`, {
    tags: ["search", "dfs", "iterative"],
  });

  if (this.messageID != null) {
    for (var i = 0; i < this.messageID.length; i++) {
      this.cmd("Delete", this.messageID[i]);
    }
  }

  this.rebuildEdges();
  this.initEdgeVisualState();
  this.messageID = new Array();

  var stackTitleID = this.nextIndex++;
  this.messageID.push(stackTitleID);
  this.cmd(
    "CreateLabel",
    stackTitleID,
    "Stack",
    QUEUE_START_X,
    QUEUE_START_Y - 30,
    0,
  );

  var stackCapacity = this.size * this.size;
  var stackLabelID = new Array(stackCapacity);
  for (i = 0; i < this.size; i++) {
    this.cmd("SetText", this.visitedID[i], "f");
    this.cmd("SetHighlight", this.visitedID[i], 0);
    this.cmd("SetText", this.parentID[i], "");
    this.visited[i] = false;
    this.parent[i] = -1;
  }

  for (i = 0; i < stackCapacity; i++) {
    stackLabelID[i] = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      stackLabelID[i],
      "",
      QUEUE_START_X,
      QUEUE_START_Y + i * QUEUE_SPACING,
    );
    this.cmd("SetAlpha", stackLabelID[i], 0);
  }

  var vertex = parseInt(startVetex);
  this.parent[vertex] = -1;
  var stackVertex = new Array(stackCapacity);
  var stackSize = 0;

  // push(start)
  stackVertex[stackSize] = vertex;
  this.cmd("SetText", stackLabelID[stackSize], vertex);
  this.cmd("SetAlpha", stackLabelID[stackSize], 1);
  this.cmd(
    "Move",
    stackLabelID[stackSize],
    QUEUE_START_X,
    QUEUE_START_Y + stackSize * QUEUE_SPACING,
  );
  stackSize++;

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

  this.cmd("SetMessage", `Initialize stack with ${vertex}.`);
  this.markAnimationStep(`initialize stack with ${vertex}`, {
    focusNodeId: this.circleID[vertex],
    tags: ["search", "stack", "init"],
  });

  while (stackSize > 0) {
    // pop()
    stackSize--;
    var currentVertex = stackVertex[stackSize];
    this.cmd("SetText", stackLabelID[stackSize], "");
    this.cmd("SetAlpha", stackLabelID[stackSize], 0);
    this.cmd("SetMessage", `Pop ${currentVertex} from stack.`);
    this.markAnimationStep(`pop ${currentVertex}`, {
      focusNodeId: this.circleID[currentVertex],
      tags: ["search", "stack", "pop"],
    });

    if (this.visited[currentVertex]) {
      this.cmd("SetMessage", `${currentVertex} is already visited; skip.`);
      this.markAnimationStep(`skip visited ${currentVertex}`, {
        focusNodeId: this.circleID[currentVertex],
        tags: ["search", "skip"],
      });
      continue;
    }

    this.visited[currentVertex] = true;
    this.cmd("SetText", this.visitedID[currentVertex], "T");

    // Lock in tree edge only when the destination vertex is actually visited.
    if (this.parent[currentVertex] >= 0) {
      this.applyEdgeVisualState(
        this.parent[currentVertex],
        currentVertex,
        EDGE_COLOR,
        true,
      );
    }

    this.cmd(
      "Move",
      this.highlightCircleL,
      this.x_pos_logical[currentVertex],
      this.y_pos_logical[currentVertex],
    );
    this.cmd(
      "Move",
      this.highlightCircleAL,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + currentVertex * this.adj_list_height,
    );
    this.cmd(
      "Move",
      this.highlightCircleAM,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + currentVertex * this.adj_matrix_height,
    );
    this.cmd("SetMessage", `Visit ${currentVertex}; scan neighbors.`);
    this.markAnimationStep(`visit ${currentVertex}`, {
      focusNodeId: this.circleID[currentVertex],
      tags: ["search", "visit"],
    });

    for (var neighbor = this.size - 1; neighbor >= 0; neighbor--) {

      if (this.adj_matrix[currentVertex][neighbor] > 0) {
        const savedEdgeColor = this.edgeColorState[currentVertex][neighbor];
        const savedEdgeHighlight = this.edgeHighlightState[currentVertex][neighbor];

        this.applyEdgeVisualState(currentVertex, neighbor, EDGE_CHECK_COLOR, false);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        if (this.visited[neighbor]) {
          this.cmd(
            "SetMessage",
            `Explore edge ${currentVertex} -> ${neighbor}; neighbor already visited (skip).`,
          );
        } else {
          this.cmd(
            "SetMessage",
            `Explore edge ${currentVertex} -> ${neighbor}; neighbor unvisited (push).`,
          );
        }
        this.markAnimationStep(`consider edge ${currentVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "edge"],
        });

        if (!this.visited[neighbor]) {
          // push(neighbor) and set parent at push time
          this.parent[neighbor] = currentVertex;
          this.cmd("SetText", this.parentID[neighbor], currentVertex);
          // Do not lock edge highlight yet; lock when neighbor is actually visited.
          this.applyEdgeVisualState(
            currentVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight,
          );

          stackVertex[stackSize] = neighbor;
          this.cmd("SetText", stackLabelID[stackSize], neighbor);
          this.cmd("SetAlpha", stackLabelID[stackSize], 1);
          this.cmd(
            "Move",
            stackLabelID[stackSize],
            QUEUE_START_X,
            QUEUE_START_Y + stackSize * QUEUE_SPACING,
          );
          stackSize++;

          this.cmd(
            "SetMessage",
            `Discover ${neighbor}; set parent to ${currentVertex} and push ${neighbor} onto stack (edge locks when ${neighbor} is visited).`,
          );
          this.markAnimationStep(`push ${neighbor}`, {
            focusNodeId: this.circleID[neighbor],
            tags: ["search", "stack", "push"],
          });
        } else {
          this.applyEdgeVisualState(
            currentVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight,
          );
          this.cmd(
            "SetMessage",
            `Neighbor ${neighbor} already visited; skip edge ${currentVertex} -> ${neighbor}.`,
          );
        }

        this.clearAdjacencyRepEdgeHighlight(currentVertex, neighbor);
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);
        this.markAnimationStep(`finish edge ${currentVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[currentVertex],
          tags: ["search", "edge", "finish"],
        });
      }
    }

    this.cmd("SetMessage", `Finished scanning neighbors of ${currentVertex}.`);
    this.markAnimationStep(`finish ${currentVertex}`, {
      focusNodeId: this.circleID[currentVertex],
      tags: ["search", "finish"],
    });
  }

  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);

  this.beginBlock("dfs complete", {
    source: "DFS",
    operation: this.currentAnimationOperation,
    tags: ["search", "complete"],
  });
  this.cmd("SetMessage", "DFS complete. Search tree highlighted.");
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.applyEdgeVisualState(this.parent[i], i, SEARCH_TREE_FINAL_COLOR, true);
    }
  }
  return this.finishDFSAnimation();
};

DFS.prototype.dfsVisit = function (startVertex, messageX) {
  var nextMessage = this.nextIndex++;
  this.messageID.push(nextMessage);

  this.cmd(
    "CreateLabel",
    nextMessage,
    "DFS(" + String(startVertex) + ")",
    messageX,
    this.messageY,
    0,
    DFS_CALLSTACK_FONT_SIZE_PERCENT,
  );
  this.messageY = this.messageY + 20;
  if (!this.visited[startVertex]) {
    this.visited[startVertex] = true;
    this.cmd("SetText", this.visitedID[startVertex], "T");
    this.cmd("SetMessage", `Visit ${startVertex}; mark visited.`);
    this.markAnimationStep(`visit ${startVertex}`, {
      focusNodeId: this.circleID[startVertex],
      tags: ["search", "visit"],
    });
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[startVertex][neighbor] > 0) {
        const savedEdgeColor = this.edgeColorState[startVertex][neighbor];
        const savedEdgeHighlight = this.edgeHighlightState[startVertex][neighbor];

        // Phase 1: temporarily show considered edge in alt color.
        this.applyEdgeVisualState(startVertex, neighbor, EDGE_CHECK_COLOR, false);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        if (this.visited[neighbor]) {
          // nextMessage = this.nextIndex;
          // this.cmd(
          //   "CreateLabel",
          //   nextMessage,
          //   "Vertex " + String(neighbor) + " already visited.",
          //   messageX,
          //   this.messageY,
          //   0,
          //   DFS_CALLSTACK_FONT_SIZE_PERCENT,
          // );
          this.cmd(
            "SetMessage",
            `Explore edge ${startVertex} -> ${neighbor}; neighbor already visited (skip).`,
          );
        } else {
          this.cmd(
            "SetMessage",
            `Explore edge ${startVertex} -> ${neighbor}; neighbor unvisited (recurse).`,
          );
        }
        this.markAnimationStep(`consider edge ${startVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "edge"],
        });

        if (!this.visited[neighbor]) {
          // Selected edge: restore normal color but keep highlighted.
          this.applyEdgeVisualState(startVertex, neighbor, savedEdgeColor, true);
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[neighbor],
            this.y_pos_logical[neighbor],
          );
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + neighbor * this.adj_list_height,
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + neighbor * this.adj_matrix_height,
          );

          this.parent[neighbor] = startVertex;
          this.cmd("SetText", this.parentID[neighbor], startVertex);
          this.cmd(
            "SetMessage",
            `Discover ${neighbor}; set parent to ${startVertex} and recurse into DFS(${neighbor}).`,
          );
          this.markAnimationStep(`recurse to ${neighbor}`, {
            focusNodeId: this.circleID[neighbor],
            tags: ["search", "recurse"],
          });
          this.dfsVisit(neighbor, messageX + 10);
          // nextMessage = this.nextIndex;
          // this.cmd(
          //   "CreateLabel",
          //   nextMessage,
          //   "Returning from recursive call: DFS(" + String(neighbor) + ")",
          //   messageX + 5,
          //   this.messageY,
          //   0,
          //   DFS_CALLSTACK_FONT_SIZE_PERCENT,
          // );

          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + startVertex * this.adj_list_height,
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[startVertex],
            this.y_pos_logical[startVertex],
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + startVertex * this.adj_matrix_height,
          );
          this.cmd(
            "SetMessage",
            `Returned to DFS(${startVertex}) from DFS(${neighbor}); continue scanning neighbors.`,
          );
          this.markAnimationStep(`return to ${startVertex}`, {
            focusNodeId: this.circleID[startVertex],
            tags: ["search", "return"],
          });
          // this.cmd("Delete", nextMessage);
        } else {
          // Not selected edge: restore prior visual state.
          this.applyEdgeVisualState(
            startVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight,
          );
        }

        // Keep list/matrix edge highlighting temporary per check.
        this.clearAdjacencyRepEdgeHighlight(startVertex, neighbor);
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);

        this.cmd(
          "SetMessage",
          `Finished processing edge ${startVertex} -> ${neighbor}.`,
        );
        this.markAnimationStep(`finish edge ${startVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[startVertex],
          tags: ["search", "edge", "finish"],
        });
      }
    }
  }
};

// NEED TO OVERRIDE IN PARENT
DFS.prototype.reset = function () {
  // Throw an error?
};

DFS.prototype.enableUI = function (event) {
  this.startField.disabled = false;
  this.startButton.disabled = false;
  this.startButton;

  DFS.superclass.enableUI.call(this, event);
};
DFS.prototype.disableUI = function (event) {
  this.startField.disabled = true;
  this.startButton.disabled = true;

  DFS.superclass.disableUI.call(this, event);
};

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new DFS(animManag, canvas.width, canvas.height);
}
