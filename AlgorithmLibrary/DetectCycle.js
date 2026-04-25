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
} from "../AlgorithmLibrary/Algorithm.js";
import { Graph, VERTEX_INDEX_COLOR } from "./Graph.js";

var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 50;

var VISITED_START_X = 200;
var ONSTACK_START_X = 285;

var STACK_START_X = 25;
var STACK_START_Y = 30;
var STACK_INDENT = 10;
var STACK_LINE_HEIGHT = 20;

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var EDGE_CONSIDER_COLOR = "var(--svgColor--althighlight)";
var TREE_EDGE_COLOR = "#0000FF";
var CYCLE_EDGE_COLOR = "var(--svgColor--althighlight)";

export function DetectCycle(canvas) {
  // New-style usage: `new DetectCycle({ ...opts })` (preferred)
  // Legacy usage: `new DetectCycle(canvas)`
  let am;
  let w;
  let h;
  let graphOpts = null;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Detect Cycle (Directed Graph)", false, {
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
      title: opts.title || "Detect Cycle (Directed Graph)",
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

DetectCycle.prototype = new Graph();
DetectCycle.prototype.constructor = DetectCycle;
DetectCycle.superclass = Graph.prototype;

DetectCycle.prototype.addControls = function () {
  this.startButton = addControlToAlgorithmBar("Button", "Run Cycle Detection");
  this.startButton.onclick = this.startCallback.bind(this);
  // Directed only: do not show Directed/Undirected toggle.
  DetectCycle.superclass.addControls.call(this, false);
};

DetectCycle.prototype.init = function (am, w, h, graphOpts) {
  this.showEdgeCosts = false;

  const opts = graphOpts && typeof graphOpts === "object" ? { ...graphOpts } : {};
  const requestedEdgePercentage =
    opts.edgePercentage ?? opts.edgePercent ?? opts.edgeDensity;
  const parsedEdgePercentage = Number(requestedEdgePercentage);
  const hasValidEdgePercentage =
    Number.isFinite(parsedEdgePercentage) &&
    parsedEdgePercentage >= 0 &&
    parsedEdgePercentage <= 1;

  if (typeof opts.preventBidirectionalEdge !== "boolean") {
    opts.preventBidirectionalEdge = true;
  }

  // Force directed graph generation.
  DetectCycle.superclass.init.call(this, am, w, h, true, false, opts);
};

DetectCycle.prototype.beginDetectCycleAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "DetectCycle", operation, ...meta });
};

DetectCycle.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "DetectCycle",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

DetectCycle.prototype.finishDetectCycleAnimation = function () {
  return this.finishAnimation();
};

