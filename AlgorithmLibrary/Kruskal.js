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
import { addControlToAlgorithmBar } from "../AlgorithmLibrary/Algorithm.js";
import {
  Graph,
  VERTEX_INDEX_COLOR,
  EDGE_COLOR,
} from "../AlgorithmLibrary/Graph.js";

export function Kruskal(canvas) {
  // New-style usage: `new Kruskal({ ...opts })` (preferred)
  // Legacy usage: `new Kruskal(canvas)`
  let am;
  let w;
  let h;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Kruskal MST", false, {
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
      title: opts.title || "Kruskal MST",
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

Kruskal.HIGHLIGHT_CIRCLE_COLOR = "#000000";

Kruskal.SET_ARRAY_ELEM_WIDTH = 25;
Kruskal.SET_ARRAY_ELEM_HEIGHT = 25;
Kruskal.SET_ARRAY_START_X = 50;
Kruskal.SET_ARRAY_START_Y = 130;

Kruskal.EDGE_LIST_ELEM_WIDTH = 40;
Kruskal.EDGE_LIST_ELEM_HEIGHT = 40;
Kruskal.EDGE_LIST_COLUMN_WIDTH = 100;
Kruskal.EDGE_LIST_MAX_PER_COLUMN = 10;

Kruskal.EDGE_LIST_START_X = 150;
Kruskal.EDGE_LIST_START_Y = 130;

Kruskal.FIND_LABEL_1_X = 30;
Kruskal.FIND_LABEL_2_X = 120;
Kruskal.FIND_LABEL_1_Y = 30;
Kruskal.FIND_LABEL_2_Y = Kruskal.FIND_LABEL_1_Y;

Kruskal.MESSAGE_LABEL_X = 30;
Kruskal.MESSAGE_LABEL_Y = 50;

Kruskal.HIGHLIGHT_CIRCLE_COLOR_1 = "#FFAAAA";
Kruskal.HIGHLIGHT_CIRCLE_COLOR_2 = "#FF0000";

Kruskal.prototype = new Graph();
Kruskal.prototype.constructor = Kruskal;
Kruskal.superclass = Graph.prototype;

Kruskal.prototype.addControls = function () {
  this.startButton = addControlToAlgorithmBar("Button", "Run Kruskal");
  this.startButton.onclick = this.startCallback.bind(this);

  Kruskal.superclass.addControls.call(this, false);
};

Kruskal.prototype.init = function (am, w, h) {
  this.showEdgeCosts = true;
  Kruskal.superclass.init.call(this, am, w, h, false, false); // TODO:  add no edge label flag to this?
  // Setup called in base class init function
};

Kruskal.prototype.setup = function () {
  Kruskal.superclass.setup.call(this);
  this.messageID = new Array();
  this.commands = new Array();
  this.setID = new Array(this.size);
  this.setIndexID = new Array(this.size);
  this.setData = new Array(this.size);

  var i;
  for (i = 0; i < this.size; i++) {
    this.setID[i] = this.nextIndex++;
    this.setIndexID[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.setID[i],
      "-1",
      Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_ELEM_HEIGHT,
      Kruskal.SET_ARRAY_START_X,
      Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT,
    );
    this.cmd(
      "CreateLabel",
      this.setIndexID[i],
      i,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetForegroundColor", this.setIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Disjoint Set",
    Kruskal.SET_ARRAY_START_X - 1 * Kruskal.SET_ARRAY_ELEM_WIDTH,
    Kruskal.SET_ARRAY_START_Y - Kruskal.SET_ARRAY_ELEM_HEIGHT * 1.5,
    0,
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};

Kruskal.prototype.startCallback = function (event) {
  this.implementAction(this.doKruskal.bind(this), "");
};

Kruskal.prototype.disjointSetFind = function (valueToFind, highlightCircleID) {
  this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
  this.cmd("Step");
  while (this.setData[valueToFind] >= 0) {
    this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
    this.cmd(
      "Move",
      highlightCircleID,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y +
        this.setData[valueToFind] * Kruskal.SET_ARRAY_ELEM_HEIGHT,
    );
    this.cmd("Step");
    valueToFind = this.setData[valueToFind];
    this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
    this.cmd("Step");
  }
  this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
  return valueToFind;
};

Kruskal.prototype.doKruskal = function (ignored) {
  this.commands = new Array();

  const mstEdges = [];

  this.edgesListLeftID = new Array();
  this.edgesListRightID = new Array();
  this.edgesListLeft = new Array();
  this.edgesListRight = new Array();

  var i;
  var j;
  for (i = 0; i < this.size; i++) {
    this.setData[i] = -1;
    this.cmd("SetText", this.setID[i], "-1");
  }

  this.recolorGraph();

  // Create Edge List
  var top;
  for (i = 0; i < this.size; i++) {
    for (j = i + 1; j < this.size; j++) {
      if (this.adj_matrix[i][j] >= 0) {
        this.edgesListLeftID.push(this.nextIndex++);
        this.edgesListRightID.push(this.nextIndex++);
        top = this.edgesListLeftID.length - 1;
        this.edgesListLeft.push(i);
        this.edgesListRight.push(j);
        this.cmd(
          "CreateLabel",
          this.edgesListLeftID[top],
          i,
          Kruskal.EDGE_LIST_START_X +
            Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
              Kruskal.EDGE_LIST_COLUMN_WIDTH,
          Kruskal.EDGE_LIST_START_Y +
            (top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
              Kruskal.EDGE_LIST_ELEM_HEIGHT,
        );
        this.cmd(
          "CreateLabel",
          this.edgesListRightID[top],
          j,
          Kruskal.EDGE_LIST_START_X +
            Kruskal.EDGE_LIST_ELEM_WIDTH +
            Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
              Kruskal.EDGE_LIST_COLUMN_WIDTH,
          Kruskal.EDGE_LIST_START_Y +
            (top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
              Kruskal.EDGE_LIST_ELEM_HEIGHT,
        );
        this.cmd(
          "Connect",
          this.edgesListLeftID[top],
          this.edgesListRightID[top],
          EDGE_COLOR,
          0,
          0,
          this.adj_matrix[i][j],
        );
      }
    }
  }
  this.cmd("SetMessage", "Created edge list from graph");
  this.cmd("Step");

  // Sort edge list based on edge cost
  var edgeCount = this.edgesListLeftID.length;
  var tmpLeftID;
  var tmpRightID;
  var tmpLeft;
  var tmpRight;
  for (i = 1; i < edgeCount; i++) {
    tmpLeftID = this.edgesListLeftID[i];
    tmpRightID = this.edgesListRightID[i];
    tmpLeft = this.edgesListLeft[i];
    tmpRight = this.edgesListRight[i];
    j = i;
    while (
      j > 0 &&
      this.adj_matrix[this.edgesListLeft[j - 1]][this.edgesListRight[j - 1]] >
        this.adj_matrix[tmpLeft][tmpRight]
    ) {
      this.edgesListLeft[j] = this.edgesListLeft[j - 1];
      this.edgesListRight[j] = this.edgesListRight[j - 1];
      this.edgesListLeftID[j] = this.edgesListLeftID[j - 1];
      this.edgesListRightID[j] = this.edgesListRightID[j - 1];
      j = j - 1;
    }
    this.edgesListLeft[j] = tmpLeft;
    this.edgesListRight[j] = tmpRight;
    this.edgesListLeftID[j] = tmpLeftID;
    this.edgesListRightID[j] = tmpRightID;
  }
  for (i = 0; i < edgeCount; i++) {
    this.cmd(
      "Move",
      this.edgesListLeftID[i],
      Kruskal.EDGE_LIST_START_X +
        Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y +
        (i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT,
    );
    this.cmd(
      "Move",
      this.edgesListRightID[i],
      Kruskal.EDGE_LIST_START_X +
        Kruskal.EDGE_LIST_ELEM_WIDTH +
        Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y +
        (i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT,
    );
  }
  this.cmd("SetMessage", "Sorted edges by increasing weight");
  this.cmd("Step");

  var findLabelLeft = this.nextIndex++;
  var findLabelRight = this.nextIndex++;
  var highlightCircle1 = this.nextIndex++;
  var highlightCircle2 = this.nextIndex++;
  var moveLabelID = this.nextIndex++;

  var edgesAdded = 0;
  var nextListIndex = 0;
  this.cmd(
    "CreateLabel",
    findLabelLeft,
    "",
    Kruskal.FIND_LABEL_1_X,
    Kruskal.FIND_LABEL_1_Y,
    0,
  );
  this.cmd(
    "CreateLabel",
    findLabelRight,
    "",
    Kruskal.FIND_LABEL_2_X,
    Kruskal.FIND_LABEL_2_Y,
    0,
  );

  while (edgesAdded < this.size - 1 && nextListIndex < edgeCount) {
    const edgeU = this.edgesListLeft[nextListIndex];
    const edgeV = this.edgesListRight[nextListIndex];
    const edgeW = this.adj_matrix[edgeU][edgeV];

    this.cmd(
      "SetMessage",
      `Consider next cheapest edge (${edgeU}, ${edgeV}) with weight ${edgeW}`,
    );
    this.cmd(
      "SetEdgeHighlight",
      this.edgesListLeftID[nextListIndex],
      this.edgesListRightID[nextListIndex],
      1,
    );

    this.highlightEdge(edgeU, edgeV, 1);
    this.highlightEdge(edgeV, edgeU, 1);

    this.cmd(
      "SetText",
      findLabelLeft,
      "find(" + String(edgeU) + ") = ",
    );

    this.cmd(
      "CreateHighlightCircle",
      highlightCircle1,
      Kruskal.HIGHLIGHT_CIRCLE_COLOR_1,
      Kruskal.EDGE_LIST_START_X +
        Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y +
        (nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_ELEM_HEIGHT,
      15,
    );
    this.cmd(
      "Move",
      highlightCircle1,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y +
        edgeU * Kruskal.SET_ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetMessage", `Find representative for ${edgeU}`);
    this.cmd("Step");

    var left = this.disjointSetFind(
      edgeU,
      highlightCircle1,
    );
    this.cmd(
      "SetText",
      findLabelLeft,
      "find(" +
        String(edgeU) +
        ") = " +
        String(left),
    );

    this.cmd(
      "SetText",
      findLabelRight,
      "find(" + String(edgeV) + ") = ",
    );

    this.cmd(
      "CreateHighlightCircle",
      highlightCircle2,
      Kruskal.HIGHLIGHT_CIRCLE_COLOR_2,
      Kruskal.EDGE_LIST_START_X +
        Kruskal.EDGE_LIST_ELEM_WIDTH +
        Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y +
        (nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
          Kruskal.EDGE_LIST_ELEM_HEIGHT,
      15,
    );

    this.cmd(
      "Move",
      highlightCircle2,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y +
        edgeV * Kruskal.SET_ARRAY_ELEM_HEIGHT,
    );
    this.cmd("SetMessage", `Find representative for ${edgeV}`);
    this.cmd("Step");

    var right = this.disjointSetFind(
      edgeV,
      highlightCircle2,
    );
    this.cmd(
      "SetText",
      findLabelRight,
      "find(" +
        String(edgeV) +
        ") = " +
        String(right),
    );
    this.cmd(
      "SetMessage",
      `Compare representatives: ${left} vs ${right}`,
    );
    this.cmd("Step");

    if (left != right) {
      this.cmd(
        "SetMessage",
        `Different components. Add edge and union(${left}, ${right})`,
      );
      this.cmd("Step");

      mstEdges.push([edgeU, edgeV]);

      this.highlightEdge(edgeU, edgeV, 1);
      this.highlightEdge(edgeV, edgeU, 1);
      edgesAdded++;
      this.setEdgeColor(
        edgeU,
        edgeV,
        "#FF0000",
      );
      this.setEdgeColor(
        edgeV,
        edgeU,
        "#FF0000",
      );
      if (this.setData[left] < this.setData[right]) {
        this.cmd("SetText", this.setID[right], "");
        this.cmd(
          "CreateLabel",
          moveLabelID,
          this.setData[right],
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT,
        );
        this.cmd(
          "Move",
          moveLabelID,
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT,
        );
        this.cmd(
          "SetMessage",
          `Union by size: attach root ${right} under root ${left}`,
        );
        this.cmd("Step");
        this.cmd("Delete", moveLabelID);
        this.setData[left] = this.setData[left] + this.setData[right];
        this.setData[right] = left;
      } else {
        this.cmd("SetText", this.setID[left], "");
        this.cmd(
          "CreateLabel",
          moveLabelID,
          this.setData[left],
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT,
        );
        this.cmd(
          "Move",
          moveLabelID,
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT,
        );
        this.cmd(
          "SetMessage",
          `Union by size: attach root ${left} under root ${right}`,
        );
        this.cmd("Step");
        this.cmd("Delete", moveLabelID);
        this.setData[right] = this.setData[right] + this.setData[left];
        this.setData[left] = right;
      }
      this.cmd("SetText", this.setID[left], this.setData[left]);
      this.cmd("SetText", this.setID[right], this.setData[right]);
    } else {
      this.cmd(
        "SetMessage",
        "Vertices already in the same component. Skip edge to avoid cycle",
      );
      this.cmd("Step");
    }

    this.highlightEdge(edgeU, edgeV, 0);
    this.highlightEdge(edgeV, edgeU, 0);

    this.cmd("Delete", highlightCircle1);
    this.cmd("Delete", highlightCircle2);

    this.cmd("Delete", this.edgesListLeftID[nextListIndex]);
    this.cmd("Delete", this.edgesListRightID[nextListIndex]);
    this.cmd("SetText", findLabelLeft, "");
    this.cmd("SetText", findLabelRight, "");
    nextListIndex++;
  }
  this.cmd("Delete", findLabelLeft);
  this.cmd("Delete", findLabelRight);

  if (mstEdges.length > 0) {
    this.cmd("SetMessage", "Kruskal complete: highlighting MST edges");
    for (i = 0; i < mstEdges.length; i++) {
      this.highlightEdge(mstEdges[i][0], mstEdges[i][1], 1);
      this.highlightEdge(mstEdges[i][1], mstEdges[i][0], 1);
    }
    this.cmd("Step");
  }

  return this.commands;
};

Kruskal.prototype.reset = function () {
  this.messageID = new Array();
};

Kruskal.prototype.enableUI = function (event) {
  this.startButton.disabled = false;

  Kruskal.superclass.enableUI.call(this, event);
};
Kruskal.prototype.disableUI = function (event) {
  this.startButton.disabled = true;

  Kruskal.superclass.disableUI.call(this, event);
};
