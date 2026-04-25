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

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import {
  Algorithm,
  addCheckboxToAlgorithmBar,
  addControlToAlgorithmBar,
  addSeparatorToAlgorithmBar,
} from "../AlgorithmLibrary/Algorithm.js";

ExpressionTree.FOREGROUND_COLOR = "var(--svgColor)";
ExpressionTree.LINK_COLOR = ExpressionTree.FOREGROUND_COLOR;

ExpressionTree.STARTING_Y = 40;
ExpressionTree.LEVEL_HEIGHT = 70;
ExpressionTree.NODE_RADIUS = 20;
ExpressionTree.MARGIN_X = 50;

export function ExpressionTree(opts = {}) {
  if (!opts.title) opts.title = "Expression Tree";
  opts.centered = true;

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

ExpressionTree.prototype.init = function (am, w, h) {
  const sc = ExpressionTree.superclass;
  const fn = sc.init;
  fn.call(this, am, w, h);

  this.nextIndex = 0;
  this.commands = [];

  this.treeRoot = null;
  this.evalLabelIDs = [];

  this.printOutput = "";
  this.printOutputLabelID = -1;

  // Programmatic bindings (used by embedding pages / autograding harnesses).
  // Mirrors the doX pattern used across the other visualizations.
  this.doBuild = function (data) {
    let parsed = data;
    if (typeof parsed === "string") {
      const trimmed = parsed.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          parsed = JSON.parse(trimmed);
        } catch {
          // Fall back to treating it as a literal leaf token.
        }
      } else {
        // Infix string form
        try {
          const root = this.parseInfixExpression(trimmed);
          this.implementAction(this.buildTree.bind(this), root);
          return;
        } catch {
          // Fall back to other parsing forms below.
        }
      }
    }

    const isNodeLike =
      parsed &&
      typeof parsed === "object" &&
      Object.prototype.hasOwnProperty.call(parsed, "label") &&
      Object.prototype.hasOwnProperty.call(parsed, "children");

    const root = isNodeLike ? parsed : this.parseInitialData(parsed);
    this.implementAction(this.buildTree.bind(this), root);
  };
  this.doClear = function () {
    this.implementAction(this.clearTree.bind(this), "");
  };
  this.doPrint = function (order = "In") {
    this.implementAction(this.printTree.bind(this), order);
  };
  this.doEvaluate = function () {
    this.implementAction(this.evaluateTree.bind(this), "");
  };
};

ExpressionTree.prototype.beginExpressionTreeAnimation = function (
  operation,
  label,
  meta = {},
) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "ExpressionTree", operation, ...meta });
};

ExpressionTree.prototype.markAnimationStep = function (label, meta = {}) {
  const stepMeta = {
    source: "ExpressionTree",
    operation: this.currentAnimationOperation,
    ...meta,
  };
  if (stepMeta.tags != null) {
    stepMeta.tags = Array.isArray(stepMeta.tags)
      ? stepMeta.tags
      : [stepMeta.tags];
  }
  this.step(label, stepMeta);
};

ExpressionTree.prototype.finishExpressionTreeAnimation = function () {
  return this.finishAnimation();
};

ExpressionTree.prototype.deleteTreeGraphicsRec = function (node, opts = {}) {
  if (!node) return;
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

ExpressionTree.prototype.clearTree = function () {
  this.beginExpressionTreeAnimation("clear", "clear tree", { tags: ["clear"] });

  // Remove any evaluation labels still present.
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];

  // Remove the print output label.
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("Delete", this.printOutputLabelID);
  }
  this.printOutputLabelID = -1;
  this.printOutput = "";

  if (this.treeRoot) {
    this.cmd("SetMessage", "Clearing existing tree");
    this.markAnimationStep("start clear", { tags: ["clear", "start"] });
    this.deleteTreeGraphicsRec(this.treeRoot);
    this.treeRoot = null;
    this.cmd("SetMessage", "");
  }

  return this.finishExpressionTreeAnimation();
};

ExpressionTree.prototype.resetPrintOutputLabel = function () {
  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("Delete", this.printOutputLabelID);
  }
  this.printOutputLabelID = this.nextIndex++;
  const x = this.canvasWidth / 2 - 200;
  const y = 40;
  this.cmd("CreateLabel", this.printOutputLabelID, "Output:", x, y, 0);
  this.cmd("SetForegroundColor", this.printOutputLabelID, ExpressionTree.FOREGROUND_COLOR);
};

