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

import { AnimatedObject } from "./AnimatedObject.js";
import { UndoBlock } from "./UndoFunctions.js";

export function AnimatedLinkedList(
  id,
  val,
  wth,
  hgt,
  linkPer,
  verticalOrientation,
  linkPosEnd,
  numLab,
  numLinks,
  fillColor,
  edgeColor,
) {
  this.init(
    id,
    val,
    wth,
    hgt,
    linkPer,
    verticalOrientation,
    linkPosEnd,
    numLab,
    numLinks,
    fillColor,
    edgeColor,
  );
}

AnimatedLinkedList.prototype = new AnimatedObject();
AnimatedLinkedList.prototype.constructor = AnimatedLinkedList;
AnimatedLinkedList.superclass = AnimatedObject.prototype;

AnimatedLinkedList.prototype.init = function (
  id,
  val,
  wth,
  hgt,
  linkPer,
  verticalOrientation,
  linkPosEnd,
  numLab,
  numLinks,
  fillColor,
  edgeColor,
) {
  AnimatedLinkedList.superclass.init.call(this);

  this.w = wth;
  this.h = hgt;
  this.backgroundColor = fillColor;
  this.foregroundColor = edgeColor;

  this.vertical = verticalOrientation;
  this.linkPositionEnd = linkPosEnd;
  this.linkPercent = linkPer;

  this.numLinks = typeof numLinks === "number" ? numLinks : 1;
  if (this.numLinks !== 2) {
    this.numLinks = 1;
  }

  this.numLabels = numLab;

  this.labels = [];
  this.labelPosX = [];
  this.labelPosY = [];
  this.labelColors = [];
  // Per-link null state. Index 0 is "next" (right), index 1 is "prev" (left)
  this.nullPointer = new Array(this.numLinks);
  for (let i = 0; i < this.numLinks; i++) {
    this.nullPointer[i] = false;
  }

  this.currentHeightDif = 6;
  this.maxHeightDiff = 5;
  this.minHeightDiff = 3;
  
  this.svgRect = null;
  this.svgGroup = null;
  // For singly linked list, svgLinkBox is used.
  // For doubly linked list, we use svgLinkBoxLeft/svgLinkBoxRight.
  this.svgLinkBox = null;
  this.svgLinkBoxLeft = null;
  this.svgLinkBoxRight = null;
  this.svgLabels = [];

  for (var i = 0; i < this.numLabels; i++) {
    this.labels[i] = "";
    this.labelPosX[i] = 0;
    this.labelPosY[i] = 0;
    this.labelColors[i] = this.foregroundColor;
  }

  this.labels[0] = val;
  this.highlighted = false;
  this.objectID = id;
};

AnimatedLinkedList.prototype.left = function () {
  if (this.numLinks === 2) {
    return this.x - this.w / 2.0;
  }
  if (this.vertical) {
    return this.x - this.w / 2.0;
  } else if (this.linkPositionEnd) {
    return this.x - (this.w * (1 - this.linkPercent)) / 2;
  } else {
    return this.x - (this.w * (this.linkPercent + 1)) / 2;
  }
};

AnimatedLinkedList.prototype.setNull = function (np, linkIndex) {
  if (this.numLinks === 1) {
    if (this.nullPointer[0] !== np) {
      this.nullPointer[0] = np;
    }
    return;
  }

  if (Array.isArray(np)) {
    for (let i = 0; i < this.numLinks; i++) {
      this.nullPointer[i] = !!np[i];
    }
    return;
  }

  const idx = typeof linkIndex === "number" ? linkIndex : 0;
  if (idx >= 0 && idx < this.numLinks) {
    this.nullPointer[idx] = np;
  }
};

AnimatedLinkedList.prototype.getNull = function (linkIndex) {
  if (this.numLinks === 1) {
    return this.nullPointer[0];
  }
  const idx = typeof linkIndex === "number" ? linkIndex : 0;
  if (idx >= 0 && idx < this.numLinks) {
    return this.nullPointer[idx];
  }
  return this.nullPointer[0];
};

AnimatedLinkedList.prototype.right = function () {
  if (this.numLinks === 2) {
    return this.x + this.w / 2.0;
  }
  if (this.vertical) {
    return this.x + this.w / 2.0;
  } else if (this.linkPositionEnd) {
    return this.x + (this.w * (this.linkPercent + 1)) / 2;
  } else {
    return this.x + (this.w * (1 - this.linkPercent)) / 2;
  }
};

