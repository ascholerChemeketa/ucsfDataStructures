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
import { addRadioButtonGroupToAlgorithmBar } from "../AlgorithmLibrary/Algorithm.js";
import { Graph } from "./Graph.js";

export function GraphRepresentation(canvas) {
  // New-style usage: `new GraphRepresentation({ ...opts })` (preferred)
  // Legacy usage: `new GraphRepresentation(canvas)`
  let am;
  let w;
  let h;
  let graphOpts = null;

  if (canvas && typeof canvas.getContext === "function") {
    const legacyCanvas = canvas;
    am = initCanvas(legacyCanvas, null, "Graph Representation", false, {
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
      title: opts.title || "Graph Representation",
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

GraphRepresentation.prototype = new Graph();
GraphRepresentation.prototype.constructor = GraphRepresentation;
GraphRepresentation.superclass = Graph.prototype;

GraphRepresentation.prototype.addControls = function () {
  GraphRepresentation.superclass.addControls.call(this);

  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Unweighted Graph", "Weighted Graph"],
    "GraphWeightType",
  );
  this.unweightedGraphButton = radioButtonList[0];
  this.unweightedGraphButton.onclick = this.weightedGraphCallback.bind(
    this,
    false,
  );
  this.weightedGraphButton = radioButtonList[1];
  this.weightedGraphButton.onclick = this.weightedGraphCallback.bind(this, true);

  this.unweightedGraphButton.checked = !this.showEdgeCosts;
  this.weightedGraphButton.checked = this.showEdgeCosts;
};

GraphRepresentation.prototype.weightedGraphCallback = function (newWeighted) {
  if (newWeighted != this.showEdgeCosts) {
    this.showEdgeCosts = newWeighted;
    this.animationManager.resetAll();
    this.setup();
  }
};

GraphRepresentation.prototype.init = function (am, w, h, graphOpts) {
  if (graphOpts && typeof graphOpts === "object") {
    if (typeof graphOpts.showEdgeCosts === "boolean") {
      this.showEdgeCosts = graphOpts.showEdgeCosts;
    } else if (typeof graphOpts.weighted === "boolean") {
      this.showEdgeCosts = graphOpts.weighted;
    } else {
      this.showEdgeCosts = false;
    }
  } else {
    this.showEdgeCosts = false;
  }

  GraphRepresentation.superclass.init.call(this, am, w, h, true, false, graphOpts);
};
