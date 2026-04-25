// String hashing visualization based on Hash.doHash string animation.
// Shows only the string hashing animation with a single input and Hash button.

import { initAnimationManager } from "../AnimationLibrary/AnimationMain.js";
import { Hash } from "./Hash.js";
import { Algorithm, addControlToAlgorithmBar, addSeparatorToAlgorithmBar } from "./Algorithm.js";

export function StringHash(opts = {}) {
  if (!opts.title) opts.title = "String Hash";
  opts.centered = true;

  opts.heightSingleMode = 250;
  opts.height = 350;
  opts.heightMobile = 450;
  opts.heightMobileSingle = 350;

  let am = initAnimationManager(opts);
  this.init(am, 800, 300);

  // Always operate in string mode; small default table size for modulo display.
  this.hashingIntegers = false;
  this.animateStringHashing = true;
  this.table_size = 13;

  // Normal location is not ideal, shift viewbox to fix
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

StringHash.prototype.init = function (am, w, h) {
  // Initialize via Hash superclass
  StringHash.superclass.init.call(this, am, w, h);
  this.nextIndex = 0;
  this.commands = [];

  // Override defaults: always string hashing
  this.hashingIntegers = false;
  this.animateStringHashing = true;
  this.table_size = 13;

  // Prevent any legacy controls from being created by Hash.addControls
  // We will add our own minimal controls below.
  // Programmatic binding to run the string hash animation
  this.doHash = (str) => this.implementAction(this.runHash.bind(this), String(str));
};

StringHash.prototype.addControls = function () {
  // Single shared input + Hash button
  addSeparatorToAlgorithmBar();
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "String");
  this.inputField.setAttribute("placeholder", "String to hash");
  // Always accept strings (no integer-only restriction)
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.hashCallback.bind(this),
    64,
    false,
  );
  this.hashButton = addControlToAlgorithmBar("Button", "Hash");
  this.hashButton.onclick = this.hashCallback.bind(this);
};

StringHash.prototype.reset = function () {
  this.nextIndex = 0;
  this.commands = [];
};

StringHash.prototype.beginStringHashAnimation = function (operation, label, meta = {}) {
  this.currentAnimationOperation = operation;
  this.beginAnimation();
  this.beginBlock(label, { source: "StringHash", operation, ...meta });
};

StringHash.prototype.markAnimationStep = function (label, meta = {}) {
  this.step(label, {
    source: "StringHash",
    operation: this.currentAnimationOperation,
    ...meta,
  });
};

StringHash.prototype.finishStringHashAnimation = function () {
  this.currentAnimationOperation = null;
  return this.finishAnimation();
};

StringHash.prototype.hashCallback = function () {
  const value = String(this.inputField.value);
  if (value !== "") {
    this.inputField.value = "";
    this.implementAction(this.runHash.bind(this), value);
  }
};

StringHash.prototype.runHash = function (str) {
  this.beginStringHashAnimation("hash", `hash ${str}`, {
    tags: ["hash", "string"],
  });
  this.cmd("SetMessage", "Hash '" + str + "'");
  this.markAnimationStep("start hash", {
    tags: ["hash", "string", "start"],
  });

  // Use Hash.doHash with the second param=true to run only the string hashing portion,
  // skipping bucket highlight/movement.
  Hash.prototype.doHash.call(this, str, true);

  this.beginBlock("hash complete", {
    source: "StringHash",
    operation: this.currentAnimationOperation,
    tags: ["hash", "string", "complete"],
  });
  this.cmd("SetMessage", "");
  return this.finishStringHashAnimation();
};

// Disable/enable algorithm-specific UI during animations
StringHash.prototype.disableUI = function () {
  const ctrls = [this.inputField, this.hashButton];
  for (const el of ctrls) {
    if (el) el.disabled = true;
  }
};

StringHash.prototype.enableUI = function () {
  const ctrls = [this.inputField, this.hashButton];
  for (const el of ctrls) {
    if (el) el.disabled = false;
  }
};
