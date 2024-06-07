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

  this.numLabels = numLab;

  this.labels = [];
  this.labelPosX = [];
  this.labelPosY = [];
  this.labelColors = [];
  this.nullPointer = false;

  this.currentHeightDif = 6;
  this.maxHeightDiff = 5;
  this.minHeightDiff = 3;
  
  this.svgRect = null;
  this.svgLinkBox = null;
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
  if (this.vertical) {
    return this.x - this.w / 2.0;
  } else if (this.linkPositionEnd) {
    return this.x - (this.w * (1 - this.linkPercent)) / 2;
  } else {
    return this.x - (this.w * (this.linkPercent + 1)) / 2;
  }
};

AnimatedLinkedList.prototype.setNull = function (np) {
  if (this.nullPointer != np) {
    this.nullPointer = np;
  }
};

AnimatedLinkedList.prototype.getNull = function () {
  return this.nullPointer;
};

AnimatedLinkedList.prototype.right = function () {
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
    this.labelPosX[0] =
      this.x +
      ((this.w * (1 - this.linkPercent)) / 2) * (1 / this.numLabels - 1);
    for (var i = 1; i < this.numLabels; i++) {
      this.labelPosY[i] = this.y;
      this.labelPosX[i] =
        this.labelPosX[i - 1] +
        (this.w * (1 - this.linkPercent)) / this.numLabels;
    }
  }
};

AnimatedLinkedList.prototype.getTailPointerAttachPos = function (
  fromX,
  fromY,
  anchor,
) {
  //return [this.centerX(), this.centerY()]
  
  if (this.vertical && this.linkPositionEnd) {
    return [this.x, this.y + this.h / 2.0];
  } else if (this.vertical && !this.linkPositionEnd) {
    return [this.x, this.y - this.h / 2.0];
  } else if (!this.vertical && this.linkPositionEnd) {
    return [this.x + this.w / 2.0, this.y];
  } // (!this.vertical && !this.linkPositionEnd)
  else {
    return [this.x - this.w / 2.0, this.y];
  }
};

AnimatedLinkedList.prototype.getHeadPointerAttachPos = function (fromX, fromY, anchorIndex) {
  if(anchorIndex === 1) {
    return [this.centerX(), this.top()]
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

AnimatedLinkedList.prototype.draw = function (context) {
  var startX;
  var startY;

  startX = this.left();
  startY = this.top();
  

  if (!this.svgRect) {
    var svgns = "http://www.w3.org/2000/svg";
    var rect = document.createElementNS(svgns, "rect");
    rect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor);',
    );
    context.svg.getElementById("nodes").appendChild(rect);
    this.svgRect = rect;
    this.svgRect.setAttributeNS(null, "width", this.w);
    this.svgRect.setAttributeNS(null, "height", this.h);
    
    var rect2 = document.createElementNS(svgns, "rect");
    rect2.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor);',
    );
    context.svg.getElementById("nodes").appendChild(rect2);
    this.svgLinkBox = rect2;
    if(this.vertical) {
      this.svgLinkBox.setAttributeNS(null, "width", this.w);
      this.svgLinkBox.setAttributeNS(null, "height", this.h * this.linkPercent);
    } else {
      this.svgLinkBox.setAttributeNS(null, "width", this.w * this.linkPercent);
      this.svgLinkBox.setAttributeNS(null, "height", this.h);
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
      this.svgRect.after(text);

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
    if (this.nullPointer) {
      context.lineTo(this.startX + this.w, this.bottom());
    }
    context.closePath();
    context.stroke();
  } else if (this.vertical && !this.linkPositionEnd) {
    startX = this.left();
    startY = this.top() + this.h * this.linkPercent;

    context.beginPath();
    context.moveTo(startX + this.w, startY);
    context.lineTo(startX, startY);
    if (this.nullPointer) {
      context.lineTo(startX + this.w, this.top());
    }
    context.closePath();
    context.stroke();
  } else if (!this.vertical && this.linkPositionEnd) {
    startX = this.right() - this.w * this.linkPercent;
    startY = this.top();

    context.beginPath();
    context.moveTo(startX, startY + this.h);
    context.lineTo(startX, startY);
    if (this.nullPointer) {
      context.lineTo(this.right(), startY + this.h);
    }
    context.closePath();
    context.stroke();

    
    this.svgLinkBox.setAttributeNS(null, "x", startX);
    this.svgLinkBox.setAttributeNS(null, "y", startY);
  
  } // (!vertical && !linkPositionEnd)
  else {
    startX = this.left() + this.w * this.linkPercent;
    startY = this.top();

    context.beginPath();
    context.moveTo(startX, startY + this.h);
    context.lineTo(startX, startY);
    if (this.nullPointer) {
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
  if (this.svgRect) {
    this.svgRect.remove();
    this.svgRect = null;
    
    this.svgLinkBox.remove();
    this.svgLinkBox = null;
    for (let i = 0; i < this.numLabels; i++) {
      this.svgLabels[i].remove();
      this.svgLabels[i] = null;
    }
  }
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
    this.backgroundColor,
    this.foregroundColor,
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setLayer(this.objectID, this.layer);
  world.setNull(this.objectID, this.nullPointer);
  for (var i = 0; i < this.numLabels; i++) {
    world.setText(this.objectID, this.labels[i], i);
    world.setTextColor(this.objectID, this.labelColors[i], i);
  }
};
