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

// Values for xJust / yJust:  "center", "left", "right", "top", "bottom"

import { AnimatedObject } from "./AnimatedObject.js";
import { UndoBlock } from "./UndoFunctions.js";

export var AnimatedRectangle = function (
  id,
  val,
  wth,
  hgt,
  xJust,
  yJust,
  fillColor,
  edgeColor,
) {
  this.w = wth;
  this.h = hgt;
  this.x = 0;
  this.y = 0;
  this.xJustify = xJust;
  this.yJustify = yJust;
  this.label = val;
  this.labelColor = edgeColor;

  this.backgroundColor = fillColor;
  this.foregroundColor = edgeColor;
  this.labelColor = this.foregroundColor;
  this.highlighted = false;
  this.objectID = id;
  this.nullPointer = false;
  this.alpha = 1.0;
  this.addedToScene = true;
  this.svgRect = null;
  this.svgText = null;
};

AnimatedRectangle.prototype = new AnimatedObject();
AnimatedRectangle.prototype.constructor = AnimatedRectangle;

AnimatedRectangle.prototype.setNull = function (np) {
  this.nullPointer = np;
  //this.draw();
};

AnimatedRectangle.prototype.getNull = function () {
  return this.nullPointer;
};

AnimatedRectangle.prototype.remove = function () {
  if (this.svgRect) {
    this.svgRect.remove();
    this.svgRect = null;
  }
  if (this.svgText) {
    this.svgText.remove();
    this.svgText = null;
  }
};

AnimatedRectangle.prototype.left = function () {
  if (this.xJustify == "left") {
    return this.x;
  } else if (this.xJustify == "center") {
    return this.x - this.w / 2.0;
  } // (this.xJustify == "right")
  else {
    return this.x - this.w;
  }
};

AnimatedRectangle.prototype.centerX = function () {
  if (this.xJustify == "center") {
    return this.x;
  } else if (this.xJustify == "left") {
    return this.x + this.w / 2.0;
  } // (this.xJustify == "right")
  else {
    return this.x - this.w / 2.0;
  }
};

AnimatedRectangle.prototype.centerY = function () {
  if (this.yJustify == "center") {
    return this.y;
  } else if (this.yJustify == "top") {
    return this.y + this.h / 2.0;
  } // (this.xJustify == "bottom")
  else {
    return this.y - this.w / 2.0;
  }
};

AnimatedRectangle.prototype.top = function () {
  if (this.yJustify == "top") {
    return this.y;
  } else if (this.yJustify == "center") {
    return this.y - this.h / 2.0;
  } //(this.xJustify == "bottom")
  else {
    return this.y - this.h;
  }
};

AnimatedRectangle.prototype.bottom = function () {
  if (this.yJustify == "top") {
    return this.y + this.h;
  } else if (this.yJustify == "center") {
    return this.y + this.h / 2.0;
  } //(this.xJustify == "bottom")
  else {
    return this.y;
  }
};

AnimatedRectangle.prototype.right = function () {
  if (this.xJustify == "left") {
    return this.x + this.w;
  } else if (this.xJustify == "center") {
    return this.x + this.w / 2.0;
  } // (this.xJustify == "right")
  else {
    return this.x;
  }
};

AnimatedRectangle.prototype.getHeadPointerAttachPos = function (fromX, fromY) {
  //return [this.left(), this.centerY()]
  return this.getClosestCardinalPoint(fromX, fromY);
};

AnimatedRectangle.prototype.getTailPointerAttachPos = function (fromX, fromY) {
  return [this.centerX(), this.centerY()]
  //return [this.x + this.w / 2.0, this.y + this.h / 2.0]
  return this.getClosestCardinalPoint(fromX, fromY);
};

AnimatedRectangle.prototype.setWidth = function (wdth) {
  this.w = wdth;
};

AnimatedRectangle.prototype.setHeight = function (hght) {
  this.h = hght;
};

AnimatedRectangle.prototype.getWidth = function () {
  return this.w;
};

AnimatedRectangle.prototype.getHeight = function () {
  return this.h;
};

