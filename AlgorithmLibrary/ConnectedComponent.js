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

import { initAnimationManager, initCanvas } from "../AnimationLibrary/AnimationMain.js";
import { addControlToAlgorithmBar } from "../AlgorithmLibrary/Algorithm.js";
import { Graph } from "../AlgorithmLibrary/Graph.js";

var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 100;

var VISITED_START_X = 475;
var PARENT_START_X = 400;

var D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
var F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];

var D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
var F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];

var D_X_POS_LARGE = [
  560, 660, 760, 860, 610, 710, 810, 560, 660, 760, 860, 610, 710, 810, 560,
  660, 760, 860,
];

var F_X_POS_LARGE = [
  560, 660, 760, 860, 610, 710, 810, 560, 660, 760, 860, 610, 710, 810, 560,
  660, 760, 860,
];

var D_Y_POS_LARGE = [
  37, 37, 37, 37, 137, 137, 137, 237, 237, 237, 237, 337, 337, 337, 437, 437,
  437, 437,
];

var F_Y_POS_LARGE = [
  62, 62, 62, 62, 162, 162, 162, 262, 262, 262, 262, 362, 362, 362, 462, 462,
  462, 462,
];

var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var DFS_TREE_COLOR = "#0000FF";

export function ConnectedComponent(canvas) {
  // Support both legacy (canvas element) and new opts-based initialization.
  let am;
  let w;
  let h;
  let graphOpts = null;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Connected Components", false, {
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
      title: opts.title || "Connected Components",
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

ConnectedComponent.prototype = new Graph();
ConnectedComponent.prototype.constructor = ConnectedComponent;
ConnectedComponent.superclass = Graph.prototype;

ConnectedComponent.prototype.addControls = function () {
  this.startButton = addControlToAlgorithmBar(
    "Button",
    "Run Connected Component",
  );
  this.startButton.onclick = this.startCallback.bind(this);
  ConnectedComponent.superclass.addControls.call(this, false);
};

ConnectedComponent.prototype.init = function (am, w, h, graphOpts) {
  this.showEdgeCosts = false;
  ConnectedComponent.superclass.init.call(this, am, w, h, true, false, graphOpts); // TODO:  add no edge label flag to this?
  // Setup called in base class init function
};

ConnectedComponent.prototype.beginConnectedComponentAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "ConnectedComponent", operation, ...meta });
};

ConnectedComponent.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "ConnectedComponent",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags) ? stepMeta.tags : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

ConnectedComponent.prototype.finishConnectedComponentAnimation = function () {
  return this.finishAnimation();
};

ConnectedComponent.prototype.setup = function () {
  ConnectedComponent.superclass.setup.call(this);
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.commands = new Array();
  // Track whether Run has been pressed; used to keep Run disabled until Reset
  this.runLocked = false;
  if (this.startButton) this.startButton.disabled = false;

  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
  this.initialIndex = this.nextIndex;

  this.old_adj_matrix = new Array(this.size);
  this.old_adj_list_list = new Array(this.size);
  this.old_adj_list_index = new Array(this.size);
  this.old_adj_list_edges = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.old_adj_matrix[i] = new Array(this.size);
    this.old_adj_list_index[i] = this.adj_list_index[i];
    this.old_adj_list_list[i] = this.adj_list_list[i];
    this.old_adj_list_edges[i] = new Array(this.size);
    for (var j = 0; j < this.size; j++) {
      this.old_adj_matrix[i][j] = this.adj_matrix[i][j];
      if (this.adj_matrix[i][j] > 0) {
        this.old_adj_list_edges[i][j] = this.adj_list_edges[i][j];
      }
    }
  }

  // Component edge highlight colors (used in second DFS phase)
  this.ccColors = [
    "#cc3333",
    "#33aa33",
    "#3366cc",
    "#ff9933",
    "#9933cc",
    "#33cccc",
  ];
  this.currentComponentColor = DFS_TREE_COLOR;

  // Sorted vertices display column configuration
  this.sortedColumnX = 200;
  this.sortedColumnYStart = 30;
  this.sortedRowHeight = 20;
  this.sortedLabelsIDs = new Array(this.size);

  // Initialize DFS call stack visualization parameters.
  this.stackBaseX = 40;
  this.stackBaseY = 30;
  this.stackSectionY = this.stackBaseY;
  this.stackIndent = 10;
  this.stackLineHeight = 20;
  this.stackSectionGap = 12;
  this.stackLabelIDs = [];
  this.callStackDepth = 0;
  this.stackRowCount = 0;
};