DetectCycle.prototype.setup = function () {
  DetectCycle.superclass.setup.call(this);

  this.commands = [];
  this.messageID = [];

  this.visitedID = new Array(this.size);
  this.visitedIndexID = new Array(this.size);
  this.onStackID = new Array(this.size);
  this.onStackIndexID = new Array(this.size);

  for (var i = 0; i < this.size; i++) {
    this.visitedID[i] = this.nextIndex++;
    this.visitedIndexID[i] = this.nextIndex++;
    this.onStackID[i] = this.nextIndex++;
    this.onStackIndexID[i] = this.nextIndex++;

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
      this.onStackID[i],
      "F",
      AUX_ARRAY_WIDTH,
      AUX_ARRAY_HEIGHT,
      ONSTACK_START_X,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd(
      "CreateLabel",
      this.onStackIndexID[i],
      i,
      ONSTACK_START_X - AUX_ARRAY_WIDTH,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT,
    );
    this.cmd("SetForegroundColor", this.onStackIndexID[i], VERTEX_INDEX_COLOR);
  }

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
    "On Stack",
    ONSTACK_START_X - AUX_ARRAY_WIDTH,
    AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
    0,
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Stack",
    STACK_START_X,
    STACK_START_Y - 18,
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

DetectCycle.prototype.startCallback = function () {
  this.doDetectCycle();
};

DetectCycle.prototype.doDetectCycle = function () {
  this.implementAction(this.doDetectCycleAction.bind(this), 0);
  return true;
};

DetectCycle.prototype.doDetectCycleAction = function () {
  this.beginDetectCycleAnimation("detectCycle", "detect directed cycle", {
    tags: ["search", "cycle"],
  });

  if (this.messageID != null) {
    for (var i = 0; i < this.messageID.length; i++) {
      if (this.objectExists(this.messageID[i])) {
        this.cmd("Delete", this.messageID[i]);
      }
    }
  }

  this.rebuildEdges();

  this.visited = new Array(this.size);
  this.onStack = new Array(this.size);
  this.callLabelByVertex = new Array(this.size);
  this.messageID = [];
  this.foundCycle = false;
  this.lastCycleStartRoot = -1;
  this.lastStartsTried = [];

  for (i = 0; i < this.size; i++) {
    this.visited[i] = false;
    this.onStack[i] = false;
    this.callLabelByVertex[i] = -1;
    this.cmd("SetText", this.visitedID[i], "F");
    this.cmd("SetText", this.onStackID[i], "F");
    this.cmd("SetHighlight", this.visitedID[i], 0);
    this.cmd("SetHighlight", this.onStackID[i], 0);
  }

  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleL,
    HIGHLIGHT_CIRCLE_COLOR,
    this.x_pos_logical[0],
    this.y_pos_logical[0],
  );
  this.cmd("SetLayer", this.highlightCircleL, 1);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAL,
    HIGHLIGHT_CIRCLE_COLOR,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start,
  );
  this.cmd("SetLayer", this.highlightCircleAL, 2);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAM,
    HIGHLIGHT_CIRCLE_COLOR,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start,
  );
  this.cmd("SetLayer", this.highlightCircleAM, 3);

  this.stackVisualDepth = 0;

  for (var start = 0; start < this.size && !this.foundCycle; start++) {
    if (!this.visited[start]) {
      this.lastStartsTried.push(start);
      if (start === 0) {
        this.cmd("SetMessage", "Start DFS at 0.");
      } else {
        this.cmd("SetMessage", `Start new DFS at ${start}.`);
      }
      this.cmd(
        "Move",
        this.highlightCircleL,
        this.x_pos_logical[start],
        this.y_pos_logical[start],
      );
      this.cmd(
        "Move",
        this.highlightCircleAL,
        this.adj_list_x_start - this.adj_list_width,
        this.adj_list_y_start + start * this.adj_list_height,
      );
      this.cmd(
        "Move",
        this.highlightCircleAM,
        this.adj_matrix_x_start - this.adj_matrix_width,
        this.adj_matrix_y_start + start * this.adj_matrix_height,
      );
      this.markAnimationStep(`start dfs at ${start}`, {
        focusNodeId: this.circleID[start],
        tags: ["search", "start"],
      });

      if (this.dfsDetect(start, STACK_START_X)) {
        this.lastCycleStartRoot = start;
      }
    }
  }

  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);

  if (this.foundCycle) {
    this.beginBlock("cycle detected", {
      source: "DetectCycle",
      operation: this.currentAnimationOperation,
      tags: ["search", "cycle", "found"],
    });
    this.cmd("SetMessage", "Cycle detected (found an edge to a node currently on the DFS stack).");
  } else {
    this.beginBlock("no cycle found", {
      source: "DetectCycle",
      operation: this.currentAnimationOperation,
      tags: ["search", "cycle", "not-found"],
    });
    this.cmd("SetMessage", "No directed cycle found.");
  }

  return this.finishDetectCycleAnimation();
};

DetectCycle.prototype.objectExists = function (id) {
  return (
    this.animationManager &&
    this.animationManager.animatedObjects &&
    this.animationManager.animatedObjects.Nodes &&
    this.animationManager.animatedObjects.Nodes[id] != null
  );
};

DetectCycle.prototype.getLastCycleDebugInfo = function () {
  return {
    foundCycle: !!this.foundCycle,
    cycleStartRoot: this.lastCycleStartRoot,
    startsTried: Array.isArray(this.lastStartsTried)
      ? this.lastStartsTried.slice()
      : [],
  };
};

DetectCycle.prototype.pushStackVisual = function (vertex, messageX) {
  var id = this.nextIndex++;
  this.messageID.push(id);
  this.callLabelByVertex[vertex] = id;

  this.cmd(
    "CreateLabel",
    id,
    `DFS(${vertex})`,
    messageX,
    STACK_START_Y + this.stackVisualDepth * STACK_LINE_HEIGHT,
    0,
    80,
  );
  this.stackVisualDepth += 1;
};

