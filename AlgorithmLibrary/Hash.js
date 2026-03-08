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
import {
  Algorithm,
  addRadioButtonGroupToAlgorithmBar,
  addControlToAlgorithmBar,
  addCheckboxToAlgorithmBar,
} from "./Algorithm.js";

export function Hash(arg1, w, h) {
  // Used as a base class (OpenHash/ClosedHash/etc). Many algorithms do:
  //   SomeChild.prototype = new Hash();
  // In that case, we must not initialize animation.
  if (arg1 == undefined) return;

  // Supported calling conventions:
  // - Legacy: `new Hash(am, w, h)`
  // - Legacy: `new Hash(canvas)`
  // - New:    `new Hash({ viewWidth, viewHeight, ... })`
  let am;
  let width;
  let height;

  if (arg1 && typeof arg1.getContext === "function") {
    const legacyCanvas = arg1;
    am = initCanvas(legacyCanvas, null, "Hashing", false, {
      viewWidth: legacyCanvas.width,
      viewHeight: legacyCanvas.height,
    });
    width = legacyCanvas.width;
    height = legacyCanvas.height;
  } else if (arg1 && typeof arg1.StartNewAnimation === "function") {
    am = arg1;
    width = w;
    height = h;
  } else {
    const opts = arg1 || {};
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
      title: opts.title || "Hashing",
      height: opts.height || viewHeight,
      viewWidth,
      viewHeight,
      ...opts,
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
var ELF_HASH_SHIFT = 10;

var HASH_LABEL_X = 300;
var HASH_LABEL_Y = 30;
var HASH_LABEL_DELTA_X = 50;

var HIGHLIGHT_COLOR = "#0000FF";

Hash.prototype.init = function (am, w, h) {
  var sc = Hash.superclass;
  var fn = sc.init;
  fn.call(this, am, w, h);
  this.addControls();
  this.nextIndex = 0;
  this.hashingIntegers = true;
  this.animateStringHashing = true;

  if (this.animateStringHashCheckbox) {
    this.animateStringHashCheckbox.checked = true;
    this.animateStringHashCheckbox.disabled = true;
  }
};

Hash.prototype.addControls = function () {
  // Single shared input used by Insert/Remove/Find
  
  this.inputField = addControlToAlgorithmBar("Text", "", "inputField", "Value");
  this.inputField.size = MAX_HASH_LENGTH;
  this.inputField.onkeydown = this.returnSubmit(
    this.inputField,
    this.insertCallback.bind(this),
    MAX_HASH_LENGTH,
    true,
  );
  

  this.insertButton = addControlToAlgorithmBar("Button", "Insert");
  this.insertButton.onclick = this.insertCallback.bind(this);

  this.deleteButton = addControlToAlgorithmBar("Button", "Remove");
  this.deleteButton.onclick = this.deleteCallback.bind(this);

  this.findButton = addControlToAlgorithmBar("Button", "Find");
  this.findButton.onclick = this.findCallback.bind(this);

  
  var radioButtonList = addRadioButtonGroupToAlgorithmBar(
    ["Integer Mode", "String Mode"],
    "HashType",
  );
  
  this.animateStringHashCheckbox = addCheckboxToAlgorithmBar(
    "Animate string hashing",
    "animateStringHashing",
  );

  this.hashIntegerButton = radioButtonList[0];
  this.hashIntegerButton.onclick = this.changeHashTypeCallback.bind(this, true);
  //  this.hashIntegerButton.onclick = this.hashIntegerCallback.bind(this);
  this.hashStringButton = radioButtonList[1];
  this.hashStringButton.onclick = this.changeHashTypeCallback.bind(this, false);

  //	this.hashStringButton.onclick = this.hashStringCallback.bind(this);
  this.hashIntegerButton.checked = true;

  // addCheckboxToAlgorithmBar does not currently assign the element id.
  // Ensure the label's "for" attribute works.
  this.animateStringHashCheckbox.id = "animateStringHashing";
  this.animateStringHashCheckbox.checked = true;
  this.animateStringHashCheckbox.disabled = true;
  this.animateStringHashCheckbox.onclick = () => {
    this.animateStringHashing = !!this.animateStringHashCheckbox.checked;
  };
};

// Do this extra level of wrapping to get undo to work properly.
// (also, so that we only implement the action if we are changing the
// radio button)
Hash.prototype.changeHashTypeCallback = function (newHashingIntegers, event) {
  if (this.hashingIntegers != newHashingIntegers) {
    this.implementAction(this.changeHashType.bind(this), newHashingIntegers);
  }
};

Hash.prototype.changeHashType = function (newHashingIntegerValue) {
  this.hashingIntegers = newHashingIntegerValue;
  if (this.hashingIntegers) {
    this.hashIntegerButton.checked = true;
    this.inputField.onkeydown = this.returnSubmit(
      this.inputField,
      this.insertCallback.bind(this),
      MAX_HASH_LENGTH,
      true,
    );
  } else {
    this.hashStringButton.checked = true;
    this.inputField.onkeydown = this.returnSubmit(
      this.inputField,
      this.insertCallback.bind(this),
      MAX_HASH_LENGTH,
      false,
    );
  }

  if (this.animateStringHashCheckbox) {
    this.animateStringHashCheckbox.disabled = this.hashingIntegers;
    // Keep the backing flag in sync.
    this.animateStringHashing = !!this.animateStringHashCheckbox.checked;
  }
  return this.resetAll();
};

Hash.prototype.doHash = function (input, justHash = false) {
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
      HASH_LABEL_Y,
    );
    this.cmd(
      "CreateLabel",
      labelID2,
      index,
      HASH_LABEL_X + HASH_LABEL_DELTA_X,
      HASH_LABEL_Y,
    );
    this.cmd("SetMessage", "Compute hash");
    this.cmd("Step");
    this.cmd(
      "CreateHighlightCircle",
      highlightID,
      HIGHLIGHT_COLOR,
      HASH_LABEL_X + HASH_LABEL_DELTA_X,
      HASH_LABEL_Y,
    );
    this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
    // this.cmd("SetMessage", "Highlight the computed bucket index");
    this.cmd("Step");
    this.cmd("Delete", labelID1);
    this.cmd("Delete", labelID2);
    this.cmd("Delete", highlightID);
    this.nextIndex -= 3;

    return index;
  } else {
    // Fast path: if string hashing animation is disabled, compute directly and
    // show only the final value + bucket.
    if (!this.animateStringHashing) {
      const str = String(input);
      const hashValue = new Array(32).fill(0);

      for (let i = str.length - 1; i >= 0; i--) {
        if (i < str.length - 1) {
          // Shift left by 4 bits before incorporating the next character.
          for (let j = 0; j < 28; j++) {
            hashValue[j] = hashValue[j + 4];
          }
          for (let j = 28; j < 32; j++) {
            hashValue[j] = 0;
          }
        }

        let nextChar = str.charCodeAt(i);
        for (let j = 7; j >= 0; j--) {
          const bit = nextChar % 2;
          nextChar = Math.floor(nextChar / 2);
          hashValue[j + 24] = hashValue[j + 24] ^ bit;
        }
      }

      this.currHash = 0;
      for (let j = 0; j < 32; j++) {
        this.currHash = this.currHash * 2 + hashValue[j];
      }

      const index = this.currHash % this.table_size;

      const labelID1 = this.nextIndex++;
      const labelID2 = this.nextIndex++;
      const highlightID = this.nextIndex++;

      this.cmd(
        "CreateLabel",
        labelID1,
        `hash(\"${str}\") = ${this.currHash}`,
        HASH_LABEL_X,
        HASH_LABEL_Y,
      );
      this.cmd(
        "CreateLabel",
        labelID2,
        `${this.currHash} % ${this.table_size} = ${index}`,
        HASH_LABEL_X,
        HASH_LABEL_Y + 20,
      );
      this.cmd(
        "CreateHighlightCircle",
        highlightID,
        HIGHLIGHT_COLOR,
        HASH_LABEL_X + HASH_LABEL_DELTA_X,
        HASH_LABEL_Y + 20,
      );
      this.cmd(
        "Move",
        highlightID,
        this.indexXPos[index],
        this.indexYPos[index],
      );
      this.cmd(
        "SetMessage",
        `Computed hash(\"${str}\") = ${this.currHash}`,
      );
      this.cmd("Step");

      this.cmd("Delete", labelID1);
      this.cmd("Delete", labelID2);
      this.cmd("Delete", highlightID);
      this.nextIndex -= 3;

      return index;
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
        0,
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
          0,
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
          0,
        );
        this.cmd(
          "Move",
          nextByteID[j],
          HASH_NUMBER_START_X + (j + 24) * HASH_X_DIFF,
          HASH_ADD_START_Y,
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
        "bottom",
      );
      this.cmd(
        "CreateLabel",
        operatorID,
        "XOR",
        HASH_NUMBER_START_X,
        HASH_ADD_START_Y,
        0,
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
          0,
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
          HASH_NUMBER_START_Y,
        );
      }
      this.cmd("SetMessage", "Copy result back into accumulator");
      this.cmd("Step");

      if (i > 0) {
        // Shift left by 4 bits before incorporating the next character.
        this.cmd(
          "SetMessage",
          "Shift accumulator left by 4 bits before next character",
        );
        for (j = 0; j < 32; j++) {
          this.cmd(
            "Move",
            resultDigits[j],
            HASH_NUMBER_START_X + (j - 4) * HASH_X_DIFF,
            HASH_NUMBER_START_Y,
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
        0,
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
      0,
    );
    this.cmd("SetMessage", "Convert final bits into an integer value. Result is " + this.currHash);
    this.cmd("Step");
    
    if(justHash) {
      return 0;
    }

    for (j = 0; j < 32; j++) {
      this.cmd("Delete", digits[j]);
    }

    var label2 = this.nextIndex++;
    this.cmd(
      "SetText",
      label1,
      String(this.currHash) + " % " + String(this.table_size) + " = ",
    );
    index = this.currHash % this.table_size;
    this.cmd(
      "CreateLabel",
      label2,
      index,
      HASH_NUMBER_START_X + 32 * HASH_X_DIFF + 105,
      HASH_NUMBER_START_Y,
      0,
    );
    this.cmd("SetMessage", "Compute final bucket = hash mod table size");
    this.cmd("Step");
    highlightID = this.nextIndex++;
    this.cmd(
      "CreateHighlightCircle",
      highlightID,
      HIGHLIGHT_COLOR,
      HASH_NUMBER_START_X + 30 * HASH_X_DIFF + 120,
      HASH_NUMBER_START_Y + 15,
    );
    this.cmd("Move", highlightID, this.indexXPos[index], this.indexYPos[index]);
    this.cmd("SetMessage", "Highlight the computed bucket index");
    this.cmd("Step");
    this.cmd("Delete", highlightID);
    this.cmd("Delete", label1);
    this.cmd("Delete", label2);
    //this.nextIndex = oldnextIndex;

    return index;
  }
};

Hash.prototype.resetAll = function () {
  if (this.inputField) this.inputField.value = "";
  return [];
};
Hash.prototype.insertCallback = function (event) {
  var insertedValue = this.inputField.value;
  if (insertedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.insertElement.bind(this), insertedValue);
  }
};

Hash.prototype.deleteCallback = function (event) {
  var deletedValue = this.inputField.value;
  if (deletedValue != "") {
    this.inputField.value = "";
    this.implementAction(this.deleteElement.bind(this), deletedValue);
  }
};

Hash.prototype.findCallback = function (event) {
  var findValue = this.inputField.value;
  if (findValue != "") {
    this.inputField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
  }
};

Hash.prototype.insertElement = function (elem) {};

Hash.prototype.deleteElement = function (elem) {};
Hash.prototype.findElement = function (elem) {};

// NEED TO OVERRIDE IN PARENT
Hash.prototype.reset = function () {
  this.hashIntegerButton.checked = true;
};

Hash.prototype.disableUI = function (event) {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = true;
  }
};

Hash.prototype.enableUI = function (event) {
  const ctrls = [
    this.inputField,
    this.insertButton,
    this.deleteButton,
    this.findButton,
  ];
  for (const el of ctrls) {
    if (el) el.disabled = false;
  }
};

/* no init, this is only a base class! 
var currentAlg;
function init()
{
	var animManag = initCanvas(canvas);
	currentAlg = new Hash(animManag, canvas.width, canvas.height);
}
*/