ExpressionTree.prototype.addControls = function () {
  addSeparatorToAlgorithmBar();

  this.printpreButton = addControlToAlgorithmBar("Button", "Print PreOrder");
  this.printpreButton.onclick = this.print.bind(this, "Pre");

  this.printButton = addControlToAlgorithmBar("Button", "Print InOrder");
  this.printButton.onclick = this.print.bind(this, "In");

  this.printpostButton = addControlToAlgorithmBar("Button", "Print PostOrder");
  this.printpostButton.onclick = this.print.bind(this, "Post");

  this.parensInorderCheckbox = addCheckboxToAlgorithmBar(
    "Parens in InOrder",
    "parensInorderCheckbox",
  );
  this.parensInorderCheckbox.checked = false;
  
  addSeparatorToAlgorithmBar();


  this.evaluateButton = addControlToAlgorithmBar("Button", "Evaluate");
  this.evaluateButton.onclick = this.evaluateCallback.bind(this);

  // this.clearButton = addControlToAlgorithmBar("Button", "Clear");
  // this.clearButton.onclick = this.clearCallback.bind(this);
  
  addSeparatorToAlgorithmBar();
  

  this.expressionField = addControlToAlgorithmBar(
    "Text",
    "",
    "expressionField",
    "Infix expression",
  );

  this.loadExpressionButton = addControlToAlgorithmBar("Button", "Load Expression");
  this.loadExpressionButton.onclick = this.loadExpressionCallback.bind(this);

};

ExpressionTree.prototype.disableUI = function (event) {
  if (this.expressionField) this.expressionField.disabled = true;
  if (this.loadExpressionButton) this.loadExpressionButton.disabled = true;
  if (this.printpreButton) this.printpreButton.disabled = true;
  if (this.printButton) this.printButton.disabled = true;
  if (this.printpostButton) this.printpostButton.disabled = true;
  if (this.parensInorderCheckbox) this.parensInorderCheckbox.disabled = true;
  if (this.evaluateButton) this.evaluateButton.disabled = true;
  if (this.clearButton) this.clearButton.disabled = true;
};

ExpressionTree.prototype.enableUI = function (event) {
  if (this.expressionField) this.expressionField.disabled = false;
  if (this.loadExpressionButton) this.loadExpressionButton.disabled = false;
  if (this.printpreButton) this.printpreButton.disabled = false;
  if (this.printButton) this.printButton.disabled = false;
  if (this.printpostButton) this.printpostButton.disabled = false;
  if (this.parensInorderCheckbox) this.parensInorderCheckbox.disabled = false;
  if (this.evaluateButton) this.evaluateButton.disabled = false;
  if (this.clearButton) this.clearButton.disabled = false;
};

ExpressionTree.prototype.print = function (order) {
  this.implementAction(this.printTree.bind(this), order);
};

ExpressionTree.prototype.loadExpressionCallback = function (event) {
  const expr = this.expressionField ? this.expressionField.value : "";
  this.implementAction(this.buildTreeFromInfix.bind(this), expr);
};

ExpressionTree.prototype.clearCallback = function (event) {
  this.implementAction(this.clearTree.bind(this), "");
};

ExpressionTree.prototype.evaluateCallback = function (event) {
  this.implementAction(this.evaluateTree.bind(this), "");
};

ExpressionTree.prototype.buildTreeFromInfix = function (expr) {
  this.beginExpressionTreeAnimation("build", "build from infix", {
    expression: String(expr ?? ""),
    tags: ["build", "infix"],
  });

  let root;
  try {
    root = this.parseInfixExpression(expr);
  } catch (e) {
    this.cmd("SetMessage", `Invalid expression: ${e?.message ?? String(e)}`);
    this.cmd("SetMessage", "");
    this.markAnimationStep("invalid infix expression", { tags: ["build", "invalid"] });
    return this.finishExpressionTreeAnimation();
  }

  if (!root) {
    this.cmd("SetMessage", "No expression provided");
    this.cmd("SetMessage", "");
    this.markAnimationStep("no expression provided", { tags: ["build", "empty"] });
    return this.finishExpressionTreeAnimation();
  }

  // Delegate to buildTree for actual rendering/clearing behavior.
  return this.buildTree(root);
};