AnimatedLinkedList.prototype.top = function () {
  if (!this.vertical) {
    return this.y - this.h / 2.0;
  } else if (this.linkPositionEnd) {
    return this.y - (this.h * (1 - this.linkPercent)) / 2;
  } else {
    return this.y - (this.h * (1 + this.linkPercent)) / 2;
  }
};

AnimatedLinkedList.prototype.bottom = function () {
  if (!this.vertical) {
    return this.y + this.h / 2.0;
  } else if (this.linkPositionEnd) {
    return this.y + (this.h * (1 + this.linkPercent)) / 2;
  } else {
    return this.y + (this.h * (1 - this.linkPercent)) / 2;
  }
};

// TODO: Should we move this to the draw function, and save the
//       space of the arrays?  Bit of a leftover from the Flash code,
//       which did drawing differently
AnimatedLinkedList.prototype.resetTextPosition = function () {
  if (this.vertical) {
    this.labelPosX[0] = this.x;

    this.labelPosY[0] =
      this.y +
      ((this.h * (1 - this.linkPercent)) / 2) * (1 / this.numLabels - 1);
    //				labelPosY[0] = -height * (1-linkPercent) / 2 + height*(1-linkPercent)/2*numLabels;
    for (var i = 1; i < this.numLabels; i++) {
      this.labelPosY[i] =
        this.labelPosY[i - 1] +
        (this.h * (1 - this.linkPercent)) / this.numLabels;
      this.labelPosX[i] = this.x;
    }
  } else {
    this.labelPosY[0] = this.y;
    // Compute the horizontal region used for labels (exclude pointer/link boxes)
    let labelRegionLeft = this.left();
    let labelRegionRight = this.right();

    if (this.numLinks === 2) {
      labelRegionLeft = this.left() + this.w * this.linkPercent;
      labelRegionRight = this.right() - this.w * this.linkPercent;
    } else if (this.linkPositionEnd) {
      // Single pointer box on the right
      labelRegionRight = this.right() - this.w * this.linkPercent;
    } else {
      // Single pointer box on the left
      labelRegionLeft = this.left() + this.w * this.linkPercent;
    }

    const labelRegionWidth = Math.max(0, labelRegionRight - labelRegionLeft);
    for (var i = 0; i < this.numLabels; i++) {
      this.labelPosY[i] = this.y;
      this.labelPosX[i] =
        labelRegionLeft + labelRegionWidth * ((i + 0.5) / this.numLabels);
    }
  }
};

AnimatedLinkedList.prototype.getTailPointerAttachPos = function (
  fromX,
  fromY,
  anchor,
) {
  //return [this.centerX(), this.centerY()]

  // Attach from the center of the pointer box (next/prev) rather than the node edge.
  // anchor 0: next (right). anchor 1: prev (left) for doubly-linked nodes.
  const linkSizeX = this.w * this.linkPercent;
  const linkSizeY = this.h * this.linkPercent;

  if (!this.vertical) {
    if (this.numLinks === 2) {
      if (anchor === 1) {
        // prev box (left)
        return [this.left() + linkSizeX / 2.0, this.y];
      }
      // next box (right)
      return [this.right() - linkSizeX / 2.0, this.y];
    }

    if (this.linkPositionEnd) {
      // next box on the right
      return [this.right() - linkSizeX / 2.0, this.y];
    }
    // next box on the left
    return [this.left() + linkSizeX / 2.0, this.y];
  }

  // Vertical layout
  if (this.linkPositionEnd) {
    // pointer box at bottom
    return [this.x, this.bottom() - linkSizeY / 2.0];
  }
  // pointer box at top
  return [this.x, this.top() + linkSizeY / 2.0];
};

AnimatedLinkedList.prototype.getHeadPointerAttachPos = function (fromX, fromY, anchorIndex) {
  if (anchorIndex === 2) {
    // Used for the "Current" pointer: attach to the bottom of the node.
    return [this.centerX(), this.bottom()];
  }
  if (anchorIndex === 1) {
    // For doubly-linked nodes, anchorIndex 1 is used for "prev" edges.
    // Those should attach to the right edge of the target node.
    if (this.numLinks === 2 && !this.vertical) {
      return [this.right(), this.y];
    }
    // Preserve existing behavior (used by some pointer boxes) for singly-linked nodes.
    return [this.centerX(), this.top()];
  }
  //return [this.centerX(), this.centerY()]
  return this.getClosestCardinalPoint(fromX, fromY);
};