// TODO:  Fix me!
AnimatedRectangle.prototype.draw = function (context) {
  if (!this.addedToScene) {
    return;
  }

  let svgJustify = 'middle';
  if(this.xJustify == "left")
    svgJustify = 'start';
  else if(this.xJustify == "right")
    svgJustify = 'end';
  
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

    var text = document.createElementNS(svgns, "text");
    text.setAttributeNS(null, "dominant-baseline", "middle");
    text.setAttributeNS(null, "text-anchor", svgJustify);
    text.setAttributeNS(
      null,
      "style",
      "fill: var(--svgColor); stroke: none; stroke-width: 1px;",
    );
    this.svgText = text;
    this.svgRect.after(text);
  }

  var startX;
  var startY;
  var labelPosX;
  var labelPosY;

  if (this.xJustify == "left") {
    startX = this.x;
    labelPosX = this.x + this.w / 2.0;
  } else if (this.xJustify == "center") {
    startX = this.x - this.w / 2.0;
    labelPosX = this.x;
  } else if (this.xJustify == "right") {
    startX = this.x - this.w;
    labelPosX = this.x - this.w / 2.0;
  }
  if (this.yJustify == "top") {
    startY = this.y;
    labelPosY = this.y + this.h / 2.0;
  } else if (this.yJustify == "center") {
    startY = this.y - this.h / 2.0;
    labelPosY = this.y;
  } else if (this.yJustify == "bottom") {
    startY = this.y - this.h;
    labelPosY = this.y - this.h / 2.0;
  }

  this.svgRect.setAttributeNS(null, "x", startX);
  this.svgRect.setAttributeNS(null, "y", startY);


  this.svgText.setAttributeNS(null, "x", labelPosX);
  this.svgText.setAttributeNS(null, "y", labelPosY + 1);

  if(this.nullPointer)
    this.svgText.textContent = "null";
  else
    this.svgText.textContent = this.label;

  context.globalAlpha = this.alpha;
  context.lineWidth = 1;

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

  if (this.nullPointer) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(startX + this.w, startY + this.h);
    context.closePath();
    context.stroke();
  }

  context.fillStyle = this.labelColor;

  context.textAlign = "center";
  let cssStyle = window.getComputedStyle(context.canvas);
  context.font = cssStyle.font;
  context.textBaseline = "middle";
  context.lineWidth = 1;
  context.fillText(this.label, this.x, this.y);
};

AnimatedRectangle.prototype.setText = function (newText, textIndex) {
  this.label = newText;
  // TODO:  setting text position?
};

AnimatedRectangle.prototype.createUndoDelete = function () {
  // TODO: Add color?
  return new UndoDeleteRectangle(
    this.objectID,
    this.label,
    this.x,
    this.y,
    this.w,
    this.h,
    this.xJustify,
    this.yJustify,
    this.backgroundColor,
    this.foregroundColor,
    this.highlighted,
    this.layer,
  );
};

AnimatedRectangle.prototype.setHighlight = function (value) {
  this.highlighted = value;
};

function UndoDeleteRectangle(
  id,
  lab,
  x,
  y,
  w,
  h,
  xJust,
  yJust,
  bgColor,
  fgColor,
  highlight,
  lay,
) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.width = w;
  this.height = h;
  this.xJustify = xJust;
  this.yJustify = yJust;
  this.backgroundColor = bgColor;
  this.foregroundColor = fgColor;
  this.nodeLabel = lab;
  this.layer = lay;
  this.highlighted = highlight;
}

UndoDeleteRectangle.prototype = new UndoBlock();
UndoDeleteRectangle.prototype.constructor = UndoDeleteRectangle;

UndoDeleteRectangle.prototype.undoInitialStep = function (world) {
  world.addRectangleObject(
    this.objectID,
    this.nodeLabel,
    this.width,
    this.height,
    this.xJustify,
    this.yJustify,
    this.backgroundColor,
    this.foregroundColor,
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setLayer(this.objectID, this.layer);
  world.setHighlight(this.objectID, this.highlighted);
};
