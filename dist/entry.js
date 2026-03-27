// AnimationLibrary/Utils.js
var Colors = class {
  static BASE = "var(--svgColor)";
  static HIGHLIGHT = "var(--svgColor--highlight)";
  static ALT_HIGHLIGHT = "var(--svgColor--althighlight)";
  static FILL = "var(--svgFillColor)";
};
var RandomGenerator = class _RandomGenerator {
  constructor(seed) {
    this.generator = _RandomGenerator.sfc32(2654435769, 608135816, 3084996962, seed);
  }
  static sfc32(a, b, c, d) {
    return function() {
      a |= 0;
      b |= 0;
      c |= 0;
      d |= 0;
      let t = (a + b | 0) + d | 0;
      d = d + 1 | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = c << 21 | c >>> 11;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  nextInt(min, max) {
    return Math.floor(this.generator() * max) + min;
  }
  getInts(min, max, count) {
    let ints = [];
    for (let i = 0; i < count; i++) {
      ints.push(this.nextInt(min, max));
    }
    return ints;
  }
};

// AnimationLibrary/CustomEvents.js
function EventListener() {
  this.events = [];
}
EventListener.prototype.removeListener = function(kind, scope, func) {
  if (this.events[kind] == void 0) {
    return;
  }
  var scopeFunctions = null;
  var i;
  for (i = 0; i < this.events[kind].length; i++) {
    if (this.events[kind][i].scope == scope) {
      scopeFunctions = this.events[kind][i];
      break;
    }
  }
  if (scopeFunctions == null) {
    return;
  }
  for (i = 0; i < scopeFunctions.functions.length; i++) {
    if (scopeFunctions.functions[i] == func) {
      scopeFunctions.functions.splice(i, 1);
      return;
    }
  }
};
EventListener.prototype.addListener = function(kind, scope, func) {
  if (this.events[kind] === void 0) {
    this.events[kind] = [];
  }
  var i;
  var scopeFunctions = null;
  for (i = 0; i < this.events[kind].length; i++) {
    if (this.events[kind][i].scope == scope) {
      scopeFunctions = this.events[kind][i];
      break;
    }
  }
  if (scopeFunctions === null) {
    this.events[kind].push({ scope, functions: [] });
    scopeFunctions = this.events[kind][this.events[kind].length - 1];
  }
  for (i = 0; i < scopeFunctions.functions.length; i++) {
    if (scopeFunctions.functions[i] == func) {
      return;
    }
  }
  scopeFunctions.functions.push(func);
};
EventListener.prototype.fireEvent = function(kind, event) {
  if (this.events[kind] !== void 0) {
    for (var i = 0; i < this.events[kind].length; i++) {
      var objects = this.events[kind][i];
      var functs = objects.functions;
      var scope = objects.scope;
      for (var j = 0; j < functs.length; j++) {
        var func = functs[j];
        func.call(scope, event);
      }
    }
  }
};

// AnimationLibrary/AnimatedObject.js
function AnimatedObject() {
  this.init();
}
AnimatedObject.prototype.init = function() {
  this.backgroundColor = "#000F";
  this.foregroundColor = "var(--svgColor)";
  this.highlighted = false;
  this.objectID = -1;
  this.layer = 0;
  this.addedToScene = true;
  this.label = "";
  this.labelColor = "var(--svgColor)";
  this.alpha = 1;
  this.x = 0;
  this.y = 0;
  this.minHeightDiff = 3;
  this.range = 5;
  this.highlightIndex = -1;
  this.highlightIndexDirty = true;
};
AnimatedObject.prototype.alwaysOnTop = false;
AnimatedObject.prototype.setBackgroundColor = function(newColor) {
  this.backgroundColor = newColor;
};
AnimatedObject.prototype.setForegroundColor = function(newColor) {
  this.foregroundColor = newColor;
  this.labelColor = newColor;
};
AnimatedObject.prototype.setNull = function() {
};
AnimatedObject.prototype.getNull = function() {
  return false;
};
AnimatedObject.prototype.remove = function() {
};
AnimatedObject.prototype.setAlpha = function(newAlpha) {
  this.alpha = newAlpha;
};
AnimatedObject.prototype.getAlpha = function() {
  return this.alpha;
};
AnimatedObject.prototype.getHighlight = function() {
  return this.highlighted;
};
AnimatedObject.prototype.getWidth = function() {
  return 0;
};
AnimatedObject.prototype.getHeight = function() {
  return 0;
};
AnimatedObject.prototype.setHighlight = function(value) {
  this.highlighted = value;
};
AnimatedObject.prototype.centerX = function() {
  return this.x;
};
AnimatedObject.prototype.setWidth = function(newWidth) {
};
AnimatedObject.prototype.centerY = function() {
  return this.y;
};
AnimatedObject.prototype.getAlignLeftPos = function(otherObject) {
  return [otherObject.right() + this.getWidth() / 2, otherObject.centerY()];
};
AnimatedObject.prototype.getAlignRightPos = function(otherObject) {
  return [otherObject.left() - this.getWidth() / 2, otherObject.centerY()];
};
AnimatedObject.prototype.getAlignTopPos = function(otherObject) {
  return [otherObject.centerX(), otherObject.top() - this.getHeight() / 2];
};
AnimatedObject.prototype.getAlignBottomPos = function(otherObject) {
  return [otherObject.centerX(), otherObject.bottom() + this.getHeight() / 2];
};
AnimatedObject.prototype.alignLeft = function(otherObject) {
  this.y = otherObject.centerY();
  this.x = otherObject.right() + this.getWidth() / 2;
};
AnimatedObject.prototype.alignRight = function(otherObject) {
  this.y = otherObject.centerY();
  this.x = otherObject.left() - this.getWidth() / 2;
};
AnimatedObject.prototype.alignTop = function(otherObject) {
  this.x = otherObject.centerX();
  this.y = otherObject.top() - this.getHeight() / 2;
};
AnimatedObject.prototype.alignBottom = function(otherObject) {
  this.x = otherObject.centerX();
  this.y = otherObject.bottom() + this.getHeight() / 2;
};
AnimatedObject.prototype.getClosestCardinalPoint = function(fromX, fromY) {
  var xDelta;
  var yDelta;
  var xPos;
  var yPos;
  if (fromX < this.left()) {
    xDelta = this.left() - fromX;
    xPos = this.left();
  } else if (fromX > this.right()) {
    xDelta = fromX - this.right();
    xPos = this.right();
  } else {
    xDelta = 0;
    xPos = this.centerX();
  }
  if (fromY < this.top()) {
    yDelta = this.top() - fromY;
    yPos = this.top();
  } else if (fromY > this.bottom()) {
    yDelta = fromY - this.bottom();
    yPos = this.bottom();
  } else {
    yDelta = 0;
    yPos = this.centerY();
  }
  if (yDelta > xDelta) {
    xPos = this.centerX();
  } else {
    yPos = this.centerY();
  }
  return [xPos, yPos];
};
AnimatedObject.prototype.centered = function() {
  return false;
};
AnimatedObject.prototype.pulseHighlight = function(frameNum) {
  if (this.highlighted) {
    var frameMod = frameNum / 7;
    var delta = Math.abs(frameMod % (2 * this.range - 2) - this.range + 1);
    this.highlightDiff = delta + this.minHeightDiff;
  }
};
AnimatedObject.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint) {
  return [this.x, this.y];
};
AnimatedObject.prototype.getHeadPointerAttachPos = function(fromX, fromY) {
  return [this.x, this.y];
};
AnimatedObject.prototype.identifier = function() {
  return this.objectID;
};
AnimatedObject.prototype.getText = function(index) {
  return this.label;
};
AnimatedObject.prototype.getTextColor = function(textIndex) {
  return this.labelColor;
};
AnimatedObject.prototype.setTextColor = function(color, textIndex) {
  this.labelColor = color;
};
AnimatedObject.prototype.setText = function(newText, textIndex) {
  this.label = newText;
};
AnimatedObject.prototype.setHighlightIndex = function(hlIndex) {
  this.highlightIndex = hlIndex;
  this.highlightIndexDirty = true;
};
AnimatedObject.prototype.getHighlightIndex = function() {
  return this.highlightIndex;
};

// AnimationLibrary/UndoFunctions.js
function UndoBlock() {
}
UndoBlock.prototype.addUndoAnimation = function(animationList) {
  return false;
};
UndoBlock.prototype.undoInitialStep = function(world) {
};
function UndoMove(id, fmX, fmy, tx, ty) {
  this.objectID = id;
  this.fromX = fmX;
  this.fromY = fmy;
  this.toX = tx;
  this.toY = ty;
}
UndoMove.prototype = new UndoBlock();
UndoMove.prototype.constructor = UndoMove;
UndoMove.prototype.addUndoAnimation = function(animationList) {
  var nextAnim = new SingleAnimation(
    this.objectID,
    this.fromX,
    this.fromY,
    this.toX,
    this.toY
  );
  animationList.push(nextAnim);
  return true;
};
function UndoCreate(id) {
  this.objectID = id;
}
UndoCreate.prototype = new UndoBlock();
UndoCreate.prototype.constructor = UndoCreate;
UndoCreate.prototype.undoInitialStep = function(world) {
  world.removeObject(this.objectID);
};
function UndoHighlight(id, val) {
  this.objectID = id;
  this.highlightValue = val;
}
UndoHighlight.prototype = new UndoBlock();
UndoHighlight.prototype.constructor = UndoHighlight;
UndoHighlight.prototype.undoInitialStep = function(world) {
  world.setHighlight(this.objectID, this.highlightValue);
};
function UndoSetHeight(id, val) {
  this.objectID = id;
  this.height = val;
}
UndoSetHeight.prototype = new UndoBlock();
UndoSetHeight.prototype.constructor = UndoSetHeight;
UndoSetHeight.prototype.undoInitialStep = function(world) {
  world.setHeight(this.objectID, this.height);
};
function UndoSetWidth(id, val) {
  this.objectID = id;
  this.width = val;
}
UndoSetWidth.prototype = new UndoBlock();
UndoSetWidth.prototype.constructor = UndoSetWidth;
UndoSetWidth.prototype.undoInitialStep = function(world) {
  world.setWidth(this.objectID, this.width);
};
function UndoSetNumElements(obj, newNumElems) {
  this.objectID = obj.objectID;
  this.sizeBeforeChange = obj.getNumElements();
  this.sizeAfterChange = newNumElems;
  if (this.sizeBeforeChange > this.sizeAfterChange) {
    this.labels = new Array(this.sizeBeforeChange - this.sizeAfterChange);
    this.colors = new Array(this.sizeBeforeChange - this.sizeAfterChange);
    for (var i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++) {
      this.labels[i] = obj.getText(i + this.sizeAfterChange);
      this.colors[i] = obj.getTextColor(i + this.sizeAfterChange);
    }
  }
}
UndoSetNumElements.prototype = new UndoBlock();
UndoSetNumElements.prototype.constructor = UndoSetNumElements;
UndoSetNumElements.prototype.undoInitialStep = function(world) {
  world.setNumElements(this.objectID, this.sizeBeforeChange);
  if (this.sizeBeforeChange > this.sizeAfterChange) {
    for (var i = 0; i < this.sizeBeforeChange - this.sizeAfterChange; i++) {
      world.setText(this.objectID, this.labels[i], i + this.sizeAfterChange);
      world.setTextColor(
        this.objectID,
        this.colors[i],
        i + this.sizeAfterChange
      );
    }
  }
};
function UndoSetAlpha(id, alph) {
  this.objectID = id;
  this.alphaVal = alph;
}
UndoSetAlpha.prototype = new UndoBlock();
UndoSetAlpha.prototype.constructor = UndoSetAlpha;
UndoSetAlpha.prototype.undoInitialStep = function(world) {
  world.setAlpha(this.objectID, this.alphaVal);
};
function UndoSetNull(id, nv, linkIndex) {
  this.objectID = id;
  this.nullVal = nv;
  this.linkIndex = linkIndex;
}
UndoSetNull.prototype = new UndoBlock();
UndoSetNull.prototype.constructor = UndoSetNull;
UndoSetNull.prototype.undoInitialStep = function(world) {
  world.setNull(this.objectID, this.nullVal, this.linkIndex);
};
function UndoSetForegroundColor(id, color) {
  this.objectID = id;
  this.color = color;
}
UndoSetForegroundColor.prototype = new UndoBlock();
UndoSetForegroundColor.prototype.constructor = UndoSetForegroundColor;
UndoSetForegroundColor.prototype.undoInitialStep = function(world) {
  world.setForegroundColor(this.objectID, this.color);
};
function UndoSetBackgroundColor(id, color) {
  this.objectID = id;
  this.color = color;
}
UndoSetBackgroundColor.prototype = new UndoBlock();
UndoSetBackgroundColor.prototype.constructor = UndoSetBackgroundColor;
UndoSetBackgroundColor.prototype.undoInitialStep = function(world) {
  world.setBackgroundColor(this.objectID, this.color);
};
function UndoSetHighlightIndex(id, index) {
  this.objectID = id;
  this.index = index;
}
UndoSetHighlightIndex.prototype = new UndoBlock();
UndoSetHighlightIndex.prototype.constructor = UndoSetHighlightIndex;
UndoSetHighlightIndex.prototype.undoInitialStep = function(world) {
  world.setHighlightIndex(this.objectID, this.index);
};
function UndoSetText(id, str, index) {
  this.objectID = id;
  this.newText = str;
  this.labelIndex = index;
}
UndoSetText.prototype = new UndoBlock();
UndoSetText.prototype.constructor = UndoSetText;
UndoSetText.prototype.undoInitialStep = function(world) {
  world.setText(this.objectID, this.newText, this.labelIndex);
};
function UndoSetMessage(str) {
  this.message = str;
}
UndoSetMessage.prototype = new UndoBlock();
UndoSetMessage.prototype.constructor = UndoSetMessage;
UndoSetMessage.prototype.undoInitialStep = function(world) {
  document.getElementById("message").value = this.message;
};
function UndoSetTextColor(id, color, index) {
  this.objectID = id;
  this.color = color;
  this.index = index;
}
UndoSetTextColor.prototype = new UndoBlock();
UndoSetTextColor.prototype.constructor = UndoSetTextColor;
UndoSetTextColor.prototype.undoInitialStep = function(world) {
  world.setTextColor(this.objectID, this.color, this.index);
};
function UndoHighlightEdge(from, to, val) {
  this.fromID = from;
  this.toID = to;
  this.highlightValue = val;
}
UndoHighlightEdge.prototype = new UndoBlock();
UndoHighlightEdge.prototype.constructor = UndoHighlightEdge;
UndoHighlightEdge.prototype.undoInitialStep = function(world) {
  world.setEdgeHighlight(this.fromID, this.toID, this.highlightValue);
};
function UndoSetEdgeColor(from, to, oldColor) {
  this.fromID = from;
  this.toID = to;
  this.color = oldColor;
}
UndoSetEdgeColor.prototype = new UndoBlock();
UndoSetEdgeColor.prototype.constructor = UndoSetEdgeColor;
UndoSetEdgeColor.prototype.undoInitialStep = function(world) {
  world.setEdgeColor(this.fromID, this.toID, this.color);
};
function UndoSetEdgeAlpha(from, to, oldAplha) {
  this.fromID = from;
  this.toID = to;
  this.alpha = oldAplha;
}
UndoSetEdgeAlpha.prototype = new UndoBlock();
UndoSetEdgeAlpha.prototype.constructor = UndoSetEdgeAlpha;
UndoSetEdgeAlpha.prototype.undoInitialStep = function(world) {
  world.setEdgeAlpha(this.fromID, this.toID, this.alpha);
};
function UndoSetPosition(id, x, y) {
  this.objectID = id;
  this.x = x;
  this.y = y;
}
UndoSetPosition.prototype = new UndoBlock();
UndoSetPosition.prototype.constructor = UndoSetPosition;
UndoSetPosition.prototype.undoInitialStep = function(world) {
  world.setNodePosition(this.objectID, this.x, this.y);
};

// AnimationLibrary/AnimatedLabel.js
function AnimatedLabel(id, val, center, initialWidth) {
  this.centering = center;
  this.label = val;
  this.highlighted = false;
  this.objectID = id;
  this.alpha = 1;
  this.addedToScene = true;
  this.textWidth = 0;
  if (initialWidth != void 0) {
    this.textWidth = initialWidth;
  }
  this.fontSizePercent = 100;
  this.leftWidth = -1;
  this.centerWidth = -1;
  this.highlightIndex = -1;
  this.svgText = null;
}
AnimatedLabel.prototype = new AnimatedObject();
AnimatedLabel.prototype.constructor = AnimatedLabel;
AnimatedLabel.prototype.alwaysOnTop = true;
AnimatedLabel.prototype.remove = function() {
  if (this.svgText) {
    this.svgText.remove();
    this.svgText = null;
  }
};
AnimatedLabel.prototype.setFontSizePercent = function(fontSizePercent) {
  const parsed = Number(fontSizePercent);
  if (!Number.isFinite(parsed))
    return;
  this.fontSizePercent = Math.max(10, Math.min(200, parsed));
};
AnimatedLabel.prototype.centered = function() {
  return this.centering;
};
AnimatedLabel.prototype.getSVGComponent = function() {
  return this.svgText;
};
AnimatedLabel.prototype.draw = function(ctx) {
  let labelColor2 = this.labelColor ? this.labelColor : "var(--svgColor)";
  if (!this.addedToScene) {
    if (this.svgText) {
      this.svgText.setAttributeNS(null, "display", "none");
    }
    return;
  }
  if (!this.svgText) {
    var svgns = "http://www.w3.org/2000/svg";
    var text = document.createElementNS(svgns, "text");
    text.setAttributeNS(null, "dominant-baseline", "middle");
    text.setAttributeNS(null, "text-anchor", this.centering ? "middle" : "start");
    text.setAttribute("pointer-events", "none");
    ctx.svg.getElementById("nodes").appendChild(text);
    this.svgText = text;
  }
  this.svgText.setAttributeNS(null, "display", "block");
  this.svgText.setAttributeNS(null, "text-anchor", this.centering ? "middle" : "start");
  this.svgText.setAttributeNS(
    null,
    "style",
    `fill: ${labelColor2}; stroke: none; stroke-width: 1px; font-size: ${this.fontSizePercent}%;`
  );
  this.svgText.setAttributeNS(null, "x", this.x);
  this.svgText.setAttributeNS(null, "y", this.y + 1);
  this.svgText.textContent = this.label;
  ctx.globalAlpha = this.alpha;
  let cssStyle = window.getComputedStyle(ctx.canvas);
  ctx.font = cssStyle.font;
  var startingXForHighlight = this.x;
  if (this.highlightIndex >= this.label.length) {
    this.highlightIndex = -1;
  }
  if (this.highlightIndexDirty && this.highlightIndex != -1) {
    this.leftWidth = ctx.measureText(
      this.label.substring(0, this.highlightIndex)
    ).width;
    this.centerWidth = ctx.measureText(
      this.label.substring(this.highlightIndex, this.highlightIndex + 1)
    ).width;
    this.highlightIndexDirty = false;
  }
  if (this.centering) {
    if (this.highlightIndex != -1) {
      startingXForHighlight = this.x - this.width / 2;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }
  } else {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }
  if (this.highlighted) {
    ctx.strokeStyle = "#ffaaaa";
    ctx.fillStyle = "#ff0000";
    ctx.lineWidth = this.highlightDiff;
    ctx.strokeText(this.label, this.x, this.y);
    this.svgText.setAttributeNS(
      null,
      "style",
      `fill: var(--svgColor--highlight); stroke: none; stroke-width: 1px; font-size: ${this.fontSizePercent}%;`
    );
  } else {
    this.svgText.setAttributeNS(
      null,
      "style",
      `fill: ${this.labelColor}; stroke: none; stroke-width: 1px; font-size: ${this.fontSizePercent}%;`
    );
  }
  ctx.strokeStyle = this.labelColor;
  ctx.fillStyle = this.labelColor;
  ctx.lineWidth = 1;
  let strList = this.label.split("\n");
  if (strList.length == 1) {
    if (this.highlightIndex == -1) {
      ctx.fillText(this.label, this.x, this.y);
    } else {
      var leftStr = this.label.substring(0, this.highlightIndex);
      var highlightStr = this.label.substring(
        this.highlightIndex,
        this.highlightIndex + 1
      );
      var rightStr = this.label.substring(this.highlightIndex + 1);
      ctx.fillText(leftStr, startingXForHighlight, this.y);
      ctx.strokeStyle = "#FF0000";
      ctx.fillStyle = "#FF0000";
      ctx.fillText(
        highlightStr,
        startingXForHighlight + this.leftWidth,
        this.y
      );
      ctx.strokeStyle = this.labelColor;
      ctx.fillStyle = this.labelColor;
      ctx.fillText(
        rightStr,
        startingXForHighlight + this.leftWidth + this.centerWidth,
        this.y
      );
    }
  } else {
    var offset = this.centering ? (1 - strList.length) / 2 : 0;
    for (var i = 0; i < strList.length; i++) {
      ctx.fillText(strList[i], this.x, this.y + offset + i * 12);
    }
  }
  ctx.closePath();
};
AnimatedLabel.prototype.getAlignLeftPos = function(otherObject) {
  if (this.centering) {
    return [
      otherObject.left() - this.textWidth / 2,
      this.y = otherObject.centerY()
    ];
  } else {
    return [otherObject.left() - this.textWidth, otherObject.centerY() - 5];
  }
};
AnimatedLabel.prototype.alignLeft = function(otherObject) {
  if (this.centering) {
    this.y = otherObject.centerY();
    this.x = otherObject.left() - this.textWidth / 2;
  } else {
    this.y = otherObject.centerY() - 5;
    this.x = otherObject.left() - this.textWidth;
  }
};
AnimatedLabel.prototype.alignRight = function(otherObject) {
  if (this.centering) {
    this.y = otherObject.centerY();
    this.x = otherObject.right() + this.textWidth / 2;
  } else {
    this.y = otherObject.centerY() - 5;
    this.x = otherObject.right();
  }
};
AnimatedLabel.prototype.getAlignRightPos = function(otherObject) {
  if (this.centering) {
    return [otherObject.right() + this.textWidth / 2, otherObject.centerY()];
  } else {
    return [otherObject.right(), otherObject.centerY() - 5];
  }
};
AnimatedLabel.prototype.alignTop = function(otherObject) {
  if (this.centering) {
    this.y = otherObject.top() - 5;
    this.x = otherObject.centerX();
  } else {
    this.y = otherObject.top() - 10;
    this.x = otherObject.centerX() - this.textWidth / 2;
  }
};
AnimatedLabel.prototype.getAlignTopPos = function(otherObject) {
  if (this.centering) {
    return [otherObject.centerX(), otherObject.top() - 5];
  } else {
    return [otherObject.centerX() - this.textWidth / 2, otherObject.top() - 10];
  }
};
AnimatedLabel.prototype.alignBottom = function(otherObject) {
  if (this.centering) {
    this.y = otherObject.bottom() + 5;
    this.x = otherObject.centerX();
  } else {
    this.y = otherObject.bottom();
    this.x = otherObject.centerX() - this.textWidth / 2;
  }
};
AnimatedLabel.prototype.getAlignBottomPos = function(otherObject) {
  if (this.centering) {
    return [otherObject.centerX(), otherObject.bottom() + 5];
  } else {
    return [otherObject.centerX() - this.textWidth / 2, otherObject.bottom()];
  }
};
AnimatedLabel.prototype.getWidth = function() {
  return this.textWidth;
};
AnimatedLabel.prototype.getHeight = function() {
  return 10;
};
AnimatedLabel.prototype.setHighlight = function(value) {
  this.highlighted = value;
};
AnimatedLabel.prototype.createUndoDelete = function() {
  return new UndoDeleteLabel(
    this.objectID,
    this.label,
    this.x,
    this.y,
    this.centering,
    this.labelColor,
    this.layer,
    this.highlightIndex,
    this.fontSizePercent
  );
};
AnimatedLabel.prototype.centerX = function() {
  if (this.centering) {
    return this.x;
  } else {
    return this.x + this.textWidth;
  }
};
AnimatedLabel.prototype.centerY = function() {
  if (this.centering) {
    return this.y;
  } else {
    return this.y + 5;
  }
};
AnimatedLabel.prototype.top = function() {
  if (this.centering) {
    return this.y - 5;
  } else {
    return this.y;
  }
};
AnimatedLabel.prototype.bottom = function() {
  if (this.centering) {
    return this.y + 5;
  } else {
    return this.y + 10;
  }
};
AnimatedLabel.prototype.right = function() {
  if (this.centering) {
    return this.x + this.textWidth / 2;
  } else {
    return this.x + this.textWidth;
  }
};
AnimatedLabel.prototype.left = function() {
  if (this.centering) {
    return this.x - this.textWidth / 2;
  } else {
    return this.x;
  }
};
AnimatedLabel.prototype.setHighlightIndex = function(hlIndex) {
  if (this.label.indexOf("\n") == -1 && this.label.length > hlIndex) {
    this.highlightIndex = hlIndex;
    this.highlightIndexDirty = true;
  } else {
    this.highlightIndex = -1;
  }
};
AnimatedLabel.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint) {
  return this.getClosestCardinalPoint(fromX, fromY);
};
AnimatedLabel.prototype.getHeadPointerAttachPos = function(fromX, fromY) {
  return this.getClosestCardinalPoint(fromX, fromY);
};
AnimatedLabel.prototype.setText = function(newText, textIndex, initialWidth) {
  this.label = newText;
  if (initialWidth != void 0) {
    this.textWidth = initialWidth;
  }
};
function UndoDeleteLabel(id, lab, x, y, centered, color, l, hli, fontSizePercent) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.nodeLabel = lab;
  this.labCentered = centered;
  this.labelColor = color;
  this.layer = l;
  this.highlightIndex = hli;
  this.fontSizePercent = fontSizePercent;
  this.dirty = true;
}
UndoDeleteLabel.prototype = new UndoBlock();
UndoDeleteLabel.prototype.constructor = UndoDeleteLabel;
UndoDeleteLabel.prototype.undoInitialStep = function(world) {
  world.addLabelObject(
    this.objectID,
    this.nodeLabel,
    this.labCentered,
    this.fontSizePercent
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setForegroundColor(this.objectID, this.labelColor);
  world.setLayer(this.objectID, this.layer);
};

// AnimationLibrary/AnimatedCircle.js
var AnimatedCircle = function(objectID, objectLabel) {
  this.objectID = objectID;
  this.label = objectLabel;
  this.radius = 20;
  this.thickness = 3;
  this.x = 0;
  this.y = 0;
  this.alpha = 1;
  this.addedToScene = true;
  this.highlightIndex = -1;
  this.foregroundColor = "var(--svgColor)";
  this.backgroundColor = "rgba(255, 255, 255, 0)";
  this.svgCircle = null;
  this.svgText = null;
};
AnimatedCircle.prototype = new AnimatedObject();
AnimatedCircle.prototype.constructor = AnimatedCircle;
AnimatedCircle.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint) {
  return this.getHeadPointerAttachPos(fromX, fromY);
};
AnimatedCircle.prototype.getWidth = function() {
  return this.radius * 2;
};
AnimatedObject.prototype.setWidth = function(newWidth) {
  this.radius = newWidth / 2;
};
AnimatedCircle.prototype.remove = function() {
  if (this.svgCircle) {
    this.svgCircle.remove();
    this.svgCircle = null;
  }
  if (this.svgText) {
    this.svgText.remove();
    this.svgText = null;
  }
};
AnimatedCircle.prototype.getHeadPointerAttachPos = function(fromX, fromY) {
  var xVec = fromX - this.x;
  var yVec = fromY - this.y;
  var len = Math.sqrt(xVec * xVec + yVec * yVec);
  if (len == 0) {
    return [this.x, this.y];
  }
  return [
    this.x + xVec / len * this.radius,
    this.y + yVec / len * this.radius
  ];
};
AnimatedCircle.prototype.setHighlightIndex = function(hlIndex) {
  this.highlightIndex = hlIndex;
  this.highlightIndexDirty = true;
};
AnimatedCircle.prototype.updateCircle = function() {
  if (!this.addedToScene) {
    console.log(this.id + " not added to scene");
    return;
  }
  if (!this.svgCircle)
    return;
  let bg = this.backgroundColor ? this.backgroundColor : "var(--svgColor--background)";
  let fg = this.highlighted ? "var(--svgColor--highlight)" : this.foregroundColor;
  let sw = this.highlighted ? 3 : 1;
  this.svgCircle.setAttributeNS(
    null,
    "style",
    `fill: ${bg}; stroke: ${fg}; stroke-width: ${sw}px;`
  );
  if (this.svgText)
    this.svgText.setAttributeNS(
      null,
      "style",
      `fill: ${fg}; stroke: none; stroke-width: 1px;`
    );
};
AnimatedCircle.prototype.setHighlight = function(value) {
  this.highlighted = value;
  this.updateCircle();
};
AnimatedCircle.prototype.setBackgroundColor = function(newColor) {
  AnimatedObject.prototype.setBackgroundColor.call(this, newColor);
  this.updateCircle();
};
AnimatedCircle.prototype.setForegroundColor = function(newColor) {
  AnimatedObject.prototype.setForegroundColor.call(this, newColor);
  this.updateCircle();
};
AnimatedCircle.prototype.getSVGComponent = function() {
  return this.svgCircle;
};
AnimatedCircle.prototype.draw = function(ctx) {
  if (!this.addedToScene) {
    console.log(this.id + " not added to scene");
  }
  ctx.globalAlpha = this.alpha;
  if (!this.svgCircle) {
    var svgns = "http://www.w3.org/2000/svg";
    var circle = document.createElementNS(svgns, "circle");
    let fg = this.foregroundColor;
    let bg = this.backgroundColor;
    circle.setAttributeNS(
      null,
      "style",
      `fill: ${bg}; stroke: ${fg};`
    );
    circle.setAttribute("pointer-events", "visible");
    circle.setAttributeNS(null, "r", this.radius);
    ctx.svg.getElementById("nodes").appendChild(circle);
    this.svgCircle = circle;
    circle.addEventListener("click", () => {
      let input = document.getElementById("inputField");
      if (input)
        input.value = this.label;
    });
  }
  this.svgCircle.setAttributeNS(null, "cx", this.x);
  this.svgCircle.setAttributeNS(null, "cy", this.y);
  if (!this.addedToScene) {
    this.svgCircle.setAttributeNS(null, "display", "none");
    if (this.svgText) {
      this.svgText.setAttributeNS(null, "display", "none");
    }
  } else {
    this.svgCircle.setAttributeNS(null, "display", "block");
    if (this.svgText) {
      this.svgText.setAttributeNS(null, "display", "block");
    }
  }
  var strList = this.label.split("\n");
  if (strList.length == 1) {
    if (this.highlightIndexDirty && this.highlightIndex != -1) {
      this.leftWidth = ctx.measureText(
        this.label.substring(0, this.highlightIndex)
      ).width;
      this.centerWidth = ctx.measureText(
        this.label.substring(this.highlightIndex, this.highlightIndex + 1)
      ).width;
      this.textWidth = ctx.measureText(this.label).width;
      this.highlightIndexDirty = false;
    }
    if (this.highlightIndex != -1 && this.highlightIndex < this.label.length) {
      var startingXForHighlight = this.x - this.textWidth / 2;
      ctx.textAlign = "left";
      var leftStr = this.label.substring(0, this.highlightIndex);
      var highlightStr = this.label.substring(
        this.highlightIndex,
        this.highlightIndex + 1
      );
      var rightStr = this.label.substring(this.highlightIndex + 1);
      ctx.fillText(leftStr, startingXForHighlight, this.y);
      ctx.strokeStyle = "#FF0000";
      ctx.fillStyle = "#FF0000";
      ctx.fillText(
        highlightStr,
        startingXForHighlight + this.leftWidth,
        this.y
      );
      ctx.strokeStyle = this.labelColor;
      ctx.fillStyle = this.labelColor;
      ctx.fillText(
        rightStr,
        startingXForHighlight + this.leftWidth + this.centerWidth,
        this.y
      );
    } else {
      if (!this.svgText) {
        let fg = this.foregroundColor;
        var svgns = "http://www.w3.org/2000/svg";
        var text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "dominant-baseline", "middle");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(
          null,
          "style",
          `fill: ${fg}; stroke: none; stroke-width: 1px;`
        );
        text.setAttribute("pointer-events", "none");
        this.svgText = text;
        this.svgCircle.after(text);
      }
      this.svgText.setAttributeNS(null, "x", this.x);
      this.svgText.setAttributeNS(null, "y", this.y + 1);
      this.svgText.textContent = this.label;
      ctx.fillText(this.label, this.x, this.y + 1);
    }
  } else if (strList.length % 2 == 0) {
    var i;
    var mid = strList.length / 2;
    for (i = 0; i < strList.length / 2; i++) {
      ctx.fillText(strList[mid - i - 1], this.x, this.y - (i + 0.5) * 12);
      ctx.fillText(strList[mid + i], this.x, this.y + (i + 0.5) * 12);
    }
  } else {
    var mid = (strList.length - 1) / 2;
    var i;
    ctx.fillText(strList[mid], this.x, this.y);
    for (i = 0; i < mid; i++) {
      ctx.fillText(strList[mid - (i + 1)], this.x, this.y - (i + 1) * 12);
      ctx.fillText(strList[mid + (i + 1)], this.x, this.y + (i + 1) * 12);
    }
  }
};
AnimatedCircle.prototype.createUndoDelete = function() {
  return new UndoDeleteCircle(
    this.objectID,
    this.label,
    this.x,
    this.y,
    this.foregroundColor,
    this.backgroundColor,
    this.layer,
    this.radius
  );
};
function UndoDeleteCircle(id, lab, x, y, foregroundColor, backgroundColor, l, radius) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.nodeLabel = lab;
  this.fgColor = foregroundColor;
  this.bgColor = backgroundColor;
  this.layer = l;
  this.radius = radius;
}
UndoDeleteCircle.prototype = new UndoBlock();
UndoDeleteCircle.prototype.constructor = UndoDeleteCircle;
UndoDeleteCircle.prototype.undoInitialStep = function(world) {
  world.addCircleObject(this.objectID, this.nodeLabel);
  world.setWidth(this.objectID, this.radius * 2);
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setForegroundColor(this.objectID, this.fgColor);
  world.setBackgroundColor(this.objectID, this.bgColor);
  world.setLayer(this.objectID, this.layer);
};

// AnimationLibrary/AnimatedRectangle.js
var AnimatedRectangle = function(id, val, wth, hgt, xJust, yJust, fillColor, edgeColor, inBack = false) {
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
  this.alpha = 1;
  this.addedToScene = true;
  this.svgRect = null;
  this.svgText = null;
  this.inBack = inBack;
};
AnimatedRectangle.prototype = new AnimatedObject();
AnimatedRectangle.prototype.constructor = AnimatedRectangle;
AnimatedRectangle.prototype.setNull = function(np) {
  this.nullPointer = np;
};
AnimatedRectangle.prototype.getNull = function() {
  return this.nullPointer;
};
AnimatedRectangle.prototype.remove = function() {
  if (this.svgRect) {
    this.svgRect.remove();
    this.svgRect = null;
  }
  if (this.svgText) {
    this.svgText.remove();
    this.svgText = null;
  }
};
AnimatedRectangle.prototype.updateRectangle = function() {
  if (!this.svgRect) {
    return;
  }
  const display = this.addedToScene ? "block" : "none";
  this.svgRect.setAttributeNS(null, "display", display);
  if (this.svgText) {
    this.svgText.setAttributeNS(null, "display", display);
  }
  if (!this.addedToScene) {
    return;
  }
  const bg = this.backgroundColor;
  const fg = this.highlighted ? "var(--svgColor--highlight)" : this.foregroundColor;
  const sw = this.highlighted ? 3 : 1;
  this.svgRect.setAttributeNS(
    null,
    "style",
    `fill: ${bg}; stroke: ${fg}; stroke-width: ${sw}px;`
  );
  this.svgRect.setAttributeNS(null, "opacity", this.alpha);
  if (this.svgText) {
    this.svgText.setAttributeNS(
      null,
      "style",
      `fill: ${fg}; stroke: none; stroke-width: 1px;`
    );
    this.svgText.setAttributeNS(null, "opacity", this.alpha);
  }
};
AnimatedRectangle.prototype.getSVGComponent = function() {
  return this.svgRect;
};
AnimatedRectangle.prototype.left = function() {
  if (this.xJustify == "left") {
    return this.x;
  } else if (this.xJustify == "center") {
    return this.x - this.w / 2;
  } else {
    return this.x - this.w;
  }
};
AnimatedRectangle.prototype.centerX = function() {
  if (this.xJustify == "center") {
    return this.x;
  } else if (this.xJustify == "left") {
    return this.x + this.w / 2;
  } else {
    return this.x - this.w / 2;
  }
};
AnimatedRectangle.prototype.centerY = function() {
  if (this.yJustify == "center") {
    return this.y;
  } else if (this.yJustify == "top") {
    return this.y + this.h / 2;
  } else {
    return this.y - this.w / 2;
  }
};
AnimatedRectangle.prototype.top = function() {
  if (this.yJustify == "top") {
    return this.y;
  } else if (this.yJustify == "center") {
    return this.y - this.h / 2;
  } else {
    return this.y - this.h;
  }
};
AnimatedRectangle.prototype.bottom = function() {
  if (this.yJustify == "top") {
    return this.y + this.h;
  } else if (this.yJustify == "center") {
    return this.y + this.h / 2;
  } else {
    return this.y;
  }
};
AnimatedRectangle.prototype.right = function() {
  if (this.xJustify == "left") {
    return this.x + this.w;
  } else if (this.xJustify == "center") {
    return this.x + this.w / 2;
  } else {
    return this.x;
  }
};
AnimatedRectangle.prototype.getHeadPointerAttachPos = function(fromX, fromY) {
  return this.getClosestCardinalPoint(fromX, fromY);
};
AnimatedRectangle.prototype.getTailPointerAttachPos = function(fromX, fromY) {
  return [this.centerX(), this.centerY()];
  return this.getClosestCardinalPoint(fromX, fromY);
};
AnimatedRectangle.prototype.setWidth = function(wdth) {
  this.w = wdth;
};
AnimatedRectangle.prototype.setHeight = function(hght) {
  this.h = hght;
};
AnimatedRectangle.prototype.getWidth = function() {
  return this.w;
};
AnimatedRectangle.prototype.getHeight = function() {
  return this.h;
};
AnimatedRectangle.prototype.draw = function(context) {
  if (!this.addedToScene) {
    if (this.svgRect) {
      this.svgRect.setAttributeNS(null, "display", "none");
    }
    if (this.svgText) {
      this.svgText.setAttributeNS(null, "display", "none");
    }
    return;
  }
  let svgJustify = "middle";
  if (this.xJustify == "left")
    svgJustify = "start";
  else if (this.xJustify == "right")
    svgJustify = "end";
  if (!this.svgRect) {
    var svgns = "http://www.w3.org/2000/svg";
    var rect = document.createElementNS(svgns, "rect");
    rect.setAttributeNS(null, "style", "fill: #FFF0; stroke: var(--svgColor);");
    if (this.layer !== 0)
      context.svg.getElementById(`layer_${this.layer}`).appendChild(rect);
    else
      context.svg.getElementById("nodes").appendChild(rect);
    this.svgRect = rect;
    this.svgRect.setAttributeNS(null, "width", this.w);
    this.svgRect.setAttributeNS(null, "height", this.h);
    var text = document.createElementNS(svgns, "text");
    text.setAttributeNS(null, "dominant-baseline", "middle");
    text.setAttributeNS(null, "text-anchor", svgJustify);
    text.setAttributeNS(null, "style", "fill: var(--svgColor); stroke: none; stroke-width: 1px;");
    this.svgText = text;
    this.svgRect.after(text);
  }
  this.svgRect.setAttributeNS(null, "display", "block");
  if (this.svgText) {
    this.svgText.setAttributeNS(null, "display", "block");
  }
  var startX;
  var startY;
  var labelPosX;
  var labelPosY;
  if (this.xJustify == "left") {
    startX = this.x;
    labelPosX = this.x + this.w / 2;
  } else if (this.xJustify == "center") {
    startX = this.x - this.w / 2;
    labelPosX = this.x;
  } else if (this.xJustify == "right") {
    startX = this.x - this.w;
    labelPosX = this.x - this.w / 2;
  }
  if (this.yJustify == "top") {
    startY = this.y;
    labelPosY = this.y + this.h / 2;
  } else if (this.yJustify == "center") {
    startY = this.y - this.h / 2;
    labelPosY = this.y;
  } else if (this.yJustify == "bottom") {
    startY = this.y - this.h;
    labelPosY = this.y - this.h / 2;
  }
  this.svgRect.setAttributeNS(null, "x", startX);
  this.svgRect.setAttributeNS(null, "y", startY);
  this.svgText.setAttributeNS(null, "x", labelPosX);
  this.svgText.setAttributeNS(null, "y", labelPosY + 1);
  if (this.nullPointer)
    this.svgText.textContent = "null";
  else
    this.svgText.textContent = this.label;
  this.updateRectangle();
  context.globalAlpha = this.alpha;
  context.lineWidth = 1;
  if (this.highlighted) {
    context.strokeStyle = "#ff0000";
    context.fillStyle = "#ff0000";
    context.beginPath();
    context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.lineTo(
      startX + this.w + this.highlightDiff,
      startY - this.highlightDiff
    );
    context.lineTo(
      startX + this.w + this.highlightDiff,
      startY + this.h + this.highlightDiff
    );
    context.lineTo(
      startX - this.highlightDiff,
      startY + this.h + this.highlightDiff
    );
    context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.closePath();
    context.stroke();
    context.fill();
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
AnimatedRectangle.prototype.setText = function(newText, textIndex) {
  this.label = newText;
};
AnimatedRectangle.prototype.createUndoDelete = function() {
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
    this.layer
  );
};
AnimatedRectangle.prototype.setHighlight = function(value) {
  this.highlighted = value;
  this.updateRectangle();
};
AnimatedRectangle.prototype.setBackgroundColor = function(newColor) {
  AnimatedObject.prototype.setBackgroundColor.call(this, newColor);
  this.updateRectangle();
};
AnimatedRectangle.prototype.setForegroundColor = function(newColor) {
  AnimatedObject.prototype.setForegroundColor.call(this, newColor);
  this.updateRectangle();
};
function UndoDeleteRectangle(id, lab, x, y, w2, h, xJust, yJust, bgColor, fgColor, highlight, lay) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.width = w2;
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
UndoDeleteRectangle.prototype.undoInitialStep = function(world) {
  world.addRectangleObject(
    this.objectID,
    this.nodeLabel,
    this.width,
    this.height,
    this.xJustify,
    this.yJustify,
    this.backgroundColor,
    this.foregroundColor
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setLayer(this.objectID, this.layer);
  world.setHighlight(this.objectID, this.highlighted);
};

// AnimationLibrary/AnimatedLinkedList.js
function AnimatedLinkedList(id, val, wth, hgt, linkPer, verticalOrientation, linkPosEnd, numLab, numLinks, fillColor, edgeColor) {
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
    edgeColor
  );
}
AnimatedLinkedList.prototype = new AnimatedObject();
AnimatedLinkedList.prototype.constructor = AnimatedLinkedList;
AnimatedLinkedList.superclass = AnimatedObject.prototype;
AnimatedLinkedList.prototype.init = function(id, val, wth, hgt, linkPer, verticalOrientation, linkPosEnd, numLab, numLinks, fillColor, edgeColor) {
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
  this.nullPointer = new Array(this.numLinks);
  for (let i2 = 0; i2 < this.numLinks; i2++) {
    this.nullPointer[i2] = false;
  }
  this.currentHeightDif = 6;
  this.maxHeightDiff = 5;
  this.minHeightDiff = 3;
  this.svgRect = null;
  this.svgGroup = null;
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
AnimatedLinkedList.prototype.left = function() {
  if (this.numLinks === 2) {
    return this.x - this.w / 2;
  }
  if (this.vertical) {
    return this.x - this.w / 2;
  } else if (this.linkPositionEnd) {
    return this.x - this.w * (1 - this.linkPercent) / 2;
  } else {
    return this.x - this.w * (this.linkPercent + 1) / 2;
  }
};
AnimatedLinkedList.prototype.setNull = function(np, linkIndex) {
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
AnimatedLinkedList.prototype.getNull = function(linkIndex) {
  if (this.numLinks === 1) {
    return this.nullPointer[0];
  }
  const idx = typeof linkIndex === "number" ? linkIndex : 0;
  if (idx >= 0 && idx < this.numLinks) {
    return this.nullPointer[idx];
  }
  return this.nullPointer[0];
};
AnimatedLinkedList.prototype.right = function() {
  if (this.numLinks === 2) {
    return this.x + this.w / 2;
  }
  if (this.vertical) {
    return this.x + this.w / 2;
  } else if (this.linkPositionEnd) {
    return this.x + this.w * (this.linkPercent + 1) / 2;
  } else {
    return this.x + this.w * (1 - this.linkPercent) / 2;
  }
};
AnimatedLinkedList.prototype.top = function() {
  if (!this.vertical) {
    return this.y - this.h / 2;
  } else if (this.linkPositionEnd) {
    return this.y - this.h * (1 - this.linkPercent) / 2;
  } else {
    return this.y - this.h * (1 + this.linkPercent) / 2;
  }
};
AnimatedLinkedList.prototype.bottom = function() {
  if (!this.vertical) {
    return this.y + this.h / 2;
  } else if (this.linkPositionEnd) {
    return this.y + this.h * (1 + this.linkPercent) / 2;
  } else {
    return this.y + this.h * (1 - this.linkPercent) / 2;
  }
};
AnimatedLinkedList.prototype.resetTextPosition = function() {
  if (this.vertical) {
    this.labelPosX[0] = this.x;
    this.labelPosY[0] = this.y + this.h * (1 - this.linkPercent) / 2 * (1 / this.numLabels - 1);
    for (var i = 1; i < this.numLabels; i++) {
      this.labelPosY[i] = this.labelPosY[i - 1] + this.h * (1 - this.linkPercent) / this.numLabels;
      this.labelPosX[i] = this.x;
    }
  } else {
    this.labelPosY[0] = this.y;
    let labelRegionLeft = this.left();
    let labelRegionRight = this.right();
    if (this.numLinks === 2) {
      labelRegionLeft = this.left() + this.w * this.linkPercent;
      labelRegionRight = this.right() - this.w * this.linkPercent;
    } else if (this.linkPositionEnd) {
      labelRegionRight = this.right() - this.w * this.linkPercent;
    } else {
      labelRegionLeft = this.left() + this.w * this.linkPercent;
    }
    const labelRegionWidth = Math.max(0, labelRegionRight - labelRegionLeft);
    for (var i = 0; i < this.numLabels; i++) {
      this.labelPosY[i] = this.y;
      this.labelPosX[i] = labelRegionLeft + labelRegionWidth * ((i + 0.5) / this.numLabels);
    }
  }
};
AnimatedLinkedList.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor) {
  const linkSizeX = this.w * this.linkPercent;
  const linkSizeY = this.h * this.linkPercent;
  if (!this.vertical) {
    if (this.numLinks === 2) {
      if (anchor === 1) {
        return [this.left() + linkSizeX / 2, this.y];
      }
      return [this.right() - linkSizeX / 2, this.y];
    }
    if (this.linkPositionEnd) {
      return [this.right() - linkSizeX / 2, this.y];
    }
    return [this.left() + linkSizeX / 2, this.y];
  }
  if (this.linkPositionEnd) {
    return [this.x, this.bottom() - linkSizeY / 2];
  }
  return [this.x, this.top() + linkSizeY / 2];
};
AnimatedLinkedList.prototype.getHeadPointerAttachPos = function(fromX, fromY, anchorIndex) {
  if (anchorIndex === 2) {
    return [this.centerX(), this.bottom()];
  }
  if (anchorIndex === 1) {
    if (this.numLinks === 2 && !this.vertical) {
      return [this.right(), this.y];
    }
    return [this.centerX(), this.top()];
  }
  return this.getClosestCardinalPoint(fromX, fromY);
};
AnimatedLinkedList.prototype.setWidth = function(wdth) {
  this.w = wdth;
  this.resetTextPosition();
};
AnimatedLinkedList.prototype.setHeight = function(hght) {
  this.h = hght;
  this.resetTextPosition();
};
AnimatedLinkedList.prototype.getWidth = function() {
  return this.w;
};
AnimatedLinkedList.prototype.getHeight = function() {
  return this.h;
};
AnimatedLinkedList.prototype.getSVGComponent = function() {
  return this.svgGroup;
};
AnimatedLinkedList.prototype.draw = function(context) {
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
      "fill: var(--svgFillColor); stroke: var(--svgColor);"
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
        "fill: var(--svgFillColor); stroke: var(--svgColor);"
      );
      this.svgGroup.appendChild(rectLeft);
      this.svgLinkBoxLeft = rectLeft;
      this.svgLinkBoxLeft.setAttributeNS(null, "width", this.w * this.linkPercent);
      this.svgLinkBoxLeft.setAttributeNS(null, "height", this.h);
      var rectRight = document.createElementNS(svgns, "rect");
      rectRight.setAttributeNS(
        null,
        "style",
        "fill: var(--svgFillColor); stroke: var(--svgColor);"
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
        "fill: var(--svgFillColor); stroke: var(--svgColor);"
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
        "fill: var(--svgColor); stroke: none; stroke-width: 1px;"
      );
      this.svgLabels.push(text);
      this.svgGroup.appendChild(text);
      text.addEventListener("click", () => {
        let input = document.getElementById("inputField");
        if (input)
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
      startY - this.highlightDiff
    );
    context.lineTo(
      startX + this.w + this.highlightDiff,
      startY + this.h + this.highlightDiff
    );
    context.lineTo(
      startX - this.highlightDiff,
      startY + this.h + this.highlightDiff
    );
    context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
    context.closePath();
    context.stroke();
    context.fill();
    this.svgRect.setAttributeNS(
      null,
      "style",
      "fill: var(--svgFillColor); stroke: var(--svgColor--highlight); stroke-width: 3px;"
    );
  } else {
    this.svgRect.setAttributeNS(
      null,
      "style",
      "fill: var(--svgFillColor); stroke: var(--svgColor); stroke-width: 1px;"
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
      startY = this.y + this.h * (1 - this.linkPercent) * (i / this.numLabels - 1 / 2);
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(startX + this.w, startY);
      context.closePath();
      context.stroke();
    }
  } else {
    startY = this.top();
    for (i = 1; i < this.numLabels; i++) {
      startX = this.x + this.w * (1 - this.linkPercent) * (i / this.numLabels - 1 / 2);
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
  } else {
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
AnimatedLinkedList.prototype.setTextColor = function(color, textIndex) {
  this.labelColors[textIndex] = color;
};
AnimatedLinkedList.prototype.getTextColor = function(textIndex) {
  return this.labelColors[textIndex];
};
AnimatedLinkedList.prototype.getText = function(index) {
  return this.labels[index];
};
AnimatedLinkedList.prototype.setText = function(newText, textIndex) {
  this.labels[textIndex] = newText;
  this.resetTextPosition();
};
AnimatedLinkedList.prototype.remove = function() {
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
AnimatedLinkedList.prototype.createUndoDelete = function() {
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
    this.numLinks
  );
};
AnimatedLinkedList.prototype.setHighlight = function(value) {
  if (value != this.highlighted) {
    this.highlighted = value;
  }
};
function UndoDeleteLinkedList(id, numlab, lab, x, y, w2, h, linkper, posEnd, vert, labColors, bgColor, fgColor, l, np, numLinks) {
  this.objectID = id;
  this.posX = x;
  this.posY = y;
  this.width = w2;
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
UndoDeleteLinkedList.prototype.undoInitialStep = function(world) {
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
    this.foregroundColor
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  world.setLayer(this.objectID, this.layer);
  if (Array.isArray(this.nullPointer)) {
    for (let i2 = 0; i2 < this.nullPointer.length; i2++) {
      world.setNull(this.objectID, this.nullPointer[i2], i2);
    }
  } else {
    world.setNull(this.objectID, this.nullPointer);
  }
  for (var i = 0; i < this.numLabels; i++) {
    world.setText(this.objectID, this.labels[i], i);
    world.setTextColor(this.objectID, this.labelColors[i], i);
  }
};

// AnimationLibrary/AnimatedBTreeNode.js
function AnimatedBTreeNode(id, widthPerElem, h, numElems, fillColor, edgeColor) {
  fillColor = fillColor == void 0 ? "#FFFFFF" : fillColor;
  edgeColor = edgeColor == void 0 ? "#000000" : edgeColor;
  this.init(id, widthPerElem, h, numElems, fillColor, edgeColor);
}
AnimatedBTreeNode.prototype = new AnimatedObject();
AnimatedBTreeNode.prototype.constructor = AnimatedBTreeNode;
AnimatedBTreeNode.superclass = AnimatedObject.prototype;
AnimatedBTreeNode.MIN_WIDTH = 10;
AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT = 5;
AnimatedBTreeNode.prototype.init = function(id, widthPerElem, h, numElems, fillColor, edgeColor) {
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
AnimatedBTreeNode.prototype.remove = function() {
  if (this.svgRect) {
    this.svgRect.remove();
    this.svgRect = null;
  }
  for (var i = 0; i < this.svgLabels.length; i++) {
    this.svgLabels[i].remove();
  }
};
AnimatedBTreeNode.prototype.getNumElements = function() {
  return this.numLabels;
};
AnimatedBTreeNode.prototype.getWidth = function() {
  if (this.numLabels > 0) {
    return this.widthPerElement * this.numLabels;
  } else {
    return AnimatedBTreeNode.MIN_WIDTH;
  }
};
AnimatedBTreeNode.prototype.setNumElements = function(newNumElements) {
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
AnimatedBTreeNode.prototype.left = function() {
  return this.x - this.getWidth() / 2;
};
AnimatedBTreeNode.prototype.right = function() {
  return this.x + this.getWidth() / 2;
};
AnimatedBTreeNode.prototype.top = function() {
  return this.y - this.nodeHeight / 2;
};
AnimatedBTreeNode.prototype.bottom = function() {
  return this.y + this.nodeHeight / 2;
};
AnimatedBTreeNode.prototype.draw = function(context) {
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
      "fill: var(--svgFillColor); stroke: var(--svgColor);"
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
      startY - this.highlightDiff
    );
    context.lineTo(
      startX + this.getWidth() + this.highlightDiff,
      startY + this.nodeHeight + this.highlightDiff
    );
    context.lineTo(
      startX - this.highlightDiff,
      startY + this.nodeHeight + this.highlightDiff
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
        "fill: var(--svgColor); stroke: none; stroke-width: 1px;"
      );
      this.svgLabels.push(text);
      this.svgRect.after(text);
      text.addEventListener("click", () => {
        let input = document.getElementById("inputField");
        if (input)
          input.value = text.textContent;
      });
    }
    var labelx = this.x - this.widthPerElement * this.numLabels / 2 + this.widthPerElement / 2 + i * this.widthPerElement;
    var labely = this.y + 1;
    context.fillStyle = this.labelColors[i];
    context.fillText(this.labels[i], labelx, labely);
    this.svgLabels[i].textContent = this.labels[i];
    this.svgLabels[i].setAttributeNS(null, "x", labelx);
    this.svgLabels[i].setAttributeNS(null, "y", labely);
  }
  if (this.numLabels < this.svgLabels.length) {
    for (var i = this.numLabels; i < this.svgLabels.length; i++) {
      this.svgLabels[i].remove();
    }
    this.svgLabels = this.svgLabels.slice(0, this.numLabels);
  }
};
AnimatedBTreeNode.prototype.getHeight = function() {
  return this.nodeHeight;
};
AnimatedBTreeNode.prototype.setForegroundColor = function(newColor) {
  this.foregroundColor = newColor;
  for (var i = 0; i < numLabels; i++) {
    labelColor[i] = newColor;
  }
};
AnimatedBTreeNode.prototype.setHighlight = function(value) {
  this.highlighted = value;
  if (!this.svgRect)
    return;
  if (this.highlighted) {
    this.svgRect.setAttributeNS(
      null,
      "style",
      "fill: var(--svgFillColor); stroke: var(--svgColor--highlight); stroke-width: 3px;"
    );
  } else
    this.svgRect.setAttributeNS(
      null,
      "style",
      "fill: var(--svgFillColor); stroke: var(--svgColor); stroke-width: 1px;"
    );
};
AnimatedBTreeNode.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor) {
  if (anchor == 0) {
    return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
  } else if (anchor == this.numLabels) {
    return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
  } else {
    return [this.left() + anchor * this.widthPerElement, this.y];
  }
};
AnimatedBTreeNode.prototype.getHeadPointerAttachPos = function(fromX, fromY) {
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
AnimatedBTreeNode.prototype.createUndoDelete = function() {
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
    this.highlighted
  );
};
AnimatedBTreeNode.prototype.getTextColor = function(textIndex) {
  textIndex = textIndex == void 0 ? 0 : textIndex;
  return this.labelColors[textIndex];
};
AnimatedBTreeNode.prototype.getText = function(index) {
  index = index == void 0 ? 0 : index;
  return this.labels[index];
};
AnimatedBTreeNode.prototype.setTextColor = function(color, textIndex) {
  textIndex = textIndex == void 0 ? 0 : textIndex;
  this.labelColors[textIndex] = color;
  if (this.svgLabels[textIndex])
    this.svgLabels[textIndex].setAttributeNS(null, "style", "fill: " + color + "; stroke: none;");
};
AnimatedBTreeNode.prototype.setText = function(newText, textIndex) {
  textIndex = textIndex == void 0 ? 0 : textIndex;
  this.labels[textIndex] = newText;
};
function UndoDeleteBTreeNode(id, numLab, labelText, x, y, wPerElement, nHeight, lColors, bgColor, fgColor, l, highlighted) {
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
UndoDeleteBTreeNode.prototype.undoInitialStep = function(world) {
  world.addBTreeNode(
    this.objectID,
    this.widthPerElem,
    this.nodeHeight,
    this.numElems,
    this.backgroundColor,
    this.foregroundColor
  );
  world.setNodePosition(this.objectID, this.posX, this.posY);
  for (var i = 0; i < this.numElems; i++) {
    world.setText(this.objectID, this.labels[i], i);
    world.setTextColor(this.objectID, this.labelColors[i], i);
  }
  world.setHighlight(this.objectID, this.highlighted);
  world.setLayer(this.objectID, this.layer);
};

// AnimationLibrary/HighlightCircle.js
var HighlightCircle = function(objectID, color, radius) {
  this.objectID = objectID;
  this.radius = radius;
  this.thickness = 4;
  this.foregroundColor = color;
  this.x = 0;
  this.y = 0;
  this.alpha = 1;
  this.svgCircle = null;
};
HighlightCircle.prototype = new AnimatedObject();
HighlightCircle.prototype.constructor = HighlightCircle;
HighlightCircle.prototype.remove = function() {
  if (this.svgCircle) {
    this.svgCircle.remove();
    this.svgCircle = null;
  }
};
HighlightCircle.prototype.getSVGComponent = function() {
  return this.svgCircle;
};
HighlightCircle.prototype.draw = function(ctx) {
  if (!this.addedToScene) {
    if (this.svgCircle) {
      this.svgCircle.setAttributeNS(null, "display", "none");
    }
    return;
  }
  if (!this.svgCircle) {
    var svgns = "http://www.w3.org/2000/svg";
    var circle = document.createElementNS(svgns, "circle");
    circle.setAttributeNS(
      null,
      "style",
      "fill: rgba(255, 255, 255, 0); stroke: var(--svgColor--althighlight); stroke-width: 2px;"
    );
    circle.setAttribute("pointer-events", "visible");
    circle.setAttributeNS(null, "r", this.radius);
    if (this.layer !== 0 && ctx.svg.getElementById(`layer_${this.layer}`)) {
      ctx.svg.getElementById(`layer_${this.layer}`).appendChild(circle);
    } else {
      ctx.svg.getElementById("nodes").appendChild(circle);
    }
    this.svgCircle = circle;
  }
  this.svgCircle.setAttributeNS(null, "display", "block");
  this.svgCircle.setAttributeNS(null, "cx", this.x);
  this.svgCircle.setAttributeNS(null, "cy", this.y);
};
HighlightCircle.prototype.createUndoDelete = function() {
  return new UndoDeleteHighlightCircle(
    this.objectID,
    this.x,
    this.y,
    this.foregroundColor,
    this.radius,
    this.layer,
    this.alpha
  );
};
function UndoDeleteHighlightCircle(objectID, x, y, circleColor, r, layer, alpha) {
  this.objectID = objectID;
  this.x = x;
  this.y = y;
  this.color = circleColor;
  this.r = r;
  this.layer = layer;
  this.alpha = alpha;
}
UndoDeleteHighlightCircle.prototype = new UndoBlock();
UndoDeleteHighlightCircle.prototype.constructor = UndoDeleteHighlightCircle;
UndoDeleteHighlightCircle.prototype.undoInitialStep = function(world) {
  world.addHighlightCircleObject(this.objectID, this.color, this.r);
  world.setLayer(this.objectID, this.layer);
  world.setNodePosition(this.objectID, this.x, this.y);
  world.setAlpha(this.objectID, this.alpha);
};

// AnimationLibrary/Line.js
var LINE_maxHeightDiff = 5;
var LINE_minHeightDiff = 3;
var LINE_range = LINE_maxHeightDiff - LINE_minHeightDiff + 1;
function Line(n1, n2, color, cv, d, weight, anchorIndex) {
  this.arrowHeight = 8;
  this.arrowWidth = 4;
  this.Node1 = n1;
  this.Node2 = n2;
  this.Dirty = false;
  this.directed = d;
  if (color === void 0 || color === null || color.slice(0, 4) !== "var(")
    color = "var(--svgColor)";
  this.edgeColor = color;
  this.edgeLabel = weight;
  this.highlighted = false;
  this.addedToScene = true;
  this.anchorPoint = anchorIndex;
  this.highlightDiff = 0;
  this.curve = cv;
  this.svgLine = null;
  this.svgText = null;
  this.svgArrow = null;
  this.svgGroup = null;
  this.alpha = 1;
  this.color = function color2() {
    return this.edgeColor;
  };
  this.remove = function() {
    if (this.svgGroup) {
      this.svgGroup.remove();
      this.svgGroup = null;
    }
    this.svgLine = null;
    this.svgText = null;
    this.svgArrow = null;
  };
  this.getSVGComponent = function() {
    return this.svgGroup || this.svgLine;
  };
  this.setColor = function(newColor) {
    this.edgeColor = newColor;
    this.Dirty = true;
  };
  this.setHighlight = function(highlightVal) {
    this.highlighted = highlightVal;
    if (!this.svgLine)
      return;
    if (this.highlighted) {
      this.svgLine.setAttributeNS(
        null,
        "style",
        "fill: none; stroke: var(--svgColor--highlight); stroke-width: 1px;"
      );
      if (this.svgText) {
        this.svgText.setAttributeNS(null, "style", "fill: var(--svgColor--highlight); stroke: none;");
      }
      if (this.directed)
        this.svgLine.setAttributeNS(null, "marker-end", "url(#SVGTriangleMarkerHighlight)");
    } else {
      this.svgLine.setAttributeNS(
        null,
        "style",
        `fill: none; stroke: ${this.edgeColor}; stroke-width: 1px;`
      );
      if (this.svgText) {
        this.svgText.setAttributeNS(null, "style", `fill: ${this.edgeColor}; stroke: none;`);
      }
      if (this.directed)
        this.svgLine.setAttributeNS(null, "marker-end", "url(#SVGTriangleMarker)");
    }
  };
  this.pulseHighlight = function(frameNum) {
    if (this.highlighted) {
      var frameMod = frameNum / 14;
      var delta = Math.abs(frameMod % (2 * LINE_range - 2) - LINE_range + 1);
      this.highlightDiff = delta + LINE_minHeightDiff;
      this.Dirty = true;
    }
  };
  this.hasNode = function(n) {
    return this.Node1 == n || this.Node2 == n;
  };
  this.createUndoDisconnect = function() {
    return new UndoConnect(
      this.Node1.objectID,
      this.Node2.objectID,
      true,
      this.edgeColor,
      this.directed,
      this.curve,
      this.edgeLabel,
      this.anchorPoint
    );
  };
  this.sign = function(n) {
    if (n > 0) {
      return 1;
    } else {
      return -1;
    }
  };
  this.drawArrow = function(pensize, color2, context) {
    context.strokeStyle = color2;
    context.fillStyle = color2;
    context.lineWidth = pensize;
    var fromPos = this.Node1.getTailPointerAttachPos(
      this.Node2.x,
      this.Node2.y,
      this.anchorPoint
    );
    var toPos = this.Node2.getHeadPointerAttachPos(
      this.Node1.x,
      this.Node1.y,
      this.anchorPoint
    );
    var deltaX = toPos[0] - fromPos[0];
    var deltaY = toPos[1] - fromPos[1];
    var midX = deltaX / 2 + fromPos[0];
    var midY = deltaY / 2 + fromPos[1];
    var controlX = midX - deltaY * this.curve;
    var controlY = midY + deltaX * this.curve;
    context.beginPath();
    context.moveTo(fromPos[0], fromPos[1]);
    context.quadraticCurveTo(controlX, controlY, toPos[0], toPos[1]);
    context.stroke();
    let pathText = `M ${fromPos[0]} ${fromPos[1]} Q ${controlX} ${controlY} ${toPos[0]} ${toPos[1]}`;
    this.svgLine.setAttributeNS(null, "d", pathText);
    var labelPosX = 0.25 * fromPos[0] + 0.5 * controlX + 0.25 * toPos[0];
    var labelPosY = 0.25 * fromPos[1] + 0.5 * controlY + 0.25 * toPos[1];
    var midLen = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
    if (midLen != 0) {
      labelPosX += -deltaY * this.sign(this.curve) / midLen * 10;
      labelPosY += deltaX * this.sign(this.curve) / midLen * 10;
    }
    context.textAlign = "center";
    let cssStyle = window.getComputedStyle(context.canvas);
    context.font = cssStyle.font;
    context.textBaseline = "middle";
    context.fillText(this.edgeLabel, labelPosX, labelPosY);
    if (this.svgText) {
      this.svgText.setAttributeNS(null, "x", labelPosX);
      this.svgText.setAttributeNS(null, "y", labelPosY);
      this.svgText.textContent = String(this.edgeLabel);
    }
    if (this.directed) {
      var xVec = controlX - toPos[0];
      var yVec = controlY - toPos[1];
      var len = Math.sqrt(xVec * xVec + yVec * yVec);
      if (len > 0) {
        xVec = xVec / len;
        yVec = yVec / len;
        context.beginPath();
        context.moveTo(toPos[0], toPos[1]);
        context.lineTo(
          toPos[0] + xVec * this.arrowHeight - yVec * this.arrowWidth,
          toPos[1] + yVec * this.arrowHeight + xVec * this.arrowWidth
        );
        context.lineTo(
          toPos[0] + xVec * this.arrowHeight + yVec * this.arrowWidth,
          toPos[1] + yVec * this.arrowHeight - xVec * this.arrowWidth
        );
        context.lineTo(toPos[0], toPos[1]);
        context.closePath();
        context.stroke();
        context.fill();
      }
    }
  };
  this.draw = function(ctx) {
    ctx.globalAlpha = this.alpha;
    if (!this.svgLine) {
      var svgns = "http://www.w3.org/2000/svg";
      const group = document.createElementNS(svgns, "g");
      ctx.svg.getElementById("edges").appendChild(group);
      this.svgGroup = group;
      var line = document.createElementNS(svgns, "path");
      line.setAttributeNS(
        null,
        "style",
        `fill: none; stroke: ${this.edgeColor}; stroke-width: 1px;`
      );
      if (this.directed)
        line.setAttributeNS(null, "marker-end", "url(#SVGTriangleMarker)");
      group.appendChild(line);
      this.svgLine = line;
      const hasEdgeLabel = this.edgeLabel !== void 0 && this.edgeLabel !== null && String(this.edgeLabel) !== "";
      if (hasEdgeLabel) {
        const text = document.createElementNS(svgns, "text");
        text.setAttributeNS(null, "dominant-baseline", "middle");
        text.setAttributeNS(null, "text-anchor", "middle");
        text.setAttributeNS(null, "style", `fill: ${this.edgeColor}; stroke: none;`);
        text.setAttribute("pointer-events", "none");
        group.appendChild(text);
        this.svgText = text;
      }
    }
    if (this.highlighted)
      this.drawArrow(this.highlightDiff, "#FF0000", ctx);
    else
      this.drawArrow(1, this.edgeColor, ctx);
    const display = this.addedToScene ? "block" : "none";
    if (this.svgGroup) {
      this.svgGroup.setAttributeNS(null, "display", display);
    } else {
      this.svgLine.setAttributeNS(null, "display", display);
      if (this.svgText)
        this.svgText.setAttributeNS(null, "display", display);
    }
  };
}
function UndoConnect(from, to, createConnection, edgeColor, isDirected, cv, lab, anch) {
  this.fromID = from;
  this.toID = to;
  this.connect = createConnection;
  this.color = edgeColor;
  this.directed = isDirected;
  this.curve = cv;
  this.edgeLabel = lab;
  this.anchorPoint = anch;
}
UndoConnect.prototype.undoInitialStep = function(world) {
  if (this.connect) {
    world.connectEdge(
      this.fromID,
      this.toID,
      this.color,
      this.curve,
      this.directed,
      this.edgeLabel,
      this.anchorPoint
    );
  } else {
    world.disconnect(this.fromID, this.toID);
  }
};
UndoConnect.prototype.addUndoAnimation = function(animationList) {
  return false;
};

// AnimationLibrary/ObjectManager.js
var Dragable = class {
  constructor(el) {
    this.offset = { x: 0, y: 0 };
    this.dragging = false;
    this.el = el;
    this.dragStart = this.dragStart.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.dragMove = this.dragMove.bind(this);
    el.addEventListener("touchstart", this.dragStart);
    el.addEventListener("mousedown", this.dragStart);
    el.addEventListener("mouseup", this.dragEnd);
    el.addEventListener("touchend", this.dragEnd);
    el.addEventListener("touchmove", this.dragMove);
    el.addEventListener("mousemove", this.dragMove);
    el.addEventListener("mouseleave", this.dragEnd);
  }
  getMousePosition(evt) {
    if (evt.type.indexOf("touch") !== -1) {
      evt = evt.touches[0];
    }
    var CTM = this.el.getScreenCTM();
    let mousePos = {
      x: evt.clientX / CTM.a,
      y: evt.clientY / CTM.d
    };
    this.lastMouse = mousePos;
    return mousePos;
  }
  dragStart(e) {
    this.dragging = true;
    this.startDragCoords = this.getMousePosition(e);
    let curViewBox = this.el.getAttribute("viewBox").split(" ");
    this.offset.x = -curViewBox[0];
    this.offset.y = -curViewBox[1];
  }
  dragEnd(e) {
    if (!this.dragging)
      return;
    this.dragging = false;
    let curPos = this.lastMouse;
    if (e.type.indexOf("touch") === -1) {
      curPos = this.getMousePosition(e);
    }
    let delta = { x: 0, y: 0 };
    delta.x = curPos.x - this.startDragCoords.x;
    delta.y = curPos.y - this.startDragCoords.y;
    this.offset.x += delta.x;
    this.offset.y += delta.y;
  }
  dragMove(e) {
    e.preventDefault();
    if (!this.dragging)
      return;
    let curPos = this.getMousePosition(e);
    let delta = { x: 0, y: 0 };
    delta.x = curPos.x - this.startDragCoords.x;
    delta.y = curPos.y - this.startDragCoords.y;
    let curViewBox = this.el.getAttribute("viewBox").split(" ");
    curViewBox[0] = -this.offset.x - delta.x;
    curViewBox[1] = -this.offset.y - delta.y;
    this.el.setAttribute("viewBox", curViewBox.join(" "));
  }
};
function makeSVG(centered, viewWidth = 800, viewHeight = 400) {
  let sizeStyle = centered ? "xMidYMin" : "xMinYMin";
  const s = `
  <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${viewWidth} ${viewHeight}" 
     preserveAspectRatio="${sizeStyle} slice">
    <defs>
      <marker id="SVGTriangleMarker" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8"
        markerHeight="8" orient="auto-start-reverse">
        <path fill="var(--svgColor)" d="M 0 0 L 10 5 L 0 10 z"></path>
      </marker>
      <marker id="SVGTriangleMarkerHighlight" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8"
        markerHeight="8" orient="auto-start-reverse">
        <path fill="var(--svgColor--highlight)" d="M 0 0 L 10 5 L 0 10 z"></path>
      </marker>
      <style>
      // :root {
      //   --svgColor: var(rgb(0,0,0);
      //   --svgColor--red: rgb(231, 36, 36);
      //   --svgColor--redback: rgb(255, 233, 233);
      //   --svgColor--black: rgb(0, 0 ,0);
      //   --svgColor--blackback: rgb(227, 227, 227);
      //   --svgColor--highlight: rgb(33, 139, 33);
      //   --svgColor--althighlight: rgb(52, 133, 198);
      //   --svgFillColor: white;
      //   --controlBackground: #f0f8ff;
      //   font-family: sans-serif;
      // }
      </style>
    </defs>
    <g id="allElements">
      <g id="layer_0">
        <g id="nodes" />
        <g id="edges" />
      </g>
    </g>
  </svg>`;
  let svg = new DOMParser().parseFromString(s, "text/xml").documentElement;
  new Dragable(svg);
  return svg;
}
function ObjectManager(canvas2, centered = false) {
  this.Nodes = [];
  this.Edges = /* @__PURE__ */ new Map();
  this.BackEdges = /* @__PURE__ */ new Map();
  this.activeLayers = [];
  this.activeLayers[0] = true;
  this.ctx = canvas2.getContext("2d");
  const baseViewWidth = Number.isFinite(canvas2?.width) && canvas2.width > 0 ? canvas2.width : 800;
  const baseViewHeight = Number.isFinite(canvas2?.height) && canvas2.height > 0 ? canvas2.height : 400;
  this.svg = makeSVG(centered, baseViewWidth, baseViewHeight);
  this.ctx.svg = this.svg;
  this.framenum = 0;
  this.width = 0;
  this.height = 0;
  this.centered = centered;
  this.svgBaseViewWidth = baseViewWidth;
  this.svgBaseViewHeight = baseViewHeight;
  this.svgXOffset = 0;
  this.svgYOffset = 0;
  this.svgZoom = 1;
  this.setZoom = function(zoomLevel, focusClientX, focusClientY) {
    zoomLevel = parseFloat(zoomLevel);
    if (!Number.isFinite(zoomLevel) || zoomLevel <= 0)
      return;
    if (innerWidth < 400)
      zoomLevel /= 1.5;
    const vb = this.svg.getAttribute("viewBox").split(" ").map(parseFloat);
    const prevVbW = vb[2];
    const prevVbH = vb[3];
    const rect = this.svg.getBoundingClientRect();
    const focusProvided = Number.isFinite(focusClientX) && Number.isFinite(focusClientY);
    const zoomDelta = zoomLevel - this.svgZoom;
    this.svgZoom = zoomLevel;
    const nextVbW = this.svgBaseViewWidth * this.svgZoom;
    const nextVbH = this.svgBaseViewHeight * this.svgZoom;
    if (focusProvided && rect.width > 0 && rect.height > 0 && focusClientX >= rect.left && focusClientX <= rect.right && focusClientY >= rect.top && focusClientY <= rect.bottom) {
      const ctm = this.svg.getScreenCTM && this.svg.getScreenCTM();
      if (ctm && ctm.inverse) {
        const pt = new DOMPoint(focusClientX, focusClientY);
        const focusSvg = pt.matrixTransform(ctm.inverse());
        const normX = (focusSvg.x - vb[0]) / prevVbW;
        const normY = (focusSvg.y - vb[1]) / prevVbH;
        vb[2] = nextVbW;
        vb[3] = nextVbH;
        vb[0] = focusSvg.x - normX * nextVbW;
        vb[1] = focusSvg.y - normY * nextVbH;
        this.svg.setAttribute("viewBox", vb.join(" "));
        return;
      }
    }
    const centerFactorX = this.centered ? -zoomDelta * this.svgBaseViewWidth / 2 : 0;
    const centerFactorY = 0;
    vb[0] = vb[0] + centerFactorX;
    vb[1] = vb[1] + centerFactorY;
    vb[2] = nextVbW;
    vb[3] = nextVbH;
    this.svg.setAttribute("viewBox", vb.join(" "));
  };
  this.shiftView = function(deltaX = 0, deltaY = 0) {
    const dx = Number(deltaX);
    const dy = Number(deltaY);
    if (!Number.isFinite(dx) || !Number.isFinite(dy))
      return;
    const vb = this.svg.getAttribute("viewBox").split(" ").map(parseFloat);
    if (vb.length < 4 || vb.some((v) => !Number.isFinite(v)))
      return;
    vb[0] += dx;
    vb[1] += dy;
    this.svg.setAttribute("viewBox", vb.join(" "));
  };
  this.cssStyle = window.getComputedStyle(canvas2);
  this.getEdgeInternal = function(from, to, collection) {
    if (!collection.has(from))
      return null;
    if (!collection.get(from).has(to))
      return null;
    return collection.get(from).get(to);
  };
  this.getBackEdge = function(from, to) {
    return this.getEdgeInternal(from, to, this.BackEdges);
  };
  this.getEdge = function(from, to) {
    return this.getEdgeInternal(from, to, this.Edges);
  };
  this.addEdge = function(from, to, edge) {
    if (!this.Edges.has(from))
      this.Edges.set(from, /* @__PURE__ */ new Map());
    this.Edges.get(from).set(to, edge);
  };
  this.removeEdge = function(from, to) {
    if (this.Edges.has(from))
      this.Edges.get(from).delete(to);
  };
  this.removeBackEdge = function(from, to) {
    if (this.BackEdges.has(from))
      this.BackEdges.get(from).delete(to);
  };
  this.addBackEdge = function(from, to, edge) {
    if (!this.BackEdges.has(from))
      this.BackEdges.set(from, /* @__PURE__ */ new Map());
    this.BackEdges.get(from).set(to, edge);
  };
  this.getBackEdges = function(from) {
    if (!this.BackEdges.has(from))
      return /* @__PURE__ */ new Map();
    return this.BackEdges.get(from);
  };
  this.getEdges = function(from) {
    if (!this.Edges.has(from))
      return /* @__PURE__ */ new Map();
    return this.Edges.get(from);
  };
  this.draw = function() {
    this.framenum++;
    if (this.framenum > 1e3)
      this.framenum = 0;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    var i;
    var j;
    for (i = 0; i < this.Nodes.length; i++) {
      if (this.Nodes[i] != null && !this.Nodes[i].highlighted && this.Nodes[i].addedToScene && !this.Nodes[i].alwaysOnTop) {
        this.Nodes[i].draw(this.ctx);
      }
    }
    for (i = 0; i < this.Nodes.length; i++) {
      if (this.Nodes[i] != null && this.Nodes[i].highlighted && !this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene) {
        this.Nodes[i].pulseHighlight(this.framenum);
        this.Nodes[i].draw(this.ctx);
      }
    }
    for (i = 0; i < this.Nodes.length; i++) {
      if (this.Nodes[i] != null && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene) {
        this.Nodes[i].pulseHighlight(this.framenum);
        this.Nodes[i].draw(this.ctx);
      }
    }
    for (let [startIndex, targets] of this.Edges) {
      for (let [endIndex, edge] of targets) {
        if (edge.addedToScene) {
          edge.pulseHighlight(this.framenum);
          edge.draw(this.ctx);
        }
      }
    }
  };
  this.update = function() {
  };
  this.setLayers = function(shown, layers) {
    for (var i = 0; i < layers.length; i++) {
      this.activeLayers[layers[i]] = shown;
    }
    this.resetLayers();
  };
  this.addHighlightCircleObject = function(objectID, objectColor, radius) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      throw "addHighlightCircleObject:Object with same ID (" + String(objectID) + ") already Exists!";
    }
    var newNode = new HighlightCircle(objectID, objectColor, radius);
    this.Nodes[objectID] = newNode;
  };
  this.setEdgeAlpha = function(fromID, toID, alphaVal) {
    var oldAlpha = 1;
    let edge = this.getEdge(fromID, toID);
    if (edge) {
      oldAlpha = edge.alpha;
      edge.alpha = alphaVal;
    }
    return oldAlpha;
  };
  this.setAlpha = function(nodeID, alphaVal) {
    if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != void 0) {
      this.Nodes[nodeID].setAlpha(alphaVal);
    }
  };
  this.getAlpha = function(nodeID) {
    if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != void 0) {
      return this.Nodes[nodeID].getAlpha();
    } else {
      return -1;
    }
  };
  this.getTextColor = function(nodeID, index) {
    if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != void 0) {
      return this.Nodes[nodeID].getTextColor(index);
    } else {
      return "#000000";
    }
  };
  this.setTextColor = function(nodeID, color, index) {
    if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != void 0) {
      this.Nodes[nodeID].setTextColor(color, index);
    }
  };
  this.setHighlightIndex = function(nodeID, index) {
    if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != void 0) {
      this.Nodes[nodeID].setHighlightIndex(index);
    }
  };
  this.setAllLayers = function(layers) {
    this.activeLayers = [];
    for (var i = 0; i < layers.length; i++) {
      this.activeLayers[layers[i]] = true;
    }
    this.resetLayers();
  };
  this.resetLayers = function() {
    var i;
    for (i = 0; i < this.Nodes.length; i++) {
      if (this.Nodes[i] != null && this.Nodes[i] != void 0) {
        this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] == true;
        this.Nodes[i].draw(this.ctx);
      }
    }
    for (let [startIndex, targets] of this.Edges) {
      for (let [endIndex, edge] of targets) {
        edge.addedToScene = this.activeLayers[edge.Node1.layer] == true && this.activeLayers[edge.Node2.layer] == true;
        edge.draw(this.ctx);
      }
    }
  };
  this.setLayer = function(objectID, layer) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      this.Nodes[objectID].layer = layer;
      this.Nodes[objectID].addedToScene = this.activeLayers[layer] === true;
      if (this.svg.getElementById(`layer_${layer}`) == null) {
        let root = this.svg.getElementById("allElements");
        let newLayer = null;
        for (let i = 0; i < root.children.length; i++) {
          let layerNum = parseInt(root.children[i].id.split("_")[1]);
          if (layerNum > layer) {
            newLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
            newLayer.id = `layer_${layer}`;
            root.insertBefore(newLayer, root.children[i]);
            break;
          }
        }
        if (newLayer == null) {
          newLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
          newLayer.id = `layer_${layer}`;
          root.appendChild(newLayer);
        }
        let newNodes = document.createElementNS("http://www.w3.org/2000/svg", "g");
        newNodes.id = `layer_${layer}_nodes`;
        newLayer.appendChild(newNodes);
      }
      let svgElement = this.Nodes[objectID]?.getSVGComponent?.();
      if (!svgElement) {
        this.Nodes[objectID].draw(this.ctx);
        svgElement = this.Nodes[objectID]?.getSVGComponent?.();
      }
      if (svgElement && svgElement.parentNode) {
        svgElement.parentNode.removeChild(svgElement);
      }
      let secondaryTextElement = null;
      if (this.Nodes[objectID] && this.Nodes[objectID].svgText && this.Nodes[objectID].svgText !== svgElement) {
        secondaryTextElement = this.Nodes[objectID].svgText;
        if (secondaryTextElement.parentNode) {
          secondaryTextElement.parentNode.removeChild(secondaryTextElement);
        }
      }
      if (svgElement) {
        this.svg.getElementById(`layer_${layer}`).appendChild(svgElement);
        if (secondaryTextElement) {
          svgElement.after(secondaryTextElement);
        }
      }
      this.Nodes[objectID].draw(this.ctx);
      if (this.Edges.has(objectID)) {
        for (let [obj2, edge] of this.Edges.get(objectID)) {
          edge.addedToScene = edge.Node1.addedToScene && edge.Node2.addedToScene;
        }
      }
      if (this.BackEdges.has(objectID)) {
        for (let [obj2, edge] of this.BackEdges.get(objectID)) {
          edge.addedToScene = edge.Node1.addedToScene && edge.Node2.addedToScene;
        }
      }
    }
  };
  this.clearAllObjects = function() {
    if (this.Nodes && this.Nodes.length) {
      for (let i = 0; i < this.Nodes.length; i++) {
        const node = this.Nodes[i];
        if (node && typeof node.remove === "function") {
          node.remove();
        }
      }
    }
    if (this.Edges) {
      for (let [from, targets] of this.Edges) {
        for (let [to, edge] of targets) {
          if (edge && typeof edge.remove === "function") {
            edge.remove();
          }
        }
      }
    }
    if (this.BackEdges) {
      for (let [from, targets] of this.BackEdges) {
        for (let [to, edge] of targets) {
          if (edge && typeof edge.remove === "function") {
            edge.remove();
          }
        }
      }
    }
    this.Nodes = [];
    this.Edges = /* @__PURE__ */ new Map();
    this.BackEdges = /* @__PURE__ */ new Map();
  };
  this.setForegroundColor = function(objectID, color) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      this.Nodes[objectID].setForegroundColor(color);
    }
  };
  this.setBackgroundColor = function(objectID, color) {
    if (this.Nodes[objectID] != null) {
      this.Nodes[objectID].setBackgroundColor(color);
    }
  };
  this.setHighlight = function(nodeID, val) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return;
    }
    this.Nodes[nodeID].setHighlight(val);
  };
  this.getHighlight = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return false;
    }
    return this.Nodes[nodeID].getHighlight();
  };
  this.getHighlightIndex = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return false;
    }
    return this.Nodes[nodeID].getHighlightIndex();
  };
  this.setWidth = function(nodeID, val) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return;
    }
    this.Nodes[nodeID].setWidth(val);
  };
  this.setHeight = function(nodeID, val) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return;
    }
    this.Nodes[nodeID].setHeight(val);
  };
  this.getHeight = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return -1;
    }
    return this.Nodes[nodeID].getHeight();
  };
  this.getWidth = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return -1;
    }
    return this.Nodes[nodeID].getWidth();
  };
  this.backgroundColor = function(objectID) {
    if (this.Nodes[objectID] != null) {
      return this.Nodes[objectID].backgroundColor;
    } else {
      return "#000000";
    }
  };
  this.foregroundColor = function(objectID) {
    if (this.Nodes[objectID] != null) {
      return this.Nodes[objectID].foregroundColor;
    } else {
      return "#000000";
    }
  };
  this.disconnect = function(objectIDfrom, objectIDto) {
    var undo = null;
    var i;
    let edge = this.getEdge(objectIDfrom, objectIDto);
    if (edge) {
      undo = edge.createUndoDisconnect();
      edge.remove();
      this.removeEdge(objectIDfrom, objectIDto);
      this.removeBackEdge(objectIDto, objectIDfrom);
    }
    return undo;
  };
  this.deleteIncident = function(objectID) {
    var undoStack = [];
    let edgeList = this.getEdges(objectID);
    for (let [to, edge] of edgeList) {
      undoStack.push(edge.createUndoDisconnect());
      edge.remove();
      this.removeEdge(objectID, to);
      this.removeBackEdge(to, objectID);
    }
    let backList = this.getBackEdges(objectID);
    for (let [to, edge] of backList) {
      undoStack.push(edge.createUndoDisconnect());
      edge.remove();
      this.removeEdge(to, objectID);
      this.removeBackEdge(objectID, to);
    }
    return undoStack;
  };
  this.removeObject = function(ObjectID) {
    var OldObject = this.Nodes[ObjectID];
    if (ObjectID == this.Nodes.length - 1) {
      let n = this.Nodes.pop();
      n.remove();
    } else {
      this.Nodes[ObjectID].remove();
      this.Nodes[ObjectID] = null;
    }
  };
  this.getObject = function(objectID) {
    if (this.Nodes[objectID] == null || this.Nodes[objectID] == void 0) {
      throw "getObject:Object with ID (" + String(objectID) + ") does not exist";
    }
    return this.Nodes[objectID];
  };
  this.addCircleObject = function(objectID, objectLabel) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      throw "addCircleObject:Object with same ID (" + String(objectID) + ") already Exists!";
    }
    var newNode = new AnimatedCircle(objectID, objectLabel);
    this.Nodes[objectID] = newNode;
  };
  this.getNodeX = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return 0;
    }
    return this.Nodes[nodeID].x;
  };
  this.getTextWidth = function(text) {
    let cssStyle = window.getComputedStyle(this.ctx.canvas);
    this.ctx.font = cssStyle.font;
    if (text == void 0) {
      w = 3;
    }
    var strList = text.split("\n");
    var width = 0;
    if (strList.length == 1) {
      width = this.ctx.measureText(text).width;
    } else {
      for (var i = 0; i < strList.length; i++) {
        width = Math.max(width, this.ctx.measureText(strList[i]).width);
      }
    }
    return width;
  };
  this.setText = function(nodeID, text, index) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return;
      throw "setting text of an object that does not exit";
    }
    this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));
  };
  this.getText = function(nodeID, index) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      throw "getting text of an object that does not exit";
    }
    return this.Nodes[nodeID].getText(index);
  };
  this.getNodeY = function(nodeID) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return 0;
    }
    return this.Nodes[nodeID].y;
  };
  this.connectEdge = function(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint) {
    var fromObj = this.Nodes[objectIDfrom];
    var toObj = this.Nodes[objectIDto];
    if (fromObj == null || toObj == null) {
      throw "Tried to connect two nodes, one didn't exist!";
    }
    var l = new Line(
      fromObj,
      toObj,
      color,
      curve,
      directed,
      lab,
      connectionPoint
    );
    l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
    this.addEdge(objectIDfrom, objectIDto, l);
    this.addBackEdge(objectIDto, objectIDfrom, l);
  };
  this.setNull = function(objectID, nullVal, linkIndex) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      this.Nodes[objectID].setNull(nullVal, linkIndex);
    }
  };
  this.getNull = function(objectID, linkIndex) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      return this.Nodes[objectID].getNull(linkIndex);
    }
    return false;
  };
  this.setEdgeColor = function(fromID, toID, color) {
    var oldColor = "#000000";
    let e = this.getEdge(fromID, toID);
    if (e) {
      oldColor = e.color();
      e.setColor(color);
    }
    return oldColor;
  };
  this.alignTop = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    this.Nodes[id1].alignTop(this.Nodes[id2]);
  };
  this.alignLeft = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    this.Nodes[id1].alignLeft(this.Nodes[id2]);
  };
  this.alignRight = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    this.Nodes[id1].alignRight(this.Nodes[id2]);
  };
  this.getAlignRightPos = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    return this.Nodes[id1].getAlignRightPos(this.Nodes[id2]);
  };
  this.getAlignLeftPos = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    return this.Nodes[id1].getAlignLeftPos(this.Nodes[id2]);
  };
  this.alignBottom = function(id1, id2) {
    if (this.Nodes[id1] == null || this.Nodes[id1] == void 0 || this.Nodes[id2] == null || this.Nodes[id2] == void 0) {
      throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
    }
    this.Nodes[id1].alignBottom(this.Nodes[id2]);
  };
  this.setEdgeHighlight = function(fromID, toID, val) {
    var oldHighlight = false;
    let e = this.getEdge(fromID, toID);
    if (e) {
      oldHighlight = e.highlighted;
      e.setHighlight(val);
    }
    return oldHighlight;
  };
  this.addLabelObject = function(objectID, objectLabel, centering, fontSizePercent) {
    if (this.Nodes[objectID] != null && this.Nodes[objectID] != void 0) {
      throw new Error("addLabelObject: Object Already Exists!");
    }
    var newLabel = new AnimatedLabel(
      objectID,
      objectLabel,
      centering,
      this.getTextWidth(objectLabel)
    );
    if (fontSizePercent != void 0) {
      newLabel.setFontSizePercent(fontSizePercent);
    }
    this.Nodes[objectID] = newLabel;
  };
  this.addLinkedListObject = function(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels2, numLinks, backgroundColor, foregroundColor) {
    if (this.Nodes[objectID] != null) {
      throw new Error(
        "addLinkedListObject:Object with same ID already Exists!"
      );
      return;
    }
    var newNode = new AnimatedLinkedList(
      objectID,
      nodeLabel,
      width,
      height,
      linkPer,
      verticalOrientation,
      linkPosEnd,
      numLabels2,
      numLinks,
      backgroundColor,
      foregroundColor
    );
    this.Nodes[objectID] = newNode;
  };
  this.getNumElements = function(objectID) {
    return this.Nodes[objectID].getNumElements();
  };
  this.setNumElements = function(objectID, numElems) {
    this.Nodes[objectID].setNumElements(numElems);
  };
  this.addBTreeNode = function(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor) {
    backgroundColor = backgroundColor == void 0 ? "#FFFFFF" : backgroundColor;
    foregroundColor = foregroundColor == void 0 ? "#FFFFFF" : foregroundColor;
    if (this.Nodes[objectID] != null && Nodes[objectID] != void 0) {
      throw "addBTreeNode:Object with same ID already Exists!";
    }
    var newNode = new AnimatedBTreeNode(
      objectID,
      widthPerElem,
      height,
      numElems,
      backgroundColor,
      foregroundColor
    );
    this.Nodes[objectID] = newNode;
  };
  this.addRectangleObject = function(objectID, nodeLabel, width, height, xJustify, yJustify, backgroundColor, foregroundColor) {
    if (this.Nodes[objectID] != null || this.Nodes[objectID] != void 0) {
      throw new Error("addRectangleObject:Object with same ID already Exists!");
    }
    var newNode = new AnimatedRectangle(
      objectID,
      nodeLabel,
      width,
      height,
      xJustify,
      yJustify,
      backgroundColor,
      foregroundColor
    );
    this.Nodes[objectID] = newNode;
  };
  this.setNodePosition = function(nodeID, newX, newY) {
    if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == void 0) {
      return;
    }
    if (newX == void 0 || newY == void 0) {
      return;
    }
    this.Nodes[nodeID].x = newX;
    this.Nodes[nodeID].y = newY;
  };
}

// AlgorithmLibrary/Algorithm.js
function addLabelToAlgorithmBar(labelName, labelId, labelTarget) {
  var element = document.createElement("label");
  element.innerHTML = labelName;
  if (labelId)
    element.id = labelId;
  if (labelTarget)
    element.setAttribute("for", labelTarget);
  var controlBar = document.getElementById("AlgorithmSpecificControls");
  controlBar.appendChild(element);
  return element;
}
function addCheckboxToAlgorithmBar(boxLabel, id) {
  var element = document.createElement("input");
  element.setAttribute("type", "checkbox");
  element.id = id;
  element.setAttribute("value", boxLabel);
  let parent = document.getElementById("AlgorithmSpecificControls");
  if (boxLabel) {
    var labelEl = document.createElement("label");
    labelEl.innerHTML = boxLabel;
    labelEl.id = id + "Label";
    labelEl.setAttribute("for", id);
    let div = document.createElement("div");
    div.className = "controlGroup";
    parent.appendChild(div);
    parent = div;
    parent.appendChild(labelEl);
  }
  parent.appendChild(element);
  return element;
}
function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName) {
  var buttonList = [];
  var newTable = document.createElement("div");
  newTable.className = "radioButtonGroup";
  for (var i = 0; i < buttonNames.length; i++) {
    var midLevel = document.createElement("div");
    midLevel.className = "radioButtonContainer";
    var button = document.createElement("input");
    button.setAttribute("type", "radio");
    button.setAttribute("name", groupName);
    button.setAttribute("value", buttonNames[i]);
    button.setAttribute("id", `${groupName}-${i}`);
    midLevel.appendChild(button);
    var labelNode = document.createElement("label");
    labelNode.setAttribute("for", `${groupName}-${i}`);
    labelNode.innerHTML = " " + buttonNames[i];
    midLevel.appendChild(labelNode);
    newTable.appendChild(midLevel);
    buttonList.push(button);
  }
  var controlBar = document.getElementById("AlgorithmSpecificControls");
  controlBar.appendChild(newTable);
  return buttonList;
}
function addSelectToAlgorithmBar(label, name, id) {
  var element = document.createElement("select");
  element.setAttribute("value", name);
  element.id = id;
  let parent = document.getElementById("AlgorithmSpecificControls");
  if (label) {
    var labelEl = document.createElement("label");
    labelEl.innerHTML = label;
    labelEl.id = id + "Label";
    labelEl.setAttribute("for", id);
    let div = document.createElement("div");
    div.className = "controlGroup";
    parent.appendChild(div);
    parent = div;
    parent.appendChild(labelEl);
  }
  parent.appendChild(element);
  return element;
}
function addControlToAlgorithmBar(type, name, id, label) {
  var element = document.createElement("input");
  element.setAttribute("type", type);
  element.setAttribute("value", name);
  element.id = id;
  if (type === "Text" && id === "inputField") {
    element.setAttribute("placeholder", "Value to add/remove/etc...");
  }
  let parent = document.getElementById("AlgorithmSpecificControls");
  if (label) {
    var labelEl = document.createElement("label");
    labelEl.innerHTML = label;
    labelEl.id = id + "Label";
    labelEl.setAttribute("for", id);
    let div = document.createElement("div");
    div.className = "controlGroup";
    parent.appendChild(div);
    parent = div;
    parent.appendChild(labelEl);
  }
  parent.appendChild(element);
  return element;
}
function addSeparatorToAlgorithmBar() {
  var element = document.createElement("hr");
  var controlBar = document.getElementById("AlgorithmSpecificControls").appendChild(element);
}
function Algorithm(am) {
}
Algorithm.prototype.setCodeAlpha = function(code, newAlpha) {
  var i, j;
  for (i = 0; i < code.length; i++)
    for (j = 0; j < code[i].length; j++) {
      this.cmd("SetAlpha", code[i][j], newAlpha);
    }
};
Algorithm.prototype.addCodeToCanvasBase = function(code, start_x, start_y, line_height, standard_color, layer) {
  layer = typeof layer !== "undefined" ? layer : 0;
  var codeID = Array(code.length);
  var i, j;
  for (i = 0; i < code.length; i++) {
    codeID[i] = new Array(code[i].length);
    for (j = 0; j < code[i].length; j++) {
      codeID[i][j] = this.nextIndex++;
      this.cmd(
        "CreateLabel",
        codeID[i][j],
        code[i][j],
        start_x,
        start_y + i * line_height,
        0
      );
      this.cmd("SetForegroundColor", codeID[i][j], standard_color);
      this.cmd("SetLayer", codeID[i][j], layer);
      if (j > 0) {
        this.cmd("AlignRight", codeID[i][j], codeID[i][j - 1]);
      }
    }
  }
  return codeID;
};
Algorithm.prototype.init = function(am, w2, h) {
  this.animationManager = am;
  am.addListener("AnimationStarted", this, this.disableUI);
  am.addListener("AnimationEnded", this, this.enableUI);
  am.addListener("AnimationUndo", this, this.undo);
  this.canvasWidth = w2;
  this.canvasHeight = h;
  this.actionHistory = [];
  this.recordAnimation = true;
  this.commands = [];
};
Algorithm.prototype.sizeChanged = function(newWidth, newHeight) {
};
Algorithm.prototype.implementAction = function(funct, val) {
  var nxt = [funct, val];
  this.actionHistory.push(nxt);
  var retVal = funct(val);
  this.animationManager.StartNewAnimation(retVal);
};
Algorithm.prototype.shift = function(deltaX, deltaY) {
  if (this.animationManager && this.animationManager.shift) {
    this.animationManager.shift(deltaX, deltaY);
  }
};
Algorithm.prototype.isAllDigits = function(str) {
  for (var i = str.length - 1; i >= 0; i--) {
    if (str.charAt(i) < "0" || str.charAt(i) > "9") {
      return false;
    }
  }
  return true;
};
Algorithm.prototype.normalizeNumber = function(input, maxLen) {
  if (this.isAllDigits(input)) {
    return Number(input);
  }
  return input;
};
Algorithm.prototype.disableUI = function(event) {
};
Algorithm.prototype.enableUI = function(event) {
};
function controlKey(keyASCII) {
  return keyASCII == 8 || keyASCII == 9 || keyASCII == 37 || keyASCII == 38 || keyASCII == 39 || keyASCII == 40 || keyASCII == 46;
}
Algorithm.prototype.returnSubmitFloat = function(field, funct, maxsize) {
  if (maxsize != void 0) {
    field.size = maxsize;
  }
  return function(event) {
    var keyASCII = 0;
    if (window.event) {
      keyASCII = event.keyCode;
    } else if (event.which) {
      keyASCII = event.which;
    }
    if (keyASCII == 13) {
      funct();
    } else if (controlKey(keyASCII)) {
      return;
    } else if (keyASCII == 109) {
      return;
    } else if ((maxsize != void 0 || field.value.length < maxsize) && keyASCII >= 48 && keyASCII <= 57) {
      return;
    } else if ((maxsize != void 0 || field.value.length < maxsize) && keyASCII == 190 && field.value.indexOf(".") == -1) {
      return;
    } else {
      return false;
    }
  };
};
Algorithm.prototype.returnSubmit = function(field, funct, maxsize, intOnly) {
  if (maxsize != void 0) {
    field.size = maxsize;
  }
  return function(event) {
    var keyASCII = 0;
    if (window.event) {
      keyASCII = event.keyCode;
    } else if (event.which) {
      keyASCII = event.which;
    }
    if (keyASCII == 13 && funct !== null) {
      funct();
    } else if (keyASCII == 190 || keyASCII == 59 || keyASCII == 173 || keyASCII == 189) {
      return false;
    } else if (maxsize != void 0 && field.value.length >= maxsize || intOnly && (keyASCII < 48 || keyASCII > 57)) {
      if (!controlKey(keyASCII))
        return false;
    }
  };
};
Algorithm.prototype.addReturnSubmit = function(field, action) {
  field.onkeydown = this.returnSubmit(field, action, 4, false);
};
Algorithm.prototype.reset = function() {
};
Algorithm.prototype.undo = function(event) {
  this.actionHistory.pop();
  this.reset();
  var len = this.actionHistory.length;
  this.recordAnimation = false;
  for (var i = 0; i < len; i++) {
    this.actionHistory[i][0](this.actionHistory[i][1]);
  }
  this.recordAnimation = true;
};
Algorithm.prototype.clearHistory = function() {
  this.actionHistory = [];
};
Algorithm.prototype.cmd = function() {
  if (this.recordAnimation) {
    var command = arguments[0];
    for (let i = 1; i < arguments.length; i++) {
      command = command + "<;>" + String(arguments[i]);
    }
    this.commands.push(command);
  }
};

// AnimationLibrary/AnimationMain.js
var timer;
document.querySelectorAll("div").forEach((el) => {
  el.style.aspectRatio = "";
});
function getCookie(cookieName) {
  var i, x, y;
  var cookies = document.cookie.split(";");
  for (i = 0; i < cookies.length; i++) {
    x = cookies[i].substr(0, cookies[i].indexOf("="));
    y = cookies[i].substr(cookies[i].indexOf("=") + 1);
    x = x.replace(/^\s+|\s+$/g, "");
    if (x == cookieName) {
      return unescape(y);
    }
  }
}
function setCookie(cookieName, value, expireDays) {
  var exdate = /* @__PURE__ */ new Date();
  exdate.setDate(exdate.getDate() + expireDays);
  var cookieValue = escape(value) + (expireDays == null ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = cookieName + "=" + value;
}
var objectManager;
var animationManager;
var paused = false;
var skipBackButton;
var stepBackButton;
var stepForwardButton;
var skipForwardButton;
var scrubSlider;
var keyboardStepListenerInstalled = false;
var ctrlWheelZoomListenerInstalled = false;
var pinchZoomListenerInstalled = false;
var ltiResizeListenerInstalled = false;
var zoomHoverTrackingInstalled = false;
var pendingZoomFocusClient = null;
var lastHoverClient = null;
var BASE_ZOOM_COOKIE_NAME = "VisualizationZoom";
var zoomCookieName = BASE_ZOOM_COOKIE_NAME;
function sanitizeCookieToken(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "default";
}
function deriveZoomCookieName(title, opts = null) {
  const explicitScope = opts && typeof opts.zoomCookieScope === "string" ? opts.zoomCookieScope : null;
  if (explicitScope && explicitScope.trim() !== "") {
    return `${BASE_ZOOM_COOKIE_NAME}_${sanitizeCookieToken(explicitScope)}`;
  }
  const path = typeof window !== "undefined" && window.location && window.location.pathname || "";
  const lastSegment = path.split("/").filter(Boolean).pop() || "index";
  const pageToken = lastSegment.replace(/\.[^.]+$/, "");
  const fallbackTitle = title && String(title).trim() !== "" ? String(title) : "animation";
  const scope = pageToken || fallbackTitle;
  return `${BASE_ZOOM_COOKIE_NAME}_${sanitizeCookieToken(scope)}`;
}
function installZoomHoverTracking(targetEl) {
  if (zoomHoverTrackingInstalled)
    return;
  zoomHoverTrackingInstalled = true;
  const el = targetEl || window;
  el.addEventListener("mousemove", (e) => {
    lastHoverClient = { x: e.clientX, y: e.clientY };
  });
}
function installLTIResizer() {
  if (ltiResizeListenerInstalled)
    return;
  ltiResizeListenerInstalled = true;
  let requestSizeChangeForLTI = function() {
    if (!window.frameElement)
      return;
    const height = window.innerWidth > 600 ? "100%" : "600px";
    const data = { subject: "lti.frameResize", message_id: window.frameElement.id, height };
    window.parent.postMessage(data, "*");
  };
  window.addEventListener("resize", requestSizeChangeForLTI);
  requestSizeChangeForLTI();
}
function getZoomSelect() {
  return document.getElementById("zoomLevel");
}
function stepZoomSelect(direction) {
  const zoomSelect = getZoomSelect();
  if (!zoomSelect || zoomSelect.disabled)
    return false;
  const curIndex = zoomSelect.selectedIndex;
  if (curIndex < 0)
    return false;
  const nextIndex = Math.max(
    0,
    Math.min(curIndex + direction, zoomSelect.options.length - 1)
  );
  if (nextIndex === curIndex)
    return false;
  zoomSelect.selectedIndex = nextIndex;
  zoomSelect.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}
function animWaiting() {
  stepForwardButton.disabled = false;
  if (skipBackButton.disabled == false) {
    stepBackButton.disabled = false;
  }
}
function animReady() {
  skipForwardButton.disabled = false;
  skipBackButton.disabled = true;
  stepForwardButton.disabled = false;
  stepBackButton.disabled = true;
}
function animStarted() {
  skipForwardButton.disabled = false;
  skipBackButton.disabled = false;
  stepForwardButton.disabled = true;
  stepBackButton.disabled = true;
}
function animEnded() {
  skipForwardButton.disabled = true;
  stepForwardButton.disabled = true;
  if (skipBackButton.disabled == false && paused) {
    stepBackButton.disabled = false;
  }
}
function animUndoUnavailable() {
  skipBackButton.disabled = true;
  stepBackButton.disabled = true;
}
function animAdvanceUnavailable() {
  skipForwardButton.disabled = true;
  stepForwardButton.disabled = true;
}
function timeoutFn() {
  timer = setTimeout(timeoutFn, 30);
  animationManager.update();
}
function makeInput(type, value, title, id) {
  var element = document.createElement("input");
  element.setAttribute("type", type);
  element.setAttribute("value", value);
  if (title != null && title !== "")
    element.setAttribute("title", title);
  if (id != null && id !== "")
    element.id = id;
  return element;
}
function addControlTo(element, parent, label) {
  let trueParent = parent;
  if (label) {
    var labelEl = document.createElement("label");
    labelEl.innerHTML = label;
    labelEl.id = element.id + "Label";
    if (element.id)
      labelEl.setAttribute("for", element.id);
    let div = document.createElement("div");
    div.className = "controlGroup";
    parent.appendChild(div);
    trueParent = div;
    div.appendChild(labelEl);
  }
  trueParent.appendChild(element);
  return element;
}
var SPEED_LABELS = ["Off", "Slow", "Medium", "Fast", "Max"];
var SPEED_LABEL_TO_VALUE = {
  Off: "step",
  Slow: 10,
  Medium: 4,
  Fast: 2,
  Max: 1
};
function normalizeSpeedLabel(raw) {
  if (raw == null)
    return null;
  const s = String(raw).trim();
  if (s === "")
    return null;
  if (s.toLowerCase() === "step" || s.toLowerCase() === "off") {
    return "Off";
  }
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    if (n === 10)
      return "Slow";
    if (n === 4)
      return "Medium";
    if (n === 2)
      return "Fast";
    if (n === 1)
      return "Max";
    return null;
  }
  const lower = s.toLowerCase();
  for (const label of SPEED_LABELS) {
    if (label.toLowerCase() === lower)
      return label;
  }
  return null;
}
function speedChange(speed) {
  const label = normalizeSpeedLabel(speed) ?? "Off";
  const mapped = SPEED_LABEL_TO_VALUE[label] ?? "step";
  if (mapped === "step") {
    animationManager.SetPaused(true);
    animationManager.SetSpeed(1);
  } else {
    animationManager.SetPaused(false);
    animationManager.SetSpeed(mapped);
  }
}
function makeDiv(id, classes, parent) {
  var element = document.createElement("div");
  element.setAttribute("id", id);
  if (classes != "")
    element.setAttribute("class", classes);
  parent.appendChild(element);
  return element;
}
function addGeneralControls(objectManager2, targetElement, title, opts = null) {
  if (targetElement == null) {
    targetElement = document.body;
  }
  let animationDiv = makeDiv("animationSurround", "", targetElement);
  let algoControlSection = makeDiv("algoControlSection", "", animationDiv);
  var controlBar = makeDiv("generalAnimationControls", "", algoControlSection);
  makeDiv("AlgorithmSpecificControls", "", algoControlSection);
  let titleEl = document.createElement("h1");
  titleEl.innerText = title;
  controlBar.appendChild(titleEl);
  var stepButtons = document.createElement("div");
  stepButtons.classList.add("stepButtons");
  controlBar.appendChild(stepButtons);
  skipBackButton = addControlTo(makeInput("Button", "<<", "Skip Back", "skipBackButton"), stepButtons);
  stepBackButton = addControlTo(makeInput("Button", "<", "Step Back", "stepBackButton"), stepButtons);
  stepForwardButton = addControlTo(makeInput("Button", ">", "Step Forward", "stepForwardButton"), stepButtons);
  skipForwardButton = addControlTo(makeInput("Button", ">>", "Skip Forward", "skipForwardButton"), stepButtons);
  scrubSlider = document.createElement("input");
  scrubSlider.type = "range";
  scrubSlider.id = "scrubSlider";
  scrubSlider.min = "1";
  scrubSlider.max = "0";
  scrubSlider.value = "0";
  scrubSlider.step = "1";
  scrubSlider.disabled = true;
  scrubSlider.style.width = "100%";
  scrubSlider.style.marginTop = "6px";
  scrubSlider.style.height = "4px";
  scrubSlider.style.cursor = "pointer";
  controlBar.appendChild(scrubSlider);
  var speedSelect = document.createElement("select");
  speedSelect.setAttribute("id", "animationSpeed");
  speedSelect.setAttribute("name", "animationSpeed");
  speedSelect.innerHTML = `
    <option value="Off">Off</option>
    <option value="Slow">Slow</option>
    <option value="Medium">Medium</option>
    <option value="Fast">Fast</option>
    <option value="Max">Max</option>`;
  const optsLabel = opts ? normalizeSpeedLabel(opts.speed) : null;
  const initialLabel = optsLabel ?? "Off";
  speedSelect.value = initialLabel;
  speedChange(initialLabel);
  speedSelect.addEventListener("change", (e) => {
    speedChange(e.target.value);
  });
  addControlTo(speedSelect, controlBar, "Auto Step Speed");
  zoomCookieName = deriveZoomCookieName(title, opts);
  var zoom = getCookie(zoomCookieName);
  if (zoom == void 0 || zoom === null || zoom === "") {
    zoom = getCookie(BASE_ZOOM_COOKIE_NAME);
  }
  {
    let parsed = parseFloat(zoom);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      parsed = 2;
    }
    const allowedZoomValues = [16, 8, 6, 4, 2.6666666667, 2, 1.3333333333];
    const isAllowed = allowedZoomValues.some((v) => Math.abs(v - parsed) < 1e-9);
    if (!isAllowed) {
      parsed = allowedZoomValues.reduce(
        (best, v) => Math.abs(v - parsed) < Math.abs(best - parsed) ? v : best,
        allowedZoomValues[0]
      );
    }
    zoom = parsed;
  }
  objectManager2.setZoom(zoom);
  var zoomSelect = document.createElement("select");
  zoomSelect.setAttribute("id", "zoomLevel");
  zoomSelect.setAttribute("name", "zoomLevel");
  zoomSelect.innerHTML = `
    <option value="16" ${zoom == 16 ? "selected" : ""}>0.25x</option>
    <option value="8" ${zoom == 8 ? "selected" : ""}>0.5x</option>
    <option value="6" ${zoom == 6 ? "selected" : ""}>0.75x</option>
    <option value="4" ${zoom == 4 ? "selected" : ""}>1x</option>
    <option value="2.6666666667" ${zoom == 2.6666666667 ? "selected" : ""}>1.5x</option>
    <option value="2" ${zoom == 2 ? "selected" : ""}>2x</option>
    <option value="1.3333333333" ${zoom == 1.3333333333 ? "selected" : ""}>3x</option>`;
  zoomSelect.addEventListener("change", (e) => {
    setCookie(zoomCookieName, e.target.value);
    let focus = pendingZoomFocusClient;
    pendingZoomFocusClient = null;
    if (!focus && lastHoverClient && objectManager2 && objectManager2.svg) {
      const rect = objectManager2.svg.getBoundingClientRect();
      const inSvg = rect.width > 0 && rect.height > 0 && lastHoverClient.x >= rect.left && lastHoverClient.x <= rect.right && lastHoverClient.y >= rect.top && lastHoverClient.y <= rect.bottom;
      if (inSvg) {
        focus = lastHoverClient;
      }
    }
    if (focus) {
      objectManager2.setZoom(e.target.value, focus.x, focus.y);
    } else {
      objectManager2.setZoom(e.target.value);
    }
  });
  addControlTo(zoomSelect, controlBar, "Zoom");
  var msgBox = document.createElement("textarea");
  msgBox.setAttribute("readonly", "readonly");
  msgBox.setAttribute("id", "message");
  msgBox.setAttribute("rows", "4");
  controlBar.appendChild(msgBox);
  var resetButton = addControlTo(makeInput("Button", "Reset", "Reset", "resetButton"), controlBar);
  resetButton.onclick = function() {
    window.location.reload();
  };
}
function applyAutoZoomForMinVisibleWidth(minVisibleWorldWidth) {
  return;
  if (!objectManager || !objectManager.svg)
    return;
  const minWidth = Number.isFinite(minVisibleWorldWidth) && minVisibleWorldWidth > 0 ? minVisibleWorldWidth : 800;
  const rect = objectManager.svg.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0)
    return;
  const baseW = objectManager.svgBaseViewWidth;
  const baseH = objectManager.svgBaseViewHeight;
  if (!Number.isFinite(baseW) || !Number.isFinite(baseH) || baseW <= 0 || baseH <= 0) {
    return;
  }
  const minTerm = Math.min(baseW, rect.width * baseH / rect.height);
  if (!Number.isFinite(minTerm) || minTerm <= 0)
    return;
  const requiredZoom = minWidth / minTerm;
  if (!Number.isFinite(requiredZoom) || requiredZoom <= 0)
    return;
  if (requiredZoom <= objectManager.svgZoom)
    return;
  let chosenZoom = requiredZoom;
  const zoomSelect = getZoomSelect();
  if (zoomSelect && zoomSelect.options && zoomSelect.options.length > 0) {
    const optionValues = Array.from(zoomSelect.options).map((o) => parseFloat(o.value)).filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
    if (optionValues.length > 0) {
      chosenZoom = optionValues.find((v) => v >= requiredZoom) ?? optionValues[optionValues.length - 1];
      zoomSelect.value = String(chosenZoom);
    }
  }
  setCookie(zoomCookieName, chosenZoom);
  objectManager.setZoom(chosenZoom);
}
function installKeyboardStepControls() {
  if (keyboardStepListenerInstalled)
    return;
  keyboardStepListenerInstalled = true;
  window.addEventListener("keydown", (e) => {
    if (e.defaultPrevented)
      return;
    if (e.ctrlKey || e.metaKey || e.altKey)
      return;
    if (e.key === "ArrowLeft") {
      if (stepBackButton && !stepBackButton.disabled) {
        stepBackButton.click();
        e.preventDefault();
      }
    } else if (e.key === "ArrowRight") {
      if (stepForwardButton && !stepForwardButton.disabled) {
        stepForwardButton.click();
        e.preventDefault();
      }
    }
  });
}
function installCtrlWheelZoomControls() {
  if (ctrlWheelZoomListenerInstalled)
    return;
  ctrlWheelZoomListenerInstalled = true;
  window.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey)
        return;
      e.preventDefault();
      if (e.deltaY < 0) {
        pendingZoomFocusClient = { x: e.clientX, y: e.clientY };
        stepZoomSelect(1);
      } else if (e.deltaY > 0) {
        pendingZoomFocusClient = { x: e.clientX, y: e.clientY };
        stepZoomSelect(-1);
      }
    },
    { passive: false }
  );
}
function installPinchZoomControls(targetEl) {
  if (pinchZoomListenerInstalled)
    return;
  pinchZoomListenerInstalled = true;
  let lastDistance = null;
  function touchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const el = targetEl || window;
  el.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || e.touches.length !== 2)
        return;
      lastDistance = touchDistance(e.touches[0], e.touches[1]);
    },
    { passive: true }
  );
  el.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches || e.touches.length !== 2) {
        lastDistance = null;
        return;
      }
      if (lastDistance == null) {
        lastDistance = touchDistance(e.touches[0], e.touches[1]);
        return;
      }
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const ZOOM_IN_THRESHOLD = 1.08;
      const ZOOM_OUT_THRESHOLD = 0.92;
      if (dist > lastDistance * ZOOM_IN_THRESHOLD) {
        pendingZoomFocusClient = { x: midX, y: midY };
        if (stepZoomSelect(1)) {
          e.preventDefault();
        }
        lastDistance = dist;
      } else if (dist < lastDistance * ZOOM_OUT_THRESHOLD) {
        pendingZoomFocusClient = { x: midX, y: midY };
        if (stepZoomSelect(-1)) {
          e.preventDefault();
        }
        lastDistance = dist;
      }
    },
    { passive: false }
  );
  el.addEventListener(
    "touchend",
    (e) => {
      if (!e.touches || e.touches.length < 2) {
        lastDistance = null;
      }
    },
    { passive: true }
  );
}
function initAnimationManager(opts) {
  let canvas2 = opts.canvas || document.createElement("canvas");
  let targetElement = opts.target || null;
  let centered = opts.centered || false;
  let am = initCanvas2(canvas2, targetElement, opts.title, centered, opts);
  if (opts.zoom) {
    am.setZoom(opts.zoom);
  }
  let desiredHeight = opts.height || 350;
  if (opts.singleMode) {
    am.setSingleMode(true);
    desiredHeight = opts.heightSingleMode;
  }
  if (innerWidth < 450) {
    if (opts.singleMode)
      desiredHeight = opts.heightMobileSingle || opts.heightMobile || 400;
    else
      desiredHeight = opts.heightMobile || 400;
  }
  am.requestHeight(desiredHeight);
  return am;
}
function initCanvas2(canvas2, targetElement = null, title = "", centered = false, opts = null) {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  let curURL = import.meta.url;
  link.href = curURL.slice(0, curURL.lastIndexOf("/")) + "/entry.css";
  document.head.appendChild(link);
  const desiredViewWidth = opts && Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : opts && Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 800;
  const desiredViewHeight = opts && Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : opts && Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 400;
  if (!Number.isFinite(canvas2.width) || canvas2.width <= 0) {
    canvas2.width = desiredViewWidth;
  }
  if (!Number.isFinite(canvas2.height) || canvas2.height <= 0) {
    canvas2.height = desiredViewHeight;
  }
  canvas2.style.width = canvas2.width + "px";
  canvas2.style.height = canvas2.height + "px";
  objectManager = new ObjectManager(canvas2, centered);
  animationManager = new AnimationManager(objectManager, canvas2);
  addGeneralControls(objectManager, targetElement, title, opts);
  var controlBar = document.getElementById("algoControlSection");
  controlBar.after(objectManager.svg);
  requestAnimationFrame(() => applyAutoZoomForMinVisibleWidth(800));
  animationManager.addListener("AnimationReady", this, animReady);
  animationManager.addListener("AnimationStarted", this, animStarted);
  animationManager.addListener("AnimationEnded", this, animEnded);
  animationManager.addListener("AnimationWaiting", this, animWaiting);
  animationManager.addListener(
    "AnimationUndoUnavailable",
    this,
    animUndoUnavailable
  );
  animationManager.addListener(
    "AnimationAdvanceUnavailable",
    this,
    animAdvanceUnavailable
  );
  skipBackButton.onclick = animationManager.skipBack.bind(animationManager);
  stepBackButton.onclick = animationManager.stepBack.bind(animationManager);
  stepForwardButton.onclick = animationManager.step.bind(animationManager);
  skipForwardButton.onclick = animationManager.skipForward.bind(animationManager);
  animationManager.attachScrubSlider(scrubSlider);
  scrubSlider.addEventListener("input", (e) => {
    const target = parseInt(e.target.value);
    animationManager.scrubToBlock(target);
  });
  installKeyboardStepControls();
  installCtrlWheelZoomControls();
  installPinchZoomControls(objectManager.svg);
  installZoomHoverTracking(objectManager.svg);
  installLTIResizer();
  return animationManager;
}
function AnimationManager(objectManager2, canvas2) {
  this.animatedObjects = objectManager2;
  this.canvas = canvas2;
  this.animationPaused = false;
  this.awaitingStep = false;
  this.currentlyAnimating = false;
  this.singleMode = false;
  this.AnimationSteps = [];
  this.currentAnimation = 0;
  this.scrubSlider = null;
  this.totalBlocks = 0;
  this.currentBlockIndex = 0;
  this.previousAnimationSteps = [];
  this.currFrame = 0;
  this.animationBlockLength = 0;
  this.baseFramesPerAnimation = 10;
  this.currentBlock = null;
  this.undoStack = [];
  this.doingUndo = false;
  this.undoAnimationStepIndices = [];
  this.undoAnimationStepIndicesStack = [];
  this.animationBlockLength = 10;
  this.lerp = function(from, to, percent) {
    return (to - from) * percent + from;
  };
  this.SetPaused = function(pausedValue) {
    this.animationPaused = pausedValue;
    paused = pausedValue;
    if (!this.animationPaused) {
      this.step();
    }
  };
  this.SetSpeed = function(newSpeed) {
    this.animationBlockLength = Math.max(this.baseFramesPerAnimation * newSpeed, 0);
  };
  this.requestHeight = function(newHeight) {
  };
  this.setZoom = function(newZoom) {
    let zoomSelect = document.getElementById("zoomLevel");
    let opts = zoomSelect.options;
    for (let o of opts) {
      if (o.innerText == newZoom) {
        o.selected = true;
        objectManager2.setZoom(o.value);
        break;
      }
    }
  };
  this.shift = function(deltaX = 0, deltaY = 0) {
    this.animatedObjects.shiftView(deltaX, deltaY);
  };
  this.parseBool = function(str) {
    var uppercase = str.toUpperCase();
    var returnVal = !(uppercase == "False" || uppercase == "f" || uppercase == " 0" || uppercase == "0" || uppercase == "");
    return returnVal;
  };
  this.parseColor = function(clr) {
    if (clr.charAt(0) == "#") {
      return clr;
    } else if (clr.substring(0, 2) == "0x") {
      return "#" + clr.substring(2);
    }
    return clr;
  };
  this.changeSize = function() {
  };
  this.startNextBlock = function() {
    this.awaitingStep = false;
    this.currentBlock = [];
    var undoBlock = [];
    if (this.currentAnimation == this.AnimationSteps.length) {
      this.currentlyAnimating = false;
      this.awaitingStep = this.singleMode;
      this.fireEvent("AnimationEnded", "NoData");
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      this.currentBlockIndex = this.totalBlocks;
      this.updateScrubUI();
      return;
    }
    this.undoAnimationStepIndices.push(this.currentAnimation);
    var foundBreak = false;
    var anyAnimations = false;
    while (this.currentAnimation < this.AnimationSteps.length && !foundBreak) {
      var nextCommand = this.AnimationSteps[this.currentAnimation].split("<;>");
      if (nextCommand[0].toUpperCase() == "CREATECIRCLE") {
        this.animatedObjects.addCircleObject(
          parseInt(nextCommand[1]),
          nextCommand[2]
        );
        if (nextCommand.length > 4) {
          this.animatedObjects.setNodePosition(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[3]),
            parseInt(nextCommand[4])
          );
        }
        undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
      } else if (nextCommand[0].toUpperCase() == "CONNECT") {
        if (nextCommand.length > 7) {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            //from
            parseInt(nextCommand[2]),
            //to
            this.parseColor(nextCommand[3]),
            //color
            parseFloat(nextCommand[4]),
            //curve
            this.parseBool(nextCommand[5]),
            //directed
            nextCommand[6],
            //label
            parseInt(nextCommand[7])
            //connectionPoint
          );
        } else if (nextCommand.length > 6) {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            this.parseColor(nextCommand[3]),
            parseFloat(nextCommand[4]),
            this.parseBool(nextCommand[5]),
            nextCommand[6],
            0
          );
        } else if (nextCommand.length > 5) {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            this.parseColor(nextCommand[3]),
            parseFloat(nextCommand[4]),
            this.parseBool(nextCommand[5]),
            "",
            0
          );
        } else if (nextCommand.length > 4) {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            this.parseColor(nextCommand[3]),
            parseFloat(nextCommand[4]),
            true,
            "",
            0
          );
        } else if (nextCommand.length > 3) {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            this.parseColor(nextCommand[3]),
            0,
            true,
            "",
            0
          );
        } else {
          this.animatedObjects.connectEdge(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            "#000000",
            0,
            true,
            "",
            0
          );
        }
        undoBlock.push(
          new UndoConnect(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[2]),
            false
          )
        );
      } else if (nextCommand[0].toUpperCase() == "CREATERECTANGLE") {
        if (nextCommand.length == 9) {
          this.animatedObjects.addRectangleObject(
            parseInt(nextCommand[1]),
            // ID
            nextCommand[2],
            // Label
            parseInt(nextCommand[3]),
            // w
            parseInt(nextCommand[4]),
            // h
            nextCommand[7],
            // xJustify
            nextCommand[8],
            // yJustify
            "#ffffff",
            // background color
            "#000000"
          );
        } else {
          this.animatedObjects.addRectangleObject(
            parseInt(nextCommand[1]),
            // ID
            nextCommand[2],
            // Label
            parseInt(nextCommand[3]),
            // w
            parseInt(nextCommand[4]),
            // h
            "center",
            // xJustify
            "center",
            // yJustify
            "#ffffff",
            // background color
            "#000000"
          );
        }
        if (nextCommand.length > 6) {
          this.animatedObjects.setNodePosition(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[5]),
            parseInt(nextCommand[6])
          );
        }
        undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
      } else if (nextCommand[0].toUpperCase() == "MOVE") {
        var objectID = parseInt(nextCommand[1]);
        var nextAnim = new SingleAnimation(
          objectID,
          this.animatedObjects.getNodeX(objectID),
          this.animatedObjects.getNodeY(objectID),
          parseInt(nextCommand[2]),
          parseInt(nextCommand[3])
        );
        this.currentBlock.push(nextAnim);
        undoBlock.push(
          new UndoMove(
            nextAnim.objectID,
            nextAnim.toX,
            nextAnim.toY,
            nextAnim.fromX,
            nextAnim.fromY
          )
        );
        anyAnimations = true;
      } else if (nextCommand[0].toUpperCase() == "MOVETOALIGNRIGHT") {
        var id = parseInt(nextCommand[1]);
        var otherId = parseInt(nextCommand[2]);
        var newXY = this.animatedObjects.getAlignRightPos(id, otherId);
        var nextAnim = new SingleAnimation(
          id,
          this.animatedObjects.getNodeX(id),
          this.animatedObjects.getNodeY(id),
          newXY[0],
          newXY[1]
        );
        this.currentBlock.push(nextAnim);
        undoBlock.push(
          new UndoMove(
            nextAnim.objectID,
            nextAnim.toX,
            nextAnim.toY,
            nextAnim.fromX,
            nextAnim.fromY
          )
        );
        anyAnimations = true;
      } else if (nextCommand[0].toUpperCase() == "STEP") {
        foundBreak = true;
      } else if (nextCommand[0].toUpperCase() == "SETFOREGROUNDCOLOR") {
        var id = parseInt(nextCommand[1]);
        var oldColor = this.animatedObjects.foregroundColor(id);
        this.animatedObjects.setForegroundColor(
          id,
          this.parseColor(nextCommand[2])
        );
        undoBlock.push(new UndoSetForegroundColor(id, oldColor));
      } else if (nextCommand[0].toUpperCase() == "SETBACKGROUNDCOLOR") {
        id = parseInt(nextCommand[1]);
        oldColor = this.animatedObjects.backgroundColor(id);
        this.animatedObjects.setBackgroundColor(
          id,
          this.parseColor(nextCommand[2])
        );
        undoBlock.push(new UndoSetBackgroundColor(id, oldColor));
      } else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHT") {
        var newHighlight = this.parseBool(nextCommand[2]);
        var oldHighlight = this.animatedObjects.getHighlight(
          parseInt(nextCommand[1])
        );
        this.animatedObjects.setHighlight(
          parseInt(nextCommand[1]),
          newHighlight
        );
        undoBlock.push(
          new UndoHighlight(parseInt(nextCommand[1]), oldHighlight)
        );
      } else if (nextCommand[0].toUpperCase() == "DISCONNECT") {
        var undoConnect = this.animatedObjects.disconnect(
          parseInt(nextCommand[1]),
          parseInt(nextCommand[2])
        );
        if (undoConnect != null) {
          undoBlock.push(undoConnect);
        }
      } else if (nextCommand[0].toUpperCase() == "SETALPHA") {
        var oldAlpha = this.animatedObjects.getAlpha(parseInt(nextCommand[1]));
        this.animatedObjects.setAlpha(
          parseInt(nextCommand[1]),
          parseFloat(nextCommand[2])
        );
        undoBlock.push(
          new UndoSetAlpha(parseInt(nextCommand[1]), oldAlpha)
        );
      } else if (nextCommand[0].toUpperCase() == "SETMESSAGE") {
        oldText = document.getElementById("message").value;
        document.getElementById("message").value = nextCommand[1];
        if (oldText != void 0) {
          undoBlock.push(new UndoSetMessage(oldText));
        }
      } else if (nextCommand[0].toUpperCase() == "SETTEXT") {
        if (nextCommand.length > 3) {
          var oldText = this.animatedObjects.getText(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[3])
          );
          this.animatedObjects.setText(
            parseInt(nextCommand[1]),
            nextCommand[2],
            parseInt(nextCommand[3])
          );
          if (parseInt(nextCommand[1]) === 0)
            document.getElementById("message").value = nextCommand[2];
          if (oldText != void 0) {
            undoBlock.push(
              new UndoSetText(
                parseInt(nextCommand[1]),
                oldText,
                parseInt(nextCommand[3])
              )
            );
          }
        } else {
          oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), 0);
          this.animatedObjects.setText(
            parseInt(nextCommand[1]),
            nextCommand[2],
            0
          );
          if (parseInt(nextCommand[1]) === 0)
            document.getElementById("message").value = nextCommand[2];
          if (oldText != void 0) {
            undoBlock.push(
              new UndoSetText(parseInt(nextCommand[1]), oldText, 0)
            );
          }
        }
      } else if (nextCommand[0].toUpperCase() == "DELETE") {
        var objectID = parseInt(nextCommand[1]);
        var i;
        var removedEdges = this.animatedObjects.deleteIncident(objectID);
        if (removedEdges.length > 0) {
          undoBlock = undoBlock.concat(removedEdges);
        }
        var obj = this.animatedObjects.getObject(objectID);
        if (obj != null) {
          undoBlock.push(obj.createUndoDelete());
          this.animatedObjects.removeObject(objectID);
        }
      } else if (nextCommand[0].toUpperCase() == "CREATEHIGHLIGHTCIRCLE") {
        if (nextCommand.length > 5) {
          this.animatedObjects.addHighlightCircleObject(
            parseInt(nextCommand[1]),
            this.parseColor(nextCommand[2]),
            parseFloat(nextCommand[5])
          );
        } else {
          this.animatedObjects.addHighlightCircleObject(
            parseInt(nextCommand[1]),
            this.parseColor(nextCommand[2]),
            20
          );
        }
        if (nextCommand.length > 4) {
          this.animatedObjects.setNodePosition(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[3]),
            parseInt(nextCommand[4])
          );
        }
        undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
        this.animatedObjects.draw();
      } else if (nextCommand[0].toUpperCase() == "CREATELABEL") {
        const labelID = parseInt(nextCommand[1]);
        const labelText = nextCommand[2];
        const hasCentering = nextCommand.length >= 6;
        const centering = hasCentering ? this.parseBool(nextCommand[5]) : true;
        const hasFontSize = nextCommand.length >= 7;
        const fontSizePercent = hasFontSize ? parseFloat(nextCommand[6]) : void 0;
        this.animatedObjects.addLabelObject(
          labelID,
          labelText,
          centering,
          fontSizePercent
        );
        if (nextCommand.length >= 5) {
          this.animatedObjects.setNodePosition(
            labelID,
            parseFloat(nextCommand[3]),
            parseFloat(nextCommand[4])
          );
        }
        undoBlock.push(new UndoCreate(labelID));
      } else if (nextCommand[0].toUpperCase() == "SETEDGECOLOR") {
        var from = parseInt(nextCommand[1]);
        var to = parseInt(nextCommand[2]);
        var newColor = this.parseColor(nextCommand[3]);
        var oldColor = this.animatedObjects.setEdgeColor(from, to, newColor);
        undoBlock.push(new UndoSetEdgeColor(from, to, oldColor));
      } else if (nextCommand[0].toUpperCase() == "SETEDGEALPHA") {
        var from = parseInt(nextCommand[1]);
        var to = parseInt(nextCommand[2]);
        var newAlpha = parseFloat(nextCommand[3]);
        var oldAplpha = this.animatedObjects.setEdgeAlpha(from, to, newAlpha);
        undoBlock.push(new UndoSetEdgeAlpha(from, to, oldAplpha));
      } else if (nextCommand[0].toUpperCase() == "SETEDGEHIGHLIGHT") {
        var newHighlight = this.parseBool(nextCommand[3]);
        var from = parseInt(nextCommand[1]);
        var to = parseInt(nextCommand[2]);
        var oldHighlight = this.animatedObjects.setEdgeHighlight(
          from,
          to,
          newHighlight
        );
        undoBlock.push(new UndoHighlightEdge(from, to, oldHighlight));
      } else if (nextCommand[0].toUpperCase() == "SETHEIGHT") {
        id = parseInt(nextCommand[1]);
        var oldHeight = this.animatedObjects.getHeight(id);
        this.animatedObjects.setHeight(id, parseInt(nextCommand[2]));
        undoBlock.push(new UndoSetHeight(id, oldHeight));
      } else if (nextCommand[0].toUpperCase() == "SETLAYER") {
        this.animatedObjects.setLayer(
          parseInt(nextCommand[1]),
          parseInt(nextCommand[2])
        );
      } else if (nextCommand[0].toUpperCase() == "CREATELINKEDLIST") {
        if (nextCommand.length >= 11) {
          const hasNumLinks = nextCommand.length >= 12;
          const numLinks = hasNumLinks ? parseInt(nextCommand[11]) : 1;
          this.animatedObjects.addLinkedListObject(
            parseInt(nextCommand[1]),
            //id
            nextCommand[2],
            //node label
            parseInt(nextCommand[3]),
            //w
            parseInt(nextCommand[4]),
            //h
            parseFloat(nextCommand[7]),
            //link percent
            this.parseBool(nextCommand[8]),
            //vertical orientation
            this.parseBool(nextCommand[9]),
            //linkat end
            parseInt(nextCommand[10]),
            //num labels
            numLinks,
            "#FFFFFF",
            "#000000"
          );
        } else {
          this.animatedObjects.addLinkedListObject(
            parseInt(nextCommand[1]),
            nextCommand[2],
            parseInt(nextCommand[3]),
            parseInt(nextCommand[4]),
            0.25,
            true,
            false,
            1,
            1,
            "#FFFFFF",
            "#000000"
          );
        }
        if (nextCommand.length > 6) {
          this.animatedObjects.setNodePosition(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[5]),
            parseInt(nextCommand[6])
          );
          undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
        }
      } else if (nextCommand[0].toUpperCase() == "SETNULL") {
        const objectID2 = parseInt(nextCommand[1]);
        const newNull = this.parseBool(nextCommand[2]);
        const hasIndex = nextCommand.length > 3;
        const linkIndex = hasIndex ? parseInt(nextCommand[3]) : void 0;
        var oldNull = this.animatedObjects.getNull(objectID2, linkIndex);
        this.animatedObjects.setNull(objectID2, newNull, linkIndex);
        undoBlock.push(new UndoSetNull(objectID2, oldNull, linkIndex));
      } else if (nextCommand[0].toUpperCase() == "SETTEXTCOLOR") {
        if (nextCommand.length > 3) {
          oldColor = this.animatedObjects.getTextColor(
            parseInt(nextCommand[1]),
            parseInt(nextCommand[3])
          );
          this.animatedObjects.setTextColor(
            parseInt(nextCommand[1]),
            this.parseColor(nextCommand[2]),
            parseInt(nextCommand[3])
          );
          undoBlock.push(
            new UndoSetTextColor(
              parseInt(nextCommand[1]),
              oldColor,
              parseInt(nextCommand[3])
            )
          );
        } else {
          oldColor = this.animatedObjects.getTextColor(
            parseInt(nextCommand[1]),
            0
          );
          this.animatedObjects.setTextColor(
            parseInt(nextCommand[1]),
            this.parseColor(nextCommand[2]),
            0
          );
          undoBlock.push(
            new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, 0)
          );
        }
      } else if (nextCommand[0].toUpperCase() == "CREATEBTREENODE") {
        this.animatedObjects.addBTreeNode(
          parseInt(nextCommand[1]),
          parseFloat(nextCommand[2]),
          parseFloat(nextCommand[3]),
          parseInt(nextCommand[4]),
          this.parseColor(nextCommand[7]),
          this.parseColor(nextCommand[8])
        );
        this.animatedObjects.setNodePosition(
          parseInt(nextCommand[1]),
          parseInt(nextCommand[5]),
          parseInt(nextCommand[6])
        );
        undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
      } else if (nextCommand[0].toUpperCase() == "SETWIDTH") {
        var id = parseInt(nextCommand[1]);
        this.animatedObjects.setWidth(id, parseInt(nextCommand[2]));
        var oldWidth = this.animatedObjects.getWidth(id);
        undoBlock.push(new UndoSetWidth(id, oldWidth));
      } else if (nextCommand[0].toUpperCase() == "SETNUMELEMENTS") {
        var oldElem = this.animatedObjects.getObject(parseInt(nextCommand[1]));
        undoBlock.push(
          new UndoSetNumElements(oldElem, parseInt(nextCommand[2]))
        );
        this.animatedObjects.setNumElements(
          parseInt(nextCommand[1]),
          parseInt(nextCommand[2])
        );
      } else if (nextCommand[0].toUpperCase() == "SETPOSITION") {
        var id = parseInt(nextCommand[1]);
        var oldX = this.animatedObjects.getNodeX(id);
        var oldY = this.animatedObjects.getNodeY(id);
        undoBlock.push(new UndoSetPosition(id, oldX, oldY));
        this.animatedObjects.setNodePosition(
          id,
          parseInt(nextCommand[2]),
          parseInt(nextCommand[3])
        );
      } else if (nextCommand[0].toUpperCase() == "ALIGNRIGHT") {
        var id = parseInt(nextCommand[1]);
        var oldX = this.animatedObjects.getNodeX(id);
        var oldY = this.animatedObjects.getNodeY(id);
        undoBlock.push(new UndoSetPosition(id, oldX.oldY));
        this.animatedObjects.alignRight(id, parseInt(nextCommand[2]));
      } else if (nextCommand[0].toUpperCase() == "ALIGNLEFT") {
        var id = parseInt(nextCommand[1]);
        var oldX = this.animatedObjects.getNodeX(id);
        var oldY = this.animatedObjects.getNodeY(id);
        undoBlock.push(new UndoSetPosition(id, oldX.oldY));
        this.animatedObjects.alignLeft(id, parseInt(nextCommand[2]));
      } else if (nextCommand[0].toUpperCase() == "ALIGNTOP") {
        var id = parseInt(nextCommand[1]);
        var oldX = this.animatedObjects.getNodeX(id);
        var oldY = this.animatedObjects.getNodeY(id);
        undoBlock.push(new UndoSetPosition(id, oldX.oldY));
        this.animatedObjects.alignTop(id, parseInt(nextCommand[2]));
      } else if (nextCommand[0].toUpperCase() == "ALIGNBOTTOM") {
        var id = parseInt(nextCommand[1]);
        var oldX = this.animatedObjects.getNodeX(id);
        var oldY = this.animatedObjects.getNodeY(id);
        undoBlock.push(new UndoSetPosition(id, oldX.oldY));
        this.animatedObjects.alignBottom(id, parseInt(nextCommand[2]));
      } else if (nextCommand[0].toUpperCase() == "SETHIGHLIGHTINDEX") {
        var id = parseInt(nextCommand[1]);
        var index = parseInt(nextCommand[2]);
        var oldIndex = this.animatedObjects.getHighlightIndex(id);
        undoBlock.push(new UndoSetHighlightIndex(id, oldIndex));
        this.animatedObjects.setHighlightIndex(id, index);
      } else {
      }
      this.currentAnimation = this.currentAnimation + 1;
    }
    this.currFrame = 0;
    if (!anyAnimations && this.animationPaused || !anyAnimations && this.currentAnimation == this.AnimationSteps.length) {
      this.currFrame = this.animationBlockLength;
    }
    if (!anyAnimations) {
      this.animatedObjects.draw();
    }
    this.undoStack.push(undoBlock);
    this.currentBlockIndex = Math.min(this.currentBlockIndex + 1, this.totalBlocks);
    this.updateScrubUI();
  };
  this.StartNewAnimation = function(commands) {
    clearTimeout(timer);
    if (this.AnimationSteps != null) {
      this.previousAnimationSteps.push(this.AnimationSteps);
      this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
    }
    if (commands == void 0 || commands.length == 0) {
      this.AnimationSteps = ["Step"];
    } else {
      this.AnimationSteps = commands;
    }
    this.undoAnimationStepIndices = new Array();
    this.currentAnimation = 0;
    this.totalBlocks = this.computeTotalBlocks();
    this.currentBlockIndex = 0;
    this.updateScrubUI();
    this.startNextBlock();
    this.currentlyAnimating = true;
    this.fireEvent("AnimationStarted", "NoData");
    timer = setTimeout(timeoutFn, 30);
  };
  this.stepBack = function() {
    if (this.awaitingStep && this.undoStack != null && this.undoStack.length != 0) {
      this.fireEvent("AnimationStarted", "NoData");
      clearTimeout(timer);
      this.awaitingStep = false;
      this.undoLastBlock();
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    } else if (!this.currentlyAnimating && this.animationPaused && this.undoAnimationStepIndices != null) {
      this.fireEvent("AnimationStarted", "NoData");
      this.currentlyAnimating = true;
      this.undoLastBlock();
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    } else {
      this.fireEvent("AnimationReady", "NoData");
    }
  };
  this.step = function() {
    if (this.awaitingStep) {
      this.startNextBlock();
      this.fireEvent("AnimationStarted", "NoData");
      this.currentlyAnimating = true;
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    }
  };
  this.clearHistory = function() {
    this.undoStack = [];
    this.undoAnimationStepIndices = null;
    this.previousAnimationSteps = [];
    this.undoAnimationStepIndicesStack = [];
    this.AnimationSteps = null;
    this.fireEvent("AnimationUndoUnavailable", "NoData");
    clearTimeout(timer);
    this.animatedObjects.update();
    this.animatedObjects.draw();
    document.getElementById("message").value = "";
  };
  this.skipBack = function() {
    var keepUndoing = this.undoAnimationStepIndices != null && this.undoAnimationStepIndices.length != 0;
    if (keepUndoing) {
      var i;
      for (i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
        var objectID = this.currentBlock[i].objectID;
        this.animatedObjects.setNodePosition(
          objectID,
          this.currentBlock[i].toX,
          this.currentBlock[i].toY
        );
      }
      if (this.doingUndo) {
        this.finishUndoBlock(this.undoStack.pop());
      }
      while (keepUndoing) {
        this.undoLastBlock();
        for (i = 0; i < this.currentBlock.length; i++) {
          objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY
          );
        }
        keepUndoing = this.finishUndoBlock(this.undoStack.pop());
      }
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      if (this.undoStack == null || this.undoStack.length == 0) {
        if (!this.singleMode)
          this.fireEvent("AnimationUndoUnavailable", "NoData");
        else
          this.fireEvent("AnimationReady", "NoData");
      }
      this.currentBlockIndex = 0;
      this.updateScrubUI();
    }
  };
  this.resetAll = function() {
    this.clearHistory();
    this.animatedObjects.clearAllObjects();
    this.animatedObjects.draw();
    clearTimeout(timer);
  };
  this.skipForward = function() {
    if (this.currentlyAnimating) {
      this.animatedObjects.runFast = true;
      while (this.AnimationSteps != null && this.currentAnimation < this.AnimationSteps.length) {
        var i;
        for (i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
          var objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY
          );
        }
        if (this.doingUndo) {
          this.finishUndoBlock(this.undoStack.pop());
        }
        this.startNextBlock();
        for (i = 0; i < this.currentBlock.length; i++) {
          var objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY
          );
        }
      }
      this.animatedObjects.update();
      this.currentlyAnimating = false;
      this.doingUndo = false;
      this.awaitingStep = false;
      this.animatedObjects.runFast = false;
      if (!this.singleMode)
        this.fireEvent("AnimationEnded", "NoData");
      else
        this.fireEvent("AnimationAdvanceUnavailable", "NoData");
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      this.currentBlockIndex = this.totalBlocks;
      this.updateScrubUI();
    }
  };
  this.finishUndoBlock = function(undoBlock) {
    for (var i = undoBlock.length - 1; i >= 0; i--) {
      undoBlock[i].undoInitialStep(this.animatedObjects);
    }
    this.doingUndo = false;
    if (this.undoAnimationStepIndices.length == 0) {
      if (this.singleMode) {
        return false;
      }
      this.awaitingStep = false;
      this.currentlyAnimating = false;
      this.undoAnimationStepIndices = this.undoAnimationStepIndicesStack.pop();
      this.AnimationSteps = this.previousAnimationSteps.pop();
      this.fireEvent("AnimationEnded", "NoData");
      this.fireEvent("AnimationUndo", "NoData");
      this.currentBlock = [];
      if (this.undoStack == null || this.undoStack.length == 0) {
        this.currentlyAnimating = false;
        this.awaitingStep = false;
        this.fireEvent("AnimationUndoUnavailable", "NoData");
      }
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      this.currentBlockIndex = 0;
      this.updateScrubUI();
      return false;
    }
    return true;
  };
  this.undoLastBlock = function() {
    if (this.undoAnimationStepIndices.length == 0) {
      return;
    }
    if (this.undoAnimationStepIndices.length > 0) {
      this.doingUndo = true;
      var anyAnimations = false;
      this.currentAnimation = this.undoAnimationStepIndices.pop();
      this.currentBlock = [];
      var undo = this.undoStack[this.undoStack.length - 1];
      var i;
      for (i = undo.length - 1; i >= 0; i--) {
        var animateNext = undo[i].addUndoAnimation(this.currentBlock);
        anyAnimations = anyAnimations || animateNext;
      }
      this.currFrame = 0;
      if (!anyAnimations && this.animationPaused) {
        this.currFrame = this.animationBlockLength;
      }
      this.currentlyAnimating = true;
      this.currentBlockIndex = Math.max(this.currentBlockIndex - 1, 0);
      this.updateScrubUI();
    }
  };
  this.setLayer = function(shown, layers) {
    this.animatedObjects.setLayer(shown, layers);
    this.animatedObjects.draw();
  };
  this.setAllLayers = function(layers) {
    this.animatedObjects.setAllLayers(layers);
    this.animatedObjects.draw();
  };
  this.update = function() {
    if (this.currentlyAnimating) {
      this.currFrame = this.currFrame + 1;
      var i;
      for (i = 0; i < this.currentBlock.length; i++) {
        if (this.currFrame == this.animationBlockLength || this.currFrame == 1 && this.animationBlockLength == 0) {
          this.animatedObjects.setNodePosition(
            this.currentBlock[i].objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY
          );
        } else if (this.currFrame < this.animationBlockLength) {
          var objectID = this.currentBlock[i].objectID;
          var percent = 1 / (this.animationBlockLength - this.currFrame);
          var oldX = this.animatedObjects.getNodeX(objectID);
          var oldY = this.animatedObjects.getNodeY(objectID);
          var targetX = this.currentBlock[i].toX;
          var targety = this.currentBlock[i].toY;
          var newX = this.lerp(
            this.animatedObjects.getNodeX(objectID),
            this.currentBlock[i].toX,
            percent
          );
          var newY = this.lerp(
            this.animatedObjects.getNodeY(objectID),
            this.currentBlock[i].toY,
            percent
          );
          this.animatedObjects.setNodePosition(objectID, newX, newY);
        }
        objectManager2.draw();
      }
      if (this.currFrame >= this.animationBlockLength) {
        if (this.doingUndo) {
          if (this.finishUndoBlock(this.undoStack.pop())) {
            this.awaitingStep = true;
            this.fireEvent("AnimationWaiting", "NoData");
            objectManager2.draw();
            clearTimeout(timer);
          }
        } else {
          if (this.animationPaused && this.currentAnimation < this.AnimationSteps.length) {
            this.awaitingStep = true;
            this.fireEvent("AnimationWaiting", "NoData");
            this.currentBlock = [];
            objectManager2.draw();
            clearTimeout(timer);
          } else {
            this.startNextBlock();
          }
        }
      }
      this.animatedObjects.update();
      this.updateScrubUI();
    }
  };
  this.attachScrubSlider = function(sliderEl) {
    this.scrubSlider = sliderEl;
    this.updateScrubUI();
  };
  this.computeTotalBlocks = function() {
    if (!this.AnimationSteps || !Array.isArray(this.AnimationSteps))
      return 0;
    let blocks = 0;
    for (const step of this.AnimationSteps) {
      const cmd = String(step).split("<;>")[0].toUpperCase();
      if (cmd === "STEP")
        blocks++;
    }
    return blocks;
  };
  this.updateScrubUI = function() {
    if (!this.scrubSlider)
      return;
    const hasAnim = Array.isArray(this.AnimationSteps) && this.AnimationSteps.length > 0;
    this.scrubSlider.disabled = !hasAnim;
    this.scrubSlider.max = String(this.totalBlocks);
    this.scrubSlider.value = String(Math.max(0, Math.min(this.currentBlockIndex, this.totalBlocks)));
  };
  this.finishCurrentBlockInstantly = function() {
    if (!this.currentBlock || this.currentBlock.length === 0)
      return;
    for (var i = 0; i < this.currentBlock.length; i++) {
      var objectID = this.currentBlock[i].objectID;
      this.animatedObjects.setNodePosition(
        objectID,
        this.currentBlock[i].toX,
        this.currentBlock[i].toY
      );
    }
    this.currFrame = this.animationBlockLength;
    this.currentBlock = [];
    this.animatedObjects.update();
    this.animatedObjects.draw();
  };
  this.scrubToBlock = function(targetBlockIndex) {
    if (!Number.isFinite(targetBlockIndex))
      return;
    targetBlockIndex = Math.max(0, Math.min(targetBlockIndex, this.totalBlocks));
    if (!this.AnimationSteps || this.AnimationSteps.length === 0)
      return;
    clearTimeout(timer);
    this.animationPaused = true;
    if (this.currentlyAnimating) {
      this.finishCurrentBlockInstantly();
    }
    this.currentlyAnimating = false;
    this.doingUndo = false;
    if (targetBlockIndex === this.currentBlockIndex) {
      this.awaitingStep = targetBlockIndex < this.totalBlocks;
      this.updateScrubUI();
      this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
      return;
    }
    if (targetBlockIndex < this.currentBlockIndex) {
      while (this.currentBlockIndex > targetBlockIndex && this.undoAnimationStepIndices && this.undoAnimationStepIndices.length > 0) {
        this.undoLastBlock();
        for (var i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
          var objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY
          );
        }
        const undoBlock = this.undoStack.pop();
        if (undoBlock) {
          this.finishUndoBlock(undoBlock);
          this.currentBlock = [];
        } else {
          break;
        }
      }
      this.updateScrubUI();
      this.animatedObjects.update();
      this.animatedObjects.draw();
      this.currentlyAnimating = false;
      this.doingUndo = false;
      this.awaitingStep = targetBlockIndex < this.totalBlocks;
      this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
      return;
    }
    while (this.currentBlockIndex < targetBlockIndex && this.currentAnimation < this.AnimationSteps.length) {
      this.startNextBlock();
      this.finishCurrentBlockInstantly();
    }
    this.updateScrubUI();
    this.currentlyAnimating = false;
    this.doingUndo = false;
    this.awaitingStep = targetBlockIndex < this.totalBlocks;
    this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
  };
}
AnimationManager.prototype = new EventListener();
AnimationManager.prototype.constructor = AnimationManager;
AnimationManager.prototype.setSingleMode = function() {
  this.singleMode = true;
  let parent = document.getElementById("AlgorithmSpecificControls");
  parent.style.display = "none";
};
function SingleAnimation(id, fromX, fromY, toX, toY) {
  this.objectID = id;
  this.fromX = fromX;
  this.fromY = fromY;
  this.toX = toX;
  this.toY = toY;
}

// AlgorithmLibrary/AVL.js
function AVL(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "AVL Tree";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
AVL.prototype = new Algorithm();
AVL.prototype.constructor = AVL;
AVL.superclass = Algorithm.prototype;
AVL.HIGHLIGHT_LABEL_COLOR = "#ca1616ff";
AVL.HIGHLIGHT_LINK_COLOR = "var(--svgColor)";
AVL.FOREGROUND_COLOR = "var(--svgColor)";
AVL.WIDTH_DELTA = 70;
AVL.HEIGHT_DELTA = 50;
AVL.STARTING_Y = 50;
AVL.EXPLANITORY_TEXT_X = 10;
AVL.EXPLANITORY_TEXT_Y = 10;
AVL.prototype.init = function(am, w2, h) {
  var sc = AVL.superclass;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.startingX = 150;
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 100, AVL.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 150, AVL.STARTING_Y - 10);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doDelete = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function(order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
AVL.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this, "Print");
};
AVL.prototype.reset = function() {
  this.nextIndex = 2;
  this.treeRoot = null;
};
AVL.prototype.insertCallback = function(event) {
  var insertedValue = this.inputField.value;
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
AVL.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
AVL.prototype.findCallback = function(event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    findValue = this.normalizeNumber(findValue, 4);
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
AVL.prototype.printCallback = function(event) {
  this.implementAction(this.printTree.bind(this), "In");
};
AVL.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
AVL.prototype.clearData = function() {
  if (this.treeRoot == null)
    return;
  this.commands = new Array();
  function clearTree(tree, handler) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left, handler);
      }
      if (tree.right != null) {
        clearTree(tree.right, handler);
      }
    }
    handler.cmd("Delete", tree.graphicID);
    handler.cmd("Delete", tree.heightLabelID);
  }
  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("SetMessage", "");
  return this.commands;
};
AVL.prototype.insertRandomCallback = function(event) {
  var numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const insertedValue = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
AVL.prototype.printLeft = function(tree, order) {
  if (tree.left != null) {
    this.cmd("SetMessage", tree.data + " has left child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    this.printTreeRec(tree.left, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no left child");
    this.cmd("Step");
  }
};
AVL.prototype.printRight = function(tree, order) {
  if (tree.right != null) {
    this.cmd("SetMessage", tree.data + " has right child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
    this.printTreeRec(tree.right, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no right child");
    this.cmd("Step");
  }
};
AVL.prototype.printSelf = function(tree) {
  if (this.printOutput.length > 0) {
    this.printOutput += ", ";
  }
  this.printOutput += tree.data;
  this.cmd(
    "SetMessage",
    "Print " + tree.data + "\nCurrent output: " + this.printOutput
  );
  this.cmd("Step");
};
AVL.prototype.sizeChanged = function(newWidth, newHeight) {
  this.startingX = newWidth / 2;
};
AVL.prototype.printTree = function(order) {
  this.commands = [];
  this.printOutput = "";
  if (this.treeRoot != null) {
    this.cmd("SetMessage", "Starting from root");
    this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", this.treeRoot.graphicID, 0);
    this.printTreeRec(this.treeRoot, order);
    this.cmd("SetMessage", "Final output: " + this.printOutput);
  }
  return this.commands;
};
AVL.prototype.printTreeRec = function(tree, order) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (order == "Pre") {
    this.printSelf(tree);
    this.printLeft(tree, order);
    this.printRight(tree, order);
  } else if (order == "Post") {
    this.printLeft(tree, order);
    this.printRight(tree, order);
    this.printSelf(tree);
  } else {
    this.printLeft(tree, order);
    this.printSelf(tree);
    this.printRight(tree, order);
  }
  this.cmd("SetMessage", "Done with " + tree.data + " return to parent");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("Step");
};
AVL.prototype.findElement = function(findValue) {
  this.commands = [];
  this.highlightID = this.nextIndex++;
  this.findHelp(this.treeRoot, findValue);
  return this.commands;
};
AVL.prototype.findHelp = function(tree, value) {
  this.cmd("SetMessage", "Searchiing for " + value);
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " + value + " : " + value + " = " + value + " (Element found!)"
      );
      this.cmd("Step");
      this.cmd("SetMessage", "Found:" + value);
      this.cmd("SetHighlight", tree.graphicID, 0);
    } else {
      if (tree.data > value) {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " : " + value + " < " + tree.data + " (look to left subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.left != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            AVL.HIGHLIGHT_COLOR,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.findHelp(tree.left, value);
      } else {
        this.cmd(
          "SetMessage",
          " Searching for " + value + " : " + value + " > " + tree.data + " (look to right subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.right != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            AVL.HIGHLIGHT_COLOR,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.findHelp(tree.right, value);
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      " Searching for " + value + " : < Empty Tree > (Element not found)"
    );
    this.cmd("Step");
    this.cmd(
      "SetMessage",
      " Searching for " + value + " :  (Element not found)"
    );
  }
};
AVL.prototype.insertElement = function(insertedValue) {
  this.commands = [];
  this.cmd("SetMessage", " Inserting " + insertedValue);
  if (this.treeRoot == null) {
    var treeNodeID = this.nextIndex++;
    var labelID = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX,
      AVL.STARTING_Y
    );
    this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
    this.cmd(
      "SetMessage",
      `Root is null. Inserting ${insertedValue} as the root`
    );
    this.cmd("Step");
    this.cmd(
      "CreateLabel",
      labelID,
      0,
      this.startingX - 20,
      AVL.STARTING_Y - 20
    );
    this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("Step");
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, treeNodeID, AVL.LINK_COLOR);
    this.treeRoot = new AVLNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX,
      AVL.STARTING_Y
    );
    this.treeRoot.height = 0;
  } else {
    treeNodeID = this.nextIndex++;
    labelID = this.nextIndex++;
    this.highlightID = this.nextIndex++;
    this.cmd("CreateCircle", treeNodeID, insertedValue, 30, AVL.STARTING_Y);
    this.cmd("SetForegroundColor", treeNodeID, AVL.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", treeNodeID, AVL.BACKGROUND_COLOR);
    this.cmd("CreateLabel", labelID, "", 100 - 20, 100 - 20);
    this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
    this.cmd("Step");
    var insertElem = new AVLNode(insertedValue, treeNodeID, labelID, 100, 100);
    this.cmd("SetHighlight", insertElem.graphicID, 1);
    insertElem.height = 0;
    this.insert(insertElem, this.treeRoot);
  }
  this.cmd("SetMessage", " ");
  return this.commands;
};
AVL.prototype.singleRotateRight = function(tree) {
  var B = tree;
  var t3 = B.right;
  var A = tree.left;
  var t1 = A.left;
  var t2 = A.right;
  this.cmd("SetMessage", `Rotate right around pivot ${B.data}`);
  this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
  this.setHighlights([A.graphicID, B.graphicID], 1);
  this.cmd("Step");
  this.setHighlights([A.graphicID, B.graphicID], 0);
  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, AVL.LINK_COLOR);
    t2.parent = B;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, AVL.LINK_COLOR);
  A.parent = B.parent;
  if (this.treeRoot == B) {
    this.treeRoot = A;
    this.cmd("Disconnect", 0, B.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", 0, A.graphicID, AVL.LINK_COLOR);
  } else {
    this.cmd("Disconnect", B.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", B.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
    if (B.isLeftChild()) {
      B.parent.left = A;
    } else {
      B.parent.right = A;
    }
  }
  A.right = B;
  B.parent = A;
  B.left = t2;
  this.resetHeight(B);
  this.resetHeight(A);
  this.resizeTree();
};
AVL.prototype.singleRotateLeft = function(tree) {
  var A = tree;
  var B = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  this.cmd("SetMessage", `Rotate left around pivot ${A.data}`);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.setHighlights([A.graphicID, B.graphicID], 1);
  this.cmd("Step");
  this.setHighlights([A.graphicID, B.graphicID], 0);
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, AVL.LINK_COLOR);
    t2.parent = A;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, AVL.LINK_COLOR);
  B.parent = A.parent;
  if (this.treeRoot == A) {
    this.treeRoot = B;
    this.cmd("Disconnect", 0, A.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", 0, B.graphicID, AVL.LINK_COLOR);
  } else {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID, AVL.LINK_COLOR);
    this.cmd("Connect", A.parent.graphicID, B.graphicID, AVL.LINK_COLOR);
    if (A.isLeftChild()) {
      A.parent.left = B;
    } else {
      A.parent.right = B;
    }
  }
  B.left = A;
  A.parent = B;
  A.right = t2;
  this.resetHeight(A);
  this.resetHeight(B);
  this.resizeTree();
};
AVL.prototype.getHeight = function(tree) {
  if (tree == null) {
    return -1;
  }
  return tree.height;
};
AVL.prototype.getBalance = function(tree) {
  if (tree == null)
    return 0;
  return this.getHeight(tree.left) - this.getHeight(tree.right);
};
AVL.prototype.resetHeight = function(tree) {
  if (tree != null) {
    var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    if (tree.height != newHeight) {
      tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
      this.cmd("SetText", tree.heightLabelID, newHeight);
    }
  }
};
AVL.prototype.doubleRotateRight = function(tree) {
  var A = tree.left;
  var B = tree.left.right;
  var C = tree;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetMessage", `Unbalanced by 2 at pivot ${C.data}. Double rotation (zig-zag): left around pivot ${A.data}, then right around pivot ${C.data}.`);
  this.setHighlights([A.graphicID, B.graphicID, C.graphicID], 1);
  this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 1);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.cmd("Step");
  this.setHighlights([A.graphicID, B.graphicID, C.graphicID], 0);
  this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 0);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 0);
  this.singleRotateLeft(A);
  this.cmd("SetMessage", `Left rotation around pivot ${A.data} complete. Now rotate right around pivot ${C.data}.`);
  this.cmd("Step");
  this.singleRotateRight(C);
};
AVL.prototype.setHighlights = function(elementList, value = 1) {
  for (let l of elementList) {
    this.cmd("SetHighlight", l, value);
  }
};
AVL.prototype.doubleRotateLeft = function(tree) {
  var A = tree;
  var B = tree.right.left;
  var C = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetMessage", `Unbalanced by 2 at pivot ${A.data}. Double rotation (zig-zag): right around pivot ${C.data}, then left around pivot ${A.data}.`);
  this.setHighlights([A.graphicID, B.graphicID, C.graphicID], 1);
  this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 1);
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);
  this.cmd("Step");
  this.setHighlights([A.graphicID, B.graphicID, C.graphicID], 0);
  this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 0);
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 0);
  this.singleRotateRight(C);
  this.cmd("SetMessage", `Right rotation around pivot ${C.data} complete. Now rotate left around pivot ${A.data}.`);
  this.cmd("Step");
  this.singleRotateLeft(A);
};
AVL.prototype.insert = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree"
    );
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree"
    );
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetText", elem.heightLabelID, 0);
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
      this.resizeTree();
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.left.x,
        tree.left.y
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      if (tree.height < tree.left.height + 1) {
        tree.height = tree.left.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", msgHighlight);
      if (this.getBalance(tree) > 1) {
        if (elem.data < tree.left.data) {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.singleRotateRight(tree);
        } else {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): left around pivot ${tree.left.data}, then right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.doubleRotateRight(tree);
        }
      }
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.left);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.left.x,
        tree.left.y
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      if (tree.height < tree.left.height + 1) {
        tree.height = tree.left.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", msgHighlight);
      if (this.getBalance(tree) < -1) {
        if (elem.data >= tree.right.data) {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate left around pivot ${tree.data}.`);
          this.cmd("Step");
          this.singleRotateLeft(tree);
        } else {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): right around pivot ${tree.right.data}, then left around pivot ${tree.data}.`);
          this.cmd("Step");
          this.doubleRotateLeft(tree);
        }
      }
      if (this.getBalance(tree) > 1) {
        if (elem.data < tree.left.data) {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.singleRotateRight(tree);
        } else {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): left around pivot ${tree.left.data}, then right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.doubleRotateRight(tree);
        }
      }
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetText", elem.heightLabelID, 0);
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, AVL.LINK_COLOR);
      elem.x = tree.x + AVL.WIDTH_DELTA / 2;
      elem.y = tree.y + AVL.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
      this.resizeTree();
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.right.x,
        tree.right.y
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      if (tree.height < tree.right.height + 1) {
        tree.height = tree.right.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", msgHighlight);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.right);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        AVL.HIGHLIGHT_COLOR,
        tree.right.x,
        tree.right.y
      );
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
      this.cmd("Step");
      if (tree.height < tree.right.height + 1) {
        tree.height = tree.right.height + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.cmd("Delete", msgHighlight);
      if (this.getBalance(tree) < -1) {
        if (elem.data >= tree.right.data) {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate left around pivot ${tree.data}.`);
          this.cmd("Step");
          this.singleRotateLeft(tree);
        } else {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): right around pivot ${tree.right.data}, then left around pivot ${tree.data}.`);
          this.cmd("Step");
          this.doubleRotateLeft(tree);
        }
      }
    }
  }
};
AVL.prototype.deleteElement = function(deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", " ");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", " ");
  return this.commands;
};
AVL.prototype.treeDelete = function(tree, valueToDelete) {
  if (tree != null) {
    let isRoot = tree.parent == null;
    var isLeftChild = !isRoot && tree.parent.left == tree;
    let isRightChild = !isRoot && tree.parent.right == tree;
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (valueToDelete < tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " < " + tree.data + ".  Looking at left subtree"
      );
    } else if (valueToDelete > tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " > " + tree.data + ".  Looking at right subtree"
      );
    } else {
      this.cmd(
        "SetMessage",
        valueToDelete + " == " + tree.data + ".  Found node to delete"
      );
    }
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    if (valueToDelete == tree.data) {
      if (tree.left == null && tree.right == null) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.cmd("Delete", tree.graphicID);
        this.cmd("Delete", tree.heightLabelID);
        if (isLeftChild && tree.parent != null) {
          tree.parent.left = null;
        } else if (tree.parent != null) {
          tree.parent.right = null;
        } else {
          this.treeRoot = null;
          this.cmd("SetNull", this.rootIndex, 1);
          this.cmd("Disconnect", 0, tree.graphicID);
        }
        this.resizeTree();
        this.cmd("Step");
      } else if (tree.left == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node."
        );
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            AVL.LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          if (isLeftChild) {
            tree.parent.left = tree.right;
          } else {
            tree.parent.right = tree.right;
          }
          tree.right.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          this.treeRoot = tree.right;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } else if (tree.right == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node."
        );
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            AVL.LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          if (isLeftChild) {
            tree.parent.left = tree.left;
          } else {
            tree.parent.right = tree.left;
          }
          tree.left.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.heightLabelID);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind smallest node in right subtree."
        );
        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y
        );
        var tmp = tree;
        tmp = tree.right;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd("Step");
        while (tmp.left != null) {
          tmp = tmp.left;
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
        this.cmd("SetForegroundColor", labelID, AVL.HEIGHT_LABEL_COLOR);
        tree.data = tmp.data;
        this.cmd("Move", labelID, tree.x, tree.y);
        this.cmd(
          "SetMessage",
          "Copy smallest value of right subtree over value being removed."
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetMessage", "Remove node whose value we copied.");
        if (tmp.right == null) {
          if (tmp.parent != tree) {
            tmp.parent.left = null;
          } else {
            tree.right = null;
          }
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.heightLabelID);
          this.resizeTree();
        } else {
          this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
          this.cmd(
            "Connect",
            tmp.parent.graphicID,
            tmp.right.graphicID,
            AVL.LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.heightLabelID);
          if (tmp.parent != tree) {
            tmp.parent.left = tmp.right;
            tmp.right.parent = tmp.parent;
          } else {
            tree.right = tmp.right;
            tmp.right.parent = tree;
          }
          this.resizeTree();
        }
        tmp = tmp.parent;
        if (this.getHeight(tmp) != Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1) {
          tmp.height = Math.max(this.getHeight(tmp.left), this.getHeight(tmp.right)) + 1;
          this.cmd("SetText", tmp.heightLabelID, tmp.height);
          this.cmd("SetMessage", `Adjusting height after recursive call to ${tmp.height}`);
          this.cmd(
            "SetForegroundColor",
            tmp.heightLabelID,
            AVL.HIGHLIGHT_LABEL_COLOR
          );
          this.cmd("Step");
          this.cmd(
            "SetForegroundColor",
            tmp.heightLabelID,
            AVL.HEIGHT_LABEL_COLOR
          );
        }
        while (tmp != tree) {
          var tmpPar = tmp.parent;
          var msgHighlight = this.nextIndex++;
          this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tmp.x, tmp.y);
          this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tmp.left)}, right height: ${this.getHeight(tmp.right)}; balance: ${this.getHeight(tmp.left) - this.getHeight(tmp.right)}`);
          this.cmd("Step");
          this.cmd("Delete", msgHighlight);
          if (this.getHeight(tmp.left) - this.getHeight(tmp.right) > 1) {
            if (this.getHeight(tmp.left.right) > this.getHeight(tmp.left.left)) {
              this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tmp.data}. Double rotation (zig-zag): left around pivot ${tmp.left.data}, then right around pivot ${tmp.data}.`);
              this.doubleRotateRight(tmp);
              this.cmd("Step");
            } else {
              this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tmp.data}. Rotate right around pivot ${tmp.data}.`);
              this.cmd("Step");
              this.singleRotateRight(tmp);
            }
          }
          if (tmpPar.right != null) {
            if (tmpPar == tree) {
              this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                AVL.HIGHLIGHT_COLOR,
                tmpPar.left.x,
                tmpPar.left.y
              );
            } else {
              this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                AVL.HIGHLIGHT_COLOR,
                tmpPar.right.x,
                tmpPar.right.y
              );
            }
            this.cmd("Move", this.highlightID, tmpPar.x, tmpPar.y);
            this.cmd("SetMessage", `Adjusting height in ${tmpPar.data}`);
            if (this.getHeight(tmpPar) != Math.max(
              this.getHeight(tmpPar.left),
              this.getHeight(tmpPar.right)
            ) + 1) {
              tmpPar.height = Math.max(
                this.getHeight(tmpPar.left),
                this.getHeight(tmpPar.right)
              ) + 1;
              this.cmd("SetText", tmpPar.heightLabelID, tree.height);
              this.cmd("SetMessage", `Adjusting height after recursive call to ${tmpPar.height}`);
              this.cmd(
                "SetForegroundColor",
                tmpPar.heightLabelID,
                AVL.HIGHLIGHT_LABEL_COLOR
              );
              this.cmd("Step");
              this.cmd(
                "SetForegroundColor",
                tmpPar.heightLabelID,
                AVL.HEIGHT_LABEL_COLOR
              );
            }
            this.cmd("Step");
            this.cmd("Delete", this.highlightID);
          }
          tmp = tmpPar;
        }
        var msgHighlight = this.nextIndex++;
        this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
        this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
        this.cmd("Step");
        this.cmd("Delete", msgHighlight);
        if (this.getHeight(tree.right) - this.getHeight(tree.left) > 1) {
          if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right)) {
            this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): right around pivot ${tree.right.data}, then left around pivot ${tree.data}.`);
            this.cmd("Step");
            this.doubleRotateLeft(tree);
          } else {
            this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate left around pivot ${tree.data}.`);
            this.cmd("Step");
            this.singleRotateLeft(tree);
          }
        }
      }
    } else if (valueToDelete < tree.data) {
      if (tree.left != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y
        );
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.left, valueToDelete);
      if (tree.left != null) {
        this.cmd("SetMessage", "Unwinding recursion.");
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.left.x,
          tree.left.y
        );
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", msgHighlight);
      if (this.getHeight(tree.right) - this.getHeight(tree.left) > 1) {
        if (this.getHeight(tree.right.left) > this.getHeight(tree.right.right)) {
          this.doubleRotateLeft(tree);
        } else {
          this.singleRotateLeft(tree);
        }
      }
      if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1) {
        tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
    } else {
      if (tree.right != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.x,
          tree.y
        );
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.right, valueToDelete);
      if (tree.right != null) {
        this.cmd("SetMessage", `Adjusting height in ${tree.data}`);
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          AVL.HIGHLIGHT_COLOR,
          tree.right.x,
          tree.right.y
        );
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      var msgHighlight = this.nextIndex++;
      this.cmd("CreateHighlightCircle", msgHighlight, AVL.HIGHLIGHT_COLOR, tree.x, tree.y);
      this.cmd("SetMessage", `Check balance. 
left height: ${this.getHeight(tree.left)}, right height: ${this.getHeight(tree.right)}; balance: ${this.getHeight(tree.left) - this.getHeight(tree.right)}`);
      this.cmd("Step");
      this.cmd("Delete", msgHighlight);
      if (this.getHeight(tree.left) - this.getHeight(tree.right) > 1) {
        if (this.getHeight(tree.left.right) > this.getHeight(tree.left.left)) {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Double rotation (zig-zag): left around pivot ${tree.left.data}, then right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.doubleRotateRight(tree);
        } else {
          this.cmd("SetMessage", `Unbalanced by 2 at pivot ${tree.data}. Rotate right around pivot ${tree.data}.`);
          this.cmd("Step");
          this.singleRotateRight(tree);
        }
      }
      if (this.getHeight(tree) != Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1) {
        tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
        this.cmd("SetText", tree.heightLabelID, tree.height);
        this.cmd("SetMessage", `Adjusting height after recursive call to ${tree.height}`);
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HIGHLIGHT_LABEL_COLOR
        );
        this.cmd("Step");
        this.cmd(
          "SetForegroundColor",
          tree.heightLabelID,
          AVL.HEIGHT_LABEL_COLOR
        );
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete"
    );
  }
};
AVL.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth
      );
    }
    this.setNewPositions(this.treeRoot, startingPoint, AVL.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
AVL.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
      tree.heightLabelX = xPosition - 20;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
      tree.heightLabelX = xPosition + 20;
    } else {
      tree.heightLabelX = xPosition - 20;
    }
    tree.x = xPosition;
    tree.heightLabelY = tree.y - 20;
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + AVL.HEIGHT_DELTA,
      -1
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + AVL.HEIGHT_DELTA,
      1
    );
  }
};
AVL.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.cmd("Move", tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
AVL.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), AVL.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    AVL.WIDTH_DELTA / 2
  );
  return tree.leftWidth + tree.rightWidth;
};
AVL.prototype.disableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
AVL.prototype.enableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};
function AVLNode(val, id, hid, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.heightLabelID = hid;
  this.height = 0;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}
AVLNode.prototype.isLeftChild = function() {
  if (this.parent == null) {
    return true;
  }
  return this.parent.left == this;
};

// node_modules/random/dist/index.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var RNG = class {
};
var FunctionRNG = class _FunctionRNG extends RNG {
  constructor(rngFn) {
    var _a;
    super();
    __publicField(this, "_name");
    __publicField(this, "_rngFn");
    this._name = (_a = rngFn.name) != null ? _a : "function";
    this._rngFn = rngFn;
  }
  get name() {
    return this._name;
  }
  next() {
    return this._rngFn();
  }
  clone() {
    return new _FunctionRNG(this._rngFn);
  }
};
function createRNG(seedOrRNG) {
  switch (typeof seedOrRNG) {
    case "object":
      if (seedOrRNG instanceof RNG) {
        return seedOrRNG;
      }
      break;
    case "function":
      return new FunctionRNG(seedOrRNG);
    default:
      return new ARC4RNG(seedOrRNG);
  }
  throw new Error(`invalid RNG seed or instance "${seedOrRNG}"`);
}
function mixKey(seed, key) {
  var _a;
  const seedStr = `${seed}`;
  let smear = 0;
  let j = 0;
  while (j < seedStr.length) {
    key[255 & j] = 255 & (smear ^= ((_a = key[255 & j]) != null ? _a : 0) * 19) + seedStr.charCodeAt(j++);
  }
  if (!key.length) {
    return [0];
  }
  return key;
}
function shuffleInPlace(gen, array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(gen.next() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}
function sparseFisherYates(gen, array, k) {
  var _a, _b;
  const H = /* @__PURE__ */ new Map();
  const lastIndex = array.length - 1;
  const result = Array.from({ length: k });
  for (let i = 0; i < k; i++) {
    const remaining = lastIndex - i + 1;
    const r = Math.floor(gen.next() * remaining);
    result[i] = array[(_a = H.get(r)) != null ? _a : r];
    H.set(r, (_b = H.get(lastIndex - i)) != null ? _b : lastIndex - i);
  }
  return result;
}
var _arc4_startdenom = 281474976710656;
var _arc4_significance = 4503599627370496;
var _arc4_overflow = 9007199254740992;
var ARC4RNG = class _ARC4RNG extends RNG {
  constructor(seed = crypto.randomUUID()) {
    super();
    __publicField(this, "_seed");
    __publicField(this, "i");
    __publicField(this, "j");
    __publicField(this, "S");
    this._seed = seed;
    const key = mixKey(seed, []);
    const S = [];
    const keylen = key.length;
    this.i = 0;
    this.j = 0;
    this.S = S;
    let i = 0;
    while (i <= 255) {
      S[i] = i++;
    }
    for (let i2 = 0, j = 0; i2 <= 255; i2++) {
      const t = S[i2];
      j = 255 & j + key[i2 % keylen] + t;
      S[i2] = S[j];
      S[j] = t;
    }
    this.g(256);
  }
  get name() {
    return "arc4";
  }
  next() {
    let n = this.g(6);
    let d = _arc4_startdenom;
    let x = 0;
    while (n < _arc4_significance) {
      n = (n + x) * 256;
      d *= 256;
      x = this.g(1);
    }
    while (n >= _arc4_overflow) {
      n /= 2;
      d /= 2;
      x >>>= 1;
    }
    return (n + x) / d;
  }
  g(count) {
    const { S } = this;
    let { i, j } = this;
    let r = 0;
    while (count--) {
      i = 255 & i + 1;
      const t = S[i];
      S[j] = t;
      j = 255 & j + t;
      S[i] = S[j];
      r = r * 256 + S[255 & S[i] + t];
    }
    this.i = i;
    this.j = j;
    return r;
  }
  clone() {
    return new _ARC4RNG(this._seed);
  }
};
var MathRandomRNG = class _MathRandomRNG extends RNG {
  get name() {
    return "Math.random";
  }
  next() {
    return Math.random();
  }
  clone() {
    return new _MathRandomRNG();
  }
};
function numberValidator(num) {
  return new NumberValidator(num);
}
var NumberValidator = class {
  constructor(num) {
    __publicField(this, "n");
    __publicField(this, "isInt", () => {
      if (Number.isInteger(this.n)) {
        return this;
      }
      throw new Error(`Expected number to be an integer, got ${this.n}`);
    });
    __publicField(this, "isPositive", () => {
      if (this.n > 0) {
        return this;
      }
      throw new Error(`Expected number to be positive, got ${this.n}`);
    });
    __publicField(this, "lessThan", (v) => {
      if (this.n < v) {
        return this;
      }
      throw new Error(`Expected number to be less than ${v}, got ${this.n}`);
    });
    __publicField(this, "lessThanOrEqual", (v) => {
      if (this.n <= v) {
        return this;
      }
      throw new Error(
        `Expected number to be less than or equal to ${v}, got ${this.n}`
      );
    });
    __publicField(this, "greaterThanOrEqual", (v) => {
      if (this.n >= v) {
        return this;
      }
      throw new Error(
        `Expected number to be greater than or equal to ${v}, got ${this.n}`
      );
    });
    __publicField(this, "greaterThan", (v) => {
      if (this.n > v) {
        return this;
      }
      throw new Error(`Expected number to be greater than ${v}, got ${this.n}`);
    });
    this.n = num;
  }
};
function bates(random, n = 1) {
  numberValidator(n).isInt().isPositive();
  const irwinHall2 = random.irwinHall(n);
  return () => {
    return irwinHall2() / n;
  };
}
function bernoulli(random, p = 0.5) {
  numberValidator(p).greaterThanOrEqual(0).lessThanOrEqual(1);
  return () => {
    return Math.min(1, Math.floor(random.next() + p));
  };
}
function binomial(random, n = 1, p = 0.5) {
  numberValidator(n).isInt().isPositive();
  numberValidator(p).greaterThanOrEqual(0).lessThan(1);
  return () => {
    let i = 0;
    let x = 0;
    while (i++ < n) {
      if (random.next() < p) {
        x++;
      }
    }
    return x;
  };
}
function exponential(random, lambda = 1) {
  numberValidator(lambda).isPositive();
  return () => {
    return -Math.log(1 - random.next()) / lambda;
  };
}
function geometric(random, p = 0.5) {
  numberValidator(p).greaterThan(0).lessThan(1);
  const invLogP = 1 / Math.log(1 - p);
  return () => {
    return Math.floor(1 + Math.log(random.next()) * invLogP);
  };
}
function irwinHall(random, n = 1) {
  numberValidator(n).isInt().greaterThanOrEqual(0);
  return () => {
    let sum = 0;
    for (let i = 0; i < n; ++i) {
      sum += random.next();
    }
    return sum;
  };
}
function logNormal(random, mu = 0, sigma = 1) {
  const normal2 = random.normal(mu, sigma);
  return () => {
    return Math.exp(normal2());
  };
}
function normal(random, mu = 0, sigma = 1) {
  return () => {
    let x, y, r;
    do {
      x = random.next() * 2 - 1;
      y = random.next() * 2 - 1;
      r = x * x + y * y;
    } while (!r || r > 1);
    return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
  };
}
function pareto(random, alpha = 1) {
  numberValidator(alpha).greaterThanOrEqual(0);
  const invAlpha = 1 / alpha;
  return () => {
    return 1 / Math.pow(1 - random.next(), invAlpha);
  };
}
var logFactorialTable = [
  0,
  0,
  0.6931471805599453,
  1.791759469228055,
  3.1780538303479458,
  4.787491742782046,
  6.579251212010101,
  8.525161361065415,
  10.60460290274525,
  12.801827480081469
];
var logFactorial = (k) => {
  return logFactorialTable[k];
};
var logSqrt2PI = 0.9189385332046727;
function poisson(random, lambda = 1) {
  numberValidator(lambda).isPositive();
  if (lambda < 10) {
    const expMean = Math.exp(-lambda);
    return () => {
      let p = expMean;
      let x = 0;
      let u = random.next();
      while (u > p) {
        u = u - p;
        p = lambda * p / ++x;
      }
      return x;
    };
  } else {
    const smu = Math.sqrt(lambda);
    const b = 0.931 + 2.53 * smu;
    const a = -0.059 + 0.02483 * b;
    const invAlpha = 1.1239 + 1.1328 / (b - 3.4);
    const vR = 0.9277 - 3.6224 / (b - 2);
    return () => {
      var _a;
      while (true) {
        let u;
        let v = random.next();
        if (v <= 0.86 * vR) {
          u = v / vR - 0.43;
          return Math.floor(
            (2 * a / (0.5 - Math.abs(u)) + b) * u + lambda + 0.445
          );
        }
        if (v >= vR) {
          u = random.next() - 0.5;
        } else {
          u = v / vR - 0.93;
          u = (u < 0 ? -0.5 : 0.5) - u;
          v = random.next() * vR;
        }
        const us = 0.5 - Math.abs(u);
        if (us < 0.013 && v > us) {
          continue;
        }
        const k = Math.floor((2 * a / us + b) * u + lambda + 0.445);
        v = v * invAlpha / (a / (us * us) + b);
        if (k >= 10) {
          const t = (k + 0.5) * Math.log(lambda / k) - lambda - logSqrt2PI + k - (1 / 12 - (1 / 360 - 1 / (1260 * k * k)) / (k * k)) / k;
          if (Math.log(v * smu) <= t) {
            return k;
          }
        } else if (k >= 0) {
          const f = (_a = logFactorial(k)) != null ? _a : 0;
          if (Math.log(v) <= k * Math.log(lambda) - lambda - f) {
            return k;
          }
        }
      }
    };
  }
}
function uniform(random, min = 0, max = 1) {
  return () => {
    return random.next() * (max - min) + min;
  };
}
function uniformBoolean(random) {
  return () => {
    return random.next() >= 0.5;
  };
}
function uniformInt(random, min = 0, max = 1) {
  if (max === void 0) {
    max = min === void 0 ? 1 : min;
    min = 0;
  }
  numberValidator(min).isInt();
  numberValidator(max).isInt();
  return () => {
    return Math.floor(random.next() * (max - min + 1) + min);
  };
}
function weibull(random, lambda, k) {
  numberValidator(lambda).greaterThan(0);
  numberValidator(k).greaterThan(0);
  return () => {
    const u = 1 - random.next();
    return lambda * Math.pow(-Math.log(u), 1 / k);
  };
}
var Random = class _Random {
  constructor(seedOrRNG = new MathRandomRNG()) {
    __publicField(this, "_rng");
    __publicField(this, "_cache", {});
    this._rng = createRNG(seedOrRNG);
  }
  /**
   * @member {RNG} rng - Underlying pseudo-random number generator.
   */
  get rng() {
    return this._rng;
  }
  /**
   * Creates a new `Random` instance, optionally specifying parameters to
   * set a new seed.
   */
  clone(seedOrRNG = this.rng.clone()) {
    return new _Random(seedOrRNG);
  }
  /**
   * Sets the underlying pseudorandom number generator.
   *
   * @example
   * ```ts
   * import random from 'random'
   *
   * random.use('example-seed')
   * // or
   * random.use(Math.random)
   * ```
   */
  use(seedOrRNG) {
    this._rng = createRNG(seedOrRNG);
    this._cache = {};
  }
  // --------------------------------------------------------------------------
  // Uniform utility functions
  // --------------------------------------------------------------------------
  /**
   * Convenience wrapper around `this.rng.next()`
   *
   * Returns a floating point number in [0, 1).
   *
   * @return {number}
   */
  next() {
    return this._rng.next();
  }
  /**
   * Samples a uniform random floating point number, optionally specifying
   * lower and upper bounds.
   *
   * Convenience wrapper around `random.uniform()`
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   */
  float(min, max) {
    return this.uniform(min, max)();
  }
  /**
   * Samples a uniform random integer, optionally specifying lower and upper
   * bounds.
   *
   * Convenience wrapper around `random.uniformInt()`
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  int(min, max) {
    return this.uniformInt(min, max)();
  }
  /**
   * Samples a uniform random integer, optionally specifying lower and upper
   * bounds.
   *
   * Convenience wrapper around `random.uniformInt()`
   *
   * @alias `random.int`
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  integer(min, max) {
    return this.uniformInt(min, max)();
  }
  /**
   * Samples a uniform random boolean value.
   *
   * Convenience wrapper around `random.uniformBoolean()`
   *
   * @alias `random.boolean`
   */
  bool() {
    return this.uniformBoolean()();
  }
  /**
   * Samples a uniform random boolean value.
   *
   * Convenience wrapper around `random.uniformBoolean()`
   */
  boolean() {
    return this.uniformBoolean()();
  }
  /**
   * Returns an item chosen uniformly at random from the given array.
   *
   * Convenience wrapper around `random.uniformInt()`
   *
   * @param {Array<T>} [array] - Input array
   */
  choice(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.choice expected input to be an array, got ${typeof array}`
      );
    }
    const length = array.length;
    if (length > 0) {
      const index = this.uniformInt(0, length - 1)();
      return array[index];
    } else {
      return void 0;
    }
  }
  /**
   * Returns a random subset of k items from the given array (without replacement).
   *
   * @param {Array<T>} [array] - Input array
   */
  sample(array, k) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.sample expected input to be an array, got ${typeof array}`
      );
    }
    if (k < 0 || k > array.length) {
      throw new Error(
        `Random.sample: k must be between 0 and array.length (${array.length}), got ${k}`
      );
    }
    return sparseFisherYates(this.rng, array, k);
  }
  /**
   * Generates a thunk which returns samples of size k from the given array.
   *
   * This is for convenience only; there is no gain in efficiency.
   *
   * @param {Array<T>} [array] - Input array
   */
  sampler(array, k) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.sampler expected input to be an array, got ${typeof array}`
      );
    }
    if (k < 0 || k > array.length) {
      throw new Error(
        `Random.sampler: k must be between 0 and array.length (${array.length}), got ${k}`
      );
    }
    const gen = this.rng;
    return () => {
      return sparseFisherYates(gen, array, k);
    };
  }
  /**
   * Returns a shuffled copy of the given array.
   *
   * @param {Array<T>} [array] - Input array
   */
  shuffle(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.shuffle expected input to be an array, got ${typeof array}`
      );
    }
    const copy = [...array];
    shuffleInPlace(this.rng, copy);
    return copy;
  }
  /**
   * Generates a thunk which returns shuffled copies of the given array.
   *
   * @param {Array<T>} [array] - Input array
   */
  shuffler(array) {
    if (!Array.isArray(array)) {
      throw new TypeError(
        `Random.shuffler expected input to be an array, got ${typeof array}`
      );
    }
    const gen = this.rng;
    const copy = [...array];
    return () => {
      shuffleInPlace(gen, copy);
      return [...copy];
    };
  }
  // --------------------------------------------------------------------------
  // Uniform distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Continuous uniform distribution](https://en.wikipedia.org/wiki/Uniform_distribution_(continuous)).
   *
   * @param {number} [min=0] - Lower bound (float, inclusive)
   * @param {number} [max=1] - Upper bound (float, exclusive)
   */
  uniform(min, max) {
    return this._memoize("uniform", uniform, min, max);
  }
  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution).
   *
   * @param {number} [min=0] - Lower bound (integer, inclusive)
   * @param {number} [max=1] - Upper bound (integer, inclusive)
   */
  uniformInt(min, max) {
    return this._memoize("uniformInt", uniformInt, min, max);
  }
  /**
   * Generates a [Discrete uniform distribution](https://en.wikipedia.org/wiki/Discrete_uniform_distribution),
   * with two possible outcomes, `true` or `false.
   *
   * This method is analogous to flipping a coin.
   */
  uniformBoolean() {
    return this._memoize("uniformBoolean", uniformBoolean);
  }
  // --------------------------------------------------------------------------
  // Normal distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).
   *
   * @param {number} [mu=0] - Mean
   * @param {number} [sigma=1] - Standard deviation
   */
  normal(mu, sigma) {
    return normal(this, mu, sigma);
  }
  /**
   * Generates a [Log-normal distribution](https://en.wikipedia.org/wiki/Log-normal_distribution).
   *
   * @param {number} [mu=0] - Mean of underlying normal distribution
   * @param {number} [sigma=1] - Standard deviation of underlying normal distribution
   */
  logNormal(mu, sigma) {
    return logNormal(this, mu, sigma);
  }
  // --------------------------------------------------------------------------
  // Bernoulli distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Bernoulli distribution](https://en.wikipedia.org/wiki/Bernoulli_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  bernoulli(p) {
    return bernoulli(this, p);
  }
  /**
   * Generates a [Binomial distribution](https://en.wikipedia.org/wiki/Binomial_distribution).
   *
   * @param {number} [n=1] - Number of trials.
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  binomial(n, p) {
    return binomial(this, n, p);
  }
  /**
   * Generates a [Geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
   *
   * @param {number} [p=0.5] - Success probability of each trial.
   */
  geometric(p) {
    return geometric(this, p);
  }
  // --------------------------------------------------------------------------
  // Poisson distributions
  // --------------------------------------------------------------------------
  /**
   * Generates a [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution).
   *
   * @param {number} [lambda=1] - Mean (lambda > 0)
   */
  poisson(lambda) {
    return poisson(this, lambda);
  }
  /**
   * Generates an [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution).
   *
   * @param {number} [lambda=1] - Inverse mean (lambda > 0)
   */
  exponential(lambda) {
    return exponential(this, lambda);
  }
  // --------------------------------------------------------------------------
  // Misc distributions
  // --------------------------------------------------------------------------
  /**
   * Generates an [Irwin Hall distribution](https://en.wikipedia.org/wiki/Irwin%E2%80%93Hall_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to sum (n >= 0)
   */
  irwinHall(n) {
    return irwinHall(this, n);
  }
  /**
   * Generates a [Bates distribution](https://en.wikipedia.org/wiki/Bates_distribution).
   *
   * @param {number} [n=1] - Number of uniform samples to average (n >= 1)
   */
  bates(n) {
    return bates(this, n);
  }
  /**
   * Generates a [Pareto distribution](https://en.wikipedia.org/wiki/Pareto_distribution).
   *
   * @param {number} [alpha=1] - Alpha
   */
  pareto(alpha) {
    return pareto(this, alpha);
  }
  /**
   * Generates a [Weibull distribution](https://en.wikipedia.org/wiki/Weibull_distribution).
   *
   * @param {number} [lambda] - Lambda, the scale parameter
   * @param {number} [k] - k, the shape parameter
   */
  weibull(lambda, k) {
    return weibull(this, lambda, k);
  }
  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------
  /**
   * Memoizes distributions to ensure they're only created when necessary.
   *
   * Returns a thunk which that returns independent, identically distributed
   * samples from the specified distribution.
   *
   * @internal
   *
   * @param {string} label - Name of distribution
   * @param {function} getter - Function which generates a new distribution
   * @param {...*} args - Distribution-specific arguments
   */
  _memoize(label, getter, ...args) {
    const key = `${args.join(";")}`;
    let value = this._cache[label];
    if (value === void 0 || value.key !== key) {
      value = {
        key,
        distribution: getter(this, ...args)
      };
      this._cache[label] = value;
    }
    return value.distribution;
  }
};
var random_default = new Random();

// AlgorithmLibrary/Graph.js
function Graph(am, w2, h, dir, dag, opts) {
  if (am == void 0) {
    return;
  }
  this.init(am, w2, h, dir, dag, opts);
}
Graph.prototype = new Algorithm();
Graph.prototype.constructor = Graph;
Graph.superclass = Algorithm.prototype;
var LARGE_ALLOWED = [
  [
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false
  ],
  [
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  [
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  [
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true
  ],
  [
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  [
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  [
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ],
  [
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false
  ],
  [
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false
  ],
  [
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    false,
    false
  ],
  [
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    true,
    true,
    false,
    false
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
    true,
    false
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
    true
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    true
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    true,
    false,
    true
  ],
  [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    true,
    true,
    false
  ]
];
var LARGE_CURVE = [
  [0, 0, -0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.25, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.25],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [-0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.4, 0, 0]
];
var GRAPH_BASE_X = 450;
var LARGE_X_POS_LOGICAL = [
  GRAPH_BASE_X,
  GRAPH_BASE_X + 100,
  GRAPH_BASE_X + 200,
  GRAPH_BASE_X + 300,
  GRAPH_BASE_X + 50,
  GRAPH_BASE_X + 150,
  GRAPH_BASE_X + 250,
  GRAPH_BASE_X,
  GRAPH_BASE_X + 100,
  GRAPH_BASE_X + 200,
  GRAPH_BASE_X + 300,
  GRAPH_BASE_X + 50,
  GRAPH_BASE_X + 150,
  GRAPH_BASE_X + 250,
  GRAPH_BASE_X,
  GRAPH_BASE_X + 100,
  GRAPH_BASE_X + 200,
  GRAPH_BASE_X + 300
];
var LARGE_Y_POS_LOGICAL = [
  50,
  50,
  50,
  50,
  150,
  150,
  150,
  250,
  250,
  250,
  250,
  350,
  350,
  350,
  450,
  450,
  450,
  450
];
var SMALL_ALLLOWED = [
  [false, true, true, true, true, false, false, false],
  [true, false, true, true, false, true, true, false],
  [true, true, false, false, true, true, true, false],
  [true, true, false, false, false, true, false, true],
  [true, false, true, false, false, false, true, true],
  [false, true, true, true, false, false, true, true],
  [false, true, true, false, true, true, false, true],
  [false, false, false, true, true, true, true, false]
];
var SMALL_CURVE = [
  [0, 1e-3, 0, 0.5, -0.5, 0, 0, 0],
  [0, 0, 0, 1e-3, 0, 1e-3, -0.2, 0],
  [0, 1e-3, 0, 0, 0, 0.2, 0, 0],
  [-0.5, 0, 0, 0, 0, 1e-3, 0, 0.5],
  [0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [0, 0, -0.2, 0, 0, 0, 1e-3, 1e-3],
  [0, 0.2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, -0.5, 0.5, 0, 0, 0]
];
var SMALL_X_POS_LOGICAL = [
  GRAPH_BASE_X + 150,
  GRAPH_BASE_X + 75,
  GRAPH_BASE_X + 225,
  GRAPH_BASE_X,
  GRAPH_BASE_X + 300,
  GRAPH_BASE_X + 75,
  GRAPH_BASE_X + 225,
  GRAPH_BASE_X + 150
];
var SMALL_Y_POS_LOGICAL = [25, 125, 125, 225, 225, 325, 325, 425];
var SMALL_ADJ_MATRIX_X_START = GRAPH_BASE_X;
var SMALL_ADJ_MATRIX_Y_START = 40;
var SMALL_ADJ_MATRIX_WIDTH = 30;
var SMALL_ADJ_MATRIX_HEIGHT = 30;
var SMALL_ADJ_LIST_X_START = GRAPH_BASE_X;
var SMALL_ADJ_LIST_Y_START = 30;
var SMALL_ADJ_LIST_ELEM_WIDTH = 50;
var SMALL_ADJ_LIST_ELEM_HEIGHT = 30;
var SMALL_ADJ_LIST_HEIGHT = 36;
var SMALL_ADJ_LIST_WIDTH = 36;
var SMALL_ADJ_LIST_SPACING = 10;
var LARGE_ADJ_MATRIX_X_START = GRAPH_BASE_X;
var LARGE_ADJ_MATRIX_Y_START = 30;
var LARGE_ADJ_MATRIX_WIDTH = 23;
var LARGE_ADJ_MATRIX_HEIGHT = 23;
var LARGE_ADJ_LIST_X_START = GRAPH_BASE_X;
var LARGE_ADJ_LIST_Y_START = 30;
var LARGE_ADJ_LIST_ELEM_WIDTH = 50;
var LARGE_ADJ_LIST_ELEM_HEIGHT = 26;
var LARGE_ADJ_LIST_HEIGHT = 30;
var LARGE_ADJ_LIST_WIDTH = 30;
var LARGE_ADJ_LIST_SPACING = 10;
var VERTEX_INDEX_COLOR = "#0000FF";
var EDGE_COLOR = "#000000";
var SMALL_SIZE = 8;
var LARGE_SIZE = 18;
function parseStartingRepresentation(representation, fallbackLayer = 1) {
  if (Number.isFinite(representation)) {
    const n = Math.trunc(representation);
    if (n >= 1 && n <= 3)
      return n;
  }
  if (typeof representation === "string") {
    const lower = representation.trim().toLowerCase();
    if (lower === "1" || lower === "logical")
      return 1;
    if (lower === "2" || lower === "adjacencylist" || lower === "adjacency list" || lower === "adjlist" || lower === "list") {
      return 2;
    }
    if (lower === "3" || lower === "adjacencymatrix" || lower === "adjacency matrix" || lower === "matrix") {
      return 3;
    }
  }
  return fallbackLayer;
}
Graph.prototype.init = function(am, w2, h, directed, dag, opts) {
  if (directed && typeof directed === "object") {
    opts = directed;
    directed = void 0;
    dag = void 0;
  }
  opts = opts && typeof opts === "object" ? opts : {};
  if (opts.randomSeed !== void 0 && opts.randomSeed !== null) {
    random_default.use(opts.randomSeed);
  }
  directed = typeof opts.directed === "boolean" ? opts.directed : directed == void 0 ? true : directed;
  dag = typeof opts.dag === "boolean" ? opts.dag : dag == void 0 ? false : dag;
  const requestedLayer = opts.startingGraphRepresentation ?? opts.graphRepresentation ?? opts.startingRepresentation;
  const initialLayer = parseStartingRepresentation(requestedLayer, 1);
  const requestedEdgePercentage = opts.edgePercentage ?? opts.edgePercent ?? opts.edgeDensity;
  const parsedEdgePercentage = Number(requestedEdgePercentage);
  this.edgePercentage = Number.isFinite(parsedEdgePercentage) && parsedEdgePercentage >= 0 && parsedEdgePercentage <= 1 ? parsedEdgePercentage : null;
  this.preventBidirectionalEdge = typeof opts.preventBidirectionalEdge === "boolean" ? opts.preventBidirectionalEdge : false;
  Graph.superclass.init.call(this, am, w2, h);
  this.nextIndex = 0;
  this.currentLayer = initialLayer;
  this.isDAG = dag;
  this.directed = directed;
  this.addControls();
  this.setup_small();
};
Graph.prototype.addControls = function(addDirection) {
  if (addDirection == void 0) {
    addDirection = true;
  }
  this.newGraphButton = addControlToAlgorithmBar("Button", "New Graph");
  this.newGraphButton.onclick = this.newGraphCallback.bind(this);
  if (addDirection) {
    var radioButtonList = addRadioButtonGroupToAlgorithmBar(
      ["Directed Graph", "Undirected Graph"],
      "GraphType"
    );
    this.directedGraphButton = radioButtonList[0];
    this.directedGraphButton.onclick = this.directedGraphCallback.bind(
      this,
      true
    );
    this.undirectedGraphButton = radioButtonList[1];
    this.undirectedGraphButton.onclick = this.directedGraphCallback.bind(
      this,
      false
    );
    this.directedGraphButton.checked = this.directed;
    this.undirectedGraphButton.checked = !this.directed;
  }
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Small Graph", "Large Graph"],
    "GraphSize"
  );
  this.smallGraphButton = radioButtonList[0];
  this.smallGraphButton.onclick = this.smallGraphCallback.bind(this);
  this.largeGraphButton = radioButtonList[1];
  this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);
  this.smallGraphButton.checked = true;
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    [
      "Logical Representation",
      "Adjacency List Representation",
      "Adjacency Matrix Representation"
    ],
    "GraphRepresentation"
  );
  this.logicalButton = radioButtonList[0];
  this.logicalButton.onclick = this.graphRepChangedCallback.bind(this, 1);
  this.adjacencyListButton = radioButtonList[1];
  this.adjacencyListButton.onclick = this.graphRepChangedCallback.bind(this, 2);
  this.adjacencyMatrixButton = radioButtonList[2];
  this.adjacencyMatrixButton.onclick = this.graphRepChangedCallback.bind(
    this,
    3
  );
  this.logicalButton.checked = this.currentLayer === 1;
  this.adjacencyListButton.checked = this.currentLayer === 2;
  this.adjacencyMatrixButton.checked = this.currentLayer === 3;
};
Graph.prototype.directedGraphCallback = function(newDirected, event) {
  if (newDirected != this.directed) {
    this.directed = newDirected;
    this.animationManager.resetAll();
    this.setup();
  }
};
Graph.prototype.smallGraphCallback = function(event) {
  if (this.size != SMALL_SIZE) {
    this.animationManager.resetAll();
    this.setup_small();
  }
};
Graph.prototype.largeGraphCallback = function(event) {
  if (this.size != LARGE_SIZE) {
    this.animationManager.resetAll();
    this.setup_large();
  }
};
Graph.prototype.newGraphCallback = function(event) {
  this.animationManager.resetAll();
  this.setup();
};
Graph.prototype.graphRepChangedCallback = function(newLayer, event) {
  this.animationManager.setAllLayers([0, newLayer]);
  this.currentLayer = newLayer;
};
Graph.prototype.recolorGraph = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] >= 0) {
        this.setEdgeColor(i, j, EDGE_COLOR);
      }
    }
  }
};
Graph.prototype.highlightEdge = function(i, j, highlightVal) {
  this.cmd("SetHighlight", this.adj_list_edges[i][j], highlightVal);
  this.cmd("SetHighlight", this.adj_matrixID[i][j], highlightVal);
  this.cmd(
    "SetEdgeHighlight",
    this.circleID[i],
    this.circleID[j],
    highlightVal
  );
  if (!this.directed) {
    this.cmd(
      "SetEdgeHighlight",
      this.circleID[j],
      this.circleID[i],
      highlightVal
    );
  }
};
Graph.prototype.setEdgeColor = function(i, j, color) {
  this.cmd("SetForegroundColor", this.adj_list_edges[i][j], color);
  this.cmd("SetTextColor", this.adj_matrixID[i][j], color);
  this.cmd("SetEdgeColor", this.circleID[i], this.circleID[j], color);
  if (!this.directed) {
    this.cmd("SetEdgeColor", this.circleID[j], this.circleID[i], color);
  }
};
Graph.prototype.clearEdges = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] >= 0) {
        this.cmd("Disconnect", this.circleID[i], this.circleID[j]);
      }
    }
  }
};
Graph.prototype.rebuildEdges = function() {
  this.clearEdges();
  this.buildEdges();
};
Graph.prototype.buildEdges = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] >= 0) {
        var edgeLabel;
        if (this.showEdgeCosts) {
          edgeLabel = String(this.adj_matrix[i][j]);
        } else {
          edgeLabel = "";
        }
        if (this.directed) {
          this.cmd(
            "Connect",
            this.circleID[i],
            this.circleID[j],
            EDGE_COLOR,
            this.adjustCurveForDirectedEdges(
              this.curve[i][j],
              this.adj_matrix[j][i] >= 0
            ),
            1,
            edgeLabel
          );
        } else if (i < j) {
          this.cmd(
            "Connect",
            this.circleID[i],
            this.circleID[j],
            EDGE_COLOR,
            this.curve[i][j],
            0,
            edgeLabel
          );
        }
      }
    }
  }
};
Graph.prototype.setup_small = function() {
  this.allowed = SMALL_ALLLOWED;
  this.curve = SMALL_CURVE;
  this.x_pos_logical = SMALL_X_POS_LOGICAL;
  this.y_pos_logical = SMALL_Y_POS_LOGICAL;
  this.adj_matrix_x_start = SMALL_ADJ_MATRIX_X_START;
  this.adj_matrix_y_start = SMALL_ADJ_MATRIX_Y_START;
  this.adj_matrix_width = SMALL_ADJ_MATRIX_WIDTH;
  this.adj_matrix_height = SMALL_ADJ_MATRIX_HEIGHT;
  this.adj_list_x_start = SMALL_ADJ_LIST_X_START;
  this.adj_list_y_start = SMALL_ADJ_LIST_Y_START;
  this.adj_list_elem_width = SMALL_ADJ_LIST_ELEM_WIDTH;
  this.adj_list_elem_height = SMALL_ADJ_LIST_ELEM_HEIGHT;
  this.adj_list_height = SMALL_ADJ_LIST_HEIGHT;
  this.adj_list_width = SMALL_ADJ_LIST_WIDTH;
  this.adj_list_spacing = SMALL_ADJ_LIST_SPACING;
  this.size = SMALL_SIZE;
  this.setup();
};
Graph.prototype.setup_large = function() {
  this.allowed = LARGE_ALLOWED;
  this.curve = LARGE_CURVE;
  this.x_pos_logical = LARGE_X_POS_LOGICAL;
  this.y_pos_logical = LARGE_Y_POS_LOGICAL;
  this.adj_matrix_x_start = LARGE_ADJ_MATRIX_X_START;
  this.adj_matrix_y_start = LARGE_ADJ_MATRIX_Y_START;
  this.adj_matrix_width = LARGE_ADJ_MATRIX_WIDTH;
  this.adj_matrix_height = LARGE_ADJ_MATRIX_HEIGHT;
  this.adj_list_x_start = LARGE_ADJ_LIST_X_START;
  this.adj_list_y_start = LARGE_ADJ_LIST_Y_START;
  this.adj_list_elem_width = LARGE_ADJ_LIST_ELEM_WIDTH;
  this.adj_list_elem_height = LARGE_ADJ_LIST_ELEM_HEIGHT;
  this.adj_list_height = LARGE_ADJ_LIST_HEIGHT;
  this.adj_list_width = LARGE_ADJ_LIST_WIDTH;
  this.adj_list_spacing = LARGE_ADJ_LIST_SPACING;
  this.size = LARGE_SIZE;
  this.setup();
};
Graph.prototype.adjustCurveForDirectedEdges = function(curve, bidirectional) {
  if (!bidirectional || Math.abs(curve) > 0.01) {
    return curve;
  } else {
    return 0.1;
  }
};
Graph.prototype.setup = function() {
  this.commands = new Array();
  this.circleID = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.circleID[i] = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      this.circleID[i],
      i,
      this.x_pos_logical[i],
      this.y_pos_logical[i]
    );
    this.cmd("SetTextColor", this.circleID[i], VERTEX_INDEX_COLOR, 0);
    this.cmd("SetLayer", this.circleID[i], 1);
  }
  this.adj_matrix = new Array(this.size);
  this.adj_matrixID = new Array(this.size);
  for (i = 0; i < this.size; i++) {
    this.adj_matrix[i] = new Array(this.size);
    this.adj_matrixID[i] = new Array(this.size);
  }
  var edgePercent;
  if (this.edgePercentage != null) {
    edgePercent = this.edgePercentage;
  } else {
    if (this.size == SMALL_SIZE) {
      if (this.directed) {
        edgePercent = 0.4;
      } else {
        edgePercent = 0.5;
      }
    } else {
      if (this.directed) {
        edgePercent = 0.35;
      } else {
        edgePercent = 0.6;
      }
    }
  }
  var lowerBound = 0;
  if (this.directed) {
    for (i = 0; i < this.size; i++) {
      for (var j = 0; j < this.size; j++) {
        this.adj_matrixID[i][j] = this.nextIndex++;
        const reverseEdgeExists = this.adj_matrix[j] != null && this.adj_matrix[j][i] >= 0;
        if (this.allowed[i][j] && random_default.float() <= edgePercent && (i < j || Math.abs(this.curve[i][j]) < 0.01 || this.adj_matrixID[j][i] == -1) && (!this.preventBidirectionalEdge || !reverseEdgeExists) && (!this.isDAG || i < j)) {
          if (this.showEdgeCosts) {
            this.adj_matrix[i][j] = Math.floor(Math.random() * 9) + 1;
          } else {
            this.adj_matrix[i][j] = 1;
          }
        } else {
          this.adj_matrix[i][j] = -1;
        }
      }
    }
    this.buildEdges();
  } else {
    for (i = 0; i < this.size; i++) {
      for (j = i + 1; j < this.size; j++) {
        this.adj_matrixID[i][j] = this.nextIndex++;
        this.adj_matrixID[j][i] = this.nextIndex++;
        if (this.allowed[i][j] && Math.random() <= edgePercent) {
          if (this.showEdgeCosts) {
            this.adj_matrix[i][j] = Math.floor(Math.random() * 9) + 1;
          } else {
            this.adj_matrix[i][j] = 1;
          }
          this.adj_matrix[j][i] = this.adj_matrix[i][j];
          if (this.showEdgeCosts) {
            var edgeLabel = String(this.adj_matrix[i][j]);
          } else {
            edgeLabel = "";
          }
          this.cmd(
            "Connect",
            this.circleID[i],
            this.circleID[j],
            EDGE_COLOR,
            this.curve[i][j],
            0,
            edgeLabel
          );
        } else {
          this.adj_matrix[i][j] = -1;
          this.adj_matrix[j][i] = -1;
        }
      }
    }
    this.buildEdges();
    for (i = 0; i < this.size; i++) {
      this.adj_matrix[i][i] = -1;
    }
  }
  this.buildAdjList();
  this.buildAdjMatrix();
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.clearHistory();
};
Graph.prototype.resetAll = function() {
};
Graph.prototype.buildAdjMatrix = function() {
  this.adj_matrix_index_x = new Array(this.size);
  this.adj_matrix_index_y = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.adj_matrix_index_x[i] = this.nextIndex++;
    this.adj_matrix_index_y[i] = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      this.adj_matrix_index_x[i],
      i,
      this.adj_matrix_x_start + i * this.adj_matrix_width,
      this.adj_matrix_y_start - this.adj_matrix_height
    );
    this.cmd(
      "SetForegroundColor",
      this.adj_matrix_index_x[i],
      VERTEX_INDEX_COLOR
    );
    this.cmd(
      "CreateLabel",
      this.adj_matrix_index_y[i],
      i,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + i * this.adj_matrix_height
    );
    this.cmd(
      "SetForegroundColor",
      this.adj_matrix_index_y[i],
      VERTEX_INDEX_COLOR
    );
    this.cmd("SetLayer", this.adj_matrix_index_x[i], 3);
    this.cmd("SetLayer", this.adj_matrix_index_y[i], 3);
    for (var j = 0; j < this.size; j++) {
      this.adj_matrixID[i][j] = this.nextIndex++;
      if (this.adj_matrix[i][j] < 0) {
        var lab = "";
      } else {
        lab = String(this.adj_matrix[i][j]);
      }
      this.cmd(
        "CreateRectangle",
        this.adj_matrixID[i][j],
        lab,
        this.adj_matrix_width,
        this.adj_matrix_height,
        this.adj_matrix_x_start + j * this.adj_matrix_width,
        this.adj_matrix_y_start + i * this.adj_matrix_height
      );
      this.cmd("SetLayer", this.adj_matrixID[i][j], 3);
    }
  }
};
Graph.prototype.removeAdjList = function() {
  for (var i = 0; i < this.size; i++) {
    this.cmd("Delete", this.adj_list_list[i], "RAL1");
    this.cmd("Delete", this.adj_list_index[i], "RAL2");
    for (var j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] > 0) {
        this.cmd("Delete", this.adj_list_edges[i][j], "RAL3");
      }
    }
  }
};
Graph.prototype.buildAdjList = function() {
  this.adj_list_index = new Array(this.size);
  this.adj_list_list = new Array(this.size);
  this.adj_list_edges = new Array(this.size);
  for (var i = 0; i < this.size; i++) {
    this.adj_list_index[i] = this.nextIndex++;
    this.adj_list_edges[i] = new Array(this.size);
    this.adj_list_index[i] = this.nextIndex++;
    this.adj_list_list[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.adj_list_list[i],
      "",
      this.adj_list_width,
      this.adj_list_height,
      this.adj_list_x_start,
      this.adj_list_y_start + i * this.adj_list_height
    );
    this.cmd("SetLayer", this.adj_list_list[i], 2);
    this.cmd(
      "CreateLabel",
      this.adj_list_index[i],
      i,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + i * this.adj_list_height
    );
    this.cmd("SetForegroundColor", this.adj_list_index[i], VERTEX_INDEX_COLOR);
    this.cmd("SetLayer", this.adj_list_index[i], 2);
    var lastElem = this.adj_list_list[i];
    var nextXPos = this.adj_list_x_start + this.adj_list_width + this.adj_list_spacing;
    var hasEdges = false;
    for (var j = 0; j < this.size; j++) {
      if (this.adj_matrix[i][j] > 0) {
        hasEdges = true;
        this.adj_list_edges[i][j] = this.nextIndex++;
        this.cmd(
          "CreateLinkedList",
          this.adj_list_edges[i][j],
          j,
          this.adj_list_elem_width,
          this.adj_list_elem_height,
          nextXPos,
          this.adj_list_y_start + i * this.adj_list_height,
          0.25,
          0,
          1,
          2
        );
        this.cmd("SetNull", this.adj_list_edges[i][j], 1);
        this.cmd(
          "SetText",
          this.adj_list_edges[i][j],
          this.adj_matrix[i][j],
          1
        );
        this.cmd(
          "SetTextColor",
          this.adj_list_edges[i][j],
          VERTEX_INDEX_COLOR,
          0
        );
        this.cmd("SetLayer", this.adj_list_edges[i][j], 2);
        nextXPos = nextXPos + this.adj_list_elem_width + this.adj_list_spacing;
        this.cmd("Connect", lastElem, this.adj_list_edges[i][j]);
        this.cmd("SetNull", lastElem, 0);
        lastElem = this.adj_list_edges[i][j];
      }
    }
    if (!hasEdges) {
      this.cmd("SetNull", this.adj_list_list[i], 1);
    }
  }
};
Graph.prototype.reset = function() {
};
Graph.prototype.disableUI = function(event) {
  this.newGraphButton.disabled = true;
  if (this.directedGraphButton != null && this.directedGraphButton != void 0)
    this.directedGraphButton.disabled = true;
  if (this.undirectedGraphButton != null && this.undirectedGraphButton != void 0)
    this.undirectedGraphButton.disabled = true;
  this.smallGraphButton.disabled = true;
  this.largeGraphButton.disabled = true;
};
Graph.prototype.enableUI = function(event) {
  this.newGraphButton.disabled = false;
  if (this.directedGraphButton != null && this.directedGraphButton != void 0)
    this.directedGraphButton.disabled = false;
  if (this.undirectedGraphButton != null && this.undirectedGraphButton != void 0)
    this.undirectedGraphButton.disabled = false;
  this.smallGraphButton.disabled = false;
  this.largeGraphButton.disabled = false;
};

// AlgorithmLibrary/BFS.js
var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 50;
var VISITED_START_X = 175;
var PARENT_START_X = 250;
var HIGHLIGHT_CIRCLE_COLOR = "#9c0303ff";
var SEARCH_TREE_FINAL_COLOR = "var(--svgColor--althighlight)";
var EDGE_CHECK_COLOR = "var(--svgColor--althighlight)";
var BFS_QUEUE_HEAD_COLOR = "#0000FF";
var QUEUE_START_X = 30;
var QUEUE_START_Y = 40;
var QUEUE_SPACING = 30;
function BFS(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Breadth-First Search", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Breadth-First Search",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
BFS.prototype = new Graph();
BFS.prototype.constructor = BFS;
BFS.superclass = Graph.prototype;
BFS.prototype.addControls = function() {
  addLabelToAlgorithmBar("Start Vertex: ");
  this.startField = addControlToAlgorithmBar("Text", "");
  this.startField.setAttribute("placeholder", "Vertex #");
  this.startField.onkeydown = this.returnSubmit(
    this.startField,
    this.startCallback.bind(this),
    2,
    true
  );
  this.startField.size = 2;
  this.startButton = addControlToAlgorithmBar("Button", "Run BFS");
  this.startButton.onclick = this.startCallback.bind(this);
  BFS.superclass.addControls.call(this);
};
BFS.prototype.init = function(am, w2, h, graphOpts) {
  this.showEdgeCosts = false;
  BFS.superclass.init.call(this, am, w2, h, true, false, graphOpts);
};
BFS.prototype.setup = function() {
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
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
    );
    this.cmd(
      "CreateLabel",
      this.visitedIndexID[i],
      i,
      VISITED_START_X - AUX_ARRAY_WIDTH,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
    );
    this.cmd("SetForegroundColor", this.visitedIndexID[i], VERTEX_INDEX_COLOR);
    this.cmd(
      "CreateRectangle",
      this.parentID[i],
      "",
      AUX_ARRAY_WIDTH,
      AUX_ARRAY_HEIGHT,
      PARENT_START_X,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
    );
    this.cmd(
      "CreateLabel",
      this.parentIndexID[i],
      i,
      PARENT_START_X - AUX_ARRAY_WIDTH,
      AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
    );
    this.cmd("SetForegroundColor", this.parentIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Parent",
    PARENT_START_X - AUX_ARRAY_WIDTH,
    AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
    0
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Known",
    VISITED_START_X - AUX_ARRAY_WIDTH,
    AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
    0
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "BFS Queue",
    QUEUE_START_X,
    QUEUE_START_Y - 30,
    0
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
};
BFS.prototype.startCallback = function(event) {
  if (this.startField.value != "") {
    const startvalue = this.startField.value;
    this.startField.value = "";
    this.doSearch(startvalue);
  }
};
BFS.prototype.doSearch = function(startVertex) {
  const parsedStart = parseInt(startVertex);
  if (!Number.isFinite(parsedStart) || parsedStart < 0 || parsedStart >= this.size) {
    return false;
  }
  this.implementAction(this.doBFS.bind(this), parsedStart);
  return true;
};
BFS.prototype.initEdgeVisualState = function() {
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
BFS.prototype.recordEdgeVisualState = function(i, j, color, highlighted) {
  this.edgeColorState[i][j] = color;
  this.edgeHighlightState[i][j] = highlighted;
  if (!this.directed) {
    this.edgeColorState[j][i] = color;
    this.edgeHighlightState[j][i] = highlighted;
  }
};
BFS.prototype.applyEdgeVisualState = function(i, j, color, highlighted) {
  this.setEdgeColor(i, j, color);
  this.highlightEdge(i, j, highlighted ? 1 : 0);
  this.recordEdgeVisualState(i, j, color, highlighted);
};
BFS.prototype.clearAdjacencyRepEdgeHighlight = function(i, j) {
  if (this.adj_list_edges && this.adj_list_edges[i] && this.adj_list_edges[i][j]) {
    this.cmd("SetHighlight", this.adj_list_edges[i][j], 0);
  }
  if (this.adj_matrixID && this.adj_matrixID[i] && this.adj_matrixID[i][j]) {
    this.cmd("SetHighlight", this.adj_matrixID[i][j], 0);
  }
};
BFS.prototype.doBFS = function(startVetex) {
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
  this.initEdgeVisualState();
  this.messageID = new Array();
  for (i = 0; i < this.size; i++) {
    this.cmd("SetText", this.visitedID[i], "f");
    this.cmd("SetHighlight", this.visitedID[i], 0);
    this.cmd("SetText", this.parentID[i], "");
    this.visited[i] = false;
    this.parent[i] = -1;
    queueID[i] = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      queueID[i],
      "",
      QUEUE_START_X,
      QUEUE_START_Y + i * QUEUE_SPACING
    );
    this.cmd("SetAlpha", queueID[i], 0);
  }
  var vertex = parseInt(startVetex);
  this.visited[vertex] = true;
  this.parent[vertex] = -1;
  this.queue[tail] = vertex;
  this.cmd("SetText", queueID[tail], vertex);
  this.cmd("SetTextColor", queueID[tail], "#000000");
  this.cmd("SetAlpha", queueID[tail], 1);
  this.cmd("Move", queueID[tail], QUEUE_START_X, QUEUE_START_Y);
  queueSize = queueSize + 1;
  tail = (tail + 1) % this.size;
  while (queueSize > 0) {
    vertex = this.queue[head];
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleL,
      HIGHLIGHT_CIRCLE_COLOR,
      this.x_pos_logical[vertex],
      this.y_pos_logical[vertex]
    );
    this.cmd("SetLayer", this.highlightCircleL, 1);
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleAL,
      HIGHLIGHT_CIRCLE_COLOR,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + vertex * this.adj_list_height
    );
    this.cmd("SetLayer", this.highlightCircleAL, 2);
    this.cmd(
      "CreateHighlightCircle",
      this.highlightCircleAM,
      HIGHLIGHT_CIRCLE_COLOR,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + vertex * this.adj_matrix_height
    );
    this.cmd("SetLayer", this.highlightCircleAM, 3);
    this.cmd("SetTextColor", queueID[head], BFS_QUEUE_HEAD_COLOR);
    this.cmd("SetMessage", `Explore node at front of queue (${vertex}).`);
    this.cmd("Step");
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[vertex][neighbor] > 0) {
        const savedEdgeColor = this.edgeColorState[vertex][neighbor];
        const savedEdgeHighlight = this.edgeHighlightState[vertex][neighbor];
        this.applyEdgeVisualState(vertex, neighbor, EDGE_CHECK_COLOR, false);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        this.cmd("SetMessage", `Explore edge ${vertex} -> ${neighbor} (check whether ${neighbor} is known).`);
        this.cmd("Step");
        if (!this.visited[neighbor]) {
          this.visited[neighbor] = true;
          this.parent[neighbor] = vertex;
          this.cmd("SetText", this.visitedID[neighbor], "T");
          this.cmd("SetText", this.parentID[neighbor], vertex);
          this.queue[tail] = neighbor;
          this.cmd("SetText", queueID[tail], neighbor);
          this.cmd("SetTextColor", queueID[tail], "#000000");
          this.cmd("SetAlpha", queueID[tail], 1);
          this.cmd(
            "Move",
            queueID[tail],
            QUEUE_START_X,
            QUEUE_START_Y + queueSize * QUEUE_SPACING
          );
          tail = (tail + 1) % this.size;
          queueSize = queueSize + 1;
          this.cmd(
            "SetMessage",
            `Discovered ${neighbor}; set parent to ${vertex}, add to BFS tree, and enqueue ${neighbor}.`
          );
          this.applyEdgeVisualState(vertex, neighbor, savedEdgeColor, true);
        } else {
          this.cmd("SetMessage", `Neighbor ${neighbor} was already visited; ignore this edge.`);
          this.applyEdgeVisualState(
            vertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight
          );
        }
        this.cmd("Step");
        this.clearAdjacencyRepEdgeHighlight(vertex, neighbor);
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);
        this.cmd("Step");
      }
    }
    this.cmd("SetTextColor", queueID[head], "#000000");
    this.cmd("SetText", queueID[head], "");
    this.cmd("SetAlpha", queueID[head], 0);
    head = (head + 1) % this.size;
    queueSize = queueSize - 1;
    for (i = 0; i < queueSize; i++) {
      var nextQueueIndex = (i + head) % this.size;
      this.cmd(
        "Move",
        queueID[nextQueueIndex],
        QUEUE_START_X,
        QUEUE_START_Y + i * QUEUE_SPACING
      );
    }
    this.cmd("Delete", this.highlightCircleL);
    this.cmd("Delete", this.highlightCircleAM);
    this.cmd("Delete", this.highlightCircleAL);
    this.cmd("SetMessage", `Done exploring ${vertex}.`);
    this.cmd("Step");
  }
  this.cmd("SetMessage", "Queue is empty. BFS complete. Search tree highlighted.");
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.applyEdgeVisualState(this.parent[i], i, SEARCH_TREE_FINAL_COLOR, true);
    }
  }
  this.cmd("Step");
  return this.commands;
};
BFS.prototype.reset = function() {
};
BFS.prototype.enableUI = function(event) {
  this.startField.disabled = false;
  this.startButton.disabled = false;
  this.startButton;
  BFS.superclass.enableUI.call(this, event);
};
BFS.prototype.disableUI = function(event) {
  this.startField.disabled = true;
  this.startButton.disabled = true;
  BFS.superclass.disableUI.call(this, event);
};

// AlgorithmLibrary/BST.js
BST.FOREGROUND_COLOR = "var(--svgColor)";
BST.WIDTH_DELTA = 50;
BST.HEIGHT_DELTA = 50;
BST.STARTING_Y = 40;
BST.FIRST_PRINT_POS_X = 50;
BST.PRINT_VERTICAL_GAP = 20;
BST.PRINT_HORIZONTAL_GAP = 50;
function BST(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Binary Search Tree";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
BST.prototype = new Algorithm();
BST.prototype.constructor = BST;
BST.superclass = Algorithm.prototype;
BST.prototype.init = function(am, w2, h) {
  var sc = BST.superclass;
  this.startingX = 200;
  this.first_print_pos_y = h - 2 * BST.PRINT_VERTICAL_GAP;
  this.print_max = w2 - 10;
  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;
  this.valuesList = [];
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, BST.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, BST.STARTING_Y - 10);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doDelete = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doRemove = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function(order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doPre = function() {
    this.implementAction(this.printTree.bind(this), "Pre");
  };
  this.doIn = function() {
    this.implementAction(this.printTree.bind(this), "In");
  };
  this.doPost = function() {
    this.implementAction(this.printTree.bind(this), "Post");
  };
  this.doRotateLeft = function(val) {
    this.implementAction(this.rotateLeftAtValue.bind(this), val);
  };
  this.doRotateRight = function(val) {
    this.implementAction(this.rotateRightAtValue.bind(this), val);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
BST.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.rotateLeftButton = addControlToAlgorithmBar("Button", "Rotate Left");
  this.rotateLeftButton.onclick = this.rotateLeftCallback.bind(this);
  this.rotateRightButton = addControlToAlgorithmBar("Button", "Rotate Right");
  this.rotateRightButton.onclick = this.rotateRightCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.printpreButton = addControlToAlgorithmBar("Button", "Print PreOrder");
  this.printpreButton.onclick = this.print.bind(this, "Pre");
  this.printButton = addControlToAlgorithmBar("Button", "Print InOrder");
  this.printButton.onclick = this.print.bind(this);
  this.printpostButton = addControlToAlgorithmBar("Button", "Print PostOrder");
  this.printpostButton.onclick = this.print.bind(this);
};
BST.prototype.rotateLeftCallback = function(event) {
  var rotateValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  if (rotateValue != "") {
    this.implementAction(this.rotateLeftAtValue.bind(this), rotateValue);
  }
};
BST.prototype.rotateRightCallback = function(event) {
  var rotateValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  if (rotateValue != "") {
    this.implementAction(this.rotateRightAtValue.bind(this), rotateValue);
  }
};
BST.prototype.findNode = function(tree, value) {
  var current = tree;
  while (current != null) {
    if (value == current.data) {
      return current;
    } else if (value < current.data) {
      current = current.left;
    } else {
      current = current.right;
    }
  }
  return null;
};
BST.prototype.rotateLeftAtValue = function(value) {
  this.commands = [];
  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  var x = this.findNode(this.treeRoot, value);
  if (x == null) {
    this.cmd("SetMessage", "Cannot rotate: " + value + " not found");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.singleRotateLeft(x);
  this.cmd("SetMessage", "");
  return this.commands;
};
BST.prototype.rotateRightAtValue = function(value) {
  this.commands = [];
  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  var x = this.findNode(this.treeRoot, value);
  if (x == null) {
    this.cmd("SetMessage", "Cannot rotate: " + value + " not found");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.singleRotateRight(x);
  this.cmd("SetMessage", "");
  return this.commands;
};
BST.prototype.singleRotateLeft = function(x) {
  var y = x.right;
  if (y == null) {
    this.cmd("SetMessage", "Cannot rotate left at " + x.data + ": no right child");
    this.cmd("SetHighlight", x.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", x.graphicID, 0);
    return;
  }
  var B = y.left;
  var p = x.parent;
  var xWasLeftChild = p != null && p.left == x;
  this.cmd("SetMessage", "Rotate left at " + x.data + ": pull up " + y.data);
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");
  if (B != null) {
    this.cmd(
      "SetMessage",
      "Subtree " + B.data + " becomes the right subtree of " + x.data
    );
    this.cmd("SetHighlight", B.graphicID, 1);
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 0);
    this.cmd("SetHighlight", B.graphicID, 0);
  }
  if (p == null) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, BST.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, BST.LINK_COLOR);
    y.parent = p;
    if (xWasLeftChild) {
      p.left = y;
    } else {
      p.right = y;
    }
  }
  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, BST.LINK_COLOR);
  if (B != null) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, BST.LINK_COLOR);
  }
  x.parent = y;
  x.right = B;
  if (B != null) {
    B.parent = x;
  }
  y.left = x;
  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};
BST.prototype.singleRotateRight = function(x) {
  var y = x.left;
  if (y == null) {
    this.cmd("SetMessage", "Cannot rotate right at " + x.data + ": no left child");
    this.cmd("SetHighlight", x.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", x.graphicID, 0);
    return;
  }
  var B = y.right;
  var p = x.parent;
  var xWasLeftChild = p != null && p.left == x;
  this.cmd("SetMessage", "Rotate right at " + x.data + ": pull up " + y.data);
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");
  if (B != null) {
    this.cmd(
      "SetMessage",
      "Subtree " + B.data + " becomes the left subtree of " + x.data
    );
    this.cmd("SetHighlight", B.graphicID, 1);
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", y.graphicID, B.graphicID, 0);
    this.cmd("SetHighlight", B.graphicID, 0);
  }
  if (p == null) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, BST.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, BST.LINK_COLOR);
    y.parent = p;
    if (xWasLeftChild) {
      p.left = y;
    } else {
      p.right = y;
    }
  }
  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, BST.LINK_COLOR);
  if (B != null) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, BST.LINK_COLOR);
  }
  x.parent = y;
  x.left = B;
  if (B != null) {
    B.parent = x;
  }
  y.right = x;
  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};
BST.prototype.reset = function() {
  this.nextIndex = 2;
  this.treeRoot = null;
};
BST.prototype.insertCallback = function(event) {
  var insertedValue = this.inputField.value;
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.valuesList.push(insertedValue);
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
BST.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.valuesList.splice(this.valuesList.indexOf(deletedValue), 1);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
BST.prototype.print = function(order) {
  if (order == void 0) {
    order = "In";
  }
  this.implementAction(this.printTree.bind(this, order));
};
BST.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
BST.prototype.clearData = function() {
  if (this.treeRoot == null)
    return;
  this.commands = new Array();
  function clearTree(tree, handler) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left, handler);
      }
      if (tree.right != null) {
        clearTree(tree.right, handler);
      }
    }
    handler.cmd("Delete", tree.graphicID);
  }
  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("SetMessage", "");
  return this.commands;
};
BST.prototype.insertRandomCallback = function(event) {
  var numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const insertedValue = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
BST.prototype.printTree = function(order) {
  this.commands = [];
  this.printOutput = "";
  if (this.treeRoot != null) {
    this.cmd("SetMessage", "Starting from root");
    this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", this.treeRoot.graphicID, 0);
    this.printTreeRec(this.treeRoot, order);
    this.cmd("SetMessage", "Final output: " + this.printOutput);
  }
  return this.commands;
};
BST.prototype.printLeft = function(tree, order) {
  if (tree.left != null) {
    this.cmd("SetMessage", tree.data + " has left child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    this.printTreeRec(tree.left, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no left child");
    this.cmd("Step");
  }
};
BST.prototype.printRight = function(tree, order) {
  if (tree.right != null) {
    this.cmd("SetMessage", tree.data + " has right child, visit it...");
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
    this.printTreeRec(tree.right, order);
    this.cmd("SetHighlight", tree.graphicID, 1);
  } else {
    this.cmd("SetMessage", tree.data + " has no right child");
    this.cmd("Step");
  }
};
BST.prototype.printSelf = function(tree) {
  if (this.printOutput.length > 0) {
    this.printOutput += ", ";
  }
  this.printOutput += tree.data;
  this.cmd(
    "SetMessage",
    "Print " + tree.data + "\nCurrent output: " + this.printOutput
  );
  this.cmd("Step");
};
BST.prototype.printTreeRec = function(tree, order) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (order == "Pre") {
    this.printSelf(tree);
    this.printLeft(tree, order);
    this.printRight(tree, order);
  } else if (order == "Post") {
    this.printLeft(tree, order);
    this.printRight(tree, order);
    this.printSelf(tree);
  } else {
    this.printLeft(tree, order);
    this.printSelf(tree);
    this.printRight(tree, order);
  }
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetMessage", "Done with " + tree.data + " return to parent");
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
};
BST.prototype.findCallback = function(event) {
  var findValue;
  findValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  this.implementAction(this.findElement.bind(this), findValue);
};
BST.prototype.findElement = function(findValue) {
  this.commands = [];
  this.highlightID = this.nextIndex++;
  this.cmd("SetMessage", "Searching for " + findValue + "\nstarting from root");
  this.cmd("Step");
  this.findImpl(this.treeRoot, findValue);
  return this.commands;
};
BST.prototype.findImpl = function(tree, value) {
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " + value + " \n" + value + " = " + value + "\n(Element found!)"
      );
      this.cmd("Step");
      this.cmd("SetMessage", "Found:" + value);
      this.cmd("SetHighlight", tree.graphicID, 0);
    } else {
      if (tree.data > value) {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " \n" + value + " < " + tree.data + "\n(look to left subtree)"
        );
        if (tree.left != null)
          this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
        this.cmd("Step");
        if (tree.left != null)
          this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.findImpl(tree.left, value);
      } else {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " \n" + value + " > " + tree.data + "\n(look to right subtree)"
        );
        if (tree.right != null)
          this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
        this.cmd("Step");
        if (tree.right != null)
          this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.findImpl(tree.right, value);
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      "Searching for " + value + " \nhit null (Element not found)"
    );
  }
};
BST.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting " + insertedValue);
  if (this.treeRoot == null) {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      insertedValue,
      this.startingX,
      BST.STARTING_Y
    );
    this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
    this.cmd(
      "SetMessage",
      `Root is null. Inserting ${insertedValue} as the root`
    );
    this.cmd("Step");
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, this.nextIndex, BST.LINK_COLOR);
    this.treeRoot = new BSTNode(
      insertedValue,
      this.nextIndex,
      this.startingX,
      BST.STARTING_Y
    );
    this.nextIndex += 1;
  } else {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      insertedValue,
      this.startingX - 200,
      BST.STARTING_Y
    );
    this.cmd("SetForegroundColor", this.nextIndex, BST.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BST.BACKGROUND_COLOR);
    this.cmd("Step");
    var insertElem = new BSTNode(insertedValue, this.nextIndex, 50, 100);
    this.nextIndex += 1;
    this.cmd("SetHighlight", insertElem.graphicID, 1);
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
BST.prototype.insert = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree"
    );
    if (tree.left != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree"
    );
    if (tree.right != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
    } else {
      if (tree.left != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BST.LINK_COLOR);
      elem.x = tree.x + BST.WIDTH_DELTA / 2;
      elem.y = tree.y + BST.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
    } else {
      if (tree.right != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insert(elem, tree.right);
    }
  }
};
BST.prototype.deleteElement = function(deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", "");
  return this.commands;
};
BST.prototype.treeDelete = function(tree, valueToDelete) {
  var leftchild = false;
  if (tree != null) {
    if (tree.parent != null) {
      leftchild = tree.parent.left == tree;
    }
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (valueToDelete < tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " < " + tree.data + ".  Looking at left subtree"
      );
      if (tree.left != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    } else if (valueToDelete > tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " > " + tree.data + ".  Looking at right subtree"
      );
      if (tree.right != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    } else {
      this.cmd(
        "SetMessage",
        valueToDelete + " == " + tree.data + ".  Found node to delete"
      );
    }
    this.cmd("Step");
    if (valueToDelete == tree.data) {
      if (tree.left == null && tree.right == null) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.cmd("Delete", tree.graphicID);
        if (leftchild && tree.parent != null) {
          tree.parent.left = null;
        } else if (tree.parent != null) {
          tree.parent.right = null;
        } else {
          this.treeRoot = null;
          this.cmd("SetNull", this.rootIndex, 1);
          this.cmd("Disconnect", 0, tree.graphicID);
        }
        this.resizeTree();
        this.cmd("Step");
      } else if (tree.left == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node."
        );
        if (tree.parent != null) {
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            BST.LINK_COLOR
          );
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          if (leftchild) {
            tree.parent.left = tree.right;
          } else {
            tree.parent.right = tree.right;
          }
          tree.right.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.treeRoot = tree.right;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } else if (tree.right == null) {
        this.cmd(
          "SetMessage",
          "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node."
        );
        if (tree.parent != null) {
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            BST.LINK_COLOR
          );
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          if (leftchild) {
            tree.parent.left = tree.left;
          } else {
            tree.parent.right = tree.left;
          }
          tree.left.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
        }
        this.resizeTree();
      } else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind smallest node in right subtree."
        );
        this.cmd("Step");
        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          BST.HIGHLIGHT_CIRCLE_COLOR,
          tree.x,
          tree.y
        );
        var tmp = tree;
        tmp = tree.right;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd(
          "SetMessage",
          "Go to right subtree."
        );
        this.cmd("Step");
        while (tmp.left != null) {
          tmp = tmp.left;
          this.cmd(
            "SetMessage",
            "Move left to find smallest value."
          );
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        this.cmd(
          "SetMessage",
          "No left child found.  Smallest value is " + tmp.data + "."
        );
        this.cmd("Step");
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
        tree.data = tmp.data;
        this.cmd("Move", labelID, tree.x, tree.y);
        this.cmd(
          "SetMessage",
          "Copy smallest value of right subtree over value being removed."
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd(
          "SetMessage",
          "Now remove the original node we copied from (in the right subtree)."
        );
        this.cmd("Step");
        this.treeDelete(tree.right, tree.data);
      }
    } else if (valueToDelete < tree.data) {
      this.cmd("SetHighlight", tree.graphicID, 0);
      if (tree.left != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.treeDelete(tree.left, valueToDelete);
    } else {
      this.cmd("SetHighlight", tree.graphicID, 0);
      if (tree.right != null)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.treeDelete(tree.right, valueToDelete);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete"
    );
  }
};
BST.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    this.setNewPositions(this.treeRoot, startingPoint, BST.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
BST.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + BST.HEIGHT_DELTA,
      -1
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + BST.HEIGHT_DELTA,
      1
    );
  }
};
BST.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
BST.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), BST.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    BST.WIDTH_DELTA / 2
  );
  return tree.leftWidth + tree.rightWidth;
};
function BSTNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}
BST.prototype.disableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
BST.prototype.enableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};

// AlgorithmLibrary/BSTCopy.js
BSTCopy.FOREGROUND_COLOR = "var(--svgColor)";
BSTCopy.BACKGROUND_COLOR = "var(--svgFillColor)";
BSTCopy.LINK_COLOR = "var(--svgColor)";
BSTCopy.HIGHLIGHT_CIRCLE_COLOR = "var(--svgColor--highlight)";
BSTCopy.WIDTH_DELTA = 50;
BSTCopy.HEIGHT_DELTA = 50;
BSTCopy.ROOT_Y = 20;
BSTCopy.STARTING_Y = 80;
function BSTCopy(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "BST Copy";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 1e3, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
BSTCopy.prototype = new Algorithm();
BSTCopy.prototype.constructor = BSTCopy;
BSTCopy.superclass = Algorithm.prototype;
BSTCopy.prototype.init = function(am, w2, h) {
  var sc = BSTCopy.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.startingX = 50;
  this.copyStartingX = 300;
  this.rootIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    50,
    25,
    this.startingX - 70,
    BSTCopy.ROOT_Y
  );
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "root",
    this.startingX - 120,
    BSTCopy.ROOT_Y
  );
  this.rootCopyIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    70,
    25,
    this.copyStartingX - 80,
    BSTCopy.ROOT_Y
  );
  this.cmd("SetNull", this.rootCopyIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "rootCopy",
    this.copyStartingX - 150,
    BSTCopy.ROOT_Y
  );
  this.treeRoot = null;
  this.rootCopy = null;
  this.copyDone = false;
  this.sourceToCopyID = /* @__PURE__ */ new Map();
  this.doCopy = function() {
    this.implementAction(this.copyTree.bind(this), "");
  };
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
BSTCopy.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.copyButton = addControlToAlgorithmBar("Button", "Copy");
  this.copyButton.onclick = this.copyCallback.bind(this);
};
BSTCopy.prototype.copyCallback = function() {
  this.implementAction(this.copyTree.bind(this), "");
};
BSTCopy.prototype.copyTree = function() {
  this.commands = [];
  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Source tree is empty; nothing to copy.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (this.rootCopy != null) {
    this.clearCopyOnly();
  }
  this.sourceToCopyID = /* @__PURE__ */ new Map();
  this.cmd("SetMessage", "Preorder traversal: copy each visited node into the new tree.");
  this.cmd("Step");
  this.rootCopy = null;
  const builtRoot = this.copyTreeRec(this.treeRoot, null, false);
  this.rootCopy = builtRoot;
  if (this.rootCopy != null) {
    this.cmd("SetNull", this.rootCopyIndex, 0);
    this.cmd("Step");
    this.cmd(
      "Connect",
      this.rootCopyIndex,
      this.rootCopy.graphicID,
      BSTCopy.LINK_COLOR
    );
    this.cmd("SetMessage", "Set rootCopy pointer.");
    this.cmd("Step");
  }
  this.cmd("SetMessage", "Copy complete.");
  this.copyDone = true;
  if (this.copyButton) {
    this.copyButton.disabled = true;
  }
  return this.commands;
};
BSTCopy.prototype.setSourceAndCopyHighlight = function(sourceNode, highlight) {
  this.cmd("SetHighlight", sourceNode.graphicID, highlight);
  const copyID = this.sourceToCopyID.get(sourceNode.graphicID);
  if (copyID != null) {
    this.cmd("SetHighlight", copyID, highlight);
  }
};
BSTCopy.prototype.copyTreeRec = function(sourceNode, parentCopyNode, isLeftChild) {
  if (sourceNode == null)
    return null;
  this.setSourceAndCopyHighlight(sourceNode, 1);
  this.cmd("SetMessage", `Visit ${sourceNode.data}. Create its copy.`);
  const newID = this.nextIndex++;
  const createX = this.copyStartingX - 200;
  const createY = BSTCopy.STARTING_Y;
  this.cmd("CreateCircle", newID, sourceNode.data, createX, createY);
  this.cmd("SetForegroundColor", newID, BSTCopy.FOREGROUND_COLOR);
  this.cmd("SetBackgroundColor", newID, BSTCopy.BACKGROUND_COLOR);
  const copyNode = new BSTCopyNode(sourceNode.data, newID, createX, createY);
  this.sourceToCopyID.set(sourceNode.graphicID, copyNode.graphicID);
  const dx = this.copyStartingX - this.startingX;
  copyNode.x = sourceNode.x + dx;
  copyNode.y = sourceNode.y;
  this.cmd("Move", copyNode.graphicID, copyNode.x, copyNode.y);
  this.cmd("SetHighlight", copyNode.graphicID, 1);
  this.cmd("Step");
  this.setSourceAndCopyHighlight(sourceNode, 0);
  if (this.rootCopy == null) {
    this.rootCopy = copyNode;
  }
  if (parentCopyNode != null) {
    copyNode.parent = parentCopyNode;
    if (isLeftChild) {
      parentCopyNode.left = copyNode;
    } else {
      parentCopyNode.right = copyNode;
    }
    this.cmd(
      "Connect",
      parentCopyNode.graphicID,
      copyNode.graphicID,
      BSTCopy.LINK_COLOR
    );
    this.cmd(
      "SetEdgeAlpha",
      parentCopyNode.graphicID,
      copyNode.graphicID,
      0
    );
  }
  const leftCopy = this.copyTreeRec(sourceNode.left, copyNode, true);
  if (leftCopy != null) {
    this.cmd(
      "SetMessage",
      `Returned from copying left child of ${copyNode.data}. Set left pointer to returned node.`
    );
    this.cmd("SetHighlight", copyNode.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", copyNode.graphicID, 0);
    this.cmd("SetEdgeAlpha", copyNode.graphicID, leftCopy.graphicID, 1);
    this.cmd("Step");
  }
  const rightCopy = this.copyTreeRec(sourceNode.right, copyNode, false);
  if (rightCopy != null) {
    this.cmd(
      "SetMessage",
      `Returned from copying right child of ${copyNode.data}. Set right pointer to returned node.`
    );
    this.cmd("SetHighlight", copyNode.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", copyNode.graphicID, 0);
  }
  return copyNode;
};
BSTCopy.prototype.clearCopyOnly = function() {
  const handler = this;
  function clearTree(tree) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left);
      }
      if (tree.right != null) {
        clearTree(tree.right);
      }
      handler.cmd("Delete", tree.graphicID);
    }
  }
  clearTree(this.rootCopy);
  this.rootCopy = null;
  this.cmd("SetNull", this.rootCopyIndex, 1);
  this.sourceToCopyID = /* @__PURE__ */ new Map();
};
BSTCopy.prototype.insertElement = function(insertedValue) {
  this.commands = [];
  if (this.treeRoot == null) {
    this.cmd("CreateCircle", this.nextIndex, insertedValue, this.startingX, BSTCopy.STARTING_Y);
    this.cmd("SetForegroundColor", this.nextIndex, BSTCopy.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BSTCopy.BACKGROUND_COLOR);
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", this.rootIndex, this.nextIndex, BSTCopy.LINK_COLOR);
    this.treeRoot = new BSTCopyNode(insertedValue, this.nextIndex, this.startingX, BSTCopy.STARTING_Y);
    this.nextIndex += 1;
  } else {
    this.cmd("CreateCircle", this.nextIndex, insertedValue, this.startingX - 200, BSTCopy.STARTING_Y);
    this.cmd("SetForegroundColor", this.nextIndex, BSTCopy.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, BSTCopy.BACKGROUND_COLOR);
    this.cmd("Step");
    const insertElem = new BSTCopyNode(insertedValue, this.nextIndex, this.startingX - 200, BSTCopy.STARTING_Y);
    this.nextIndex += 1;
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
BSTCopy.prototype.insert = function(elem, tree) {
  if (elem.data < tree.data) {
    if (tree.left == null) {
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTCopy.LINK_COLOR);
    } else {
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTCopy.LINK_COLOR);
    } else {
      this.insert(elem, tree.right);
    }
  }
};
BSTCopy.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth
      );
    }
    this.setNewPositions(this.treeRoot, startingPoint, BSTCopy.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
BSTCopy.prototype.resizeCopyTree = function() {
  var startingPoint = this.copyStartingX;
  this.resizeWidths(this.rootCopy);
  if (this.rootCopy != null) {
    if (this.rootCopy.leftWidth > startingPoint) {
      startingPoint = this.rootCopy.leftWidth;
    } else if (this.rootCopy.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.rootCopy.leftWidth,
        2 * startingPoint - this.rootCopy.rightWidth
      );
    }
    this.setNewPositions(this.rootCopy, startingPoint, BSTCopy.STARTING_Y, 0);
    this.animateNewPositions(this.rootCopy);
  }
};
BSTCopy.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(tree.left, xPosition, yPosition + BSTCopy.HEIGHT_DELTA, -1);
    this.setNewPositions(tree.right, xPosition, yPosition + BSTCopy.HEIGHT_DELTA, 1);
  }
};
BSTCopy.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
BSTCopy.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), BSTCopy.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), BSTCopy.WIDTH_DELTA / 2);
  return tree.leftWidth + tree.rightWidth;
};
function BSTCopyNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}
BSTCopy.prototype.disableUI = function() {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
BSTCopy.prototype.enableUI = function() {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
  if (this.copyDone && this.copyButton) {
    this.copyButton.disabled = true;
  }
};
BSTCopy.prototype.undo = function(event) {
  BSTCopy.superclass.undo.call(this, event);
  if (this.actionHistory.length === 0) {
    this.copyDone = false;
    if (this.copyButton)
      this.copyButton.disabled = false;
  }
  this.enableUI(event);
};

// AlgorithmLibrary/BSTIterator.js
BSTIterator.FOREGROUND_COLOR = "var(--svgColor)";
BSTIterator.BACKGROUND_COLOR = "var(--svgFillColor)";
BSTIterator.LINK_COLOR = "var(--svgColor)";
BSTIterator.HIGHLIGHT_CIRCLE_COLOR = "var(--svgColor--highlight)";
BSTIterator.WIDTH_DELTA = 50;
BSTIterator.HEIGHT_DELTA = 50;
BSTIterator.ROOT_Y = 20;
BSTIterator.STARTING_Y = 80;
BSTIterator.STACK_X = 0;
BSTIterator.STACK_Y = 40;
BSTIterator.STACK_SPACING = 22;
BSTIterator.STACK_TOP_COLOR = "var(--svgColor--red)";
function BSTIterator(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "BST Iterator";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 1e3, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
BSTIterator.prototype = new Algorithm();
BSTIterator.prototype.constructor = BSTIterator;
BSTIterator.superclass = Algorithm.prototype;
BSTIterator.prototype.init = function(am, w2, h) {
  var sc = BSTIterator.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.startingX = 250;
  this.rootIndex = this.nextIndex;
  this.cmd(
    "CreateRectangle",
    this.nextIndex++,
    "",
    50,
    25,
    this.startingX - 70,
    BSTIterator.ROOT_Y
  );
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "root",
    this.startingX - 120,
    BSTIterator.ROOT_Y
  );
  this.stackTitleID = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    this.stackTitleID,
    "Iterator stack (bottom)",
    BSTIterator.STACK_X,
    BSTIterator.STACK_Y - 20
  );
  this.treeRoot = null;
  this.iteratorReady = false;
  this.iteratorStack = [];
  this.iteratorCurrentNode = null;
  this.doMakeIterator = function() {
    this.implementAction(this.makeIterator.bind(this), "");
  };
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
BSTIterator.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.makeIteratorButton = addControlToAlgorithmBar("Button", "Make Iterator");
  this.makeIteratorButton.onclick = this.makeIteratorCallback.bind(this);
  this.advanceIteratorButton = addControlToAlgorithmBar(
    "Button",
    "Advance iterator"
  );
  this.advanceIteratorButton.onclick = this.advanceIteratorCallback.bind(this);
  this.advanceIteratorButton.disabled = true;
};
BSTIterator.prototype.syncControlState = function() {
  const canAdvance = this.iteratorReady && this.iteratorStack.length > 0;
  if (this.advanceIteratorButton) {
    this.advanceIteratorButton.disabled = !canAdvance;
  }
};
BSTIterator.prototype.enableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
  this.syncControlState();
};
BSTIterator.prototype.disableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
BSTIterator.prototype.makeIteratorCallback = function() {
  this.implementAction(this.makeIterator.bind(this), "");
};
BSTIterator.prototype.advanceIteratorCallback = function() {
  this.implementAction(this.advanceIterator.bind(this), "");
};
BSTIterator.prototype.clearIterator = function() {
  for (let item of this.iteratorStack) {
    this.cmd("SetText", item.labelID, "");
    this.cmd("SetAlpha", item.labelID, 0);
  }
  this.iteratorStack = [];
  this.iteratorReady = false;
  if (this.iteratorCurrentNode != null) {
    this.cmd("SetHighlight", this.iteratorCurrentNode.graphicID, 0);
    this.iteratorCurrentNode = null;
  }
  this.syncControlState();
};
BSTIterator.prototype.updateStackTopColor = function() {
  for (let item of this.iteratorStack) {
    this.cmd("SetForegroundColor", item.labelID, BSTIterator.FOREGROUND_COLOR);
  }
  if (this.iteratorStack.length > 0) {
    const top = this.iteratorStack[this.iteratorStack.length - 1];
    this.cmd("SetForegroundColor", top.labelID, BSTIterator.STACK_TOP_COLOR);
  }
};
BSTIterator.prototype.stackLabelY = function(index) {
  return BSTIterator.STACK_Y + index * BSTIterator.STACK_SPACING;
};
BSTIterator.prototype.pushIterator = function(node) {
  const labelID = this.nextIndex++;
  const idx = this.iteratorStack.length;
  const y = this.stackLabelY(idx);
  this.cmd("CreateLabel", labelID, String(node.data), BSTIterator.STACK_X, y);
  this.cmd("SetAlpha", labelID, 1);
  this.iteratorStack.push({ node, labelID });
  this.updateStackTopColor();
  this.cmd("SetHighlight", node.graphicID, 1);
  this.cmd(
    "SetMessage",
    `push ${node.data} onto iterator stack`
  );
  this.cmd("Step");
  this.cmd("SetHighlight", node.graphicID, 0);
};
BSTIterator.prototype.popIterator = function() {
  const item = this.iteratorStack.pop();
  if (!item)
    return null;
  this.cmd("SetMessage", `Done at ${item.node.data}, pop from iterator stack`);
  this.cmd("Step");
  this.cmd("SetHighlight", item.node.graphicID, 0);
  this.cmd("SetText", item.labelID, "");
  this.cmd("SetAlpha", item.labelID, 0);
  this.updateStackTopColor();
  return item.node;
};
BSTIterator.prototype.makeIterator = function() {
  this.commands = [];
  if (this.treeRoot == null) {
    this.cmd("SetMessage", "Tree is empty; cannot create iterator.");
    this.cmd("Step");
    return this.commands;
  }
  this.clearIterator();
  this.cmd(
    "SetMessage",
    "Create iterator: push root onto stack, then walk left pushing each node."
  );
  this.cmd("Step");
  let current = this.treeRoot;
  this.pushIterator(current);
  while (current.left != null) {
    this.cmd(
      "SetMessage",
      `Have left child. current = current->left (${current.data} -> ${current.left.data})`
    );
    this.cmd("SetHighlight", current.graphicID, 1);
    this.cmd("SetEdgeHighlight", current.graphicID, current.left.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", current.graphicID, current.left.graphicID, 0);
    this.cmd("SetHighlight", current.graphicID, 0);
    current = current.left;
    this.pushIterator(current);
  }
  this.iteratorReady = true;
  this.syncControlState();
  this.cmd("SetHighlight", current.graphicID, 1);
  this.cmd("SetMessage", "No more left children; iterator ready.");
  return this.commands;
};
BSTIterator.prototype.advanceIterator = function() {
  this.commands = [];
  if (!this.iteratorReady) {
    this.cmd("SetMessage", "Iterator not created yet. Click 'Make Iterator'.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (this.iteratorStack.length === 0) {
    this.cmd("SetMessage", "Iterator finished (stack is empty).");
    this.advanceIteratorButton.disabled = true;
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const current = this.popIterator();
  if (current == null) {
    this.cmd("SetMessage", "Iterator finished.");
    this.syncControlState();
    return this.commands;
  }
  if (this.iteratorCurrentNode != null) {
    this.cmd("SetHighlight", this.iteratorCurrentNode.graphicID, 0);
  }
  this.iteratorCurrentNode = current;
  this.cmd("Step");
  if (current.right != null) {
    let walk = current.right;
    this.cmd(
      "SetMessage",
      `Popped node has right child; set current = right (${current.data} -> ${walk.data})`
    );
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 0);
    this.pushIterator(walk);
    while (walk.left != null) {
      this.cmd(
        "SetMessage",
        `Has left child; current = current->left (${walk.data} -> ${walk.left.data})`
      );
      this.cmd("SetHighlight", walk.graphicID, 1);
      this.cmd("SetEdgeHighlight", walk.graphicID, walk.left.graphicID, 1);
      this.cmd("Step");
      this.cmd("SetEdgeHighlight", walk.graphicID, walk.left.graphicID, 0);
      this.cmd("SetHighlight", walk.graphicID, 0);
      walk = walk.left;
      this.pushIterator(walk);
    }
    this.cmd("SetEdgeHighlight", current.graphicID, current.right.graphicID, 0);
  } else {
    this.cmd(
      "SetMessage",
      `Popped node has no right child. Nothing to do.`
    );
    this.cmd("Step");
  }
  this.syncControlState();
  if (this.iteratorStack.length === 0) {
    this.cmd("SetMessage", "Iterator is now finished (stack is empty).");
  } else {
    this.cmd("SetHighlight", this.iteratorStack[this.iteratorStack.length - 1].node.graphicID, 1);
    this.cmd("SetMessage", "Iterator advanced.");
  }
  return this.commands;
};
BSTIterator.prototype.insertElement = function(insertedValue) {
  this.commands = [];
  const nodeID = this.nextIndex++;
  const newNode = new BSTIteratorNode(insertedValue, nodeID, 100, 100);
  this.cmd(
    "CreateCircle",
    newNode.graphicID,
    newNode.data,
    newNode.x,
    newNode.y
  );
  this.cmd("SetForegroundColor", newNode.graphicID, BSTIterator.FOREGROUND_COLOR);
  this.cmd("SetBackgroundColor", newNode.graphicID, BSTIterator.BACKGROUND_COLOR);
  if (this.treeRoot == null) {
    this.treeRoot = newNode;
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", this.rootIndex, newNode.graphicID, BSTIterator.LINK_COLOR);
  } else {
    this.insert(newNode, this.treeRoot);
  }
  this.resizeTree();
  this.cmd("Step");
  return this.commands;
};
BSTIterator.prototype.insert = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    if (tree.left != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree"
    );
  } else {
    if (tree.right != null)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree"
    );
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null) {
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTIterator.LINK_COLOR);
    } else {
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, BSTIterator.LINK_COLOR);
    } else {
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insert(elem, tree.right);
    }
  }
};
BSTIterator.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    this.setNewPositions(this.treeRoot, startingPoint, BSTIterator.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
BSTIterator.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + BSTIterator.HEIGHT_DELTA,
      -1
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + BSTIterator.HEIGHT_DELTA,
      1
    );
  }
};
BSTIterator.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
BSTIterator.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(
    this.resizeWidths(tree.left),
    BSTIterator.WIDTH_DELTA / 2
  );
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    BSTIterator.WIDTH_DELTA / 2
  );
  return tree.leftWidth + tree.rightWidth;
};
function BSTIteratorNode(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}

// AlgorithmLibrary/BTree.js
var FIRST_PRINT_POS_X = 50;
var PRINT_VERTICAL_GAP = 20;
var MIN_MAX_DEGREE = 3;
var MAX_MAX_DEGREE = 7;
var HEIGHT_DELTA = 50;
var NODE_SPACING = 3;
var STARTING_Y = 30;
var WIDTH_PER_ELEM = 40;
var NODE_HEIGHT = 20;
var MESSAGE_X = 5;
var MESSAGE_Y = 10;
var FOREGROUND_COLOR = Colors.BASE;
var BACKGROUND_COLOR = Colors.FILL;
function BTree(opts = {}) {
  if (!opts.title)
    opts.title = "BTree";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  if (!opts.maxDegree)
    opts.maxDegree = 3;
  if (!opts.preemptiveSplit)
    opts.preemptiveSplit = false;
  this.max_degree = opts.maxDegree;
  this.max_keys = this.max_degree - 1;
  this.preemptiveSplit = opts.preemptiveSplit && this.max_degree % 2 == 0;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
BTree.prototype = new Algorithm();
BTree.prototype.constructor = BTree;
BTree.superclass = Algorithm.prototype;
BTree.prototype.init = function(am, w2, h) {
  BTree.superclass.init.call(this, am, w2, h);
  this.nextIndex = 0;
  this.starting_x = 100;
  this.addControls();
  this.min_keys = 1;
  this.split_index = 1;
  this.messageID = this.nextIndex++;
  this.cmd("CreateLabel", this.messageID, "", MESSAGE_X, MESSAGE_Y, 0);
  this.moveLabel1ID = this.nextIndex++;
  this.moveLabel2ID = this.nextIndex++;
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.commands = new Array();
  this.first_print_pos_y = h - 3 * PRINT_VERTICAL_GAP;
  this.xPosOfNextLabel = 100;
  this.yPosOfNextLabel = 200;
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doRemove = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
BTree.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.controls.push(this.insertButton);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.controls.push(this.deleteButton);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.controls.push(this.findButton);
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
  this.controls.push(this.printButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  this.controls.push(this.insertRandomButton);
  addSeparatorToAlgorithmBar();
  var degreeSelect = addSelectToAlgorithmBar("Degree", "degree", "degree");
  let degreeBody = "";
  for (let i = MIN_MAX_DEGREE; i <= MAX_MAX_DEGREE; i++) {
    degreeBody += `<option value="${i}" ${i == this.max_degree ? "selected" : ""}>${i}</option>`;
  }
  degreeSelect.onchange = (event) => {
    this.maxDegreeChangedHandler.bind(this, parseInt(event.target.value))();
  };
  degreeSelect.innerHTML = degreeBody;
  this.controls.push(degreeSelect);
  this.preemptiveSplitBox = addControlToAlgorithmBar("checkbox", "preemptiveSplit", "preemptiveSplit", "Preemptive Split / Merge<br>(Even max degree only)");
  this.preemptiveSplitBox.onclick = this.preemptiveSplitCallback.bind(this);
  this.controls.push(this.preemptiveSplitBox);
  this.enableUI();
};
BTree.prototype.reset = function() {
  this.nextIndex = 3;
  this.treeRoot = null;
};
BTree.prototype.enableUI = function(event) {
  var i;
  for (i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
  if (this.max_degree % 2 !== 0) {
    this.preemptiveSplitBox.disabled = true;
  }
};
BTree.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
BTree.prototype.maxDegreeChangedHandler = function(newMaxDegree, event) {
  if (this.max_degree != newMaxDegree) {
    this.implementAction(this.changeDegree.bind(this), newMaxDegree);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
  }
};
BTree.prototype.insertCallback = function(event) {
  console.log(this.inputField.value);
  console.log(this.inputField.value.trim() != "");
  if (this.inputField.value.trim() != "") {
    console.log("Have a value to insert");
    var insertedValue;
    insertedValue = this.normalizeNumber(this.inputField.value, 4);
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  } else {
    console.log("Need a value to insert");
    let handler = function() {
      this.commands = new Array();
      this.commands.push(this.cmd("SetMessage", "Need a value to insert"));
      return this.commands;
    }.bind(this);
    this.implementAction(handler, null);
    this.animationManager.skipForward();
  }
};
BTree.prototype.insertRandomCallback = function(event) {
  var numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const insertedValue = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
BTree.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(this.inputField.value, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
BTree.prototype.clearCallback = function(event) {
  this.implementAction(this.clearTree.bind(this), "");
};
BTree.prototype.preemptiveSplitCallback = function(event) {
  if (this.preemptiveSplit != this.preemptiveSplitBox.checked) {
    this.implementAction(
      this.changePreemtiveSplit.bind(this),
      this.preemptiveSplitBox.checked
    );
  }
};
BTree.prototype.changePreemtiveSplit = function(newValue) {
  this.commands = new Array();
  this.cmd("Step");
  this.preemptiveSplit = newValue;
  if (this.preemptiveSplitBox.checked != this.preemptiveSplit) {
    this.preemptiveSplitBox.checked = this.preemptiveSplit;
  }
  return this.commands;
};
BTree.prototype.printCallback = function(event) {
  this.implementAction(this.printTree.bind(this), "");
};
BTree.prototype.printTree = function(unused) {
  this.commands = new Array();
  this.cmd("SetMessage", "Printing tree");
  var firstLabel = this.nextIndex;
  this.xPosOfNextLabel = FIRST_PRINT_POS_X;
  this.yPosOfNextLabel = this.first_print_pos_y;
  this.printMessage = "";
  this.printTreeRec(this.treeRoot);
  this.cmd("SetMessage", `At end of root node. Final output:
${this.printMessage}`);
  this.cmd("Step");
  return this.commands;
};
BTree.prototype.printTreeRec = function(tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  var nextLabelID;
  if (tree.isLeaf) {
    for (var i = 0; i < tree.numKeys; i++) {
      this.printMessage += tree.keys[i] + " ";
    }
    this.cmd("SetMessage", `In leaf. Print all values. Output is:
${this.printMessage}`);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetMessage", `Return to parent.`);
  } else {
    this.cmd("SetMessage", `Descend to leftmost child.`);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[0].graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetEdgeHighlight", tree.graphicID, tree.children[0].graphicID, 0);
    this.printTreeRec(tree.children[0]);
    for (i = 0; i < tree.numKeys; i++) {
      this.cmd("SetHighlight", tree.graphicID, 1);
      this.printMessage += tree.keys[i] + " ";
      this.cmd("SetMessage", `Print next value in node (${tree.keys[i]}). Output is:
${this.printMessage}`);
      this.cmd("Step");
      this.cmd("SetMessage", `Descend to next child.`);
      this.cmd(
        "SetEdgeHighlight",
        tree.graphicID,
        tree.children[i + 1].graphicID,
        1
      );
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.cmd(
        "SetEdgeHighlight",
        tree.graphicID,
        tree.children[i + 1].graphicID,
        0
      );
      this.printTreeRec(tree.children[i + 1]);
    }
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
  }
};
BTree.prototype.clearTree = function(ignored) {
  this.commands = new Array();
  this.deleteTree(this.treeRoot);
  this.treeRoot = null;
  this.nextIndex = 3;
  return this.commands;
};
BTree.prototype.deleteTree = function(tree) {
  if (tree != null) {
    if (!tree.isLeaf) {
      for (var i = 0; i <= tree.numKeys; i++) {
        this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
        this.deleteTree(tree.children[i]);
        tree.children[i] == null;
      }
    }
    this.cmd("Delete", tree.graphicID);
  }
};
BTree.prototype.changeDegree = function(degree) {
  this.commands = new Array();
  this.deleteTree(this.treeRoot);
  this.treeRoot = null;
  this.nextIndex = 3;
  var newDegree = degree;
  this.max_degree = newDegree;
  this.max_keys = newDegree - 1;
  this.min_keys = Math.floor((newDegree + 1) / 2) - 1;
  this.split_index = Math.floor((newDegree - 1) / 2);
  if (this.commands.length == 0) {
    this.cmd("Step");
  }
  if (newDegree % 2 != 0 && this.preemptiveSplit) {
    this.preemptiveSplit = false;
    this.preemptiveSplitBox.checked = false;
  }
  return this.commands;
};
BTree.prototype.findCallback = function(event) {
  var findValue;
  findValue = this.normalizeNumber(this.inputField.value, 4);
  this.inputField.value = "";
  this.implementAction(this.findElement.bind(this), findValue);
};
BTree.prototype.findElement = function(findValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Finding " + findValue);
  this.findInTree(this.treeRoot, findValue);
  return this.commands;
};
BTree.prototype.findInTree = function(tree, val) {
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    var i;
    for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++)
      ;
    if (i == tree.numKeys) {
      this.cmd("SetMessage", `${val} is above ${tree.keys[i - 1]}`);
      if (!tree.isLeaf) {
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[tree.numKeys].graphicID,
          1
        );
        this.cmd("Step");
        this.cmd("SetMessage", `Search for ${val} in rightmost child.`);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[tree.numKeys].graphicID,
          0
        );
        this.findInTree(tree.children[tree.numKeys], val);
      } else {
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetMessage",
          "Element " + val + " is not in the tree"
        );
      }
    } else if (tree.keys[i] > val) {
      if (!tree.isLeaf) {
        console.log(i, tree.numKeys, tree.keys[i]);
        if (i == 0)
          this.cmd("SetMessage", `${val} is below ${tree.keys[0]}`);
        else
          this.cmd("SetMessage", `${val} is between ${tree.keys[i - 1]} and ${tree.keys[i]}`);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[i].graphicID,
          1
        );
        this.cmd("Step");
        if (i == 0)
          this.cmd("SetMessage", `Search leftmost child for ${val}`);
        else
          this.cmd("SetMessage", `Search in child between ${tree.keys[i - 1]} and ${tree.keys[i]}`);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[i].graphicID,
          0
        );
        this.findInTree(tree.children[i], val);
      } else {
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetMessage",
          "Element " + val + " is not in the tree"
        );
      }
    } else {
      this.cmd("SetTextColor", tree.graphicID, Colors.HIGHLIGHT, i);
      this.cmd("SetMessage", "Element " + val + " found");
      this.cmd("Step");
      this.cmd("SetTextColor", tree.graphicID, Colors.BASE, i);
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.cmd("Step");
    }
  } else {
    this.cmd(
      "SetMessage",
      "Element " + val + " is not in the tree"
    );
  }
};
BTree.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting " + insertedValue + ". Start from root.");
  this.cmd("Step");
  if (this.treeRoot == null) {
    this.treeRoot = new BTreeNode(
      this.nextIndex++,
      this.starting_x,
      STARTING_Y
    );
    this.cmd(
      "CreateBTreeNode",
      this.treeRoot.graphicID,
      WIDTH_PER_ELEM,
      NODE_HEIGHT,
      1,
      this.starting_x,
      STARTING_Y,
      BACKGROUND_COLOR,
      FOREGROUND_COLOR
    );
    this.treeRoot.keys[0] = insertedValue;
    this.cmd("SetText", this.treeRoot.graphicID, insertedValue, 0);
    this.cmd("SetMessage", "Root is null, create node and add value.");
    this.cmd("Step");
  } else {
    if (this.preemptiveSplit) {
      if (this.treeRoot.numKeys == this.max_keys) {
        this.cmd("SetMessage", "Root Node is full, need to split node.");
        this.split(this.treeRoot);
        this.resizeTree();
        this.cmd(
          "SetMessage",
          "Restart insert at root."
        );
        this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
        this.cmd("Step");
        this.isRestarting = true;
      }
      this.isRestarting = false;
      this.insertNotFull(this.treeRoot, insertedValue);
    } else {
      this.insert(this.treeRoot, insertedValue);
    }
    if (!this.treeRoot.isLeaf) {
      this.resizeTree();
    }
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
BTree.prototype.insertNotFull = function(tree, insertValue) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (tree.isLeaf) {
    this.cmd(
      "SetMessage",
      "Found leaf. Inserting " + insertValue + "."
    );
    this.cmd("Step");
    tree.numKeys++;
    this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
    var insertIndex = tree.numKeys - 1;
    while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
      tree.keys[insertIndex] = tree.keys[insertIndex - 1];
      this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
      insertIndex--;
    }
    tree.keys[insertIndex] = insertValue;
    this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.resizeTree();
  } else {
    if (!this.isRestarting) {
      this.cmd("SetMessage", "Not a leaf. Find appropriate child to insert into.");
      this.cmd("Step");
    }
    var findIndex = 0;
    while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue) {
      findIndex++;
    }
    this.cmd(
      "SetEdgeHighlight",
      tree.graphicID,
      tree.children[findIndex].graphicID,
      1
    );
    if (findIndex == 0)
      this.cmd("SetMessage", `${insertValue} is below ${tree.keys[0]}`);
    else if (findIndex == tree.numKeys)
      this.cmd("SetMessage", `${insertValue} is above ${tree.keys[findIndex - 1]}`);
    else
      this.cmd("SetMessage", `${insertValue} is between ${tree.keys[findIndex - 1]} and ${tree.keys[findIndex]}`);
    this.cmd("Step");
    this.cmd(
      "SetEdgeHighlight",
      tree.graphicID,
      tree.children[findIndex].graphicID,
      0
    );
    this.cmd("SetHighlight", tree.graphicID, 0);
    if (tree.children[findIndex].numKeys == this.max_keys) {
      this.cmd(
        "SetMessage",
        "Child Node now is full.  Split it ..."
      );
      var newTree = this.split(tree.children[findIndex]);
      this.resizeTree();
      this.cmd(
        "SetMessage",
        "Restart insert at this node."
      );
      this.cmd("SetHighlight", tree.graphicID, 1);
      this.cmd("Step");
      this.isRestarting = true;
      this.insertNotFull(newTree, insertValue);
    } else {
      this.isRestarting = false;
      this.insertNotFull(tree.children[findIndex], insertValue);
    }
  }
};
BTree.prototype.insert = function(tree, insertValue) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (tree.isLeaf) {
    this.cmd(
      "SetMessage",
      "Found a leaf. Inserting " + insertValue + "."
    );
    this.cmd("Step");
    tree.numKeys++;
    this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
    var insertIndex = tree.numKeys - 1;
    while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
      tree.keys[insertIndex] = tree.keys[insertIndex - 1];
      this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
      insertIndex--;
    }
    tree.keys[insertIndex] = insertValue;
    this.cmd("SetText", tree.graphicID, tree.keys[insertIndex], insertIndex);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.insertRepair(tree);
    this.resizeTree();
  } else {
    this.cmd("SetMessage", "Not a leaf. Find appropriate child to insert into.");
    this.cmd("Step");
    var findIndex = 0;
    while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue) {
      findIndex++;
    }
    this.cmd(
      "SetEdgeHighlight",
      tree.graphicID,
      tree.children[findIndex].graphicID,
      1
    );
    if (findIndex == 0)
      this.cmd("SetMessage", `${insertValue} is below ${tree.keys[0]}`);
    else if (findIndex == tree.numKeys)
      this.cmd("SetMessage", `${insertValue} is above ${tree.keys[findIndex - 1]}`);
    else
      this.cmd("SetMessage", `${insertValue} is between ${tree.keys[findIndex - 1]} and ${tree.keys[findIndex]}`);
    this.cmd("Step");
    this.cmd(
      "SetEdgeHighlight",
      tree.graphicID,
      tree.children[findIndex].graphicID,
      0
    );
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.insert(tree.children[findIndex], insertValue);
  }
};
BTree.prototype.insertRepair = function(tree) {
  if (tree.numKeys <= this.max_keys) {
    return;
  } else if (tree.parent == null) {
    this.treeRoot = this.split(tree);
    return;
  } else {
    var newNode = this.split(tree);
    this.insertRepair(newNode);
  }
};
BTree.prototype.split = function(tree) {
  this.cmd("SetMessage", "Node is too big - split node.");
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  var rightNode = new BTreeNode(this.nextIndex++, tree.x + 100, tree.y);
  rightNode.numKeys = tree.numKeys - this.split_index - 1;
  var risingNode = tree.keys[this.split_index];
  this.cmd("SetMessage", `Push middle value (${risingNode}) to parent`);
  if (tree.parent != null) {
    var currentParent = tree.parent;
    for (var parentIndex = 0; parentIndex < currentParent.numKeys + 1 && currentParent.children[parentIndex] != tree; parentIndex++)
      ;
    if (parentIndex == currentParent.numKeys + 1) {
      throw new Error("Couldn't find which child we were!");
    }
    this.cmd(
      "SetNumElements",
      currentParent.graphicID,
      currentParent.numKeys + 1
    );
    for (i = currentParent.numKeys; i > parentIndex; i--) {
      currentParent.children[i + 1] = currentParent.children[i];
      this.cmd(
        "Disconnect",
        currentParent.graphicID,
        currentParent.children[i].graphicID
      );
      this.cmd(
        "Connect",
        currentParent.graphicID,
        currentParent.children[i].graphicID,
        FOREGROUND_COLOR,
        0,
        // Curve
        0,
        // Directed
        "",
        // Label
        i + 1
      );
      currentParent.keys[i] = currentParent.keys[i - 1];
      this.cmd("SetText", currentParent.graphicID, currentParent.keys[i], i);
    }
    currentParent.numKeys++;
    currentParent.keys[parentIndex] = risingNode;
    this.cmd("SetText", currentParent.graphicID, "", parentIndex);
    this.moveLabel1ID = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      this.moveLabel1ID,
      risingNode,
      this.getLabelX(tree, this.split_index),
      tree.y
    );
    this.cmd("SetForegroundColor", this.moveLabel1ID, FOREGROUND_COLOR);
    this.cmd(
      "Move",
      this.moveLabel1ID,
      this.getLabelX(currentParent, parentIndex),
      currentParent.y
    );
    currentParent.children[parentIndex + 1] = rightNode;
    rightNode.parent = currentParent;
  } else {
    this.cmd("SetMessage", "Node is root - Push middle value into new root node.");
    this.cmd("Step");
  }
  this.cmd(
    "CreateBTreeNode",
    rightNode.graphicID,
    WIDTH_PER_ELEM,
    NODE_HEIGHT,
    tree.numKeys - this.split_index - 1,
    tree.x,
    tree.y,
    BACKGROUND_COLOR,
    FOREGROUND_COLOR
  );
  var i;
  for (i = this.split_index + 1; i < tree.numKeys + 1; i++) {
    rightNode.children[i - this.split_index - 1] = tree.children[i];
    if (tree.children[i] != null) {
      rightNode.isLeaf = false;
      this.cmd("Disconnect", tree.graphicID, tree.children[i].graphicID);
      this.cmd(
        "Connect",
        rightNode.graphicID,
        rightNode.children[i - this.split_index - 1].graphicID,
        FOREGROUND_COLOR,
        0,
        // Curve
        0,
        // Directed
        "",
        // Label
        i - this.split_index - 1
      );
      if (tree.children[i] != null) {
        tree.children[i].parent = rightNode;
      }
      tree.children[i] = null;
    }
  }
  for (i = this.split_index + 1; i < tree.numKeys; i++) {
    rightNode.keys[i - this.split_index - 1] = tree.keys[i];
    this.cmd(
      "SetText",
      rightNode.graphicID,
      rightNode.keys[i - this.split_index - 1],
      i - this.split_index - 1
    );
  }
  var leftNode = tree;
  leftNode.numKeys = this.split_index;
  for (i = this.split_index; i < tree.numKeys; i++) {
    this.cmd("SetText", tree.graphicID, "", i);
  }
  this.cmd("SetNumElements", tree.graphicID, this.split_index);
  if (tree.parent != null) {
    this.cmd(
      "Connect",
      currentParent.graphicID,
      rightNode.graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      parentIndex + 1
    );
    this.resizeTree();
    this.cmd("Step");
    this.cmd("Delete", this.moveLabel1ID);
    this.cmd("SetText", currentParent.graphicID, risingNode, parentIndex);
    return tree.parent;
  } else {
    this.treeRoot = new BTreeNode(
      this.nextIndex++,
      this.starting_x,
      STARTING_Y
    );
    this.cmd(
      "CreateBTreeNode",
      this.treeRoot.graphicID,
      WIDTH_PER_ELEM,
      NODE_HEIGHT,
      1,
      this.starting_x,
      STARTING_Y,
      BACKGROUND_COLOR,
      FOREGROUND_COLOR
    );
    this.treeRoot.keys[0] = risingNode;
    this.cmd("SetText", this.treeRoot.graphicID, risingNode, 0);
    this.treeRoot.children[0] = leftNode;
    this.treeRoot.children[1] = rightNode;
    leftNode.parent = this.treeRoot;
    rightNode.parent = this.treeRoot;
    this.cmd(
      "Connect",
      this.treeRoot.graphicID,
      leftNode.graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      0
    );
    this.cmd(
      "Connect",
      this.treeRoot.graphicID,
      rightNode.graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      1
    );
    this.treeRoot.isLeaf = false;
    return this.treeRoot;
  }
};
BTree.prototype.deleteElement = function(deletedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Deleting " + deletedValue + ". Find the value.");
  this.highlightID = this.nextIndex++;
  if (this.preemptiveSplit) {
    this.doDeleteNotEmpty(this.treeRoot, deletedValue);
  } else {
    this.doDeleteEmpty(this.treeRoot, deletedValue);
  }
  if (this.treeRoot.numKeys == 0) {
    this.cmd("Step");
    this.cmd("Delete", this.treeRoot.graphicID);
    this.treeRoot = this.treeRoot.children[0];
    this.treeRoot.parent = null;
    this.resizeTree();
  }
  return this.commands;
};
BTree.prototype.doDeleteNotEmpty = function(tree, val) {
  console.log(tree, val);
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    var i;
    for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++)
      ;
    var foundIndex = i;
    var found = i < tree.numKeys && tree.keys[i] == val;
    console.log(i, tree.numKeys, tree.keys[i], val, found);
    if (!found) {
      if (foundIndex == 0)
        this.cmd("SetMessage", `${val} is below ${tree.keys[0]}`);
      else if (foundIndex == tree.numKeys)
        this.cmd("SetMessage", `${val} is above ${tree.keys[foundIndex - 1]}`);
      else
        this.cmd("SetMessage", `${val} is between ${tree.keys[foundIndex - 1]} and ${tree.keys[foundIndex]}`);
      this.cmd("Step");
    }
    if (i == tree.numKeys) {
      if (!tree.isLeaf) {
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[tree.numKeys].graphicID,
          1
        );
        this.cmd("SetMessage", `Descend to child.`);
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[tree.numKeys].graphicID,
          0
        );
        if (tree.children[tree.numKeys].numKeys == this.min_keys) {
          var nextNode;
          if (tree.children[tree.numKeys - 1].numKeys > this.min_keys) {
            nextNode = this.stealFromLeft(
              tree.children[tree.numKeys],
              tree.numKeys
            );
            this.doDeleteNotEmpty(nextNode, val);
          } else {
            nextNode = this.mergeRight(tree.children[tree.numKeys - 1]);
            this.doDeleteNotEmpty(nextNode, val);
          }
        } else {
          this.doDeleteNotEmpty(tree.children[tree.numKeys], val);
        }
      } else {
        this.cmd("SetHighlight", tree.graphicID, 0);
      }
    } else if (tree.keys[i] > val) {
      if (!tree.isLeaf) {
        this.cmd("SetMessage", `Descend to child.`);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[i].graphicID,
          1
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[i].graphicID,
          0
        );
        if (tree.children[i].numKeys > this.min_keys) {
          this.doDeleteNotEmpty(tree.children[i], val);
        } else {
          this.cmd("SetHighlight", tree.children[i].graphicID, 1);
          this.cmd("SetMessage", `Found ${val}. But deleting would make node too small.`);
          this.cmd("Step");
          this.cmd("SetHighlight", tree.children[i].graphicID, 0);
          if (tree.children[i + 1].numKeys > this.min_keys) {
            nextNode = this.stealFromRight(tree.children[i], i);
            this.isRestarting = true;
            this.cmd("SetMessage", `Now it is safe to delete ${val}. Restart delete in same node.`);
            this.doDeleteNotEmpty(nextNode, val);
          } else {
            nextNode = this.mergeRight(tree.children[i]);
            this.isRestarting = true;
            this.cmd("SetMessage", `Now it is safe to delete ${val}. Restart delete in same node.`);
            this.doDeleteNotEmpty(nextNode, val);
          }
        }
      } else {
        this.cmd("SetHighlight", tree.graphicID, 0);
      }
    } else {
      this.cmd("SetMessage", `Found ${val}. Deleting.`);
      this.cmd("SetTextColor", tree.graphicID, Colors.HIGHLIGHT, i);
      this.cmd("Step");
      if (tree.isLeaf) {
        this.cmd("SetTextColor", tree.graphicID, Colors.BASE, i);
        for (var j = i; j < tree.numKeys - 1; j++) {
          tree.keys[j] = tree.keys[j + 1];
          this.cmd("SetText", tree.graphicID, tree.keys[j], j);
        }
        tree.numKeys--;
        this.cmd("SetText", tree.graphicID, "", tree.numKeys);
        this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.resizeTree();
        this.cmd("SetMessage", "");
      } else {
        var leftChild = tree.children[i];
        var rightChild = tree.children[i + 1];
        if (rightChild.numKeys == this.min_keys && leftChild.numKeys == this.min_keys) {
          this.cmd(
            "SetMessage",
            "Both adjacent subtrees have minimum keys. Merging around key and deleting recursively ..."
          );
          this.cmd("Step");
          this.cmd("SetTextColor", tree.graphicID, FOREGROUND_COLOR, i);
          var nextNode = this.mergeRight(leftChild);
          this.doDeleteNotEmpty(nextNode, val);
          return;
        }
        if (rightChild.numKeys == this.min_keys && leftChild.numKeys > this.min_keys) {
          this.cmd("SetMessage", "Right child has minimum keys. Borrowing from left sibling via parent.");
          this.stealFromLeft(rightChild, i + 1);
        }
        this.cmd("SetMessage", "Finding the smallest key in right subtree ...");
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          rightChild.graphicID,
          1
        );
        this.cmd("Step");
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          rightChild.graphicID,
          0
        );
        var minNode = rightChild;
        while (!minNode.isLeaf) {
          this.cmd("SetHighlight", minNode.graphicID, 1);
          this.cmd("Step");
          this.cmd("SetHighlight", minNode.graphicID, 0);
          if (minNode.children[0].numKeys == this.min_keys) {
            if (minNode.children[1].numKeys == this.min_keys) {
              minNode = this.mergeRight(minNode.children[0]);
            } else {
              minNode = this.stealFromRight(minNode.children[0], 0);
            }
          } else {
            minNode = minNode.children[0];
          }
        }
        this.cmd("SetHighlight", minNode.graphicID, 1);
        tree.keys[i] = minNode.keys[0];
        this.cmd("SetTextColor", tree.graphicID, FOREGROUND_COLOR, i);
        this.cmd("SetText", tree.graphicID, "", i);
        this.cmd("SetText", minNode.graphicID, "", 0);
        this.cmd(
          "CreateLabel",
          this.moveLabel1ID,
          minNode.keys[0],
          this.getLabelX(minNode, 0),
          minNode.y
        );
        this.cmd(
          "Move",
          this.moveLabel1ID,
          this.getLabelX(tree, i),
          tree.y
        );
        this.cmd("Step");
        this.cmd("Delete", this.moveLabel1ID);
        this.cmd("SetText", tree.graphicID, tree.keys[i], i);
        for (var k = 1; k < minNode.numKeys; k++) {
          minNode.keys[k - 1] = minNode.keys[k];
          this.cmd(
            "SetText",
            minNode.graphicID,
            minNode.keys[k - 1],
            k - 1
          );
        }
        this.cmd("SetText", minNode.graphicID, "", minNode.numKeys - 1);
        minNode.numKeys--;
        this.cmd("SetHighlight", minNode.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("SetNumElements", minNode.graphicID, minNode.numKeys);
        this.resizeTree();
        this.cmd("SetMessage", "");
      }
    }
  }
};
BTree.prototype.doDeleteEmpty = function(tree, val) {
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    let found = false;
    var foundIndex;
    for (foundIndex = 0; foundIndex < tree.numKeys && tree.keys[foundIndex] <= val; foundIndex++) {
      if (tree.keys[foundIndex] == val) {
        found = true;
        break;
      }
    }
    if (!found) {
      if (!tree.isLeaf) {
        if (foundIndex == 0)
          this.cmd("SetMessage", `${val} is below ${tree.keys[0]}`);
        else if (foundIndex == tree.numKeys)
          this.cmd("SetMessage", `${val} is above ${tree.keys[foundIndex - 1]}`);
        else
          this.cmd("SetMessage", `${val} is between ${tree.keys[foundIndex - 1]} and ${tree.keys[foundIndex]}`);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[foundIndex].graphicID,
          1
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd(
          "SetEdgeHighlight",
          tree.graphicID,
          tree.children[foundIndex].graphicID,
          0
        );
        this.cmd("SetMessage", `Look for ${val} in child.`);
        this.doDeleteEmpty(tree.children[foundIndex], val);
      } else {
        this.cmd("SetMessage", `Value not found.`);
        this.cmd("SetHighlight", tree.graphicID, 0);
      }
    } else {
      this.cmd("SetMessage", `Found ${val}. Deleting.`);
      this.cmd("SetHighlight", tree.graphicID, foundIndex);
      this.cmd("SetTextColor", tree.graphicID, Colors.HIGHLIGHT, foundIndex);
      this.cmd("Step");
      var i = foundIndex;
      if (tree.isLeaf) {
        this.cmd("SetTextColor", tree.graphicID, Colors.BASE, foundIndex);
        for (var j = i; j < tree.numKeys - 1; j++) {
          tree.keys[j] = tree.keys[j + 1];
          this.cmd("SetText", tree.graphicID, tree.keys[j], j);
        }
        tree.numKeys--;
        this.cmd("SetText", tree.graphicID, "", tree.numKeys);
        this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.repairAfterDelete(tree);
      } else {
        var rightChild = tree.children[i + 1];
        this.cmd("SetMessage", `Find min value in right subtree.`);
        while (!rightChild.isLeaf) {
          this.cmd("SetHighlight", rightChild.graphicID, 1);
          this.cmd("Step");
          this.cmd("SetHighlight", rightChild.graphicID, 0);
          rightChild = rightChild.children[0];
        }
        this.cmd("SetHighlight", rightChild.graphicID, 1);
        tree.keys[i] = rightChild.keys[0];
        this.cmd("SetTextColor", tree.graphicID, FOREGROUND_COLOR, i);
        this.cmd("SetText", tree.graphicID, "", i);
        this.cmd("SetText", rightChild.graphicID, "", 0);
        this.cmd(
          "CreateLabel",
          this.moveLabel1ID,
          tree.keys[i],
          this.getLabelX(rightChild, 0),
          rightChild.y
        );
        this.cmd("Move", this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
        this.cmd("Step");
        this.cmd("Delete", this.moveLabel1ID);
        this.cmd("SetText", tree.graphicID, tree.keys[i], i);
        for (var j = 1; j < rightChild.numKeys; j++) {
          rightChild.keys[j - 1] = rightChild.keys[j];
          this.cmd("SetText", rightChild.graphicID, rightChild.keys[j - 1], j - 1);
        }
        rightChild.numKeys--;
        this.cmd("SetText", rightChild.graphicID, "", rightChild.numKeys);
        this.cmd("SetHighlight", rightChild.graphicID, 0);
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("SetNumElements", rightChild.graphicID, rightChild.numKeys);
        this.repairAfterDelete(rightChild);
      }
    }
  }
};
BTree.prototype.mergeRight = function(tree) {
  var parentNode = tree.parent;
  var parentIndex = 0;
  for (parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++)
    ;
  var rightSib = parentNode.children[parentIndex + 1];
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", parentNode.graphicID, 1);
  this.cmd("SetHighlight", rightSib.graphicID, 1);
  this.cmd("SetMessage", `Merge ${tree.keys[0]} with ${rightSib.keys[0]}.`);
  this.cmd("Step");
  this.cmd(
    "SetNumElements",
    tree.graphicID,
    tree.numKeys + rightSib.numKeys + 1
  );
  tree.x = (tree.x + rightSib.x) / 2;
  this.cmd("SetPosition", tree.graphicID, tree.x, tree.y);
  tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
  var fromParentIndex = tree.numKeys;
  this.cmd("SetText", tree.graphicID, "", tree.numKeys);
  this.cmd(
    "CreateLabel",
    this.moveLabel1ID,
    parentNode.keys[parentIndex],
    this.getLabelX(parentNode, parentIndex),
    parentNode.y
  );
  for (var i = 0; i < rightSib.numKeys; i++) {
    tree.keys[tree.numKeys + 1 + i] = rightSib.keys[i];
    this.cmd(
      "SetText",
      tree.graphicID,
      tree.keys[tree.numKeys + 1 + i],
      tree.numKeys + 1 + i
    );
    this.cmd("SetText", rightSib.graphicID, "", i);
  }
  if (!tree.isLeaf) {
    for (i = 0; i <= rightSib.numKeys; i++) {
      this.cmd(
        "Disconnect",
        rightSib.graphicID,
        rightSib.children[i].graphicID
      );
      tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
      tree.children[tree.numKeys + 1 + i].parent = tree;
      this.cmd(
        "Connect",
        tree.graphicID,
        tree.children[tree.numKeys + 1 + i].graphicID,
        FOREGROUND_COLOR,
        0,
        // Curve
        0,
        // Directed
        "",
        // Label
        tree.numKeys + 1 + i
      );
    }
  }
  this.cmd("Disconnect", parentNode.graphicID, rightSib.graphicID);
  for (i = parentIndex + 1; i < parentNode.numKeys; i++) {
    this.cmd(
      "Disconnect",
      parentNode.graphicID,
      parentNode.children[i + 1].graphicID
    );
    parentNode.children[i] = parentNode.children[i + 1];
    this.cmd(
      "Connect",
      parentNode.graphicID,
      parentNode.children[i].graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      i
    );
    parentNode.keys[i - 1] = parentNode.keys[i];
    this.cmd("SetText", parentNode.graphicID, parentNode.keys[i - 1], i - 1);
  }
  this.cmd("SetText", parentNode.graphicID, "", parentNode.numKeys - 1);
  parentNode.numKeys--;
  this.cmd("SetNumElements", parentNode.graphicID, parentNode.numKeys);
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", parentNode.graphicID, 0);
  this.cmd("Delete", rightSib.graphicID);
  tree.numKeys = tree.numKeys + rightSib.numKeys + 1;
  this.cmd(
    "Move",
    this.moveLabel1ID,
    this.getLabelX(tree, fromParentIndex),
    tree.y
  );
  this.resizeTree();
  this.resizeWidths();
  this.cmd("Step");
  this.resizeTree();
  this.resizeWidths();
  this.cmd("Delete", this.moveLabel1ID);
  this.cmd(
    "SetText",
    tree.graphicID,
    tree.keys[fromParentIndex],
    fromParentIndex
  );
  this.cmd("SetMessage", "");
  return tree;
};
BTree.prototype.stealFromRight = function(tree, parentIndex) {
  var parentNode = tree.parent;
  this.cmd("SetNumElements", tree.graphicID, tree.numKeys + 1);
  this.cmd("SetMessage", "Stealing from right sibling via parent.");
  var rightSib = parentNode.children[parentIndex + 1];
  tree.numKeys++;
  this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
  this.cmd("SetText", tree.graphicID, "", tree.numKeys - 1);
  this.cmd("SetText", parentNode.graphicID, "", parentIndex);
  this.cmd("SetText", rightSib.graphicID, "", 0);
  var tmpLabel1 = this.nextIndex++;
  var tmpLabel2 = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    tmpLabel1,
    rightSib.keys[0],
    this.getLabelX(rightSib, 0),
    rightSib.y
  );
  this.cmd(
    "CreateLabel",
    tmpLabel2,
    parentNode.keys[parentIndex],
    this.getLabelX(parentNode, parentIndex),
    parentNode.y
  );
  this.cmd("SetForegroundColor", tmpLabel1, FOREGROUND_COLOR);
  this.cmd("SetForegroundColor", tmpLabel2, FOREGROUND_COLOR);
  this.cmd(
    "Move",
    tmpLabel1,
    this.getLabelX(parentNode, parentIndex),
    parentNode.y
  );
  this.cmd("Move", tmpLabel2, this.getLabelX(tree, tree.numKeys - 1), tree.y);
  this.cmd("Step");
  this.cmd("Delete", tmpLabel1);
  this.cmd("Delete", tmpLabel2);
  tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
  parentNode.keys[parentIndex] = rightSib.keys[0];
  this.cmd(
    "SetText",
    tree.graphicID,
    tree.keys[tree.numKeys - 1],
    tree.numKeys - 1
  );
  this.cmd(
    "SetText",
    parentNode.graphicID,
    parentNode.keys[parentIndex],
    parentIndex
  );
  if (!tree.isLeaf) {
    tree.children[tree.numKeys] = rightSib.children[0];
    tree.children[tree.numKeys].parent = tree;
    this.cmd("Disconnect", rightSib.graphicID, rightSib.children[0].graphicID);
    this.cmd(
      "Connect",
      tree.graphicID,
      tree.children[tree.numKeys].graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      tree.numKeys
    );
    for (var i = 1; i < rightSib.numKeys + 1; i++) {
      this.cmd(
        "Disconnect",
        rightSib.graphicID,
        rightSib.children[i].graphicID
      );
      rightSib.children[i - 1] = rightSib.children[i];
      this.cmd(
        "Connect",
        rightSib.graphicID,
        rightSib.children[i - 1].graphicID,
        FOREGROUND_COLOR,
        0,
        // Curve
        0,
        // Directed
        "",
        // Label
        i - 1
      );
    }
  }
  for (i = 1; i < rightSib.numKeys; i++) {
    rightSib.keys[i - 1] = rightSib.keys[i];
    this.cmd("SetText", rightSib.graphicID, rightSib.keys[i - 1], i - 1);
  }
  this.cmd("SetText", rightSib.graphicID, "", rightSib.numKeys - 1);
  rightSib.numKeys--;
  this.cmd("SetNumElements", rightSib.graphicID, rightSib.numKeys);
  this.resizeTree();
  this.cmd("SetMessage", "");
  return tree;
};
BTree.prototype.stealFromLeft = function(tree, parentIndex) {
  var parentNode = tree.parent;
  tree.numKeys++;
  this.cmd("SetNumElements", tree.graphicID, tree.numKeys);
  this.cmd(
    "SetMessage",
    "Node has too few keys.  Stealing from left sibling via parent."
  );
  for (i = tree.numKeys - 1; i > 0; i--) {
    tree.keys[i] = tree.keys[i - 1];
    this.cmd("SetText", tree.graphicID, tree.keys[i], i);
  }
  var leftSib = parentNode.children[parentIndex - 1];
  this.cmd("SetText", tree.graphicID, "", 0);
  this.cmd("SetText", parentNode.graphicID, "", parentIndex - 1);
  this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);
  var tmpLabel1 = this.nextIndex++;
  var tmpLabel2 = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    tmpLabel1,
    leftSib.keys[leftSib.numKeys - 1],
    this.getLabelX(leftSib, leftSib.numKeys - 1),
    leftSib.y
  );
  this.cmd(
    "CreateLabel",
    tmpLabel2,
    parentNode.keys[parentIndex - 1],
    this.getLabelX(parentNode, parentIndex - 1),
    parentNode.y
  );
  this.cmd("SetForegroundColor", tmpLabel1, FOREGROUND_COLOR);
  this.cmd("SetForegroundColor", tmpLabel2, FOREGROUND_COLOR);
  this.cmd(
    "Move",
    tmpLabel1,
    this.getLabelX(parentNode, parentIndex - 1),
    parentNode.y
  );
  this.cmd("Move", tmpLabel2, this.getLabelX(tree, 0), tree.y);
  this.resizeTree();
  this.cmd("Step");
  this.cmd("Delete", tmpLabel1);
  this.cmd("Delete", tmpLabel2);
  if (!tree.isLeaf) {
    for (var i = tree.numKeys; i > 0; i--) {
      this.cmd("Disconnect", tree.graphicID, tree.children[i - 1].graphicID);
      tree.children[i] = tree.children[i - 1];
      this.cmd(
        "Connect",
        tree.graphicID,
        tree.children[i].graphicID,
        FOREGROUND_COLOR,
        0,
        // Curve
        0,
        // Directed
        "",
        // Label
        i
      );
    }
    tree.children[0] = leftSib.children[leftSib.numKeys];
    this.cmd(
      "Disconnect",
      leftSib.graphicID,
      leftSib.children[leftSib.numKeys].graphicID
    );
    this.cmd(
      "Connect",
      tree.graphicID,
      tree.children[0].graphicID,
      FOREGROUND_COLOR,
      0,
      // Curve
      0,
      // Directed
      "",
      // Label
      0
    );
    leftSib.children[leftSib.numKeys] = null;
    tree.children[0].parent = tree;
  }
  tree.keys[0] = parentNode.keys[parentIndex - 1];
  this.cmd("SetText", tree.graphicID, tree.keys[0], 0);
  parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
  this.cmd(
    "SetText",
    parentNode.graphicID,
    parentNode.keys[parentIndex - 1],
    parentIndex - 1
  );
  this.cmd("SetText", leftSib.graphicID, "", leftSib.numKeys - 1);
  leftSib.numKeys--;
  this.cmd("SetNumElements", leftSib.graphicID, leftSib.numKeys);
  this.resizeTree();
  this.cmd("SetMessage", "");
  return tree;
};
BTree.prototype.repairAfterDelete = function(tree) {
  if (tree.numKeys < this.min_keys) {
    this.cmd("SetMessage", "Resulting node is too small.");
    this.cmd("Step");
    if (tree.parent == null) {
      if (tree.numKeys == 0) {
        this.cmd("Step");
        this.cmd("Delete", tree.graphicID);
        this.treeRoot = tree.children[0];
        if (this.treeRoot != null)
          this.treeRoot.parent = null;
        this.resizeTree();
      }
    } else {
      var parentNode = tree.parent;
      for (var parentIndex = 0; parentNode.children[parentIndex] != tree; parentIndex++)
        ;
      if (parentIndex > 0 && parentNode.children[parentIndex - 1].numKeys > this.min_keys) {
        this.stealFromLeft(tree, parentIndex);
      } else if (parentIndex < parentNode.numKeys && parentNode.children[parentIndex + 1].numKeys > this.min_keys) {
        this.stealFromRight(tree, parentIndex);
      } else if (parentIndex == 0) {
        this.cmd("SetMessage", "Merging node with right sibling");
        var nextNode = this.mergeRight(tree);
        this.repairAfterDelete(nextNode.parent);
      } else {
        this.cmd("SetMessage", "Merging node with left sibling");
        nextNode = this.mergeRight(parentNode.children[parentIndex - 1]);
        this.repairAfterDelete(nextNode.parent);
      }
    }
  }
};
BTree.prototype.getLabelX = function(tree, index) {
  return tree.x - WIDTH_PER_ELEM * tree.numKeys / 2 + WIDTH_PER_ELEM / 2 + index * WIDTH_PER_ELEM;
};
BTree.prototype.resizeTree = function() {
  this.resizeWidths(this.treeRoot);
  this.setNewPositions(this.treeRoot, this.starting_x, STARTING_Y);
  this.animateNewPositions(this.treeRoot);
};
BTree.prototype.setNewPositions = function(tree, xPosition, yPosition) {
  if (tree != null) {
    tree.y = yPosition;
    tree.x = xPosition;
    if (!tree.isLeaf) {
      var leftEdge = xPosition - tree.width / 2;
      var priorWidth = 0;
      for (var i = 0; i < tree.numKeys + 1; i++) {
        this.setNewPositions(
          tree.children[i],
          leftEdge + priorWidth + tree.widths[i] / 2,
          yPosition + HEIGHT_DELTA
        );
        priorWidth += tree.widths[i];
      }
    }
  }
};
BTree.prototype.animateNewPositions = function(tree) {
  if (tree == null) {
    return;
  }
  var i;
  for (i = 0; i < tree.numKeys + 1; i++) {
    this.animateNewPositions(tree.children[i]);
  }
  this.cmd("Move", tree.graphicID, tree.x, tree.y);
};
BTree.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  if (tree.isLeaf) {
    for (var i = 0; i < tree.numKeys + 1; i++) {
      tree.widths[i] = 0;
    }
    tree.width = tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING;
    return tree.width;
  } else {
    var treeWidth = 0;
    for (i = 0; i < tree.numKeys + 1; i++) {
      tree.widths[i] = this.resizeWidths(tree.children[i]);
      treeWidth = treeWidth + tree.widths[i];
    }
    treeWidth = Math.max(
      treeWidth,
      tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING
    );
    tree.width = treeWidth;
    return treeWidth;
  }
};
function BTreeNode(id, initialX, initialY) {
  this.widths = [];
  this.keys = [];
  this.children = [];
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.numKeys = 1;
  this.isLeaf = true;
  this.parent = null;
  this.leftWidth = 0;
  this.rightWidth = 0;
}

// AlgorithmLibrary/Hash.js
function Hash(arg1, w2, h) {
  if (arg1 == void 0)
    return;
  let am;
  let width;
  let height;
  if (arg1 && typeof arg1.getContext === "function") {
    const legacyCanvas = arg1;
    am = initCanvas2(legacyCanvas, null, "Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    width = legacyCanvas.width;
    height = legacyCanvas.height;
  } else if (arg1 && typeof arg1.StartNewAnimation === "function") {
    am = arg1;
    width = w2;
    height = h;
  } else {
    const opts = arg1 || {};
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Hashing",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    width = viewWidth;
    height = viewHeight;
  }
  this.init(am, width, height);
}
Hash.prototype = new Algorithm();
Hash.prototype.constructor = Hash;
Hash.superclass = Algorithm.prototype;
var MAX_HASH_LENGTH = 5;
var HASH_NUMBER_START_X = 200;
var HASH_X_DIFF = 8;
var HASH_NUMBER_START_Y = 10;
var HASH_ADD_START_Y = 30;
var HASH_INPUT_START_X = 80;
var HASH_INPUT_X_DIFF = 10;
var HASH_INPUT_START_Y = 45;
var HASH_ADD_LINE_Y = 42;
var HASH_RESULT_Y = 50;
var HASH_LABEL_X = 300;
var HASH_LABEL_Y = 30;
var HASH_LABEL_DELTA_X = 50;
var HIGHLIGHT_COLOR = "#0000FF";
Hash.prototype.init = function(am, w2, h) {
  var sc = Hash.superclass;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.hashingIntegers = true;
  this.animateStringHashing = true;
  if (this.animateStringHashCheckbox) {
    this.animateStringHashCheckbox.checked = true;
    this.animateStringHashCheckbox.disabled = true;
  }
};
Hash.prototype.addControls = function() {
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.size = MAX_HASH_LENGTH;
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    MAX_HASH_LENGTH,
    true
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Integer Mode", "String Mode"],
    "HashType"
  );
  this.animateStringHashCheckbox = addCheckboxToAlgorithmBar(
    "Animate string hashing",
    "animateStringHashing"
  );
  this.hashIntegerButton = radioButtonList[0];
  this.hashIntegerButton.onclick = this.changeHashTypeCallback.bind(this, true);
  this.hashStringButton = radioButtonList[1];
  this.hashStringButton.onclick = this.changeHashTypeCallback.bind(this, false);
  this.hashIntegerButton.checked = true;
  this.animateStringHashCheckbox.id = "animateStringHashing";
  this.animateStringHashCheckbox.checked = true;
  this.animateStringHashCheckbox.disabled = true;
  this.animateStringHashCheckbox.onclick = () => {
    this.animateStringHashing = !!this.animateStringHashCheckbox.checked;
  };
};
Hash.prototype.changeHashTypeCallback = function(newHashingIntegers, event) {
  if (this.hashingIntegers != newHashingIntegers) {
    this.implementAction(this.changeHashType.bind(this), newHashingIntegers);
  }
};
Hash.prototype.changeHashType = function(newHashingIntegerValue) {
  this.hashingIntegers = newHashingIntegerValue;
  if (this.hashingIntegers) {
    this.hashIntegerButton.checked = true;
    this.inputField.onkeydown = this.returnSubmit(
      this.inputField,
      this.insertCallback.bind(this),
      MAX_HASH_LENGTH,
      true
    );
  } else {
    this.hashStringButton.checked = true;
    this.inputField.onkeydown = this.returnSubmit(
      this.inputField,
      this.insertCallback.bind(this),
      MAX_HASH_LENGTH,
      false
    );
  }
  if (this.animateStringHashCheckbox) {
    this.animateStringHashCheckbox.disabled = this.hashingIntegers;
    this.animateStringHashing = !!this.animateStringHashCheckbox.checked;
  }
  return this.resetAll();
};
Hash.prototype.doHash = function(input, justHash = false) {
  if (this.hashingIntegers) {
    var labelID1 = this.nextIndex++;
    var labelID2 = this.nextIndex++;
    var highlightID = this.nextIndex++;
    var index = parseInt(input) % this.table_size;
    this.currHash = parseInt(input);
    this.cmd(
      "CreateLabel",
      labelID1,
      input + " % " + String(this.table_size) + " = ",
      HASH_LABEL_X,
      HASH_LABEL_Y
    );
    this.cmd(
      "CreateLabel",
      labelID2,
      index,
      HASH_LABEL_X + HASH_LABEL_DELTA_X,
      HASH_LABEL_Y
    );
    this.cmd("SetMessage", "Compute hash");
    this.cmd("Step");
    this.cmd(
      "CreateHighlightCircle",
      highlightID,
      HIGHLIGHT_COLOR,
      HASH_LABEL_X + HASH_LABEL_DELTA_X,
      HASH_LABEL_Y
    );
    this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
    this.cmd("Step");
    this.cmd("Delete", labelID1);
    this.cmd("Delete", labelID2);
    this.cmd("Delete", highlightID);
    this.nextIndex -= 3;
    return index;
  } else {
    if (!this.animateStringHashing) {
      const str = String(input);
      const hashValue2 = new Array(32).fill(0);
      for (let i2 = str.length - 1; i2 >= 0; i2--) {
        if (i2 < str.length - 1) {
          for (let j2 = 0; j2 < 28; j2++) {
            hashValue2[j2] = hashValue2[j2 + 4];
          }
          for (let j2 = 28; j2 < 32; j2++) {
            hashValue2[j2] = 0;
          }
        }
        let nextChar2 = str.charCodeAt(i2);
        for (let j2 = 7; j2 >= 0; j2--) {
          const bit = nextChar2 % 2;
          nextChar2 = Math.floor(nextChar2 / 2);
          hashValue2[j2 + 24] = hashValue2[j2 + 24] ^ bit;
        }
      }
      this.currHash = 0;
      for (let j2 = 0; j2 < 32; j2++) {
        this.currHash = this.currHash * 2 + hashValue2[j2];
      }
      const index2 = this.currHash % this.table_size;
      const labelID12 = this.nextIndex++;
      const labelID22 = this.nextIndex++;
      const highlightID2 = this.nextIndex++;
      this.cmd(
        "CreateLabel",
        labelID12,
        `hash("${str}") = ${this.currHash}`,
        HASH_LABEL_X,
        HASH_LABEL_Y
      );
      this.cmd(
        "CreateLabel",
        labelID22,
        `${this.currHash} % ${this.table_size} = ${index2}`,
        HASH_LABEL_X,
        HASH_LABEL_Y + 20
      );
      this.cmd(
        "CreateHighlightCircle",
        highlightID2,
        HIGHLIGHT_COLOR,
        HASH_LABEL_X + HASH_LABEL_DELTA_X,
        HASH_LABEL_Y + 20
      );
      this.cmd(
        "Move",
        highlightID2,
        this.indexXPos[index2],
        this.indexYPos[index2]
      );
      this.cmd(
        "SetMessage",
        `Computed hash("${str}") = ${this.currHash}`
      );
      this.cmd("Step");
      this.cmd("Delete", labelID12);
      this.cmd("Delete", labelID22);
      this.cmd("Delete", highlightID2);
      this.nextIndex -= 3;
      return index2;
    }
    var oldnextIndex = this.nextIndex;
    var label1 = this.nextIndex++;
    this.cmd("CreateLabel", label1, "Hashing:", 10, 45, 0);
    var wordToHashID = new Array(input.length);
    var wordToHash = new Array(input.length);
    for (var i = 0; i < input.length; i++) {
      wordToHashID[i] = this.nextIndex++;
      wordToHash[i] = input.charAt(i);
      this.cmd(
        "CreateLabel",
        wordToHashID[i],
        wordToHash[i],
        HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
        HASH_INPUT_START_Y,
        0
      );
    }
    var digits = new Array(32);
    var hashValue = new Array(32);
    var nextByte = new Array(8);
    var nextByteID = new Array(8);
    var resultDigits = new Array(32);
    var operatorID = this.nextIndex++;
    var barID = this.nextIndex++;
    for (i = 0; i < 32; i++) {
      hashValue[i] = 0;
      digits[i] = this.nextIndex++;
      resultDigits[i] = this.nextIndex++;
    }
    for (i = 0; i < 8; i++) {
      nextByteID[i] = this.nextIndex++;
    }
    this.cmd("SetMessage", "Start hashing string: initialize bit accumulator");
    this.cmd("Step");
    for (i = wordToHash.length - 1; i >= 0; i--) {
      for (j = 0; j < 32; j++) {
        this.cmd(
          "CreateLabel",
          digits[j],
          hashValue[j],
          HASH_NUMBER_START_X + j * HASH_X_DIFF,
          HASH_NUMBER_START_Y,
          0
        );
      }
      this.cmd("Delete", wordToHashID[i]);
      var nextChar = wordToHash[i].charCodeAt(0);
      for (var j = 7; j >= 0; j--) {
        nextByte[j] = nextChar % 2;
        nextChar = Math.floor(nextChar / 2);
        this.cmd(
          "CreateLabel",
          nextByteID[j],
          nextByte[j],
          HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
          HASH_INPUT_START_Y,
          0
        );
        this.cmd(
          "Move",
          nextByteID[j],
          HASH_NUMBER_START_X + (j + 24) * HASH_X_DIFF,
          HASH_ADD_START_Y
        );
      }
      this.cmd("SetMessage", `Bring bits for character '${wordToHash[i]}' into position`);
      this.cmd("Step");
      this.cmd(
        "CreateRectangle",
        barID,
        "",
        32 * HASH_X_DIFF,
        0,
        HASH_NUMBER_START_X,
        HASH_ADD_LINE_Y,
        "left",
        "bottom"
      );
      this.cmd(
        "CreateLabel",
        operatorID,
        "XOR",
        HASH_NUMBER_START_X,
        HASH_ADD_START_Y,
        0
      );
      this.cmd("SetMessage", "XOR next byte into accumulator");
      this.cmd("Step");
      for (j = 7; j >= 0; j--) {
        hashValue[j + 24] = hashValue[j + 24] ^ nextByte[j];
      }
      let curHash = "";
      for (j = 0; j < 32; j++) {
        this.cmd(
          "CreateLabel",
          resultDigits[j],
          hashValue[j],
          HASH_NUMBER_START_X + j * HASH_X_DIFF,
          HASH_RESULT_Y,
          0
        );
        curHash += hashValue[j];
      }
      this.cmd("SetMessage", "Current hash is now: " + curHash);
      this.cmd("Step");
      for (j = 0; j < 8; j++) {
        this.cmd("Delete", nextByteID[j]);
      }
      this.cmd("Delete", barID);
      this.cmd("Delete", operatorID);
      for (j = 0; j < 32; j++) {
        this.cmd("Delete", digits[j]);
        this.cmd(
          "Move",
          resultDigits[j],
          HASH_NUMBER_START_X + j * HASH_X_DIFF,
          HASH_NUMBER_START_Y
        );
      }
      this.cmd("SetMessage", "Copy result back into accumulator");
      this.cmd("Step");
      if (i > 0) {
        this.cmd(
          "SetMessage",
          "Shift accumulator left by 4 bits before next character"
        );
        for (j = 0; j < 32; j++) {
          this.cmd(
            "Move",
            resultDigits[j],
            HASH_NUMBER_START_X + (j - 4) * HASH_X_DIFF,
            HASH_NUMBER_START_Y
          );
        }
        this.cmd("Step");
        for (j = 0; j < 28; j++) {
          hashValue[j] = hashValue[j + 4];
        }
        for (j = 28; j < 32; j++) {
          hashValue[j] = 0;
        }
      }
      for (j = 0; j < 32; j++) {
        this.cmd("Delete", resultDigits[j]);
      }
    }
    this.cmd("Delete", label1);
    for (j = 0; j < 32; j++) {
      this.cmd(
        "CreateLabel",
        digits[j],
        hashValue[j],
        HASH_NUMBER_START_X + j * HASH_X_DIFF,
        HASH_NUMBER_START_Y,
        0
      );
    }
    this.currHash = 0;
    for (j = 0; j < 32; j++) {
      this.currHash = this.currHash * 2 + hashValue[j];
    }
    this.cmd(
      "CreateLabel",
      label1,
      " = " + String(this.currHash),
      HASH_NUMBER_START_X + 32 * HASH_X_DIFF,
      HASH_NUMBER_START_Y,
      0
    );
    this.cmd("SetMessage", "Convert final bits into an integer value. Result is " + this.currHash);
    this.cmd("Step");
    if (justHash) {
      return 0;
    }
    for (j = 0; j < 32; j++) {
      this.cmd("Delete", digits[j]);
    }
    var label2 = this.nextIndex++;
    this.cmd(
      "SetText",
      label1,
      String(this.currHash) + " % " + String(this.table_size) + " = "
    );
    index = this.currHash % this.table_size;
    this.cmd(
      "CreateLabel",
      label2,
      index,
      HASH_NUMBER_START_X + 32 * HASH_X_DIFF + 105,
      HASH_NUMBER_START_Y,
      0
    );
    this.cmd("SetMessage", "Compute final bucket = hash mod table size");
    this.cmd("Step");
    highlightID = this.nextIndex++;
    this.cmd(
      "CreateHighlightCircle",
      highlightID,
      HIGHLIGHT_COLOR,
      HASH_NUMBER_START_X + 30 * HASH_X_DIFF + 120,
      HASH_NUMBER_START_Y + 15
    );
    this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
    this.cmd("SetMessage", "Highlight the computed bucket index");
    this.cmd("Step");
    this.cmd("Delete", highlightID);
    this.cmd("Delete", label1);
    this.cmd("Delete", label2);
    return index;
  }
};
Hash.prototype.resetAll = function() {
  if (this.inputField)
    this.inputField.value = "";
  return [];
};
Hash.prototype.insertCallback = function(event) {
  var insertedValue = this.inputField.value;
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
Hash.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
Hash.prototype.findCallback = function(event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
Hash.prototype.insertElement = function(elem) {
};
Hash.prototype.deleteElement = function(elem) {
};
Hash.prototype.findElement = function(elem) {
};
Hash.prototype.reset = function() {
  this.hashIntegerButton.checked = true;
};
Hash.prototype.disableUI = function(event) {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = true;
  }
};
Hash.prototype.enableUI = function(event) {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = false;
  }
};

// AlgorithmLibrary/ClosedHash.js
function ClosedHash(canvas2) {
  let am;
  let w2;
  let h;
  const opts = canvas2 || {};
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Closed Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Closed Hashing",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h);
  if (opts && Array.isArray(opts.initialData)) {
    const hasString = opts.initialData.some((d) => typeof d === "string");
    if (hasString) {
      this.changeHashTypeCallback(false);
    }
  }
  if (opts && typeof opts.probing === "string") {
    const mode = opts.probing.toLowerCase();
    if (mode.startsWith("lin")) {
      this.changeProbeType(this.linearProblingButton);
    } else if (mode.startsWith("quad")) {
      this.changeProbeType(this.quadraticProbingButton);
    } else if (mode.startsWith("dou")) {
      this.changeProbeType(this.doubleHashingButton);
    }
  }
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
var ARRAY_ELEM_WIDTH = 90;
var ARRAY_ELEM_HEIGHT = 30;
var ARRAY_ELEM_START_X = 50;
var ARRAY_ELEM_START_Y = 100;
var ARRAY_VERTICAL_SEPARATION = 100;
var CLOSED_HASH_TABLE_SIZE = 8;
var INDEX_COLOR = "#0000FF";
var INDEX_COLOR = "#0000FF";
ClosedHash.prototype = new Hash();
ClosedHash.prototype.constructor = ClosedHash;
ClosedHash.superclass = Hash.prototype;
ClosedHash.prototype.init = function(am, w2, h) {
  var sc = ClosedHash.superclass;
  var fn = sc.init;
  this.elements_per_row = 8;
  fn.call(this, am, w2, h);
  this.nextIndex = 0;
  this.hasGrown = false;
  this.setup();
};
ClosedHash.prototype.addControls = function() {
  ClosedHash.superclass.addControls.call(this);
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    [
      "Linear Probing: f(i) = i",
      "Quadratic Probing: f(i) = i * i",
      "Double Hashing: f(i) = i * hash2(elem)"
    ],
    "CollisionStrategy"
  );
  this.linearProblingButton = radioButtonList[0];
  this.linearProblingButton.onclick = this.linearProbeCallback.bind(this);
  this.quadraticProbingButton = radioButtonList[1];
  this.quadraticProbingButton.onclick = this.quadraticProbeCallback.bind(this);
  this.doubleHashingButton = radioButtonList[2];
  this.doubleHashingButton.onclick = this.doubleHashingCallback.bind(this);
  this.linearProblingButton.checked = true;
  this.currentHashingTypeButtonState = this.linearProblingButton;
  this.growButton = addControlToAlgorithmBar("Button", "Grow table");
  this.growButton.onclick = this.growCallback.bind(this);
  this.growButton.disabled = false;
};
ClosedHash.prototype.growCallback = function(event) {
  if (!this.hasGrown) {
    this.implementAction(this.growTable.bind(this), 16);
  }
};
ClosedHash.prototype.doInsert = function(value) {
  return this.implementAction(this.insertElement.bind(this), value);
};
ClosedHash.prototype.doRemove = function(value) {
  return this.implementAction(this.deleteElement.bind(this), value);
};
ClosedHash.prototype.doFind = function(value) {
  return this.implementAction(this.findElement.bind(this), value);
};
ClosedHash.prototype.doGrow = function(newSize) {
  return this.implementAction(this.growTable.bind(this), newSize);
};
ClosedHash.prototype.growTable = function(newSize) {
  this.commands = [];
  if (this.hasGrown) {
    return this.commands;
  }
  const targetSize = newSize || 16;
  CLOSED_HASH_TABLE_SIZE = targetSize;
  const oldSize = this.table_size;
  const oldHashTableVisual = this.hashTableVisual.slice();
  const oldHashTableIndices = this.hashTableIndices.slice();
  const oldIndexXPos = this.indexXPos.slice();
  const oldIndexYPos = this.indexYPos.slice();
  const elemsToRehash = [];
  const stagingSlots = [];
  const stagingRects = new Array(oldSize);
  const stagingIndices = new Array(oldSize);
  const stagingXPos = new Array(oldSize);
  const stagingYPos = new Array(oldSize);
  const oldRows = Math.max(1, Math.ceil(oldSize / this.elements_per_row));
  const stagingStartY = ARRAY_ELEM_START_Y + oldRows * ARRAY_VERTICAL_SEPARATION + 100;
  this.cmd(
    "SetMessage",
    `Grow table: expand to ${targetSize}`
  );
  this.cmd("Step");
  for (let i = 0; i < oldSize; i++) {
    const nextXPos = ARRAY_ELEM_START_X + i % this.elements_per_row * ARRAY_ELEM_WIDTH;
    const nextYPos = stagingStartY + Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
    stagingXPos[i] = nextXPos;
    stagingYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
    const rectID = this.nextIndex++;
    stagingRects[i] = rectID;
    this.cmd(
      "CreateRectangle",
      rectID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos
    );
    const idxID = this.nextIndex++;
    stagingIndices[i] = idxID;
    this.cmd("CreateLabel", idxID, i, stagingXPos[i], stagingYPos[i]);
    this.cmd("SetForegroundColor", idxID, INDEX_COLOR);
  }
  this.cmd("SetMessage", "Old array becomes staging array");
  let stagingData = [];
  for (let i = 0; i < oldSize; i++) {
    const hasValue = !this.empty[i] && !this.deleted[i];
    if (this.deleted[i]) {
      this.cmd("SetText", stagingRects[i], "<deleted>");
      stagingData.push("<deleted>");
    } else if (hasValue) {
      const value = this.hashTableValues[i];
      this.cmd("SetText", stagingRects[i], value);
      stagingData.push(value);
    } else {
      stagingData.push("");
    }
  }
  this.cmd("Step");
  for (let i = 0; i < oldSize; i++) {
    this.cmd("Delete", oldHashTableVisual[i]);
    this.cmd("Delete", oldHashTableIndices[i]);
  }
  let oldEmpty = this.empty.slice();
  let oldDeleted = this.deleted.slice();
  this.table_size = targetSize;
  this.skipDist = new Array(this.table_size);
  this.hashTableVisual = new Array(this.table_size);
  this.hashTableIndices = new Array(this.table_size);
  this.hashTableValues = new Array(this.table_size);
  this.indexXPos = new Array(this.table_size);
  this.indexYPos = new Array(this.table_size);
  this.empty = new Array(this.table_size);
  this.deleted = new Array(this.table_size);
  for (let i = 0; i < this.table_size; i++) {
    if (this.currentHashingTypeButtonState == this.quadraticProbingButton) {
      this.skipDist[i] = i * i;
    } else {
      this.skipDist[i] = i;
    }
    this.empty[i] = true;
    this.deleted[i] = false;
    const nextRectID = this.nextIndex++;
    const nextXPos = ARRAY_ELEM_START_X + i % this.elements_per_row * ARRAY_ELEM_WIDTH;
    const nextYPos = ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
    this.cmd(
      "CreateRectangle",
      nextRectID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos
    );
    this.hashTableVisual[i] = nextRectID;
    const nextIndexLabelID = this.nextIndex++;
    this.hashTableIndices[i] = nextIndexLabelID;
    this.indexXPos[i] = nextXPos;
    this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
    this.cmd(
      "CreateLabel",
      nextIndexLabelID,
      i,
      this.indexXPos[i],
      this.indexYPos[i]
    );
    this.cmd("SetForegroundColor", nextIndexLabelID, INDEX_COLOR);
  }
  this.cmd("SetMessage", `Created new table of size ${targetSize}`);
  this.cmd("Step");
  for (let k = 0; k < oldSize; k++) {
    const value = stagingData[k];
    const fromSlot = k;
    const labelID = this.nextIndex++;
    this.cmd("SetHighlight", stagingRects[fromSlot], 1);
    let isValid = !oldEmpty[fromSlot] && !oldDeleted[fromSlot];
    if (isValid) {
      this.cmd("SetMessage", `Take ${value} from staging slot ${fromSlot}`);
    } else {
      this.cmd("SetMessage", `Ignoring staging slot ${fromSlot}`);
    }
    this.cmd("Step");
    if (isValid) {
      this.cmd(
        "CreateLabel",
        labelID,
        value,
        stagingXPos[fromSlot],
        stagingYPos[fromSlot] - ARRAY_ELEM_HEIGHT
      );
      this.cmd("SetText", stagingRects[fromSlot], "");
      this.cmd("Step");
      let index = this.doHash(value);
      index = this.getEmptyIndex(index, value);
      if (index !== -1) {
        this.cmd(
          "Move",
          labelID,
          this.indexXPos[index],
          this.indexYPos[index] - ARRAY_ELEM_HEIGHT
        );
        this.cmd("SetMessage", `Reinsert ${value} at index ${index}`);
        this.cmd("Step");
        this.cmd("Delete", labelID);
        this.cmd("SetText", this.hashTableVisual[index], value);
        this.hashTableValues[index] = value;
        this.empty[index] = false;
        this.deleted[index] = false;
      } else {
        this.cmd("SetMessage", `Table full while reinserting ${value}`);
        this.cmd("Step");
        this.cmd("Delete", labelID);
      }
    }
    this.cmd("SetHighlight", stagingRects[fromSlot], 0);
  }
  this.cmd("SetMessage", "Grow complete");
  this.cmd("Step");
  this.hasGrown = true;
  if (this.growButton) {
    this.growButton.disabled = true;
  }
  for (let i = 0; i < oldSize; i++) {
    this.cmd("Delete", stagingRects[i]);
    this.cmd("Delete", stagingIndices[i]);
  }
  return this.commands;
};
ClosedHash.prototype.changeProbeType = function(newProbingType) {
  if (newProbingType == this.linearProblingButton) {
    this.linearProblingButton.checked = true;
    this.currentHashingTypeButtonState = this.linearProblingButton;
    for (var i = 0; i < this.table_size; i++) {
      this.skipDist[i] = i;
    }
  } else if (newProbingType == this.quadraticProbingButton) {
    this.quadraticProbingButton.checked = true;
    this.currentHashingTypeButtonState = this.quadraticProbingButton;
    for (var i = 0; i < this.table_size; i++) {
      this.skipDist[i] = i * i;
    }
  } else if (newProbingType == this.doubleHashingButton) {
    this.doubleHashingButton.checked = true;
    this.currentHashingTypeButtonState = this.doubleHashingButton;
  }
  this.commands = this.resetAll();
  return this.commands;
};
ClosedHash.prototype.quadraticProbeCallback = function(event) {
  if (this.currentHashingTypeButtonState != this.quadraticProbingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.quadraticProbingButton
    );
  }
};
ClosedHash.prototype.doubleHashingCallback = function(event) {
  if (this.currentHashingTypeButtonState != this.doubleHashingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.doubleHashingButton
    );
  }
};
ClosedHash.prototype.linearProbeCallback = function(event) {
  if (this.currentHashingTypeButtonState != this.linearProblingButton) {
    this.implementAction(
      this.changeProbeType.bind(this),
      this.linearProblingButton
    );
  }
};
ClosedHash.prototype.insertElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting element: " + String(elem));
  var index = this.doHash(elem);
  index = this.getEmptyIndex(index, elem);
  this.cmd("SetMessage", "");
  if (index != -1) {
    var labID = this.nextIndex++;
    this.cmd("CreateLabel", labID, elem, 20, 25);
    this.cmd(
      "Move",
      labID,
      this.indexXPos[index],
      this.indexYPos[index] - ARRAY_ELEM_HEIGHT
    );
    this.cmd("SetMessage", `Insert at index ${index}`);
    this.cmd("Step");
    this.cmd("Delete", labID);
    this.cmd("SetText", this.hashTableVisual[index], elem);
    this.hashTableValues[index] = elem;
    this.empty[index] = false;
    this.deleted[index] = false;
  }
  return this.commands;
};
ClosedHash.prototype.resetSkipDist = function(elem, labelID) {
  var skipVal = 7 - this.currHash % 7;
  this.cmd(
    "CreateLabel",
    labelID,
    "hash2(" + String(elem) + ") = 1 - " + String(this.currHash) + " % 7 = " + String(skipVal),
    20,
    45,
    0
  );
  this.cmd(
    "SetMessage",
    "Calculate hash2(" + String(elem) + ") = 1 - " + String(this.currHash) + " % 7 = " + String(skipVal)
  );
  this.cmd("Step");
  this.skipDist[0] = 0;
  for (var i = 1; i < this.table_size; i++) {
    this.skipDist[i] = this.skipDist[i - 1] + skipVal;
  }
};
ClosedHash.prototype.getEmptyIndex = function(index, elem) {
  var foundIndex = -1;
  var neededDoubleHash = false;
  for (var i = 0; i < this.table_size; i++) {
    var candidateIndex = (index + this.skipDist[i]) % this.table_size;
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
    if (i == 0) {
      this.cmd("SetMessage", `Probe slot ${candidateIndex} for empty`);
    } else {
      if (this.currentHashingTypeButtonState == this.doubleHashingButton)
        this.cmd("SetMessage", `Advance distance determined by hash2. Probe ${candidateIndex} for empty.`);
      else {
        let moveDist = this.skipDist[i];
        this.cmd("SetMessage", `Probe number ${i}. Advance ${moveDist} to ${candidateIndex} and probe for empty`);
      }
    }
    this.cmd("Step");
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
    if (this.empty[candidateIndex]) {
      foundIndex = candidateIndex;
      break;
    } else {
      if (i == 0 && this.currentHashingTypeButtonState == this.doubleHashingButton) {
        this.resetSkipDist(elem, this.nextIndex++);
        neededDoubleHash = true;
      }
    }
  }
  if (neededDoubleHash) {
    this.cmd("Delete", --this.nextIndex);
  }
  return foundIndex;
};
ClosedHash.prototype.getElemIndex = function(index, elem) {
  if (this.currentHashingTypeButtonState == this.doubleHashingButton) {
    this.resetSkipDist(elem, this.nextIndex++);
  }
  var foundIndex = -1;
  for (var i = 0; i < this.table_size; i++) {
    var candidateIndex = (index + this.skipDist[i]) % this.table_size;
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
    this.cmd("SetMessage", `Probe slot ${candidateIndex} for element ${elem}`);
    this.cmd("Step");
    this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
    if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem) {
      foundIndex = candidateIndex;
      break;
    } else if (this.empty[candidateIndex] && !this.deleted[candidateIndex]) {
      break;
    }
  }
  if (this.currentHashingTypeButtonState == this.doubleHashingButton) {
    this.cmd("Delete", --this.nextIndex);
  }
  return foundIndex;
};
ClosedHash.prototype.deleteElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Deleting element: " + elem);
  var index = this.doHash(elem);
  index = this.getElemIndex(index, elem);
  if (index > 0) {
    this.cmd("SetMessage", "Deleting element: " + elem + "  Adding tombstone.");
    this.empty[index] = true;
    this.deleted[index] = true;
    this.cmd("SetText", this.hashTableVisual[index], "<deleted>");
  } else {
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
  }
  return this.commands;
};
ClosedHash.prototype.findElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Finding Element: " + elem);
  var index = this.doHash(elem);
  var found = this.getElemIndex(index, elem) != -1;
  if (found) {
    this.cmd("SetMessage", "Finding Element: " + elem + "  Found!");
  } else {
    this.cmd("SetMessage", "Finding Element: " + elem + "  Not Found!");
  }
  return this.commands;
};
ClosedHash.prototype.setup = function() {
  this.table_size = CLOSED_HASH_TABLE_SIZE;
  this.skipDist = new Array(this.table_size);
  this.hashTableVisual = new Array(this.table_size);
  this.hashTableIndices = new Array(this.table_size);
  this.hashTableValues = new Array(this.table_size);
  this.indexXPos = new Array(this.table_size);
  this.indexYPos = new Array(this.table_size);
  this.empty = new Array(this.table_size);
  this.deleted = new Array(this.table_size);
  this.ExplainLabel = this.nextIndex++;
  this.commands = [];
  for (var i = 0; i < this.table_size; i++) {
    this.skipDist[i] = i;
    var nextID = this.nextIndex++;
    this.empty[i] = true;
    this.deleted[i] = false;
    var nextXPos = ARRAY_ELEM_START_X + i % this.elements_per_row * ARRAY_ELEM_WIDTH;
    var nextYPos = ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
    this.cmd(
      "CreateRectangle",
      nextID,
      "",
      ARRAY_ELEM_WIDTH,
      ARRAY_ELEM_HEIGHT,
      nextXPos,
      nextYPos
    );
    this.hashTableVisual[i] = nextID;
    nextID = this.nextIndex++;
    this.hashTableIndices[i] = nextID;
    this.indexXPos[i] = nextXPos;
    this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
    this.cmd("CreateLabel", nextID, i, this.indexXPos[i], this.indexYPos[i]);
    this.cmd("SetForegroundColor", nextID, INDEX_COLOR);
  }
  this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.resetIndex = this.nextIndex;
};
ClosedHash.prototype.resetAll = function() {
  this.commands = ClosedHash.superclass.resetAll.call(this);
  for (var i = 0; i < this.table_size; i++) {
    this.empty[i] = true;
    this.deleted[i] = false;
    this.cmd("SetText", this.hashTableVisual[i], "");
  }
  return this.commands;
};
ClosedHash.prototype.reset = function() {
  for (var i = 0; i < this.table_size; i++) {
    this.empty[i] = true;
    this.deleted[i] = false;
  }
  this.nextIndex = this.resetIndex;
  ClosedHash.superclass.reset.call(this);
};
ClosedHash.prototype.disableUI = function(event) {
  ClosedHash.superclass.disableUI.call(this);
  this.linearProblingButton.disabled = true;
  this.quadraticProbingButton.disabled = true;
  this.doubleHashingButton.disabled = true;
};
ClosedHash.prototype.enableUI = function(event) {
  ClosedHash.superclass.enableUI.call(this);
  this.linearProblingButton.disabled = false;
  this.quadraticProbingButton.disabled = false;
  this.doubleHashingButton.disabled = false;
};

// AlgorithmLibrary/ConnectedComponent.js
var D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
var F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
var D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
var F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];
var D_X_POS_LARGE = [
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860
];
var F_X_POS_LARGE = [
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860
];
var D_Y_POS_LARGE = [
  37,
  37,
  37,
  37,
  137,
  137,
  137,
  237,
  237,
  237,
  237,
  337,
  337,
  337,
  437,
  437,
  437,
  437
];
var F_Y_POS_LARGE = [
  62,
  62,
  62,
  62,
  162,
  162,
  162,
  262,
  262,
  262,
  262,
  362,
  362,
  362,
  462,
  462,
  462,
  462
];
var HIGHLIGHT_CIRCLE_COLOR2 = "#000000";
var DFS_TREE_COLOR = "#0000FF";
function ConnectedComponent(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Connected Components", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Connected Components",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
ConnectedComponent.prototype = new Graph();
ConnectedComponent.prototype.constructor = ConnectedComponent;
ConnectedComponent.superclass = Graph.prototype;
ConnectedComponent.prototype.addControls = function() {
  this.startButton = addControlToAlgorithmBar(
    "Button",
    "Run Connected Component"
  );
  this.startButton.onclick = this.startCallback.bind(this);
  ConnectedComponent.superclass.addControls.call(this, false);
};
ConnectedComponent.prototype.init = function(am, w2, h, graphOpts) {
  this.showEdgeCosts = false;
  ConnectedComponent.superclass.init.call(this, am, w2, h, true, false, graphOpts);
};
ConnectedComponent.prototype.setup = function() {
  ConnectedComponent.superclass.setup.call(this);
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.commands = new Array();
  this.runLocked = false;
  if (this.startButton)
    this.startButton.disabled = false;
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
  this.ccColors = [
    "#cc3333",
    "#33aa33",
    "#3366cc",
    "#ff9933",
    "#9933cc",
    "#33cccc"
  ];
  this.currentComponentColor = DFS_TREE_COLOR;
  this.sortedColumnX = 200;
  this.sortedColumnYStart = 30;
  this.sortedRowHeight = 20;
  this.sortedLabelsIDs = new Array(this.size);
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
ConnectedComponent.prototype.startCallback = function(event) {
  this.runLocked = true;
  if (this.startButton)
    this.startButton.disabled = true;
  this.implementAction(this.doCC.bind(this), "");
};
ConnectedComponent.prototype.transpose = function() {
  for (var i = 0; i < this.size; i++) {
    for (var j = i + 1; j < this.size; j++) {
      var tmp = this.adj_matrix[i][j];
      this.adj_matrix[i][j] = this.adj_matrix[j][i];
      this.adj_matrix[j][i] = tmp;
    }
  }
};
ConnectedComponent.prototype.doCC = function(ignored) {
  this.visited = new Array(this.size);
  this.commands = new Array();
  this.rebuildEdges();
  this.cmd("SetMessage", "Run first DFS to compute finishing times.");
  this.cmd("Step");
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
      this.cmd("Step");
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleL,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.x_pos_logical[vertex],
        this.y_pos_logical[vertex]
      );
      this.cmd("SetLayer", this.highlightCircleL, 1);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAL,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.adj_list_x_start - this.adj_list_width,
        this.adj_list_y_start + vertex * this.adj_list_height
      );
      this.cmd("SetLayer", this.highlightCircleAL, 2);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAM,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.adj_matrix_x_start - this.adj_matrix_width,
        this.adj_matrix_y_start + vertex * this.adj_matrix_height
      );
      this.cmd("SetLayer", this.highlightCircleAM, 3);
      this.dfsVisit(vertex, 0, false);
      this.stackSectionY = this.stackSectionY + this.stackRowCount * this.stackLineHeight + this.stackSectionGap;
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
  this.cmd("Step");
  this.transpose();
  this.buildEdges();
  this.buildAdjList();
  this.currentTime = 1;
  for (let i = 0; i < this.size; i++) {
    for (let j2 = 0; j2 < this.size; j2++) {
      if (this.adj_matrix[i][j2] >= 0) {
        this.cmd("SetText", this.adj_matrixID[i][j2], "1");
      } else {
        this.cmd("SetText", this.adj_matrixID[i][j2], "");
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
  this.cmd("Step");
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
  for (let i = 0; i < this.size; i++) {
    this.sortedLabelsIDs[i] = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      this.sortedLabelsIDs[i],
      "Vertex: " + String(sortedVertex[i]) + " f=" + String(this.f_times[i]),
      this.sortedColumnX,
      this.sortedColumnYStart + i * this.sortedRowHeight
    );
    this.cmd("SetLayer", this.sortedLabelsIDs[i], 1);
  }
  this.messageY = 30;
  var ccNum = 1;
  for (let i = 0; i < this.size; i++) {
    vertex = sortedVertex[i];
    if (!this.visited[vertex]) {
      this.currentComponentColor = this.ccColors[(ccNum - 1) % this.ccColors.length];
      if (this.sortedLabelsIDs && this.sortedLabelsIDs[i] != null) {
        this.cmd("SetForegroundColor", this.sortedLabelsIDs[i], this.currentComponentColor);
        this.cmd("Step");
      }
      this.cmd("SetMessage", "Connected Component #" + String(ccNum++) + ": start DFS at vertex " + vertex + ".");
      this.cmd("Step");
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleL,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.x_pos_logical[vertex],
        this.y_pos_logical[vertex]
      );
      this.cmd("SetLayer", this.highlightCircleL, 1);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAL,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.adj_list_x_start - this.adj_list_width,
        this.adj_list_y_start + vertex * this.adj_list_height
      );
      this.cmd("SetLayer", this.highlightCircleAL, 2);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAM,
        HIGHLIGHT_CIRCLE_COLOR2,
        this.adj_matrix_x_start - this.adj_matrix_width,
        this.adj_matrix_y_start + vertex * this.adj_matrix_height
      );
      this.cmd("SetLayer", this.highlightCircleAM, 3);
      this.dfsVisit(vertex, 0, true);
      this.stackSectionY = this.stackSectionY + this.stackRowCount * this.stackLineHeight + this.stackSectionGap;
      this.callStackDepth = 0;
      this.stackRowCount = 0;
      this.cmd("Delete", this.highlightCircleL, 10);
      this.cmd("Delete", this.highlightCircleAL, 11);
      this.cmd("Delete", this.highlightCircleAM, 12);
    }
  }
  return this.commands;
};
ConnectedComponent.prototype.setup_large = function() {
  this.d_x_pos = D_X_POS_LARGE;
  this.d_y_pos = D_Y_POS_LARGE;
  this.f_x_pos = F_X_POS_LARGE;
  this.f_y_pos = F_Y_POS_LARGE;
  ConnectedComponent.superclass.setup_large.call(this);
};
ConnectedComponent.prototype.setup_small = function() {
  this.d_x_pos = D_X_POS_SMALL;
  this.d_y_pos = D_Y_POS_SMALL;
  this.f_x_pos = F_X_POS_SMALL;
  this.f_y_pos = F_Y_POS_SMALL;
  ConnectedComponent.superclass.setup_small.call(this);
};
ConnectedComponent.prototype.dfsVisit = function(startVertex, messageX, printCCNum) {
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
    this.stackSectionY + this.stackRowCount * this.stackLineHeight
  );
  this.stackRowCount++;
  if (printCCNum) {
    this.cmd("SetMessage", "Visit vertex " + String(startVertex) + ".");
    this.cmd("Step");
  }
  this.cmd("SetMessage", "First visit to vertex " + String(startVertex) + ".");
  this.cmd("Step");
  this.cmd("SetMessage", "DFS(" + String(startVertex) + ")");
  this.messageY = this.messageY + 20;
  if (!this.visited[startVertex]) {
    this.d_times[startVertex] = this.currentTime++;
    this.cmd(
      "CreateLabel",
      this.d_timesID_L[startVertex],
      "d = " + String(this.d_times[startVertex]),
      this.x_pos_logical[startVertex] - 44,
      this.y_pos_logical[startVertex] - 14
    );
    this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d2 = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2 * this.adj_list_width, this.adj_list_y_start + startVertex * this.adj_list_height - 1 / 4 * this.adj_list_height);
    this.cmd("SetLayer", this.d_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.d_timesID_AL[startVertex], 2);
    this.visited[startVertex] = true;
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
    this.cmd("Step");
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[startVertex][neighbor] > 0) {
        this.highlightEdge(startVertex, neighbor, 1);
        if (this.visited[neighbor]) {
          this.cmd("SetMessage", "Neighbor " + String(neighbor) + " already visited; skip.");
        } else {
          this.cmd("SetMessage", "Visit unvisited neighbor " + String(neighbor) + " from " + String(startVertex) + "; recurse.");
        }
        this.cmd("Step");
        this.highlightEdge(startVertex, neighbor, 0);
        if (!this.visited[neighbor]) {
          this.cmd(
            "Disconnect",
            this.circleID[startVertex],
            this.circleID[neighbor]
          );
          var edgeColor = printCCNum && this.currentComponentColor ? this.currentComponentColor : DFS_TREE_COLOR;
          this.cmd(
            "Connect",
            this.circleID[startVertex],
            this.circleID[neighbor],
            edgeColor,
            this.curve[startVertex][neighbor],
            1,
            ""
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[neighbor],
            this.y_pos_logical[neighbor]
          );
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + neighbor * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + neighbor * this.adj_matrix_height
          );
          this.cmd("Step");
          this.dfsVisit(neighbor, messageX + 10, printCCNum);
          this.cmd("SetMessage", "Return from DFS(" + String(neighbor) + ")");
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + startVertex * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[startVertex],
            this.y_pos_logical[startVertex]
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + startVertex * this.adj_matrix_height
          );
          this.cmd("Step");
        }
        this.cmd("Step");
      }
    }
    this.f_times[startVertex] = this.currentTime++;
    this.cmd(
      "CreateLabel",
      this.f_timesID_L[startVertex],
      "f = " + String(this.f_times[startVertex]),
      this.x_pos_logical[startVertex] - 44,
      this.y_pos_logical[startVertex] + 14
    );
    this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2 * this.adj_list_width, this.adj_list_y_start + startVertex * this.adj_list_height + 1 / 4 * this.adj_list_height);
    this.cmd("SetLayer", this.f_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.f_timesID_AL[startVertex], 2);
    this.cmd("SetMessage", "Finish vertex " + String(startVertex) + ".");
    this.cmd("Step");
  }
  this.callStackDepth--;
};
ConnectedComponent.prototype.reset = function() {
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
ConnectedComponent.prototype.enableUI = function(event) {
  this.startButton.disabled = !!this.runLocked;
  ConnectedComponent.superclass.enableUI.call(this, event);
};
ConnectedComponent.prototype.disableUI = function(event) {
  this.startButton.disabled = true;
  ConnectedComponent.superclass.disableUI.call(this, event);
};
ConnectedComponent.prototype.undo = function(event) {
  ConnectedComponent.superclass.undo.call(this, event);
  this.runLocked = false;
  this.enableUI(event);
};

// AlgorithmLibrary/DetectCycle.js
var AUX_ARRAY_WIDTH2 = 25;
var AUX_ARRAY_HEIGHT2 = 25;
var AUX_ARRAY_START_Y2 = 50;
var VISITED_START_X2 = 200;
var ONSTACK_START_X = 285;
var STACK_START_X = 25;
var STACK_START_Y = 30;
var STACK_INDENT = 10;
var STACK_LINE_HEIGHT = 20;
var HIGHLIGHT_CIRCLE_COLOR3 = "#000000";
var EDGE_CONSIDER_COLOR = "var(--svgColor--althighlight)";
var TREE_EDGE_COLOR = "#0000FF";
var CYCLE_EDGE_COLOR = "var(--svgColor--althighlight)";
function DetectCycle(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Detect Cycle (Directed Graph)", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Detect Cycle (Directed Graph)",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
DetectCycle.prototype = new Graph();
DetectCycle.prototype.constructor = DetectCycle;
DetectCycle.superclass = Graph.prototype;
DetectCycle.prototype.addControls = function() {
  this.startButton = addControlToAlgorithmBar("Button", "Run Cycle Detection");
  this.startButton.onclick = this.startCallback.bind(this);
  DetectCycle.superclass.addControls.call(this, false);
};
DetectCycle.prototype.init = function(am, w2, h, graphOpts) {
  this.showEdgeCosts = false;
  const opts = graphOpts && typeof graphOpts === "object" ? { ...graphOpts } : {};
  const requestedEdgePercentage = opts.edgePercentage ?? opts.edgePercent ?? opts.edgeDensity;
  const parsedEdgePercentage = Number(requestedEdgePercentage);
  const hasValidEdgePercentage = Number.isFinite(parsedEdgePercentage) && parsedEdgePercentage >= 0 && parsedEdgePercentage <= 1;
  if (typeof opts.preventBidirectionalEdge !== "boolean") {
    opts.preventBidirectionalEdge = true;
  }
  DetectCycle.superclass.init.call(this, am, w2, h, true, false, opts);
};
DetectCycle.prototype.setup = function() {
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
      AUX_ARRAY_WIDTH2,
      AUX_ARRAY_HEIGHT2,
      VISITED_START_X2,
      AUX_ARRAY_START_Y2 + i * AUX_ARRAY_HEIGHT2
    );
    this.cmd(
      "CreateLabel",
      this.visitedIndexID[i],
      i,
      VISITED_START_X2 - AUX_ARRAY_WIDTH2,
      AUX_ARRAY_START_Y2 + i * AUX_ARRAY_HEIGHT2
    );
    this.cmd("SetForegroundColor", this.visitedIndexID[i], VERTEX_INDEX_COLOR);
    this.cmd(
      "CreateRectangle",
      this.onStackID[i],
      "F",
      AUX_ARRAY_WIDTH2,
      AUX_ARRAY_HEIGHT2,
      ONSTACK_START_X,
      AUX_ARRAY_START_Y2 + i * AUX_ARRAY_HEIGHT2
    );
    this.cmd(
      "CreateLabel",
      this.onStackIndexID[i],
      i,
      ONSTACK_START_X - AUX_ARRAY_WIDTH2,
      AUX_ARRAY_START_Y2 + i * AUX_ARRAY_HEIGHT2
    );
    this.cmd("SetForegroundColor", this.onStackIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Visited",
    VISITED_START_X2 - AUX_ARRAY_WIDTH2,
    AUX_ARRAY_START_Y2 - AUX_ARRAY_HEIGHT2 * 1.5,
    0
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "On Stack",
    ONSTACK_START_X - AUX_ARRAY_WIDTH2,
    AUX_ARRAY_START_Y2 - AUX_ARRAY_HEIGHT2 * 1.5,
    0
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Stack",
    STACK_START_X,
    STACK_START_Y - 18,
    0
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
};
DetectCycle.prototype.startCallback = function() {
  this.doDetectCycle();
};
DetectCycle.prototype.doDetectCycle = function() {
  this.implementAction(this.doDetectCycleAction.bind(this), 0);
  return true;
};
DetectCycle.prototype.doDetectCycleAction = function() {
  this.commands = [];
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
    HIGHLIGHT_CIRCLE_COLOR3,
    this.x_pos_logical[0],
    this.y_pos_logical[0]
  );
  this.cmd("SetLayer", this.highlightCircleL, 1);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAL,
    HIGHLIGHT_CIRCLE_COLOR3,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start
  );
  this.cmd("SetLayer", this.highlightCircleAL, 2);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAM,
    HIGHLIGHT_CIRCLE_COLOR3,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start
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
        this.y_pos_logical[start]
      );
      this.cmd(
        "Move",
        this.highlightCircleAL,
        this.adj_list_x_start - this.adj_list_width,
        this.adj_list_y_start + start * this.adj_list_height
      );
      this.cmd(
        "Move",
        this.highlightCircleAM,
        this.adj_matrix_x_start - this.adj_matrix_width,
        this.adj_matrix_y_start + start * this.adj_matrix_height
      );
      this.cmd("Step");
      if (this.dfsDetect(start, STACK_START_X)) {
        this.lastCycleStartRoot = start;
      }
    }
  }
  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);
  if (this.foundCycle) {
    this.cmd("SetMessage", "Cycle detected (found an edge to a node currently on the DFS stack).");
  } else {
    this.cmd("SetMessage", "No directed cycle found.");
  }
  this.cmd("Step");
  return this.commands;
};
DetectCycle.prototype.objectExists = function(id) {
  return this.animationManager && this.animationManager.animatedObjects && this.animationManager.animatedObjects.Nodes && this.animationManager.animatedObjects.Nodes[id] != null;
};
DetectCycle.prototype.getLastCycleDebugInfo = function() {
  return {
    foundCycle: !!this.foundCycle,
    cycleStartRoot: this.lastCycleStartRoot,
    startsTried: Array.isArray(this.lastStartsTried) ? this.lastStartsTried.slice() : []
  };
};
DetectCycle.prototype.pushStackVisual = function(vertex, messageX) {
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
    80
  );
  this.stackVisualDepth += 1;
};
DetectCycle.prototype.popStackVisual = function(vertex) {
  var id = this.callLabelByVertex[vertex];
  if (id >= 0) {
    this.cmd("Delete", id);
    this.callLabelByVertex[vertex] = -1;
  }
  this.stackVisualDepth = Math.max(0, this.stackVisualDepth - 1);
};
DetectCycle.prototype.setCurrentCursor = function(vertex) {
  this.cmd(
    "Move",
    this.highlightCircleL,
    this.x_pos_logical[vertex],
    this.y_pos_logical[vertex]
  );
  this.cmd(
    "Move",
    this.highlightCircleAL,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start + vertex * this.adj_list_height
  );
  this.cmd(
    "Move",
    this.highlightCircleAM,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start + vertex * this.adj_matrix_height
  );
};
DetectCycle.prototype.dfsDetect = function(vertex, messageX) {
  this.pushStackVisual(vertex, messageX);
  this.visited[vertex] = true;
  this.onStack[vertex] = true;
  this.cmd("SetText", this.visitedID[vertex], "T");
  this.cmd("SetText", this.onStackID[vertex], "T");
  this.setCurrentCursor(vertex);
  this.cmd("SetMessage", `Visit ${vertex}; mark as on the stack.`);
  this.cmd("Step");
  for (var neighbor = 0; neighbor < this.size; neighbor++) {
    if (this.adj_matrix[vertex][neighbor] > 0) {
      this.setEdgeColor(vertex, neighbor, EDGE_CONSIDER_COLOR);
      this.highlightEdge(vertex, neighbor, 1);
      if (this.onStack[neighbor]) {
        this.setEdgeColor(vertex, neighbor, CYCLE_EDGE_COLOR);
        this.highlightEdge(vertex, neighbor, 1);
        this.cmd("SetMessage", `Edge ${vertex} -> ${neighbor} reaches a node on the stack. Cycle found.`);
        this.cmd("Step");
        this.foundCycle = true;
        return true;
      }
      if (!this.visited[neighbor]) {
        this.setEdgeColor(vertex, neighbor, TREE_EDGE_COLOR);
        this.highlightEdge(vertex, neighbor, 1);
        this.cmd("SetMessage", `Recurse to ${neighbor}.`);
        this.cmd("Step");
        if (this.dfsDetect(neighbor, messageX + STACK_INDENT)) {
          return true;
        }
        this.setEdgeColor(vertex, neighbor, "#000000");
        this.highlightEdge(vertex, neighbor, 0);
        this.setCurrentCursor(vertex);
        this.cmd("SetMessage", `Return to ${vertex} from ${neighbor}.`);
        this.cmd("Step");
      } else {
        this.setEdgeColor(vertex, neighbor, "#000000");
        this.highlightEdge(vertex, neighbor, 0);
        this.cmd("SetMessage", `${neighbor} already fully processed; continue.`);
        this.cmd("Step");
      }
    }
  }
  this.onStack[vertex] = false;
  this.cmd("SetText", this.onStackID[vertex], "F");
  this.popStackVisual(vertex);
  this.cmd("SetMessage", `Done at ${vertex}. Mark as not on the stack.`);
  this.cmd("Step");
  return false;
};
DetectCycle.prototype.reset = function() {
};
DetectCycle.prototype.enableUI = function(event) {
  this.startButton.disabled = false;
  DetectCycle.superclass.enableUI.call(this, event);
};
DetectCycle.prototype.disableUI = function(event) {
  this.startButton.disabled = true;
  DetectCycle.superclass.disableUI.call(this, event);
};

// AlgorithmLibrary/DFS.js
var AUX_ARRAY_WIDTH3 = 25;
var AUX_ARRAY_HEIGHT3 = 25;
var AUX_ARRAY_START_Y3 = 50;
var VISITED_START_X3 = 200;
var PARENT_START_X2 = 275;
var HIGHLIGHT_CIRCLE_COLOR4 = "#000000";
var SEARCH_TREE_FINAL_COLOR2 = "var(--svgColor--althighlight)";
var EDGE_CHECK_COLOR2 = "var(--svgColor--althighlight)";
var QUEUE_START_X2 = 30;
var QUEUE_START_Y2 = 50;
var QUEUE_SPACING2 = 30;
var DFS_CALLSTACK_FONT_SIZE_PERCENT = 80;
function DFS(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Depth-First Search", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Depth-First Search",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
DFS.prototype = new Graph();
DFS.prototype.constructor = DFS;
DFS.superclass = Graph.prototype;
DFS.prototype.addControls = function() {
  addLabelToAlgorithmBar("Start Vertex: ");
  this.startField = addControlToAlgorithmBar("Text", "");
  this.startField.setAttribute("placeholder", "Vertex #");
  this.startField.onkeydown = this.returnSubmit(
    this.startField,
    this.startCallback.bind(this),
    2,
    true
  );
  this.startButton = addControlToAlgorithmBar("Button", "Run DFS");
  this.startButton.onclick = this.startCallback.bind(this);
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Recursive", "Iterative"],
    "DFSMode"
  );
  this.recursiveModeButton = radioButtonList[0];
  this.recursiveModeButton.onclick = this.dfsModeChangedCallback.bind(this, false);
  this.iterativeModeButton = radioButtonList[1];
  this.iterativeModeButton.onclick = this.dfsModeChangedCallback.bind(this, true);
  this.recursiveModeButton.checked = !this.useIterative;
  this.iterativeModeButton.checked = this.useIterative;
  DFS.superclass.addControls.call(this);
};
DFS.prototype.init = function(am, w2, h, graphOpts) {
  this.useIterative = false;
  if (graphOpts && typeof graphOpts === "object") {
    if (typeof graphOpts.iterative === "boolean") {
      this.useIterative = graphOpts.iterative;
    } else if (typeof graphOpts.searchMode === "string") {
      this.useIterative = graphOpts.searchMode.toLowerCase() === "iterative";
    }
  }
  this.showEdgeCosts = false;
  DFS.superclass.init.call(this, am, w2, h, true, false, graphOpts);
};
DFS.prototype.dfsModeChangedCallback = function(iterativeMode) {
  if (this.useIterative !== iterativeMode) {
    this.useIterative = iterativeMode;
  }
};
DFS.prototype.setup = function() {
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
      AUX_ARRAY_WIDTH3,
      AUX_ARRAY_HEIGHT3,
      VISITED_START_X3,
      AUX_ARRAY_START_Y3 + i * AUX_ARRAY_HEIGHT3
    );
    this.cmd(
      "CreateLabel",
      this.visitedIndexID[i],
      i,
      VISITED_START_X3 - AUX_ARRAY_WIDTH3,
      AUX_ARRAY_START_Y3 + i * AUX_ARRAY_HEIGHT3
    );
    this.cmd("SetForegroundColor", this.visitedIndexID[i], VERTEX_INDEX_COLOR);
    this.cmd(
      "CreateRectangle",
      this.parentID[i],
      "",
      AUX_ARRAY_WIDTH3,
      AUX_ARRAY_HEIGHT3,
      PARENT_START_X2,
      AUX_ARRAY_START_Y3 + i * AUX_ARRAY_HEIGHT3
    );
    this.cmd(
      "CreateLabel",
      this.parentIndexID[i],
      i,
      PARENT_START_X2 - AUX_ARRAY_WIDTH3,
      AUX_ARRAY_START_Y3 + i * AUX_ARRAY_HEIGHT3
    );
    this.cmd("SetForegroundColor", this.parentIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Parent",
    PARENT_START_X2 - AUX_ARRAY_WIDTH3,
    AUX_ARRAY_START_Y3 - AUX_ARRAY_HEIGHT3 * 1.5,
    0
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Visited",
    VISITED_START_X3 - AUX_ARRAY_WIDTH3,
    AUX_ARRAY_START_Y3 - AUX_ARRAY_HEIGHT3 * 1.5,
    0
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.highlightCircleL = this.nextIndex++;
  this.highlightCircleAL = this.nextIndex++;
  this.highlightCircleAM = this.nextIndex++;
};
DFS.prototype.startCallback = function(event) {
  if (this.startField.value != "") {
    const startvalue = this.startField.value;
    this.startField.value = "";
    this.doSearch(startvalue);
  }
};
DFS.prototype.doSearch = function(startVertex) {
  const parsedStart = parseInt(startVertex);
  if (!Number.isFinite(parsedStart) || parsedStart < 0 || parsedStart >= this.size) {
    return false;
  }
  this.implementAction(this.doDFS.bind(this), parsedStart);
  return true;
};
DFS.prototype.initEdgeVisualState = function() {
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
DFS.prototype.recordEdgeVisualState = function(i, j, color, highlighted) {
  this.edgeColorState[i][j] = color;
  this.edgeHighlightState[i][j] = highlighted;
  if (!this.directed) {
    this.edgeColorState[j][i] = color;
    this.edgeHighlightState[j][i] = highlighted;
  }
};
DFS.prototype.applyEdgeVisualState = function(i, j, color, highlighted) {
  this.setEdgeColor(i, j, color);
  this.highlightEdge(i, j, highlighted ? 1 : 0);
  this.recordEdgeVisualState(i, j, color, highlighted);
};
DFS.prototype.clearAdjacencyRepEdgeHighlight = function(i, j) {
  if (this.adj_list_edges && this.adj_list_edges[i] && this.adj_list_edges[i][j]) {
    this.cmd("SetHighlight", this.adj_list_edges[i][j], 0);
  }
  if (this.adj_matrixID && this.adj_matrixID[i] && this.adj_matrixID[i][j]) {
    this.cmd("SetHighlight", this.adj_matrixID[i][j], 0);
  }
};
DFS.prototype.doDFS = function(startVetex) {
  if (this.useIterative) {
    return this.doDFSIterative(startVetex);
  }
  return this.doDFSRecursive(startVetex);
};
DFS.prototype.doDFSRecursive = function(startVetex) {
  this.visited = new Array(this.size);
  this.parent = new Array(this.size);
  this.commands = new Array();
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
    HIGHLIGHT_CIRCLE_COLOR4,
    this.x_pos_logical[vertex],
    this.y_pos_logical[vertex]
  );
  this.cmd("SetLayer", this.highlightCircleL, 1);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAL,
    HIGHLIGHT_CIRCLE_COLOR4,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start + vertex * this.adj_list_height
  );
  this.cmd("SetLayer", this.highlightCircleAL, 2);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAM,
    HIGHLIGHT_CIRCLE_COLOR4,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start + vertex * this.adj_matrix_height
  );
  this.cmd("SetLayer", this.highlightCircleAM, 3);
  this.messageY = 30;
  this.dfsVisit(vertex, 10);
  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);
  this.cmd(
    "SetMessage",
    "DFS complete. Search tree highlighted."
  );
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.setEdgeColor(this.parent[i], i, SEARCH_TREE_FINAL_COLOR2);
      this.highlightEdge(this.parent[i], i, 1);
    }
  }
  this.cmd("Step");
  return this.commands;
};
DFS.prototype.doDFSIterative = function(startVetex) {
  this.visited = new Array(this.size);
  this.parent = new Array(this.size);
  this.commands = new Array();
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
    QUEUE_START_X2,
    QUEUE_START_Y2 - 30,
    0
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
      QUEUE_START_X2,
      QUEUE_START_Y2 + i * QUEUE_SPACING2
    );
    this.cmd("SetAlpha", stackLabelID[i], 0);
  }
  var vertex = parseInt(startVetex);
  this.parent[vertex] = -1;
  var stackVertex = new Array(stackCapacity);
  var stackSize = 0;
  stackVertex[stackSize] = vertex;
  this.cmd("SetText", stackLabelID[stackSize], vertex);
  this.cmd("SetAlpha", stackLabelID[stackSize], 1);
  this.cmd(
    "Move",
    stackLabelID[stackSize],
    QUEUE_START_X2,
    QUEUE_START_Y2 + stackSize * QUEUE_SPACING2
  );
  stackSize++;
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleL,
    HIGHLIGHT_CIRCLE_COLOR4,
    this.x_pos_logical[vertex],
    this.y_pos_logical[vertex]
  );
  this.cmd("SetLayer", this.highlightCircleL, 1);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAL,
    HIGHLIGHT_CIRCLE_COLOR4,
    this.adj_list_x_start - this.adj_list_width,
    this.adj_list_y_start + vertex * this.adj_list_height
  );
  this.cmd("SetLayer", this.highlightCircleAL, 2);
  this.cmd(
    "CreateHighlightCircle",
    this.highlightCircleAM,
    HIGHLIGHT_CIRCLE_COLOR4,
    this.adj_matrix_x_start - this.adj_matrix_width,
    this.adj_matrix_y_start + vertex * this.adj_matrix_height
  );
  this.cmd("SetLayer", this.highlightCircleAM, 3);
  this.cmd("SetMessage", `Initialize stack with ${vertex}.`);
  this.cmd("Step");
  while (stackSize > 0) {
    stackSize--;
    var currentVertex = stackVertex[stackSize];
    this.cmd("SetText", stackLabelID[stackSize], "");
    this.cmd("SetAlpha", stackLabelID[stackSize], 0);
    this.cmd("SetMessage", `Pop ${currentVertex} from stack.`);
    this.cmd("Step");
    if (this.visited[currentVertex]) {
      this.cmd("SetMessage", `${currentVertex} is already visited; skip.`);
      this.cmd("Step");
      continue;
    }
    this.visited[currentVertex] = true;
    this.cmd("SetText", this.visitedID[currentVertex], "T");
    if (this.parent[currentVertex] >= 0) {
      this.applyEdgeVisualState(
        this.parent[currentVertex],
        currentVertex,
        EDGE_COLOR,
        true
      );
    }
    this.cmd(
      "Move",
      this.highlightCircleL,
      this.x_pos_logical[currentVertex],
      this.y_pos_logical[currentVertex]
    );
    this.cmd(
      "Move",
      this.highlightCircleAL,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + currentVertex * this.adj_list_height
    );
    this.cmd(
      "Move",
      this.highlightCircleAM,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + currentVertex * this.adj_matrix_height
    );
    this.cmd("SetMessage", `Visit ${currentVertex}; scan neighbors.`);
    this.cmd("Step");
    for (var neighbor = this.size - 1; neighbor >= 0; neighbor--) {
      if (this.adj_matrix[currentVertex][neighbor] > 0) {
        const savedEdgeColor = this.edgeColorState[currentVertex][neighbor];
        const savedEdgeHighlight = this.edgeHighlightState[currentVertex][neighbor];
        this.applyEdgeVisualState(currentVertex, neighbor, EDGE_CHECK_COLOR2, false);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        if (this.visited[neighbor]) {
          this.cmd(
            "SetMessage",
            `Explore edge ${currentVertex} -> ${neighbor}; neighbor already visited (skip).`
          );
        } else {
          this.cmd(
            "SetMessage",
            `Explore edge ${currentVertex} -> ${neighbor}; neighbor unvisited (push).`
          );
        }
        this.cmd("Step");
        if (!this.visited[neighbor]) {
          this.parent[neighbor] = currentVertex;
          this.cmd("SetText", this.parentID[neighbor], currentVertex);
          this.applyEdgeVisualState(
            currentVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight
          );
          stackVertex[stackSize] = neighbor;
          this.cmd("SetText", stackLabelID[stackSize], neighbor);
          this.cmd("SetAlpha", stackLabelID[stackSize], 1);
          this.cmd(
            "Move",
            stackLabelID[stackSize],
            QUEUE_START_X2,
            QUEUE_START_Y2 + stackSize * QUEUE_SPACING2
          );
          stackSize++;
          this.cmd(
            "SetMessage",
            `Discover ${neighbor}; set parent to ${currentVertex} and push ${neighbor} onto stack (edge locks when ${neighbor} is visited).`
          );
          this.cmd("Step");
        } else {
          this.applyEdgeVisualState(
            currentVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight
          );
          this.cmd(
            "SetMessage",
            `Neighbor ${neighbor} already visited; skip edge ${currentVertex} -> ${neighbor}.`
          );
        }
        this.cmd("Step");
        this.clearAdjacencyRepEdgeHighlight(currentVertex, neighbor);
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);
        this.cmd("Step");
      }
    }
    this.cmd("SetMessage", `Finished scanning neighbors of ${currentVertex}.`);
    this.cmd("Step");
  }
  this.cmd("Delete", this.highlightCircleL);
  this.cmd("Delete", this.highlightCircleAL);
  this.cmd("Delete", this.highlightCircleAM);
  this.cmd("SetMessage", "DFS complete. Search tree highlighted.");
  for (i = 0; i < this.size; i++) {
    if (this.parent[i] >= 0) {
      this.applyEdgeVisualState(this.parent[i], i, SEARCH_TREE_FINAL_COLOR2, true);
    }
  }
  this.cmd("Step");
  return this.commands;
};
DFS.prototype.dfsVisit = function(startVertex, messageX) {
  var nextMessage = this.nextIndex++;
  this.messageID.push(nextMessage);
  this.cmd(
    "CreateLabel",
    nextMessage,
    "DFS(" + String(startVertex) + ")",
    messageX,
    this.messageY,
    0,
    DFS_CALLSTACK_FONT_SIZE_PERCENT
  );
  this.messageY = this.messageY + 20;
  if (!this.visited[startVertex]) {
    this.visited[startVertex] = true;
    this.cmd("SetText", this.visitedID[startVertex], "T");
    this.cmd("SetMessage", `Visit ${startVertex}; mark visited.`);
    this.cmd("Step");
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[startVertex][neighbor] > 0) {
        const savedEdgeColor = this.edgeColorState[startVertex][neighbor];
        const savedEdgeHighlight = this.edgeHighlightState[startVertex][neighbor];
        this.applyEdgeVisualState(startVertex, neighbor, EDGE_CHECK_COLOR2, false);
        this.cmd("SetHighlight", this.visitedID[neighbor], 1);
        if (this.visited[neighbor]) {
          this.cmd(
            "SetMessage",
            `Explore edge ${startVertex} -> ${neighbor}; neighbor already visited (skip).`
          );
        } else {
          this.cmd(
            "SetMessage",
            `Explore edge ${startVertex} -> ${neighbor}; neighbor unvisited (recurse).`
          );
        }
        this.cmd("Step");
        if (!this.visited[neighbor]) {
          this.applyEdgeVisualState(startVertex, neighbor, savedEdgeColor, true);
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[neighbor],
            this.y_pos_logical[neighbor]
          );
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + neighbor * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + neighbor * this.adj_matrix_height
          );
          this.parent[neighbor] = startVertex;
          this.cmd("SetText", this.parentID[neighbor], startVertex);
          this.cmd(
            "SetMessage",
            `Discover ${neighbor}; set parent to ${startVertex} and recurse into DFS(${neighbor}).`
          );
          this.cmd("Step");
          this.dfsVisit(neighbor, messageX + 10);
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + startVertex * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[startVertex],
            this.y_pos_logical[startVertex]
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + startVertex * this.adj_matrix_height
          );
          this.cmd(
            "SetMessage",
            `Returned to DFS(${startVertex}) from DFS(${neighbor}); continue scanning neighbors.`
          );
          this.cmd("Step");
        } else {
          this.applyEdgeVisualState(
            startVertex,
            neighbor,
            savedEdgeColor,
            savedEdgeHighlight
          );
        }
        this.cmd("Step");
        this.clearAdjacencyRepEdgeHighlight(startVertex, neighbor);
        this.cmd("SetHighlight", this.visitedID[neighbor], 0);
        this.cmd("Step");
        this.cmd(
          "SetMessage",
          `Finished processing edge ${startVertex} -> ${neighbor}.`
        );
        this.cmd("Step");
      }
    }
  }
};
DFS.prototype.reset = function() {
};
DFS.prototype.enableUI = function(event) {
  this.startField.disabled = false;
  this.startButton.disabled = false;
  this.startButton;
  DFS.superclass.enableUI.call(this, event);
};
DFS.prototype.disableUI = function(event) {
  this.startField.disabled = true;
  this.startButton.disabled = true;
  DFS.superclass.disableUI.call(this, event);
};

// AlgorithmLibrary/DijkstraPrim.js
var TABLE_ENTRY_WIDTH = 50;
var TABLE_ENTRY_HEIGHT = 25;
var TABLE_START_X = 50;
var TABLE_START_Y = 80;
var MESSAGE_LABEL_1_X = 20;
var MESSAGE_LABEL_1_Y = 10;
function DijkstraPrim(canvas2, runningDijkstra) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    const title = runningDijkstra ? "Dijkstra Shortest Path" : "Prim MST";
    am = initCanvas2(legacyCanvas, null, title, false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const runDijkstra = typeof opts.runningDijkstra === "boolean" ? opts.runningDijkstra : true;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || (runDijkstra ? "Dijkstra Shortest Path" : "Prim MST"),
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
    runningDijkstra = runDijkstra;
  }
  this.init(am, runningDijkstra, w2, h, graphOpts);
}
DijkstraPrim.prototype = new Graph();
DijkstraPrim.prototype.constructor = DijkstraPrim;
DijkstraPrim.superclass = Graph.prototype;
DijkstraPrim.prototype.addControls = function() {
  addLabelToAlgorithmBar("Start Vertex: ");
  this.startField = addControlToAlgorithmBar("Text", "");
  this.startField.onkeydown = this.returnSubmit(
    this.startField,
    this.startCallback.bind(this),
    2,
    true
  );
  this.startField.size = 2;
  if (this.runningDijkstra) {
    this.startButton = addControlToAlgorithmBar("Button", "Run Dijkstra");
  } else {
    this.startButton = addControlToAlgorithmBar("Button", "Run Prim");
  }
  this.startButton.onclick = this.startCallback.bind(this);
  DijkstraPrim.superclass.addControls.call(this, this.runningDijkstra);
};
DijkstraPrim.prototype.init = function(am, runningDijkstra, w2, h, graphOpts) {
  this.runningDijkstra = runningDijkstra;
  this.showEdgeCosts = true;
  DijkstraPrim.superclass.init.call(this, am, w2, h, false, false, graphOpts);
};
DijkstraPrim.prototype.setup = function() {
  this.message1ID = this.nextIndex++;
  DijkstraPrim.superclass.setup.call(this);
  this.commands = new Array();
  this.cmd(
    "CreateLabel",
    this.message1ID,
    "",
    MESSAGE_LABEL_1_X,
    MESSAGE_LABEL_1_Y,
    0
  );
  this.vertexID = new Array(this.size);
  this.knownID = new Array(this.size);
  this.distanceID = new Array(this.size);
  this.pathID = new Array(this.size);
  this.known = new Array(this.size);
  this.distance = new Array(this.size);
  this.path = new Array(this.size);
  this.messageID = null;
  for (var i = 0; i < this.size; i++) {
    this.vertexID[i] = this.nextIndex++;
    this.knownID[i] = this.nextIndex++;
    this.distanceID[i] = this.nextIndex++;
    this.pathID[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.vertexID[i],
      i,
      TABLE_ENTRY_WIDTH,
      TABLE_ENTRY_HEIGHT,
      TABLE_START_X,
      TABLE_START_Y + i * TABLE_ENTRY_HEIGHT
    );
    this.cmd(
      "CreateRectangle",
      this.knownID[i],
      "",
      TABLE_ENTRY_WIDTH,
      TABLE_ENTRY_HEIGHT,
      TABLE_START_X + TABLE_ENTRY_WIDTH,
      TABLE_START_Y + i * TABLE_ENTRY_HEIGHT
    );
    this.cmd(
      "CreateRectangle",
      this.distanceID[i],
      "",
      TABLE_ENTRY_WIDTH,
      TABLE_ENTRY_HEIGHT,
      TABLE_START_X + 2 * TABLE_ENTRY_WIDTH,
      TABLE_START_Y + i * TABLE_ENTRY_HEIGHT
    );
    this.cmd(
      "CreateRectangle",
      this.pathID[i],
      "",
      TABLE_ENTRY_WIDTH,
      TABLE_ENTRY_HEIGHT,
      TABLE_START_X + 3 * TABLE_ENTRY_WIDTH,
      TABLE_START_Y + i * TABLE_ENTRY_HEIGHT
    );
    this.cmd("SetTextColor", this.vertexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Vertex",
    TABLE_START_X,
    TABLE_START_Y - TABLE_ENTRY_HEIGHT
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Known",
    TABLE_START_X + TABLE_ENTRY_WIDTH,
    TABLE_START_Y - TABLE_ENTRY_HEIGHT
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Cost",
    TABLE_START_X + 2 * TABLE_ENTRY_WIDTH,
    TABLE_START_Y - TABLE_ENTRY_HEIGHT
  );
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Path",
    TABLE_START_X + 3 * TABLE_ENTRY_WIDTH,
    TABLE_START_Y - TABLE_ENTRY_HEIGHT
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.comparisonMessageID = this.nextIndex++;
};
DijkstraPrim.prototype.findCheapestUnknown = function() {
  var bestIndex = -1;
  this.cmd("SetText", this.message1ID, "Finding Cheapest Uknown Vertex");
  for (var i = 0; i < this.size; i++) {
    if (!this.known[i]) {
      this.cmd("SetHighlight", this.distanceID[i], 1);
    }
    if (!this.known[i] && this.distance[i] != -1 && (bestIndex == -1 || this.distance[i] < this.distance[bestIndex])) {
      bestIndex = i;
    }
  }
  if (bestIndex == -1) {
    var x = 3;
    x = x + 2;
  }
  this.cmd(
    "SetMessage",
    "Scan all unknown vertices and select the smallest tentative distance."
  );
  this.cmd("Step");
  for (var i = 0; i < this.size; i++) {
    if (!this.known[i]) {
      this.cmd("SetHighlight", this.distanceID[i], 0);
    }
  }
  return bestIndex;
};
DijkstraPrim.prototype.doDijkstraPrim = function(startVertex) {
  this.commands = new Array();
  if (!this.runningDijkstra) {
    this.recolorGraph();
  }
  var current = parseInt(startVertex);
  for (var i = 0; i < this.size; i++) {
    this.known[i] = false;
    this.distance[i] = -1;
    this.path[i] = -1;
    this.cmd("SetText", this.knownID[i], "F");
    this.cmd("SetText", this.distanceID[i], "INF");
    this.cmd("SetText", this.pathID[i], "-1");
    this.cmd("SetTextColor", this.knownID[i], "#000000");
  }
  if (this.messageID != null) {
    for (i = 0; i < this.messageID.length; i++) {
      this.cmd("Delete", this.messageID[i]);
    }
  }
  this.messageID = new Array();
  this.distance[current] = 0;
  this.cmd("SetText", this.distanceID[current], 0);
  for (i = 0; i < this.size; i++) {
    current = this.findCheapestUnknown();
    if (current < 0) {
      break;
    }
    this.cmd("SetText", this.message1ID, "Cheapest Unknown Vertex: " + current);
    this.cmd("SetHighlight", this.distanceID[current], 1);
    this.cmd("SetHighlight", this.circleID[current], 1);
    this.cmd("SetMessage", `Select vertex ${current} as next cheapest unknown.`);
    this.cmd("Step");
    this.cmd("SetHighlight", this.distanceID[current], 0);
    this.cmd("SetText", this.message1ID, "Setting known field to True");
    this.cmd("SetHighlight", this.knownID[current], 1);
    this.known[current] = true;
    this.cmd("SetText", this.knownID[current], "T");
    this.cmd("SetTextColor", this.knownID[current], "#AAAAAA");
    this.cmd("SetMessage", `Mark vertex ${current} as known (finalize its value).`);
    this.cmd("Step");
    this.cmd("SetHighlight", this.knownID[current], 0);
    this.cmd(
      "SetText",
      this.message1ID,
      "Updating neighbors of vertex " + current
    );
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[current][neighbor] >= 0) {
        this.highlightEdge(current, neighbor, 1);
        if (this.known[neighbor]) {
          this.cmd(
            "CreateLabel",
            this.comparisonMessageID,
            "Vertex " + String(neighbor) + " known",
            TABLE_START_X + 5 * TABLE_ENTRY_WIDTH,
            TABLE_START_Y + neighbor * TABLE_ENTRY_HEIGHT
          );
          this.cmd("SetHighlight", this.knownID[neighbor], 1);
          this.cmd(
            "SetMessage",
            `Edge ${current} -> ${neighbor}: neighbor already known; skip update.`
          );
        } else {
          this.cmd("SetHighlight", this.distanceID[current], 1);
          this.cmd("SetHighlight", this.distanceID[neighbor], 1);
          var distString = String(this.distance[neighbor]);
          if (this.distance[neighbor] < 0) {
            distString = "INF";
          }
          if (this.runningDijkstra) {
            if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.distance[current] + this.adj_matrix[current][neighbor]) {
              this.cmd(
                "CreateLabel",
                this.comparisonMessageID,
                distString + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]),
                TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
                TABLE_START_Y + neighbor * TABLE_ENTRY_HEIGHT
              );
            } else {
              this.cmd(
                "CreateLabel",
                this.comparisonMessageID,
                "!(" + String(this.distance[neighbor]) + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]) + ")",
                TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
                TABLE_START_Y + neighbor * TABLE_ENTRY_HEIGHT
              );
            }
          } else {
            if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.adj_matrix[current][neighbor]) {
              this.cmd(
                "CreateLabel",
                this.comparisonMessageID,
                distString + " > " + String(this.adj_matrix[current][neighbor]),
                TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
                TABLE_START_Y + neighbor * TABLE_ENTRY_HEIGHT
              );
            } else {
              this.cmd(
                "CreateLabel",
                this.comparisonMessageID,
                "!(" + String(this.distance[neighbor]) + " > " + String(this.adj_matrix[current][neighbor]) + ")",
                TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
                TABLE_START_Y + neighbor * TABLE_ENTRY_HEIGHT
              );
            }
          }
          if (this.runningDijkstra) {
            this.cmd(
              "SetMessage",
              `Relax edge ${current} -> ${neighbor}: check if dist[${neighbor}] > dist[${current}] + w(${current},${neighbor}).`
            );
          } else {
            this.cmd(
              "SetMessage",
              `Update Prim candidate for ${neighbor}: check if cost[${neighbor}] > w(${current},${neighbor}).`
            );
          }
        }
        this.cmd("Step");
        this.cmd("Delete", this.comparisonMessageID);
        this.highlightEdge(current, neighbor, 0);
        if (this.known[neighbor]) {
          this.cmd("SetHighlight", this.knownID[neighbor], 0);
        } else {
          this.cmd("SetHighlight", this.distanceID[current], 0);
          this.cmd("SetHighlight", this.distanceID[neighbor], 0);
          var compare;
          if (this.runningDijkstra) {
            compare = this.distance[current] + this.adj_matrix[current][neighbor];
          } else {
            compare = this.adj_matrix[current][neighbor];
          }
          if (this.distance[neighbor] < 0 || this.distance[neighbor] > compare) {
            this.distance[neighbor] = compare;
            this.path[neighbor] = current;
            this.cmd(
              "SetText",
              this.distanceID[neighbor],
              this.distance[neighbor]
            );
            this.cmd("SetText", this.pathID[neighbor], this.path[neighbor]);
          }
        }
      }
    }
    this.cmd("SetHighlight", this.circleID[current], 0);
  }
  if (this.runningDijkstra) {
    this.cmd("SetText", this.message1ID, "Finding Paths in Table");
    this.createPaths();
  } else {
    this.cmd("SetText", this.message1ID, "Creating tree from table");
    this.highlightTree();
  }
  this.cmd(
    "SetMessage",
    "Algorithm complete; highlight all edges in the predecessor table."
  );
  for (i = 0; i < this.size; i++) {
    if (this.path[i] >= 0) {
      this.highlightEdge(this.path[i], i, 1);
      if (!this.runningDijkstra) {
        this.highlightEdge(i, this.path[i], 1);
      }
    }
  }
  this.cmd("Step");
  this.cmd("SetText", this.message1ID, "");
  return this.commands;
};
DijkstraPrim.prototype.createPaths = function() {
  for (var vertex = 0; vertex < this.size; vertex++) {
    var nextLabelID = this.nextIndex++;
    if (this.distance[vertex] < 0) {
      this.cmd(
        "CreateLabel",
        nextLabelID,
        "No Path",
        TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
        TABLE_START_Y + vertex * TABLE_ENTRY_HEIGHT
      );
      this.messageID.push(nextLabelID);
    } else {
      this.cmd(
        "CreateLabel",
        nextLabelID,
        vertex,
        TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
        TABLE_START_Y + vertex * TABLE_ENTRY_HEIGHT
      );
      this.messageID.push(nextLabelID);
      var pathList = [nextLabelID];
      var nextInPath = vertex;
      while (nextInPath >= 0) {
        this.cmd("SetHighlight", this.pathID[nextInPath], 1);
        this.cmd(
          "SetMessage",
          `Trace predecessor for vertex ${vertex}: next = ${nextInPath}.`
        );
        this.cmd("Step");
        if (this.path[nextInPath] != -1) {
          nextLabelID = this.nextIndex++;
          this.cmd(
            "CreateLabel",
            nextLabelID,
            this.path[nextInPath],
            TABLE_START_X + 3 * TABLE_ENTRY_WIDTH,
            TABLE_START_Y + nextInPath * TABLE_ENTRY_HEIGHT
          );
          this.cmd(
            "Move",
            nextLabelID,
            TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,
            TABLE_START_Y + vertex * TABLE_ENTRY_HEIGHT
          );
          this.messageID.push(nextLabelID);
          for (var i = pathList.length - 1; i >= 0; i--) {
            this.cmd(
              "Move",
              pathList[i],
              TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH + (pathList.length - i) * 17,
              TABLE_START_Y + vertex * TABLE_ENTRY_HEIGHT
            );
          }
          this.cmd(
            "SetMessage",
            `Extend path display for vertex ${vertex} by adding predecessor ${this.path[nextInPath]}.`
          );
          this.cmd("Step");
          pathList.push(nextLabelID);
        }
        this.cmd("SetHighlight", this.pathID[nextInPath], 0);
        nextInPath = this.path[nextInPath];
      }
    }
  }
};
DijkstraPrim.prototype.highlightTree = function() {
  for (var vertex = 0; vertex < this.size; vertex++) {
    if (this.path[vertex] >= 0) {
      this.cmd("SetHighlight", this.vertexID[vertex], 1);
      this.cmd("SetHighlight", this.pathID[vertex], 1);
      this.highlightEdge(vertex, this.path[vertex], 1);
      this.highlightEdge(this.path[vertex], vertex, 1);
      this.cmd(
        "SetMessage",
        `Tree edge ${this.path[vertex]} - ${vertex} is selected in the MST.`
      );
      this.cmd("Step");
      this.cmd("SetHighlight", this.vertexID[vertex], 0);
      this.cmd("SetHighlight", this.pathID[vertex], 0);
      this.highlightEdge(vertex, this.path[vertex], 0);
      this.highlightEdge(this.path[vertex], vertex, 0);
      this.setEdgeColor(vertex, this.path[vertex], "#FF0000");
      this.setEdgeColor(this.path[vertex], vertex, "#FF0000");
    }
  }
};
DijkstraPrim.prototype.reset = function() {
  this.messageID = new Array();
};
DijkstraPrim.prototype.startCallback = function(event) {
  var startvalue;
  if (this.startField.value != "") {
    startvalue = this.startField.value;
    this.startField.value = "";
    if (parseInt(startvalue) < this.size)
      this.implementAction(this.doDijkstraPrim.bind(this), startvalue);
  }
};
DijkstraPrim.prototype.enableUI = function(event) {
  this.startField.disabled = false;
  this.startButton.disabled = false;
  this.startButton;
  DijkstraPrim.superclass.enableUI.call(this, event);
};
DijkstraPrim.prototype.disableUI = function(event) {
  this.startField.disabled = true;
  this.startButton.disabled = true;
  DijkstraPrim.superclass.disableUI.call(this, event);
};

// AlgorithmLibrary/Prim.js
function Prim(canvas2) {
  if (canvas2 && typeof canvas2.getContext === "function") {
    return new DijkstraPrim(canvas2, false);
  }
  const opts = canvas2 || {};
  return new DijkstraPrim({
    ...opts,
    runningDijkstra: false
  });
}

// AlgorithmLibrary/GraphRepresentation.js
function GraphRepresentation(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Graph Representation", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Graph Representation",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
GraphRepresentation.prototype = new Graph();
GraphRepresentation.prototype.constructor = GraphRepresentation;
GraphRepresentation.superclass = Graph.prototype;
GraphRepresentation.prototype.addControls = function() {
  GraphRepresentation.superclass.addControls.call(this);
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Unweighted Graph", "Weighted Graph"],
    "GraphWeightType"
  );
  this.unweightedGraphButton = radioButtonList[0];
  this.unweightedGraphButton.onclick = this.weightedGraphCallback.bind(
    this,
    false
  );
  this.weightedGraphButton = radioButtonList[1];
  this.weightedGraphButton.onclick = this.weightedGraphCallback.bind(this, true);
  this.unweightedGraphButton.checked = !this.showEdgeCosts;
  this.weightedGraphButton.checked = this.showEdgeCosts;
};
GraphRepresentation.prototype.weightedGraphCallback = function(newWeighted) {
  if (newWeighted != this.showEdgeCosts) {
    this.showEdgeCosts = newWeighted;
    this.animationManager.resetAll();
    this.setup();
  }
};
GraphRepresentation.prototype.init = function(am, w2, h, graphOpts) {
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
  GraphRepresentation.superclass.init.call(this, am, w2, h, true, false, graphOpts);
};

// AlgorithmLibrary/Heap.js
function Heap(arg) {
  let am;
  const opts = arg || {};
  am = initAnimationManager({
    title: opts.title || "Min Heap",
    height: opts.height || 500,
    ...opts
  });
  this.init(am);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
Heap.prototype = new Algorithm();
Heap.prototype.constructor = Heap;
Heap.superclass = Algorithm.prototype;
var ARRAY_SIZE = 15;
var ARRAY_ELEM_WIDTH2 = 30;
var ARRAY_ELEM_HEIGHT2 = 25;
var ARRAY_INITIAL_X = 30;
var HEAP_CAPACITY = ARRAY_SIZE;
var ARRAY_Y_POS = 50;
var ARRAY_LABEL_Y_POS = 70;
var HEAP_ROOT_UNDER_ARRAY_INDEX = 7;
function buildHeapXPositions(rootX) {
  const offsetsByDepth = [0, 96, 48, 24, 12];
  const xPositions = new Array(ARRAY_SIZE);
  for (let i = 0; i < ARRAY_SIZE; i++)
    xPositions[i] = 0;
  xPositions[0] = rootX;
  for (let i = 1; i < HEAP_CAPACITY; i++) {
    const parent = Math.floor((i - 1) / 2);
    const depth = Math.floor(Math.log2(i + 1));
    const offset = offsetsByDepth[depth] || 0;
    const isRight = i % 2 === 0;
    xPositions[i] = xPositions[parent] + (isRight ? offset : -offset);
  }
  return xPositions;
}
function buildHeapYPositions() {
  const yPositions = new Array(ARRAY_SIZE);
  for (let i = 0; i < ARRAY_SIZE; i++)
    yPositions[i] = 0;
  for (let i = 0; i < HEAP_CAPACITY; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    yPositions[i] = 120 + depth * 70;
  }
  return yPositions;
}
Heap.prototype.init = function(am) {
  var sc = Heap.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;
  const heapRootX = ARRAY_INITIAL_X + HEAP_ROOT_UNDER_ARRAY_INDEX * ARRAY_ELEM_WIDTH2;
  this.HeapXPositions = buildHeapXPositions(heapRootX);
  this.HeapYPositions = buildHeapYPositions();
  this.commands = [];
  this.createArray();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doRemove = function() {
    this.implementAction(this.removeSmallest.bind(this), "");
  };
  this.doBuildHeap = function() {
    this.implementAction(this.buildHeap.bind(this), "");
  };
};
Heap.prototype.addControls = function() {
  this.insertField = addControlToAlgorithmBar("Text", "");
  this.insertField.setAttribute("placeholder", "Value to insert");
  this.insertField.onkeydown = this.returnSubmit(
    this.insertField,
    this.insertCallback.bind(this),
    4,
    true
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.removeSmallestButton = addControlToAlgorithmBar(
    "Button",
    "Remove Smallest"
  );
  this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
  this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
  this.clearHeapButton.onclick = this.clearCallback.bind(this);
  this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
  this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
};
Heap.prototype.createArray = function() {
  this.arrayData = new Array(ARRAY_SIZE);
  this.arrayLabels = new Array(ARRAY_SIZE);
  this.arrayRects = new Array(ARRAY_SIZE);
  this.circleObjs = new Array(ARRAY_SIZE);
  this.ArrayXPositions = new Array(ARRAY_SIZE);
  this.currentHeapSize = 0;
  for (var i = 0; i < ARRAY_SIZE; i++) {
    this.ArrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH2;
    this.arrayLabels[i] = this.nextIndex++;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      "",
      ARRAY_ELEM_WIDTH2,
      ARRAY_ELEM_HEIGHT2,
      this.ArrayXPositions[i],
      ARRAY_Y_POS
    );
    this.cmd(
      "CreateLabel",
      this.arrayLabels[i],
      i,
      this.ArrayXPositions[i],
      ARRAY_LABEL_Y_POS
    );
    this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
  }
  this.cmd("SetText", this.arrayRects[0], "");
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    this.descriptLabel1,
    "",
    ARRAY_INITIAL_X - ARRAY_ELEM_WIDTH2 / 2,
    10,
    0
  );
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
Heap.prototype.insertCallback = function(event) {
  var insertedValue;
  insertedValue = this.normalizeNumber(this.insertField.value, 4);
  if (insertedValue != "") {
    this.insertField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
Heap.prototype.clearCallback = function(event) {
  this.commands = new Array();
  this.implementAction(this.clear.bind(this), "");
};
Heap.prototype.clear = function() {
  for (let i = 0; i < this.currentHeapSize; i++) {
    this.cmd("Delete", this.circleObjs[i]);
    this.cmd("SetText", this.arrayRects[i], "");
  }
  this.currentHeapSize = 0;
  return this.commands;
};
Heap.prototype.reset = function() {
  this.currentHeapSize = 0;
};
Heap.prototype.removeSmallestCallback = function(event) {
  this.implementAction(this.removeSmallest.bind(this), "");
};
Heap.prototype.swap = function(index1, index2) {
  this.cmd("SetText", this.arrayRects[index1], "");
  this.cmd("SetText", this.arrayRects[index2], "");
  this.cmd("SetText", this.circleObjs[index1], "");
  this.cmd("SetText", this.circleObjs[index2], "");
  this.cmd(
    "CreateLabel",
    this.swapLabel1,
    this.arrayData[index1],
    this.ArrayXPositions[index1],
    ARRAY_Y_POS
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel2,
    this.arrayData[index2],
    this.ArrayXPositions[index2],
    ARRAY_Y_POS
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel3,
    this.arrayData[index1],
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel4,
    this.arrayData[index2],
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2], ARRAY_Y_POS);
  this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1], ARRAY_Y_POS);
  this.cmd(
    "Move",
    this.swapLabel3,
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd(
    "Move",
    this.swapLabel4,
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  var tmp = this.arrayData[index1];
  this.arrayData[index1] = this.arrayData[index2];
  this.arrayData[index2] = tmp;
  this.cmd("Step");
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};
Heap.prototype.setIndexHighlight = function(index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};
Heap.prototype.pushDown = function(index, narrateComparisons) {
  var smallestIndex;
  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if (narrateComparisons) {
      this.cmd("SetMessage", "Heapifying down at index " + index);
      this.setIndexHighlight(index, 1);
      this.cmd("Step");
    }
    this.setIndexHighlight(index, 0);
    if (left >= this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd("SetMessage", "No children: value is in its final location");
        this.cmd("Step");
      }
      return;
    }
    smallestIndex = left;
    if (right < this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Compare left and right children to find the smaller child"
        );
      }
      this.setIndexHighlight(left, 1);
      this.setIndexHighlight(right, 1);
      this.cmd("Step");
      this.setIndexHighlight(left, 0);
      this.setIndexHighlight(right, 0);
      if (Number(this.arrayData[right]) < Number(this.arrayData[left])) {
        smallestIndex = right;
      }
    }
    if (narrateComparisons) {
      this.cmd(
        "SetMessage",
        "Compare the current value with the smaller child"
      );
    }
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(smallestIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(smallestIndex, 0);
    if (Number(this.arrayData[smallestIndex]) < Number(this.arrayData[index])) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Child is smaller than current: swap and continue pushing down"
        );
      }
      this.swap(smallestIndex, index);
      index = smallestIndex;
    } else {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Current value is <= its children: heap order restored"
        );
      }
      return;
    }
  }
};
Heap.prototype.removeSmallest = function(dummy) {
  this.commands = new Array();
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Remove smallest (min): check if heap is empty");
  if (this.currentHeapSize == 0) {
    this.cmd(
      "SetText",
      this.descriptLabel1,
      "Heap is empty, cannot remove smallest element"
    );
    this.cmd("SetMessage", "Heap is empty; nothing to remove");
    return this.commands;
  }
  this.cmd("SetMessage", "Smallest element is at the root");
  this.cmd("SetText", this.descriptLabel1, "Removing element:" + this.arrayData[0]);
  this.cmd("Step");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Removing element: " + this.arrayData[0]
  );
  if (this.currentHeapSize > 1) {
    const lastIndex = this.currentHeapSize - 1;
    this.cmd("SetMessage", "Move last element to the root");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.swap(0, lastIndex);
    this.cmd("SetMessage", "Remove the last value (the old max)");
    this.cmd("Delete", this.circleObjs[lastIndex]);
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.arrayData[lastIndex] = "";
    this.currentHeapSize--;
    this.cmd("Step");
    this.cmd("SetMessage", "Push down to restore heap order");
    this.pushDown(0, true);
  } else {
    this.cmd("SetMessage", "Heap had one element; delete it");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("Delete", this.circleObjs[0]);
    this.arrayData[0] = "";
    this.currentHeapSize--;
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
Heap.prototype.buildHeapCallback = function(event) {
  this.implementAction(this.buildHeap.bind(this), "");
};
Heap.prototype.buildHeap = function(ignored) {
  this.commands = [];
  this.clear();
  for (var i = 0; i < HEAP_CAPACITY; i++) {
    const randVal = Math.floor(Math.random() * 100) + 1;
    this.arrayData[i] = this.normalizeNumber(String(randVal), 4);
    this.cmd(
      "CreateCircle",
      this.circleObjs[i],
      this.arrayData[i],
      this.HeapXPositions[i],
      this.HeapYPositions[i]
    );
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    if (i > 0) {
      this.cmd(
        "Connect",
        this.circleObjs[Math.floor((i - 1) / 2)],
        this.circleObjs[i]
      );
    }
  }
  this.cmd("Step");
  this.currentHeapSize = HEAP_CAPACITY;
  var nextElem = this.currentHeapSize - 1;
  while (nextElem >= 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};
Heap.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  if (this.currentHeapSize >= HEAP_CAPACITY) {
    this.cmd("SetText", this.descriptLabel1, "Heap Full!");
    this.cmd("SetMessage", "Heap is full; cannot insert");
    return this.commands;
  }
  this.cmd("SetMessage", "Insert: place new value at the next open spot");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Inserting Element: " + insertedValue
  );
  this.cmd("Step");
  this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
  const insertIndex = this.currentHeapSize;
  this.currentHeapSize++;
  this.arrayData[insertIndex] = insertedValue;
  this.cmd(
    "CreateCircle",
    this.circleObjs[insertIndex],
    "",
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex]
  );
  this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45, 1);
  if (insertIndex > 0) {
    this.cmd(
      "Connect",
      this.circleObjs[Math.floor((insertIndex - 1) / 2)],
      this.circleObjs[insertIndex]
    );
  }
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);
  this.cmd(
    "Move",
    this.descriptLabel2,
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex]
  );
  this.cmd("Step");
  this.cmd("SetText", this.circleObjs[insertIndex], insertedValue);
  this.cmd("delete", this.descriptLabel2);
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);
  var currentIndex = insertIndex;
  var parentIndex = Math.floor((currentIndex - 1) / 2);
  if (currentIndex > 0) {
    this.cmd("SetMessage", "Compare with parent");
    this.setIndexHighlight(currentIndex, 1);
    this.setIndexHighlight(parentIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(currentIndex, 0);
    this.setIndexHighlight(parentIndex, 0);
  }
  while (currentIndex > 0 && Number(this.arrayData[currentIndex]) < Number(this.arrayData[parentIndex])) {
    this.cmd("SetMessage", "Swap with parent to restore heap order");
    this.swap(currentIndex, parentIndex);
    currentIndex = parentIndex;
    parentIndex = Math.floor((parentIndex - 1) / 2);
    if (currentIndex > 0) {
      this.cmd("SetMessage", "Compare with parent");
      this.setIndexHighlight(currentIndex, 1);
      this.setIndexHighlight(parentIndex, 1);
      this.cmd("Step");
      this.setIndexHighlight(currentIndex, 0);
      this.setIndexHighlight(parentIndex, 0);
    }
  }
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Insertion complete");
  return this.commands;
};
Heap.prototype.disableUI = function(event) {
  this.insertField.disabled = true;
  this.insertButton.disabled = true;
  this.removeSmallestButton.disabled = true;
  this.clearHeapButton.disabled = true;
  this.buildHeapButton.disabled = true;
};
Heap.prototype.enableUI = function(event) {
  this.insertField.disabled = false;
  this.insertButton.disabled = false;
  this.removeSmallestButton.disabled = false;
  this.clearHeapButton.disabled = false;
  this.buildHeapButton.disabled = false;
};

// AlgorithmLibrary/HeapMax.js
function HeapMax(arg) {
  let am;
  const opts = arg || {};
  am = initAnimationManager({
    title: opts.title || "Max Heap",
    height: opts.height || 500,
    ...opts
  });
  this.init(am);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
HeapMax.prototype = new Algorithm();
HeapMax.prototype.constructor = HeapMax;
HeapMax.superclass = Algorithm.prototype;
var ARRAY_SIZE2 = 15;
var ARRAY_ELEM_WIDTH3 = 30;
var ARRAY_ELEM_HEIGHT3 = 25;
var ARRAY_INITIAL_X2 = 30;
var HEAP_CAPACITY2 = ARRAY_SIZE2;
var ARRAY_Y_POS2 = 50;
var ARRAY_LABEL_Y_POS2 = 70;
var HEAP_ROOT_UNDER_ARRAY_INDEX2 = 7;
function buildHeapXPositions2(rootX) {
  const offsetsByDepth = [0, 96, 48, 24, 12];
  const xPositions = new Array(ARRAY_SIZE2);
  for (let i = 0; i < ARRAY_SIZE2; i++)
    xPositions[i] = 0;
  xPositions[0] = rootX;
  for (let i = 1; i < HEAP_CAPACITY2; i++) {
    const parent = Math.floor((i - 1) / 2);
    const depth = Math.floor(Math.log2(i + 1));
    const offset = offsetsByDepth[depth] || 0;
    const isRight = i % 2 === 0;
    xPositions[i] = xPositions[parent] + (isRight ? offset : -offset);
  }
  return xPositions;
}
function buildHeapYPositions2() {
  const yPositions = new Array(ARRAY_SIZE2);
  for (let i = 0; i < ARRAY_SIZE2; i++)
    yPositions[i] = 0;
  for (let i = 0; i < HEAP_CAPACITY2; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    yPositions[i] = 120 + depth * 70;
  }
  return yPositions;
}
HeapMax.prototype.init = function(am) {
  var sc = HeapMax.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;
  const heapRootX = ARRAY_INITIAL_X2 + HEAP_ROOT_UNDER_ARRAY_INDEX2 * ARRAY_ELEM_WIDTH3;
  this.HeapXPositions = buildHeapXPositions2(heapRootX);
  this.HeapYPositions = buildHeapYPositions2();
  this.commands = [];
  this.createArray();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doRemove = function() {
    this.implementAction(this.removeLargest.bind(this), "");
  };
  this.doBuildHeap = function() {
    this.implementAction(this.buildHeap.bind(this), "");
  };
};
HeapMax.prototype.addControls = function() {
  this.insertField = addControlToAlgorithmBar("Text", "");
  this.insertField.setAttribute("placeholder", "Value to insert");
  this.insertField.onkeydown = this.returnSubmit(
    this.insertField,
    this.insertCallback.bind(this),
    4,
    true
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.removeLargestButton = addControlToAlgorithmBar(
    "Button",
    "Remove Max"
  );
  this.removeLargestButton.onclick = this.removeLargestCallback.bind(this);
  this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
  this.clearHeapButton.onclick = this.clearCallback.bind(this);
  this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
  this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
};
HeapMax.prototype.createArray = function() {
  this.arrayData = new Array(ARRAY_SIZE2);
  this.arrayLabels = new Array(ARRAY_SIZE2);
  this.arrayRects = new Array(ARRAY_SIZE2);
  this.circleObjs = new Array(ARRAY_SIZE2);
  this.ArrayXPositions = new Array(ARRAY_SIZE2);
  this.currentHeapSize = 0;
  for (var i = 0; i < ARRAY_SIZE2; i++) {
    this.ArrayXPositions[i] = ARRAY_INITIAL_X2 + i * ARRAY_ELEM_WIDTH3;
    this.arrayLabels[i] = this.nextIndex++;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      "",
      ARRAY_ELEM_WIDTH3,
      ARRAY_ELEM_HEIGHT3,
      this.ArrayXPositions[i],
      ARRAY_Y_POS2
    );
    this.cmd(
      "CreateLabel",
      this.arrayLabels[i],
      i,
      this.ArrayXPositions[i],
      ARRAY_LABEL_Y_POS2
    );
    this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
  }
  this.cmd("SetText", this.arrayRects[0], "");
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  this.cmd(
    "CreateLabel",
    this.descriptLabel1,
    "",
    ARRAY_INITIAL_X2 - ARRAY_ELEM_WIDTH3 / 2,
    10,
    0
  );
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
HeapMax.prototype.insertCallback = function(event) {
  var insertedValue;
  insertedValue = this.normalizeNumber(this.insertField.value, 4);
  if (insertedValue != "") {
    this.insertField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
HeapMax.prototype.clearCallback = function(event) {
  this.commands = new Array();
  this.implementAction(this.clear.bind(this), "");
};
HeapMax.prototype.clear = function() {
  for (let i = 0; i < this.currentHeapSize; i++) {
    this.cmd("Delete", this.circleObjs[i]);
    this.cmd("SetText", this.arrayRects[i], "");
  }
  this.currentHeapSize = 0;
  return this.commands;
};
HeapMax.prototype.reset = function() {
  this.currentHeapSize = 0;
};
HeapMax.prototype.removeLargestCallback = function(event) {
  this.implementAction(this.removeLargest.bind(this), "");
};
HeapMax.prototype.swap = function(index1, index2) {
  this.cmd("SetText", this.arrayRects[index1], "");
  this.cmd("SetText", this.arrayRects[index2], "");
  this.cmd("SetText", this.circleObjs[index1], "");
  this.cmd("SetText", this.circleObjs[index2], "");
  this.cmd(
    "CreateLabel",
    this.swapLabel1,
    this.arrayData[index1],
    this.ArrayXPositions[index1],
    ARRAY_Y_POS2
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel2,
    this.arrayData[index2],
    this.ArrayXPositions[index2],
    ARRAY_Y_POS2
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel3,
    this.arrayData[index1],
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel4,
    this.arrayData[index2],
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2], ARRAY_Y_POS2);
  this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1], ARRAY_Y_POS2);
  this.cmd(
    "Move",
    this.swapLabel3,
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd(
    "Move",
    this.swapLabel4,
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  var tmp = this.arrayData[index1];
  this.arrayData[index1] = this.arrayData[index2];
  this.arrayData[index2] = tmp;
  this.cmd("Step");
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};
HeapMax.prototype.setIndexHighlight = function(index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};
HeapMax.prototype.pushDown = function(index, narrateComparisons) {
  var largestIndex;
  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if (narrateComparisons) {
      this.cmd("SetMessage", "Heapifying down at index " + index);
      this.setIndexHighlight(index, 1);
      this.cmd("Step");
    }
    this.setIndexHighlight(index, 0);
    if (left >= this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd("SetMessage", "No children: value is in its final location");
        this.cmd("Step");
      }
      return;
    }
    largestIndex = left;
    if (right < this.currentHeapSize) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Compare left and right children to find the larger child"
        );
      }
      this.setIndexHighlight(left, 1);
      this.setIndexHighlight(right, 1);
      this.cmd("Step");
      this.setIndexHighlight(left, 0);
      this.setIndexHighlight(right, 0);
      if (Number(this.arrayData[right]) > Number(this.arrayData[left])) {
        largestIndex = right;
      }
    }
    if (narrateComparisons) {
      this.cmd(
        "SetMessage",
        "Compare the current value with the larger child"
      );
    }
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(largestIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(largestIndex, 0);
    if (Number(this.arrayData[largestIndex]) > Number(this.arrayData[index])) {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Child is larger than current: swap and continue pushing down"
        );
      }
      this.swap(largestIndex, index);
      index = largestIndex;
    } else {
      if (narrateComparisons) {
        this.cmd(
          "SetMessage",
          "Current value is >= its children: heap order restored"
        );
      }
      return;
    }
  }
};
HeapMax.prototype.removeLargest = function(dummy) {
  this.commands = new Array();
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Remove largest (max): check if heap is empty");
  if (this.currentHeapSize == 0) {
    this.cmd(
      "SetText",
      this.descriptLabel1,
      "Heap is empty, cannot remove largest element"
    );
    this.cmd("SetMessage", "Heap is empty; nothing to remove");
    return this.commands;
  }
  this.cmd("SetMessage", "Largest element is at the root");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Removing element:" + this.arrayData[0]
  );
  this.cmd("Step");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Removing element: " + this.arrayData[0]
  );
  if (this.currentHeapSize > 1) {
    const lastIndex = this.currentHeapSize - 1;
    this.cmd("SetMessage", "Move last element to the root");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.swap(0, lastIndex);
    this.cmd("SetMessage", "Delete the old last node");
    this.cmd("Delete", this.circleObjs[lastIndex]);
    this.cmd("SetText", this.arrayRects[lastIndex], "");
    this.arrayData[lastIndex] = "";
    this.currentHeapSize--;
    this.cmd("Step");
    this.cmd("SetMessage", "Push down to restore heap order");
    this.pushDown(0, true);
  } else {
    this.cmd("SetMessage", "Heap had one element; delete it");
    this.cmd("SetText", this.arrayRects[0], "");
    this.cmd("Delete", this.circleObjs[0]);
    this.arrayData[0] = "";
    this.currentHeapSize--;
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
HeapMax.prototype.buildHeapCallback = function(event) {
  this.implementAction(this.buildHeap.bind(this), "");
};
HeapMax.prototype.buildHeap = function(ignored) {
  this.commands = [];
  this.clear();
  for (var i = 0; i < HEAP_CAPACITY2; i++) {
    const randVal = Math.floor(Math.random() * 100) + 1;
    this.arrayData[i] = this.normalizeNumber(String(randVal), 4);
    this.cmd(
      "CreateCircle",
      this.circleObjs[i],
      this.arrayData[i],
      this.HeapXPositions[i],
      this.HeapYPositions[i]
    );
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    if (i > 0) {
      this.cmd(
        "Connect",
        this.circleObjs[Math.floor((i - 1) / 2)],
        this.circleObjs[i]
      );
    }
  }
  this.cmd("Step");
  this.currentHeapSize = HEAP_CAPACITY2;
  var nextElem = this.currentHeapSize - 1;
  while (nextElem >= 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};
HeapMax.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  if (this.currentHeapSize >= HEAP_CAPACITY2) {
    this.cmd("SetText", this.descriptLabel1, "Heap Full!");
    this.cmd("SetMessage", "Heap is full; cannot insert");
    return this.commands;
  }
  this.cmd("SetMessage", "Insert: place new value at the next open spot");
  this.cmd(
    "SetText",
    this.descriptLabel1,
    "Inserting Element: " + insertedValue
  );
  this.cmd("Step");
  this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
  const insertIndex = this.currentHeapSize;
  this.currentHeapSize++;
  this.arrayData[insertIndex] = insertedValue;
  this.cmd(
    "CreateCircle",
    this.circleObjs[insertIndex],
    "",
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex]
  );
  this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45, 1);
  if (insertIndex > 0) {
    this.cmd(
      "Connect",
      this.circleObjs[Math.floor((insertIndex - 1) / 2)],
      this.circleObjs[insertIndex]
    );
  }
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);
  this.cmd(
    "Move",
    this.descriptLabel2,
    this.HeapXPositions[insertIndex],
    this.HeapYPositions[insertIndex]
  );
  this.cmd("Step");
  this.cmd("SetText", this.circleObjs[insertIndex], insertedValue);
  this.cmd("delete", this.descriptLabel2);
  this.cmd("SetText", this.arrayRects[insertIndex], insertedValue);
  var currentIndex = insertIndex;
  var parentIndex = Math.floor((currentIndex - 1) / 2);
  if (currentIndex > 0) {
    this.cmd("SetMessage", "Compare with parent");
    this.setIndexHighlight(currentIndex, 1);
    this.setIndexHighlight(parentIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(currentIndex, 0);
    this.setIndexHighlight(parentIndex, 0);
  }
  while (currentIndex > 0 && Number(this.arrayData[currentIndex]) > Number(this.arrayData[parentIndex])) {
    this.cmd("SetMessage", "Swap with parent to restore heap order");
    this.swap(currentIndex, parentIndex);
    currentIndex = parentIndex;
    parentIndex = Math.floor((parentIndex - 1) / 2);
    if (currentIndex > 0) {
      this.cmd("SetMessage", "Compare with parent");
      this.setIndexHighlight(currentIndex, 1);
      this.setIndexHighlight(parentIndex, 1);
      this.cmd("Step");
      this.setIndexHighlight(currentIndex, 0);
      this.setIndexHighlight(parentIndex, 0);
    }
  }
  this.cmd("SetText", this.descriptLabel1, "");
  this.cmd("SetMessage", "Insertion complete");
  return this.commands;
};
HeapMax.prototype.disableUI = function(event) {
  this.insertField.disabled = true;
  this.insertButton.disabled = true;
  this.removeLargestButton.disabled = true;
  this.clearHeapButton.disabled = true;
  this.buildHeapButton.disabled = true;
};
HeapMax.prototype.enableUI = function(event) {
  this.insertField.disabled = false;
  this.insertButton.disabled = false;
  this.removeLargestButton.disabled = false;
  this.clearHeapButton.disabled = false;
  this.buildHeapButton.disabled = false;
};

// AlgorithmLibrary/HeapSort.js
function HeapSort(arg) {
  let am;
  if (arg && typeof arg.getContext === "function") {
    am = initCanvas2(arg);
  } else {
    const opts = arg || {};
    am = initAnimationManager({
      title: opts.title || "Heap Sort",
      height: opts.height || 500,
      ...opts
    });
  }
  this.init(am);
}
HeapSort.prototype = new Algorithm();
HeapSort.prototype.constructor = HeapSort;
HeapSort.superclass = Algorithm.prototype;
var ARRAY_SIZE3 = 15;
var ARRAY_ELEM_WIDTH4 = 30;
var ARRAY_ELEM_HEIGHT4 = 25;
var ARRAY_INITIAL_X3 = 30;
var ARRAY_Y_POS3 = 50;
var ARRAY_LABEL_Y_POS3 = 70;
var DEFAULT_ARRAY_BACKGROUND = "#FFFFFF";
var SORTED_ARRAY_BACKGROUND = "#bdbdbdff";
var HEAP_CAPACITY3 = ARRAY_SIZE3;
var HEAP_ROOT_UNDER_ARRAY_INDEX3 = 7;
function buildHeapXPositions3(rootX) {
  const offsetsByDepth = [0, 96, 48, 24, 12];
  const xPositions = new Array(ARRAY_SIZE3);
  for (let i = 0; i < ARRAY_SIZE3; i++)
    xPositions[i] = 0;
  xPositions[0] = rootX;
  for (let i = 1; i < HEAP_CAPACITY3; i++) {
    const parent = Math.floor((i - 1) / 2);
    const depth = Math.floor(Math.log2(i + 1));
    const offset = offsetsByDepth[depth] || 0;
    const isRight = i % 2 === 0;
    xPositions[i] = xPositions[parent] + (isRight ? offset : -offset);
  }
  return xPositions;
}
function buildHeapYPositions3() {
  const yPositions = new Array(ARRAY_SIZE3);
  for (let i = 0; i < ARRAY_SIZE3; i++)
    yPositions[i] = 0;
  for (let i = 0; i < HEAP_CAPACITY3; i++) {
    const depth = Math.floor(Math.log2(i + 1));
    yPositions[i] = 120 + depth * 70;
  }
  return yPositions;
}
HeapSort.prototype.init = function(am) {
  var sc = HeapSort.superclass;
  var fn = sc.init;
  fn.call(this, am);
  this.addControls();
  this.nextIndex = 0;
  const heapRootX = ARRAY_INITIAL_X3 + HEAP_ROOT_UNDER_ARRAY_INDEX3 * ARRAY_ELEM_WIDTH4;
  this.HeapXPositions = buildHeapXPositions3(heapRootX);
  this.HeapYPositions = buildHeapYPositions3();
  this.commands = [];
  this.createArray();
  this.doHeapify = function() {
    this.implementAction(this.heapify.bind(this), "");
  };
  this.doSort = function() {
    this.implementAction(this.heapsort.bind(this), "");
  };
  this.isHeapified = false;
  this.heapsortButton.disabled = true;
};
HeapSort.prototype.addControls = function() {
  this.randomizeArrayButton = addControlToAlgorithmBar(
    "Button",
    "Randomize Array"
  );
  this.randomizeArrayButton.onclick = this.randomizeCallback.bind(this);
  this.heapifyButton = addControlToAlgorithmBar("Button", "Heapify");
  this.heapifyButton.onclick = this.heapifyCallback.bind(this);
  this.heapsortButton = addControlToAlgorithmBar("Button", "Heap Sort");
  this.heapsortButton.onclick = this.heapsortCallback.bind(this);
};
HeapSort.prototype.createArray = function() {
  this.arrayData = new Array(ARRAY_SIZE3);
  this.arrayLabels = new Array(ARRAY_SIZE3);
  this.arrayRects = new Array(ARRAY_SIZE3);
  this.circleObjs = new Array(ARRAY_SIZE3);
  this.ArrayXPositions = new Array(ARRAY_SIZE3);
  this.oldData = new Array(ARRAY_SIZE3);
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.oldData[i] = this.arrayData[i];
    this.ArrayXPositions[i] = ARRAY_INITIAL_X3 + i * ARRAY_ELEM_WIDTH4;
    this.arrayLabels[i] = this.nextIndex++;
    this.arrayRects[i] = this.nextIndex++;
    this.circleObjs[i] = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      this.arrayRects[i],
      this.arrayData[i],
      ARRAY_ELEM_WIDTH4,
      ARRAY_ELEM_HEIGHT4,
      this.ArrayXPositions[i],
      ARRAY_Y_POS3
    );
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
    this.cmd(
      "CreateLabel",
      this.arrayLabels[i],
      i,
      this.ArrayXPositions[i],
      ARRAY_LABEL_Y_POS3
    );
    this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
  }
  this.swapLabel1 = this.nextIndex++;
  this.swapLabel2 = this.nextIndex++;
  this.swapLabel3 = this.nextIndex++;
  this.swapLabel4 = this.nextIndex++;
  this.descriptLabel1 = this.nextIndex++;
  this.descriptLabel2 = this.nextIndex++;
  this.cmd("CreateLabel", this.descriptLabel1, "", 20, 40, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
HeapSort.prototype.heapsortCallback = function(event) {
  this.implementAction(this.heapsort.bind(this), "");
};
HeapSort.prototype.heapifyCallback = function(event) {
  this.implementAction(this.heapify.bind(this), "");
};
HeapSort.prototype.randomizeCallback = function(ignored) {
  this.implementAction(this.randomizeArray.bind(this), "");
};
HeapSort.prototype.randomizeArray = function() {
  this.commands = new Array();
  this.clearHeapDrawing();
  this.isHeapified = false;
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.arrayData[i] = Math.floor(1 + Math.random() * 999);
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
    this.oldData[i] = this.arrayData[i];
  }
  return this.commands;
};
HeapSort.prototype.reset = function() {
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.arrayData[i] = this.oldData[i];
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
  }
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;
  this.commands = new Array();
};
HeapSort.prototype.heapsort = function(ignored) {
  this.commands = new Array();
  if (!this.isHeapified) {
    this.cmd(
      "SetMessage",
      "Heap Sort is disabled until the array is heapified."
    );
    return this.commands;
  }
  for (var a = 0; a < ARRAY_SIZE3; a++) {
    this.cmd("SetAlpha", this.arrayRects[a], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[a], DEFAULT_ARRAY_BACKGROUND);
  }
  this.cmd("SetMessage", "Starting heapsort...");
  this.cmd("Step");
  for (var i = ARRAY_SIZE3 - 1; i > 0; i--) {
    this.cmd("SetMessage", "Removing max value");
    this.cmd("Step");
    this.swap(i, 0);
    this.cmd("SetMessage", "Reduce logical heap size by 1");
    this.cmd("SetBackgroundColor", this.arrayRects[i], SORTED_ARRAY_BACKGROUND);
    this.cmd("Delete", this.circleObjs[i]);
    this.currentHeapSize = i;
    this.cmd("Step");
    this.pushDown(0);
  }
  this.cmd("SetBackgroundColor", this.arrayRects[0], SORTED_ARRAY_BACKGROUND);
  this.cmd("Delete", this.circleObjs[0]);
  this.currentHeapSize = 0;
  this.heapDrawn = false;
  this.isHeapified = false;
  return this.commands;
};
HeapSort.prototype.heapify = function(ignored) {
  this.commands = new Array();
  this.clearHeapDrawing();
  this.isHeapified = false;
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.cmd("SetAlpha", this.arrayRects[i], 1);
    this.cmd("SetBackgroundColor", this.arrayRects[i], DEFAULT_ARRAY_BACKGROUND);
  }
  this.buildHeap("");
  this.cmd("SetMessage", "Heapify complete: array now satisfies heap order");
  this.isHeapified = true;
  return this.commands;
};
HeapSort.prototype.clearHeapDrawing = function() {
  if (!this.heapDrawn) {
    this.currentHeapSize = 0;
    return;
  }
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.cmd("Delete", this.circleObjs[i]);
  }
  this.currentHeapSize = 0;
  this.heapDrawn = false;
};
HeapSort.prototype.swap = function(index1, index2) {
  this.cmd("SetText", this.arrayRects[index1], "");
  this.cmd("SetText", this.arrayRects[index2], "");
  this.cmd("SetText", this.circleObjs[index1], "");
  this.cmd("SetText", this.circleObjs[index2], "");
  this.cmd(
    "CreateLabel",
    this.swapLabel1,
    this.arrayData[index1],
    this.ArrayXPositions[index1],
    ARRAY_Y_POS3
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel2,
    this.arrayData[index2],
    this.ArrayXPositions[index2],
    ARRAY_Y_POS3
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel3,
    this.arrayData[index1],
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  this.cmd(
    "CreateLabel",
    this.swapLabel4,
    this.arrayData[index2],
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2], ARRAY_Y_POS3);
  this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1], ARRAY_Y_POS3);
  this.cmd(
    "Move",
    this.swapLabel3,
    this.HeapXPositions[index2],
    this.HeapYPositions[index2]
  );
  this.cmd(
    "Move",
    this.swapLabel4,
    this.HeapXPositions[index1],
    this.HeapYPositions[index1]
  );
  var tmp = this.arrayData[index1];
  this.arrayData[index1] = this.arrayData[index2];
  this.arrayData[index2] = tmp;
  this.cmd(
    "SetMessage",
    "Swap: values between indices " + index1 + " and " + index2
  );
  this.cmd("Step");
  this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
  this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
  this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
  this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
  this.cmd("Delete", this.swapLabel1);
  this.cmd("Delete", this.swapLabel2);
  this.cmd("Delete", this.swapLabel3);
  this.cmd("Delete", this.swapLabel4);
};
HeapSort.prototype.setIndexHighlight = function(index, highlightVal) {
  this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
  this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
};
HeapSort.prototype.pushDown = function(index) {
  var largestIndex;
  while (true) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    if (left >= this.currentHeapSize) {
      return;
    }
    this.cmd(
      "SetMessage",
      "Heapify down at " + index
    );
    this.setIndexHighlight(index, 1);
    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    largestIndex = left;
    if (right < this.currentHeapSize) {
      this.cmd(
        "SetMessage",
        "Heapify down: compare left and right children to choose the larger child"
      );
      this.setIndexHighlight(left, 1);
      this.setIndexHighlight(right, 1);
      this.cmd("Step");
      this.setIndexHighlight(left, 0);
      this.setIndexHighlight(right, 0);
      if (this.arrayData[right] > this.arrayData[left]) {
        largestIndex = right;
      }
    }
    this.cmd(
      "SetMessage",
      "Heapify down: compare current node with selected child"
    );
    this.setIndexHighlight(index, 1);
    this.setIndexHighlight(largestIndex, 1);
    this.cmd("Step");
    this.setIndexHighlight(index, 0);
    this.setIndexHighlight(largestIndex, 0);
    if (this.arrayData[largestIndex] > this.arrayData[index]) {
      this.swap(largestIndex, index);
      index = largestIndex;
    } else {
      return;
    }
  }
};
HeapSort.prototype.buildHeap = function(ignored) {
  for (var i = 0; i < ARRAY_SIZE3; i++) {
    this.cmd(
      "CreateCircle",
      this.circleObjs[i],
      this.arrayData[i],
      this.HeapXPositions[i],
      this.HeapYPositions[i]
    );
    this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
    if (i > 0) {
      this.cmd(
        "Connect",
        this.circleObjs[Math.floor((i - 1) / 2)],
        this.circleObjs[i]
      );
    }
  }
  this.currentHeapSize = ARRAY_SIZE3;
  var nextElem = Math.floor((this.currentHeapSize - 2) / 2);
  this.cmd(
    "SetMessage",
    "Heapify: Calculate parent index of last element: " + nextElem
  );
  this.cmd("Step");
  this.heapDrawn = true;
  while (nextElem >= 0) {
    this.pushDown(nextElem);
    nextElem = nextElem - 1;
  }
  return this.commands;
};
HeapSort.prototype.disableUI = function(event) {
  this.heapsortButton.disabled = true;
  this.randomizeArrayButton.disabled = true;
  this.heapifyButton.disabled = true;
};
HeapSort.prototype.enableUI = function(event) {
  this.heapsortButton.disabled = !this.isHeapified;
  this.randomizeArrayButton.disabled = false;
  this.heapifyButton.disabled = false;
};

// AlgorithmLibrary/Kruskal.js
function Kruskal(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Kruskal MST", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Kruskal MST",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
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
Kruskal.prototype.addControls = function() {
  this.startButton = addControlToAlgorithmBar("Button", "Run Kruskal");
  this.startButton.onclick = this.startCallback.bind(this);
  Kruskal.superclass.addControls.call(this, false);
};
Kruskal.prototype.init = function(am, w2, h, graphOpts) {
  this.showEdgeCosts = true;
  Kruskal.superclass.init.call(this, am, w2, h, false, false, graphOpts);
};
Kruskal.prototype.setup = function() {
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
      Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT
    );
    this.cmd(
      "CreateLabel",
      this.setIndexID[i],
      i,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT
    );
    this.cmd("SetForegroundColor", this.setIndexID[i], VERTEX_INDEX_COLOR);
  }
  this.cmd(
    "CreateLabel",
    this.nextIndex++,
    "Disjoint Set",
    Kruskal.SET_ARRAY_START_X - 1 * Kruskal.SET_ARRAY_ELEM_WIDTH,
    Kruskal.SET_ARRAY_START_Y - Kruskal.SET_ARRAY_ELEM_HEIGHT * 1.5,
    0
  );
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
Kruskal.prototype.startCallback = function(event) {
  this.implementAction(this.doKruskal.bind(this), "");
};
Kruskal.prototype.disjointSetFind = function(valueToFind, highlightCircleID) {
  this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
  this.cmd("Step");
  while (this.setData[valueToFind] >= 0) {
    this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
    this.cmd(
      "Move",
      highlightCircleID,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y + this.setData[valueToFind] * Kruskal.SET_ARRAY_ELEM_HEIGHT
    );
    this.cmd("Step");
    valueToFind = this.setData[valueToFind];
    this.cmd("SetTextColor", this.setID[valueToFind], "#FF0000");
    this.cmd("Step");
  }
  this.cmd("SetTextColor", this.setID[valueToFind], "#000000");
  return valueToFind;
};
Kruskal.prototype.doKruskal = function(ignored) {
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
          Kruskal.EDGE_LIST_START_X + Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
          Kruskal.EDGE_LIST_START_Y + top % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT
        );
        this.cmd(
          "CreateLabel",
          this.edgesListRightID[top],
          j,
          Kruskal.EDGE_LIST_START_X + Kruskal.EDGE_LIST_ELEM_WIDTH + Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
          Kruskal.EDGE_LIST_START_Y + top % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT
        );
        this.cmd(
          "Connect",
          this.edgesListLeftID[top],
          this.edgesListRightID[top],
          EDGE_COLOR,
          0,
          0,
          this.adj_matrix[i][j]
        );
      }
    }
  }
  this.cmd("SetMessage", "Created edge list from graph");
  this.cmd("Step");
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
    while (j > 0 && this.adj_matrix[this.edgesListLeft[j - 1]][this.edgesListRight[j - 1]] > this.adj_matrix[tmpLeft][tmpRight]) {
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
      Kruskal.EDGE_LIST_START_X + Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y + i % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT
    );
    this.cmd(
      "Move",
      this.edgesListRightID[i],
      Kruskal.EDGE_LIST_START_X + Kruskal.EDGE_LIST_ELEM_WIDTH + Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y + i % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT
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
    0
  );
  this.cmd(
    "CreateLabel",
    findLabelRight,
    "",
    Kruskal.FIND_LABEL_2_X,
    Kruskal.FIND_LABEL_2_Y,
    0
  );
  while (edgesAdded < this.size - 1 && nextListIndex < edgeCount) {
    const edgeU = this.edgesListLeft[nextListIndex];
    const edgeV = this.edgesListRight[nextListIndex];
    const edgeW = this.adj_matrix[edgeU][edgeV];
    this.cmd(
      "SetMessage",
      `Consider next cheapest edge (${edgeU}, ${edgeV}) with weight ${edgeW}`
    );
    this.cmd(
      "SetEdgeHighlight",
      this.edgesListLeftID[nextListIndex],
      this.edgesListRightID[nextListIndex],
      1
    );
    this.highlightEdge(edgeU, edgeV, 1);
    this.highlightEdge(edgeV, edgeU, 1);
    this.cmd(
      "SetText",
      findLabelLeft,
      "find(" + String(edgeU) + ") = "
    );
    this.cmd(
      "CreateHighlightCircle",
      highlightCircle1,
      Kruskal.HIGHLIGHT_CIRCLE_COLOR_1,
      Kruskal.EDGE_LIST_START_X + Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y + nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT,
      15
    );
    this.cmd(
      "Move",
      highlightCircle1,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y + edgeU * Kruskal.SET_ARRAY_ELEM_HEIGHT
    );
    this.cmd("SetMessage", `Find representative for ${edgeU}`);
    this.cmd("Step");
    var left = this.disjointSetFind(
      edgeU,
      highlightCircle1
    );
    this.cmd(
      "SetText",
      findLabelLeft,
      "find(" + String(edgeU) + ") = " + String(left)
    );
    this.cmd(
      "SetText",
      findLabelRight,
      "find(" + String(edgeV) + ") = "
    );
    this.cmd(
      "CreateHighlightCircle",
      highlightCircle2,
      Kruskal.HIGHLIGHT_CIRCLE_COLOR_2,
      Kruskal.EDGE_LIST_START_X + Kruskal.EDGE_LIST_ELEM_WIDTH + Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_COLUMN_WIDTH,
      Kruskal.EDGE_LIST_START_Y + nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN * Kruskal.EDGE_LIST_ELEM_HEIGHT,
      15
    );
    this.cmd(
      "Move",
      highlightCircle2,
      Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
      Kruskal.SET_ARRAY_START_Y + edgeV * Kruskal.SET_ARRAY_ELEM_HEIGHT
    );
    this.cmd("SetMessage", `Find representative for ${edgeV}`);
    this.cmd("Step");
    var right = this.disjointSetFind(
      edgeV,
      highlightCircle2
    );
    this.cmd(
      "SetText",
      findLabelRight,
      "find(" + String(edgeV) + ") = " + String(right)
    );
    this.cmd(
      "SetMessage",
      `Compare representatives: ${left} vs ${right}`
    );
    this.cmd("Step");
    if (left != right) {
      this.cmd(
        "SetMessage",
        `Different components. Add edge and union(${left}, ${right})`
      );
      this.cmd("Step");
      mstEdges.push([edgeU, edgeV]);
      this.highlightEdge(edgeU, edgeV, 1);
      this.highlightEdge(edgeV, edgeU, 1);
      edgesAdded++;
      this.setEdgeColor(
        edgeU,
        edgeV,
        "#FF0000"
      );
      this.setEdgeColor(
        edgeV,
        edgeU,
        "#FF0000"
      );
      if (this.setData[left] < this.setData[right]) {
        this.cmd("SetText", this.setID[right], "");
        this.cmd(
          "CreateLabel",
          moveLabelID,
          this.setData[right],
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT
        );
        this.cmd(
          "Move",
          moveLabelID,
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT
        );
        this.cmd(
          "SetMessage",
          `Union by size: attach root ${right} under root ${left}`
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
          Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT
        );
        this.cmd(
          "Move",
          moveLabelID,
          Kruskal.SET_ARRAY_START_X,
          Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT
        );
        this.cmd(
          "SetMessage",
          `Union by size: attach root ${left} under root ${right}`
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
        "Vertices already in the same component. Skip edge to avoid cycle"
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
Kruskal.prototype.reset = function() {
  this.messageID = new Array();
};
Kruskal.prototype.enableUI = function(event) {
  this.startButton.disabled = false;
  Kruskal.superclass.enableUI.call(this, event);
};
Kruskal.prototype.disableUI = function(event) {
  this.startButton.disabled = true;
  Kruskal.superclass.disableUI.call(this, event);
};

// AlgorithmLibrary/LinkedList.js
var LINKED_LIST_START_X = 100;
var LINKED_LIST_START_Y = 150;
var LINKED_LIST_ELEM_WIDTH = 50;
var LINKED_LIST_ELEM_HEIGHT = 25;
var LINKED_LIST_ELEMS_PER_LINE = 10;
var LINKED_LIST_ELEM_SPACING = 70;
var LINKED_LIST_LINE_SPACING = 100;
var TOP_POS_X = 70;
var TOP_POS_Y = 50;
var TOP_LABEL_X = TOP_POS_X;
var TOP_LABEL_Y = 25;
var TOP_ELEM_WIDTH = 40;
var TOP_ELEM_HEIGHT = 25;
var TAIL_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 2;
var TAIL_LABEL_X = TAIL_POS_X;
var TEMP_POS_X = TOP_POS_X + TOP_ELEM_WIDTH * 4;
var TEMP_LABEL_X = TEMP_POS_X;
var TEMP_POS_Y = LINKED_LIST_START_Y + 100;
var TEMP_LABEL_Y = TEMP_POS_Y - 25;
var ACTION_LABEL_X = TAIL_POS_X + TOP_ELEM_WIDTH * 3;
var ACTION_LABEL_Y = 25;
var ACTION_ELEMENT_X = ACTION_LABEL_X;
var ACTION_ELEMENT_Y = 50;
var SIZE = 32;
function LinkedList(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Singly Linked List";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertBack.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
LinkedList.prototype = new Algorithm();
LinkedList.prototype.constructor = LinkedList;
LinkedList.superclass = Algorithm.prototype;
LinkedList.prototype.init = function(am, w2, h) {
  LinkedList.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.tail_pos_y = h / 2 - LINKED_LIST_ELEM_HEIGHT;
  this.tail_label_y = this.tail_pos_y;
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doInsertBack = function(val) {
    this.implementAction(this.insertBack.bind(this), val);
  };
  this.doDeleteFront = function() {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.createdNodeCount = 0;
};
LinkedList.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert Back");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.controls.push(this.insertButton);
  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.controls.push(this.findButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
};
LinkedList.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
LinkedList.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
LinkedList.prototype.setup = function() {
  this.linkedListElemID = new Array(SIZE);
  for (var i = 0; i < SIZE; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;
  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TOP_POS_X,
    TOP_POS_Y
  );
  this.cmd("SetNull", this.headID, 1);
  this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_LABEL_X, TOP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TAIL_POS_X,
    TOP_POS_Y
  );
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
LinkedList.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};
LinkedList.prototype.insertCallback = function(event) {
  if (this.top < SIZE && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertBack.bind(this), value);
  }
};
LinkedList.prototype.deleteFrontCallback = function(event) {
  if (this.top > 0) {
    this.implementAction(this.deleteFront.bind(this), "");
  }
};
LinkedList.prototype.findCallback = function(event) {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
LinkedList.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
LinkedList.prototype.insertBack = function(value) {
  this.commands = [];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;
  for (var i = this.top; i > 0; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }
  this.arrayData[0] = value;
  this.linkedListElemID[0] = this.nextIndex++;
  this.cmd("SetMessage", "Insert at tail: " + value);
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[0],
    "",
    LINKED_LIST_ELEM_WIDTH,
    LINKED_LIST_ELEM_HEIGHT,
    LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * ((this.createdNodeCount - 1) % LINKED_LIST_ELEMS_PER_LINE),
    LINKED_LIST_START_Y + (this.createdNodeCount - 1) % 2 * 15 + Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING,
    0.25,
    0,
    1,
    1
  );
  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[0], 1);
  this.cmd("SetText", this.linkedListElemID[0], value);
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X, TEMP_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH,
    TOP_ELEM_HEIGHT,
    TEMP_POS_X,
    TEMP_POS_Y
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("connect", this.tempID, this.linkedListElemID[0], "#000000", 0.1);
  this.cmd("Step");
  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1
    );
    this.cmd("SetMessage", "List was empty; head and tail point to this node.");
  } else {
    this.cmd("SetNull", this.linkedListElemID[1], 0);
    this.cmd(
      "Connect",
      this.linkedListElemID[1],
      this.linkedListElemID[0],
      "#000000",
      0.1
    );
    this.cmd("SetMessage", "Set old tail->next to new node.");
    this.cmd("Step");
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
    this.cmd("SetMessage", "Update tail pointer to new node.");
  }
  this.cmd(
    "connect",
    this.tailID,
    this.linkedListElemID[0],
    "#000000",
    -0.1,
    true,
    "",
    1
  );
  this.cmd("Disconnect", this.tempID, this.linkedListElemID[0]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.cmd("Step");
  this.top = this.top + 1;
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
LinkedList.prototype.deleteFront = function(ignored) {
  this.commands = [];
  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Deleting front (head) node");
  this.cmd("Step");
  this.cmd(
    "CreateLabel",
    labPopID,
    "Deleted Value: ",
    ACTION_LABEL_X + 20,
    ACTION_LABEL_Y
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X,
    LINKED_LIST_START_Y
  );
  this.cmd("Move", labPopValID, ACTION_ELEMENT_X + 20, ACTION_ELEMENT_Y);
  this.cmd("Step");
  if (this.top == 1) {
    this.cmd("SetMessage", "head gets set to head->next which is null.");
    this.cmd("Step");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("SetNull", this.tailID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "head gets set to head->next.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd(
      "Connect",
      this.headID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1
    );
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.top = this.top - 1;
  this.cmd("Step");
  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);
  this.cmd("SetMessage", "Deleted Value: " + this.arrayData[this.top]);
  this.cmd("Step");
  return this.commands;
};
LinkedList.prototype.findElement = function(valueToFind) {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");
  for (let i = this.top - 1; i >= 0; i--) {
    this.cmd("SetHighlight", this.linkedListElemID[i], 1);
    this.cmd("Step");
    if (String(this.arrayData[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", this.linkedListElemID[i], 0);
      return this.commands;
    }
    this.cmd("SetHighlight", this.linkedListElemID[i], 0);
  }
  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  return this.commands;
};
LinkedList.prototype.clearData = function() {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "");
    this.cmd("SetNull", this.tempID, 1);
    this.cmd("SetAlpha", this.tempID, 0);
    this.cmd("SetAlpha", this.tempLabelID, 0);
    return this.commands;
  }
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("SetNull", this.headID, 1);
  this.cmd("SetNull", this.tempID, 1);
  this.cmd("SetAlpha", this.tempID, 0);
  this.cmd("SetAlpha", this.tempLabelID, 0);
  this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  this.cmd("Disconnect", this.tailID, this.linkedListElemID[0]);
  this.cmd("Disconnect", this.tempID, this.linkedListElemID[0]);
  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.top = 0;
  return this.commands;
};

// AlgorithmLibrary/LinkedListTail.js
var LINKED_LIST_START_X2 = 150;
var LINKED_LIST_START_Y2 = 150;
var LINKED_LIST_ELEM_WIDTH2 = 50;
var LINKED_LIST_ELEM_HEIGHT2 = 25;
var LINKED_LIST_ELEMS_PER_LINE2 = 10;
var LINKED_LIST_ELEM_SPACING2 = 70;
var LINKED_LIST_LINE_SPACING2 = 100;
var TOP_POS_X2 = 150;
var TOP_POS_Y2 = 50;
var TOP_LABEL_X2 = TOP_POS_X2;
var TOP_LABEL_Y2 = 25;
var TOP_ELEM_WIDTH2 = 40;
var TOP_ELEM_HEIGHT2 = 25;
var SIZE_POS_X = TOP_POS_X2 - TOP_ELEM_WIDTH2 * 2;
var SIZE_LABEL_X = SIZE_POS_X;
var TAIL_POS_X2 = TOP_POS_X2 + TOP_ELEM_WIDTH2 * 2;
var TAIL_LABEL_X2 = TAIL_POS_X2;
var TEMP_POS_X2 = TOP_POS_X2 + TOP_ELEM_WIDTH2 * 4;
var TEMP_LABEL_X2 = TEMP_POS_X2;
var TEMP_POS_Y2 = LINKED_LIST_START_Y2 + 100;
var TEMP_LABEL_Y2 = TEMP_POS_Y2 - 25;
var CURRENT_POS_X = TOP_POS_X2;
var CURRENT_LABEL_X = CURRENT_POS_X;
var CURRENT_POS_Y = TEMP_POS_Y2;
var CURRENT_LABEL_Y = CURRENT_POS_Y - 25;
var TODELETE_POS_X = TEMP_POS_X2 + TOP_ELEM_WIDTH2 * 2;
var TODELETE_LABEL_X = TODELETE_POS_X;
var TODELETE_POS_Y = TEMP_POS_Y2;
var TODELETE_LABEL_Y = TODELETE_POS_Y - 25;
var ACTION_LABEL_X2 = TAIL_POS_X2 + TOP_ELEM_WIDTH2 * 3;
var ACTION_LABEL_Y2 = 25;
var ACTION_ELEMENT_X2 = ACTION_LABEL_X2;
var ACTION_ELEMENT_Y2 = 50;
var SIZE2 = 32;
function LinkedListTail(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "SinglyLinkedList";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertBack.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
LinkedListTail.prototype = new Algorithm();
LinkedListTail.prototype.constructor = LinkedListTail;
LinkedListTail.superclass = Algorithm.prototype;
LinkedListTail.prototype.init = function(am, w2, h) {
  LinkedListTail.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X2;
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.tail_pos_y = h / 2 - LINKED_LIST_ELEM_HEIGHT2;
  this.tail_label_y = this.tail_pos_y;
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doInsertBack = function(val) {
    this.implementAction(this.insertBack.bind(this), val);
  };
  this.doDeleteFront = function() {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function() {
    this.implementAction(this.printList.bind(this), "");
  };
  this.doClear = function() {
    this.implementAction(this.clearData.bind(this), "");
  };
  this.doInsertFront = function(val) {
    this.implementAction(this.insertFront.bind(this), val);
  };
  this.doMakeCurrentPointer = function() {
    this.implementAction(this.makeHeadPointer.bind(this), "");
  };
  this.doRemoveCurrentPointer = function() {
    this.implementAction(this.removeCurrentPointer.bind(this), "");
  };
  this.doAdvanceCurrent = function() {
    this.implementAction(this.advanceCurrent.bind(this), "");
  };
  this.doDeleteNext = function() {
    this.implementAction(this.deleteNext.bind(this), "");
  };
  this.doInsertAfterCurrent = function(val) {
    this.implementAction(this.insertAfterCurrent.bind(this), val);
  };
  this.createdNodeCount = 0;
};
LinkedListTail.prototype.recomputeLeftMostX = function() {
  if (this.top <= 0) {
    this.leftMostX = LINKED_LIST_START_X2;
    return;
  }
  let minX = Number.POSITIVE_INFINITY;
  for (let i = 0; i < this.top; i++) {
    const id = this.LinkedListTailElemID[i];
    const x = this.nodeXByID.get(id);
    if (typeof x === "number") {
      minX = Math.min(minX, x);
    }
  }
  this.leftMostX = minX === Number.POSITIVE_INFINITY ? LINKED_LIST_START_X2 : minX;
};
LinkedListTail.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert Back");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.controls.push(this.insertButton);
  this.insertFrontButton = addControlToAlgorithmBar("Button", "Insert Front");
  this.insertFrontButton.onclick = this.insertFrontCallback.bind(this);
  this.controls.push(this.insertFrontButton);
  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);
  this.findButton = addControlToAlgorithmBar("Button", "Print");
  this.findButton.onclick = this.printCallback.bind(this);
  this.controls.push(this.findButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  this.makeHeadPointerButton = addControlToAlgorithmBar(
    "Button",
    "Make current pointer"
  );
  this.makeHeadPointerButton.onclick = this.makeHeadPointerCallback.bind(this);
  this.controls.push(this.makeHeadPointerButton);
  this.removeCurrentPointerButton = addControlToAlgorithmBar(
    "Button",
    "Remove current pointer"
  );
  this.removeCurrentPointerButton.onclick = this.removeCurrentPointerCallback.bind(this);
  this.removeCurrentPointerButton.disabled = true;
  this.controls.push(this.removeCurrentPointerButton);
  this.advanceCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Advance current"
  );
  this.advanceCurrentButton.onclick = this.advanceCurrentCallback.bind(this);
  this.advanceCurrentButton.disabled = true;
  this.controls.push(this.advanceCurrentButton);
  this.deleteNextButton = addControlToAlgorithmBar("Button", "Delete Next");
  this.deleteNextButton.onclick = this.deleteNextCallback.bind(this);
  this.deleteNextButton.disabled = true;
  this.controls.push(this.deleteNextButton);
  this.insertAfterCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Insert After Current"
  );
  this.insertAfterCurrentButton.onclick = this.insertAfterCurrentCallback.bind(this);
  this.insertAfterCurrentButton.disabled = true;
  this.controls.push(this.insertAfterCurrentButton);
};
LinkedListTail.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
  if (this.hasCurrentPointer) {
    if (this.inputField)
      this.inputField.disabled = true;
    if (this.insertButton)
      this.insertButton.disabled = true;
    if (this.insertFrontButton)
      this.insertFrontButton.disabled = true;
    if (this.deleteFrontButton)
      this.deleteFrontButton.disabled = true;
    if (this.findButton)
      this.findButton.disabled = true;
    if (this.clearButton)
      this.clearButton.disabled = true;
    if (this.makeHeadPointerButton)
      this.makeHeadPointerButton.disabled = true;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = false;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = false;
    if (this.inputField)
      this.inputField.disabled = false;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = false;
  } else {
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = true;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = true;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = true;
  }
  if (this.advanceCurrentButton) {
    this.advanceCurrentButton.disabled = !this.hasCurrentPointer;
  }
};
LinkedListTail.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
LinkedListTail.prototype.setup = function() {
  this.LinkedListTailElemID = new Array(SIZE2);
  for (var i = 0; i < SIZE2; i++) {
    this.LinkedListTailElemID[i] = this.nextIndex++;
  }
  this.sizeID = this.nextIndex++;
  this.sizeLabelID = this.nextIndex++;
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;
  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;
  this.currentID = this.nextIndex++;
  this.currentLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE2);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.cmd("CreateLabel", this.sizeLabelID, "Size", SIZE_LABEL_X, TOP_LABEL_Y2);
  this.cmd(
    "CreateRectangle",
    this.sizeID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    SIZE_POS_X,
    TOP_POS_Y2
  );
  this.cmd("SetText", this.sizeID, "0");
  this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X2, TOP_LABEL_Y2);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TOP_POS_X2,
    TOP_POS_Y2
  );
  this.cmd("SetNull", this.headID, 1);
  this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_LABEL_X2, TOP_LABEL_Y2);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TAIL_POS_X2,
    TOP_POS_Y2
  );
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y2, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
LinkedListTail.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X2;
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
};
LinkedListTail.prototype.makeHeadPointerCallback = function(event) {
  this.implementAction(this.makeHeadPointer.bind(this), "");
};
LinkedListTail.prototype.removeCurrentPointerCallback = function(event) {
  this.implementAction(this.removeCurrentPointer.bind(this), "");
};
LinkedListTail.prototype.makeHeadPointer = function(ignored) {
  this.commands = [];
  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty; no head to point at.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const headNodeID = this.LinkedListTailElemID[this.top - 1];
  this.cmd("SetMessage", "Create current pointer at head");
  this.cmd("Step");
  if (!this.hasCurrentPointer) {
    this.cmd(
      "CreateLabel",
      this.currentLabelID,
      "Current",
      CURRENT_LABEL_X,
      CURRENT_LABEL_Y
    );
    this.cmd(
      "CreateRectangle",
      this.currentID,
      "",
      TOP_ELEM_WIDTH2,
      TOP_ELEM_HEIGHT2,
      CURRENT_POS_X,
      CURRENT_POS_Y
    );
    this.cmd("SetNull", this.currentID, 0);
    this.hasCurrentPointer = true;
  } else {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 0);
  }
  this.cmd("connect", this.currentID, headNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = headNodeID;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListTail.prototype.removeCurrentPointer = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer) {
    return this.commands;
  }
  this.cmd("SetMessage", "Remove current pointer");
  if (this.currentNodeID != null) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
  }
  this.cmd("Delete", this.currentID);
  this.cmd("Delete", this.currentLabelID);
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListTail.prototype.advanceCurrentCallback = function(event) {
  this.implementAction(this.advanceCurrent.bind(this), "");
};
LinkedListTail.prototype.deleteNextCallback = function(event) {
  this.implementAction(this.deleteNext.bind(this), "");
};
LinkedListTail.prototype.insertAfterCurrentCallback = function(event) {
  if (!this.hasCurrentPointer) {
    return;
  }
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertAfterCurrent.bind(this), value);
};
LinkedListTail.prototype.advanceCurrent = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.LinkedListTailElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; advancing reaches null");
    this.cmd("Step");
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const nextNodeID = this.LinkedListTailElemID[currentIndex - 1];
  this.cmd("SetMessage", "Advance current to next node (current = current->next)");
  this.cmd("Step");
  this.cmd("Disconnect", this.currentID, this.currentNodeID);
  this.cmd("connect", this.currentID, nextNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = nextNodeID;
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListTail.prototype.deleteNext = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.LinkedListTailElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; there is no next node to delete");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const deleteIndex = currentIndex - 1;
  const deleteNodeID = this.LinkedListTailElemID[deleteIndex];
  const hasAfterNext = deleteIndex - 1 >= 0;
  const afterNextID = hasAfterNext ? this.LinkedListTailElemID[deleteIndex - 1] : null;
  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;
  this.cmd("SetMessage", "Delete next: identify node after current. (current->next)");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Create toDelete pointer so we can track the node being removed");
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X,
    TODELETE_LABEL_Y
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TODELETE_POS_X,
    TODELETE_POS_Y
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deleteNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd(
    "SetMessage",
    "Update current->next to skip over the next node (toDelete still points at it)"
  );
  this.cmd("Disconnect", this.currentNodeID, deleteNodeID);
  if (hasAfterNext) {
    this.cmd("SetNull", this.currentNodeID, 0);
    this.cmd("Connect", this.currentNodeID, afterNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", this.currentNodeID, 1);
  }
  this.cmd("Step");
  if (deleteIndex === 0) {
    this.cmd("SetMessage", "Deleted node was the tail: update tail pointer");
    this.cmd("Disconnect", this.tailID, deleteNodeID);
    this.cmd("connect", this.tailID, this.currentNodeID, "#000000", -0.1, true, "", 1);
    this.cmd("Step");
  }
  this.cmd("SetMessage", "Delete the removed node (tracked by toDelete)");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  for (let i = deleteIndex; i < this.top - 1; i++) {
    this.arrayData[i] = this.arrayData[i + 1];
    this.LinkedListTailElemID[i] = this.LinkedListTailElemID[i + 1];
  }
  this.top = this.top - 1;
  this.cmd("SetMessage", "Update size to " + this.top);
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.top));
  this.cmd("Step");
  this.nodeXByID.delete(deleteNodeID);
  this.recomputeLeftMostX();
  this.cmd("SetHighlight", this.currentNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListTail.prototype.insertAfterCurrent = function(value) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    this.cmd("SetMessage", "No current pointer");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (this.top >= SIZE2) {
    this.cmd("SetMessage", "List is full");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (value == null || String(value).trim() === "") {
    this.cmd("SetMessage", "Enter a value to insert");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.LinkedListTailElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  const oldNextID = currentIndex > 0 ? this.LinkedListTailElemID[currentIndex - 1] : null;
  const newNodeID = this.nextIndex++;
  for (let i = this.top; i > currentIndex; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.LinkedListTailElemID[i] = this.LinkedListTailElemID[i - 1];
  }
  this.arrayData[currentIndex] = value;
  this.LinkedListTailElemID[currentIndex] = newNodeID;
  this.top = this.top + 1;
  let spawnX = LINKED_LIST_START_X2;
  let spawnY = LINKED_LIST_START_Y2;
  try {
    spawnX = this.animationManager.animatedObjects.getNodeX(this.currentNodeID);
    spawnY = this.animationManager.animatedObjects.getNodeY(this.currentNodeID);
  } catch (e) {
  }
  this.cmd("SetMessage", "Insert after current: create new node");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 1);
  }
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH2,
    LINKED_LIST_ELEM_HEIGHT2,
    spawnX,
    spawnY + 50,
    0.25,
    0,
    1,
    1
  );
  this.nodeXByID.set(newNodeID, spawnX);
  this.cmd("SetNull", newNodeID, 1);
  this.cmd("SetText", newNodeID, value);
  this.cmd("Step");
  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  this.cmd(
    "CreateLabel",
    this.tempLabelID,
    "newNode",
    TEMP_LABEL_X2,
    TEMP_LABEL_Y2
  );
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TEMP_POS_X2,
    TEMP_POS_Y2
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("connect", this.tempID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->next to be copy of current->next");
  if (oldNextID != null) {
    this.cmd("SetNull", newNodeID, 0);
    this.cmd("Connect", newNodeID, oldNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", newNodeID, 1);
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Update current->next to new node");
  if (oldNextID != null) {
    this.cmd("Disconnect", this.currentNodeID, oldNextID);
  }
  this.cmd("SetNull", this.currentNodeID, 0);
  this.cmd("Connect", this.currentNodeID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current was the tail: update tail pointer");
    this.cmd("Disconnect", this.tailID, this.currentNodeID);
    this.cmd("connect", this.tailID, newNodeID, "#000000", -0.1, true, "", 1);
    this.cmd("Step");
  }
  this.recomputeLeftMostX();
  this.cmd("Disconnect", this.tempID, newNodeID);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.cmd("SetMessage", "Update size to " + this.top);
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.top));
  this.cmd("Step");
  this.cmd("SetHighlight", this.currentNodeID, 0);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 0);
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListTail.prototype.insertCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top < SIZE2 && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertBack.bind(this), value);
  }
};
LinkedListTail.prototype.insertFrontCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top < SIZE2 && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertFront.bind(this), value);
  }
};
LinkedListTail.prototype.deleteFrontCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top > 0) {
    this.implementAction(this.deleteFront.bind(this), "");
  }
};
LinkedListTail.prototype.findCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
LinkedListTail.prototype.printCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.printList.bind(this), "");
};
LinkedListTail.prototype.clearCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.clearData.bind(this), "");
};
LinkedListTail.prototype.insertBack = function(value) {
  this.commands = [];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;
  for (var i = this.top; i > 0; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.LinkedListTailElemID[i] = this.LinkedListTailElemID[i - 1];
  }
  this.arrayData[0] = value;
  this.LinkedListTailElemID[0] = this.nextIndex++;
  this.cmd("SetMessage", "Insert at tail: " + value);
  this.cmd("Step");
  let nodeX = LINKED_LIST_START_X2;
  let nodeY = LINKED_LIST_START_Y2;
  if (this.top > 0) {
    const oldTailID = this.LinkedListTailElemID[1];
    let oldTailX = this.nodeXByID.get(oldTailID);
    let oldTailY;
    try {
      oldTailX = this.animationManager.animatedObjects.getNodeX(oldTailID);
      oldTailY = this.animationManager.animatedObjects.getNodeY(oldTailID);
    } catch (e) {
    }
    if (typeof oldTailX === "number") {
      nodeX = oldTailX + (LINKED_LIST_ELEM_WIDTH2 + 20);
    }
    if (typeof oldTailY === "number") {
      nodeY = oldTailY + (this.createdNodeCount - 1) % 2 * 15;
    } else {
      nodeY = LINKED_LIST_START_Y2 + (this.createdNodeCount - 1) % 2 * 15;
    }
  } else {
    nodeY = LINKED_LIST_START_Y2 + (this.createdNodeCount - 1) % 2 * 15;
  }
  this.cmd(
    "CreateLinkedList",
    this.LinkedListTailElemID[0],
    "",
    LINKED_LIST_ELEM_WIDTH2,
    LINKED_LIST_ELEM_HEIGHT2,
    nodeX,
    nodeY,
    0.25,
    0,
    1,
    1
  );
  this.nodeXByID.set(this.LinkedListTailElemID[0], nodeX);
  if (this.top === 0) {
    this.leftMostX = nodeX;
  }
  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.LinkedListTailElemID[0], 1);
  this.cmd("SetText", this.LinkedListTailElemID[0], value);
  this.cmd("Step");
  this.cmd("SetMessage", "Temporary newNode pointer gets address of new node");
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X2, TEMP_LABEL_Y2);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TEMP_POS_X2,
    TEMP_POS_Y2
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("connect", this.tempID, this.LinkedListTailElemID[0], "#000000", 0.1);
  this.cmd("Step");
  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.LinkedListTailElemID[this.top],
      "#000000",
      0.1
    );
    this.cmd("SetMessage", "List was empty; head and tail point to this node.");
  } else {
    this.cmd("SetNull", this.LinkedListTailElemID[1], 0);
    this.cmd(
      "Connect",
      this.LinkedListTailElemID[1],
      this.LinkedListTailElemID[0],
      "#000000",
      0.1
    );
    this.cmd("SetMessage", "Set old tail->next to new node.");
    this.cmd("Step");
    this.cmd("Disconnect", this.tailID, this.LinkedListTailElemID[1]);
    this.cmd("SetMessage", "Update tail pointer to new node.");
  }
  this.cmd(
    "connect",
    this.tailID,
    this.LinkedListTailElemID[0],
    "#000000",
    -0.1,
    true,
    "",
    1
  );
  this.cmd("Step");
  this.cmd("Disconnect", this.tempID, this.LinkedListTailElemID[0]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.top = this.top + 1;
  this.cmd("SetMessage", "Update size to " + this.top);
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.top));
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
LinkedListTail.prototype.insertFront = function(value) {
  this.commands = [];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;
  this.arrayData[this.top] = value;
  this.LinkedListTailElemID[this.top] = this.nextIndex++;
  this.cmd("SetMessage", "insertStart(" + value + ")");
  this.cmd("Step");
  const insertX = this.top === 0 ? LINKED_LIST_START_X2 : this.leftMostX - LINKED_LIST_ELEM_SPACING2;
  this.cmd(
    "CreateLinkedList",
    this.LinkedListTailElemID[this.top],
    "",
    LINKED_LIST_ELEM_WIDTH2,
    LINKED_LIST_ELEM_HEIGHT2,
    insertX,
    LINKED_LIST_START_Y2 + (this.createdNodeCount - 1) % 2 * 15 + Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE2) * LINKED_LIST_LINE_SPACING2,
    0.25,
    0,
    1,
    1
  );
  this.nodeXByID.set(this.LinkedListTailElemID[this.top], insertX);
  this.leftMostX = insertX;
  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.LinkedListTailElemID[this.top], 1);
  this.cmd("SetText", this.LinkedListTailElemID[this.top], value);
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X2, TEMP_LABEL_Y2);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TEMP_POS_X2,
    TEMP_POS_Y2
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd(
    "connect",
    this.tempID,
    this.LinkedListTailElemID[this.top],
    "#000000",
    0.1
  );
  this.cmd("Step");
  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.LinkedListTailElemID[this.top],
      "#000000",
      0.1
    );
    this.cmd(
      "connect",
      this.tailID,
      this.LinkedListTailElemID[this.top],
      "#000000",
      -0.1,
      true,
      "",
      1
    );
    this.cmd("SetMessage", "List was empty; head and tail point to this node.");
  } else {
    const oldHeadIndex = this.top - 1;
    this.cmd("SetMessage", "Set newNode->next to old head.");
    this.cmd("SetNull", this.LinkedListTailElemID[this.top], 0);
    this.cmd(
      "Connect",
      this.LinkedListTailElemID[this.top],
      this.LinkedListTailElemID[oldHeadIndex],
      "#000000",
      0.1
    );
    this.cmd("Step");
    this.cmd("SetMessage", "Update head pointer to new node.");
    this.cmd("Disconnect", this.headID, this.LinkedListTailElemID[oldHeadIndex]);
    this.cmd(
      "connect",
      this.headID,
      this.LinkedListTailElemID[this.top],
      "#000000",
      0.1
    );
  }
  this.cmd("Disconnect", this.tempID, this.LinkedListTailElemID[this.top]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.cmd("Step");
  this.top = this.top + 1;
  this.cmd("SetMessage", "Update size to " + this.top);
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.top));
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
LinkedListTail.prototype.deleteFront = function(ignored, inClear) {
  if (!inClear) {
    this.commands = [];
  }
  const deletedID = this.LinkedListTailElemID[this.top - 1];
  const newHeadID = this.top > 1 ? this.LinkedListTailElemID[this.top - 2] : null;
  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;
  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Deleting front (head) node");
  this.cmd("Step");
  this.cmd(
    "CreateLabel",
    labPopID,
    "Deleted Value: ",
    ACTION_LABEL_X2 + 20,
    ACTION_LABEL_Y2
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X2,
    LINKED_LIST_START_Y2
  );
  this.cmd("Move", labPopValID, ACTION_ELEMENT_X2 + 20, ACTION_ELEMENT_Y2);
  this.cmd("Step");
  this.cmd(
    "SetMessage",
    "Create toDelete pointer to track the node being removed"
  );
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X,
    TODELETE_LABEL_Y
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    TODELETE_POS_X,
    TODELETE_POS_Y
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deletedID, "#000000", 0.1);
  this.cmd("Step");
  if (this.top == 1) {
    this.cmd("SetMessage", "head gets set to head->next which is null.");
    this.cmd("Step");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("SetNull", this.tailID, 1);
    this.cmd("Disconnect", this.headID, this.LinkedListTailElemID[this.top - 1]);
    this.cmd("Disconnect", this.tailID, this.LinkedListTailElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "head gets set to head->next.");
    this.cmd("Disconnect", this.headID, this.LinkedListTailElemID[this.top - 1]);
    this.cmd(
      "Connect",
      this.headID,
      this.LinkedListTailElemID[this.top - 2],
      "#000000",
      0.1
    );
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.LinkedListTailElemID[this.top - 1]);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deletedID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  this.nodeXByID.delete(deletedID);
  if (this.hasCurrentPointer && this.currentNodeID === deletedID) {
    this.cmd("Disconnect", this.currentID, deletedID);
    if (newHeadID != null) {
      this.cmd("connect", this.currentID, newHeadID, "#000000", 0.1, true, "", 2);
      this.currentNodeID = newHeadID;
    } else {
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
  }
  this.top = this.top - 1;
  this.recomputeLeftMostX();
  this.cmd("SetMessage", "Update size to " + this.top);
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.top));
  this.cmd("Step");
  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);
  this.cmd("SetMessage", "Deleted Value: " + this.arrayData[this.top]);
  this.cmd("Step");
  return this.commands;
};
LinkedListTail.prototype.findElement = function(valueToFind) {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");
  const searchCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const searchCurrentLabelID = this.hasCurrentPointer ? this.nextIndex++ : this.currentLabelID;
  this.cmd(
    "CreateLabel",
    searchCurrentLabelID,
    "Current",
    CURRENT_LABEL_X,
    CURRENT_LABEL_Y
  );
  this.cmd(
    "CreateRectangle",
    searchCurrentID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    CURRENT_POS_X,
    CURRENT_POS_Y
  );
  this.cmd("SetNull", searchCurrentID, 0);
  this.cmd(
    "connect",
    searchCurrentID,
    this.LinkedListTailElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2
  );
  this.cmd("Step");
  for (let i = this.top - 1; i >= 0; i--) {
    this.cmd("SetHighlight", this.LinkedListTailElemID[i], 1);
    this.cmd("Step");
    if (String(this.arrayData[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", this.LinkedListTailElemID[i], 0);
      this.cmd("Disconnect", searchCurrentID, this.LinkedListTailElemID[i]);
      this.cmd("Delete", searchCurrentID);
      this.cmd("Delete", searchCurrentLabelID);
      return this.commands;
    }
    this.cmd("SetHighlight", this.LinkedListTailElemID[i], 0);
    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)"
      );
      this.cmd("Step");
      this.cmd("Disconnect", searchCurrentID, this.LinkedListTailElemID[i]);
      this.cmd(
        "connect",
        searchCurrentID,
        this.LinkedListTailElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2
      );
      this.cmd("Step");
    }
  }
  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  this.cmd("Disconnect", searchCurrentID, this.LinkedListTailElemID[0]);
  this.cmd("Delete", searchCurrentID);
  this.cmd("Delete", searchCurrentLabelID);
  return this.commands;
};
LinkedListTail.prototype.printList = function(ignored) {
  this.commands = [];
  this.printOutput = "";
  if (this.top === 0) {
    this.cmd("SetMessage", "Printing list: <empty list>\nCurrent output: ");
    this.cmd("Step");
    this.cmd("SetMessage", "Final output: " + this.printOutput);
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Printing list from head...");
  this.cmd("Step");
  const printCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const printCurrentLabelID = this.hasCurrentPointer ? this.nextIndex++ : this.currentLabelID;
  this.cmd(
    "CreateLabel",
    printCurrentLabelID,
    "Current",
    CURRENT_LABEL_X,
    CURRENT_LABEL_Y
  );
  this.cmd(
    "CreateRectangle",
    printCurrentID,
    "",
    TOP_ELEM_WIDTH2,
    TOP_ELEM_HEIGHT2,
    CURRENT_POS_X,
    CURRENT_POS_Y
  );
  this.cmd("SetNull", printCurrentID, 0);
  this.cmd(
    "connect",
    printCurrentID,
    this.LinkedListTailElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2
  );
  this.cmd("Step");
  for (let i = this.top - 1; i >= 0; i--) {
    const nodeID = this.LinkedListTailElemID[i];
    const nodeValue = this.arrayData[i];
    this.cmd("SetHighlight", nodeID, 1);
    if (this.printOutput.length > 0) {
      this.printOutput += ", ";
    }
    this.printOutput += nodeValue;
    this.cmd(
      "SetMessage",
      "Print " + nodeValue + "\nCurrent output: " + this.printOutput
    );
    this.cmd("Step");
    this.cmd("SetHighlight", nodeID, 0);
    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)\nCurrent output: " + this.printOutput
      );
      this.cmd("Step");
      this.cmd("Disconnect", printCurrentID, nodeID);
      this.cmd(
        "connect",
        printCurrentID,
        this.LinkedListTailElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2
      );
      this.cmd("Step");
    }
  }
  this.cmd(
    "SetMessage",
    "Advancing to next node. (current = current->next)\nCurrent output: " + this.printOutput
  );
  this.cmd("Step");
  this.cmd("Disconnect", printCurrentID, this.LinkedListTailElemID[0]);
  this.cmd("SetNull", printCurrentID, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Final output: " + this.printOutput);
  this.cmd("Step");
  this.cmd("Delete", printCurrentID);
  this.cmd("Delete", printCurrentLabelID);
  return this.commands;
};
LinkedListTail.prototype.clearData = function() {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "");
    if (this.hasCurrentPointer) {
      this.cmd("Disconnect", this.currentID, this.currentNodeID);
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
    this.cmd("SetNull", this.tempID, 1);
    this.cmd("SetAlpha", this.tempID, 0);
    this.cmd("SetAlpha", this.tempLabelID, 0);
    this.cmd("SetMessage", "Update size to 0");
    this.cmd("Step");
    this.cmd("SetText", this.sizeID, "0");
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Clearing list...");
  this.cmd("Step");
  while (this.top > 0) {
    this.deleteFront("", true);
  }
  this.cmd("SetMessage", "Update size to 0");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, "0");
  this.cmd("Step");
  this.cmd("SetNull", this.tempID, 1);
  this.cmd("SetAlpha", this.tempID, 0);
  this.cmd("SetAlpha", this.tempLabelID, 0);
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X2;
  if (this.hasCurrentPointer) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  return this.commands;
};

// AlgorithmLibrary/LinkedListSimple.js
var LINKED_LIST_START_X3 = 150;
var LINKED_LIST_START_Y3 = 150;
var LINKED_LIST_ELEM_WIDTH3 = 50;
var LINKED_LIST_ELEM_HEIGHT3 = 25;
var LINKED_LIST_ELEMS_PER_LINE3 = 10;
var LINKED_LIST_ELEM_SPACING3 = 70;
var LINKED_LIST_LINE_SPACING3 = 100;
var TOP_POS_X3 = 70;
var TOP_POS_Y3 = 50;
var TOP_LABEL_X3 = TOP_POS_X3;
var TOP_LABEL_Y3 = 25;
var TOP_ELEM_WIDTH3 = 40;
var TOP_ELEM_HEIGHT3 = 25;
var TAIL_POS_X3 = TOP_POS_X3 + TOP_ELEM_WIDTH3 * 2;
var TEMP_POS_X3 = TOP_POS_X3 + TOP_ELEM_WIDTH3 * 4;
var TEMP_LABEL_X3 = TEMP_POS_X3;
var TEMP_POS_Y3 = LINKED_LIST_START_Y3 + 100;
var TEMP_LABEL_Y3 = TEMP_POS_Y3 - 25;
var CURRENT_POS_X2 = TOP_POS_X3;
var CURRENT_LABEL_X2 = CURRENT_POS_X2;
var CURRENT_POS_Y2 = TEMP_POS_Y3;
var CURRENT_LABEL_Y2 = CURRENT_POS_Y2 - 25;
var TODELETE_POS_X2 = TEMP_POS_X3 + TOP_ELEM_WIDTH3 * 2;
var TODELETE_LABEL_X2 = TODELETE_POS_X2;
var TODELETE_POS_Y2 = TEMP_POS_Y3;
var TODELETE_LABEL_Y2 = TODELETE_POS_Y2 - 25;
var ACTION_LABEL_X3 = TAIL_POS_X3 + TOP_ELEM_WIDTH3 * 3;
var ACTION_LABEL_Y3 = 25;
var ACTION_ELEMENT_X3 = ACTION_LABEL_X3;
var ACTION_ELEMENT_Y3 = 50;
var SIZE3 = 32;
function LinkedListSimple(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "SimpleLinkedList";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    const n = opts.initialData.length;
    if (n > 0) {
      const desiredHeadX = LINKED_LIST_START_X3;
      this._initialFirstNodeX = desiredHeadX + (n - 1) * LINKED_LIST_ELEM_SPACING3;
    }
    for (let d of opts.initialData) {
      this.implementAction(this.insertFront.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
LinkedListSimple.prototype = new Algorithm();
LinkedListSimple.prototype.constructor = LinkedListSimple;
LinkedListSimple.superclass = Algorithm.prototype;
LinkedListSimple.prototype.init = function(am, w2, h) {
  LinkedListSimple.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X3;
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doInsertFront = function(val) {
    this.implementAction(this.insertFront.bind(this), val);
  };
  this.doDeleteFront = function() {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function() {
    this.implementAction(this.printList.bind(this), "");
  };
  this.doClear = function() {
    this.implementAction(this.clearData.bind(this), "");
  };
  this.doMakeCurrentPointer = function() {
    this.implementAction(this.makeHeadPointer.bind(this), "");
  };
  this.doRemoveCurrentPointer = function() {
    this.implementAction(this.removeCurrentPointer.bind(this), "");
  };
  this.doAdvanceCurrent = function() {
    this.implementAction(this.advanceCurrent.bind(this), "");
  };
  this.doDeleteNext = function() {
    this.implementAction(this.deleteNext.bind(this), "");
  };
  this.doInsertAfterCurrent = function(val) {
    this.implementAction(this.insertAfterCurrent.bind(this), val);
  };
  this.createdNodeCount = 0;
};
LinkedListSimple.prototype.recomputeLeftMostX = function() {
  if (this.top <= 0) {
    this.leftMostX = LINKED_LIST_START_X3;
    return;
  }
  let minX = Number.POSITIVE_INFINITY;
  for (let i = 0; i < this.top; i++) {
    const id = this.linkedListElemID[i];
    const x = this.nodeXByID.get(id);
    if (typeof x === "number") {
      minX = Math.min(minX, x);
    }
  }
  this.leftMostX = minX === Number.POSITIVE_INFINITY ? LINKED_LIST_START_X3 : minX;
};
LinkedListSimple.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertFrontCallback.bind(this),
    6
  );
  this.insertFrontButton = addControlToAlgorithmBar("Button", "Insert Front");
  this.insertFrontButton.onclick = this.insertFrontCallback.bind(this);
  this.controls.push(this.insertFrontButton);
  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);
  this.findButton = addControlToAlgorithmBar("Button", "Print");
  this.findButton.onclick = this.printCallback.bind(this);
  this.controls.push(this.findButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  this.makeHeadPointerButton = addControlToAlgorithmBar(
    "Button",
    "Make current pointer"
  );
  this.makeHeadPointerButton.onclick = this.makeHeadPointerCallback.bind(this);
  this.controls.push(this.makeHeadPointerButton);
  this.removeCurrentPointerButton = addControlToAlgorithmBar(
    "Button",
    "Remove current pointer"
  );
  this.removeCurrentPointerButton.onclick = this.removeCurrentPointerCallback.bind(this);
  this.removeCurrentPointerButton.disabled = true;
  this.controls.push(this.removeCurrentPointerButton);
  this.advanceCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Advance current"
  );
  this.advanceCurrentButton.onclick = this.advanceCurrentCallback.bind(this);
  this.advanceCurrentButton.disabled = true;
  this.controls.push(this.advanceCurrentButton);
  this.deleteNextButton = addControlToAlgorithmBar("Button", "Delete Next");
  this.deleteNextButton.onclick = this.deleteNextCallback.bind(this);
  this.deleteNextButton.disabled = true;
  this.controls.push(this.deleteNextButton);
  this.insertAfterCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Insert After Current"
  );
  this.insertAfterCurrentButton.onclick = this.insertAfterCurrentCallback.bind(this);
  this.insertAfterCurrentButton.disabled = true;
  this.controls.push(this.insertAfterCurrentButton);
};
LinkedListSimple.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
  if (this.hasCurrentPointer) {
    if (this.insertFrontButton)
      this.insertFrontButton.disabled = true;
    if (this.deleteFrontButton)
      this.deleteFrontButton.disabled = true;
    if (this.findButton)
      this.findButton.disabled = true;
    if (this.clearButton)
      this.clearButton.disabled = true;
    if (this.makeHeadPointerButton)
      this.makeHeadPointerButton.disabled = true;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = false;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = false;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = false;
    if (this.inputField)
      this.inputField.disabled = false;
  } else {
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = true;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = true;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = true;
  }
  if (this.advanceCurrentButton) {
    this.advanceCurrentButton.disabled = !this.hasCurrentPointer;
  }
};
LinkedListSimple.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
LinkedListSimple.prototype.setup = function() {
  this.linkedListElemID = new Array(SIZE3);
  for (var i = 0; i < SIZE3; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;
  this.currentID = this.nextIndex++;
  this.currentLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE3);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X3, TOP_LABEL_Y3);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    TOP_POS_X3,
    TOP_POS_Y3
  );
  this.cmd("SetNull", this.headID, 1);
  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y3, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
LinkedListSimple.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X3;
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
};
LinkedListSimple.prototype.makeHeadPointerCallback = function(event) {
  this.implementAction(this.makeHeadPointer.bind(this), "");
};
LinkedListSimple.prototype.removeCurrentPointerCallback = function(event) {
  this.implementAction(this.removeCurrentPointer.bind(this), "");
};
LinkedListSimple.prototype.makeHeadPointer = function(ignored) {
  this.commands = [];
  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty; no head to point at.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const headNodeID = this.linkedListElemID[this.top - 1];
  this.cmd("SetMessage", "Create current pointer at head");
  this.cmd("Step");
  if (!this.hasCurrentPointer) {
    this.cmd(
      "CreateLabel",
      this.currentLabelID,
      "Current",
      CURRENT_LABEL_X2,
      CURRENT_LABEL_Y2
    );
    this.cmd(
      "CreateRectangle",
      this.currentID,
      "",
      TOP_ELEM_WIDTH3,
      TOP_ELEM_HEIGHT3,
      CURRENT_POS_X2,
      CURRENT_POS_Y2
    );
    this.cmd("SetNull", this.currentID, 0);
    this.hasCurrentPointer = true;
  } else {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 0);
  }
  this.cmd("connect", this.currentID, headNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = headNodeID;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListSimple.prototype.removeCurrentPointer = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer) {
    return this.commands;
  }
  this.cmd("SetMessage", "Remove current pointer");
  if (this.currentNodeID != null) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
  }
  this.cmd("Delete", this.currentID);
  this.cmd("Delete", this.currentLabelID);
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListSimple.prototype.advanceCurrentCallback = function(event) {
  this.implementAction(this.advanceCurrent.bind(this), "");
};
LinkedListSimple.prototype.deleteNextCallback = function(event) {
  this.implementAction(this.deleteNext.bind(this), "");
};
LinkedListSimple.prototype.insertAfterCurrentCallback = function(event) {
  if (!this.hasCurrentPointer) {
    return;
  }
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertAfterCurrent.bind(this), value);
};
LinkedListSimple.prototype.advanceCurrent = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; advancing reaches null");
    this.cmd("Step");
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const nextNodeID = this.linkedListElemID[currentIndex - 1];
  this.cmd("SetMessage", "Advance current to next node (current = current->next)");
  this.cmd("Step");
  this.cmd("Disconnect", this.currentID, this.currentNodeID);
  this.cmd("connect", this.currentID, nextNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = nextNodeID;
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListSimple.prototype.deleteNext = function(ignored) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  if (this.top <= 0) {
    this.cmd("SetMessage", "List is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  if (currentIndex === 0) {
    this.cmd("SetMessage", "Current is at tail; there is no next node to delete");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const deleteIndex = currentIndex - 1;
  const deleteNodeID = this.linkedListElemID[deleteIndex];
  const hasAfterNext = deleteIndex - 1 >= 0;
  const afterNextID = hasAfterNext ? this.linkedListElemID[deleteIndex - 1] : null;
  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;
  this.cmd("SetMessage", "Delete next: identify node after current. (current->next)");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Create toDelete pointer so we can track the node being removed");
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X2,
    TODELETE_LABEL_Y2
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    TODELETE_POS_X2,
    TODELETE_POS_Y2
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deleteNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd(
    "SetMessage",
    "Update current->next to skip over the next node (toDelete still points at it)"
  );
  this.cmd("Disconnect", this.currentNodeID, deleteNodeID);
  if (hasAfterNext) {
    this.cmd("SetNull", this.currentNodeID, 0);
    this.cmd("Connect", this.currentNodeID, afterNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", this.currentNodeID, 1);
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete the removed node (tracked by toDelete)");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  for (let i = deleteIndex; i < this.top - 1; i++) {
    this.arrayData[i] = this.arrayData[i + 1];
    this.linkedListElemID[i] = this.linkedListElemID[i + 1];
  }
  this.top = this.top - 1;
  this.nodeXByID.delete(deleteNodeID);
  this.recomputeLeftMostX();
  this.cmd("SetHighlight", this.currentNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListSimple.prototype.insertAfterCurrent = function(value) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    this.cmd("SetMessage", "No current pointer");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (this.top >= SIZE3) {
    this.cmd("SetMessage", "List is full");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (value == null || String(value).trim() === "") {
    this.cmd("SetMessage", "Enter a value to insert");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  let currentIndex = -1;
  for (let i = 0; i < this.top; i++) {
    if (this.linkedListElemID[i] === this.currentNodeID) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  const oldNextID = currentIndex > 0 ? this.linkedListElemID[currentIndex - 1] : null;
  const newNodeID = this.nextIndex++;
  for (let i = this.top; i > currentIndex; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }
  this.arrayData[currentIndex] = value;
  this.linkedListElemID[currentIndex] = newNodeID;
  this.top = this.top + 1;
  let spawnX = LINKED_LIST_START_X3;
  let spawnY = LINKED_LIST_START_Y3;
  try {
    spawnX = this.animationManager.animatedObjects.getNodeX(this.currentNodeID);
    spawnY = this.animationManager.animatedObjects.getNodeY(this.currentNodeID);
  } catch (e) {
  }
  this.cmd("SetMessage", "Insert after current: create new node");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 1);
  }
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH3,
    LINKED_LIST_ELEM_HEIGHT3,
    spawnX,
    spawnY + 50,
    0.25,
    0,
    1,
    1
  );
  this.nodeXByID.set(newNodeID, spawnX);
  this.cmd("SetNull", newNodeID, 1);
  this.cmd("SetText", newNodeID, value);
  this.cmd("Step");
  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  this.cmd(
    "CreateLabel",
    this.tempLabelID,
    "newNode",
    TEMP_LABEL_X3,
    TEMP_LABEL_Y3
  );
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    TEMP_POS_X3,
    TEMP_POS_Y3
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("connect", this.tempID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->next to be copy of current->next");
  if (oldNextID != null) {
    this.cmd("SetNull", newNodeID, 0);
    this.cmd("Connect", newNodeID, oldNextID, "#000000", 0.1);
  } else {
    this.cmd("SetNull", newNodeID, 1);
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Update current->next to new node");
  if (oldNextID != null) {
    this.cmd("Disconnect", this.currentNodeID, oldNextID);
  }
  this.cmd("SetNull", this.currentNodeID, 0);
  this.cmd("Connect", this.currentNodeID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.recomputeLeftMostX();
  this.cmd("Disconnect", this.tempID, newNodeID);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.cmd("SetHighlight", this.currentNodeID, 0);
  if (oldNextID != null) {
    this.cmd("SetHighlight", oldNextID, 0);
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
LinkedListSimple.prototype.insertFrontCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top < SIZE3 && this.inputField.value != "") {
    var value = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.insertFront.bind(this), value);
  }
};
LinkedListSimple.prototype.deleteFrontCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  if (this.top > 0) {
    this.implementAction(this.deleteFront.bind(this), "");
  }
};
LinkedListSimple.prototype.findCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
LinkedListSimple.prototype.printCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.printList.bind(this), "");
};
LinkedListSimple.prototype.clearCallback = function(event) {
  if (this.hasCurrentPointer) {
    return;
  }
  this.implementAction(this.clearData.bind(this), "");
};
LinkedListSimple.prototype.insertFront = function(value) {
  this.commands = [];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;
  this.arrayData[this.top] = value;
  this.linkedListElemID[this.top] = this.nextIndex++;
  this.cmd("SetMessage", "insertStart(" + value + ")");
  this.cmd("Step");
  const insertX = this.top === 0 ? typeof this._initialFirstNodeX === "number" ? this._initialFirstNodeX : LINKED_LIST_START_X3 : this.leftMostX - LINKED_LIST_ELEM_SPACING3;
  if (this.top === 0) {
    this._initialFirstNodeX = void 0;
  }
  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[this.top],
    "",
    LINKED_LIST_ELEM_WIDTH3,
    LINKED_LIST_ELEM_HEIGHT3,
    insertX,
    LINKED_LIST_START_Y3 + (this.createdNodeCount - 1) % 2 * 15 + Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE3) * LINKED_LIST_LINE_SPACING3,
    0.25,
    0,
    1,
    1
  );
  this.nodeXByID.set(this.linkedListElemID[this.top], insertX);
  this.leftMostX = insertX;
  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[this.top], 1);
  this.cmd("SetText", this.linkedListElemID[this.top], value);
  this.cmd("Step");
  this.cmd("SetMessage", "Temporary newNode pointer gets address of new node");
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X3, TEMP_LABEL_Y3);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    TEMP_POS_X3,
    TEMP_POS_Y3
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd(
    "connect",
    this.tempID,
    this.linkedListElemID[this.top],
    "#000000",
    0.1
  );
  this.cmd("Step");
  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1
    );
    this.cmd("SetMessage", "List was empty; head points to this node.");
  } else {
    const oldHeadIndex = this.top - 1;
    this.cmd("SetMessage", "Set newNode->next to old head.");
    this.cmd("SetNull", this.linkedListElemID[this.top], 0);
    this.cmd(
      "Connect",
      this.linkedListElemID[this.top],
      this.linkedListElemID[oldHeadIndex],
      "#000000",
      0.1
    );
    this.cmd("Step");
    this.cmd("SetMessage", "Update head pointer to new node.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[oldHeadIndex]);
    this.cmd(
      "connect",
      this.headID,
      this.linkedListElemID[this.top],
      "#000000",
      0.1
    );
  }
  this.cmd("Step");
  this.cmd("Disconnect", this.tempID, this.linkedListElemID[this.top]);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.top = this.top + 1;
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
LinkedListSimple.prototype.deleteFront = function(ignored, inClear) {
  if (!inClear) {
    this.commands = [];
  }
  const deletedID = this.linkedListElemID[this.top - 1];
  const newHeadID = this.top > 1 ? this.linkedListElemID[this.top - 2] : null;
  const toDeleteID = this.nextIndex++;
  const toDeleteLabelID = this.nextIndex++;
  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Deleting front (head) node");
  this.cmd("Step");
  this.cmd(
    "CreateLabel",
    labPopID,
    "Deleted Value: ",
    ACTION_LABEL_X3 + 20,
    ACTION_LABEL_Y3
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X3,
    LINKED_LIST_START_Y3
  );
  this.cmd("Move", labPopValID, ACTION_ELEMENT_X3 + 20, ACTION_ELEMENT_Y3);
  this.cmd("Step");
  this.cmd(
    "SetMessage",
    "Create toDelete pointer to track the node being removed"
  );
  this.cmd(
    "CreateLabel",
    toDeleteLabelID,
    "toDelete",
    TODELETE_LABEL_X2,
    TODELETE_LABEL_Y2
  );
  this.cmd(
    "CreateRectangle",
    toDeleteID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    TODELETE_POS_X2,
    TODELETE_POS_Y2
  );
  this.cmd("SetNull", toDeleteID, 0);
  this.cmd("connect", toDeleteID, deletedID, "#000000", 0.1);
  this.cmd("Step");
  if (this.top == 1) {
    this.cmd("SetMessage", "head gets set to head->next which is null.");
    this.cmd("Step");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "head gets set to head->next.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd(
      "Connect",
      this.headID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1
    );
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deletedID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  this.nodeXByID.delete(deletedID);
  if (this.hasCurrentPointer && this.currentNodeID === deletedID) {
    this.cmd("Disconnect", this.currentID, deletedID);
    if (newHeadID != null) {
      this.cmd("connect", this.currentID, newHeadID, "#000000", 0.1, true, "", 2);
      this.currentNodeID = newHeadID;
    } else {
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
  }
  this.top = this.top - 1;
  this.recomputeLeftMostX();
  if (this.top === 0) {
    this.cmd("SetNull", this.headID, 1);
  }
  this.cmd("Step");
  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);
  this.cmd("SetMessage", "Deleted Value: " + this.arrayData[this.top]);
  this.cmd("Step");
  return this.commands;
};
LinkedListSimple.prototype.findElement = function(valueToFind) {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");
  const searchCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const searchCurrentLabelID = this.hasCurrentPointer ? this.nextIndex++ : this.currentLabelID;
  this.cmd(
    "CreateLabel",
    searchCurrentLabelID,
    "Current",
    CURRENT_LABEL_X2,
    CURRENT_LABEL_Y2
  );
  this.cmd(
    "CreateRectangle",
    searchCurrentID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    CURRENT_POS_X2,
    CURRENT_POS_Y2
  );
  this.cmd("SetNull", searchCurrentID, 0);
  this.cmd(
    "connect",
    searchCurrentID,
    this.linkedListElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2
  );
  this.cmd("Step");
  for (let i = this.top - 1; i >= 0; i--) {
    this.cmd("SetHighlight", this.linkedListElemID[i], 1);
    this.cmd("Step");
    if (String(this.arrayData[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", this.linkedListElemID[i], 0);
      this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[i]);
      this.cmd("Delete", searchCurrentID);
      this.cmd("Delete", searchCurrentLabelID);
      return this.commands;
    }
    this.cmd("SetHighlight", this.linkedListElemID[i], 0);
    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)"
      );
      this.cmd("Step");
      this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[i]);
      this.cmd(
        "connect",
        searchCurrentID,
        this.linkedListElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2
      );
      this.cmd("Step");
    }
  }
  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  this.cmd("Disconnect", searchCurrentID, this.linkedListElemID[0]);
  this.cmd("Delete", searchCurrentID);
  this.cmd("Delete", searchCurrentLabelID);
  return this.commands;
};
LinkedListSimple.prototype.printList = function(ignored) {
  this.commands = [];
  this.printOutput = "";
  if (this.top === 0) {
    this.cmd("SetMessage", "Printing list: <empty list>\nCurrent output: ");
    this.cmd("Step");
    this.cmd("SetMessage", "Final output: " + this.printOutput);
    this.cmd("Step");
    return this.commands;
  }
  this.cmd("SetMessage", "Printing list from head...");
  this.cmd("Step");
  const printCurrentID = this.hasCurrentPointer ? this.nextIndex++ : this.currentID;
  const printCurrentLabelID = this.hasCurrentPointer ? this.nextIndex++ : this.currentLabelID;
  this.cmd(
    "CreateLabel",
    printCurrentLabelID,
    "Current",
    CURRENT_LABEL_X2,
    CURRENT_LABEL_Y2
  );
  this.cmd(
    "CreateRectangle",
    printCurrentID,
    "",
    TOP_ELEM_WIDTH3,
    TOP_ELEM_HEIGHT3,
    CURRENT_POS_X2,
    CURRENT_POS_Y2
  );
  this.cmd("SetNull", printCurrentID, 0);
  this.cmd(
    "connect",
    printCurrentID,
    this.linkedListElemID[this.top - 1],
    "#000000",
    0.1,
    true,
    "",
    2
  );
  this.cmd("Step");
  for (let i = this.top - 1; i >= 0; i--) {
    const nodeID = this.linkedListElemID[i];
    const nodeValue = this.arrayData[i];
    this.cmd("SetHighlight", nodeID, 1);
    if (this.printOutput.length > 0) {
      this.printOutput += ", ";
    }
    this.printOutput += nodeValue;
    this.cmd(
      "SetMessage",
      "Print " + nodeValue + "\nCurrent output: " + this.printOutput
    );
    this.cmd("Step");
    this.cmd("SetHighlight", nodeID, 0);
    if (i > 0) {
      this.cmd(
        "SetMessage",
        "Advancing to next node. (current = current->next)\nCurrent output: " + this.printOutput
      );
      this.cmd("Step");
      this.cmd("Disconnect", printCurrentID, nodeID);
      this.cmd(
        "connect",
        printCurrentID,
        this.linkedListElemID[i - 1],
        "#000000",
        0.1,
        true,
        "",
        2
      );
      this.cmd("Step");
    }
  }
  this.cmd(
    "SetMessage",
    "Advancing to next node. (current = current->next)\nCurrent output: " + this.printOutput
  );
  this.cmd("Step");
  this.cmd("Disconnect", printCurrentID, this.linkedListElemID[0]);
  this.cmd("SetNull", printCurrentID, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Final output: " + this.printOutput);
  this.cmd("Step");
  this.cmd("Delete", printCurrentID);
  this.cmd("Delete", printCurrentLabelID);
  return this.commands;
};
LinkedListSimple.prototype.clearData = function() {
  this.commands = [];
  if (this.top == 0) {
    this.cmd("SetMessage", "");
    if (this.hasCurrentPointer) {
      this.cmd("Disconnect", this.currentID, this.currentNodeID);
      this.cmd("Delete", this.currentID);
      this.cmd("Delete", this.currentLabelID);
      this.hasCurrentPointer = false;
      this.currentNodeID = null;
    }
    this.cmd("SetNull", this.tempID, 1);
    this.cmd("SetAlpha", this.tempID, 0);
    this.cmd("SetAlpha", this.tempLabelID, 0);
    return this.commands;
  }
  this.cmd("SetMessage", "Clearing list...");
  this.cmd("Step");
  while (this.top > 0) {
    this.deleteFront("", true);
  }
  this.cmd("SetNull", this.headID, 1);
  this.cmd("SetNull", this.tempID, 1);
  this.cmd("SetAlpha", this.tempID, 0);
  this.cmd("SetAlpha", this.tempLabelID, 0);
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.nodeXByID = /* @__PURE__ */ new Map();
  this.leftMostX = LINKED_LIST_START_X3;
  if (this.hasCurrentPointer) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  return this.commands;
};

// AlgorithmLibrary/DoublyLinkedList.js
var LINKED_LIST_START_X4 = 100;
var LINKED_LIST_START_Y4 = 150;
var LINKED_LIST_ELEM_WIDTH4 = 70;
var LINKED_LIST_ELEM_HEIGHT4 = 25;
var LINKED_LIST_ELEM_SPACING4 = 80;
var TOP_POS_X4 = 150;
var TOP_POS_Y4 = 50;
var TOP_LABEL_Y4 = 25;
var TOP_ELEM_WIDTH4 = 40;
var TOP_ELEM_HEIGHT4 = 25;
var SIZE_POS_X2 = TOP_POS_X4 - TOP_ELEM_WIDTH4 * 2;
var SIZE_LABEL_X2 = SIZE_POS_X2;
var HEAD_PTR_POS_X = TOP_POS_X4;
var HEAD_PTR_LABEL_X = HEAD_PTR_POS_X;
var TAIL_PTR_POS_X = TOP_POS_X4 + TOP_ELEM_WIDTH4 * 2;
var TAIL_PTR_LABEL_X = TAIL_PTR_POS_X;
var TEMP_POS_X4 = TOP_POS_X4 + TOP_ELEM_WIDTH4 * 4;
var TEMP_LABEL_X4 = TEMP_POS_X4;
var TEMP_POS_Y4 = LINKED_LIST_START_Y4 + 100;
var TEMP_LABEL_Y4 = TEMP_POS_Y4 - 25;
var CURRENT_POS_X3 = TOP_POS_X4;
var CURRENT_LABEL_X3 = CURRENT_POS_X3;
var CURRENT_POS_Y3 = TEMP_POS_Y4;
var CURRENT_LABEL_Y3 = CURRENT_POS_Y3 - 25;
var ACTION_LABEL_X4 = TAIL_PTR_POS_X + TOP_ELEM_WIDTH4 * 3;
var ACTION_LABEL_Y4 = 25;
var SIZE4 = 32;
var LINK_INDEX_NEXT = 0;
var LINK_INDEX_PREV = 1;
var NUM_LINKS_DOUBLY = 2;
function DoublyLinkedList(opts = {}) {
  if (!opts.title)
    opts.title = "Doubly Linked List (Dummy Head/Tail)";
  opts.heightSingleMode = 260;
  opts.height = 320;
  opts.heightMobile = 470;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertBack.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
DoublyLinkedList.prototype = new Algorithm();
DoublyLinkedList.prototype.constructor = DoublyLinkedList;
DoublyLinkedList.superclass = Algorithm.prototype;
DoublyLinkedList.prototype.init = function(am, w2, h) {
  DoublyLinkedList.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.nodeIDs = [];
  this.values = [];
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doInsertBack = function(val) {
    this.implementAction(this.insertBack.bind(this), val);
  };
  this.doInsertFront = function(val) {
    this.implementAction(this.insertFront.bind(this), val);
  };
  this.doDeleteFront = function() {
    this.implementAction(this.deleteFront.bind(this));
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doClear = function() {
    this.implementAction(this.clearData.bind(this), "");
  };
  this.doMakeCurrentPointer = function() {
    this.implementAction(this.makeHeadPointer.bind(this), "");
  };
  this.doRemoveCurrentPointer = function() {
    this.implementAction(this.removeCurrentPointer.bind(this), "");
  };
  this.doAdvanceCurrent = function() {
    this.implementAction(this.advanceCurrent.bind(this), "");
  };
  this.doDeleteCurrent = function() {
    this.implementAction(this.deleteCurrent.bind(this), "");
  };
  this.doInsertAfterCurrent = function(val) {
    this.implementAction(this.insertAfterCurrent.bind(this), val);
  };
};
DoublyLinkedList.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert Back");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.controls.push(this.insertButton);
  this.insertFrontButton = addControlToAlgorithmBar("Button", "Insert Front");
  this.insertFrontButton.onclick = this.insertFrontCallback.bind(this);
  this.controls.push(this.insertFrontButton);
  this.deleteFrontButton = addControlToAlgorithmBar("Button", "Delete Front");
  this.deleteFrontButton.onclick = this.deleteFrontCallback.bind(this);
  this.controls.push(this.deleteFrontButton);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.controls.push(this.findButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  addSeparatorToAlgorithmBar();
  this.makeHeadPointerButton = addControlToAlgorithmBar(
    "Button",
    "Make current pointer"
  );
  this.makeHeadPointerButton.onclick = this.makeHeadPointerCallback.bind(this);
  this.controls.push(this.makeHeadPointerButton);
  this.removeCurrentPointerButton = addControlToAlgorithmBar(
    "Button",
    "Remove current pointer"
  );
  this.removeCurrentPointerButton.onclick = this.removeCurrentPointerCallback.bind(this);
  this.removeCurrentPointerButton.disabled = true;
  this.controls.push(this.removeCurrentPointerButton);
  this.advanceCurrentButton = addControlToAlgorithmBar("Button", "Advance current");
  this.advanceCurrentButton.onclick = this.advanceCurrentCallback.bind(this);
  this.advanceCurrentButton.disabled = true;
  this.controls.push(this.advanceCurrentButton);
  this.deleteNextButton = addControlToAlgorithmBar("Button", "Delete Current");
  this.deleteNextButton.onclick = this.deleteCurrentCallback.bind(this);
  this.deleteNextButton.disabled = true;
  this.controls.push(this.deleteNextButton);
  this.insertAfterCurrentButton = addControlToAlgorithmBar(
    "Button",
    "Insert After Current"
  );
  this.insertAfterCurrentButton.onclick = this.insertAfterCurrentCallback.bind(this);
  this.insertAfterCurrentButton.disabled = true;
  this.controls.push(this.insertAfterCurrentButton);
};
DoublyLinkedList.prototype.enableUI = function() {
  for (let i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
  if (this.hasCurrentPointer) {
    if (this.insertButton)
      this.insertButton.disabled = true;
    if (this.insertFrontButton)
      this.insertFrontButton.disabled = true;
    if (this.deleteFrontButton)
      this.deleteFrontButton.disabled = true;
    if (this.findButton)
      this.findButton.disabled = true;
    if (this.clearButton)
      this.clearButton.disabled = true;
    if (this.makeHeadPointerButton)
      this.makeHeadPointerButton.disabled = true;
    if (this.advanceCurrentButton)
      this.advanceCurrentButton.disabled = false;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = false;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = false;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = false;
  } else {
    if (this.advanceCurrentButton)
      this.advanceCurrentButton.disabled = true;
    if (this.removeCurrentPointerButton)
      this.removeCurrentPointerButton.disabled = true;
    if (this.deleteNextButton)
      this.deleteNextButton.disabled = true;
    if (this.insertAfterCurrentButton)
      this.insertAfterCurrentButton.disabled = true;
  }
};
DoublyLinkedList.prototype.disableUI = function() {
  for (let i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
DoublyLinkedList.prototype.setup = function() {
  this.commands = [];
  this.sizeID = this.nextIndex++;
  this.sizeLabelID = this.nextIndex++;
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;
  this.tempID = this.nextIndex++;
  this.tempLabelID = this.nextIndex++;
  this.currentID = this.nextIndex++;
  this.currentLabelID = this.nextIndex++;
  this.leftoverLabelID = this.nextIndex++;
  this.dummyHeadID = this.nextIndex++;
  this.dummyTailID = this.nextIndex++;
  this.cmd("CreateLabel", this.sizeLabelID, "Size", SIZE_LABEL_X2, TOP_LABEL_Y4);
  this.cmd(
    "CreateRectangle",
    this.sizeID,
    "",
    TOP_ELEM_WIDTH4,
    TOP_ELEM_HEIGHT4,
    SIZE_POS_X2,
    TOP_POS_Y4
  );
  this.cmd("SetText", this.sizeID, "0");
  this.cmd("CreateLabel", this.headLabelID, "Head", HEAD_PTR_LABEL_X, TOP_LABEL_Y4);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH4,
    TOP_ELEM_HEIGHT4,
    HEAD_PTR_POS_X,
    TOP_POS_Y4
  );
  this.cmd("SetNull", this.headID, 0);
  this.cmd("CreateLabel", this.tailLabelID, "Tail", TAIL_PTR_LABEL_X, TOP_LABEL_Y4);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH4,
    TOP_ELEM_HEIGHT4,
    TAIL_PTR_POS_X,
    TOP_POS_Y4
  );
  this.cmd("SetNull", this.tailID, 0);
  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, ACTION_LABEL_Y4, 0);
  this.cmd(
    "CreateLinkedList",
    this.dummyHeadID,
    "",
    LINKED_LIST_ELEM_WIDTH4,
    LINKED_LIST_ELEM_HEIGHT4,
    LINKED_LIST_START_X4,
    LINKED_LIST_START_Y4,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY
  );
  this.cmd("SetText", this.dummyHeadID, "H");
  this.cmd(
    "CreateLinkedList",
    this.dummyTailID,
    "",
    LINKED_LIST_ELEM_WIDTH4,
    LINKED_LIST_ELEM_HEIGHT4,
    LINKED_LIST_START_X4 + LINKED_LIST_ELEM_SPACING4,
    LINKED_LIST_START_Y4 + 15,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY
  );
  this.cmd("SetText", this.dummyTailID, "T");
  this.cmd("SetNull", this.dummyHeadID, 1, LINK_INDEX_PREV);
  this.cmd("SetNull", this.dummyTailID, 1, LINK_INDEX_NEXT);
  this.cmd("SetNull", this.dummyHeadID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", this.dummyTailID, 0, LINK_INDEX_PREV);
  this.cmd("Connect", this.dummyHeadID, this.dummyTailID, "#000000", 0.1);
  this.cmd(
    "Connect",
    this.dummyTailID,
    this.dummyHeadID,
    "#000000",
    0.1,
    true,
    "",
    1
  );
  this.cmd("Connect", this.headID, this.dummyHeadID, "#000000", 0.1);
  this.cmd("Connect", this.tailID, this.dummyTailID, "#000000", -0.1, true);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
DoublyLinkedList.prototype.resetPositions = function() {
  const all = [this.dummyHeadID, ...this.nodeIDs, this.dummyTailID];
  for (let i = 0; i < all.length; i++) {
    const x = LINKED_LIST_START_X4 + LINKED_LIST_ELEM_SPACING4 * i;
    const y = LINKED_LIST_START_Y4 + i % 2 * 15;
    this.cmd("Move", all[i], x, y);
  }
};
DoublyLinkedList.prototype.insertCallback = function() {
  if (this.hasCurrentPointer)
    return;
  if (this.nodeIDs.length >= SIZE4)
    return;
  if (this.inputField.value === "")
    return;
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertBack.bind(this), value);
};
DoublyLinkedList.prototype.insertFrontCallback = function() {
  if (this.hasCurrentPointer)
    return;
  if (this.nodeIDs.length >= SIZE4)
    return;
  if (this.inputField.value === "")
    return;
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertFront.bind(this), value);
};
DoublyLinkedList.prototype.deleteFrontCallback = function() {
  if (this.hasCurrentPointer)
    return;
  this.implementAction(this.deleteFront.bind(this), "");
};
DoublyLinkedList.prototype.findCallback = function() {
  if (this.hasCurrentPointer)
    return;
  const findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue !== "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
DoublyLinkedList.prototype.clearCallback = function() {
  if (this.hasCurrentPointer)
    return;
  this.implementAction(this.clearData.bind(this), "");
};
DoublyLinkedList.prototype.makeHeadPointerCallback = function() {
  this.implementAction(this.makeHeadPointer.bind(this), "");
};
DoublyLinkedList.prototype.removeCurrentPointerCallback = function() {
  this.implementAction(this.removeCurrentPointer.bind(this), "");
};
DoublyLinkedList.prototype.advanceCurrentCallback = function() {
  this.implementAction(this.advanceCurrent.bind(this), "");
};
DoublyLinkedList.prototype.deleteCurrentCallback = function() {
  this.implementAction(this.deleteCurrent.bind(this), "");
};
DoublyLinkedList.prototype.insertAfterCurrentCallback = function() {
  const value = this.inputField.value;
  this.inputField.value = "";
  this.implementAction(this.insertAfterCurrent.bind(this), value);
};
DoublyLinkedList.prototype.makeHeadPointer = function() {
  this.commands = [];
  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "List is empty; no node to point at.");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const headNodeID = this.nodeIDs[0];
  this.cmd("SetMessage", "Create current pointer at head");
  this.cmd("Step");
  if (!this.hasCurrentPointer) {
    this.cmd(
      "CreateLabel",
      this.currentLabelID,
      "Current",
      CURRENT_LABEL_X3,
      CURRENT_LABEL_Y3
    );
    this.cmd(
      "CreateRectangle",
      this.currentID,
      "",
      TOP_ELEM_WIDTH4,
      TOP_ELEM_HEIGHT4,
      CURRENT_POS_X3,
      CURRENT_POS_Y3
    );
    this.cmd("SetNull", this.currentID, 0);
    this.hasCurrentPointer = true;
  } else {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 0);
  }
  this.cmd("Connect", this.currentID, headNodeID, "#000000", 0.1, true, "", 2);
  this.currentNodeID = headNodeID;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.removeCurrentPointer = function() {
  this.commands = [];
  if (!this.hasCurrentPointer)
    return this.commands;
  this.cmd("SetMessage", "Remove current pointer");
  if (this.currentNodeID != null) {
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
  }
  this.cmd("Delete", this.currentID);
  this.cmd("Delete", this.currentLabelID);
  this.hasCurrentPointer = false;
  this.currentNodeID = null;
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.advanceCurrent = function() {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  const next = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;
  if (next === this.dummyTailID) {
    this.cmd("SetMessage", "Current is at last node; advancing reaches dummy tail");
    this.cmd("Step");
    this.cmd("Disconnect", this.currentID, this.currentNodeID);
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.cmd("SetMessage", "Advance current to next node (current = current->next)");
  this.cmd("Step");
  this.cmd("Disconnect", this.currentID, this.currentNodeID);
  this.cmd("Connect", this.currentID, next, "#000000", 0.1, true, "", 2);
  this.currentNodeID = next;
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.createTempPointer = function(label, x, y, targetID) {
  const ptrID = this.nextIndex++;
  const ptrLabelID = this.nextIndex++;
  this.cmd("CreateLabel", ptrLabelID, label, x, y - 25);
  this.cmd("CreateRectangle", ptrID, "", TOP_ELEM_WIDTH4, TOP_ELEM_HEIGHT4, x, y);
  this.cmd("SetNull", ptrID, 0);
  this.cmd("Connect", ptrID, targetID, "#000000", 0.1);
  return { ptrID, ptrLabelID };
};
DoublyLinkedList.prototype.insertBack = function(value) {
  this.commands = [];
  const newNodeID = this.nextIndex++;
  const oldLast = this.nodeIDs.length > 0 ? this.nodeIDs[this.nodeIDs.length - 1] : this.dummyHeadID;
  let tailX = LINKED_LIST_START_X4 + LINKED_LIST_ELEM_SPACING4 * (this.nodeIDs.length + 1);
  let tailY = LINKED_LIST_START_Y4 + (this.nodeIDs.length + 1) % 2 * 15;
  try {
    tailX = this.animationManager.animatedObjects.getNodeX(this.dummyTailID);
    tailY = this.animationManager.animatedObjects.getNodeY(this.dummyTailID);
  } catch (e) {
  }
  this.cmd("SetMessage", "Insert at tail: " + value);
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH4,
    LINKED_LIST_ELEM_HEIGHT4,
    tailX,
    tailY + 50,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
  this.cmd("CreateLabel", this.tempLabelID, "newNode", TEMP_LABEL_X4, TEMP_LABEL_Y4);
  this.cmd(
    "CreateRectangle",
    this.tempID,
    "",
    TOP_ELEM_WIDTH4,
    TOP_ELEM_HEIGHT4,
    TEMP_POS_X4,
    TEMP_POS_Y4
  );
  this.cmd("SetNull", this.tempID, 0);
  this.cmd("Connect", this.tempID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->prev and newNode->next");
  this.cmd("Connect", newNodeID, this.dummyTailID, "#000000", 0.1);
  this.cmd("Connect", newNodeID, oldLast, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update oldLast.next and dummyTail.prev");
  this.cmd("Disconnect", oldLast, this.dummyTailID);
  this.cmd("Connect", oldLast, newNodeID, "#000000", 0.1);
  this.cmd("Disconnect", this.dummyTailID, oldLast);
  this.cmd("Connect", this.dummyTailID, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("Disconnect", this.tempID, newNodeID);
  this.cmd("Delete", this.tempID);
  this.cmd("Delete", this.tempLabelID);
  this.nodeIDs.push(newNodeID);
  this.values.push(value);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes. (Just for clarity, not part of algorithm)");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.insertFront = function(value) {
  this.commands = [];
  const newNodeID = this.nextIndex++;
  const oldFirst = this.nodeIDs.length > 0 ? this.nodeIDs[0] : this.dummyTailID;
  let headX = LINKED_LIST_START_X4;
  let headY = LINKED_LIST_START_Y4;
  try {
    headX = this.animationManager.animatedObjects.getNodeX(this.dummyHeadID);
    headY = this.animationManager.animatedObjects.getNodeY(this.dummyHeadID);
  } catch (e) {
  }
  this.cmd("SetMessage", "insertStart(" + value + ")");
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH4,
    LINKED_LIST_ELEM_HEIGHT4,
    headX,
    headY + 50,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
  this.cmd("Step");
  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  const { ptrID: newPtrID, ptrLabelID: newPtrLabelID } = this.createTempPointer(
    "newNode",
    TEMP_POS_X4 + TOP_ELEM_WIDTH4 * 2,
    TEMP_POS_Y4,
    newNodeID
  );
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->prev and newNode->next");
  this.cmd("Connect", newNodeID, oldFirst, "#000000", 0.1);
  this.cmd("Connect", newNodeID, this.dummyHeadID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update dummyHead.next and oldFirst.prev");
  this.cmd("Disconnect", this.dummyHeadID, oldFirst);
  this.cmd("Connect", this.dummyHeadID, newNodeID, "#000000", 0.1);
  this.cmd("Disconnect", oldFirst, this.dummyHeadID);
  this.cmd("Connect", oldFirst, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.nodeIDs.unshift(newNodeID);
  this.values.unshift(value);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("Disconnect", newPtrID, newNodeID);
  this.cmd("SetNull", newPtrID, 1);
  this.cmd("Delete", newPtrID);
  this.cmd("Delete", newPtrLabelID);
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.deleteFront = function() {
  this.commands = [];
  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "List is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const deleteNodeID = this.nodeIDs[0];
  const after = this.nodeIDs.length > 1 ? this.nodeIDs[1] : this.dummyTailID;
  this.cmd("SetMessage", "Delete front: bypass first node");
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");
  this.cmd("Disconnect", this.dummyHeadID, deleteNodeID);
  this.cmd("Connect", this.dummyHeadID, after, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("Disconnect", after, deleteNodeID);
  this.cmd("Connect", after, this.dummyHeadID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");
  this.nodeIDs.shift();
  this.values.shift();
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.deleteNext = function() {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  if (idx + 1 >= this.nodeIDs.length) {
    this.cmd("SetMessage", "Current has no next node (next is dummy tail)");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const deleteNodeID = this.nodeIDs[idx + 1];
  const after = idx + 2 < this.nodeIDs.length ? this.nodeIDs[idx + 2] : this.dummyTailID;
  this.cmd("SetMessage", "Delete next: identify node after current. (current->next)");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");
  const { ptrID: toDeleteID, ptrLabelID: toDeleteLabelID } = this.createTempPointer("toDelete", TEMP_POS_X4 + TOP_ELEM_WIDTH4 * 2, TEMP_POS_Y4, deleteNodeID);
  this.cmd("Step");
  this.cmd(
    "SetMessage",
    "Update current->next to skip over next node (toDelete still points at it)"
  );
  this.cmd("Disconnect", this.currentNodeID, deleteNodeID);
  this.cmd("Connect", this.currentNodeID, after, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update after.prev to point back to current");
  this.cmd("Disconnect", after, deleteNodeID);
  this.cmd("Connect", after, this.currentNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Delete the removed node");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  this.nodeIDs.splice(idx + 1, 1);
  this.values.splice(idx + 1, 1);
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("SetHighlight", this.currentNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.deleteCurrent = function() {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    return this.commands;
  }
  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  const deleteNodeID = this.currentNodeID;
  const prevNodeID = idx - 1 >= 0 ? this.nodeIDs[idx - 1] : this.dummyHeadID;
  const nextNodeID = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;
  this.cmd("SetMessage", "Delete current: identify node to remove");
  this.cmd("SetHighlight", deleteNodeID, 1);
  this.cmd("Step");
  const { ptrID: toDeleteID, ptrLabelID: toDeleteLabelID } = this.createTempPointer(
    "toDelete",
    TEMP_POS_X4 + TOP_ELEM_WIDTH4 * 2,
    TEMP_POS_Y4,
    deleteNodeID
  );
  this.cmd("Step");
  this.cmd("SetMessage", "Update prev->next to skip current");
  this.cmd("Disconnect", prevNodeID, deleteNodeID);
  this.cmd("Connect", prevNodeID, nextNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update next->prev to skip current");
  this.cmd("Disconnect", nextNodeID, deleteNodeID);
  this.cmd("Connect", nextNodeID, prevNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Move Current pointer off the deleted node");
  this.cmd("Disconnect", this.currentID, deleteNodeID);
  let newCurrentNodeID = null;
  if (nextNodeID !== this.dummyTailID) {
    newCurrentNodeID = nextNodeID;
  } else if (prevNodeID !== this.dummyHeadID) {
    newCurrentNodeID = prevNodeID;
  }
  if (newCurrentNodeID != null) {
    this.cmd("Connect", this.currentID, newCurrentNodeID, "#000000", 0.1, true, "", 2);
    this.currentNodeID = newCurrentNodeID;
  } else {
    this.cmd("SetNull", this.currentID, 1);
    this.cmd("Step");
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete the removed node (tracked by toDelete)");
  this.cmd("Delete", deleteNodeID);
  this.cmd("Step");
  this.cmd("Disconnect", toDeleteID, deleteNodeID);
  this.cmd("SetNull", toDeleteID, 1);
  this.cmd("Delete", toDeleteID);
  this.cmd("Delete", toDeleteLabelID);
  this.nodeIDs.splice(idx, 1);
  this.values.splice(idx, 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("SetHighlight", deleteNodeID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.insertAfterCurrent = function(value) {
  this.commands = [];
  if (!this.hasCurrentPointer || this.currentNodeID == null) {
    this.cmd("SetMessage", "No current pointer");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (this.nodeIDs.length >= SIZE4) {
    this.cmd("SetMessage", "List is full");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (value == null || String(value).trim() === "") {
    this.cmd("SetMessage", "Enter a value to insert");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const idx = this.nodeIDs.indexOf(this.currentNodeID);
  if (idx < 0) {
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    return this.commands;
  }
  const oldNext = idx + 1 < this.nodeIDs.length ? this.nodeIDs[idx + 1] : this.dummyTailID;
  const newNodeID = this.nextIndex++;
  let spawnX = LINKED_LIST_START_X4;
  let spawnY = LINKED_LIST_START_Y4;
  try {
    spawnX = this.animationManager.animatedObjects.getNodeX(this.currentNodeID);
    spawnY = this.animationManager.animatedObjects.getNodeY(this.currentNodeID);
  } catch (e) {
  }
  this.cmd("SetMessage", "Insert after current: create new node");
  this.cmd("SetHighlight", this.currentNodeID, 1);
  if (oldNext !== this.dummyTailID)
    this.cmd("SetHighlight", oldNext, 1);
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    newNodeID,
    "",
    LINKED_LIST_ELEM_WIDTH4,
    LINKED_LIST_ELEM_HEIGHT4,
    spawnX,
    spawnY + 50,
    0.25,
    0,
    1,
    1,
    NUM_LINKS_DOUBLY
  );
  this.cmd("SetText", newNodeID, value);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_NEXT);
  this.cmd("SetNull", newNodeID, 0, LINK_INDEX_PREV);
  this.cmd("Step");
  this.cmd("SetMessage", "Use temporary newNode pointer to track node");
  const { ptrID: newPtrID, ptrLabelID: newPtrLabelID } = this.createTempPointer(
    "newNode",
    TEMP_POS_X4 + TOP_ELEM_WIDTH4 * 2,
    TEMP_POS_Y4,
    newNodeID
  );
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->next to current->next");
  this.cmd("Connect", newNodeID, oldNext, "#000000", 0.1);
  this.cmd("Step");
  this.cmd("SetMessage", "Set newNode->prev to current");
  this.cmd("Connect", newNodeID, this.currentNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update newNode->next->prev to newNode");
  this.cmd("Disconnect", oldNext, this.currentNodeID);
  this.cmd("Connect", oldNext, newNodeID, "#000000", 0.1, true, "", 1);
  this.cmd("Step");
  this.cmd("SetMessage", "Update current->next to new node");
  this.cmd("Disconnect", this.currentNodeID, oldNext);
  this.cmd("Connect", this.currentNodeID, newNodeID, "#000000", 0.1);
  this.cmd("Step");
  this.nodeIDs.splice(idx + 1, 0, newNodeID);
  this.values.splice(idx + 1, 0, value);
  this.cmd("Step");
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, String(this.nodeIDs.length));
  this.cmd("Step");
  this.cmd("SetMessage", "Position nodes (just for clarity, not part of algorithm)");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("Disconnect", newPtrID, newNodeID);
  this.cmd("SetNull", newPtrID, 1);
  this.cmd("Delete", newPtrID);
  this.cmd("Delete", newPtrLabelID);
  this.cmd("SetHighlight", this.currentNodeID, 0);
  if (oldNext !== this.dummyTailID)
    this.cmd("SetHighlight", oldNext, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.findElement = function(valueToFind) {
  this.commands = [];
  if (this.nodeIDs.length === 0) {
    this.cmd("SetMessage", "Searching for " + valueToFind + ": <empty list>");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.cmd("SetMessage", "Searching for " + valueToFind + " from head...");
  this.cmd("Step");
  for (let i = 0; i < this.nodeIDs.length; i++) {
    const id = this.nodeIDs[i];
    this.cmd("SetHighlight", id, 1);
    this.cmd("Step");
    if (String(this.values[i]) === String(valueToFind)) {
      this.cmd("SetMessage", "Found: " + valueToFind);
      this.cmd("Step");
      this.cmd("SetHighlight", id, 0);
      this.cmd("SetMessage", "");
      return this.commands;
    }
    this.cmd("SetHighlight", id, 0);
  }
  this.cmd("SetMessage", "Not found: " + valueToFind);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
DoublyLinkedList.prototype.clearData = function() {
  this.commands = [];
  this.cmd("SetMessage", "Clear list");
  this.cmd("Step");
  if (this.hasCurrentPointer) {
    if (this.currentNodeID != null) {
      this.cmd("Disconnect", this.currentID, this.currentNodeID);
    }
    this.cmd("Delete", this.currentID);
    this.cmd("Delete", this.currentLabelID);
    this.hasCurrentPointer = false;
    this.currentNodeID = null;
  }
  for (let i = 0; i < this.nodeIDs.length; i++) {
    this.cmd("Delete", this.nodeIDs[i]);
  }
  this.nodeIDs = [];
  this.values = [];
  this.cmd("SetMessage", "Update size display");
  this.cmd("Step");
  this.cmd("SetText", this.sizeID, "0");
  this.cmd("Step");
  this.cmd("Disconnect", this.dummyHeadID, this.dummyTailID);
  this.cmd("Disconnect", this.dummyTailID, this.dummyHeadID);
  this.cmd("Connect", this.dummyHeadID, this.dummyTailID, "#000000", 0.1);
  this.cmd(
    "Connect",
    this.dummyTailID,
    this.dummyHeadID,
    "#000000",
    -0.1,
    true,
    "",
    1
  );
  this.cmd("SetMessage", "Position nodes");
  this.resetPositions();
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};

// AlgorithmLibrary/OpenHash.js
function OpenHash(canvas2) {
  let am;
  let w2;
  let h;
  const opts = canvas2 || {};
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Open Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts2 = canvas2 || {};
    const viewWidth = Number.isFinite(opts2.viewWidth) && opts2.viewWidth > 0 ? opts2.viewWidth : Number.isFinite(opts2.width) && opts2.width > 0 ? opts2.width : 1e3;
    const viewHeight = Number.isFinite(opts2.viewHeight) && opts2.viewHeight > 0 ? opts2.viewHeight : Number.isFinite(opts2.height) && opts2.height > 0 ? opts2.height : 500;
    am = initAnimationManager({
      title: opts2.title || "Open Hashing",
      height: opts2.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts2
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h);
  if (opts && Array.isArray(opts.initialData)) {
    const hasString = opts.initialData.some((d) => typeof d === "string");
    if (hasString) {
      this.changeHashTypeCallback(false);
    }
  }
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
var POINTER_ARRAY_ELEM_WIDTH = 50;
var POINTER_ARRAY_ELEM_HEIGHT = 30;
var POINTER_ARRAY_ELEM_START_X = 30;
var LINKED_ITEM_HEIGHT = 30;
var LINKED_ITEM_WIDTH = 50;
var LINKED_ITEM_Y_DELTA = 50;
var HASH_TABLE_SIZE = 13;
var ARRAY_Y_POS4 = 300;
var INDEX_COLOR2 = "#0000FF";
OpenHash.prototype = new Hash();
OpenHash.prototype.constructor = OpenHash;
OpenHash.superclass = Hash.prototype;
OpenHash.prototype.init = function(am, w2, h) {
  var sc = OpenHash.superclass;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.nextIndex = 0;
  this.POINTER_ARRAY_ELEM_Y = ARRAY_Y_POS4;
  this.setup();
};
OpenHash.prototype.addControls = function() {
  OpenHash.superclass.addControls.call(this);
};
OpenHash.prototype.insertElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting element: " + String(elem));
  var index = this.doHash(elem);
  var node = new LinkedListNode(elem, this.nextIndex++, 100, 75);
  this.cmd(
    "CreateLinkedList",
    node.graphicID,
    elem,
    LINKED_ITEM_WIDTH,
    LINKED_ITEM_HEIGHT,
    100,
    75
  );
  if (this.hashTableValues[index] != null && this.hashTableValues[index] != void 0) {
    this.cmd("connect", node.graphicID, this.hashTableValues[index].graphicID);
    this.cmd(
      "disconnect",
      this.hashTableVisual[index],
      this.hashTableValues[index].graphicID
    );
  } else {
    this.cmd("SetNull", node.graphicID, 1);
    this.cmd("SetNull", this.hashTableVisual[index], 0);
  }
  this.cmd("connect", this.hashTableVisual[index], node.graphicID);
  node.next = this.hashTableValues[index];
  this.hashTableValues[index] = node;
  this.repositionList(index);
  this.cmd("SetMessage", "");
  return this.commands;
};
OpenHash.prototype.repositionList = function(index) {
  var startX = POINTER_ARRAY_ELEM_START_X + index * POINTER_ARRAY_ELEM_WIDTH;
  var startY = this.POINTER_ARRAY_ELEM_Y - LINKED_ITEM_Y_DELTA;
  var tmp = this.hashTableValues[index];
  while (tmp != null) {
    tmp.x = startX;
    tmp.y = startY;
    this.cmd("Move", tmp.graphicID, tmp.x, tmp.y);
    startY = startY - LINKED_ITEM_Y_DELTA;
    tmp = tmp.next;
  }
};
OpenHash.prototype.deleteElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Deleting element: " + elem);
  var index = this.doHash(elem);
  if (this.hashTableValues[index] == null) {
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
    return this.commands;
  }
  this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 1);
  this.cmd("Step");
  this.cmd("SetHighlight", this.hashTableValues[index].graphicID, 0);
  if (this.hashTableValues[index].data == elem) {
    if (this.hashTableValues[index].next != null) {
      this.cmd(
        "Connect",
        this.hashTableVisual[index],
        this.hashTableValues[index].next.graphicID
      );
    } else {
      this.cmd("SetNull", this.hashTableVisual[index], 1);
    }
    this.cmd("Delete", this.hashTableValues[index].graphicID);
    this.hashTableValues[index] = this.hashTableValues[index].next;
    this.repositionList(index);
    return this.commands;
  }
  var tmpPrev = this.hashTableValues[index];
  var tmp = this.hashTableValues[index].next;
  var found = false;
  while (tmp != null && !found) {
    this.cmd("SetHighlight", tmp.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tmp.graphicID, 0);
    if (tmp.data == elem) {
      found = true;
      this.cmd("SetMessage", "Deleting element: " + elem + "  Element deleted");
      if (tmp.next != null) {
        this.cmd("Connect", tmpPrev.graphicID, tmp.next.graphicID);
      } else {
        this.cmd("SetNull", tmpPrev.graphicID, 1);
      }
      tmpPrev.next = tmpPrev.next.next;
      this.cmd("Delete", tmp.graphicID);
      this.repositionList(index);
    } else {
      tmpPrev = tmp;
      tmp = tmp.next;
    }
  }
  if (!found) {
    this.cmd("SetMessage", "Deleting element: " + elem + "  Element not in table");
  }
  return this.commands;
};
OpenHash.prototype.findElement = function(elem) {
  this.commands = new Array();
  this.cmd("SetMessage", "Finding Element: " + elem);
  var index = this.doHash(elem);
  var compareIndex = this.nextIndex++;
  var found = false;
  var tmp = this.hashTableValues[index];
  this.cmd("CreateLabel", compareIndex, "", 10, 40, 0);
  while (tmp != null && !found) {
    this.cmd("SetHighlight", tmp.graphicID, 1);
    if (tmp.data == elem) {
      this.cmd("SetText", compareIndex, tmp.data + "==" + elem);
      found = true;
    } else {
      this.cmd("SetText", compareIndex, tmp.data + "!=" + elem);
    }
    this.cmd("Step");
    this.cmd("SetHighlight", tmp.graphicID, 0);
    tmp = tmp.next;
  }
  if (found) {
    this.cmd("SetMessage", "Finding Element: " + elem + "  Found!");
  } else {
    this.cmd("SetMessage", "Finding Element: " + elem + "  Not Found!");
  }
  this.cmd("Delete", compareIndex);
  this.nextIndex--;
  return this.commands;
};
OpenHash.prototype.doInsert = function(value) {
  return this.implementAction(this.insertElement.bind(this), value);
};
OpenHash.prototype.doRemove = function(value) {
  return this.implementAction(this.deleteElement.bind(this), value);
};
OpenHash.prototype.doFind = function(value) {
  return this.implementAction(this.findElement.bind(this), value);
};
OpenHash.prototype.doGrow = function(newSize) {
  return [];
};
OpenHash.prototype.setup = function() {
  this.hashTableVisual = new Array(HASH_TABLE_SIZE);
  this.hashTableIndices = new Array(HASH_TABLE_SIZE);
  this.hashTableValues = new Array(HASH_TABLE_SIZE);
  this.indexXPos = new Array(HASH_TABLE_SIZE);
  this.indexYPos = new Array(HASH_TABLE_SIZE);
  this.ExplainLabel = this.nextIndex++;
  this.table_size = HASH_TABLE_SIZE;
  this.commands = [];
  for (var i = 0; i < HASH_TABLE_SIZE; i++) {
    var nextID = this.nextIndex++;
    this.cmd(
      "CreateRectangle",
      nextID,
      "",
      POINTER_ARRAY_ELEM_WIDTH,
      POINTER_ARRAY_ELEM_HEIGHT,
      POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH,
      this.POINTER_ARRAY_ELEM_Y
    );
    this.hashTableVisual[i] = nextID;
    this.cmd("SetNull", this.hashTableVisual[i], 1);
    nextID = this.nextIndex++;
    this.hashTableIndices[i] = nextID;
    this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH;
    this.indexYPos[i] = this.POINTER_ARRAY_ELEM_Y + POINTER_ARRAY_ELEM_HEIGHT;
    this.hashTableValues[i] = null;
    this.cmd("CreateLabel", nextID, i, this.indexXPos[i], this.indexYPos[i]);
    this.cmd("SetForegroundColor", nextID, INDEX_COLOR2);
  }
  this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.resetIndex = this.nextIndex;
};
OpenHash.prototype.resetAll = function() {
  var tmp;
  this.commands = OpenHash.superclass.resetAll.call(this);
  for (var i = 0; i < this.hashTableValues.length; i++) {
    tmp = this.hashTableValues[i];
    if (tmp != null) {
      while (tmp != null) {
        this.cmd("Delete", tmp.graphicID);
        tmp = tmp.next;
      }
      this.hashTableValues[i] = null;
      this.cmd("SetNull", this.hashTableVisual[i], 1);
    }
  }
  return this.commands;
};
OpenHash.prototype.reset = function() {
  for (var i = 0; i < this.table_size; i++) {
    this.hashTableValues[i] = null;
  }
  this.nextIndex = this.resetIndex;
  OpenHash.superclass.reset.call(this);
};
OpenHash.prototype.resetCallback = function(event) {
};
OpenHash.prototype.disableUI = function(event) {
  var sc = OpenHash.superclass;
  var fn = sc.disableUI;
  fn.call(this);
};
OpenHash.prototype.enableUI = function(event) {
  OpenHash.superclass.enableUI.call(this);
};
function LinkedListNode(val, id, initialX, initialY) {
  this.data = val;
  this.graphicID = id;
  this.x = initialX;
  this.y = initialY;
  this.next = null;
}

// AlgorithmLibrary/QueueArray.js
var ARRAY_START_X = 100;
var ARRAY_START_Y = 100;
var ARRAY_ELEM_WIDTH5 = 35;
var ARRAY_ELEM_HEIGHT5 = 20;
var ARRAY_ELEMS_PER_LINE = 10;
var ARRAY_LINE_SPACING = 130;
var HEAD_LABEL_X = 100;
var HEAD_POS_X = HEAD_LABEL_X + 50;
var HEAD_POS_Y = 30;
var HEAD_LABEL_Y = HEAD_POS_Y;
var TAIL_POS_X4 = HEAD_LABEL_X + 180;
var TAIL_POS_Y = HEAD_POS_Y;
var TAIL_LABEL_X3 = HEAD_LABEL_X + 130;
var TAIL_LABEL_Y = HEAD_POS_Y;
var QUEUE_LABEL_X = HEAD_LABEL_X + 280;
var QUEUE_LABEL_Y = 30;
var QUEUE_ELEMENT_X = HEAD_LABEL_X + 280;
var QUEUE_ELEMENT_Y = 30;
var INDEX_COLOR3 = "#0000FF";
var SIZE5 = 8;
function QueueArray(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Queue (Array)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  if (opts.size)
    SIZE5 = opts.size;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.enqueue.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
QueueArray.prototype = new Algorithm();
QueueArray.prototype.constructor = QueueArray;
QueueArray.superclass = Algorithm.prototype;
QueueArray.prototype.init = function(am, w2, h) {
  QueueArray.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doEnqueue = function(val) {
    this.implementAction(this.enqueue.bind(this), val);
  };
  this.doDequeue = function() {
    this.implementAction(this.dequeue.bind(this));
  };
};
QueueArray.prototype.addControls = function() {
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.setAttribute("placeholder", "Value to enqueue");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.enqueueCallback.bind(this),
    6
  );
  this.enqueueButton = addControlToAlgorithmBar("Button", "Enqueue");
  this.enqueueButton.onclick = this.enqueueCallback.bind(this);
  this.controls.push(this.enqueueButton);
  this.dequeueButton = addControlToAlgorithmBar("Button", "Dequeue");
  this.dequeueButton.onclick = this.dequeueCallback.bind(this);
  this.controls.push(this.dequeueButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear Queue");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
};
QueueArray.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
QueueArray.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
QueueArray.prototype.setup = function() {
  this.nextIndex = 0;
  this.arrayID = new Array(SIZE5);
  this.arrayLabelID = new Array(SIZE5);
  for (var i = 0; i < SIZE5; i++) {
    this.arrayID[i] = this.nextIndex++;
    this.arrayLabelID[i] = this.nextIndex++;
  }
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE5);
  this.head = 0;
  this.tail = 0;
  this.leftoverLabelID = this.nextIndex++;
  for (var i = 0; i < SIZE5; i++) {
    var xpos = i % ARRAY_ELEMS_PER_LINE * ARRAY_ELEM_WIDTH5 + ARRAY_START_X;
    var ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
    this.cmd(
      "CreateRectangle",
      this.arrayID[i],
      "",
      ARRAY_ELEM_WIDTH5,
      ARRAY_ELEM_HEIGHT5,
      xpos,
      ypos
    );
    this.cmd(
      "CreateLabel",
      this.arrayLabelID[i],
      i,
      xpos,
      ypos + ARRAY_ELEM_HEIGHT5
    );
    this.cmd("SetForegroundColor", this.arrayLabelID[i], INDEX_COLOR3);
  }
  this.cmd("CreateLabel", this.headLabelID, "Start", HEAD_LABEL_X, HEAD_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.headID,
    0,
    ARRAY_ELEM_WIDTH5,
    ARRAY_ELEM_HEIGHT5,
    HEAD_POS_X,
    HEAD_POS_Y
  );
  this.cmd("CreateLabel", this.tailLabelID, "End", TAIL_LABEL_X3, TAIL_LABEL_Y);
  this.cmd(
    "CreateRectangle",
    this.tailID,
    0,
    ARRAY_ELEM_WIDTH5,
    ARRAY_ELEM_HEIGHT5,
    TAIL_POS_X4,
    TAIL_POS_Y
  );
  this.cmd(
    "CreateLabel",
    this.leftoverLabelID,
    "",
    QUEUE_LABEL_X,
    QUEUE_LABEL_Y
  );
  this.initialIndex = this.nextIndex;
  this.highlight1ID = this.nextIndex++;
  this.highlight2ID = this.nextIndex++;
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
QueueArray.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};
QueueArray.prototype.enqueueCallback = function(event) {
  if (this.inputField.value != "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.enqueue.bind(this), pushVal);
  }
};
QueueArray.prototype.dequeueCallback = function(event) {
  this.implementAction(this.dequeue.bind(this), "");
};
QueueArray.prototype.clearCallback = function(event) {
  this.implementAction(this.clearAll.bind(this), "");
};
QueueArray.prototype.enqueue = function(elemToEnqueue) {
  this.commands = new Array();
  if (this.tail == this.head - 1 || this.head == 0 && this.tail == SIZE5 - 1) {
    this.cmd("SetMessage", "End is one less than start. Queue is full. Cannot enqueue.");
    this.cmd("Step");
    return this.commands;
  }
  var labEnqueueValID = this.nextIndex++;
  this.arrayData[this.tail] = elemToEnqueue;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Enqueuing Value: " + elemToEnqueue);
  this.cmd(
    "CreateLabel",
    labEnqueueValID,
    elemToEnqueue,
    QUEUE_ELEMENT_X,
    QUEUE_ELEMENT_Y
  );
  this.cmd("Step");
  this.cmd("SetMessage", "End gives next available location.");
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR3,
    TAIL_POS_X4,
    TAIL_POS_Y
  );
  this.cmd("Step");
  var xpos = this.tail % ARRAY_ELEMS_PER_LINE * ARRAY_ELEM_WIDTH5 + ARRAY_START_X;
  var ypos = Math.floor(this.tail / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT5);
  this.cmd("Step");
  this.cmd("Move", labEnqueueValID, xpos, ypos);
  this.cmd("Step");
  this.cmd("Settext", this.arrayID[this.tail], elemToEnqueue);
  this.cmd("Delete", labEnqueueValID);
  this.cmd("Delete", this.highlight1ID);
  this.cmd("SetHighlight", this.tailID, 1);
  this.cmd("SetMessage", "Advance end to next location.");
  this.cmd("Step");
  this.tail = (this.tail + 1) % SIZE5;
  this.cmd("SetText", this.tailID, this.tail);
  if (this.tail == 0)
    this.cmd("SetMessage", "Advance end to next location. It wraps around to index 0.");
  this.cmd("Step");
  this.cmd("SetHighlight", this.tailID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
QueueArray.prototype.dequeue = function(ignored) {
  this.commands = new Array();
  if (this.tail == this.head) {
    this.cmd("SetMessage", "Start == End. Queue is empty.");
    this.cmd("Step");
    return this.commands;
  }
  var labDequeueValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR3,
    HEAD_POS_X,
    HEAD_POS_Y
  );
  this.cmd("SetMessage", "Start gives location of first value.");
  this.cmd("Step");
  var xpos = this.head % ARRAY_ELEMS_PER_LINE * ARRAY_ELEM_WIDTH5 + ARRAY_START_X;
  var ypos = Math.floor(this.head / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT5);
  this.cmd("Step");
  this.cmd("Delete", this.highlight1ID);
  var dequeuedVal = this.arrayData[this.head];
  this.cmd("CreateLabel", labDequeueValID, dequeuedVal, xpos, ypos);
  this.cmd("Settext", this.arrayID[this.head], "");
  this.cmd("Move", labDequeueValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
  this.cmd("SetMessage", `Dequeue ${dequeuedVal}`);
  this.cmd("Step");
  this.cmd("SetHighlight", this.headID, 1);
  this.cmd("SetMessage", "Increment start to next location.");
  this.cmd("Step");
  this.head = (this.head + 1) % SIZE5;
  if (this.head == 0)
    this.cmd("SetMessage", "Advance start to next location. It wraps around to index 0.");
  this.cmd("SetText", this.headID, this.head);
  this.cmd("Step");
  this.cmd("SetHighlight", this.headID, 0);
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "");
  this.cmd("Delete", labDequeueValID);
  return this.commands;
};
QueueArray.prototype.clearAll = function() {
  this.commands = new Array();
  this.cmd("SetText", this.leftoverLabelID, "");
  for (var i = 0; i < SIZE5; i++) {
    this.cmd("SetText", this.arrayID[i], "");
  }
  this.head = 0;
  this.tail = 0;
  this.cmd("SetText", this.headID, "0");
  this.cmd("SetText", this.tailID, "0");
  return this.commands;
};

// AlgorithmLibrary/QueueLL.js
var LINKED_LIST_START_X5 = 100;
var LINKED_LIST_START_Y5 = 150;
var LINKED_LIST_ELEM_WIDTH5 = 50;
var LINKED_LIST_ELEM_HEIGHT5 = 25;
var LINKED_LIST_ELEMS_PER_LINE4 = 10;
var LINKED_LIST_ELEM_SPACING5 = 70;
var LINKED_LIST_LINE_SPACING4 = 100;
var TOP_POS_X5 = 70;
var TOP_POS_Y5 = 50;
var TOP_LABEL_X4 = TOP_POS_X5;
var TOP_LABEL_Y5 = 25;
var TOP_ELEM_WIDTH5 = 40;
var TOP_ELEM_HEIGHT5 = 25;
var TAIL_POS_X5 = TOP_POS_X5 + TOP_ELEM_WIDTH5 * 2;
var TAIL_LABEL_X4 = TAIL_POS_X5;
var PUSH_LABEL_X = TAIL_POS_X5 + TOP_ELEM_WIDTH5 * 3;
var PUSH_LABEL_Y = 25;
var PUSH_ELEMENT_X = PUSH_LABEL_X;
var PUSH_ELEMENT_Y = 50;
var SIZE6 = 32;
function QueueLL(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Queue (Linked List)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.enqueue.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
QueueLL.prototype = new Algorithm();
QueueLL.prototype.constructor = QueueLL;
QueueLL.superclass = Algorithm.prototype;
QueueLL.prototype.init = function(am, w2, h) {
  QueueLL.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.tail_pos_y = h / 2 - LINKED_LIST_ELEM_HEIGHT5;
  this.tail_label_y = this.tail_pos_y;
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doEnqueue = function(val) {
    this.implementAction(this.enqueue.bind(this), val);
  };
  this.doDequeue = function() {
    this.implementAction(this.dequeue.bind(this));
  };
  this.createdNodeCount = 0;
};
QueueLL.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.setAttribute("placeholder", "Value to enqueue");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.enqueueCallback.bind(this),
    6
  );
  this.enqueueButton = addControlToAlgorithmBar("Button", "Enqueue");
  this.enqueueButton.onclick = this.enqueueCallback.bind(this);
  this.controls.push(this.enqueueButton);
  this.dequeueButton = addControlToAlgorithmBar("Button", "Dequeue");
  this.dequeueButton.onclick = this.dequeueCallback.bind(this);
  this.controls.push(this.dequeueButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear Queue");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
};
QueueLL.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
QueueLL.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
QueueLL.prototype.setup = function() {
  this.linkedListElemID = new Array(SIZE6);
  for (var i = 0; i < SIZE6; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.headID = this.nextIndex++;
  this.headLabelID = this.nextIndex++;
  this.tailID = this.nextIndex++;
  this.tailLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE6);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.cmd("CreateLabel", this.headLabelID, "Head", TOP_LABEL_X4, TOP_LABEL_Y5);
  this.cmd(
    "CreateRectangle",
    this.headID,
    "",
    TOP_ELEM_WIDTH5,
    TOP_ELEM_HEIGHT5,
    TOP_POS_X5,
    TOP_POS_Y5
  );
  this.cmd("SetNull", this.headID, 1);
  this.cmd(
    "CreateLabel",
    this.tailLabelID,
    "Tail",
    TAIL_LABEL_X4,
    TOP_LABEL_Y5
  );
  this.cmd(
    "CreateRectangle",
    this.tailID,
    "",
    TOP_ELEM_WIDTH5,
    TOP_ELEM_HEIGHT5,
    TAIL_POS_X5,
    TOP_POS_Y5
  );
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("CreateLabel", this.leftoverLabelID, "", 5, PUSH_LABEL_Y, 0);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
QueueLL.prototype.resetLinkedListPositions = function() {
  for (var i = this.top - 1; i >= 0; i--) {
    var nextX = (this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE4 * LINKED_LIST_ELEM_SPACING5 + LINKED_LIST_START_X5;
    var nextY = Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE4) * LINKED_LIST_LINE_SPACING4 + LINKED_LIST_START_Y5;
    this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
  }
};
QueueLL.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};
QueueLL.prototype.enqueueCallback = function(event) {
  if (this.top < SIZE6 && this.inputField.value != "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.enqueue.bind(this), pushVal);
  }
};
QueueLL.prototype.dequeueCallback = function(event) {
  if (this.top > 0) {
    this.implementAction(this.dequeue.bind(this), "");
  }
};
QueueLL.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
QueueLL.prototype.enqueue = function(elemToPush) {
  this.commands = new Array();
  this.arrayData[this.top] = elemToPush;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.createdNodeCount++;
  for (var i = this.top; i > 0; i--) {
    this.arrayData[i] = this.arrayData[i - 1];
    this.linkedListElemID[i] = this.linkedListElemID[i - 1];
  }
  this.arrayData[0] = elemToPush;
  this.linkedListElemID[0] = this.nextIndex++;
  this.cmd("SetMessage", "Enqueuing Value: " + elemToPush);
  this.cmd("Step");
  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[0],
    "",
    LINKED_LIST_ELEM_WIDTH5,
    LINKED_LIST_ELEM_HEIGHT5,
    LINKED_LIST_START_X5 + LINKED_LIST_ELEM_SPACING5 * ((this.createdNodeCount - 1) % LINKED_LIST_ELEMS_PER_LINE4),
    LINKED_LIST_START_Y5 + (this.createdNodeCount - 1) % 2 * 15 + Math.floor((this.createdNodeCount - 1) / LINKED_LIST_ELEMS_PER_LINE4) * LINKED_LIST_LINE_SPACING4,
    //LINKED_LIST_INSERT_X,
    //LINKED_LIST_INSERT_Y,
    0.25,
    0,
    1,
    1
  );
  this.cmd("SetMessage", "Make a node with value");
  this.cmd("SetNull", this.linkedListElemID[0], 1);
  this.cmd("SetText", this.linkedListElemID[0], elemToPush);
  this.cmd("Step");
  if (this.top == 0) {
    this.cmd("SetNull", this.headID, 0);
    this.cmd("SetNull", this.tailID, 0);
    this.cmd("connect", this.headID, this.linkedListElemID[this.top], "#000000", 0.1);
    this.cmd("SetMessage", "Queue is empty, head and tail point to this node.");
  } else {
    this.cmd("SetNull", this.linkedListElemID[1], 0);
    this.cmd("Connect", this.linkedListElemID[1], this.linkedListElemID[0], "#000000", 0.1);
    this.cmd("SetMessage", "Set tail->next to point to new node.");
    this.cmd("Step");
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[1]);
    this.cmd("SetMessage", "Update tail pointer to new node.");
  }
  this.cmd("connect", this.tailID, this.linkedListElemID[0], "#000000", -0.1, true, "", 1);
  this.cmd("Step");
  this.top = this.top + 1;
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
QueueLL.prototype.dequeue = function(ignored) {
  this.commands = new Array();
  var labPopID = this.nextIndex++;
  var labPopValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Dequeuing first value");
  this.cmd("Step");
  this.cmd(
    "CreateLabel",
    labPopID,
    "Dequeued Value: ",
    PUSH_LABEL_X + 20,
    PUSH_LABEL_Y
  );
  this.cmd(
    "CreateLabel",
    labPopValID,
    this.arrayData[this.top - 1],
    LINKED_LIST_START_X5,
    LINKED_LIST_START_Y5
  );
  this.cmd("Move", labPopValID, PUSH_ELEMENT_X + 20, PUSH_ELEMENT_Y);
  this.cmd("Step");
  if (this.top == 1) {
    this.cmd("SetMessage", "Head == tail, so that was last value.");
    this.cmd("Step");
    this.cmd("SetMessage", "Head and tail both become null.");
    this.cmd("SetNull", this.headID, 1);
    this.cmd("SetNull", this.tailID, 1);
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Disconnect", this.tailID, this.linkedListElemID[this.top - 1]);
  } else {
    this.cmd("SetMessage", "Advance head.");
    this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
    this.cmd("Connect", this.headID, this.linkedListElemID[this.top - 2], "#000000", 0.1);
  }
  this.cmd("Step");
  this.cmd("SetMessage", "Delete old head node.");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.top = this.top - 1;
  this.cmd("Step");
  this.cmd("Delete", labPopValID);
  this.cmd("Delete", labPopID);
  this.cmd("SetMessage", "Dequeued Value: " + this.arrayData[this.top]);
  this.cmd("Step");
  return this.commands;
};
QueueLL.prototype.clearData = function() {
  this.commands = new Array();
  this.cmd("SetNull", this.tailID, 1);
  this.cmd("SetNull", this.headID, 1);
  this.cmd("Disconnect", this.headID, this.linkedListElemID[this.top - 1]);
  this.cmd("Disconnect", this.tailID, this.linkedListElemID[0]);
  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }
  this.cmd("SetMessage", "");
  this.createdNodeCount = 0;
  this.top = 0;
  return this.commands;
};

// AlgorithmLibrary/RedBlack.js
function RedBlack(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Red Black Tree";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 600, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
var FIRST_PRINT_POS_X2 = 50;
var PRINT_VERTICAL_GAP2 = 20;
var PRINT_HORIZONTAL_GAP = 50;
var NODE_SIZE = 30;
var LINK_COLOR = "var(--svgColor)";
var FOREGROUND_RED = "var(--svgColor--red)";
var BACKGROUND_RED = "var(--svgColor--redback)";
var FOREGROUND_BLACK = "var(--svgColor--black)";
var BACKGROUND_BLACK = "var(--svgColor--blackback)";
var BACKGROUND_DOUBLE_BLACK = "#777777";
var BLUE = "#0000FF";
var HIGHLIGHT_COLOR2 = "#007700";
var FOREGROUND_COLOR2 = FOREGROUND_BLACK;
var PRINT_COLOR = FOREGROUND_COLOR2;
var widthDelta = 50;
var heightDelta = 60;
var startingY = 50;
var EXPLANITORY_TEXT_Y = 10;
RedBlack.prototype = new Algorithm();
RedBlack.prototype.constructor = RedBlack;
RedBlack.superclass = Algorithm.prototype;
RedBlack.prototype.init = function(am, w2, h) {
  var sc = RedBlack.superclass;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.nextIndex = 0;
  this.commands = [];
  this.groupBoxes = {};
  this.rootIndex = 0;
  this.startingX = 100;
  this.print_max = w2 - PRINT_HORIZONTAL_GAP;
  this.first_print_pos_y = h - 2 * PRINT_VERTICAL_GAP2;
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, EXPLANITORY_TEXT_Y + 20);
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, EXPLANITORY_TEXT_Y + 20);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doDelete = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doFind = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function(order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const raw = Math.floor(1 + Math.random() * maxValue);
      const insertedValue = this.normalizeNumber(String(raw), 4);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
RedBlack.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.showNullLeaves = addCheckboxToAlgorithmBar("Show Null Leaves", "NullLeavesCheck");
  this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
  this.showNullLeaves.checked = false;
};
RedBlack.prototype.reset = function() {
  this.nextIndex = 2;
  this.treeRoot = null;
};
RedBlack.prototype.insertCallback = function(event) {
  var insertedValue = this.inputField.value;
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
RedBlack.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
RedBlack.prototype.findCallback = function(event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    findValue = this.normalizeNumber(findValue, 4);
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
RedBlack.prototype.printCallback = function(event) {
  this.implementAction(this.printTree.bind(this), "");
};
RedBlack.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
RedBlack.prototype.clearData = function() {
  if (this.treeRoot == null)
    return;
  this.commands = [];
  function clearTree(tree, handler) {
    if (tree == null)
      return;
    if (tree.left != null) {
      clearTree(tree.left, handler);
    }
    if (tree.right != null) {
      clearTree(tree.right, handler);
    }
    if (tree.containerBoxID) {
      handler.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
    handler.cmd("Delete", tree.graphicID);
    if (tree.colorLabelID != null) {
      handler.cmd("Delete", tree.colorLabelID);
    }
  }
  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.groupBoxes = {};
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("SetMessage", "");
  return this.commands;
};
RedBlack.prototype.insertRandomCallback = function(event) {
  var numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const raw = Math.floor(1 + Math.random() * 999);
    const insertedValue = this.normalizeNumber(String(raw), 4);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
RedBlack.prototype.updateGroupingsRec = function(tree, show) {
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.updateGroupingsRec(tree.left, show);
  }
  if (tree.blackLevel == 1 && show) {
    const OUTER_PAD = 8;
    const LABEL_PAD_X = 10;
    const LABEL_PAD_Y = 10;
    const R = NODE_SIZE;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const addNodeBounds = (n) => {
      if (!n || n.phantomLeaf)
        return;
      minX = Math.min(minX, n.x - R - OUTER_PAD);
      maxX = Math.max(maxX, n.x + R + OUTER_PAD);
      minY = Math.min(minY, n.y - R - OUTER_PAD);
      maxY = Math.max(maxY, n.y + R + OUTER_PAD);
      const lx = Number.isFinite(n.heightLabelX) ? n.heightLabelX : n.x + 20;
      const ly = Number.isFinite(n.heightLabelY) ? n.heightLabelY : n.y - 20;
      minX = Math.min(minX, lx - LABEL_PAD_X - OUTER_PAD);
      maxX = Math.max(maxX, lx + LABEL_PAD_X + OUTER_PAD);
      minY = Math.min(minY, ly - LABEL_PAD_Y - OUTER_PAD);
      maxY = Math.max(maxY, ly + LABEL_PAD_Y + OUTER_PAD);
    };
    addNodeBounds(tree);
    if (tree.left && tree.left.blackLevel == 0)
      addNodeBounds(tree.left);
    if (tree.right && tree.right.blackLevel == 0)
      addNodeBounds(tree.right);
    const width = Math.max(0, maxX - minX);
    const height = Math.max(0, maxY - minY);
    if (tree.containerBoxID) {
      this.cmd("Move", tree.containerBoxID, minX, minY);
      this.cmd("SetHeight", tree.containerBoxID, height);
      this.cmd("SetWidth", tree.containerBoxID, width);
    } else {
      const rectID = this.nextIndex++;
      tree.containerBoxID = rectID;
      this.cmd("CreateRectangle", rectID, "", width, height, minX, minY, "left", "top");
      this.cmd("SetBackgroundColor", rectID, "rgba(255, 255, 255, 0)");
      this.cmd("SetForegroundColor", rectID, LINK_COLOR);
      this.cmd("SetLayer", rectID, 0);
    }
  } else {
    if (tree.containerBoxID) {
      this.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.updateGroupingsRec(tree.right, show);
  }
};
RedBlack.prototype.updateGroupings = function(unused) {
  this.commands = [];
  this.updateGroupingsInternal();
  return this.commands;
};
RedBlack.prototype.updateGroupingsInternal = function() {
  const deleteBoxesRec = (tree) => {
    if (tree == null)
      return;
    if (tree.containerBoxID) {
      this.cmd("Delete", tree.containerBoxID);
      tree.containerBoxID = null;
    }
    if (tree.left != null && !tree.left.phantomLeaf)
      deleteBoxesRec(tree.left);
    if (tree.right != null && !tree.right.phantomLeaf)
      deleteBoxesRec(tree.right);
  };
  if (this.treeRoot)
    deleteBoxesRec(this.treeRoot);
};
RedBlack.prototype.setNullLeafLayers = function(tree, layer) {
  if (tree == null)
    return;
  if (tree.phantomLeaf) {
    this.cmd("SetLayer", tree.graphicID, layer);
    if (tree.colorLabelID != null) {
      this.cmd("SetLayer", tree.colorLabelID, layer);
    }
  }
  this.setNullLeafLayers(tree.left, layer);
  this.setNullLeafLayers(tree.right, layer);
};
RedBlack.prototype.showNullLeavesCallback = function(event) {
  this.implementAction(this.toggleNullLeaves.bind(this), "");
};
RedBlack.prototype.deleteNullLeavesRec = function(tree) {
  if (tree == null)
    return;
  if (tree.left != null && tree.left.phantomLeaf) {
    this.cmd("Disconnect", tree.graphicID, tree.left.graphicID);
    this.cmd("Delete", tree.left.graphicID);
    if (tree.left.colorLabelID != null) {
      this.cmd("Delete", tree.left.colorLabelID);
    }
    tree.left = null;
  } else {
    this.deleteNullLeavesRec(tree.left);
  }
  if (tree.right != null && tree.right.phantomLeaf) {
    this.cmd("Disconnect", tree.graphicID, tree.right.graphicID);
    this.cmd("Delete", tree.right.graphicID);
    if (tree.right.colorLabelID != null) {
      this.cmd("Delete", tree.right.colorLabelID);
    }
    tree.right = null;
  } else {
    this.deleteNullLeavesRec(tree.right);
  }
};
RedBlack.prototype.ensureNullLeavesRec = function(tree) {
  if (tree == null || tree.phantomLeaf)
    return;
  if (tree.left == null) {
    this.attachLeftNullLeaf(tree);
  }
  if (tree.right == null) {
    this.attachRightNullLeaf(tree);
  }
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.ensureNullLeavesRec(tree.left);
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.ensureNullLeavesRec(tree.right);
  }
};
RedBlack.prototype.toggleNullLeaves = function(unused) {
  this.commands = [];
  let show = this.showNullLeaves && this.showNullLeaves.checked;
  if (this.treeRoot) {
    if (show) {
      this.ensureNullLeavesRec(this.treeRoot);
      this.setNullLeafLayers(this.treeRoot, 0);
    } else {
      this.deleteNullLeavesRec(this.treeRoot);
    }
  }
  this.resizeTree();
  return this.commands;
};
RedBlack.prototype.printTree = function(unused) {
  this.commands = [];
  if (this.treeRoot != null) {
    this.highlightID = this.nextIndex++;
    var firstLabel = this.nextIndex;
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      HIGHLIGHT_COLOR2,
      this.treeRoot.x,
      this.treeRoot.y
    );
    this.xPosOfNextLabel = FIRST_PRINT_POS_X2;
    this.yPosOfNextLabel = this.first_print_pos_y;
    this.printTreeRec(this.treeRoot);
    this.cmd("Delete", this.highlightID);
    this.cmd("Step");
    for (var i = firstLabel; i < this.nextIndex; i++)
      this.cmd("Delete", i);
    this.nextIndex = this.highlightID;
  }
  return this.commands;
};
RedBlack.prototype.printTreeRec = function(tree) {
  this.cmd("Step");
  if (tree.left != null && !tree.left.phantomLeaf) {
    this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
    this.printTreeRec(tree.left);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  var nextLabelID = this.nextIndex++;
  this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
  this.cmd("SetForegroundColor", nextLabelID, PRINT_COLOR);
  this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
  this.cmd("Step");
  this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
  if (this.xPosOfNextLabel > this.print_max) {
    this.xPosOfNextLabel = FIRST_PRINT_POS_X2;
    this.yPosOfNextLabel += PRINT_VERTICAL_GAP2;
  }
  if (tree.right != null && !tree.right.phantomLeaf) {
    this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
    this.printTreeRec(tree.right);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  return;
};
RedBlack.prototype.findElement = function(findValue) {
  this.commands = [];
  this.highlightID = this.nextIndex++;
  this.findImpl(this.treeRoot, findValue);
  return this.commands;
};
RedBlack.prototype.findImpl = function(tree, value) {
  this.cmd("SetMessage", "Searching for " + value);
  if (tree != null && !tree.phantomLeaf) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " + value + " : " + value + " = " + value + " (Element found!)"
      );
      this.cmd("Step");
      this.cmd("SetMessage", "Found:" + value);
      this.cmd("SetHighlight", tree.graphicID, 0);
    } else {
      if (tree.data > value) {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " : " + value + " < " + tree.data + " (look to left subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.left != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            HIGHLIGHT_COLOR2,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.findImpl(tree.left, value);
      } else {
        this.cmd(
          "SetMessage",
          " Searching for " + value + " : " + value + " > " + tree.data + " (look to right subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.right != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            HIGHLIGHT_COLOR2,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
        }
        this.findImpl(tree.right, value);
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      " Searching for " + value + " : < Empty Tree > (Element not found)"
    );
    this.cmd("Step");
    this.cmd(
      "SetMessage",
      " Searching for " + value + " :  (Element not found)"
    );
  }
};
RedBlack.prototype.findUncle = function(tree) {
  if (tree.parent == null) {
    return null;
  }
  var par = tree.parent;
  if (par.parent == null) {
    return null;
  }
  var grandPar = par.parent;
  if (grandPar.left == par) {
    return grandPar.right;
  } else {
    return grandPar.left;
  }
};
RedBlack.prototype.blackLevel = function(tree) {
  if (tree == null) {
    return 1;
  } else {
    return tree.blackLevel;
  }
};
RedBlack.prototype.attachLeftNullLeaf = function(node) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  var treeNodeID = this.nextIndex++;
  var labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    node.x + 20,
    node.y - 20
  );
  node.left = new RedBlackNode("", treeNodeID, labelID, node.x, node.y);
  node.left.phantomLeaf = true;
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  node.left.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};
RedBlack.prototype.attachRightNullLeaf = function(node) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  let treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", node.x, node.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    node.x + 20,
    node.y - 20
  );
  node.right = new RedBlackNode("", treeNodeID, labelID, node.x, node.y);
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  node.right.phantomLeaf = true;
  node.right.blackLevel = 1;
  this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
};
RedBlack.prototype.attachNullLeaves = function(node) {
  this.attachLeftNullLeaf(node);
  this.attachRightNullLeaf(node);
};
RedBlack.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", " Inserting " + insertedValue);
  this.cmd("Step");
  this.highlightID = this.nextIndex++;
  var treeNodeID;
  if (this.treeRoot == null) {
    treeNodeID = this.nextIndex++;
    let labelID = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX,
      startingY
    );
    this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
    this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
    this.cmd(
      "CreateLabel",
      labelID,
      "B",
      this.startingX + 20,
      startingY - 20
    );
    this.cmd("SetMessage", "Root node must always be Black.");
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, treeNodeID, LINK_COLOR);
    this.treeRoot = new RedBlackNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX,
      startingY
    );
    this.treeRoot.blackLevel = 1;
    this.attachNullLeaves(this.treeRoot);
    this.resizeTree();
  } else {
    treeNodeID = this.nextIndex++;
    let labelID = this.nextIndex++;
    this.cmd(
      "CreateCircle",
      treeNodeID,
      insertedValue,
      this.startingX - 200,
      startingY
    );
    this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_RED);
    this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_RED);
    this.cmd("Step");
    this.cmd(
      "CreateLabel",
      labelID,
      "R",
      this.startingX - 180,
      startingY - 20
    );
    var insertElem = new RedBlackNode(
      insertedValue,
      treeNodeID,
      labelID,
      this.startingX - 200,
      startingY
    );
    this.cmd("SetHighlight", insertElem.graphicID, 1);
    insertElem.height = 1;
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
  }
  this.cmd("SetMessage", " ");
  return this.commands;
};
RedBlack.prototype.singleRotateRight = function(tree) {
  var B = tree;
  var t3 = B.right;
  var A = tree.left;
  var t1 = A.left;
  var t2 = A.right;
  this.cmd("SetMessage", `Rotate Right at ${B.data}`);
  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, LINK_COLOR);
    t2.parent = B;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, LINK_COLOR);
  A.parent = B.parent;
  if (this.treeRoot == B) {
    this.treeRoot = A;
    this.cmd("Disconnect", 0, B.graphicID, LINK_COLOR);
    this.cmd("Connect", 0, A.graphicID, LINK_COLOR);
  } else {
    this.cmd("Disconnect", B.parent.graphicID, B.graphicID, LINK_COLOR);
    this.cmd("Connect", B.parent.graphicID, A.graphicID, LINK_COLOR);
    if (B.isLeftChild()) {
      B.parent.left = A;
    } else {
      B.parent.right = A;
    }
  }
  A.right = B;
  B.parent = A;
  B.left = t2;
  this.resetHeight(B);
  this.resetHeight(A);
  this.resizeTree();
  if (B.blackLevel > 0) {
    this.cmd("SetMessage", `${A.data} is now root of logical group. It and ${B.data} switch colors.`);
    this.setColor(A, "B");
    this.setColor(B, "R");
    this.cmd("Step");
  }
  return A;
};
RedBlack.prototype.setColor = function(node, color) {
  let label = "B";
  let fgColor = FOREGROUND_BLACK;
  let bgColor = BACKGROUND_BLACK;
  if (color == "R") {
    label = "R";
    fgColor = FOREGROUND_RED;
    bgColor = BACKGROUND_RED;
  }
  this.cmd("SetText", node.colorLabelID, label);
  this.cmd("SetBackgroundColor", node.graphicID, bgColor);
  this.cmd("SetForegroundColor", node.graphicID, fgColor);
};
RedBlack.prototype.singleRotateLeft = function(tree) {
  var A = tree;
  var B = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  this.cmd("SetMessage", `Rotate Left at ${A.data}`);
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, LINK_COLOR);
    t2.parent = A;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, LINK_COLOR);
  B.parent = A.parent;
  if (this.treeRoot == A) {
    this.treeRoot = B;
    this.cmd("Disconnect", 0, A.graphicID, LINK_COLOR);
    this.cmd("Connect", 0, B.graphicID, LINK_COLOR);
  } else {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID, LINK_COLOR);
    this.cmd("Connect", A.parent.graphicID, B.graphicID, LINK_COLOR);
    if (A.isLeftChild()) {
      A.parent.left = B;
    } else {
      A.parent.right = B;
    }
  }
  B.left = A;
  A.parent = B;
  A.right = t2;
  this.resetHeight(A);
  this.resetHeight(B);
  this.resizeTree();
  if (A.blackLevel > 0) {
    this.cmd("SetMessage", `${B.data} is now root of logical group. It and ${A.data} switch colors.`);
    this.setColor(B, "B");
    this.setColor(A, "R");
    this.cmd("Step");
  }
  return B;
};
RedBlack.prototype.getHeight = function(tree) {
  if (tree == null) {
    return 0;
  }
  return tree.height;
};
RedBlack.prototype.resetHeight = function(tree) {
  if (tree != null) {
    var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    if (tree.height != newHeight) {
      tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
    }
  }
};
RedBlack.prototype.insert = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree"
    );
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree"
    );
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null || tree.left.phantomLeaf) {
      this.cmd(
        "SetMessage",
        "Found null, inserting red node at that location"
      );
      if (tree.left != null) {
        this.cmd("Delete", tree.left.graphicID);
      }
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);
      this.attachNullLeaves(elem);
      this.resizeTree();
      this.resizeTree();
      this.fixDoubleRed(elem);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        HIGHLIGHT_COLOR2,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null || tree.right.phantomLeaf) {
      this.cmd(
        "SetMessage",
        "Found null, inserting red node at that location"
      );
      if (tree.right != null) {
        this.cmd("Delete", tree.right.graphicID);
      }
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);
      elem.x = tree.x + widthDelta / 2;
      elem.y = tree.y + heightDelta;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
      this.attachNullLeaves(elem);
      this.resizeTree();
      this.resizeTree();
      this.fixDoubleRed(elem);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        HIGHLIGHT_COLOR2,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.right);
    }
  }
};
RedBlack.prototype.fixDoubleRed = function(tree) {
  if (tree.parent != null) {
    if (tree.parent.blackLevel > 0) {
      return;
    }
    if (tree.parent.parent == null) {
      this.cmd("SetMessage", "Tree root is red, color it black.");
      this.cmd("Step");
      tree.parent.blackLevel = 1;
      this.setColor(tree.parent, "B");
      return;
    }
    var uncle = this.findUncle(tree);
    if (this.blackLevel(uncle) == 0) {
      this.cmd(
        "SetMessage",
        `Node (${tree.data}) and parent are both red. 4 nodes in logical group. Split into two groups.`
      );
      this.cmd("Step");
      this.setColor(uncle, "B");
      uncle.blackLevel = 1;
      tree.parent.blackLevel = 1;
      this.setColor(tree.parent, "B");
      this.cmd("SetMessage", "Parent and parent's sibling become roots of new logical groups (turn black). Grandparent is pushed up (becomes red).");
      tree.parent.parent.blackLevel = 0;
      this.setColor(tree.parent.parent, "R");
      this.cmd("Step");
      this.fixDoubleRed(tree.parent.parent);
    } else {
      let isDouble = false;
      if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
        this.cmd(
          "SetMessage",
          `Node (${tree.data}) and parent are both red in zig-zag from black grandparent. Only 3 nodes in logical group. Two rotations needed.`
        );
        isDouble = true;
        this.cmd("Step");
        this.singleRotateRight(tree.parent);
        tree = tree.right;
      } else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
        this.cmd(
          "SetMessage",
          `Node (${tree.data}) and parent are both red in zig-zag from black grandparent. Only 3 nodes in logical group. Two rotations needed.`
        );
        isDouble = true;
        this.cmd("Step");
        this.singleRotateLeft(tree.parent);
        tree = tree.left;
      }
      let msg = isDouble ? `Now do second rotation to move (${tree.parent.data}) up to be root of logical group.` : `Node (${tree.data}) and parent are both red in a straight line from black grandparent. Only 3 nodes in logical group. Fix with single rotation.`;
      if (tree.isLeftChild()) {
        this.cmd(
          "SetMessage",
          msg
        );
        this.cmd("Step");
        this.singleRotateRight(tree.parent.parent);
        tree.parent.blackLevel = 1;
        this.setColor(tree.parent, "B");
        tree.parent.right.blackLevel = 0;
        this.setColor(tree.parent.right, "R");
      } else {
        this.cmd(
          "SetMessage",
          msg
        );
        this.cmd("Step");
        this.singleRotateLeft(tree.parent.parent);
        tree.parent.blackLevel = 1;
        this.setColor(tree.parent, "B");
        tree.parent.left.blackLevel = 0;
        this.setColor(tree.parent.left, "R");
      }
    }
  } else {
    if (tree.blackLevel == 0) {
      this.cmd("SetMessage", "Root of the tree is red.  Color it black");
      this.cmd("Step");
      tree.blackLevel = 1;
      this.setColor(tree, "B");
    }
  }
};
RedBlack.prototype.deleteElement = function(deletedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", " ");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);
  let show = this.showNullLeaves && this.showNullLeaves.checked;
  if (this.treeRoot) {
    this.setNullLeafLayers(this.treeRoot, show ? 0 : 1);
  }
  this.resizeTree();
  if (this.treeRoot == null) {
    this.cmd("Step");
  }
  this.cmd("SetMessage", " ");
  return this.commands;
};
RedBlack.prototype.fixLeftNull = function(tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  this.cmd("SetMessage", "Coloring 'Null Leaf' double black");
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", tree.x, tree.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    tree.x - 20,
    tree.y - 20
  );
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, labelID, tree.x, tree.y);
  nullLeaf.blackLevel = 2;
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  tree.left = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);
  this.resizeTree();
  this.fixExtraBlackChild(tree, true);
  this.cmd("SetLayer", nullLeaf.graphicID, showNullLeaves ? 0 : 1);
  nullLeaf.blackLevel = 1;
  this.fixNodeColor(nullLeaf);
};
RedBlack.prototype.fixRightNull = function(tree) {
  var treeNodeID = this.nextIndex++;
  let labelID = this.nextIndex++;
  var nullLeaf;
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  this.cmd("SetMessage", "Coloring 'Null Leaf' double black");
  this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF", tree.x, tree.y);
  this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
  this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
  this.cmd(
    "CreateLabel",
    labelID,
    "",
    tree.x - 20,
    tree.y - 20
  );
  this.cmd("SetLayer", treeNodeID, showNullLeaves ? 0 : 1);
  this.cmd("SetLayer", labelID, showNullLeaves ? 0 : 1);
  nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, labelID, tree.x, tree.y);
  nullLeaf.parent = tree;
  nullLeaf.phantomLeaf = true;
  nullLeaf.blackLevel = 2;
  tree.right = nullLeaf;
  this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);
  this.resizeTree();
  this.fixExtraBlackChild(tree, false);
  this.cmd("SetLayer", nullLeaf.graphicID, showNullLeaves ? 0 : 1);
  nullLeaf.blackLevel = 1;
  this.fixNodeColor(nullLeaf);
};
RedBlack.prototype.fixExtraBlackChild = function(parNode, isLeftChild) {
  var sibling;
  var doubleBlackNode;
  if (isLeftChild) {
    sibling = parNode.right;
    doubleBlackNode = parNode.left;
  } else {
    sibling = parNode.left;
    doubleBlackNode = parNode.right;
  }
  if (this.blackLevel(sibling) > 0 && this.blackLevel(sibling.left) > 0 && this.blackLevel(sibling.right) > 0) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling and 2 black nephews.  Push up black level"
    );
    this.cmd("Step");
    sibling.blackLevel = 0;
    this.fixNodeColor(sibling);
    if (doubleBlackNode != null) {
      doubleBlackNode.blackLevel = 1;
      this.fixNodeColor(doubleBlackNode);
    }
    if (parNode.blackLevel == 0) {
      parNode.blackLevel = 1;
      this.fixNodeColor(parNode);
    } else {
      parNode.blackLevel = 2;
      this.fixNodeColor(parNode);
      this.cmd(
        "SetMessage",
        "Pushing up black level created another double black node.  Repeating ..."
      );
      this.cmd("Step");
      this.fixExtraBlack(parNode);
    }
  } else if (this.blackLevel(sibling) == 0) {
    this.cmd(
      "SetMessage",
      "Double black node has red sibling.  Rotate tree to make sibling black ..."
    );
    this.cmd("Step");
    if (isLeftChild) {
      var newPar = this.singleRotateLeft(parNode);
      newPar.blackLevel = 1;
      this.fixNodeColor(newPar);
      newPar.left.blackLevel = 0;
      this.fixNodeColor(newPar.left);
      this.cmd("Step");
      this.fixExtraBlack(newPar.left.left);
    } else {
      newPar = this.singleRotateRight(parNode);
      newPar.blackLevel = 1;
      this.fixNodeColor(newPar);
      newPar.right.blackLevel = 0;
      this.fixNodeColor(newPar.right);
      this.cmd("Step");
      this.fixExtraBlack(newPar.right.right);
    }
  } else if (isLeftChild && this.blackLevel(sibling.right) > 0) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, but double black node is a left child, \nand the right nephew is black.  Rotate tree to make opposite nephew red ..."
    );
    this.cmd("Step");
    var newSib = this.singleRotateRight(sibling);
    newSib.blackLevel = 1;
    this.fixNodeColor(newSib);
    newSib.right.blackLevel = 0;
    this.fixNodeColor(newSib.right);
    this.cmd("Step");
    this.fixExtraBlackChild(parNode, isLeftChild);
  } else if (!isLeftChild && this.blackLevel(sibling.left) > 0) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, but double black node is a right child, \nand the left nephew is black.  Rotate tree to make opposite nephew red ..."
    );
    this.cmd("Step");
    newSib = this.singleRotateLeft(sibling);
    newSib.blackLevel = 1;
    this.fixNodeColor(newSib);
    newSib.left.blackLevel = 0;
    this.fixNodeColor(newSib.left);
    this.cmd("Step");
    this.fixExtraBlackChild(parNode, isLeftChild);
  } else if (isLeftChild) {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, is a left child, and its right nephew is red.\nOne rotation can fix double-blackness."
    );
    this.cmd("Step");
    var oldParBlackLevel = parNode.blackLevel;
    newPar = this.singleRotateLeft(parNode);
    if (oldParBlackLevel == 0) {
      newPar.blackLevel = 0;
      this.fixNodeColor(newPar);
      newPar.left.blackLevel = 1;
      this.fixNodeColor(newPar.left);
    }
    newPar.right.blackLevel = 1;
    this.fixNodeColor(newPar.right);
    if (newPar.left.left != null) {
      newPar.left.left.blackLevel = 1;
      this.fixNodeColor(newPar.left.left);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Double black node has black sibling, is a right child, and its left nephew is red.\nOne rotation can fix double-blackness."
    );
    this.cmd("Step");
    oldParBlackLevel = parNode.blackLevel;
    newPar = this.singleRotateRight(parNode);
    if (oldParBlackLevel == 0) {
      newPar.blackLevel = 0;
      this.fixNodeColor(newPar);
      newPar.right.blackLevel = 1;
      this.fixNodeColor(newPar.right);
    }
    newPar.left.blackLevel = 1;
    this.fixNodeColor(newPar.left);
    if (newPar.right.right != null) {
      newPar.right.right.blackLevel = 1;
      this.fixNodeColor(newPar.right.right);
    }
  }
};
RedBlack.prototype.fixExtraBlack = function(tree) {
  if (tree.blackLevel > 1) {
    if (tree.parent == null) {
      this.cmd(
        "SetMessage",
        "Double black node is root.  Make it single black."
      );
      this.cmd("Step");
      tree.blackLevel = 1;
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
    } else if (tree.parent.left == tree) {
      this.fixExtraBlackChild(tree.parent, true);
    } else {
      this.fixExtraBlackChild(tree.parent, false);
    }
  } else {
  }
};
RedBlack.prototype.treeDelete = function(tree, valueToDelete) {
  var leftchild = false;
  if (tree != null && !tree.phantomLeaf) {
    if (tree.parent != null) {
      leftchild = tree.parent.left == tree;
    }
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (valueToDelete < tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " < " + tree.data + ".  Looking at left subtree"
      );
    } else if (valueToDelete > tree.data) {
      this.cmd(
        "SetMessage",
        valueToDelete + " > " + tree.data + ".  Looking at right subtree"
      );
    } else {
      this.cmd(
        "SetMessage",
        valueToDelete + " == " + tree.data + ".  Found node to delete"
      );
    }
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    if (valueToDelete == tree.data) {
      var needFix = tree.blackLevel > 0;
      if ((tree.left == null || tree.left.phantomLeaf) && (tree.right == null || tree.right.phantomLeaf)) {
        this.cmd("SetMessage", "Node to delete is a leaf.  Delete it.");
        this.cmd("Delete", tree.graphicID);
        this.cmd("Delete", tree.colorLabelID);
        if (tree.left != null) {
          this.cmd("Delete", tree.left.graphicID);
        }
        if (tree.right != null) {
          this.cmd("Delete", tree.right.graphicID);
        }
        if (leftchild && tree.parent != null) {
          tree.parent.left = null;
          this.resizeTree();
          if (needFix) {
            this.fixLeftNull(tree.parent);
          } else {
            this.attachLeftNullLeaf(tree.parent);
            this.resizeTree();
          }
        } else if (tree.parent != null) {
          tree.parent.right = null;
          this.resizeTree();
          if (needFix) {
            this.fixRightNull(tree.parent);
          } else {
            this.attachRightNullLeaf(tree.parent);
            this.resizeTree();
          }
        } else {
          this.treeRoot = null;
        }
      } else if (tree.left == null || tree.left.phantomLeaf) {
        this.cmd(
          "SetMessage",
          "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node."
        );
        if (tree.left != null) {
          this.cmd("Delete", tree.left.graphicID);
          tree.left = null;
        }
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.right.graphicID,
            LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
          if (leftchild) {
            tree.parent.left = tree.right;
            if (needFix) {
              this.cmd(
                "SetMessage",
                "Back node removed.  Increasing child's blackness level"
              );
              tree.parent.left.blackLevel++;
              this.fixNodeColor(tree.parent.left);
              this.fixExtraBlack(tree.parent.left);
            }
          } else {
            tree.parent.right = tree.right;
            if (needFix) {
              tree.parent.right.blackLevel++;
              this.cmd(
                "SetMessage",
                "Back node removed.  Increasing child's blackness level"
              );
              this.fixNodeColor(tree.parent.right);
              this.fixExtraBlack(tree.parent.right);
            }
          }
          tree.right.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
          this.treeRoot = tree.right;
          this.treeRoot.parent = null;
          if (this.treeRoot.blackLevel == 0) {
            this.treeRoot.blackLevel = 1;
            this.cmd(
              "SetForegroundColor",
              this.treeRoot.graphicID,
              FOREGROUND_BLACK
            );
            this.cmd(
              "SetBackgroundColor",
              this.treeRoot.graphicID,
              BACKGROUND_BLACK
            );
          }
        }
        this.resizeTree();
      } else if (tree.right == null || tree.right.phantomLeaf) {
        this.cmd(
          "SetMessage",
          "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node."
        );
        if (tree.right != null) {
          this.cmd("Delete", tree.right.graphicID);
          tree.right = null;
        }
        if (tree.parent != null) {
          this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
          this.cmd(
            "Connect",
            tree.parent.graphicID,
            tree.left.graphicID,
            LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
          if (leftchild) {
            tree.parent.left = tree.left;
            if (needFix) {
              tree.parent.left.blackLevel++;
              this.fixNodeColor(tree.parent.left);
              this.fixExtraBlack(tree.parent.left);
              this.resizeTree();
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.resizeTree();
            }
          } else {
            tree.parent.right = tree.left;
            if (needFix) {
              tree.parent.right.blackLevel++;
              this.fixNodeColor(tree.parent.right);
              this.fixExtraBlack(tree.parent.left);
              this.resizeTree();
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.resizeTree();
            }
          }
          tree.left.parent = tree.parent;
        } else {
          this.cmd("Delete", tree.graphicID);
          this.cmd("Delete", tree.colorLabelID);
          this.treeRoot = tree.left;
          this.treeRoot.parent = null;
          if (this.treeRoot.blackLevel == 0) {
            this.treeRoot.blackLevel = 1;
            this.fixNodeColor(this.treeRoot);
          }
        }
      } else {
        this.cmd(
          "SetMessage",
          "Node to delete has two childern.  \nFind smallest node in right subtree."
        );
        this.highlightID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR2,
          tree.x,
          tree.y
        );
        var tmp = tree;
        tmp = tree.right;
        this.cmd("Move", this.highlightID, tmp.x, tmp.y);
        this.cmd("Step");
        while (tmp.left != null && !tmp.left.phantomLeaf) {
          tmp = tmp.left;
          this.cmd("Move", this.highlightID, tmp.x, tmp.y);
          this.cmd("Step");
        }
        if (tmp.left != null) {
          this.cmd("Delete", tmp.left.graphicID);
          tmp.left = null;
        }
        this.cmd("SetText", tree.graphicID, " ");
        var labelID = this.nextIndex;
        this.nextIndex += 1;
        this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
        this.cmd("SetForegroundColor", labelID, BLUE);
        tree.data = tmp.data;
        this.cmd("Move", labelID, tree.x, tree.y);
        this.cmd(
          "SetMessage",
          "Copy smallest value of right subtree over value being removed."
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        this.cmd("Delete", labelID);
        this.cmd("SetText", tree.graphicID, tree.data);
        this.cmd("Delete", this.highlightID);
        this.cmd("SetMessage", "Remove node whose value we copied.");
        needFix = tmp.blackLevel > 0;
        if (tmp.right == null) {
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.colorLabelID);
          if (tmp.parent != tree) {
            tmp.parent.left = null;
            this.resizeTree();
            if (needFix) {
              this.fixLeftNull(tmp.parent);
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.cmd("Step");
            }
          } else {
            tree.right = null;
            this.resizeTree();
            if (needFix) {
              this.fixRightNull(tmp.parent);
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.cmd("Step");
            }
          }
        } else {
          this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
          this.cmd(
            "Connect",
            tmp.parent.graphicID,
            tmp.right.graphicID,
            LINK_COLOR
          );
          this.cmd("Step");
          this.cmd("Delete", tmp.graphicID);
          this.cmd("Delete", tmp.colorLabelID);
          if (tmp.parent != tree) {
            tmp.parent.left = tmp.right;
            tmp.right.parent = tmp.parent;
            this.resizeTree();
            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.right.blackLevel++;
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
              this.fixNodeColor(tmp.right);
              this.fixExtraBlack(tmp.right);
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.cmd("Step");
            }
          } else {
            tree.right = tmp.right;
            tmp.right.parent = tree;
            this.resizeTree();
            if (needFix) {
              this.cmd("SetMessage", "Coloring child of deleted node black");
              this.cmd("Step");
              tmp.right.blackLevel++;
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
              this.fixNodeColor(tmp.right);
              this.fixExtraBlack(tmp.right);
              if (tmp.right.phantomLeaf) {
                let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
                this.cmd("SetLayer", tmp.right.graphicID, showNullLeaves ? 0 : 1);
                if (tmp.right.colorLabelID != null) {
                  this.cmd("SetLayer", tmp.right.colorLabelID, showNullLeaves ? 0 : 1);
                }
              }
            } else {
              this.cmd(
                "SetMessage",
                "Deleted node was red.  No tree rotations required."
              );
              this.cmd("Step");
            }
          }
        }
        tmp = tmp.parent;
      }
    } else if (valueToDelete < tree.data) {
      if (tree.left != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR2,
          tree.x,
          tree.y
        );
        this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.left, valueToDelete);
    } else {
      if (tree.right != null) {
        this.cmd(
          "CreateHighlightCircle",
          this.highlightID,
          HIGHLIGHT_COLOR2,
          tree.x,
          tree.y
        );
        this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
        this.cmd("Step");
        this.cmd("Delete", this.highlightID);
      }
      this.treeDelete(tree.right, valueToDelete);
    }
  } else {
    this.cmd(
      "SetMessage",
      "Elemet " + valueToDelete + " not found, could not delete"
    );
  }
};
RedBlack.prototype.fixNodeColor = function(tree) {
  if (tree.colorLabelID != null) {
    if (tree.phantomLeaf) {
      this.cmd("SetText", tree.colorLabelID, "");
    } else {
      this.cmd("SetText", tree.colorLabelID, tree.blackLevel == 0 ? "R" : "B");
    }
  }
  if (tree.blackLevel == 0) {
    this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_RED);
    this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_RED);
  } else {
    this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_BLACK);
    if (tree.blackLevel > 1) {
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_DOUBLE_BLACK);
    } else {
      this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
    }
  }
};
RedBlack.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth
      );
    }
    this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
    this.animateNewPositions(this.treeRoot);
    this.updateGroupingsInternal();
    this.cmd("Step");
  }
};
RedBlack.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree != null && (showNullLeaves || !tree.phantomLeaf)) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
      tree.heightLabelX = xPosition - 20;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
      tree.heightLabelX = xPosition + 20;
    } else {
      tree.heightLabelX = xPosition - 20;
    }
    tree.x = xPosition;
    tree.heightLabelY = tree.y - 20;
    const childY = yPosition + heightDelta;
    this.setNewPositions(tree.left, xPosition, childY, -1);
    this.setNewPositions(tree.right, xPosition, childY, 1);
  }
};
RedBlack.prototype.animateNewPositions = function(tree) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree != null && (showNullLeaves || !tree.phantomLeaf)) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.cmd("Move", tree.colorLabelID, tree.heightLabelX, tree.heightLabelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
RedBlack.prototype.resizeWidths = function(tree) {
  let showNullLeaves = this.showNullLeaves && this.showNullLeaves.checked;
  if (tree == null || !showNullLeaves && tree.phantomLeaf) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), widthDelta / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), widthDelta / 2);
  return tree.leftWidth + tree.rightWidth;
};
RedBlack.prototype.disableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
RedBlack.prototype.enableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};
function RedBlackNode(val, id, cid, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.blackLevel = 0;
  this.phantomLeaf = false;
  this.graphicID = id;
  this.colorLabelID = cid;
  this.containerBoxID = null;
  this.left = null;
  this.right = null;
  this.parent = null;
  this.height = 0;
  this.leftWidth = 0;
  this.rightWidth = 0;
}
RedBlackNode.prototype.isLeftChild = function() {
  if (this.parent == null) {
    return true;
  }
  return this.parent.left == this;
};

// AlgorithmLibrary/SplayTree.js
SPLAYTREE.LINK_COLOR = "#007700";
SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR = "#007700";
SPLAYTREE.FOREGROUND_COLOR = "var(--svgColor)";
SPLAYTREE.PRINT_COLOR = SPLAYTREE.FOREGROUND_COLOR;
SPLAYTREE.WIDTH_DELTA = 50;
SPLAYTREE.HEIGHT_DELTA = 50;
SPLAYTREE.STARTING_Y = 50;
SPLAYTREE.FIRST_PRINT_POS_X = 50;
SPLAYTREE.PRINT_VERTICAL_GAP = 20;
SPLAYTREE.PRINT_HORIZONTAL_GAP = 50;
function SPLAYTREE(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Splay Tree";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
SPLAYTREE.prototype = new Algorithm();
SPLAYTREE.prototype.constructor = SPLAYTREE;
SPLAYTREE.superclass = Algorithm.prototype;
SPLAYTREE.prototype.init = function(am, w2, h) {
  var sc = SPLAYTREE.superclass;
  this.startingX = 100;
  this.first_print_pos_y = h - 2 * SPLAYTREE.PRINT_VERTICAL_GAP;
  this.print_max = w2 - 10;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.nextIndex = 0;
  this.commands = [];
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.doInsert = function(val) {
    this.implementAction(this.insertElement.bind(this), val);
  };
  this.doDelete = function(val) {
    this.implementAction(this.deleteElement.bind(this), val);
  };
  this.doFindValue = function(val) {
    this.implementAction(this.findElement.bind(this), val);
  };
  this.doPrint = function(order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doInsertRandom = function(count = 10, maxValue = 999) {
    for (let i = 0; i < count; i++) {
      const raw = Math.floor(1 + Math.random() * maxValue);
      const insertedValue = this.normalizeNumber(String(raw), 4);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
SPLAYTREE.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    4
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
};
SPLAYTREE.prototype.reset = function() {
  this.nextIndex = 1;
  this.treeRoot = null;
};
SPLAYTREE.prototype.insertCallback = function(event) {
  var insertedValue = this.inputField.value;
  insertedValue = this.normalizeNumber(insertedValue, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
SPLAYTREE.prototype.deleteCallback = function(event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    deletedValue = this.normalizeNumber(deletedValue, 4);
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
SPLAYTREE.prototype.clearCallback = function(event) {
  this.implementAction(this.clearData.bind(this), "");
};
SPLAYTREE.prototype.clearData = function() {
  if (this.treeRoot == null)
    return;
  this.commands = [];
  function clearTree(tree, handler) {
    if (tree != null) {
      if (tree.left != null) {
        clearTree(tree.left, handler);
      }
      if (tree.right != null) {
        clearTree(tree.right, handler);
      }
      handler.cmd("Delete", tree.graphicID);
    }
  }
  clearTree(this.treeRoot, this);
  this.treeRoot = null;
  this.cmd("SetMessage", "");
  return this.commands;
};
SPLAYTREE.prototype.insertRandomCallback = function(event) {
  var numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const raw = Math.floor(1 + Math.random() * 999);
    const insertedValue = this.normalizeNumber(String(raw), 4);
    this.implementAction(this.insertElement.bind(this), insertedValue);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
SPLAYTREE.prototype.splay = function(value) {
  if (this.treeRoot == null) {
    return false;
  }
  if (this.treeRoot.data == value) {
    return true;
  }
  if (value < this.treeRoot.data) {
    if (this.treeRoot.left == null) {
      return false;
    } else if (this.treeRoot.left.data == value) {
      this.singleRotateRight(this.treeRoot);
      return true;
    } else if (value < this.treeRoot.left.data) {
      if (this.treeRoot.left.left == null) {
        this.singleRotateRight(this.treeRoot);
        return this.splay(value);
      } else {
        this.zigZigRight(this.treeRoot);
        return this.splay(value);
      }
    } else {
      if (this.treeRoot.left.right == null) {
        this.singleRotateRight(this.treeRoot);
        return this.splay(value);
      } else {
        this.doubleRotateRight(this.treeRoot);
        return this.splay(value);
      }
    }
  } else {
    if (this.treeRoot.right == null) {
      return false;
    } else if (this.treeRoot.right.data == value) {
      this.singleRotateLeft(this.treeRoot);
      return true;
    } else if (value > this.treeRoot.right.data) {
      if (this.treeRoot.right.right == null) {
        this.singleRotateLeft(this.treeRoot);
        return this.splay(value);
      } else {
        this.zigZigLeft(this.treeRoot);
        return this.splay(value);
      }
    } else {
      if (this.treeRoot.right.left == null) {
        this.singleRotateLeft(this.treeRoot);
        return this.splay(value);
      } else {
        this.doubleRotateLeft(this.treeRot);
        return this.splay(value);
      }
    }
  }
};
SPLAYTREE.prototype.printCallback = function(event) {
  this.implementAction(this.printTree.bind(this), "");
};
SPLAYTREE.prototype.printTree = function(unused) {
  this.commands = [];
  if (this.treeRoot != null) {
    this.highlightID = this.nextIndex++;
    var firstLabel = this.nextIndex;
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
      this.treeRoot.x,
      this.treeRoot.y
    );
    this.xPosOfNextLabel = SPLAYTREE.FIRST_PRINT_POS_X;
    this.yPosOfNextLabel = this.first_print_pos_y;
    this.printTreeRec(this.treeRoot);
    this.cmd("Delete", this.highlightID);
    this.cmd("Step");
    for (var i = firstLabel; i < this.nextIndex; i++) {
      this.cmd("Delete", i);
    }
    this.nextIndex = this.highlightID;
  }
  return this.commands;
};
SPLAYTREE.prototype.printTreeRec = function(tree) {
  this.cmd("Step");
  if (tree.left != null) {
    this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
    this.printTreeRec(tree.left);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  var nextLabelID = this.nextIndex++;
  this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
  this.cmd("SetForegroundColor", nextLabelID, SPLAYTREE.PRINT_COLOR);
  this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
  this.cmd("Step");
  this.xPosOfNextLabel += SPLAYTREE.PRINT_HORIZONTAL_GAP;
  if (this.xPosOfNextLabel > this.print_max) {
    this.xPosOfNextLabel = SPLAYTREE.FIRST_PRINT_POS_X;
    this.yPosOfNextLabel += SPLAYTREE.PRINT_VERTICAL_GAP;
  }
  if (tree.right != null) {
    this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
    this.printTreeRec(tree.right);
    this.cmd("Move", this.highlightID, tree.x, tree.y);
    this.cmd("Step");
  }
  return;
};
SPLAYTREE.prototype.findCallback = function(event) {
  var findValue;
  findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
SPLAYTREE.prototype.findElement = function(findValue) {
  this.commands = [];
  this.highlightID = this.nextIndex++;
  var found = this.doFind(this.treeRoot, findValue);
  if (found) {
    this.cmd("SetMessage", "Element " + findValue + " found.");
  } else {
    this.cmd("SetMessage", "Element " + findValue + " not found.");
  }
  return this.commands;
};
SPLAYTREE.prototype.doFind = function(tree, value) {
  this.cmd("SetMessage", "Searching for " + value);
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd(
        "SetMessage",
        "Searching for " + value + " : " + value + " = " + value + " (Element found!)"
      );
      this.cmd("Step");
      this.cmd("SetMessage", "Splaying found node to root of tree");
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.splayUp(tree);
      return true;
    } else {
      if (tree.data > value) {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " : " + value + " < " + tree.data + " (look to left subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.left != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
          return this.doFind(tree.left, value);
        } else {
          this.splayUp(tree);
          return false;
        }
      } else {
        this.cmd(
          "SetMessage",
          "Searching for " + value + " : " + value + " > " + tree.data + " (look to right subtree)"
        );
        this.cmd("Step");
        this.cmd("SetHighlight", tree.graphicID, 0);
        if (tree.right != null) {
          this.cmd(
            "CreateHighlightCircle",
            this.highlightID,
            SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
            tree.x,
            tree.y
          );
          this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
          this.cmd("Step");
          this.cmd("Delete", this.highlightID);
          return this.doFind(tree.right, value);
        } else {
          this.splayUp(tree);
          return false;
        }
      }
    }
  } else {
    this.cmd(
      "SetMessage",
      "Searching for " + value + " : < Empty Tree > (Element not found)"
    );
    this.cmd("Step");
    this.cmd(
      "SetMessage",
      "Searching for " + value + " :  (Element not found)"
    );
    return false;
  }
};
SPLAYTREE.prototype.insertElement = function(insertedValue) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting " + insertedValue);
  this.highlightID = this.nextIndex++;
  if (this.treeRoot == null) {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      insertedValue,
      this.startingX,
      SPLAYTREE.STARTING_Y
    );
    this.cmd("SetForegroundColor", this.nextIndex, SPLAYTREE.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, SPLAYTREE.BACKGROUND_COLOR);
    this.cmd("Step");
    this.treeRoot = new BSTNode2(
      insertedValue,
      this.nextIndex,
      this.startingX,
      SPLAYTREE.STARTING_Y
    );
    this.nextIndex += 1;
  } else {
    this.cmd("CreateCircle", this.nextIndex, insertedValue, 100, 100);
    this.cmd("SetForegroundColor", this.nextIndex, SPLAYTREE.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, SPLAYTREE.BACKGROUND_COLOR);
    this.cmd("Step");
    var insertElem = new BSTNode2(insertedValue, this.nextIndex, 100, 100);
    this.nextIndex += 1;
    this.cmd("SetHighlight", insertElem.graphicID, 1);
    this.insert(insertElem, this.treeRoot);
    this.resizeTree();
    this.cmd("SetMessage", "Splay inserted element to root of tree");
    this.cmd("Step");
    this.splayUp(insertElem);
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
SPLAYTREE.prototype.insert = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    this.cmd(
      "SetMessage",
      elem.data + " < " + tree.data + ".  Looking at left subtree"
    );
  } else {
    this.cmd(
      "SetMessage",
      elem.data + " >= " + tree.data + ".  Looking at right subtree"
    );
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, SPLAYTREE.LINK_COLOR);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      this.cmd("SetHighlight", elem.graphicID, 0);
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, SPLAYTREE.LINK_COLOR);
      elem.x = tree.x + SPLAYTREE.WIDTH_DELTA / 2;
      elem.y = tree.y + SPLAYTREE.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
    } else {
      this.cmd(
        "CreateHighlightCircle",
        this.highlightID,
        SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
        tree.x,
        tree.y
      );
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      this.cmd("Delete", this.highlightID);
      this.insert(elem, tree.right);
    }
  }
};
SPLAYTREE.prototype.deleteElement = function(deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting " + deletedValue);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.highlightID = this.nextIndex++;
  this.treeDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", "");
  return this.commands;
};
SPLAYTREE.prototype.treeDelete = function(tree, valueToDelete) {
  this.cmd("SetMessage", "Finding " + valueToDelete + " and splaying to rooot");
  this.cmd("Step");
  var inTree = this.doFind(this.treeRoot, valueToDelete);
  this.cmd("SetMessage", "Removing root, leaving left and right trees");
  this.cmd("Step");
  if (inTree) {
    if (this.treeRoot.right == null) {
      this.cmd("Delete", this.treeRoot.graphicID);
      this.cmd("SetMessage", "No right tree, make left tree the root.");
      this.cmd("Step");
      this.treeRoot = this.treeRoot.left;
      this.treeRoot.parent = null;
      this.resizeTree();
    } else if (this.treeRoot.left == null) {
      this.cmd("Delete", this.treeRoot.graphicID);
      this.cmd("SetMessage", "No left tree, make right tree the root.");
      this.cmd("Step");
      this.treeRoot = this.treeRoot.right;
      this.treeRoot.parent = null;
      this.resizeTree();
    } else {
      var right = this.treeRoot.right;
      var left = this.treeRoot.left;
      var oldGraphicID = this.treeRoot.graphicID;
      this.cmd("Disconnect", this.treeRoot.graphicID, left.graphicID);
      this.cmd("Disconnect", this.treeRoot.graphicID, right.graphicID);
      this.cmd("SetAlpha", this.treeRoot.graphicID, 0);
      this.cmd("SetMessage", "Splay largest element in left tree to root");
      this.cmd("Step");
      left.parent = null;
      var largestLeft = this.findMax(left);
      this.splayUp(largestLeft);
      this.cmd(
        "SetMessage",
        "Left tree now has no right subtree, connect left and right trees"
      );
      this.cmd("Step");
      this.cmd(
        "Connect",
        largestLeft.graphicID,
        right.graphicID,
        SPLAYTREE.LINK_COLOR
      );
      largestLeft.parent = null;
      largestLeft.right = right;
      right.parent = largestLeft;
      this.treeRoot = largestLeft;
      this.cmd("Delete", oldGraphicID);
      this.resizeTree();
    }
  }
};
SPLAYTREE.prototype.singleRotateRight = function(tree) {
  var B = tree;
  var t3 = B.right;
  var A = tree.left;
  var t1 = A.left;
  var t2 = A.right;
  this.cmd("SetMessage", "Zig Right");
  this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
  this.cmd("Step");
  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
    t2.parent = B;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
  A.parent = B.parent;
  if (B.parent == null) {
    this.treeRoot = A;
  } else {
    this.cmd(
      "Disconnect",
      B.parent.graphicID,
      B.graphicID,
      SPLAYTREE.LINK_COLOR
    );
    this.cmd("Connect", B.parent.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
    if (B.isLeftChild()) {
      B.parent.left = A;
    } else {
      B.parent.right = A;
    }
  }
  A.right = B;
  B.parent = A;
  B.left = t2;
  this.resizeTree();
};
SPLAYTREE.prototype.zigZigRight = function(tree) {
  var C = tree;
  var B = tree.left;
  var A = tree.left.left;
  var t1 = A.left;
  var t2 = A.right;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetMessage", "Zig-Zig Right");
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);
  this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
  this.cmd("Step");
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 0);
  this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 0);
  if (C.parent != null) {
    this.cmd("Disconnect", C.parent.graphicID, C.graphicID);
    this.cmd("Connect", C.parent.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
    if (C.isLeftChild()) {
      C.parent.left = A;
    } else {
      C.parent.right = A;
    }
  } else {
    this.treeRoot = A;
  }
  if (t2 != null) {
    this.cmd("Disconnect", A.graphicID, t2.graphicID);
    this.cmd("Connect", B.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
    t2.parent = B;
  }
  if (t3 != null) {
    this.cmd("Disconnect", B.graphicID, t3.graphicID);
    this.cmd("Connect", C.graphicID, t3.graphicID, SPLAYTREE.LINK_COLOR);
    t3.parent = C;
  }
  this.cmd("Disconnect", B.graphicID, A.graphicID);
  this.cmd("Connect", A.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
  this.cmd("Disconnect", C.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, C.graphicID, SPLAYTREE.LINK_COLOR);
  A.right = B;
  A.parent = C.parent;
  B.parent = A;
  B.left = t2;
  B.right = C;
  C.parent = B;
  C.left = t3;
  this.resizeTree();
};
SPLAYTREE.prototype.zigZigLeft = function(tree) {
  var A = tree;
  var B = tree.right;
  var C = tree.right.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = C.left;
  var t4 = C.right;
  this.cmd("SetMessage", "Zig-Zig Left");
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.cmd("SetEdgeHighlight", B.graphicID, C.graphicID, 1);
  this.cmd("Step");
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 0);
  this.cmd("SetEdgeHighlight", B.graphicID, C.graphicID, 0);
  if (A.parent != null) {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID);
    this.cmd("Connect", A.parent.graphicID, C.graphicID, SPLAYTREE.LINK_COLOR);
    if (A.isLeftChild()) {
      A.parent.left = C;
    } else {
      A.parent.right = C;
    }
  } else {
    this.treeRoot = C;
  }
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
    t2.parent = A;
  }
  if (t3 != null) {
    this.cmd("Disconnect", C.graphicID, t3.graphicID);
    this.cmd("Connect", B.graphicID, t3.graphicID, SPLAYTREE.LINK_COLOR);
    t3.parent = B;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Disconnect", B.graphicID, C.graphicID);
  this.cmd("Connect", C.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
  this.cmd("Connect", B.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
  C.parent = A.parent;
  A.right = t2;
  B.left = A;
  A.parent = B;
  B.right = t3;
  C.left = B;
  B.parent = C;
  this.resizeTree();
};
SPLAYTREE.prototype.singleRotateLeft = function(tree) {
  var A = tree;
  var B = tree.right;
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  this.cmd("SetMessage", "Zig Left");
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.cmd("Step");
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    this.cmd("Connect", A.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
    t2.parent = A;
  }
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
  B.parent = A.parent;
  if (A.parent == null) {
    this.treeRoot = B;
  } else {
    this.cmd(
      "Disconnect",
      A.parent.graphicID,
      A.graphicID,
      SPLAYTREE.LINK_COLOR
    );
    this.cmd("Connect", A.parent.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
    if (A.isLeftChild()) {
      A.parent.left = B;
    } else {
      A.parent.right = B;
    }
  }
  B.left = A;
  A.parent = B;
  A.right = t2;
  this.resizeTree();
};
SPLAYTREE.prototype.splayUp = function(tree) {
  if (tree.parent == null) {
    return;
  } else if (tree.parent.parent == null) {
    if (tree.isLeftChild()) {
      this.singleRotateRight(tree.parent);
    } else {
      this.singleRotateLeft(tree.parent);
    }
  } else if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
    this.doubleRotateLeft(tree.parent.parent);
    this.splayUp(tree);
  } else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
    this.doubleRotateRight(tree.parent.parent);
    this.splayUp(tree);
  } else if (tree.isLeftChild()) {
    this.zigZigRight(tree.parent.parent);
    this.splayUp(tree);
  } else {
    this.zigZigLeft(tree.parent.parent);
    this.splayUp(tree);
  }
};
SPLAYTREE.prototype.findMax = function(tree) {
  if (tree.right != null) {
    this.highlightID = this.nextIndex++;
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      SPLAYTREE.HIGHLIGHT_CIRCLE_COLOR,
      tree.x,
      tree.y
    );
    this.cmd("Step");
    while (tree.right != null) {
      this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
      this.cmd("Step");
      tree = tree.right;
    }
    this.cmd("Delete", this.highlightID);
    return tree;
  } else {
    return tree;
  }
};
SPLAYTREE.prototype.doubleRotateRight = function(tree) {
  this.cmd("SetMessage", "Zig-Zag Right");
  var C = tree;
  var A = C.left;
  if (A == null) {
    this.singleRotateRight(C);
    return;
  }
  var B = A.right;
  if (B == null) {
    this.zigZigRight(C);
    return;
  }
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetEdgeHighlight", C.graphicID, A.graphicID, 1);
  this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
  this.cmd("Step");
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    t2.parent = A;
    A.right = t2;
    this.cmd("Connect", A.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
  }
  if (t3 != null) {
    this.cmd("Disconnect", B.graphicID, t3.graphicID);
    t3.parent = C;
    C.left = t3;
    this.cmd("Connect", C.graphicID, t3.graphicID, SPLAYTREE.LINK_COLOR);
  }
  if (C.parent == null) {
    B.parent = null;
    this.treeRoot = B;
  } else {
    this.cmd("Disconnect", C.parent.graphicID, C.graphicID);
    this.cmd("Connect", C.parent.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
    if (C.isLeftChild()) {
      C.parent.left = B;
    } else {
      C.parent.right = B;
    }
    B.parent = C.parent;
    C.parent = B;
  }
  this.cmd("Disconnect", C.graphicID, A.graphicID);
  this.cmd("Disconnect", A.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
  this.cmd("Connect", B.graphicID, C.graphicID, SPLAYTREE.LINK_COLOR);
  B.left = A;
  A.parent = B;
  B.right = C;
  C.parent = B;
  A.right = t2;
  C.left = t3;
  this.resizeTree();
};
SPLAYTREE.prototype.doubleRotateLeft = function(tree) {
  this.cmd("SetMessage", "Zig-Zag Left");
  var A = tree;
  var C = A.right;
  if (C == null) {
    this.singleRotateLeft(A);
    return;
  }
  var B = C.left;
  if (B == null) {
    this.zigZigLeft(A);
    return;
  }
  var t1 = A.left;
  var t2 = B.left;
  var t3 = B.right;
  var t4 = C.right;
  this.cmd("SetEdgeHighlight", A.graphicID, C.graphicID, 1);
  this.cmd("SetEdgeHighlight", C.graphicID, B.graphicID, 1);
  this.cmd("Step");
  if (t2 != null) {
    this.cmd("Disconnect", B.graphicID, t2.graphicID);
    t2.parent = A;
    A.right = t2;
    this.cmd("Connect", A.graphicID, t2.graphicID, SPLAYTREE.LINK_COLOR);
  }
  if (t3 != null) {
    this.cmd("Disconnect", B.graphicID, t3.graphicID);
    t3.parent = C;
    C.left = t3;
    this.cmd("Connect", C.graphicID, t3.graphicID, SPLAYTREE.LINK_COLOR);
  }
  if (A.parent == null) {
    B.parent = null;
    this.treeRoot = B;
  } else {
    this.cmd("Disconnect", A.parent.graphicID, A.graphicID);
    this.cmd("Connect", A.parent.graphicID, B.graphicID, SPLAYTREE.LINK_COLOR);
    if (A.isLeftChild()) {
      A.parent.left = B;
    } else {
      A.parent.right = B;
    }
    B.parent = A.parent;
    A.parent = B;
  }
  this.cmd("Disconnect", A.graphicID, C.graphicID);
  this.cmd("Disconnect", C.graphicID, B.graphicID);
  this.cmd("Connect", B.graphicID, A.graphicID, SPLAYTREE.LINK_COLOR);
  this.cmd("Connect", B.graphicID, C.graphicID, SPLAYTREE.LINK_COLOR);
  B.left = A;
  A.parent = B;
  B.right = C;
  C.parent = B;
  A.right = t2;
  C.left = t3;
  this.resizeTree();
};
SPLAYTREE.prototype.resizeTree = function() {
  var startingPoint = this.startingX;
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    if (this.treeRoot.leftWidth > startingPoint) {
      startingPoint = this.treeRoot.leftWidth;
    } else if (this.treeRoot.rightWidth > startingPoint) {
      startingPoint = Math.max(
        this.treeRoot.leftWidth,
        2 * startingPoint - this.treeRoot.rightWidth
      );
    }
    this.setNewPositions(this.treeRoot, startingPoint, SPLAYTREE.STARTING_Y, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
SPLAYTREE.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    this.setNewPositions(
      tree.left,
      xPosition,
      yPosition + SPLAYTREE.HEIGHT_DELTA,
      -1
    );
    this.setNewPositions(
      tree.right,
      xPosition,
      yPosition + SPLAYTREE.HEIGHT_DELTA,
      1
    );
  }
};
SPLAYTREE.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
SPLAYTREE.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(
    this.resizeWidths(tree.left),
    SPLAYTREE.WIDTH_DELTA / 2
  );
  tree.rightWidth = Math.max(
    this.resizeWidths(tree.right),
    SPLAYTREE.WIDTH_DELTA / 2
  );
  return tree.leftWidth + tree.rightWidth;
};
function BSTNode2(val, id, initialX, initialY) {
  this.data = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.left = null;
  this.right = null;
  this.parent = null;
}
BSTNode2.prototype.isLeftChild = function() {
  if (this.parent == null) {
    return true;
  }
  return this.parent.left == this;
};
SPLAYTREE.prototype.disableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = true;
  }
};
SPLAYTREE.prototype.enableUI = function(event) {
  let inputs = document.getElementById("AlgorithmSpecificControls").querySelectorAll("input");
  for (let i of inputs) {
    i.disabled = false;
  }
};

// AlgorithmLibrary/Treap.js
function Treap(opts = {}) {
  if (!opts.title)
    opts.title = "Treap";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  this.addControls();
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.insertElement.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
Treap.prototype = new Algorithm();
Treap.prototype.constructor = Treap;
Treap.superclass = Algorithm.prototype;
Treap.FOREGROUND_COLOR = "var(--svgColor)";
Treap.LINK_COLOR = Treap.FOREGROUND_COLOR;
Treap.HIGHLIGHT_CIRCLE_COLOR = Treap.FOREGROUND_COLOR;
Treap.PRIORITY_LABEL_COLOR = Treap.FOREGROUND_COLOR;
Treap.STARTING_Y = 40;
Treap.WIDTH_DELTA = 30;
Treap.HEIGHT_DELTA = 50;
Treap.PRIORITY_FONT_PERCENT = 85;
Treap.PRIORITY_OFFSET_LEFT_X = 28;
Treap.PRIORITY_OFFSET_RIGHT_X = 28;
Treap.PRIORITY_OFFSET_Y = 18;
Treap.PRIORITY_BASE_RGB = { r: 180, g: 220, b: 240 };
Treap.prototype.priorityColor = function(prio) {
  const a = Math.max(0, Math.min(1, prio / 1e3));
  const { r, g, b } = Treap.PRIORITY_BASE_RGB;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
Treap.prototype.init = function(am, w2, h) {
  var sc = Treap.superclass;
  var fn = sc.init;
  fn.call(this, am, w2, h);
  this.startingX = 150;
  this.nextIndex = 0;
  this.commands = [];
  this.rootIndex = 0;
  this.treeRoot = null;
  this.cmd("CreateRectangle", this.nextIndex++, "", 50, 25, this.startingX - 70, Treap.STARTING_Y - 10);
  this.cmd("SetNull", this.rootIndex, 1);
  this.cmd("CreateLabel", this.nextIndex++, "root", this.startingX - 120, Treap.STARTING_Y - 10);
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
  this.doInsert = (val) => this.implementAction(this.insertElement.bind(this), val);
  this.doRemove = (val) => this.implementAction(this.deleteElement.bind(this), val);
  this.doFind = (val) => this.implementAction(this.findElement.bind(this), val);
  this.doClear = () => this.implementAction(this.clearData.bind(this), "");
  this.doInsertRandom = (count = 10, maxValue = 999) => {
    for (let i = 0; i < count; i++) {
      const insertedValue = Math.floor(1 + Math.random() * maxValue);
      this.implementAction(this.insertElement.bind(this), insertedValue);
      this.animationManager.skipForward();
    }
    this.animationManager.clearHistory();
    this.animationManager.animatedObjects.draw();
  };
};
Treap.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
};
Treap.prototype.reset = function() {
  this.nextIndex = 2;
  this.treeRoot = null;
};
Treap.prototype.insertCallback = function() {
  var insertedValue = this.normalizeNumber(this.inputField.value, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
Treap.prototype.deleteCallback = function() {
  var deletedValue = this.normalizeNumber(this.inputField.value, 4);
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
Treap.prototype.findCallback = function() {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
Treap.prototype.clearCallback = function() {
  this.implementAction(this.clearData.bind(this), "");
};
Treap.prototype.insertRandomCallback = function() {
  this.doInsertRandom();
};
function TreapNode(val, prio, id, labelID, initialX, initialY) {
  this.data = val;
  this.priority = prio;
  this.graphicID = id;
  this.priorityLabelID = labelID;
  this.x = initialX;
  this.y = initialY;
  this.left = null;
  this.right = null;
  this.parent = null;
  this.leftWidth = Treap.WIDTH_DELTA / 2;
  this.rightWidth = Treap.WIDTH_DELTA / 2;
}
Treap.prototype.insertElement = function(insertedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Insert " + insertedValue);
  const prio = Math.floor(Math.random() * 1e3);
  this.cmd("SetMessage", "Set priority " + prio + " for " + insertedValue);
  this.cmd("Step");
  if (this.treeRoot == null) {
    const nodeID = this.nextIndex++;
    const labelID = this.nextIndex++;
    this.cmd("CreateCircle", nodeID, insertedValue, this.startingX, Treap.STARTING_Y);
    this.cmd("SetForegroundColor", nodeID, Treap.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", nodeID, this.priorityColor(prio));
    this.cmd("CreateLabel", labelID, prio, this.startingX - Treap.PRIORITY_OFFSET_LEFT_X, Treap.STARTING_Y - Treap.PRIORITY_OFFSET_Y, 1, Treap.PRIORITY_FONT_PERCENT);
    this.cmd("SetForegroundColor", labelID, Treap.PRIORITY_LABEL_COLOR);
    this.cmd("SetNull", this.rootIndex, 0);
    this.cmd("Connect", 0, nodeID, Treap.LINK_COLOR);
    this.treeRoot = new TreapNode(insertedValue, prio, nodeID, labelID, this.startingX, Treap.STARTING_Y);
  } else {
    const nodeID = this.nextIndex++;
    const labelID = this.nextIndex++;
    this.cmd("CreateCircle", nodeID, insertedValue, this.startingX - 200, Treap.STARTING_Y);
    this.cmd("SetForegroundColor", nodeID, Treap.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", nodeID, this.priorityColor(prio));
    this.cmd("CreateLabel", labelID, prio, this.startingX - 200 - Treap.PRIORITY_OFFSET_LEFT_X, Treap.STARTING_Y - Treap.PRIORITY_OFFSET_Y, 1, Treap.PRIORITY_FONT_PERCENT);
    this.cmd("SetForegroundColor", labelID, Treap.PRIORITY_LABEL_COLOR);
    this.cmd("Step");
    const elem = new TreapNode(insertedValue, prio, nodeID, labelID, 50, 100);
    this.cmd("SetHighlight", elem.graphicID, 1);
    this.insertBST(elem, this.treeRoot);
    this.heapifyUp(elem);
    this.resizeTree();
  }
  this.cmd("SetMessage", "");
  return this.commands;
};
Treap.prototype.insertBST = function(elem, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  this.cmd("SetHighlight", elem.graphicID, 1);
  if (elem.data < tree.data) {
    this.cmd("SetMessage", elem.data + " < " + tree.data + ". Looking at left subtree");
    if (tree.left)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
  } else {
    this.cmd("SetMessage", elem.data + " >= " + tree.data + ". Looking at right subtree");
    if (tree.right)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
  }
  this.cmd("Step");
  this.cmd("SetHighlight", tree.graphicID, 0);
  this.cmd("SetHighlight", elem.graphicID, 0);
  if (elem.data < tree.data) {
    if (tree.left == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      tree.left = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, Treap.LINK_COLOR);
    } else {
      if (tree.left)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.insertBST(elem, tree.left);
    }
  } else {
    if (tree.right == null) {
      this.cmd("SetMessage", "Found null tree, inserting element");
      tree.right = elem;
      elem.parent = tree;
      this.cmd("Connect", tree.graphicID, elem.graphicID, Treap.LINK_COLOR);
      elem.x = tree.x + Treap.WIDTH_DELTA / 2;
      elem.y = tree.y + Treap.HEIGHT_DELTA;
      this.cmd("Move", elem.graphicID, elem.x, elem.y);
      this.cmd("Move", elem.priorityLabelID, elem.x + Treap.PRIORITY_OFFSET_RIGHT_X, elem.y - Treap.PRIORITY_OFFSET_Y);
    } else {
      if (tree.right)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.insertBST(elem, tree.right);
    }
  }
};
Treap.prototype.heapifyUp = function(node) {
  while (node && node.parent && node.priority > node.parent.priority) {
    const p = node.parent;
    if (p.left === node) {
      this.singleRotateRight(p);
    } else {
      this.singleRotateLeft(p);
    }
  }
};
Treap.prototype.singleRotateLeft = function(x) {
  const y = x.right;
  if (!y)
    return;
  const B = y.left;
  const p = x.parent;
  const xWasLeft = p && p.left === x;
  this.cmd("SetMessage", "Rotate left at " + x.data + " (promote " + y.data + ")");
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");
  if (!p) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, Treap.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, Treap.LINK_COLOR);
    y.parent = p;
    if (xWasLeft)
      p.left = y;
    else
      p.right = y;
  }
  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, Treap.LINK_COLOR);
  if (B) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, Treap.LINK_COLOR);
  }
  x.parent = y;
  x.right = B;
  if (B)
    B.parent = x;
  y.left = x;
  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};
Treap.prototype.singleRotateRight = function(x) {
  const y = x.left;
  if (!y)
    return;
  const B = y.right;
  const p = x.parent;
  const xWasLeft = p && p.left === x;
  this.cmd("SetMessage", "Rotate right at " + x.data + " (promote " + y.data + ")");
  this.cmd("SetHighlight", x.graphicID, 1);
  this.cmd("SetHighlight", y.graphicID, 1);
  this.cmd("Step");
  if (!p) {
    this.cmd("Disconnect", 0, x.graphicID);
    this.cmd("Connect", 0, y.graphicID, Treap.LINK_COLOR);
    this.treeRoot = y;
    y.parent = null;
  } else {
    this.cmd("Disconnect", p.graphicID, x.graphicID);
    this.cmd("Connect", p.graphicID, y.graphicID, Treap.LINK_COLOR);
    y.parent = p;
    if (xWasLeft)
      p.left = y;
    else
      p.right = y;
  }
  this.cmd("Disconnect", x.graphicID, y.graphicID);
  this.cmd("Connect", y.graphicID, x.graphicID, Treap.LINK_COLOR);
  if (B) {
    this.cmd("Disconnect", y.graphicID, B.graphicID);
    this.cmd("Connect", x.graphicID, B.graphicID, Treap.LINK_COLOR);
  }
  x.parent = y;
  x.left = B;
  if (B)
    B.parent = x;
  y.right = x;
  this.cmd("SetHighlight", x.graphicID, 0);
  this.cmd("SetHighlight", y.graphicID, 0);
  this.resizeTree();
};
Treap.prototype.findElement = function(findValue) {
  this.commands = [];
  this.cmd("SetMessage", "Search " + findValue + " from root");
  this.cmd("Step");
  this.findImpl(this.treeRoot, findValue);
  return this.commands;
};
Treap.prototype.findImpl = function(tree, value) {
  if (tree != null) {
    this.cmd("SetHighlight", tree.graphicID, 1);
    if (tree.data == value) {
      this.cmd("SetMessage", "Found " + value);
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
    } else if (value < tree.data) {
      this.cmd("SetMessage", value + " < " + tree.data + ": go left");
      if (tree.left)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
      this.cmd("Step");
      if (tree.left)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.findImpl(tree.left, value);
    } else {
      this.cmd("SetMessage", value + " > " + tree.data + ": go right");
      if (tree.right)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
      this.cmd("Step");
      if (tree.right)
        this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
      this.cmd("SetHighlight", tree.graphicID, 0);
      this.findImpl(tree.right, value);
    }
  } else {
    this.cmd("SetMessage", "Hit null: not found");
    this.cmd("Step");
  }
};
Treap.prototype.deleteElement = function(deletedValue) {
  this.commands = [];
  this.cmd("SetMessage", "Remove " + deletedValue);
  this.cmd("Step");
  this.treapDelete(this.treeRoot, deletedValue);
  this.cmd("SetMessage", "");
  return this.commands;
};
Treap.prototype.treapDelete = function(tree, valueToDelete) {
  if (!tree)
    return;
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (valueToDelete < tree.data) {
    this.cmd("SetMessage", valueToDelete + " < " + tree.data + ": go left");
    if (tree.left)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 1);
    this.cmd("Step");
    if (tree.left)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.left.graphicID, 0);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.treapDelete(tree.left, valueToDelete);
  } else if (valueToDelete > tree.data) {
    this.cmd("SetMessage", valueToDelete + " > " + tree.data + ": go right");
    if (tree.right)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 1);
    this.cmd("Step");
    if (tree.right)
      this.cmd("SetEdgeHighlight", tree.graphicID, tree.right.graphicID, 0);
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.treapDelete(tree.right, valueToDelete);
  } else {
    this.cmd("SetMessage", "Found node " + tree.data + " (prio " + tree.priority + ")");
    this.cmd("Step");
    while (tree.left && tree.right) {
      if (tree.left.priority > tree.right.priority) {
        this.singleRotateRight(tree);
      } else {
        this.singleRotateLeft(tree);
      }
    }
    const p = tree.parent;
    if (!tree.left && !tree.right) {
      this.cmd("Delete", tree.graphicID);
      this.cmd("Delete", tree.priorityLabelID);
      if (p) {
        if (p.left === tree)
          p.left = null;
        else
          p.right = null;
      } else {
        this.treeRoot = null;
        this.cmd("SetNull", this.rootIndex, 1);
        this.cmd("Disconnect", 0, tree.graphicID);
      }
    } else {
      const child = tree.left ? tree.left : tree.right;
      if (p) {
        this.cmd("Disconnect", p.graphicID, tree.graphicID);
        this.cmd("Connect", p.graphicID, child.graphicID, Treap.LINK_COLOR);
        if (p.left === tree)
          p.left = child;
        else
          p.right = child;
        child.parent = p;
      } else {
        this.cmd("Disconnect", 0, tree.graphicID);
        this.cmd("Connect", 0, child.graphicID, Treap.LINK_COLOR);
        child.parent = null;
        this.treeRoot = child;
      }
      this.cmd("Delete", tree.graphicID);
      this.cmd("Delete", tree.priorityLabelID);
    }
    this.resizeTree();
  }
};
Treap.prototype.clearData = function() {
  this.commands = [];
  this.clearRec(this.treeRoot);
  this.treeRoot = null;
  this.cmd("SetNull", this.rootIndex, 1);
  return this.commands;
};
Treap.prototype.clearRec = function(tree) {
  if (!tree)
    return;
  this.clearRec(tree.left);
  this.clearRec(tree.right);
  this.cmd("Delete", tree.graphicID);
  this.cmd("Delete", tree.priorityLabelID);
};
Treap.prototype.resizeTree = function() {
  this.resizeWidths(this.treeRoot);
  if (this.treeRoot != null) {
    var startingPoint = this.startingX;
    var startingY2 = Treap.STARTING_Y;
    this.setNewPositions(this.treeRoot, startingPoint, startingY2, 0);
    this.animateNewPositions(this.treeRoot);
    this.cmd("Step");
  }
};
Treap.prototype.setNewPositions = function(tree, xPosition, yPosition, side) {
  if (tree != null) {
    tree.y = yPosition;
    if (side == -1) {
      xPosition = xPosition - tree.rightWidth;
    } else if (side == 1) {
      xPosition = xPosition + tree.leftWidth;
    }
    tree.x = xPosition;
    var leftWidth = this.resizeWidths(tree.left);
    var rightWidth = this.resizeWidths(tree.right);
    tree.leftWidth = Math.max(leftWidth, Treap.WIDTH_DELTA / 2);
    tree.rightWidth = Math.max(rightWidth, Treap.WIDTH_DELTA / 2);
    this.setNewPositions(
      tree.left,
      xPosition - tree.rightWidth,
      yPosition + Treap.HEIGHT_DELTA,
      -1
    );
    this.setNewPositions(
      tree.right,
      xPosition + tree.leftWidth,
      yPosition + Treap.HEIGHT_DELTA,
      1
    );
  }
};
Treap.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    const isRightChild = !tree.parent || tree.parent.right === tree;
    const labelX = isRightChild ? tree.x + Treap.PRIORITY_OFFSET_RIGHT_X : tree.x - Treap.PRIORITY_OFFSET_LEFT_X;
    const labelY = tree.y - Treap.PRIORITY_OFFSET_Y;
    this.cmd("Move", tree.priorityLabelID, labelX, labelY);
    this.animateNewPositions(tree.left);
    this.animateNewPositions(tree.right);
  }
};
Treap.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  tree.leftWidth = Math.max(this.resizeWidths(tree.left), Treap.WIDTH_DELTA / 2);
  tree.rightWidth = Math.max(this.resizeWidths(tree.right), Treap.WIDTH_DELTA / 2);
  return tree.leftWidth + tree.rightWidth;
};
Treap.prototype.disableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.clearButton,
    this.insertRandomButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = true;
  }
};
Treap.prototype.enableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.clearButton,
    this.insertRandomButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = false;
  }
};

// AlgorithmLibrary/StackArray.js
var ARRAY_START_X2 = 100;
var ARRAY_START_Y2 = 100;
var ARRAY_ELEM_WIDTH6 = 50;
var ARRAY_ELEM_HEIGHT6 = 30;
var ARRAY_ELEMS_PER_LINE2 = 10;
var ARRAY_LINE_SPACING2 = 130;
var TOP_LABEL_X5 = 100;
var TOP_POS_X6 = TOP_LABEL_X5 + 50;
var TOP_POS_Y6 = 30;
var TOP_LABEL_Y6 = TOP_POS_Y6;
var STACK_LABEL_X = TOP_LABEL_X5 + 180;
var STACK_LABEL_Y = 30;
var STACK_ELEMENT_X = STACK_LABEL_X;
var STACK_ELEMENT_Y = 30;
var INDEX_COLOR4 = "#0000FF";
var SIZE7 = 8;
function StackArray(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Stack (Array)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  if (opts.size)
    SIZE7 = opts.size;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.push.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
StackArray.prototype = new Algorithm();
StackArray.prototype.constructor = StackArray;
StackArray.superclass = Algorithm.prototype;
StackArray.prototype.init = function(am, w2, h) {
  StackArray.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doPush = function(val) {
    this.implementAction(this.push.bind(this), val);
  };
  this.doPop = function() {
    this.implementAction(this.pop.bind(this));
  };
  this.doPeek = function() {
    this.implementAction(this.peek.bind(this));
  };
};
StackArray.prototype.addControls = function() {
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.setAttribute("placeholder", "Value to push");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.pushCallback.bind(this),
    6
  );
  this.pushButton = addControlToAlgorithmBar("Button", "Push");
  this.pushButton.onclick = this.pushCallback.bind(this);
  this.controls.push(this.pushButton);
  this.popButton = addControlToAlgorithmBar("Button", "Pop");
  this.popButton.onclick = this.popCallback.bind(this);
  this.controls.push(this.popButton);
  this.peekButton = addControlToAlgorithmBar("Button", "Peek");
  this.peekButton.onclick = this.peekCallback.bind(this);
  this.controls.push(this.peekButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  this.clearButton.style.display = "none";
};
StackArray.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
StackArray.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
StackArray.prototype.setup = function() {
  this.nextIndex = 0;
  this.arrayID = new Array(SIZE7);
  this.arrayLabelID = new Array(SIZE7);
  for (var i = 0; i < SIZE7; i++) {
    this.arrayID[i] = this.nextIndex++;
    this.arrayLabelID[i] = this.nextIndex++;
  }
  this.topID = this.nextIndex++;
  this.topLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE7);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.commands = new Array();
  for (var i = 0; i < SIZE7; i++) {
    var xpos = i % ARRAY_ELEMS_PER_LINE2 * ARRAY_ELEM_WIDTH6 + ARRAY_START_X2;
    var ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE2) * ARRAY_LINE_SPACING2 + ARRAY_START_Y2;
    this.cmd(
      "CreateRectangle",
      this.arrayID[i],
      "",
      ARRAY_ELEM_WIDTH6,
      ARRAY_ELEM_HEIGHT6,
      xpos,
      ypos
    );
    this.cmd(
      "CreateLabel",
      this.arrayLabelID[i],
      i,
      xpos,
      ypos + ARRAY_ELEM_HEIGHT6
    );
    this.cmd("SetForegroundColor", this.arrayLabelID[i], INDEX_COLOR4);
  }
  this.cmd("CreateLabel", this.topLabelID, "Top", TOP_LABEL_X5, TOP_LABEL_Y6);
  this.cmd(
    "CreateRectangle",
    this.topID,
    0,
    ARRAY_ELEM_WIDTH6,
    ARRAY_ELEM_HEIGHT6,
    TOP_POS_X6,
    TOP_POS_Y6
  );
  this.cmd("CreateLabel", this.leftoverLabelID, "", STACK_LABEL_X, STACK_LABEL_Y);
  this.highlight1ID = this.nextIndex++;
  this.highlight2ID = this.nextIndex++;
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
StackArray.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};
StackArray.prototype.pushCallback = function(event) {
  if (this.inputField.value !== "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.push.bind(this), pushVal);
  }
};
StackArray.prototype.popCallback = function(event) {
  this.implementAction(this.pop.bind(this), "");
};
StackArray.prototype.clearCallback = function(event) {
  this.implementAction(this.clearAll.bind(this), "");
};
StackArray.prototype.peekCallback = function(event) {
  this.implementAction(this.peek.bind(this), "");
};
StackArray.prototype.push = function(elemToPush) {
  this.commands = new Array();
  if (this.top >= SIZE7) {
    this.cmd("SetMessage", "Top == size. Stack is full. Cannot push.");
    this.cmd("Step");
    return this.commands;
  }
  var labPushValID = this.nextIndex++;
  this.arrayData[this.top] = elemToPush;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Pushing Value: " + elemToPush);
  this.cmd(
    "CreateLabel",
    labPushValID,
    elemToPush,
    STACK_ELEMENT_X,
    STACK_ELEMENT_Y
  );
  this.cmd("Step");
  this.cmd("SetMessage", "Top gives next available location.");
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR4,
    TOP_POS_X6,
    TOP_POS_Y6
  );
  this.cmd("Step");
  var xpos = this.top % ARRAY_ELEMS_PER_LINE2 * ARRAY_ELEM_WIDTH6 + ARRAY_START_X2;
  var ypos = Math.floor(this.top / ARRAY_ELEMS_PER_LINE2) * ARRAY_LINE_SPACING2 + ARRAY_START_Y2;
  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT6);
  this.cmd("Step");
  this.cmd("Move", labPushValID, xpos, ypos);
  this.cmd("Step");
  this.cmd("Settext", this.arrayID[this.top], elemToPush);
  this.cmd("Delete", labPushValID);
  this.cmd("Delete", this.highlight1ID);
  this.cmd("SetHighlight", this.topID, 1);
  this.cmd("SetMessage", "Advance top to next location.");
  this.cmd("Step");
  this.top = this.top + 1;
  this.cmd("SetText", this.topID, this.top);
  this.cmd("Step");
  this.cmd("SetHighlight", this.topID, 0);
  this.cmd("SetMessage", "");
  return this.commands;
};
StackArray.prototype.pop = function(ignored) {
  this.commands = new Array();
  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }
  var labPopValID = this.nextIndex++;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetHighlight", this.topID, 1);
  this.cmd("SetMessage", "Decrement top to previous location.");
  this.cmd("Step");
  this.top = this.top - 1;
  this.cmd("SetText", this.topID, this.top);
  this.cmd("Step");
  this.cmd("SetHighlight", this.topID, 0);
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR4,
    TOP_POS_X6,
    TOP_POS_Y6
  );
  this.cmd("SetMessage", "Top gives location of last value.");
  this.cmd("Step");
  var xpos = this.top % ARRAY_ELEMS_PER_LINE2 * ARRAY_ELEM_WIDTH6 + ARRAY_START_X2;
  var ypos = Math.floor(this.top / ARRAY_ELEMS_PER_LINE2) * ARRAY_LINE_SPACING2 + ARRAY_START_Y2;
  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT6);
  this.cmd("Step");
  this.cmd("Delete", this.highlight1ID);
  var poppedVal = this.arrayData[this.top];
  this.cmd("CreateLabel", labPopValID, poppedVal, xpos, ypos);
  this.cmd("Settext", this.arrayID[this.top], "");
  this.cmd("Move", labPopValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.cmd("SetMessage", `Pop ${poppedVal}`);
  this.cmd("Step");
  this.cmd("Delete", labPopValID);
  this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + poppedVal);
  this.cmd("SetMessage", "");
  return this.commands;
};
StackArray.prototype.peek = function(ignored) {
  this.commands = new Array();
  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }
  const labPeekValID = this.nextIndex++;
  const peekIndex = this.top - 1;
  const peekedVal = this.arrayData[peekIndex];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Peek at top value");
  this.cmd("Step");
  this.cmd(
    "CreateHighlightCircle",
    this.highlight1ID,
    INDEX_COLOR4,
    TOP_POS_X6,
    TOP_POS_Y6
  );
  this.cmd("SetMessage", "Top-1 gives location of last value.");
  this.cmd("Step");
  const xpos = peekIndex % ARRAY_ELEMS_PER_LINE2 * ARRAY_ELEM_WIDTH6 + ARRAY_START_X2;
  const ypos = Math.floor(peekIndex / ARRAY_ELEMS_PER_LINE2) * ARRAY_LINE_SPACING2 + ARRAY_START_Y2;
  this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT6);
  this.cmd("Step");
  this.cmd("Delete", this.highlight1ID);
  this.cmd("CreateLabel", labPeekValID, peekedVal, xpos, ypos);
  this.cmd("Move", labPeekValID, STACK_ELEMENT_X, STACK_ELEMENT_Y);
  this.cmd("SetMessage", "Peeked Value: " + peekedVal);
  this.cmd("Step");
  this.cmd("Delete", labPeekValID);
  this.cmd("SetText", this.leftoverLabelID, "Peeked Value: " + peekedVal);
  this.cmd("SetMessage", "");
  return this.commands;
};
StackArray.prototype.clearAll = function() {
  this.commands = new Array();
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "");
  for (var i = 0; i < SIZE7; i++) {
    this.cmd("SetText", this.arrayID[i], "");
  }
  this.top = 0;
  this.cmd("SetText", this.topID, "0");
  return this.commands;
};

// AlgorithmLibrary/StackLL.js
var LINKED_LIST_START_X6 = 100;
var LINKED_LIST_START_Y6 = 150;
var LINKED_LIST_ELEM_WIDTH6 = 50;
var LINKED_LIST_ELEM_HEIGHT6 = 25;
var LINKED_LIST_INSERT_X = 250;
var LINKED_LIST_INSERT_Y = 50;
var LINKED_LIST_ELEMS_PER_LINE5 = 10;
var LINKED_LIST_ELEM_SPACING6 = 70;
var LINKED_LIST_LINE_SPACING5 = 100;
var TOP_POS_X7 = 70;
var TOP_POS_Y7 = 50;
var TOP_LABEL_X6 = TOP_POS_X7;
var TOP_LABEL_Y7 = 25;
var TOP_ELEM_WIDTH6 = 40;
var TOP_ELEM_HEIGHT6 = 25;
var STACK_LABEL_X2 = TOP_POS_X7 + TOP_ELEM_WIDTH6 * 5;
var STACK_LABEL_Y2 = 25;
var STACK_ELEMENT_X2 = STACK_LABEL_X2;
var STACK_ELEMENT_Y2 = 50;
var SIZE8 = 32;
function StackLL(opts = {}) {
  if (!opts.title)
    opts.title = opts.title || "Stack (Linked List)";
  opts.heightSingleMode = 250;
  opts.height = 300;
  opts.heightMobile = 450;
  if (opts.size)
    SIZE8 = opts.size;
  let am = initAnimationManager(opts);
  this.init(am, 800, 400);
  if (opts.initialData) {
    for (let d of opts.initialData) {
      this.implementAction(this.push.bind(this), d);
      am.skipForward();
    }
    am.clearHistory();
    am.animatedObjects.draw();
  }
}
StackLL.prototype = new Algorithm();
StackLL.prototype.constructor = StackLL;
StackLL.superclass = Algorithm.prototype;
StackLL.prototype.init = function(am, w2, h) {
  StackLL.superclass.init.call(this, am, w2, h);
  this.addControls();
  this.nextIndex = 0;
  this.commands = [];
  this.setup();
  this.initialIndex = this.nextIndex;
  this.doPush = function(val) {
    this.implementAction(this.push.bind(this), val);
  };
  this.doPop = function() {
    this.implementAction(this.pop.bind(this));
  };
  this.doPeek = function() {
    this.implementAction(this.peek.bind(this));
  };
};
StackLL.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.controls = [];
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.setAttribute("placeholder", "Value to push");
  this.controls.push(this.inputField);
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.pushCallback.bind(this),
    6
  );
  this.pushButton = addControlToAlgorithmBar("Button", "Push");
  this.pushButton.onclick = this.pushCallback.bind(this);
  this.controls.push(this.pushButton);
  this.popButton = addControlToAlgorithmBar("Button", "Pop");
  this.popButton.onclick = this.popCallback.bind(this);
  this.controls.push(this.popButton);
  this.peekButton = addControlToAlgorithmBar("Button", "Peek");
  this.peekButton.onclick = this.peekCallback.bind(this);
  this.controls.push(this.peekButton);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.controls.push(this.clearButton);
  this.clearButton.style.display = "none";
};
StackLL.prototype.enableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = false;
  }
};
StackLL.prototype.disableUI = function(event) {
  for (var i = 0; i < this.controls.length; i++) {
    this.controls[i].disabled = true;
  }
};
StackLL.prototype.setup = function() {
  this.linkedListElemID = new Array(SIZE8);
  for (var i = 0; i < SIZE8; i++) {
    this.linkedListElemID[i] = this.nextIndex++;
  }
  this.topID = this.nextIndex++;
  this.topLabelID = this.nextIndex++;
  this.arrayData = new Array(SIZE8);
  this.top = 0;
  this.leftoverLabelID = this.nextIndex++;
  this.cmd("CreateLabel", this.topLabelID, "Top", TOP_LABEL_X6, TOP_LABEL_Y7);
  this.cmd(
    "CreateRectangle",
    this.topID,
    "",
    TOP_ELEM_WIDTH6,
    TOP_ELEM_HEIGHT6,
    TOP_POS_X7,
    TOP_POS_Y7
  );
  this.cmd("SetNull", this.topID, 1);
  this.cmd(
    "CreateLabel",
    this.leftoverLabelID,
    "",
    STACK_LABEL_X2,
    STACK_LABEL_Y2,
    0
  );
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
StackLL.prototype.resetLinkedListPositions = function() {
  for (var i = this.top - 1; i >= 0; i--) {
    var nextX = (this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE5 * LINKED_LIST_ELEM_SPACING6 + LINKED_LIST_START_X6;
    var nextY = Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE5) * LINKED_LIST_LINE_SPACING5 + LINKED_LIST_START_Y6 + (this.top - 1 - i) % 2 * 15;
    this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
  }
};
StackLL.prototype.reset = function() {
  this.top = 0;
  this.nextIndex = this.initialIndex;
};
StackLL.prototype.pushCallback = function(event) {
  if (this.inputField.value !== "") {
    var pushVal = this.inputField.value;
    this.inputField.value = "";
    this.implementAction(this.push.bind(this), pushVal);
  }
};
StackLL.prototype.popCallback = function(event) {
  this.implementAction(this.pop.bind(this), "");
};
StackLL.prototype.clearCallback = function(event) {
  this.implementAction(this.clearAll.bind(this), "");
};
StackLL.prototype.peekCallback = function(event) {
  this.implementAction(this.peek.bind(this), "");
};
StackLL.prototype.push = function(elemToPush) {
  this.commands = new Array();
  if (this.top >= SIZE8) {
    this.cmd("SetMessage", "Top == size. Stack is full. Cannot push.");
    this.cmd("Step");
    return this.commands;
  }
  var labPushValID = this.nextIndex++;
  this.arrayData[this.top] = elemToPush;
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Pushing Value: " + elemToPush);
  this.cmd(
    "CreateLinkedList",
    this.linkedListElemID[this.top],
    "",
    LINKED_LIST_ELEM_WIDTH6,
    LINKED_LIST_ELEM_HEIGHT6,
    LINKED_LIST_INSERT_X,
    LINKED_LIST_INSERT_Y,
    0.25,
    0,
    1,
    1
  );
  this.cmd(
    "CreateLabel",
    labPushValID,
    elemToPush,
    STACK_ELEMENT_X2,
    STACK_ELEMENT_Y2
  );
  this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
  this.cmd("Step");
  this.cmd("SetText", this.linkedListElemID[this.top], elemToPush);
  this.cmd("Delete", labPushValID);
  if (this.top == 0) {
    this.cmd("SetNull", this.topID, 0);
    this.cmd("SetNull", this.linkedListElemID[this.top], 1);
  } else {
    this.cmd(
      "Connect",
      this.linkedListElemID[this.top],
      this.linkedListElemID[this.top - 1],
      "#000000",
      0.1
    );
    this.cmd("Step");
    this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
  }
  this.cmd("Connect", this.topID, this.linkedListElemID[this.top], "#000000", 0.1);
  this.cmd("Step");
  this.top = this.top + 1;
  this.resetLinkedListPositions();
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
StackLL.prototype.pop = function(ignored) {
  this.commands = new Array();
  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }
  var labPopValID = this.nextIndex++;
  var poppedVal = this.arrayData[this.top - 1];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Popping top value");
  this.cmd("Step");
  this.cmd(
    "CreateLabel",
    labPopValID,
    poppedVal,
    LINKED_LIST_START_X6,
    LINKED_LIST_START_Y6
  );
  this.cmd("Move", labPopValID, STACK_ELEMENT_X2, STACK_ELEMENT_Y2);
  this.cmd("Step");
  this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
  if (this.top == 1) {
    this.cmd("SetNull", this.topID, 1);
  } else {
    this.cmd(
      "Connect",
      this.topID,
      this.linkedListElemID[this.top - 2],
      "#000000",
      0.1
    );
  }
  this.cmd("Step");
  this.cmd("Delete", this.linkedListElemID[this.top - 1]);
  this.top = this.top - 1;
  this.resetLinkedListPositions();
  this.cmd("Delete", labPopValID);
  this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + poppedVal);
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
StackLL.prototype.peek = function(ignored) {
  this.commands = new Array();
  if (this.top <= 0) {
    this.cmd("SetMessage", "Top == 0. Stack is empty.");
    this.cmd("Step");
    return this.commands;
  }
  const labPeekValID = this.nextIndex++;
  const peekedVal = this.arrayData[this.top - 1];
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "Peeking at top value");
  this.cmd("Step");
  let srcX = LINKED_LIST_START_X6;
  let srcY = LINKED_LIST_START_Y6;
  try {
    srcX = this.animationManager.animatedObjects.getNodeX(
      this.linkedListElemID[this.top - 1]
    );
    srcY = this.animationManager.animatedObjects.getNodeY(
      this.linkedListElemID[this.top - 1]
    );
  } catch (e) {
  }
  this.cmd("CreateLabel", labPeekValID, peekedVal, srcX, srcY);
  this.cmd("Move", labPeekValID, STACK_ELEMENT_X2, STACK_ELEMENT_Y2);
  this.cmd("SetMessage", "Peeked Value: " + peekedVal);
  this.cmd("Step");
  this.cmd("Delete", labPeekValID);
  this.cmd("SetText", this.leftoverLabelID, "Peeked Value: " + peekedVal);
  this.cmd("SetMessage", "");
  this.cmd("Step");
  return this.commands;
};
StackLL.prototype.clearAll = function() {
  this.commands = new Array();
  this.cmd("SetText", this.leftoverLabelID, "");
  this.cmd("SetMessage", "");
  for (var i = 0; i < this.top; i++) {
    this.cmd("Delete", this.linkedListElemID[i]);
  }
  this.top = 0;
  this.cmd("SetNull", this.topID, 1);
  return this.commands;
};

// AlgorithmLibrary/ExpressionTree.js
ExpressionTree.FOREGROUND_COLOR = "var(--svgColor)";
ExpressionTree.LINK_COLOR = ExpressionTree.FOREGROUND_COLOR;
ExpressionTree.STARTING_Y = 40;
ExpressionTree.LEVEL_HEIGHT = 70;
ExpressionTree.NODE_RADIUS = 20;
ExpressionTree.MARGIN_X = 50;
function ExpressionTree(opts = {}) {
  if (!opts.title)
    opts.title = "Expression Tree";
  opts.centered = true;
  const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
  const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
  if (!Number.isFinite(opts.height)) {
    opts.height = viewHeight;
  }
  if (!Number.isFinite(opts.viewWidth)) {
    opts.viewWidth = viewWidth;
  }
  if (!Number.isFinite(opts.viewHeight)) {
    opts.viewHeight = viewHeight;
  }
  const am = initAnimationManager(opts);
  this.init(am, viewWidth, viewHeight);
  this.addControls();
  if (opts.initialData) {
    const root = this.parseInitialData(opts.initialData);
    this.implementAction(this.buildTree.bind(this), root);
    am.skipForward();
    am.clearHistory();
  }
}
ExpressionTree.prototype = new Algorithm();
ExpressionTree.prototype.constructor = ExpressionTree;
ExpressionTree.superclass = Algorithm.prototype;
ExpressionTree.prototype.init = function(am, w2, h) {
  const sc = ExpressionTree.superclass;
  const fn = sc.init;
  fn.call(this, am, w2, h);
  this.nextIndex = 0;
  this.commands = [];
  this.treeRoot = null;
  this.evalLabelIDs = [];
  this.printOutput = "";
  this.printOutputLabelID = -1;
  this.doBuild = function(data) {
    let parsed = data;
    if (typeof parsed === "string") {
      const trimmed = parsed.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
        }
      } else {
        try {
          const root2 = this.parseInfixExpression(trimmed);
          this.implementAction(this.buildTree.bind(this), root2);
          return;
        } catch {
        }
      }
    }
    const isNodeLike = parsed && typeof parsed === "object" && Object.prototype.hasOwnProperty.call(parsed, "label") && Object.prototype.hasOwnProperty.call(parsed, "children");
    const root = isNodeLike ? parsed : this.parseInitialData(parsed);
    this.implementAction(this.buildTree.bind(this), root);
  };
  this.doClear = function() {
    this.implementAction(this.clearTree.bind(this), "");
  };
  this.doPrint = function(order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doEvaluate = function() {
    this.implementAction(this.evaluateTree.bind(this), "");
  };
};
ExpressionTree.prototype.deleteTreeGraphicsRec = function(node, opts = {}) {
  if (!node)
    return;
  const doStep = opts.step !== false;
  const children = Array.isArray(node.children) ? node.children : [];
  let childNum = 1;
  for (const child of children) {
    if (doStep) {
      if (childNum === 1)
        this.cmd("SetMessage", "In " + node.label + ". Must delete first child");
      else
        this.cmd("SetMessage", "In " + node.label + ". Must delete second child");
      this.cmd("SetHighlight", node.graphicID, 1);
      this.cmd("Step");
      this.cmd("SetHighlight", node.graphicID, 0);
    }
    this.deleteTreeGraphicsRec(child, opts);
    childNum++;
  }
  if (Number.isFinite(node.graphicID)) {
    if (doStep) {
      this.cmd("SetHighlight", node.graphicID, 1);
      this.cmd("SetMessage", "Deleting " + node.label);
      this.cmd("Step");
    }
    this.cmd("Delete", node.graphicID);
    if (doStep) {
      this.cmd("SetHighlight", node.graphicID, 0);
    }
  }
};
ExpressionTree.prototype.clearTree = function() {
  this.commands = [];
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("Delete", this.printOutputLabelID);
  }
  this.printOutputLabelID = -1;
  this.printOutput = "";
  if (this.treeRoot) {
    this.cmd("SetMessage", "Clearing existing tree");
    this.cmd("Step");
    this.deleteTreeGraphicsRec(this.treeRoot);
    this.treeRoot = null;
    this.cmd("SetMessage", "");
  }
  return this.commands;
};
ExpressionTree.prototype.resetPrintOutputLabel = function() {
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("Delete", this.printOutputLabelID);
  }
  this.printOutputLabelID = this.nextIndex++;
  const x = this.canvasWidth / 2 - 200;
  const y = 40;
  this.cmd("CreateLabel", this.printOutputLabelID, "Output:", x, y, 0);
  this.cmd("SetForegroundColor", this.printOutputLabelID, ExpressionTree.FOREGROUND_COLOR);
};
ExpressionTree.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.printpreButton = addControlToAlgorithmBar("Button", "Print PreOrder");
  this.printpreButton.onclick = this.print.bind(this, "Pre");
  this.printButton = addControlToAlgorithmBar("Button", "Print InOrder");
  this.printButton.onclick = this.print.bind(this, "In");
  this.printpostButton = addControlToAlgorithmBar("Button", "Print PostOrder");
  this.printpostButton.onclick = this.print.bind(this, "Post");
  this.parensInorderCheckbox = addCheckboxToAlgorithmBar(
    "Parens in InOrder",
    "parensInorderCheckbox"
  );
  this.parensInorderCheckbox.checked = false;
  addSeparatorToAlgorithmBar();
  this.evaluateButton = addControlToAlgorithmBar("Button", "Evaluate");
  this.evaluateButton.onclick = this.evaluateCallback.bind(this);
  addSeparatorToAlgorithmBar();
  this.expressionField = addControlToAlgorithmBar(
    "Text",
    "",
    "expressionField",
    "Infix expression"
  );
  this.loadExpressionButton = addControlToAlgorithmBar("Button", "Load Expression");
  this.loadExpressionButton.onclick = this.loadExpressionCallback.bind(this);
};
ExpressionTree.prototype.disableUI = function(event) {
  if (this.expressionField)
    this.expressionField.disabled = true;
  if (this.loadExpressionButton)
    this.loadExpressionButton.disabled = true;
  if (this.printpreButton)
    this.printpreButton.disabled = true;
  if (this.printButton)
    this.printButton.disabled = true;
  if (this.printpostButton)
    this.printpostButton.disabled = true;
  if (this.parensInorderCheckbox)
    this.parensInorderCheckbox.disabled = true;
  if (this.evaluateButton)
    this.evaluateButton.disabled = true;
  if (this.clearButton)
    this.clearButton.disabled = true;
};
ExpressionTree.prototype.enableUI = function(event) {
  if (this.expressionField)
    this.expressionField.disabled = false;
  if (this.loadExpressionButton)
    this.loadExpressionButton.disabled = false;
  if (this.printpreButton)
    this.printpreButton.disabled = false;
  if (this.printButton)
    this.printButton.disabled = false;
  if (this.printpostButton)
    this.printpostButton.disabled = false;
  if (this.parensInorderCheckbox)
    this.parensInorderCheckbox.disabled = false;
  if (this.evaluateButton)
    this.evaluateButton.disabled = false;
  if (this.clearButton)
    this.clearButton.disabled = false;
};
ExpressionTree.prototype.print = function(order) {
  this.implementAction(this.printTree.bind(this), order);
};
ExpressionTree.prototype.loadExpressionCallback = function(event) {
  const expr = this.expressionField ? this.expressionField.value : "";
  this.implementAction(this.buildTreeFromInfix.bind(this), expr);
};
ExpressionTree.prototype.clearCallback = function(event) {
  this.implementAction(this.clearTree.bind(this), "");
};
ExpressionTree.prototype.evaluateCallback = function(event) {
  this.implementAction(this.evaluateTree.bind(this), "");
};
ExpressionTree.prototype.buildTreeFromInfix = function(expr) {
  this.commands = [];
  let root;
  try {
    root = this.parseInfixExpression(expr);
  } catch (e) {
    this.cmd("SetMessage", `Invalid expression: ${e?.message ?? String(e)}`);
    this.cmd("SetMessage", "");
    return this.commands;
  }
  if (!root) {
    this.cmd("SetMessage", "No expression provided");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  return this.buildTree(root);
};
ExpressionTree.prototype.tokenizeInfix = function(expr) {
  const s = String(expr ?? "");
  const tokens = [];
  let i = 0;
  const isWhitespace = (c) => c === " " || c === "	" || c === "\n" || c === "\r";
  const isDigit = (c) => c >= "0" && c <= "9";
  const isAlpha = (c) => c >= "A" && c <= "Z" || c >= "a" && c <= "z" || c === "_";
  while (i < s.length) {
    const c = s[i];
    if (isWhitespace(c)) {
      i += 1;
      continue;
    }
    if (c === "(" || c === ")") {
      tokens.push({ type: "paren", value: c });
      i += 1;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      tokens.push({ type: "op", value: c });
      i += 1;
      continue;
    }
    if (isDigit(c) || c === ".") {
      let j = i;
      let seenDot = false;
      while (j < s.length) {
        const cj = s[j];
        if (isDigit(cj)) {
          j += 1;
          continue;
        }
        if (cj === "." && !seenDot) {
          seenDot = true;
          j += 1;
          continue;
        }
        break;
      }
      const raw = s.slice(i, j);
      if (raw === ".") {
        throw new Error("Unexpected '.'");
      }
      tokens.push({ type: "atom", value: raw });
      i = j;
      continue;
    }
    if (isAlpha(c)) {
      let j = i + 1;
      while (j < s.length) {
        const cj = s[j];
        if (isAlpha(cj) || isDigit(cj)) {
          j += 1;
          continue;
        }
        break;
      }
      tokens.push({ type: "atom", value: s.slice(i, j) });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character '${c}'`);
  }
  return tokens;
};
ExpressionTree.prototype.parseInfixExpression = function(expr) {
  const tokens = this.tokenizeInfix(expr);
  if (tokens.length === 0)
    return null;
  const output = [];
  const ops = [];
  const precedence = {
    "u-": 4,
    "^": 3,
    "*": 2,
    "/": 2,
    "+": 1,
    "-": 1
  };
  const rightAssoc = {
    "u-": true,
    "^": true
  };
  const arity = {
    "u-": 1,
    "^": 2,
    "*": 2,
    "/": 2,
    "+": 2,
    "-": 2
  };
  let prevType = "start";
  for (const t of tokens) {
    if (t.type === "atom") {
      output.push({ type: "atom", value: t.value });
      prevType = "atom";
      continue;
    }
    if (t.type === "paren" && t.value === "(") {
      ops.push({ type: "paren", value: "(" });
      prevType = "lparen";
      continue;
    }
    if (t.type === "paren" && t.value === ")") {
      let found = false;
      while (ops.length > 0) {
        const top = ops.pop();
        if (top.type === "paren" && top.value === "(") {
          found = true;
          break;
        }
        output.push(top);
      }
      if (!found)
        throw new Error("Mismatched ')' ");
      prevType = "rparen";
      continue;
    }
    if (t.type === "op") {
      let op = t.value;
      if (op === "-" && (prevType === "start" || prevType === "op" || prevType === "lparen")) {
        op = "u-";
      }
      const p1 = precedence[op];
      if (!Number.isFinite(p1))
        throw new Error(`Unsupported operator '${op}'`);
      while (ops.length > 0) {
        const top = ops[ops.length - 1];
        if (top.type !== "op")
          break;
        const p2 = precedence[top.value];
        if (!Number.isFinite(p2))
          break;
        const shouldPop = rightAssoc[op] ? p1 < p2 : p1 <= p2;
        if (!shouldPop)
          break;
        output.push(ops.pop());
      }
      ops.push({ type: "op", value: op });
      prevType = "op";
      continue;
    }
    throw new Error("Invalid token");
  }
  while (ops.length > 0) {
    const top = ops.pop();
    if (top.type === "paren") {
      throw new Error("Mismatched '('");
    }
    output.push(top);
  }
  const stack = [];
  for (const t of output) {
    if (t.type === "atom") {
      stack.push({ label: String(t.value), children: [] });
      continue;
    }
    if (t.type === "op") {
      const a = arity[t.value];
      if (a === 1) {
        const child = stack.pop();
        if (!child)
          throw new Error("Missing operand for unary operator");
        stack.push({ label: "-", children: [child] });
      } else if (a === 2) {
        const right = stack.pop();
        const left = stack.pop();
        if (!left || !right)
          throw new Error("Missing operand for binary operator");
        const label = t.value === "u-" ? "-" : t.value;
        stack.push({ label, children: [left, right] });
      } else {
        throw new Error("Unsupported operator arity");
      }
      continue;
    }
    throw new Error("Invalid RPN token");
  }
  if (stack.length !== 1) {
    throw new Error("Invalid expression");
  }
  return stack[0];
};
ExpressionTree.prototype.parseInitialData = function(data) {
  const parseNode = (obj) => {
    if (obj == null)
      return null;
    if (typeof obj === "string" || typeof obj === "number") {
      return { label: String(obj), children: [] };
    }
    if (Array.isArray(obj)) {
      return { label: "", children: obj.map(parseNode).filter(Boolean) };
    }
    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0)
        return null;
      if (keys.length > 1) {
        return {
          label: "",
          children: keys.map((k) => ({
            label: String(k),
            children: Array.isArray(obj[k]) ? obj[k].map(parseNode).filter(Boolean) : []
          })).filter(Boolean)
        };
      }
      const key = keys[0];
      const childrenRaw = obj[key];
      const children = Array.isArray(childrenRaw) ? childrenRaw.map(parseNode).filter(Boolean) : [];
      return { label: String(key), children };
    }
    return null;
  };
  return parseNode(data);
};
ExpressionTree.prototype.computeLayout = function(root) {
  if (!root)
    return;
  let leafIndex = 0;
  const assign = (node, depth) => {
    node._depth = depth;
    if (!node.children || node.children.length === 0) {
      node._xIndex = leafIndex;
      leafIndex += 1;
      return { min: node._xIndex, max: node._xIndex };
    }
    let min = Infinity;
    let max = -Infinity;
    for (const child of node.children) {
      const r = assign(child, depth + 1);
      min = Math.min(min, r.min);
      max = Math.max(max, r.max);
    }
    node._xIndex = (min + max) / 2;
    return { min, max };
  };
  assign(root, 0);
  const leafCount = Math.max(1, leafIndex);
  const availableWidth = Math.max(1, this.canvasWidth - 2 * ExpressionTree.MARGIN_X);
  const leafSpacing = leafCount <= 1 ? 0 : Math.max(60, Math.min(110, availableWidth / (leafCount - 1)));
  const toXY = (node) => {
    const x = leafCount <= 1 ? this.canvasWidth / 2 : ExpressionTree.MARGIN_X + node._xIndex * leafSpacing;
    const y = ExpressionTree.STARTING_Y + node._depth * ExpressionTree.LEVEL_HEIGHT;
    node._x = x;
    node._y = y;
    if (node.children) {
      for (const child of node.children) {
        toXY(child);
      }
    }
  };
  toXY(root);
};
ExpressionTree.prototype.buildTree = function(root) {
  this.commands = [];
  if (this.treeRoot) {
    if (Array.isArray(this.evalLabelIDs)) {
      for (const id of this.evalLabelIDs) {
        this.cmd("Delete", id);
      }
    }
    this.evalLabelIDs = [];
    if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
      this.cmd("Delete", this.printOutputLabelID);
    }
    this.printOutputLabelID = -1;
    this.printOutput = "";
    this.cmd("SetMessage", "Clearing existing tree");
    this.deleteTreeGraphicsRec(this.treeRoot, { step: false });
    this.treeRoot = null;
    this.cmd("SetMessage", "");
  }
  if (!root) {
    this.cmd("SetMessage", "No expression provided");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.treeRoot = root;
  this.computeLayout(root);
  const build = (node, parentGraphicID) => {
    const id = this.nextIndex++;
    node.graphicID = id;
    this.cmd("CreateCircle", id, node.label, node._x, node._y);
    this.cmd("SetForegroundColor", id, ExpressionTree.FOREGROUND_COLOR);
    if (parentGraphicID != null) {
      this.cmd("Connect", parentGraphicID, id, ExpressionTree.LINK_COLOR);
    }
    this.cmd("SetMessage", `Create node ${node.label}`);
    if (node.children) {
      for (const child of node.children) {
        build(child, id);
      }
    }
  };
  build(root, null);
  this.cmd("SetMessage", "");
  return this.commands;
};
ExpressionTree.prototype.printTree = function(order) {
  this.commands = [];
  this.printOutput = "";
  if (order == void 0)
    order = "In";
  if (!this.treeRoot) {
    this.cmd("SetMessage", "Tree is empty");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.resetPrintOutputLabel();
  this.cmd("SetText", this.printOutputLabelID, "Output: ");
  this.cmd("SetMessage", "Starting from root");
  this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
  this.cmd("Step");
  this.cmd("SetHighlight", this.treeRoot.graphicID, 0);
  this.printTreeRec(this.treeRoot, order);
  this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  this.cmd("SetMessage", "Final output:\n" + this.printOutput);
  return this.commands;
};
ExpressionTree.prototype.printSelf = function(node) {
  if (this.printOutput.length > 0) {
    this.printOutput += " ";
  }
  this.printOutput += node.label;
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  }
  this.cmd(
    "SetMessage",
    "Print " + node.label + "\nCurrent output:\n" + this.printOutput
  );
  this.cmd("Step");
};
ExpressionTree.prototype.printToken = function(token, message) {
  if (this.printOutput.length > 0) {
    this.printOutput += " ";
  }
  this.printOutput += token;
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  }
  this.cmd("SetMessage", message ?? "Print " + token);
  this.cmd("Step");
};
ExpressionTree.prototype.printChild = function(node, child, childIndex) {
  if (child) {
    this.cmd(
      "SetMessage",
      `${node.label} has child ${childIndex}, visit it...`
    );
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 0);
  }
};
ExpressionTree.prototype.printTreeRec = function(node, order) {
  this.cmd("SetHighlight", node.graphicID, 1);
  const children = Array.isArray(node.children) ? node.children : [];
  if (order === "Pre") {
    this.printSelf(node);
    for (let i = 0; i < children.length; i++) {
      this.cmd("SetHighlight", node.graphicID, 1);
      this.printChild(node, children[i], i);
      this.cmd("SetHighlight", node.graphicID, 0);
      this.printTreeRec(children[i], order);
    }
  } else if (order === "Post") {
    for (let i = 0; i < children.length; i++) {
      this.cmd("SetHighlight", node.graphicID, 1);
      this.printChild(node, children[i], i);
      this.cmd("SetHighlight", node.graphicID, 0);
      this.printTreeRec(children[i], order);
    }
    this.cmd("SetHighlight", node.graphicID, 1);
    this.printSelf(node);
  } else {
    const doParens = !!this.parensInorderCheckbox?.checked;
    if (children.length > 0 && doParens) {
      this.printToken("(", `Enter ${node.label}: print (`);
      this.cmd("SetHighlight", node.graphicID, 1);
    }
    if (children.length > 0) {
      this.printChild(node, children[0], 0);
      this.cmd("SetHighlight", node.graphicID, 0);
      this.printTreeRec(children[0], order);
      this.cmd("SetHighlight", node.graphicID, 1);
    }
    this.printSelf(node);
    for (let i = 1; i < children.length; i++) {
      this.cmd("SetHighlight", node.graphicID, 1);
      this.printChild(node, children[i], i);
      this.cmd("SetHighlight", node.graphicID, 0);
      this.printTreeRec(children[i], order);
    }
  }
  if (order === "In" && children.length > 0 && this.parensInorderCheckbox?.checked) {
    this.printToken(")", `Leave ${node.label}: print )`);
  }
  this.cmd("SetMessage", "Done with " + node.label + " return to parent");
  this.cmd("SetHighlight", node.graphicID, 0);
  this.cmd("Step");
};
ExpressionTree.prototype.evaluateTree = function() {
  this.commands = [];
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];
  if (!this.treeRoot) {
    this.cmd("SetMessage", "No expression to evaluate");
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.cmd("SetMessage", "Evaluate expression tree");
  this.cmd("Step");
  const value = this.evaluateRec(this.treeRoot);
  this.cmd("SetMessage", `Final result: ${String(value)}`);
  this.cmd("Step");
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];
  return this.commands;
};
ExpressionTree.prototype.isOperator = function(token) {
  return token === "+" || token === "-" || token === "*" || token === "/" || token === "^";
};
ExpressionTree.prototype.applyOperator = function(op, values) {
  if (!Array.isArray(values) || values.length === 0)
    return NaN;
  if (op === "+") {
    return values.reduce((a, b) => a + b, 0);
  }
  if (op === "*") {
    return values.reduce((a, b) => a * b, 1);
  }
  if (op === "-") {
    if (values.length === 1)
      return -values[0];
    return values.slice(1).reduce((a, b) => a - b, values[0]);
  }
  if (op === "/") {
    if (values.length === 1)
      return 1 / values[0];
    return values.slice(1).reduce((a, b) => a / b, values[0]);
  }
  if (op === "^") {
    if (values.length === 1)
      return values[0];
    return values.slice(0, -1).reduceRight((acc, v) => Math.pow(v, acc), values[values.length - 1]);
  }
  return NaN;
};
ExpressionTree.prototype.showEvalValue = function(node, value) {
  const id = this.nextIndex++;
  this.evalLabelIDs.push(id);
  this.cmd("CreateLabel", id, String(value), node._x + 30, node._y, 0);
  this.cmd("SetForegroundColor", id, ExpressionTree.FOREGROUND_COLOR);
};
ExpressionTree.prototype.evaluateRec = function(node) {
  this.cmd("SetHighlight", node.graphicID, 1);
  this.cmd("Step");
  const children = Array.isArray(node.children) ? node.children : [];
  if (children.length !== 0) {
    this.cmd("SetMessage", `Operator node ${node.label}, needs to evaluate children first`);
    this.cmd("Step");
  }
  const childValues = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    this.cmd("SetMessage", `Visit ${i == 0 ? "left" : "right"} child of ${node.label}`);
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 0);
    this.cmd("SetHighlight", node.graphicID, 0);
    const v = this.evaluateRec(child);
    childValues.push(v);
    this.cmd("SetHighlight", node.graphicID, 1);
  }
  let value;
  if (children.length === 0 && !this.isOperator(node.label)) {
    value = Number(node.label);
    this.cmd("SetMessage", `Leaf evaluates to ${String(value)}`);
    this.cmd("Step");
  } else if (this.isOperator(node.label)) {
    value = this.applyOperator(node.label, childValues);
    this.cmd(
      "SetMessage",
      `Compute ${node.label}(${childValues.map((v) => String(v)).join(", ")}) = ${String(value)}`
    );
    this.cmd("Step");
  } else {
    value = NaN;
    this.cmd("SetMessage", `Cannot evaluate token '${node.label}'`);
    this.cmd("Step");
  }
  this.showEvalValue(node, value);
  this.cmd("SetMessage", `Value at ${node.label}: ${String(value)}`);
  this.cmd("SetHighlight", node.graphicID, 0);
  this.cmd("Step");
  return value;
};

// AlgorithmLibrary/SkipList.js
var START_X = 120;
var LEVEL_START_Y = 120;
var LEVEL_SPACING_Y = 80;
var NODE_WIDTH = 60;
var NODE_HEIGHT2 = 25;
var SPACING_X = 80;
var HEAD_LABEL = "HEAD";
var TAIL_LABEL = "TAIL";
var MAX_LEVELS = 6;
function SkipList(opts = {}) {
  if (!opts.title)
    opts.title = "SkipList";
  opts.heightSingleMode = 420;
  opts.height = 480;
  opts.heightMobile = 620;
  let am = initAnimationManager(opts);
  this.init(am, 900, 500);
  const seed = Array.isArray(opts.initialData) ? opts.initialData.slice() : [];
  for (let v of seed) {
    this.implementAction(this.insertElement.bind(this), v);
    this.animationManager.skipForward();
  }
  if (seed.length > 0) {
    this.animationManager.animatedObjects.draw();
  }
}
SkipList.prototype = new Algorithm();
SkipList.prototype.constructor = SkipList;
SkipList.superclass = Algorithm.prototype;
SkipList.prototype.init = function(am, w2, h) {
  SkipList.superclass.init.call(this, am, w2, h);
  this.nextIndex = 1e3;
  this.commands = [];
  this.addControls();
  this.nodesByLevel = [];
  this.valueSet = /* @__PURE__ */ new Set();
  this.towerByValue = /* @__PURE__ */ new Map();
  this.knownIDs = /* @__PURE__ */ new Set();
  this.levelMembers = [];
  this.nextByLevel = [];
  this.ensureLevel(0);
  this.animationManager.StartNewAnimation(this.commands);
  this.commands = [];
};
SkipList.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    6
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.removeCallback.bind(this);
  this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  this.clearButton.onclick = this.clearCallback.bind(this);
  this.insertRandomButton = addControlToAlgorithmBar("Button", "Insert Random Values");
  this.insertRandomButton.onclick = this.insertRandomCallback.bind(this);
};
SkipList.prototype.insertCallback = function() {
  var insertedValue = this.normalizeNumber(this.inputField.value, 4);
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};
SkipList.prototype.findCallback = function() {
  var findValue = this.normalizeNumber(this.inputField.value, 4);
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};
SkipList.prototype.removeCallback = function() {
  var deletedValue = this.normalizeNumber(this.inputField.value, 4);
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.removeElement.bind(this), deletedValue);
  }
};
SkipList.prototype.clearCallback = function() {
  this.implementAction(this.clearAll.bind(this), 0);
};
SkipList.prototype.reset = function() {
  this.nextIndex = 0;
  this.commands = [];
  this.nodesByLevel = [];
  this.valueSet = /* @__PURE__ */ new Set();
  this.towerByValue = /* @__PURE__ */ new Map();
  this.ensureLevel(0);
};
SkipList.prototype.doInsert = function(v) {
  this.implementAction(this.insertElement.bind(this), v);
};
SkipList.prototype.doFindValue = function(v) {
  this.implementAction(this.findElement.bind(this), v);
};
SkipList.prototype.doFind = function(v) {
  this.implementAction(this.findElement.bind(this), v);
};
SkipList.prototype.doRemove = function(v) {
  this.implementAction(this.removeElement.bind(this), v);
};
SkipList.prototype.doInsertRandom = function(count = 10, maxValue = 999) {
  for (let i = 0; i < count; i++) {
    const v = Math.floor(1 + Math.random() * maxValue);
    this.implementAction(this.insertElement.bind(this), v);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
SkipList.prototype.doClear = function() {
  this.implementAction(this.clearAll.bind(this), 0);
};
SkipList.prototype.insertRandomCallback = function() {
  const numToInsert = 10;
  for (let i = 0; i < numToInsert; i++) {
    const v = Math.floor(1 + Math.random() * 999);
    this.implementAction(this.insertElement.bind(this), v);
    this.animationManager.skipForward();
  }
  this.animationManager.clearHistory();
  this.animationManager.animatedObjects.draw();
};
SkipList.prototype.clearAll = function() {
  this.commands = [];
  for (let lvl = 0; lvl < this.nodesByLevel.length; lvl++) {
    for (let n of this.nodesByLevel[lvl]) {
      this.cmd("Delete", n.id);
    }
  }
  this.nodesByLevel = [];
  this.valueSet = /* @__PURE__ */ new Set();
  this.towerByValue = /* @__PURE__ */ new Map();
  this.knownIDs = /* @__PURE__ */ new Set();
  this.ensureLevel(0);
  return this.commands;
};
SkipList.prototype.ensureLevel = function(level) {
  while (this.nodesByLevel.length <= level) {
    const L = this.nodesByLevel.length;
    const y = LEVEL_START_Y + L * LEVEL_SPACING_Y;
    const headID = this.nextIndex++;
    const tailID = this.nextIndex++;
    this.cmd(
      "CreateLinkedList",
      headID,
      "",
      NODE_WIDTH,
      NODE_HEIGHT2,
      START_X,
      y,
      0.25,
      0,
      1,
      1
    );
    this.cmd("SetText", headID, HEAD_LABEL);
    this.cmd("SetNull", headID, 0);
    this.knownIDs.add(headID);
    this.cmd(
      "CreateLinkedList",
      tailID,
      "",
      NODE_WIDTH,
      NODE_HEIGHT2,
      START_X + SPACING_X,
      y,
      0.25,
      0,
      1,
      1
    );
    this.cmd("SetText", tailID, TAIL_LABEL);
    this.cmd("SetNull", tailID, 1);
    this.knownIDs.add(tailID);
    this.nodesByLevel.push([
      { id: headID, value: -Infinity, isSentinel: true },
      { id: tailID, value: Infinity, isSentinel: true }
    ]);
    this.levelMembers[L] = /* @__PURE__ */ new Set([headID, tailID]);
    this.nextByLevel[L] = /* @__PURE__ */ new Map();
  }
};
SkipList.prototype.relayoutLevel = function(level) {
  const y = LEVEL_START_Y + (this.nodesByLevel.length - 1 - level) * LEVEL_SPACING_Y;
  const arr = this.nodesByLevel[level];
  const base = this.nodesByLevel[0];
  const baseX = /* @__PURE__ */ new Map();
  for (let i = 0; i < base.length; i++) {
    const colX = START_X + i * SPACING_X;
    baseX.set(base[i].value, colX);
  }
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];
    const mappedX = baseX.get(node.value);
    const x = typeof mappedX === "number" ? mappedX : START_X + i * SPACING_X;
    this.cmd("Move", node.id, x, y);
  }
  const prevMembers = this.levelMembers[level] || /* @__PURE__ */ new Set();
  const prevNext = this.nextByLevel[level] || /* @__PURE__ */ new Map();
  const newNext = /* @__PURE__ */ new Map();
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    const b = arr[i + 1];
    for (let id of prevMembers) {
      if (id !== a.id && (!b || id !== b.id)) {
        if (this.knownIDs.has(a.id) && this.knownIDs.has(id)) {
          this.cmd("Disconnect", a.id, id);
        }
      }
    }
    const prevNextId = prevNext.get(a.id);
    if (!b) {
      if (prevNextId && this.knownIDs.has(a.id) && this.knownIDs.has(prevNextId)) {
        this.cmd("Disconnect", a.id, prevNextId);
      }
      this.cmd("SetNull", a.id, 1);
    } else {
      this.cmd("SetNull", a.id, 0);
      if (this.knownIDs.has(a.id) && this.knownIDs.has(b.id)) {
        if (prevNextId !== b.id) {
          this.cmd("Disconnect", a.id, b.id);
          this.cmd("SetMessage", "Connect L" + level + " from " + a.id + " -> " + b.id);
          this.cmd("Connect", a.id, b.id, "#000000", 0);
        }
        newNext.set(a.id, b.id);
      } else {
        this.cmd("SetMessage", "Skip connect: missing node " + (!this.knownIDs.has(a.id) ? a.id : b.id));
      }
      if (i === arr.length - 2) {
        this.cmd("SetNull", b.id, 1);
      }
    }
  }
  this.levelMembers[level] = new Set(arr.map((n) => n.id));
  this.nextByLevel[level] = newNext;
};
SkipList.prototype.insertElement = function(value) {
  this.commands = [];
  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.commands;
  }
  value = Number(value);
  if (this.valueSet.has(value)) {
    this.cmd("SetMessage", "Value already exists: " + value);
    this.cmd("Step");
    this.cmd("SetMessage", "");
    return this.commands;
  }
  this.cmd("SetMessage", "Insert " + value);
  this.cmd("Step");
  const topLevel = this.nodesByLevel.length - 1;
  const prevIndexByLevel = /* @__PURE__ */ new Map();
  let lvl = topLevel;
  let idx = 0;
  const searchHi = this.nextIndex++;
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  this.cmd("CreateHighlightCircle", searchHi, "#0088cc", this.animationManager.animatedObjects.getNodeX(topHeadID), this.animationManager.animatedObjects.getNodeY(topHeadID));
  this.cmd("SetMessage", "Start search at top HEAD");
  this.cmd("Step");
  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];
    this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(arr[idx].id), this.animationManager.animatedObjects.getNodeY(arr[idx].id));
    this.cmd("Step");
    while (true) {
      const nextNode = arr[idx + 1];
      if (!nextNode) {
        this.cmd("SetMessage", "At L" + lvl + ": no next \u2192 drop");
        this.cmd("Step");
        break;
      }
      const nextText = nextNode.isSentinel ? nextNode.value === Infinity ? "TAIL" : "HEAD" : String(nextNode.value);
      this.cmd("SetHighlight", nextNode.id, 1);
      this.cmd("SetMessage", "Check next at L" + lvl + ": " + nextText + (nextNode.value < value ? " < " : nextNode.value === value ? " = " : " \u2265 ") + value);
      this.cmd("Step");
      if (nextNode.value < value) {
        this.cmd("SetMessage", "Advance right: " + nextText + " < " + value);
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(nextNode.id), this.animationManager.animatedObjects.getNodeY(nextNode.id));
        this.cmd("Step");
        continue;
      } else {
        this.cmd("SetMessage", "Drop down: " + nextText + (nextNode.value === value ? " = " : " \u2265 ") + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break;
      }
    }
    prevIndexByLevel.set(lvl, idx);
    if (lvl > 0) {
      const curNode = arr[idx];
      let downID = null;
      if (curNode.isSentinel && curNode.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (curNode.isSentinel && curNode.value === Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower2 = this.towerByValue.get(curNode.value);
        downID = tower2 && tower2.levelToID.get(lvl - 1);
      }
      this.cmd("SetMessage", "Drop to L" + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd("Move", searchHi, this.animationManager.animatedObjects.getNodeX(downID), this.animationManager.animatedObjects.getNodeY(downID));
        this.cmd("Step");
        const lowerArr = this.nodesByLevel[lvl - 1];
        let newIdx = lowerArr.findIndex((n) => n.id === downID);
        idx = newIdx >= 0 ? newIdx : 0;
      } else {
        idx = 0;
      }
    }
    lvl = lvl - 1;
  }
  this.cmd("Delete", searchHi);
  this.cmd("Step");
  const base = this.nodesByLevel[0];
  const idx0 = (prevIndexByLevel.get(0) || 0) + 1;
  this.cmd("SetMessage", "Base insert between " + (base[idx0 - 1].isSentinel ? "HEAD" : base[idx0 - 1].value) + " and " + (base[idx0].isSentinel ? "TAIL" : base[idx0].value));
  this.cmd("Step");
  let height = 0;
  while (height < MAX_LEVELS - 1) {
    this.cmd("SetMessage", "Flip for level " + (height + 1));
    this.cmd("Step");
    const flip = Math.random() < 0.5;
    if (flip) {
      this.cmd("SetMessage", "Heads \u2014 promote");
      this.cmd("Step");
      height++;
    } else {
      this.cmd("SetMessage", "Tails \u2014 stop");
      this.cmd("Step");
      break;
    }
  }
  this.ensureLevel(height);
  const nodeIDs = [];
  const totalLevels = this.nodesByLevel.length;
  const columnX = START_X + idx0 * SPACING_X;
  for (let L = 0; L <= height; L++) {
    const y = LEVEL_START_Y + (totalLevels - 1 - L) * LEVEL_SPACING_Y;
    const id = this.nextIndex++;
    this.cmd("CreateLinkedList", id, "", NODE_WIDTH, NODE_HEIGHT2, columnX, y, 0.25, 0, 1, 1);
    this.cmd("SetText", id, String(value));
    this.knownIDs.add(id);
    nodeIDs.push(id);
  }
  this.cmd("Step");
  base.splice(idx0, 0, { id: nodeIDs[0], value, isSentinel: false });
  this.relayoutLevel(0);
  if (this.nodesByLevel.length > 1) {
    for (let lvl2 = 1; lvl2 < this.nodesByLevel.length; lvl2++) {
      this.relayoutLevel(lvl2);
    }
  }
  for (let L = 1; L <= height; L++) {
    const arr = this.nodesByLevel[L];
    const i = (prevIndexByLevel.get(L) || 0) + 1;
    this.cmd("SetMessage", "Insert on L" + L + " after predecessor at index " + (i - 1));
    arr.splice(i, 0, { id: nodeIDs[L], value, isSentinel: false });
    this.relayoutLevel(L);
    const belowID = nodeIDs[L - 1];
    const aboveID = nodeIDs[L];
    this.cmd("SetMessage", "Connect tower: level " + L + " node \u2192 lower level node");
    if (this.knownIDs.has(aboveID) && this.knownIDs.has(belowID)) {
      this.cmd("Connect", aboveID, belowID, "#6666ff", 0);
    } else {
      this.cmd("SetMessage", "Skip vertical connect: missing node");
    }
  }
  if (height + 1 < this.nodesByLevel.length) {
    for (let lvl2 = height + 1; lvl2 < this.nodesByLevel.length; lvl2++) {
      this.relayoutLevel(lvl2);
    }
  }
  this.valueSet.add(value);
  const tower = /* @__PURE__ */ new Map();
  for (let lvl2 = 0; lvl2 <= height; lvl2++) {
    tower.set(lvl2, nodeIDs[lvl2]);
  }
  this.towerByValue.set(value, { levelToID: tower });
  this.cmd("SetMessage", "Inserted " + value + (height > 0 ? " with height " + (height + 1) : ""));
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};
SkipList.prototype.disableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.findButton,
    this.deleteButton,
    this.clearButton,
    this.insertRandomButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = true;
  }
};
SkipList.prototype.enableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.findButton,
    this.deleteButton,
    this.clearButton,
    this.insertRandomButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = false;
  }
};
SkipList.prototype.findElement = function(value) {
  this.commands = [];
  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.commands;
  }
  value = Number(value);
  if (this.nodesByLevel.length === 0)
    return this.commands;
  this.cmd("SetMessage", "Find " + value);
  this.cmd("Step");
  const topLevel = this.nodesByLevel.length - 1;
  let lvl = topLevel;
  let idx = 0;
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  const highlightID = this.nextIndex++;
  this.cmd(
    "CreateHighlightCircle",
    highlightID,
    "#00aa00",
    this.animationManager.animatedObjects.getNodeX(topHeadID),
    this.animationManager.animatedObjects.getNodeY(topHeadID)
  );
  this.cmd("Step");
  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];
    const currentID = arr[idx].id;
    this.cmd(
      "Move",
      highlightID,
      this.animationManager.animatedObjects.getNodeX(currentID),
      this.animationManager.animatedObjects.getNodeY(currentID)
    );
    this.cmd("Step");
    let advanced = false;
    while (true) {
      const nextNode = arr[idx + 1];
      if (!nextNode) {
        this.cmd("SetMessage", "At level " + lvl + ": no next \u2192 drop down");
        this.cmd("Step");
        break;
      }
      this.cmd("SetHighlight", nextNode.id, 1);
      const nextValText = nextNode.isSentinel ? nextNode.value === Infinity ? "TAIL" : "HEAD" : String(nextNode.value);
      this.cmd("SetMessage", "Check next at L" + lvl + ": " + nextValText + (nextNode.value < value ? " < " : nextNode.value === value ? " = " : " \u2265 ") + value);
      this.cmd("Step");
      if (nextNode.value < value) {
        this.cmd("SetMessage", "Advance right: " + nextValText + " < " + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        const nid = arr[idx].id;
        this.cmd(
          "Move",
          highlightID,
          this.animationManager.animatedObjects.getNodeX(nid),
          this.animationManager.animatedObjects.getNodeY(nid)
        );
        this.cmd("Step");
        advanced = true;
        continue;
      } else if (nextNode.value === value) {
        const targetID = nextNode.id;
        this.cmd("SetMessage", "Found " + value + " at level " + lvl);
        this.cmd(
          "CreateHighlightCircle",
          this.nextIndex++,
          "#ff8800",
          this.animationManager.animatedObjects.getNodeX(targetID),
          this.animationManager.animatedObjects.getNodeY(targetID)
        );
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        this.cmd("SetMessage", "");
        this.cmd("Delete", highlightID);
        return this.commands;
      } else {
        this.cmd("SetMessage", "Drop down: " + nextValText + " \u2265 " + value);
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break;
      }
    }
    if (lvl > 0) {
      const cur = arr[idx];
      let downID = null;
      if (cur.isSentinel && cur.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (cur.isSentinel && cur.value === Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower = this.towerByValue.get(cur.value);
        downID = tower && tower.levelToID.get(lvl - 1);
      }
      this.cmd("SetMessage", "Drop down to level " + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd(
          "Move",
          highlightID,
          this.animationManager.animatedObjects.getNodeX(downID),
          this.animationManager.animatedObjects.getNodeY(downID)
        );
      }
      this.cmd("Step");
      const lowerArr = this.nodesByLevel[lvl - 1];
      let newIdx = lowerArr.findIndex((n) => n.id === downID);
      idx = newIdx >= 0 ? newIdx : 0;
    }
    lvl = lvl - 1;
  }
  this.cmd("SetMessage", "Not found: " + value);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  this.cmd("Delete", highlightID);
  return this.commands;
};
SkipList.prototype.removeElement = function(value) {
  this.commands = [];
  if (value === "" || value === null || Number.isNaN(Number(value))) {
    return this.commands;
  }
  value = Number(value);
  if (this.nodesByLevel.length === 0)
    return this.commands;
  this.cmd("SetMessage", "Remove " + value);
  this.cmd("Step");
  const topLevel = this.nodesByLevel.length - 1;
  let lvl = topLevel;
  let idx = 0;
  const topHeadID = this.nodesByLevel[topLevel][0].id;
  const hi = this.nextIndex++;
  this.cmd("CreateHighlightCircle", hi, "#cc0000", this.animationManager.animatedObjects.getNodeX(topHeadID), this.animationManager.animatedObjects.getNodeY(topHeadID));
  this.cmd("Step");
  let found = false;
  while (lvl >= 0) {
    const arr = this.nodesByLevel[lvl];
    this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(arr[idx].id), this.animationManager.animatedObjects.getNodeY(arr[idx].id));
    this.cmd("Step");
    while (true) {
      const hasNext = idx + 1 < arr.length;
      if (!hasNext) {
        break;
      }
      const nextNode = arr[idx + 1];
      const nextLabel = nextNode.isSentinel ? nextNode.value === Infinity ? "TAIL" : "HEAD" : String(nextNode.value);
      this.cmd("SetHighlight", nextNode.id, 1);
      this.cmd("SetMessage", "L" + lvl + ": check next " + nextLabel + " vs " + value);
      this.cmd("Step");
      if (nextNode.value < value) {
        this.cmd("SetMessage", "L" + lvl + ": move right \u2192 " + nextLabel);
        this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(nextNode.id), this.animationManager.animatedObjects.getNodeY(nextNode.id));
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        idx = idx + 1;
        continue;
      }
      if (nextNode.value === value) {
        found = true;
        this.cmd("SetMessage", "Found " + value + " \u2014 removing tower");
        this.cmd("Step");
        this.cmd("SetHighlight", nextNode.id, 0);
        break;
      }
      this.cmd("SetMessage", "L" + lvl + ": cannot move right (" + nextLabel + ">" + value + ") \u2014 drop");
      this.cmd("Step");
      this.cmd("SetHighlight", nextNode.id, 0);
      break;
    }
    if (found) {
      break;
    }
    if (lvl > 0) {
      const cur = arr[idx];
      let downID = null;
      if (cur.isSentinel && cur.value === -Infinity) {
        downID = this.nodesByLevel[lvl - 1][0].id;
      } else if (cur.isSentinel && cur.value === Infinity) {
        downID = this.nodesByLevel[lvl - 1][this.nodesByLevel[lvl - 1].length - 1].id;
      } else {
        const tower2 = this.towerByValue.get(cur.value);
        downID = tower2 && tower2.levelToID.get(lvl - 1);
      }
      this.cmd("SetMessage", "Drop down to level " + (lvl - 1));
      if (downID && this.knownIDs.has(downID)) {
        this.cmd("Move", hi, this.animationManager.animatedObjects.getNodeX(downID), this.animationManager.animatedObjects.getNodeY(downID));
      }
      this.cmd("Step");
      const lowerArr = this.nodesByLevel[lvl - 1];
      let newIdx = lowerArr.findIndex((n) => n.id === downID);
      idx = newIdx >= 0 ? newIdx : 0;
    }
    lvl = lvl - 1;
  }
  if (!found) {
    this.cmd("SetMessage", "Not found: " + value);
    this.cmd("Step");
    this.cmd("Delete", hi);
    this.cmd("SetMessage", "");
    return this.commands;
  }
  const tower = this.towerByValue.get(value);
  if (tower) {
    const levels = Array.from(tower.levelToID.keys()).sort((a, b) => b - a);
    for (const L of levels) {
      const id = tower.levelToID.get(L);
      const arr = this.nodesByLevel[L];
      const pos = arr.findIndex((n) => n.id === id);
      if (pos >= 0) {
        const belowId = tower.levelToID.get(L - 1);
        if (belowId && this.knownIDs.has(id) && this.knownIDs.has(belowId)) {
          this.cmd("Disconnect", id, belowId);
        }
        arr.splice(pos, 1);
        if (this.knownIDs.has(id)) {
          this.cmd("Delete", id);
          this.knownIDs.delete(id);
        }
        this.relayoutLevel(L);
      }
    }
  }
  if (this.nodesByLevel.length > 1) {
    for (let L = 0; L < this.nodesByLevel.length; L++) {
      this.relayoutLevel(L);
    }
  }
  this.valueSet.delete(value);
  this.towerByValue.delete(value);
  this.cmd("Delete", hi);
  this.cmd("SetMessage", "Removed " + value);
  this.cmd("Step");
  this.cmd("SetMessage", "");
  return this.commands;
};

// AlgorithmLibrary/TopoSortDFS.js
function TopoSortDFS(canvas2) {
  let am;
  let w2;
  let h;
  let graphOpts = null;
  if (canvas2 && typeof canvas2.getContext === "function") {
    const legacyCanvas = canvas2;
    am = initCanvas2(legacyCanvas, null, "Topological Sort (DFS)", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height
    });
    w2 = legacyCanvas.width;
    h = legacyCanvas.height;
  } else {
    const opts = canvas2 || {};
    graphOpts = opts;
    const viewWidth = Number.isFinite(opts.viewWidth) && opts.viewWidth > 0 ? opts.viewWidth : Number.isFinite(opts.width) && opts.width > 0 ? opts.width : 1e3;
    const viewHeight = Number.isFinite(opts.viewHeight) && opts.viewHeight > 0 ? opts.viewHeight : Number.isFinite(opts.height) && opts.height > 0 ? opts.height : 500;
    am = initAnimationManager({
      title: opts.title || "Topological Sort (DFS)",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts
    });
    w2 = viewWidth;
    h = viewHeight;
  }
  this.init(am, w2, h, graphOpts);
}
TopoSortDFS.ORDERING_INITIAL_X = 200;
TopoSortDFS.ORDERING_INITIAL_Y = 50;
TopoSortDFS.ORDERING_DELTA_Y = 20;
TopoSortDFS.D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
TopoSortDFS.F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
TopoSortDFS.D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
TopoSortDFS.F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];
TopoSortDFS.D_X_POS_LARGE = [
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860
];
TopoSortDFS.F_X_POS_LARGE = [
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860,
  610,
  710,
  810,
  560,
  660,
  760,
  860
];
TopoSortDFS.D_Y_POS_LARGE = [
  37,
  37,
  37,
  37,
  137,
  137,
  137,
  237,
  237,
  237,
  237,
  337,
  337,
  337,
  437,
  437,
  437,
  437
];
TopoSortDFS.F_Y_POS_LARGE = [
  62,
  62,
  62,
  62,
  162,
  162,
  162,
  262,
  262,
  262,
  262,
  362,
  362,
  362,
  462,
  462,
  462,
  462
];
TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR = "#000000";
TopoSortDFS.DFS_TREE_COLOR = "#0000FF";
TopoSortDFS.prototype = new Graph();
TopoSortDFS.prototype.constructor = TopoSortDFS;
TopoSortDFS.superclass = Graph.prototype;
TopoSortDFS.prototype.addControls = function() {
  this.startButton = addControlToAlgorithmBar("Button", "Do Topological Sort");
  this.startButton.onclick = this.startCallback.bind(this);
  TopoSortDFS.superclass.addControls.call(this, false);
};
TopoSortDFS.prototype.init = function(am, w2, h, graphOpts) {
  this.showEdgeCosts = false;
  TopoSortDFS.superclass.init.call(this, am, w2, h, true, true, graphOpts);
};
TopoSortDFS.prototype.setup = function() {
  TopoSortDFS.superclass.setup.call(this);
  this.animationManager.setAllLayers([0, this.currentLayer]);
  this.commands = new Array();
  this.messageID = new Array();
  this.runLocked = false;
  if (this.startButton)
    this.startButton.disabled = false;
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
  this.stackBaseX = 30;
  this.stackBaseY = 20;
  this.stackSectionY = this.stackBaseY;
  this.stackIndent = 10;
  this.stackLineHeight = 20;
  this.stackSectionGap = 12;
  this.stackLabelIDs = [];
  this.callStackDepth = 0;
  this.stackRowCount = 0;
};
TopoSortDFS.prototype.startCallback = function(event) {
  this.runLocked = true;
  if (this.startButton)
    this.startButton.disabled = true;
  this.doTopoSort();
};
TopoSortDFS.prototype.doTopoSort = function() {
  this.runLocked = true;
  if (this.startButton)
    this.startButton.disabled = true;
  this.implementAction(this.doTopoSortAction.bind(this), "");
  return true;
};
TopoSortDFS.prototype.doTopoSortAction = function(ignored) {
  this.visited = new Array(this.size);
  this.commands = new Array();
  this.topoOrderArrayL = new Array();
  this.topoOrderArrayAL = new Array();
  this.topoOrderArrayAM = new Array();
  var i;
  if (this.messageID != null) {
    for (i = 0; i < this.messageID.length; i++) {
      this.cmd("Delete", this.messageID[i], 1);
    }
  }
  this.rebuildEdges();
  this.messageID = new Array();
  this.cmd("SetMessage", "Run DFS and build topological order.");
  this.cmd("Step");
  var headerID = this.nextIndex++;
  this.messageID.push(headerID);
  this.cmd("CreateLabel", headerID, "Topological Order", TopoSortDFS.ORDERING_INITIAL_X, TopoSortDFS.ORDERING_INITIAL_Y - 1.5 * TopoSortDFS.ORDERING_DELTA_Y);
  headerID = this.nextIndex++;
  this.messageID.push(headerID);
  this.cmd(
    "CreateRectangle",
    headerID,
    "",
    100,
    0,
    TopoSortDFS.ORDERING_INITIAL_X,
    TopoSortDFS.ORDERING_INITIAL_Y - TopoSortDFS.ORDERING_DELTA_Y,
    "center",
    "center"
  );
  this.d_timesID_L = new Array(this.size);
  this.f_timesID_L = new Array(this.size);
  this.d_timesID_AL = new Array(this.size);
  this.f_timesID_AL = new Array(this.size);
  this.d_times = new Array(this.size);
  this.f_times = new Array(this.size);
  this.currentTime = 1;
  for (i = 0; i < this.size; i++) {
    this.d_timesID_L[i] = this.nextIndex++;
    this.f_timesID_L[i] = this.nextIndex++;
    this.d_timesID_AL[i] = this.nextIndex++;
    this.f_timesID_AL[i] = this.nextIndex++;
  }
  this.messageY = 30;
  var vertex;
  for (vertex = 0; vertex < this.size; vertex++) {
    if (!this.visited[vertex]) {
      if (vertex > 0) {
        this.stackSectionY = this.stackSectionY + this.stackRowCount * this.stackLineHeight + this.stackSectionGap;
        this.callStackDepth = 0;
        this.stackRowCount = 0;
      }
      this.cmd("SetMessage", "Start DFS from vertex " + vertex + ".");
      this.cmd("Step");
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleL,
        TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR,
        this.x_pos_logical[vertex],
        this.y_pos_logical[vertex]
      );
      this.cmd("SetLayer", this.highlightCircleL, 1);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAL,
        TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR,
        this.adj_list_x_start - this.adj_list_width,
        this.adj_list_y_start + vertex * this.adj_list_height
      );
      this.cmd("SetLayer", this.highlightCircleAL, 2);
      this.cmd(
        "CreateHighlightCircle",
        this.highlightCircleAM,
        TopoSortDFS.HIGHLIGHT_CIRCLE_COLOR,
        this.adj_matrix_x_start - this.adj_matrix_width,
        this.adj_matrix_y_start + vertex * this.adj_matrix_height
      );
      this.cmd("SetLayer", this.highlightCircleAM, 3);
      this.dfsVisit(vertex, 0, false);
      this.cmd("Delete", this.highlightCircleL, 2);
      this.cmd("Delete", this.highlightCircleAL, 3);
      this.cmd("Delete", this.highlightCircleAM, 4);
    }
  }
  return this.commands;
};
TopoSortDFS.prototype.setup_large = function() {
  this.d_x_pos = TopoSortDFS.D_X_POS_LARGE;
  this.d_y_pos = TopoSortDFS.D_Y_POS_LARGE;
  this.f_x_pos = TopoSortDFS.F_X_POS_LARGE;
  this.f_y_pos = TopoSortDFS.F_Y_POS_LARGE;
  TopoSortDFS.superclass.setup_large.call(this);
};
TopoSortDFS.prototype.setup_small = function() {
  this.d_x_pos = TopoSortDFS.D_X_POS_SMALL;
  this.d_y_pos = TopoSortDFS.D_Y_POS_SMALL;
  this.f_x_pos = TopoSortDFS.F_X_POS_SMALL;
  this.f_y_pos = TopoSortDFS.F_Y_POS_SMALL;
  TopoSortDFS.superclass.setup_small.call(this);
};
TopoSortDFS.prototype.dfsVisit = function(startVertex, messageX, printCCNum) {
  this.callStackDepth = (this.callStackDepth || 0) + 1;
  var indentDepth = this.callStackDepth - 1;
  var stackLabelID = this.nextIndex++;
  if (!this.stackLabelIDs) {
    this.stackLabelIDs = [];
  }
  this.stackLabelIDs.push(stackLabelID);
  this.cmd("CreateLabel", stackLabelID, "DFS(" + String(startVertex) + ")", this.stackBaseX + indentDepth * this.stackIndent, this.stackSectionY + this.stackRowCount * this.stackLineHeight);
  this.stackRowCount++;
  this.cmd("SetMessage", "First visit to " + String(startVertex) + ".");
  this.cmd("Step");
  this.cmd("SetMessage", "DFS(" + String(startVertex) + ")");
  this.messageY = this.messageY + 20;
  if (!this.visited[startVertex]) {
    this.d_times[startVertex] = this.currentTime++;
    this.cmd("CreateLabel", this.d_timesID_L[startVertex], "d = " + String(this.d_times[startVertex]), this.x_pos_logical[startVertex] - 44, this.y_pos_logical[startVertex] - 14);
    this.cmd(
      "CreateLabel",
      this.d_timesID_AL[startVertex],
      "d = " + String(this.d_times[startVertex]),
      this.adj_list_x_start - 2 * this.adj_list_width,
      this.adj_list_y_start + startVertex * this.adj_list_height - 1 / 4 * this.adj_list_height
    );
    this.cmd("SetLayer", this.d_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.d_timesID_AL[startVertex], 2);
    this.visited[startVertex] = true;
    this.cmd("Step");
    for (var neighbor = 0; neighbor < this.size; neighbor++) {
      if (this.adj_matrix[startVertex][neighbor] > 0) {
        this.highlightEdge(startVertex, neighbor, 1);
        if (this.visited[neighbor]) {
          this.cmd("SetMessage", "Neighbor " + String(neighbor) + " already visited; skip.");
        } else {
          this.cmd("SetMessage", "Visit unvisited neighbor " + String(neighbor) + ".");
        }
        this.cmd("Step");
        this.highlightEdge(startVertex, neighbor, 0);
        if (this.visited[neighbor]) {
        }
        if (!this.visited[neighbor]) {
          this.cmd(
            "Disconnect",
            this.circleID[startVertex],
            this.circleID[neighbor]
          );
          this.cmd(
            "Connect",
            this.circleID[startVertex],
            this.circleID[neighbor],
            TopoSortDFS.DFS_TREE_COLOR,
            this.curve[startVertex][neighbor],
            1,
            ""
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[neighbor],
            this.y_pos_logical[neighbor]
          );
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + neighbor * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + neighbor * this.adj_matrix_height
          );
          this.cmd("Step");
          this.dfsVisit(neighbor, messageX + 10, printCCNum);
          this.cmd("SetMessage", "Return from DFS(" + String(neighbor) + ")");
          this.cmd(
            "Move",
            this.highlightCircleAL,
            this.adj_list_x_start - this.adj_list_width,
            this.adj_list_y_start + startVertex * this.adj_list_height
          );
          this.cmd(
            "Move",
            this.highlightCircleL,
            this.x_pos_logical[startVertex],
            this.y_pos_logical[startVertex]
          );
          this.cmd(
            "Move",
            this.highlightCircleAM,
            this.adj_matrix_x_start - this.adj_matrix_width,
            this.adj_matrix_y_start + startVertex * this.adj_matrix_height
          );
          this.cmd("Step");
        }
        this.cmd("Step");
      }
    }
    this.f_times[startVertex] = this.currentTime++;
    this.cmd("CreateLabel", this.f_timesID_L[startVertex], "f = " + String(this.f_times[startVertex]), this.x_pos_logical[startVertex] - 44, this.y_pos_logical[startVertex] + 14);
    this.cmd(
      "CreateLabel",
      this.f_timesID_AL[startVertex],
      "f = " + String(this.f_times[startVertex]),
      this.adj_list_x_start - 2 * this.adj_list_width,
      this.adj_list_y_start + startVertex * this.adj_list_height + 1 / 4 * this.adj_list_height
    );
    this.cmd("SetMessage", `Finish vertex ${startVertex}. Push on top of topological order.`);
    this.cmd("SetLayer", this.f_timesID_L[startVertex], 1);
    this.cmd("SetLayer", this.f_timesID_AL[startVertex], 2);
    this.cmd("Step");
    var i;
    for (i = this.topoOrderArrayL.length; i > 0; i--) {
      this.topoOrderArrayL[i] = this.topoOrderArrayL[i - 1];
      this.topoOrderArrayAL[i] = this.topoOrderArrayAL[i - 1];
      this.topoOrderArrayAM[i] = this.topoOrderArrayAM[i - 1];
    }
    var nextVertexLabel = this.nextIndex++;
    this.messageID.push(nextVertexLabel);
    this.cmd(
      "CreateLabel",
      nextVertexLabel,
      startVertex,
      this.x_pos_logical[startVertex],
      this.y_pos_logical[startVertex]
    );
    this.cmd("SetLayer", nextVertexLabel, 1);
    this.topoOrderArrayL[0] = nextVertexLabel;
    nextVertexLabel = this.nextIndex++;
    this.messageID.push(nextVertexLabel);
    this.cmd(
      "CreateLabel",
      nextVertexLabel,
      startVertex,
      this.adj_list_x_start - this.adj_list_width,
      this.adj_list_y_start + startVertex * this.adj_list_height
    );
    this.cmd("SetLayer", nextVertexLabel, 2);
    this.topoOrderArrayAL[0] = nextVertexLabel;
    nextVertexLabel = this.nextIndex++;
    this.messageID.push(nextVertexLabel);
    this.cmd(
      "CreateLabel",
      nextVertexLabel,
      startVertex,
      this.adj_matrix_x_start - this.adj_matrix_width,
      this.adj_matrix_y_start + startVertex * this.adj_matrix_height
    );
    this.cmd("SetLayer", nextVertexLabel, 3);
    this.topoOrderArrayAM[0] = nextVertexLabel;
    for (i = 0; i < this.topoOrderArrayL.length; i++) {
      this.cmd(
        "Move",
        this.topoOrderArrayL[i],
        TopoSortDFS.ORDERING_INITIAL_X,
        TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y
      );
      this.cmd(
        "Move",
        this.topoOrderArrayAL[i],
        TopoSortDFS.ORDERING_INITIAL_X,
        TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y
      );
      this.cmd(
        "Move",
        this.topoOrderArrayAM[i],
        TopoSortDFS.ORDERING_INITIAL_X,
        TopoSortDFS.ORDERING_INITIAL_Y + i * TopoSortDFS.ORDERING_DELTA_Y
      );
    }
    this.cmd("Step");
  }
  this.callStackDepth--;
};
TopoSortDFS.prototype.reset = function() {
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
TopoSortDFS.prototype.enableUI = function(event) {
  this.startButton.disabled = !!this.runLocked;
  TopoSortDFS.superclass.enableUI.call(this, event);
};
TopoSortDFS.prototype.disableUI = function(event) {
  this.startButton.disabled = true;
  TopoSortDFS.superclass.disableUI.call(this, event);
};
TopoSortDFS.prototype.undo = function(event) {
  TopoSortDFS.superclass.undo.call(this, event);
  this.runLocked = false;
  this.enableUI(event);
};

// AlgorithmLibrary/Trie.js
Trie.NODE_WIDTH = 30;
Trie.FOREGROUND_COLOR = "var(--svgColor)";
Trie.LINK_COLOR = Trie.FOREGROUND_COLOR;
Trie.HIGHLIGHT_CIRCLE_COLOR = Trie.FOREGROUND_COLOR;
Trie.BACKGROUND_COLOR = "#d3f0d2ff";
Trie.TRUE_COLOR = "#d3f0d2ff";
Trie.PRINT_COLOR = Trie.FOREGROUND_COLOR;
Trie.FALSE_COLOR = "#FFFFFF";
Trie.WIDTH_DELTA = 50;
Trie.HEIGHT_DELTA = 50;
Trie.STARTING_Y = 50;
Trie.LeftMargin = 100;
Trie.NEW_NODE_Y = 100;
Trie.NEW_NODE_X = 50;
Trie.FIRST_PRINT_POS_X = 50;
Trie.PRINT_VERTICAL_GAP = 20;
Trie.PRINT_HORIZONTAL_GAP = 50;
function Trie(opts = {}) {
  if (!opts.title)
    opts.title = "Trie (Prefix Tree)";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 1e3, 400);
  this.addControls();
}
Trie.prototype = new Algorithm();
Trie.prototype.constructor = Trie;
Trie.superclass = Algorithm.prototype;
Trie.prototype.init = function(am, w2, h) {
  var sc = Trie.superclass;
  this.startingX = 200;
  this.first_print_pos_y = h - 2 * Trie.PRINT_VERTICAL_GAP;
  this.print_max = w2 - 10;
  var fn = sc.init;
  fn.call(this, am);
  this.nextIndex = 0;
  this.commands = [];
  this.cmd("CreateLabel", 0, "", 20, 10, 0);
  this.cmd("CreateLabel", 1, "", 20, 10, 0);
  this.cmd("CreateLabel", 2, "", 20, 30, 0);
  this.nextIndex = 3;
  this.animationManager.StartNewAnimation(this.commands);
  this.animationManager.skipForward();
  this.animationManager.clearHistory();
};
Trie.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    24,
    false
  );
  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);
  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);
  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);
  this.printButton = addControlToAlgorithmBar("Button", "Print");
  this.printButton.onclick = this.printCallback.bind(this);
};
Trie.prototype.reset = function() {
  this.nextIndex = 3;
  this.root = null;
};
Trie.prototype.insertCallback = function() {
  var insertedValue = this.inputField.value.toUpperCase();
  insertedValue = insertedValue.replace(/[^a-z]/gi, "");
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.add.bind(this), insertedValue);
  }
};
Trie.prototype.deleteCallback = function() {
  var deletedValue = this.inputField.value.toUpperCase();
  deletedValue = deletedValue.replace(/[^a-z]/gi, "");
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};
Trie.prototype.printCallback = function(event) {
  this.implementAction(this.printTree.bind(this), "");
};
Trie.prototype.findCallback = function() {
  var findValue = this.inputField.value.toUpperCase();
  findValue = findValue.replace(/[^a-z]/gi, "");
  this.inputField.value = "";
  this.implementAction(this.findElement.bind(this), findValue);
};
Trie.prototype.printTree = function(unused) {
  this.commands = [];
  if (this.root != null) {
    this.highlightID = this.nextIndex++;
    this.printLabel1 = this.nextIndex++;
    this.printLabel2 = this.nextIndex++;
    var firstLabel = this.nextIndex++;
    this.cmd(
      "CreateLabel",
      firstLabel,
      "Output: ",
      Trie.FIRST_PRINT_POS_X,
      this.first_print_pos_y
    );
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      Trie.HIGHLIGHT_CIRCLE_COLOR,
      this.root.x,
      this.root.y
    );
    this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
    this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
    this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
    this.cmd("AlignRight", this.printLabel2, this.printLabel1);
    this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
    this.yPosOfNextLabel = this.first_print_pos_y;
    this.printTreeRec(this.root, "");
    this.cmd("Delete", this.highlightID);
    this.cmd("Delete", this.printLabel1);
    this.cmd("Delete", this.printLabel2);
    this.cmd("Step");
    for (var i = firstLabel; i < this.nextIndex; i++) {
      this.cmd("Delete", i);
    }
    this.nextIndex = this.highlightID;
  }
  return this.commands;
};
Trie.prototype.printTreeRec = function(tree, stringSoFar) {
  if (tree.wordRemainder != "") {
  }
  if (tree.isword) {
    var nextLabelID = this.nextIndex++;
    this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
    this.cmd("SetForegroundColor", nextLabelID, Trie.PRINT_COLOR);
    this.cmd("AlignRight", nextLabelID, this.printLabel1, Trie.PRINT_COLOR);
    this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
    this.cmd("Step");
    this.xPosOfNextLabel += Trie.PRINT_HORIZONTAL_GAP;
    if (this.xPosOfNextLabel > this.print_max) {
      this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
      this.yPosOfNextLabel += Trie.PRINT_VERTICAL_GAP;
    }
  }
  for (var i = 0; i < 26; i++) {
    if (tree.children[i] != null) {
      var stringSoFar2 = stringSoFar + tree.children[i].wordRemainder;
      var nextLabelID = this.nextIndex++;
      var fromx = (tree.children[i].x + tree.x) / 2 + Trie.NODE_WIDTH / 2;
      var fromy = (tree.children[i].y + tree.y) / 2;
      this.cmd(
        "CreateLabel",
        nextLabelID,
        tree.children[i].wordRemainder,
        fromx,
        fromy,
        0
      );
      this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);
      this.cmd(
        "Move",
        this.highlightID,
        tree.children[i].x,
        tree.children[i].y
      );
      this.cmd("Step");
      this.cmd("Delete", nextLabelID);
      this.nextIndex--;
      this.cmd("SetText", this.printLabel2, stringSoFar2);
      this.printTreeRec(tree.children[i], stringSoFar2);
      this.cmd("Move", this.highlightID, tree.x, tree.y);
      this.cmd("SetText", this.printLabel2, stringSoFar);
      this.cmd("Step");
    }
  }
};
Trie.prototype.findElement = function(word) {
  this.commands = [];
  this.commands = new Array();
  this.cmd("SetMessage", "Finding: '" + word + "' ");
  this.cmd("AlignRight", 1, 0);
  this.cmd("Step");
  var node = this.doFind(this.root, word);
  if (node != null) {
    this.cmd("SetMessage", 'Found "' + word + '"');
  } else {
    this.cmd("SetMessage", '"' + word + '" not Found');
  }
  this.cmd("SetMessage", "");
  this.cmd("SetMessage", "");
  return this.commands;
};
Trie.prototype.doFind = function(tree, s) {
  if (tree == null) {
    return null;
  }
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (s.length == 0) {
    if (tree.isword == true) {
      this.cmd(
        "SetMessage",
        "Reached the end of the string \nCurrent node is True\nWord is in the tree"
      );
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      return tree;
    } else {
      this.cmd(
        "SetMessage",
        "Reached the end of the string \nCurrent node is False\nWord is Not the tree"
      );
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      return null;
    }
  } else {
    this.cmd("SetHighlightIndex", 1, 1);
    var index = s.charCodeAt(0) - "A".charCodeAt(0);
    if (tree.children[index] == null) {
      this.cmd(
        "SetMessage",
        "Child " + s.charAt(0) + " does not exist\nWord is Not the tree"
      );
      this.cmd("Step");
      this.cmd("SetHighlight", tree.graphicID, 0);
      return null;
    }
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      Trie.HIGHLIGHT_CIRCLE_COLOR,
      tree.x,
      tree.y
    );
    this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
    this.cmd(
      "SetMessage",
      "Making recursive call to " + s.charAt(0) + " child, passing in " + s.substring(1)
    );
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlightIndex", 1, -1);
    this.cmd("SetMessage", '"' + s.substring(1) + '"');
    this.cmd(
      "Move",
      this.highlightID,
      tree.children[index].x,
      tree.children[index].y
    );
    this.cmd("Step");
    this.cmd("Delete", this.highlightID);
    return this.doFind(tree.children[index], s.substring(1));
  }
};
Trie.prototype.insertElement = function(insertedValue) {
  this.cmd("SetText", 0, "");
  return this.commands;
};
Trie.prototype.insert = function(elem, tree) {
};
Trie.prototype.deleteElement = function(word) {
  this.commands = [];
  this.cmd("SetMessage", "Deleting: '" + word + "' ");
  this.cmd("AlignRight", 1, 0);
  this.cmd("Step");
  var node = this.doFind(this.root, word);
  if (node != null) {
    this.cmd("SetHighlight", node.graphicID, 1);
    this.cmd(
      "SetMessage",
      'Found "' + word + '", setting value in tree to False'
    );
    this.cmd("step");
    this.cmd("SetBackgroundColor", node.graphicID, Trie.FALSE_COLOR);
    node.isword = false;
    this.cmd("SetHighlight", node.graphicID, 0);
    this.cleanupAfterDelete(node);
    this.resizeTree();
  } else {
    this.cmd("SetMessage", '"' + word + '" not in tree, nothing to delete');
    this.cmd("step");
    this.cmd("SetHighlightIndex", 1, -1);
  }
  this.cmd("SetMessage", "");
  this.cmd("SetMessage", "");
  this.cmd("SetMessage", "");
  return this.commands;
};
Trie.prototype.numChildren = function(tree) {
  if (tree == null) {
    return 0;
  }
  var children = 0;
  for (var i = 0; i < 26; i++) {
    if (tree.children[i] != null) {
      children++;
    }
  }
  return children;
};
Trie.prototype.cleanupAfterDelete = function(tree) {
  var children = this.numChildren(tree);
  if (children == 0 && !tree.isword) {
    this.cmd(
      "SetMessage",
      'Deletion left us with a "False" leaf\nRemoving false leaf'
    );
    this.cmd("SetHighlight", tree.graphicID, 1);
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    if (tree.parent != null) {
      var index = 0;
      while (tree.parent.children[index] != tree) {
        index++;
      }
      this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
      this.cmd("Delete", tree.graphicID, 0);
      tree.parent.children[index] = null;
      this.cleanupAfterDelete(tree.parent);
    } else {
      this.cmd("Delete", tree.graphicID, 0);
      this.root = null;
    }
  }
};
Trie.prototype.resizeTree = function() {
  this.resizeWidths(this.root);
  if (this.root != null) {
    var startingPoint = this.root.width / 2 + 1 + Trie.LeftMargin;
    this.setNewPositions(this.root, startingPoint, Trie.STARTING_Y);
    this.animateNewPositions(this.root);
    this.cmd("Step");
  }
};
Trie.prototype.add = function(word) {
  this.commands = new Array();
  this.cmd("SetMessage", "Inserting '" + word + "'");
  this.cmd("AlignRight", 1, 0);
  this.cmd("Step");
  if (this.root == null) {
    this.cmd(
      "CreateCircle",
      this.nextIndex,
      "",
      Trie.NEW_NODE_X,
      Trie.NEW_NODE_Y
    );
    this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
    this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
    this.cmd("SetMessage", "Creating a new root");
    this.root = new TrieNode(
      "",
      this.nextIndex,
      Trie.NEW_NODE_X,
      Trie.NEW_NODE_Y
    );
    this.cmd("Step");
    this.resizeTree();
    this.cmd("SetMessage", "");
    this.highlightID = this.nextIndex++;
    this.nextIndex += 1;
  }
  this.addR(word.toUpperCase(), this.root);
  this.cmd("SetMessage", "");
  this.cmd("SetMessage", "");
  this.cmd("SetMessage", "");
  return this.commands;
};
Trie.prototype.addR = function(s, tree) {
  this.cmd("SetHighlight", tree.graphicID, 1);
  if (s.length == 0) {
    this.cmd(
      "SetMessage",
      "Reached the end of the string \nSet current node to true"
    );
    this.cmd("Step");
    this.cmd("SetBackgroundColor", tree.graphicID, Trie.TRUE_COLOR);
    this.cmd("SetHighlight", tree.graphicID, 0);
    tree.isword = true;
    return;
  } else {
    this.cmd("SetHighlightIndex", 1, 1);
    var index = s.charCodeAt(0) - "A".charCodeAt(0);
    if (tree.children[index] == null) {
      this.cmd(
        "CreateCircle",
        this.nextIndex,
        s.charAt(0),
        Trie.NEW_NODE_X,
        Trie.NEW_NODE_Y
      );
      this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
      this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
      this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
      this.cmd(
        "SetMessage",
        "Child " + s.charAt(0) + " does not exist.  Creating ... "
      );
      tree.children[index] = new TrieNode(
        s.charAt(0),
        this.nextIndex,
        Trie.NEW_NODE_X,
        Trie.NEW_NODE_Y
      );
      tree.children[index].parent = tree;
      this.cmd(
        "Connect",
        tree.graphicID,
        tree.children[index].graphicID,
        Trie.FOREGROUND_COLOR,
        0,
        false,
        s.charAt(0)
      );
      this.cmd("Step");
      this.resizeTree();
      this.cmd("SetMessage", "");
      this.nextIndex += 1;
      this.highlightID = this.nextIndex++;
    }
    this.cmd(
      "CreateHighlightCircle",
      this.highlightID,
      Trie.HIGHLIGHT_CIRCLE_COLOR,
      tree.x,
      tree.y
    );
    this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
    this.cmd(
      "SetMessage",
      "Making recursive call to " + s.charAt(0) + ' child, passing in "' + s.substring(1) + '"'
    );
    this.cmd("Step");
    this.cmd("SetHighlight", tree.graphicID, 0);
    this.cmd("SetHighlightIndex", 1, -1);
    this.cmd("SetMessage", '"' + s.substring(1) + '"');
    this.cmd(
      "Move",
      this.highlightID,
      tree.children[index].x,
      tree.children[index].y
    );
    this.cmd("Step");
    this.cmd("Delete", this.highlightID);
    this.addR(s.substring(1), tree.children[index]);
  }
};
Trie.prototype.setNewPositions = function(tree, xPosition, yPosition) {
  if (tree != null) {
    tree.x = xPosition;
    tree.y = yPosition;
    var newX = xPosition - tree.width / 2;
    var newY = yPosition + Trie.HEIGHT_DELTA;
    for (var i = 0; i < 26; i++) {
      if (tree.children[i] != null) {
        this.setNewPositions(
          tree.children[i],
          newX + tree.children[i].width / 2,
          newY
        );
        newX = newX + tree.children[i].width;
      }
    }
  }
};
Trie.prototype.animateNewPositions = function(tree) {
  if (tree != null) {
    this.cmd("Move", tree.graphicID, tree.x, tree.y);
    for (var i = 0; i < 26; i++) {
      this.animateNewPositions(tree.children[i]);
    }
  }
};
Trie.prototype.resizeWidths = function(tree) {
  if (tree == null) {
    return 0;
  }
  var size = 0;
  for (var i = 0; i < 26; i++) {
    tree.childWidths[i] = this.resizeWidths(tree.children[i]);
    size += tree.childWidths[i];
  }
  tree.width = Math.max(size, Trie.NODE_WIDTH + 4);
  return tree.width;
};
function TrieNode(val, id, initialX, initialY) {
  this.wordRemainder = val;
  this.x = initialX;
  this.y = initialY;
  this.graphicID = id;
  this.children = new Array(26);
  this.childWidths = new Array(26);
  for (var i = 0; i < 26; i++) {
    this.children[i] = null;
    this.childWidths[i] = 0;
  }
  this.width = 0;
  this.parent = null;
}
Trie.prototype.disableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.printButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = true;
  }
};
Trie.prototype.enableUI = function() {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
    this.printButton
  ];
  for (const el of ctrls) {
    if (el)
      el.disabled = false;
  }
};

// AlgorithmLibrary/StringHash.js
function StringHash(opts = {}) {
  if (!opts.title)
    opts.title = "String Hash";
  opts.centered = true;
  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;
  let am = initAnimationManager(opts);
  this.init(am, 800, 300);
  this.hashingIntegers = false;
  this.animateStringHashing = true;
  this.table_size = 13;
  const om = am && am.animatedObjects;
  const vb = om.svg.getAttribute("viewBox").split(" ").map(parseFloat);
  const baseW = Number.isFinite(om.svgBaseViewWidth) ? om.svgBaseViewWidth : vb[2];
  const shiftX = 100;
  vb[0] = vb[0] + shiftX;
  om.svg.setAttribute("viewBox", vb.join(" "));
}
StringHash.prototype = new Hash();
StringHash.prototype.constructor = StringHash;
StringHash.superclass = Hash.prototype;
StringHash.prototype.init = function(am, w2, h) {
  StringHash.superclass.init.call(this, am, w2, h);
  this.nextIndex = 0;
  this.commands = [];
  this.hashingIntegers = false;
  this.animateStringHashing = true;
  this.table_size = 13;
  this.doHash = (str) => this.implementAction(this.runHash.bind(this), String(str));
};
StringHash.prototype.addControls = function() {
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "String");
  this.inputField.setAttribute("placeholder", "String to hash");
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.hashCallback.bind(this),
    64,
    false
  );
  this.hashButton = addControlToAlgorithmBar("Button", "Hash");
  this.hashButton.onclick = this.hashCallback.bind(this);
};
StringHash.prototype.reset = function() {
  this.nextIndex = 0;
  this.commands = [];
};
StringHash.prototype.hashCallback = function() {
  const value = String(this.inputField.value);
  if (value !== "") {
    this.inputField.value = "";
    this.implementAction(this.runHash.bind(this), value);
  }
};
StringHash.prototype.runHash = function(str) {
  this.commands = [];
  this.cmd("SetMessage", "Hash '" + str + "'");
  this.cmd("Step");
  Hash.prototype.doHash.call(this, str, true);
  this.cmd("SetMessage", "");
  return this.commands;
};
StringHash.prototype.disableUI = function() {
  const ctrls = [this.inputField, this.hashButton];
  for (const el of ctrls) {
    if (el)
      el.disabled = true;
  }
};
StringHash.prototype.enableUI = function() {
  const ctrls = [this.inputField, this.hashButton];
  for (const el of ctrls) {
    if (el)
      el.disabled = false;
  }
};
export {
  AVL,
  BFS,
  BST,
  BSTCopy,
  BSTIterator,
  BTree,
  ClosedHash,
  ConnectedComponent,
  DFS,
  DetectCycle,
  DijkstraPrim,
  DoublyLinkedList,
  ExpressionTree,
  GraphRepresentation,
  Hash,
  Heap,
  HeapMax,
  HeapSort,
  Kruskal,
  LinkedList,
  LinkedListSimple,
  LinkedListTail,
  OpenHash,
  Prim,
  QueueArray,
  QueueLL,
  RandomGenerator,
  RedBlack,
  SkipList,
  SPLAYTREE as SplayTree,
  StackArray,
  StackLL,
  StringHash,
  TopoSortDFS,
  Treap,
  Trie
};
/* @license
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
*/
//# sourceMappingURL=entry.js.map