AnimatedLinkedList.prototype.setWidth = function (wdth) {
  this.w = wdth;
  this.resetTextPosition();
};

AnimatedLinkedList.prototype.setHeight = function (hght) {
  this.h = hght;
  this.resetTextPosition();
};

AnimatedLinkedList.prototype.getWidth = function () {
  return this.w;
};

AnimatedLinkedList.prototype.getHeight = function () {
  return this.h;
};

AnimatedLinkedList.prototype.getSVGComponent = function () {
  return this.svgGroup;
};

AnimatedLinkedList.prototype.draw = function (context) {
  var startX;
  var startY;

  startX = this.left();
  startY = this.top();
  
  if (!this.addedToScene) {
    if (this.svgGroup) {
      this.svgGroup.setAttributeNS(null, "display", "none");
    }
    return;
  }


  if (!this.svgGroup) {
    var svgns = "http://www.w3.org/2000/svg";
    var group = document.createElementNS(svgns, "g");

    if (this.layer !== 0 && context.svg.getElementById(`layer_${this.layer}`)) {
      context.svg.getElementById(`layer_${this.layer}`).appendChild(group);
    } else {
      context.svg.getElementById("nodes").appendChild(group);
    }

    this.svgGroup = group;
  }

  this.svgGroup.setAttributeNS(null, "display", "block");

  if (!this.svgRect) {
    var rect = document.createElementNS(svgns, "rect");
    rect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor);',
    );
    this.svgGroup.appendChild(rect);
    this.svgRect = rect;
    this.svgRect.setAttributeNS(null, "width", this.w);
    this.svgRect.setAttributeNS(null, "height", this.h);
    
    if (this.numLinks === 2 && !this.vertical) {
      var rectLeft = document.createElementNS(svgns, "rect");
      rectLeft.setAttributeNS(
        null,
        "style",
        'fill: var(--svgFillColor); stroke: var(--svgColor);',
      );
      this.svgGroup.appendChild(rectLeft);
      this.svgLinkBoxLeft = rectLeft;
      this.svgLinkBoxLeft.setAttributeNS(null, "width", this.w * this.linkPercent);
      this.svgLinkBoxLeft.setAttributeNS(null, "height", this.h);

      var rectRight = document.createElementNS(svgns, "rect");
      rectRight.setAttributeNS(
        null,
        "style",
        'fill: var(--svgFillColor); stroke: var(--svgColor);',
      );
      this.svgGroup.appendChild(rectRight);
      this.svgLinkBoxRight = rectRight;
      this.svgLinkBoxRight.setAttributeNS(null, "width", this.w * this.linkPercent);
      this.svgLinkBoxRight.setAttributeNS(null, "height", this.h);
    } else {
      var rect2 = document.createElementNS(svgns, "rect");
      rect2.setAttributeNS(
        null,
        "style",
        'fill: var(--svgFillColor); stroke: var(--svgColor);',
      );
      this.svgGroup.appendChild(rect2);
      this.svgLinkBox = rect2;
      if (this.vertical) {
        this.svgLinkBox.setAttributeNS(null, "width", this.w);
        this.svgLinkBox.setAttributeNS(null, "height", this.h * this.linkPercent);
      } else {
        this.svgLinkBox.setAttributeNS(null, "width", this.w * this.linkPercent);
        this.svgLinkBox.setAttributeNS(null, "height", this.h);
      }
    }
    
    for (i = 0; i < this.numLabels; i++) {
      var text = document.createElementNS(svgns, "text");
      text.setAttributeNS(null, "dominant-baseline", "middle");
      text.setAttributeNS(null, "text-anchor", "middle");
      text.setAttributeNS(
        null,
        "style",
        "fill: var(--svgColor); stroke: none; stroke-width: 1px;",
      );
      this.svgLabels.push(text);
      this.svgGroup.appendChild(text);

      text.addEventListener("click", () => {
        let input = document.getElementById("inputField");
        if(input)
          input.value = text.textContent;
      });
    }
  }

  if (this.highlighted) {
    context.strokeStyle = "#ff0000";
    context.fillStyle = "#ff0000";

    context.beginPath();
    context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.lineTo(
      startX + this.w + this.highlightDiff,
      startY - this.highlightDiff,
    );
    context.lineTo(
      startX + this.w + this.highlightDiff,
      startY + this.h + this.highlightDiff,
    );
    context.lineTo(
      startX - this.highlightDiff,
      startY + this.h + this.highlightDiff,
    );
    context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.closePath();
    context.stroke();
    context.fill();
      this.svgRect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor--highlight); stroke-width: 3px;',
    );
  } else {
    this.svgRect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor); stroke-width: 1px;',
    );
  }
  this.svgRect.setAttributeNS(null, "x", startX);
  this.svgRect.setAttributeNS(null, "y", startY);

  context.strokeStyle = this.foregroundColor;
  context.fillStyle = this.backgroundColor;

  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(startX + this.w, startY);
  context.lineTo(startX + this.w, startY + this.h);
  context.lineTo(startX, startY + this.h);
  context.lineTo(startX, startY);
  context.closePath();
  context.stroke();
  context.fill();

  var i;
  if (this.vertical) {
    startX = this.left();
    for (i = 1; i < this.numLabels; i++) {
      //TODO: this doesn't look right ...
      startY =
        this.y + this.h * (1 - this.linkPercent) * (i / this.numLabels - 1 / 2);

      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(startX + this.w, startY);
      context.closePath();
      context.stroke();
    }
  } else {
    startY = this.top();
    for (i = 1; i < this.numLabels; i++) {
      startX =
        this.x + this.w * (1 - this.linkPercent) * (i / this.numLabels - 1 / 2);
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(startX, startY + this.h);
      context.closePath();
      context.stroke();
    }
  }

  if (this.vertical && this.linkPositionEnd) {
    startX = this.left();
    startY = this.bottom() - this.h * this.linkPercent;

    context.beginPath();
    context.moveTo(startX + this.w, startY);
    context.lineTo(startX, startY);
    if (this.nullPointer[0]) {
      context.lineTo(this.startX + this.w, this.bottom());
    }
    context.closePath();
    context.stroke();

    if (this.svgLinkBox) {
      this.svgLinkBox.setAttributeNS(null, "x", startX);
      this.svgLinkBox.setAttributeNS(null, "y", startY);
    }
  } else if (this.vertical && !this.linkPositionEnd) {
    startX = this.left();
    startY = this.top() + this.h * this.linkPercent;

    context.beginPath();
    context.moveTo(startX + this.w, startY);
    context.lineTo(startX, startY);
    if (this.nullPointer[0]) {
      context.lineTo(startX + this.w, this.top());
    }
    context.closePath();
    context.stroke();

    if (this.svgLinkBox) {
      this.svgLinkBox.setAttributeNS(null, "x", this.left());
      this.svgLinkBox.setAttributeNS(null, "y", this.top());
    }
  } else if (!this.vertical && this.numLinks === 2) {
    // Draw both separators + position both link boxes.
    const leftX = this.left() + this.w * this.linkPercent;
    const rightX = this.right() - this.w * this.linkPercent;
    startY = this.top();

    context.beginPath();
    context.moveTo(leftX, startY + this.h);
    context.lineTo(leftX, startY);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(rightX, startY + this.h);
    context.lineTo(rightX, startY);
    context.closePath();
    context.stroke();

    // Null indicators in pointer boxes (left=prev index 1, right=next index 0)
    if (this.nullPointer[1]) {
      context.beginPath();
      context.moveTo(this.left(), startY);
      context.lineTo(leftX, startY + this.h);
      context.closePath();
      context.stroke();
    }
    if (this.nullPointer[0]) {
      context.beginPath();
      context.moveTo(rightX, startY);
      context.lineTo(this.right(), startY + this.h);
      context.closePath();
      context.stroke();
    }

    if (this.svgLinkBoxLeft) {
      this.svgLinkBoxLeft.setAttributeNS(null, "x", this.left());
      this.svgLinkBoxLeft.setAttributeNS(null, "y", startY);
    }
    if (this.svgLinkBoxRight) {
      this.svgLinkBoxRight.setAttributeNS(null, "x", rightX);
      this.svgLinkBoxRight.setAttributeNS(null, "y", startY);
    }
  } else if (!this.vertical && this.linkPositionEnd) {
    startX = this.right() - this.w * this.linkPercent;
    startY = this.top();

    context.beginPath();
    context.moveTo(startX, startY + this.h);
    context.lineTo(startX, startY);
    if (this.nullPointer[0]) {
      context.lineTo(this.right(), startY + this.h);
    }
    context.closePath();
    context.stroke();

    
    if (this.svgLinkBox) {
      this.svgLinkBox.setAttributeNS(null, "x", startX);
      this.svgLinkBox.setAttributeNS(null, "y", startY);
    }
  
  } // (!vertical && !linkPositionEnd)
  else {
    startX = this.left() + this.w * this.linkPercent;
    startY = this.top();

    context.beginPath();
    context.moveTo(startX, startY + this.h);
    context.lineTo(startX, startY);
    if (this.nullPointer[0]) {
      context.lineTo(this.left(), startY);
    }
    context.closePath();
    context.stroke();
  }

  context.textAlign = "center";
  let cssStyle = window.getComputedStyle(context.canvas);
  context.font = cssStyle.font;
  context.textBaseline = "middle";
  context.lineWidth = 1;

  this.resetTextPosition();
  for (i = 0; i < this.numLabels; i++) {
    context.fillStyle = this.labelColors[i];
    context.fillText(this.labels[i], this.labelPosX[i], this.labelPosY[i]);
    
    this.svgLabels[i].textContent = this.labels[i];
    this.svgLabels[i].setAttributeNS(null, "x", this.labelPosX[i]);
    this.svgLabels[i].setAttributeNS(null, "y", this.labelPosY[i]);
  }
};