ExpressionTree.prototype.tokenizeInfix = function (expr) {
  const s = String(expr ?? "");
  const tokens = [];
  let i = 0;

  const isWhitespace = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";
  const isDigit = (c) => c >= "0" && c <= "9";
  const isAlpha = (c) =>
    (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || c === "_";

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

    // Number (supports decimals)
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

    // Identifier token (will evaluate to NaN unless you add variable support later)
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

ExpressionTree.prototype.parseInfixExpression = function (expr) {
  const tokens = this.tokenizeInfix(expr);
  if (tokens.length === 0) return null;

  // Shunting-yard to RPN, with unary minus support.
  const output = [];
  const ops = [];

  const precedence = {
    "u-": 4,
    "^": 3,
    "*": 2,
    "/": 2,
    "+": 1,
    "-": 1,
  };
  const rightAssoc = {
    "u-": true,
    "^": true,
  };
  const arity = {
    "u-": 1,
    "^": 2,
    "*": 2,
    "/": 2,
    "+": 2,
    "-": 2,
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
      if (!found) throw new Error("Mismatched ')' ");
      prevType = "rparen";
      continue;
    }

    if (t.type === "op") {
      let op = t.value;
      // Unary minus if at start, after an operator, or after '('.
      if (op === "-" && (prevType === "start" || prevType === "op" || prevType === "lparen")) {
        op = "u-";
      }

      const p1 = precedence[op];
      if (!Number.isFinite(p1)) throw new Error(`Unsupported operator '${op}'`);

      while (ops.length > 0) {
        const top = ops[ops.length - 1];
        if (top.type !== "op") break;

        const p2 = precedence[top.value];
        if (!Number.isFinite(p2)) break;

        const shouldPop = rightAssoc[op] ? p1 < p2 : p1 <= p2;
        if (!shouldPop) break;
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

  // Build expression tree from RPN.
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
        if (!child) throw new Error("Missing operand for unary operator");
        // Represent unary minus as a '-' node with one child (works with applyOperator).
        stack.push({ label: "-", children: [child] });
      } else if (a === 2) {
        const right = stack.pop();
        const left = stack.pop();
        if (!left || !right) throw new Error("Missing operand for binary operator");
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

ExpressionTree.prototype.parseInitialData = function (data) {
  // Expected nested dict / list format, as used in Tree.html.
  // Examples:
  //   {"+": [{"-": [5, 6]}, {"*": [1, 4]}]}
  //   {"*": ["3", {"+": ["1", "4"]}]}
  const parseNode = (obj) => {
    if (obj == null) return null;

    if (typeof obj === "string" || typeof obj === "number") {
      return { label: String(obj), children: [] };
    }

    if (Array.isArray(obj)) {
      return { label: "", children: obj.map(parseNode).filter(Boolean) };
    }

    if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return null;

      if (keys.length > 1) {
        return {
          label: "",
          children: keys
            .map((k) => ({
              label: String(k),
              children: Array.isArray(obj[k])
                ? obj[k].map(parseNode).filter(Boolean)
                : [],
            }))
            .filter(Boolean),
        };
      }

      const key = keys[0];
      const childrenRaw = obj[key];
      const children = Array.isArray(childrenRaw)
        ? childrenRaw.map(parseNode).filter(Boolean)
        : [];
      return { label: String(key), children };
    }

    return null;
  };

  return parseNode(data);
};

ExpressionTree.prototype.computeLayout = function (root) {
  if (!root) return;

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
  const leafSpacing =
    leafCount <= 1
      ? 0
      : Math.max(60, Math.min(110, availableWidth / (leafCount - 1)));

  const toXY = (node) => {
    const x =
      leafCount <= 1
        ? this.canvasWidth / 2
        : ExpressionTree.MARGIN_X + node._xIndex * leafSpacing;
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

ExpressionTree.prototype.buildTree = function (root) {
  this.beginExpressionTreeAnimation("build", "build expression tree", {
    tags: ["build"],
  });

  // If there is an existing tree, clear it first so repeated programmatic builds work.
  if (this.treeRoot) {
    // Clear eval labels / output label as well.
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
    // this.cmd("Step");
    // Silent delete: don't Step per node during a reload/build.
    this.deleteTreeGraphicsRec(this.treeRoot, { step: false });
    this.treeRoot = null;
    this.cmd("SetMessage", "");
    this.markAnimationStep("clear previous tree", { tags: ["build", "clear"] });
  }

  if (!root) {
    this.cmd("SetMessage", "No expression provided");
    this.markAnimationStep("no expression provided", { tags: ["build", "empty"] });
    this.cmd("SetMessage", "");
    return this.finishExpressionTreeAnimation();
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
    this.markAnimationStep(`create node ${node.label}`, {
      focusNodeId: id,
      tags: ["build", "create"],
    });

    if (node.children) {
      for (const child of node.children) {
        build(child, id);
      }
    }
  };

  build(root, null);
  this.cmd("SetMessage", "");
  return this.finishExpressionTreeAnimation();
};

ExpressionTree.prototype.printTree = function (order) {
  if (order == undefined) order = "In";
  this.beginExpressionTreeAnimation("print", `print ${order} order`, {
    tags: ["print", String(order).toLowerCase()],
  });
  this.printOutput = "";

  if (!this.treeRoot) {
    this.cmd("SetMessage", "Tree is empty");
    this.markAnimationStep("tree empty", { tags: ["print", "empty"] });
    this.cmd("SetMessage", "");
    return this.finishExpressionTreeAnimation();
  }

  this.resetPrintOutputLabel();
  this.cmd("SetText", this.printOutputLabelID, "Output: ");

  this.cmd("SetMessage", "Starting from root");
  this.cmd("SetHighlight", this.treeRoot.graphicID, 1);
  this.markAnimationStep("visit root", {
    focusNodeId: this.treeRoot.graphicID,
    tags: ["print", "visit"],
  });
  this.cmd("SetHighlight", this.treeRoot.graphicID, 0);

  this.printTreeRec(this.treeRoot, order);
  this.beginBlock("final print output", {
    source: "ExpressionTree",
    operation: this.currentAnimationOperation,
    tags: ["print", "output"],
  });
  this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  this.cmd("SetMessage", "Final output:\n" + this.printOutput);
  return this.finishExpressionTreeAnimation();
};

ExpressionTree.prototype.printSelf = function (node) {
  if (this.printOutput.length > 0) {
    this.printOutput += " ";
  }
  this.printOutput += node.label;

  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  }
  this.cmd(
    "SetMessage",
    "Print " + node.label + "\nCurrent output:\n" + this.printOutput,
  );
  this.markAnimationStep(`print ${node.label}`, {
    focusNodeId: node.graphicID,
    tags: ["print", "output"],
  });
};

ExpressionTree.prototype.printToken = function (token, message) {
  if (this.printOutput.length > 0) {
    this.printOutput += " ";
  }
  this.printOutput += token;

  if (Number.isFinite(this.printOutputLabelID) && this.printOutputLabelID >= 0) {
    this.cmd("SetText", this.printOutputLabelID, "Output: " + this.printOutput);
  }
  this.cmd("SetMessage", message ?? ("Print " + token));
  this.markAnimationStep(`print token ${token}`, { tags: ["print", "token"] });
};

ExpressionTree.prototype.printChild = function (node, child, childIndex) {
  if (child) {
    this.cmd(
      "SetMessage",
      `${node.label} has child ${childIndex}, visit it...`,
    );
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.markAnimationStep(`${node.label}: visit child ${childIndex}`, {
      focusNodeId: node.graphicID,
      tags: ["print", "traverse"],
    });
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 0);
  }
};

ExpressionTree.prototype.printTreeRec = function (node, order) {
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
    // "In" order for an n-ary expression tree: visit first child, then self, then remaining children.
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
  this.markAnimationStep(`finish ${node.label}`, {
    focusNodeId: node.graphicID,
    tags: ["print", "return"],
  });
};

ExpressionTree.prototype.evaluateTree = function () {
  this.beginExpressionTreeAnimation("evaluate", "evaluate expression tree", {
    tags: ["evaluate"],
  });

  // Clear previous evaluation labels (if any)
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];

  if (!this.treeRoot) {
    this.cmd("SetMessage", "No expression to evaluate");
    this.markAnimationStep("no expression to evaluate", {
      tags: ["evaluate", "empty"],
    });
    this.cmd("SetMessage", "");
    return this.finishExpressionTreeAnimation();
  }

  this.cmd("SetMessage", "Evaluate expression tree");
  this.markAnimationStep("start evaluation", { tags: ["evaluate", "start"] });

  const value = this.evaluateRec(this.treeRoot);
  this.beginBlock(`final result ${String(value)}`, {
    source: "ExpressionTree",
    operation: this.currentAnimationOperation,
    tags: ["evaluate", "result"],
  });
  this.cmd("SetMessage", `Final result: ${String(value)}`);

  // Remove computed node values when evaluation finishes.
  if (Array.isArray(this.evalLabelIDs)) {
    for (const id of this.evalLabelIDs) {
      this.cmd("Delete", id);
    }
  }
  this.evalLabelIDs = [];

  return this.finishExpressionTreeAnimation();
};

ExpressionTree.prototype.isOperator = function (token) {
  return token === "+" || token === "-" || token === "*" || token === "/" || token === "^";
};

ExpressionTree.prototype.applyOperator = function (op, values) {
  if (!Array.isArray(values) || values.length === 0) return NaN;

  if (op === "+") {
    return values.reduce((a, b) => a + b, 0);
  }
  if (op === "*") {
    return values.reduce((a, b) => a * b, 1);
  }
  if (op === "-") {
    if (values.length === 1) return -values[0];
    return values.slice(1).reduce((a, b) => a - b, values[0]);
  }
  if (op === "/") {
    if (values.length === 1) return 1 / values[0];
    return values.slice(1).reduce((a, b) => a / b, values[0]);
  }
  if (op === "^") {
    if (values.length === 1) return values[0];
    // Right-associative for n-ary exponentiation
    return values
      .slice(0, -1)
      .reduceRight((acc, v) => Math.pow(v, acc), values[values.length - 1]);
  }

  return NaN;
};

ExpressionTree.prototype.showEvalValue = function (node, value) {
  const id = this.nextIndex++;
  this.evalLabelIDs.push(id);

  // Put the computed value slightly to the right of the node.
  this.cmd("CreateLabel", id, String(value), node._x + 30, node._y, 0);
  this.cmd("SetForegroundColor", id, ExpressionTree.FOREGROUND_COLOR);
};

ExpressionTree.prototype.evaluateRec = function (node) {
  this.cmd("SetHighlight", node.graphicID, 1);
  this.markAnimationStep(`evaluate ${node.label}`, {
    focusNodeId: node.graphicID,
    tags: ["evaluate", "visit"],
  });

  const children = Array.isArray(node.children) ? node.children : [];

  if (children.length !== 0) {
    this.cmd("SetMessage", `Operator node ${node.label}, needs to evaluate children first`);
    this.markAnimationStep(`evaluate children of ${node.label}`, {
      focusNodeId: node.graphicID,
      tags: ["evaluate", "operator"],
    });
  }

  // Postorder: evaluate children first
  const childValues = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    this.cmd("SetMessage", `Visit ${i == 0 ? "left" : "right"} child of ${node.label}`);
    this.cmd("SetEdgeHighlight", node.graphicID, child.graphicID, 1);
    this.markAnimationStep(`visit child ${i} of ${node.label}`, {
      focusNodeId: child.graphicID,
      tags: ["evaluate", "traverse"],
    });
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
    this.markAnimationStep(`leaf ${node.label} = ${String(value)}`, {
      focusNodeId: node.graphicID,
      tags: ["evaluate", "leaf"],
    });
  } else if (this.isOperator(node.label)) {
    value = this.applyOperator(node.label, childValues);
    this.cmd(
      "SetMessage",
      `Compute ${node.label}(${childValues.map((v) => String(v)).join(", ")}) = ${String(value)}`,
    );
    this.markAnimationStep(`compute ${node.label}`, {
      focusNodeId: node.graphicID,
      tags: ["evaluate", "compute"],
    });
  } else {
    // Not a number and not an operator.
    value = NaN;
    this.cmd("SetMessage", `Cannot evaluate token '${node.label}'`);
    this.markAnimationStep(`cannot evaluate ${node.label}`, {
      focusNodeId: node.graphicID,
      tags: ["evaluate", "invalid"],
    });
  }

  this.showEvalValue(node, value);
  this.cmd("SetMessage", `Value at ${node.label}: ${String(value)}`);
  this.cmd("SetHighlight", node.graphicID, 0);
  this.markAnimationStep(`value at ${node.label}`, {
    focusNodeId: node.graphicID,
    tags: ["evaluate", "value"],
  });

  return value;
};