ConnectedComponent.prototype.startCallback = function (event) {
  // Lock Run until user resets
  this.runLocked = true;
  if (this.startButton) this.startButton.disabled = true;
  this.implementAction(this.doCC.bind(this), "");
};

ConnectedComponent.prototype.transpose = function () {
  for (var i = 0; i < this.size; i++) {
    for (var j = i + 1; j < this.size; j++) {
      var tmp = this.adj_matrix[i][j];
      this.adj_matrix[i][j] = this.adj_matrix[j][i];
      this.adj_matrix[j][i] = tmp;
    }
  }
};

ConnectedComponent.prototype.doCC = function (ignored) {
  this.visited = new Array(this.size);
  this.beginConnectedComponentAnimation("connectedComponents", "compute connected components", {
    tags: ["search", "connected-components"],
  });
  this.rebuildEdges();
  this.cmd("SetMessage", "Run first DFS to compute finishing times.");
  this.markAnimationStep("start first dfs pass", {
    tags: ["search", "pass1"],
  });

  this.d_timesID_L = new Array(this.size);
  this.f_timesID_L = new Array(this.size);
  this.d_timesID_AL = new Array(this.size);
  this.f_timesID_AL = new Array(this.size);
  this.d_times = new Array(this.size);
  this.f_times = new Array(this.size);
  this.currentTime = 1;
  for (let i = 0; i < this.size; i++) {
    this.d_timesID_L[i] = this.nextIndex++;
    this.f_timesID_L[i] = this.nextIndex++;
    this.d_timesID_AL[i] = this.nextIndex++;
    this.f_timesID_AL[i] = this.nextIndex++;
  }

  this.messageY = 30;
  var vertex;
  for (vertex = 0; vertex < this.size; vertex++) {
    if (!this.visited[vertex]) {
      this.cmd("SetMessage", "Start DFS from vertex " + vertex + ".");
      this.markAnimationStep(`pass 1 root ${vertex}`, {
        focusNodeId: this.circleID[vertex],
        tags: ["search", "pass1", "root"],
      });
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

      this.dfsVisit(vertex, 0, false);
      // Advance stack section for next root: space by rows used and extra gap
      this.stackSectionY = this.stackSectionY + (this.stackRowCount * this.stackLineHeight) + this.stackSectionGap;
      this.callStackDepth = 0;
      this.stackRowCount = 0;
      this.cmd("Delete", this.highlightCircleL, 2);
      this.cmd("Delete", this.highlightCircleAL, 3);
      this.cmd("Delete", this.highlightCircleAM, 4);
    }
  }
  this.clearEdges();
  this.removeAdjList();
  this.cmd("SetMessage", "Transpose graph and run DFS again to identify components.");
  this.markAnimationStep("transpose graph", {
    tags: ["search", "transpose"],
  });
  this.transpose();
  this.buildEdges();
  this.buildAdjList();
  this.currentTime = 1;

  for (let i = 0; i < this.size; i++) {
    for (let j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] >= 0) {
        this.cmd("SetText", this.adj_matrixID[i][j], "1");
      } else {
        this.cmd("SetText", this.adj_matrixID[i][j], "");
      }
    }
  }

  for (vertex = 0; vertex < this.size; vertex++) {
    this.visited[vertex] = false;
    this.cmd("Delete", this.d_timesID_L[vertex], 5);
    this.cmd("Delete", this.f_timesID_L[vertex], 6);
    this.cmd("Delete", this.d_timesID_AL[vertex], 7);
    this.cmd("Delete", this.f_timesID_AL[vertex], 8);
  }

  var sortedVertex = new Array(this.size);
  for (vertex = 0; vertex < this.size; vertex++) {
    sortedVertex[vertex] = vertex;
  }
  this.cmd("SetMessage", "Order vertices by decreasing finishing times.");
  this.markAnimationStep("sort by finish time", {
    tags: ["search", "sort"],
  });

  for (let i = 1; i < this.size; i++) {
    var j = i;
    var tmpTime = this.f_times[i];
    var tmpIndex = sortedVertex[i];
    while (j > 0 && this.f_times[j - 1] < tmpTime) {
      this.f_times[j] = this.f_times[j - 1];
      sortedVertex[j] = sortedVertex[j - 1];
      j--;
    }
    this.f_times[j] = tmpTime;
    sortedVertex[j] = tmpIndex;
  }
  // Create and display the sorted vertices column at x=200
  for (let i = 0; i < this.size; i++) {
    this.sortedLabelsIDs[i] = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      this.sortedLabelsIDs[i],
      "Vertex: " + String(sortedVertex[i]) + " f=" + String(this.f_times[i]),
      this.sortedColumnX,
      this.sortedColumnYStart + i * this.sortedRowHeight,
    );
    this.cmd("SetLayer", this.sortedLabelsIDs[i], 1);
  }
  this.messageY = 30;

  var ccNum = 1;
  for (let i = 0; i < this.size; i++) {
    vertex = sortedVertex[i];
    if (!this.visited[vertex]) {
      // Set a distinct color for this component's DFS tree edges
      this.currentComponentColor = this.ccColors[(ccNum - 1) % this.ccColors.length];
      // Highlight the current sorted vertex label as we process it
      if (this.sortedLabelsIDs && this.sortedLabelsIDs[i] != null) {
        this.cmd("SetForegroundColor", this.sortedLabelsIDs[i], this.currentComponentColor);
        this.markAnimationStep(`highlight component root ${vertex}`, {
          focusNodeId: this.circleID[vertex],
          tags: ["search", "pass2", "root"],
        });
      }
      this.cmd("SetMessage", "Connected Component #" + String(ccNum++) + ": start DFS at vertex " + vertex + ".");
      this.markAnimationStep(`start component at ${vertex}`, {
        focusNodeId: this.circleID[vertex],
        tags: ["search", "component", "start"],
      });

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

      this.dfsVisit(vertex, 0, true);
      // Advance stack section for next root: space by rows used and extra gap
      this.stackSectionY = this.stackSectionY + (this.stackRowCount * this.stackLineHeight) + this.stackSectionGap;
      this.callStackDepth = 0;
      this.stackRowCount = 0;
      this.cmd("Delete", this.highlightCircleL, 10);
      this.cmd("Delete", this.highlightCircleAL, 11);
      this.cmd("Delete", this.highlightCircleAM, 12);
    }
  }

  // for (vertex = 0; vertex < this.size; vertex++) {
  //   this.cmd("Delete", this.d_timesID_L[vertex], 14);
  //   this.cmd("Delete", this.f_timesID_L[vertex], 15);
  //   this.cmd("Delete", this.d_timesID_AL[vertex], 16);
  //   this.cmd("Delete", this.f_timesID_AL[vertex], 17);
  // }

  // // Clean up stack labels after animation completes
  // if (this.stackLabelIDs && this.stackLabelIDs.length) {
  //   for (let i = 0; i < this.stackLabelIDs.length; i++) {
  //     this.cmd("Delete", this.stackLabelIDs[i]);
  //   }
  // }

  // // Clean up sorted vertices column labels
  // if (this.sortedLabelsIDs && this.sortedLabelsIDs.length) {
  //   for (let i = 0; i < this.sortedLabelsIDs.length; i++) {
  //     this.cmd("Delete", this.sortedLabelsIDs[i]);
  //   }
  // }

  return this.finishConnectedComponentAnimation();
};