AnimatedLinkedList.prototype.setTextColor = function (color, textIndex) {
  this.labelColors[textIndex] = color;
};

AnimatedLinkedList.prototype.getTextColor = function (textIndex) {
  return this.labelColors[textIndex];
};

AnimatedLinkedList.prototype.getText = function (index) {
  return this.labels[index];
};

AnimatedLinkedList.prototype.setText = function (newText, textIndex) {
  this.labels[textIndex] = newText;
  this.resetTextPosition();
};

AnimatedLinkedList.prototype.remove = function () {
  if (this.svgGroup) {
    this.svgGroup.remove();
    this.svgGroup = null;
  }

  this.svgRect = null;
  this.svgLinkBox = null;
  this.svgLinkBoxLeft = null;
  this.svgLinkBoxRight = null;
  this.svgLabels = [];
};

AnimatedLinkedList.prototype.createUndoDelete = function () {
  return new UndoDeleteLinkedList(
    this.objectID,
    this.numLabels,
    this.labels,
    this.x,
    this.y,
    this.w,
    this.h,
    this.linkPercent,
    this.linkPositionEnd,
    this.vertical,
    this.labelColors,
    this.backgroundColor,
    this.foregroundColor,
    this.layer,
    this.nullPointer,
    this.numLinks,
  );
};