DetectCycle.prototype.popStackVisual = function (vertex) {
  var id = this.callLabelByVertex[vertex];
  if (id >= 0) {
    this.cmd("Delete", id);
    this.callLabelByVertex[vertex] = -1;
  }
  this.stackVisualDepth = Math.max(0, this.stackVisualDepth - 1);
};

DetectCycle.prototype.setCurrentCursor = function (vertex) {
  this.cmd(
    "Move",
    this.highlightCircleL,
    this.x_pos_logical[vertex],
    this.y_pos_logical[vertex],
  );
  this.cmd(
    "Move",
    this.highlightCircleAL,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start + vertex * this.adj_list_height,
  );
  this.cmd(
    "Move",
    this.highlightCircleAM,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start + vertex * this.adj_matrix_height,
  );
};

DetectCycle.prototype.dfsDetect = function (vertex, messageX) {
  this.pushStackVisual(vertex, messageX);

  this.visited[vertex] = true;
  this.onStack[vertex] = true;
  this.cmd("SetText", this.visitedID[vertex], "T");
  this.cmd("SetText", this.onStackID[vertex], "T");
  this.setCurrentCursor(vertex);
  this.cmd("SetMessage", `Visit ${vertex}; mark as on the stack.`);
  this.markAnimationStep(`visit ${vertex}`, {
    focusNodeId: this.circleID[vertex],
    tags: ["search", "visit"],
  });

  for (var neighbor = 0; neighbor < this.size; neighbor++) {
    if (this.adj_matrix[vertex][neighbor] > 0) {
      this.setEdgeColor(vertex, neighbor, EDGE_CONSIDER_COLOR);
      this.highlightEdge(vertex, neighbor, 1);
      // this.cmd("SetMessage", `Check edge ${vertex} -> ${neighbor}.`);
      // this.cmd("Step");

      if (this.onStack[neighbor]) {
        this.setEdgeColor(vertex, neighbor, CYCLE_EDGE_COLOR);
        this.highlightEdge(vertex, neighbor, 1);
        this.cmd("SetMessage", `Edge ${vertex} -> ${neighbor} reaches a node on the stack. Cycle found.`);
        this.markAnimationStep(`back edge ${vertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "cycle", "back-edge"],
        });
        this.foundCycle = true;
        return true;
      }

      if (!this.visited[neighbor]) {
        this.setEdgeColor(vertex, neighbor, TREE_EDGE_COLOR);
        this.highlightEdge(vertex, neighbor, 1);
        this.cmd("SetMessage", `Recurse to ${neighbor}.`);
        this.markAnimationStep(`recurse to ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "recurse"],
        });

        if (this.dfsDetect(neighbor, messageX + STACK_INDENT)) {
          return true;
        }

        // Child subtree finished with no cycle: this edge is no longer on the
        // active recursion path, so remove its highlight.
        this.setEdgeColor(vertex, neighbor, "#000000");
        this.highlightEdge(vertex, neighbor, 0);

        this.setCurrentCursor(vertex);
        this.cmd("SetMessage", `Return to ${vertex} from ${neighbor}.`);
        this.markAnimationStep(`return to ${vertex}`, {
          focusNodeId: this.circleID[vertex],
          tags: ["search", "return"],
        });
      } else {
        this.setEdgeColor(vertex, neighbor, "#000000");
        this.highlightEdge(vertex, neighbor, 0);
        this.cmd("SetMessage", `${neighbor} already fully processed; continue.`);
        this.markAnimationStep(`skip processed ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "skip"],
        });
      }
    }
  }

  this.onStack[vertex] = false;
  this.cmd("SetText", this.onStackID[vertex], "F");
  this.popStackVisual(vertex);
  this.cmd("SetMessage", `Done at ${vertex}. Mark as not on the stack.`);
  this.markAnimationStep(`finish ${vertex}`, {
    focusNodeId: this.circleID[vertex],
    tags: ["search", "finish"],
  });
  return false;
};

// NEED TO OVERRIDE IN PARENT
DetectCycle.prototype.reset = function () {
  // Throw an error?
};

DetectCycle.prototype.enableUI = function (event) {
  this.startButton.disabled = false;
  DetectCycle.superclass.enableUI.call(this, event);
};

DetectCycle.prototype.disableUI = function (event) {
  this.startButton.disabled = true;
  DetectCycle.superclass.disableUI.call(this, event);
};