ConnectedComponent.prototype.setup_large = function () {
  this.d_x_pos = D_X_POS_LARGE;
  this.d_y_pos = D_Y_POS_LARGE;
  this.f_x_pos = F_X_POS_LARGE;
  this.f_y_pos = F_Y_POS_LARGE;

  ConnectedComponent.superclass.setup_large.call(this);
};
ConnectedComponent.prototype.setup_small = function () {
  this.d_x_pos = D_X_POS_SMALL;
  this.d_y_pos = D_Y_POS_SMALL;
  this.f_x_pos = F_X_POS_SMALL;
  this.f_y_pos = F_Y_POS_SMALL;

  ConnectedComponent.superclass.setup_small.call(this);
};

ConnectedComponent.prototype.dfsVisit = function (
  startVertex,
  messageX,
  printCCNum,
) {
  // Push current DFS call onto the visual stack
  this.callStackDepth = (this.callStackDepth || 0) + 1;
  var indentDepth = this.callStackDepth - 1;
  var stackLabelID = this.nextIndex++;
  if (!this.stackLabelIDs) {
    this.stackLabelIDs = [];
  }
  this.stackLabelIDs.push(stackLabelID);
  this.cmd(
    "CreateLabel",
    stackLabelID,
    "DFS(" + String(startVertex) + ")",
    this.stackBaseX + indentDepth * this.stackIndent,
    this.stackSectionY + this.stackRowCount * this.stackLineHeight,
  );
  this.stackRowCount++;
  if (printCCNum) {
    this.cmd("SetMessage", "Visit vertex " + String(startVertex) + ".");
    this.markAnimationStep(`visit ${startVertex}`, {
      focusNodeId: this.circleID[startVertex],
      tags: ["search", "visit"],
    });
  }
    // Narration: first visit to this vertex
    this.cmd("SetMessage", "First visit to vertex " + String(startVertex) + ".");
  this.markAnimationStep(`discover ${startVertex}`, {
    focusNodeId: this.circleID[startVertex],
    tags: ["search", "discover"],
  });
  this.cmd("SetMessage", "DFS(" + String(startVertex) + ")");

  this.messageY = this.messageY + 20;
  if (!this.visited[startVertex]) {
    this.d_times[startVertex] = this.currentTime++;
    this.cmd(
      "CreateLabel",
      this.d_timesID_L[startVertex],
      "d = " + String(this.d_times[startVertex]),
      this.x_pos_logical[startVertex] - 44,
      this.y_pos_logical[startVertex] - 14,
    );
    this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d2 = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2 * this.adj_list_width, this.adj_list_y_start + startVertex * this.adj_list_height - (1 / 4) * this.adj_list_height);
    this.cmd("SetLayer", this.d_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.d_timesID_AL[startVertex], 2);

    this.visited[startVertex] = true;
    // Color the node in the logical graph with the component color during phase two
    if (printCCNum && this.currentComponentColor) {
      var c = this.currentComponentColor;
      if (c && c[0] === "#" && c.length === 7) {
        var r = parseInt(c.slice(1, 3), 16);
        var g = parseInt(c.slice(3, 5), 16);
        var b = parseInt(c.slice(5, 7), 16);
        this.cmd("SetBackgroundColor", this.circleID[startVertex], "rgba(" + r + "," + g + "," + b + ",0.15)");
      } else {
        this.cmd("SetBackgroundColor", this.circleID[startVertex], c);
      }
    }
    this.markAnimationStep(`stamp discover time for ${startVertex}`, {
      focusNodeId: this.circleID[startVertex],
      tags: ["search", "time", "discover"],
    });
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[startVertex][neighbor] > 0) {
        this.highlightEdge(startVertex, neighbor, 1);
        if (this.visited[neighbor]) {
          this.cmd("SetMessage", "Neighbor " + String(neighbor) + " already visited; skip.");
        } else {
            this.cmd("SetMessage", "Visit unvisited neighbor " + String(neighbor) + " from " + String(startVertex) + "; recurse.");
        }
        this.markAnimationStep(`consider edge ${startVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[neighbor],
          tags: ["search", "edge"],
        });
        this.highlightEdge(startVertex, neighbor, 0);

        if (!this.visited[neighbor]) {
          // Narration aligned with TopoSort DFS phrasing

          this.cmd(
            "Disconnect",
            this.circleID[startVertex],
            this.circleID[neighbor],
          );
          var edgeColor = (printCCNum && this.currentComponentColor) ? this.currentComponentColor : DFS_TREE_COLOR;
          this.cmd(
            "Connect",
            this.circleID[startVertex],
            this.circleID[neighbor],
            edgeColor,
            this.curve[startVertex][neighbor],
            1,
            "",
          );
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

          this.markAnimationStep(`recurse to ${neighbor}`, {
            focusNodeId: this.circleID[neighbor],
            tags: ["search", "recurse"],
          });
          this.dfsVisit(neighbor, messageX + 10, printCCNum);
          this.cmd("SetMessage", "Return from DFS(" + String(neighbor) + ")");

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
          this.markAnimationStep(`return to ${startVertex}`, {
            focusNodeId: this.circleID[startVertex],
            tags: ["search", "return"],
          });
        }
        this.markAnimationStep(`finish edge ${startVertex} -> ${neighbor}`, {
          focusNodeId: this.circleID[startVertex],
          tags: ["search", "edge", "finish"],
        });
      }
    }
    this.f_times[startVertex] = this.currentTime++;
    this.cmd(
      "CreateLabel",
      this.f_timesID_L[startVertex],
      "f = " + String(this.f_times[startVertex]),
      this.x_pos_logical[startVertex] - 44,
      this.y_pos_logical[startVertex] + 14,
    );
    this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2 * this.adj_list_width, this.adj_list_y_start + startVertex * this.adj_list_height + (1 / 4) * this.adj_list_height);

    this.cmd("SetLayer", this.f_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.f_timesID_AL[startVertex], 2);
    // Narration: finishing this vertex
    this.cmd("SetMessage", "Finish vertex " + String(startVertex) + ".");
    this.markAnimationStep(`finish ${startVertex}`, {
      focusNodeId: this.circleID[startVertex],
      tags: ["search", "finish"],
    });
  }

  // Pop logical stack depth (keep labels visible until animation completes)
  this.callStackDepth--;
};

ConnectedComponent.prototype.reset = function () {
  // TODO:  Fix undo messing with setup vars.
  this.messageID = new Array();
  this.nextIndex = this.initialIndex;
  this.runLocked = false;
  for (var i = 0; i < this.size; i++) {
    this.adj_list_list[i] = this.old_adj_list_list[i];
    this.adj_list_index[i] = this.old_adj_list_index[i];

    for (var j = 0; j < this.size; j++) {
      this.adj_matrix[i][j] = this.old_adj_matrix[i][j];
      if (this.adj_matrix[i][j] > 0) {
        this.adj_list_edges[i][j] = this.old_adj_list_edges[i][j];
      }
    }
  }
};

ConnectedComponent.prototype.enableUI = function (event) {
  // Keep Run disabled if we've already executed and not reset
  this.startButton.disabled = !!this.runLocked;

  ConnectedComponent.superclass.enableUI.call(this, event);
};
ConnectedComponent.prototype.disableUI = function (event) {
  this.startButton.disabled = true;

  ConnectedComponent.superclass.disableUI.call(this, event);
};

var currentAlg;

function init() {
  var animManag = initCanvas(canvas);
  currentAlg = new ConnectedComponent(animManag, canvas.width, canvas.height);
}

// Re-enable Run on skip back (undo)
ConnectedComponent.prototype.undo = function (event) {
  ConnectedComponent.superclass.undo.call(this, event);
  this.runLocked = false;
  this.enableUI(event);
};
