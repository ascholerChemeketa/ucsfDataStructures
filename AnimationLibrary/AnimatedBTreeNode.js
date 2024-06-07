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

export function AnimatedBTreeNode(
  id,
  widthPerElem,
  h,
  numElems,
  fillColor,
  edgeColor,
) {
  fillColor = fillColor == undefined ? "#FFFFFF" : fillColor;
  edgeColor = edgeColor == undefined ? "#000000" : edgeColor;
  this.init(id, widthPerElem, h, numElems, fillColor, edgeColor);
}

AnimatedBTreeNode.prototype = new AnimatedObject();
AnimatedBTreeNode.prototype.constructor = AnimatedBTreeNode;
AnimatedBTreeNode.superclass = AnimatedObject.prototype;

AnimatedBTreeNode.MIN_WIDTH = 10;
AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT = 5;

AnimatedBTreeNode.prototype.init = function (
  id,
  widthPerElem,
  h,
  numElems,
  fillColor,
  edgeColor,
) {
  var MIN_WIDTH = 10;
  AnimatedBTreeNode.superclass.init.call(this);
  this.objectID = id;

  this.backgroundColor = fillColor;
  this.foregroundColor = edgeColor;
  
  this.svgRect = null;
  this.svgLabels = [];

  this.widthPerElement = widthPerElem;
  this.nodeHeight = h;
  this.numLabels = numElems;
  this.labels = new Array(this.numLabels);
  this.labelColors = new Array(this.numLabels);
  for (var i = 0; i < this.numLabels; i++) {
    this.labelColors[i] = this.foregroundColor;
  }
};

AnimatedBTreeNode.prototype.remove = function () {
  if (this.svgRect) {
    this.svgRect.remove();
    this.svgRect = null;
  }
  for (var i = 0; i < this.svgLabels.length; i++) {
    this.svgLabels[i].remove();
  }
};

AnimatedBTreeNode.prototype.getNumElements = function () {
  return this.numLabels;
};

AnimatedBTreeNode.prototype.getWidth = function () {
  if (this.numLabels > 0) {
    return this.widthPerElement * this.numLabels;
  } else {
    return AnimatedBTreeNode.MIN_WIDTH;
  }
};

AnimatedBTreeNode.prototype.setNumElements = function (newNumElements) {
  var i;
  if (this.numLabels < newNumElements) {
    for (i = this.numLabels; i < newNumElements; i++) {
      this.labels[i] = "";
      this.labelColors[i] = this.foregroundColor;
    }
    this.numLabels = newNumElements;
  } else if (this.numLabels > newNumElements) {
    for (i = newNumElements; i < this.numLabels; i++) {
      this.labels[i] = null;
    }
    this.numLabels = newNumElements;
  }
};

AnimatedBTreeNode.prototype.left = function () {
  return this.x - this.getWidth() / 2.0;
};

AnimatedBTreeNode.prototype.right = function () {
  return this.x + this.getWidth() / 2.0;
};

AnimatedBTreeNode.prototype.top = function () {
  return this.y - this.nodeHeight / 2.0;
};

AnimatedBTreeNode.prototype.bottom = function () {
  return this.y + this.nodeHeight / 2.0;
};

AnimatedBTreeNode.prototype.draw = function (context) {
  var startX;
  var startY;

  startX = this.left();
  if (isNaN(startX)) {
    startX = 0;
  }
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
  }

  if (this.highlighted) {
    context.strokeStyle = "#ff0000";
    context.fillStyle = "#ff0000";

    context.beginPath();
    context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.lineTo(
      startX + this.getWidth() + this.highlightDiff,
      startY - this.highlightDiff,
    );
    context.lineTo(
      startX + this.getWidth() + this.highlightDiff,
      startY + this.nodeHeight + this.highlightDiff,
    );
    context.lineTo(
      startX - this.highlightDiff,
      startY + this.nodeHeight + this.highlightDiff,
    );
    context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.closePath();
    context.stroke();
    context.fill();
  }

  this.svgRect.setAttributeNS(null, "x", startX);
  this.svgRect.setAttributeNS(null, "y", startY);
  
  this.svgRect.setAttributeNS(null, "width", this.getWidth());
  this.svgRect.setAttributeNS(null, "height", this.nodeHeight);

  context.strokeStyle = this.foregroundColor;
  context.fillStyle = this.backgroundColor;

  context.beginPath();
  context.moveTo(startX, startY);
  context.lineTo(startX + this.getWidth(), startY);
  context.lineTo(startX + this.getWidth(), startY + this.nodeHeight);
  context.lineTo(startX, startY + this.nodeHeight);
  context.lineTo(startX, startY);
  context.closePath();
  context.stroke();
  context.fill();

  context.textAlign = "center";
  context.textBaseline = "middle";

  for (var i = 0; i < this.numLabels; i++) {
    if (i >= this.svgLabels.length) {
      var svgns = "http://www.w3.org/2000/svg";
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


    var labelx =
      this.x -
      (this.widthPerElement * this.numLabels) / 2 +
      this.widthPerElement / 2 +
      i * this.widthPerElement;
    var labely = this.y + 1;

    context.fillStyle = this.labelColors[i];
    context.fillText(this.labels[i], labelx, labely);
    
    this.svgLabels[i].textContent = this.labels[i];
    this.svgLabels[i].setAttributeNS(null, "x", labelx);
    this.svgLabels[i].setAttributeNS(null, "y", labely);
  }

  if(this.numLabels < this.svgLabels.length) {
    for(var i = this.numLabels; i < this.svgLabels.length; i++) {
      this.svgLabels[i].remove();
    }
    this.svgLabels = this.svgLabels.slice(0, this.numLabels);
  }
};