AnimatedLinkedList.prototype.setHighlight = function (value) {
  if (value != this.highlighted) {
    this.highlighted = value;
  }
};

function UndoDeleteLinkedList(
  id,
  numlab,
  lab,
  x,
  y,
  w,
  h,
  linkper,
  posEnd,
  vert,
  labColors,
  bgColor,
  fgColor,
  l,
  np,
  numLinks,
) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.width = w;
  this.height = h;
  this.backgroundColor = bgColor;
  this.foregroundColor = fgColor;
  this.labels = lab;
  this.linkPercent = linkper;
  this.verticalOrentation = vert;
  this.linkAtEnd = posEnd;
  this.labelColors = labColors;
  this.layer = l;
  this.numLabels = numlab;
  this.nullPointer = np;
  this.numLinks = typeof numLinks === "number" ? numLinks : 1;
}

UndoDeleteLinkedList.prototype = new UndoBlock();
UndoDeleteLinkedList.prototype.constructor = UndoDeleteLinkedList;

UndoDeleteLinkedList.prototype.undoInitialStep = function (world) {
  world.addLinkedListObject(
    this.objectID,
    this.labels[0],
    this.width,
    this.height,
    this.linkPercent,
    this.verticalOrentation,
    this.linkAtEnd,
    this.numLabels,
    this.numLinks,
    this.backgroundColor,
    this.foregroundColor,
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setLayer(this.objectID, this.layer);
  if (Array.isArray(this.nullPointer)) {
    for (let i = 0; i < this.nullPointer.length; i++) {
      world.setNull(this.objectID, this.nullPointer[i], i);
    }
  } else {
    world.setNull(this.objectID, this.nullPointer);
  }
  for (var i = 0; i < this.numLabels; i++) {
    world.setText(this.objectID, this.labels[i], i);
    world.setTextColor(this.objectID, this.labelColors[i], i);
  }
};