AnimatedBTreeNode.prototype.getHeight = function () {
  return this.nodeHeight;
};

AnimatedBTreeNode.prototype.setForegroundColor = function (newColor) {
  this.foregroundColor = newColor;
  for (var i = 0; i < numLabels; i++) {
    labelColor[i] = newColor;
  }
};

AnimatedBTreeNode.prototype.setHighlight = function (value) {
  this.highlighted = value;
  if(!this.svgRect) return;
  if (this.highlighted) {
    this.svgRect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor--highlight); stroke-width: 3px;',
    );
  } else
    this.svgRect.setAttributeNS(
      null,
      "style",
      'fill: var(--svgFillColor); stroke: var(--svgColor); stroke-width: 1px;',
    );
};


// TODO:  Kill the magic numbers here
AnimatedBTreeNode.prototype.getTailPointerAttachPos = function (
  fromX,
  fromY,
  anchor,
) {
  if (anchor == 0) {
    return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
  } else if (anchor == this.numLabels) {
    return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
  } else {
    return [this.left() + anchor * this.widthPerElement, this.y];
  }
};

AnimatedBTreeNode.prototype.getHeadPointerAttachPos = function (fromX, fromY) {
  if (fromY < this.y - this.nodeHeight / 2) {
    return [this.x, this.y - this.nodeHeight / 2];
  } else if (this.fromY > this.y + this.nodeHeight / 2) {
    return [this.x, this.y + this.nodeHeight / 2];
  } else if (fromX < this.x - this.getWidth() / 2) {
    return [this.x - this.getWidth() / 2, this.y];
  } else {
    return [this.x + this.getWidth() / 2, this.y];
  }
};

AnimatedBTreeNode.prototype.createUndoDelete = function () {
  return new UndoDeleteBTreeNode(
    this.objectID,
    this.numLabels,
    this.labels,
    this.x,
    this.y,
    this.widthPerElement,
    this.nodeHeight,
    this.labelColors,
    this.backgroundColor,
    this.foregroundColor,
    this.layer,
    this.highlighted,
  );
};

AnimatedBTreeNode.prototype.getTextColor = function (textIndex) {
  textIndex = textIndex == undefined ? 0 : textIndex;
  return this.labelColors[textIndex];
};

AnimatedBTreeNode.prototype.getText = function (index) {
  index = index == undefined ? 0 : index;
  return this.labels[index];
};

AnimatedBTreeNode.prototype.setTextColor = function (color, textIndex) {
  textIndex = textIndex == undefined ? 0 : textIndex;
  this.labelColors[textIndex] = color;
  if(this.svgLabels[textIndex])
    this.svgLabels[textIndex].setAttributeNS(null, "style", "fill: " + color + "; stroke: none;");
};

AnimatedBTreeNode.prototype.setText = function (newText, textIndex) {
  textIndex = textIndex == undefined ? 0 : textIndex;
  this.labels[textIndex] = newText;
};

function UndoDeleteBTreeNode(
  id,
  numLab,
  labelText,
  x,
  y,
  wPerElement,
  nHeight,
  lColors,
  bgColor,
  fgColor,
  l,
  highlighted,
) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.widthPerElem = wPerElement;
  this.nodeHeight = nHeight;
  this.backgroundColor = bgColor;
  this.foregroundColor = fgColor;
  this.numElems = numLab;
  this.labels = labelText;

  this.labelColors = lColors;
  this.layer = l;
  this.highlighted = highlighted;
}

UndoDeleteBTreeNode.prototype = new UndoBlock();
UndoDeleteBTreeNode.prototype.constructor = UndoDeleteBTreeNode;

UndoDeleteBTreeNode.prototype.undoInitialStep = function (world) {
  world.addBTreeNode(
    this.objectID,
    this.widthPerElem,
    this.nodeHeight,
    this.numElems,
    this.backgroundColor,
    this.foregroundColor,
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  for (var i = 0; i < this.numElems; i++) {
    world.setText(this.objectID, this.labels[i], i);
    world.setTextColor(this.objectID, this.labelColors[i], i);
  }
  world.setHighlight(this.objectID, this.highlighted);
  world.setLayer(this.objectID, this.layer);
};
