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

// Global timer used for doing animation callbacks.

//  TODO:  Make this an instance variable of Animation Manager.
var timer;

import { EventListener } from "./CustomEvents.js";
import { ObjectManager } from "./ObjectManager.js";
import { UndoConnect } from "./Line.js";
import { normalizeAnimation, toBool, toColor } from "./AnimationSchema.js";
import { snapshotObjectManagerState } from "./AnimationState.js";
import { controlKey } from "../AlgorithmLibrary/Algorithm.js";
import * as Undo from "./UndoFunctions.js"; 


// Super hacky fix for crap added by pages that these ge embedded into in PreTeXt
document.querySelectorAll("div").forEach((el) => {
  el.style.aspectRatio = "";
});

// Utility funciton to read a cookie
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

// Utility funciton to write a cookie
function setCookie(cookieName, value, expireDays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expireDays);
  var cookieValue =
    escape(value) +
    (expireDays == null ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = cookieName + "=" + value;
}

// TODO:  Move these out of global space into animation manager?
var objectManager;
var animationManager;

var reporter;

var paused = false;
//var playPauseBackButton;
var skipBackButton;
var stepBackButton;
var stepForwardButton;
var skipForwardButton;
var scrubSlider;
var describeStatusRegion;

var keyboardStepListenerInstalled = false;
var ctrlWheelZoomListenerInstalled = false;
var pinchZoomListenerInstalled = false;
var ltiResizeListenerInstalled = false;

var zoomHoverTrackingInstalled = false;
var pendingZoomFocusClient = null;
var lastHoverClient = null;

const BASE_ZOOM_COOKIE_NAME = "VisualizationZoom";
var zoomCookieName = BASE_ZOOM_COOKIE_NAME;

var autoplayIntervalId = null;

function sanitizeCookieToken(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "default";
}

function deriveZoomCookieName(title, opts = null) {
  const explicitScope = opts && typeof opts.zoomCookieScope === "string"
    ? opts.zoomCookieScope
    : null;
  if (explicitScope && explicitScope.trim() !== "") {
    return `${BASE_ZOOM_COOKIE_NAME}_${sanitizeCookieToken(explicitScope)}`;
  }

  const path =
    (typeof window !== "undefined" && window.location && window.location.pathname) ||
    "";
  const lastSegment = path.split("/").filter(Boolean).pop() || "index";
  const pageToken = lastSegment.replace(/\.[^.]+$/, "");
  const fallbackTitle = title && String(title).trim() !== "" ? String(title) : "animation";
  const scope = pageToken || fallbackTitle;
  return `${BASE_ZOOM_COOKIE_NAME}_${sanitizeCookieToken(scope)}`;
}

function normalizeZoomValue(rawZoom) {
  let parsed = parseFloat(rawZoom);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  // Backward compatibility: previous zoom values were inverses where 1x = 4.
  if (parsed > 3) {
    parsed = 4 / parsed;
  }

  const allowedZoomValues = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];
  const isAllowed = allowedZoomValues.some((v) => Math.abs(v - parsed) < 1e-9);
  if (isAllowed) {
    return parsed;
  }

  return allowedZoomValues.reduce(
    (best, v) => (Math.abs(v - parsed) < Math.abs(best - parsed) ? v : best),
    allowedZoomValues[0],
  );
}

function installZoomHoverTracking(targetEl) {
  if (zoomHoverTrackingInstalled) return;
  zoomHoverTrackingInstalled = true;

  const el = targetEl || window;

  el.addEventListener("mousemove", (e) => {
    lastHoverClient = { x: e.clientX, y: e.clientY };
  });
}

function installLTIResizer() {
  if (ltiResizeListenerInstalled) return;
  ltiResizeListenerInstalled = true;
  let requestSizeChangeForLTI = function() {
    // console.log('Window resized inside the iframe!');
    if(!window.frameElement) return;
    const height = window.innerWidth > 600 ? '100%' : '600px';
    const data = { subject: 'lti.frameResize', message_id: window.frameElement.id, height: height }
    window.parent.postMessage(data, '*')
  };
  window.addEventListener('resize', requestSizeChangeForLTI);
  requestSizeChangeForLTI();
}

function getZoomSelect() {
  return document.getElementById("zoomLevel");
}

function stepZoomSelect(direction) {
  const zoomSelect = getZoomSelect();
  if (!zoomSelect || zoomSelect.disabled) return false;

  const curIndex = zoomSelect.selectedIndex;
  if (curIndex < 0) return false;

  const nextIndex = Math.max(
    0,
    Math.min(curIndex + direction, zoomSelect.options.length - 1),
  );
  if (nextIndex === curIndex) return false;

  zoomSelect.selectedIndex = nextIndex;
  zoomSelect.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

var widthEntry;
var heightEntry;
var sizeButton;

function returnSubmit(field, funct, maxsize, intOnly) {
  if (maxsize != undefined) {
    field.size = maxsize;
  }
  return function (event) {
    var keyASCII = 0;
    if (window.event) {
      // IE
      keyASCII = event.keyCode;
    } else if (event.which) {
      // Netscape/Firefox/Opera
      keyASCII = event.which;
    }

    if (keyASCII == 13) {
      funct();
      return false;
    } else if (
      keyASCII == 59 ||
      keyASCII == 45 ||
      keyASCII == 46 ||
      keyASCII == 190 ||
      keyASCII == 173
    ) {
      return false;
    } else if (
      (maxsize != undefined && field.value.length >= maxsize) ||
      (intOnly && (keyASCII < 48 || keyASCII > 57))
    ) {
      if (!controlKey(keyASCII)) return false;
    }
    return true;
  };
}

function animWaiting() {
  stepForwardButton.disabled = false;
  if (skipBackButton.disabled == false) {
    stepBackButton.disabled = false;
  }
  //reporter.innerHTML = "Animation Paused";
  // objectManager.statusReport.setText("Animation Paused");
  // objectManager.statusReport.setForegroundColor("#FF0000");
}

function animReady() {
  skipForwardButton.disabled = false;
  skipBackButton.disabled = true;
  stepForwardButton.disabled = false;
  stepBackButton.disabled = true;
  //reporter.innerHTML = "Animation Running";
  // objectManager.statusReport.setText("Animation Running");
  // objectManager.statusReport.setForegroundColor("#009900");
}

function animStarted() {
  skipForwardButton.disabled = false;
  skipBackButton.disabled = false;
  stepForwardButton.disabled = true;
  stepBackButton.disabled = true;
  //reporter.innerHTML = "Animation Running";
  // objectManager.statusReport.setText("Animation Running");
  // objectManager.statusReport.setForegroundColor("#009900");
}

function animEnded() {
  skipForwardButton.disabled = true;
  stepForwardButton.disabled = true;
  if (skipBackButton.disabled == false && paused) {
    stepBackButton.disabled = false;
  }
  //reporter.innerHTML = "";
  //objectManager.statusReport.setText("");
  //objectManager.statusReport.setForegroundColor("#000000");
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
  // We need to set the timeout *first*, otherwise if we
  // try to clear it later, we get behavior we don't want ...
  timer = setTimeout(timeoutFn, 30);
  animationManager.update();
  //objectManager.draw();
}

function doStep() {
  animationManager.step();
}

function doSkip() {
  animationManager.skipForward();
}

function doSkipBack() {
  animationManager.skipBack();
}

function doStepBack() {
  animationManager.stepBack();
}

function getStructureDescription(manager) {
  if (!manager || !manager.currentAlgorithm) {
    return null;
  }

  const algorithm = manager.currentAlgorithm;

  try {
    if (
      typeof algorithm.describeFromState === "function" &&
      typeof manager.getPlaybackAnimationState === "function"
    ) {
      const state = manager.getPlaybackAnimationState();
      return algorithm.describeFromState(state, manager);
    }
    if (typeof algorithm.describe === "function") {
      return algorithm.describe();
    }
  } catch (e) {
    console.warn("Unable to describe current animation state.", e);
  }

  return null;
}

function describeCurrentStructure() {
  if (!animationManager || !animationManager.currentAlgorithm) {
    console.warn("Current animation does not provide a describe() method.");
    return;
  }

  const description = getStructureDescription(animationManager);
  if (description == null) {
    console.warn("Current animation does not provide a describe() method.");
    return;
  }
  console.log("Current structure description:", description);

  if (!describeStatusRegion) return;

  describeStatusRegion.textContent = "";
  requestAnimationFrame(() => {
    describeStatusRegion.textContent = description;
  });
}

export function doPlayPause() {
  paused = !paused;
  animationManager.SetPaused(paused);
}

function makeInput(type, value, title, id) {
  var element = document.createElement("input");
  element.setAttribute("type", type);
  element.setAttribute("value", value);
  if (title != null && title !== "")
  element.setAttribute("title", title);
  if (id != null && id !== "") element.id = id;
  return element;
}

function addControlTo(element, parent, label) {
  let trueParent = parent;
  if (label) {
    var labelEl = document.createElement("label");
    labelEl.innerHTML = label;
    labelEl.id = element.id + "Label";
    if(element.id)
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

const SPEED_LABELS = ["Off", "Slow", "Medium", "Fast", "Max"];
const SPEED_LABEL_TO_VALUE = {
  Off: "step",
  Slow: 10,
  Medium: 4,
  Fast: 2,
  Max: 1,
};

function normalizeSpeedLabel(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;

  // Back-compat: old storage used "step" or numeric values.
  if (s.toLowerCase() === "step" || s.toLowerCase() === "off") {
    return "Off";
  }

  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    if (n === 10) return "Slow";
    if (n === 4) return "Medium";
    if (n === 2) return "Fast";
    if (n === 1) return "Max";
    return null;
  }

  // Case-insensitive match on labels
  const lower = s.toLowerCase();
  for (const label of SPEED_LABELS) {
    if (label.toLowerCase() === lower) return label;
  }
  return null;
}

function prefersReducedMotion(opts = null) {
  if (opts && typeof opts.reducedMotion === "boolean") {
    return opts.reducedMotion;
  }
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function speedChange(speed) {
  const label = normalizeSpeedLabel(speed) ?? "Off";
  const mapped = SPEED_LABEL_TO_VALUE[label] ?? "step";
  const reducedMotion = prefersReducedMotion(animationManager?.opts);

  if (mapped === "step") {
    animationManager.SetPaused(true);
    animationManager.SetSpeed(reducedMotion ? 0 : 1);
  } else {
    animationManager.SetPaused(false);
    animationManager.SetSpeed(mapped);
  }
}

function makeDiv(id, classes, parent) {
  var element = document.createElement("div");
  element.setAttribute("id", id);
  if(classes != "")
    element.setAttribute("class", classes);
  parent.appendChild(element);
  return element;
}

function addGeneralControls(objectManager, targetElement, title, opts = null) {
  if (targetElement == null) {
    targetElement = document.body;
  }

  let animationDiv = makeDiv("animationSurround", "", targetElement);
  animationDiv.setAttribute("aria-keyshortcuts", "Control+D");
  animationDiv.addEventListener("keydown", (e) => {
    if (
      e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      String(e.key).toLowerCase() === "d"
    ) {
      e.preventDefault();
      e.stopPropagation();
      describeCurrentStructure();
    }
  });

  describeStatusRegion = makeDiv("visualizationStatus", "visually-hidden", animationDiv);
  describeStatusRegion.setAttribute("role", "status");
  describeStatusRegion.setAttribute("aria-live", "polite");
  describeStatusRegion.setAttribute("aria-atomic", "true");

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

  // Thin scrub slider under step buttons
  scrubSlider = document.createElement("input");
  scrubSlider.type = "range";
  scrubSlider.id = "scrubSlider";
  scrubSlider.min = "1";
  scrubSlider.max = "0"; // will be set when animation loads
  scrubSlider.value = "0";
  scrubSlider.step = "1";
  scrubSlider.disabled = true;
  scrubSlider.style.width = "100%";
  scrubSlider.style.marginTop = "6px";
  scrubSlider.style.height = "4px";
  scrubSlider.style.cursor = "pointer";
  scrubSlider.ariaLabel = "Animation Scrubber";
  controlBar.appendChild(scrubSlider);

  // Autoplay control (below step buttons)
  // const autoplayRow = document.createElement("div");
  // autoplayRow.className = "autoplayRow";
  // controlBar.appendChild(autoplayRow);

  // const autoplayCheckbox = document.createElement("input");
  // autoplayCheckbox.type = "checkbox";
  // autoplayCheckbox.id = "autoplayCheckbox";
  // autoplayRow.appendChild(autoplayCheckbox);

  // const autoplayLabel = document.createElement("label");
  // autoplayLabel.setAttribute("for", autoplayCheckbox.id);
  // autoplayLabel.textContent = "Autoplay";
  // autoplayRow.appendChild(autoplayLabel);

  // autoplayCheckbox.addEventListener("change", () => {
  //   if (autoplayIntervalId != null) {
  //     clearInterval(autoplayIntervalId);
  //     autoplayIntervalId = null;
  //   }

  //   if (!autoplayCheckbox.checked) return;

  //   autoplayIntervalId = setInterval(() => {
  //     if (stepForwardButton && !stepForwardButton.disabled) {
  //       stepForwardButton.click();
  //     }
  //   }, 2000);
  // });

  var speedSelect = document.createElement("select");
  speedSelect.setAttribute("id", "animationSpeed");
  speedSelect.setAttribute("name", "animationSpeed");

  speedSelect.innerHTML = `
    <option value="Off">Off</option>
    <option value="Slow">Slow</option>
    <option value="Medium">Medium</option>
    <option value="Fast">Fast</option>
    <option value="Max">Max</option>`;

  // Initialize speed from opts (highest priority), else default to "Off".
  // (Speed selection is no longer persisted in cookies.)
  const optsLabel = opts ? normalizeSpeedLabel(opts.speed) : null;
  const initialLabel = optsLabel ?? "Off";

  speedSelect.value = initialLabel;
  speedChange(initialLabel);

  speedSelect.addEventListener("change", (e) => {
    speedChange(e.target.value);
  });

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionQuery.addEventListener?.("change", () => {
      if (speedSelect.value === "Off") {
        speedChange(speedSelect.value);
      }
    });
  }
  addControlTo(speedSelect, controlBar, "Auto Step Speed");

  zoomCookieName = deriveZoomCookieName(title, opts);

  var zoom = getCookie(zoomCookieName);
  if (zoom == undefined || zoom === null || zoom === "") {
    // Backward compatibility: if a legacy global cookie exists, keep honoring it.
    zoom = getCookie(BASE_ZOOM_COOKIE_NAME);
  }
  zoom = normalizeZoomValue(zoom);
  objectManager.setZoom(zoom);

  var zoomSelect = document.createElement("select");
  zoomSelect.setAttribute("id", "zoomLevel");
  zoomSelect.setAttribute("name", "zoomLevel");
  zoomSelect.innerHTML = `
    <option value="0.25" ${zoom == 0.25 ? "selected" : ""}>0.25x</option>
    <option value="0.5" ${zoom == 0.5 ? "selected" : ""}>0.5x</option>
    <option value="0.75" ${zoom == 0.75 ? "selected" : ""}>0.75x</option>
    <option value="1" ${zoom == 1 ? "selected" : ""}>1x</option>
    <option value="1.5" ${zoom == 1.5 ? "selected" : ""}>1.5x</option>
    <option value="2" ${zoom == 2 ? "selected" : ""}>2x</option>
    <option value="3" ${zoom == 3 ? "selected" : ""}>3x</option>`;

  zoomSelect.addEventListener("change", (e) => {
    setCookie(zoomCookieName, e.target.value);

    let focus = pendingZoomFocusClient;
    pendingZoomFocusClient = null;

    if (!focus && lastHoverClient && objectManager && objectManager.svg) {
      const rect = objectManager.svg.getBoundingClientRect();
      const inSvg =
        rect.width > 0 &&
        rect.height > 0 &&
        lastHoverClient.x >= rect.left &&
        lastHoverClient.x <= rect.right &&
        lastHoverClient.y >= rect.top &&
        lastHoverClient.y <= rect.bottom;

      if (inSvg) {
        focus = lastHoverClient;
      }
    }

    if (focus) {
      objectManager.setZoom(e.target.value, focus.x, focus.y);
    } else {
      objectManager.setZoom(e.target.value);
    }
  });
  addControlTo(zoomSelect, controlBar, "Zoom");
  
  var resetButton = addControlTo(makeInput("Button", "Reset Animation", "Reset Animation", "resetButton"), controlBar);
  resetButton.onclick = function () {
    window.location.reload();
  };

  var msgBoxLabel = document.createElement("label");
  msgBoxLabel.setAttribute("for", "message");
  msgBoxLabel.textContent = "Message:";
  controlBar.appendChild(msgBoxLabel);

  var msgBox = document.createElement("textarea");
  msgBox.setAttribute("readonly", "readonly");
  msgBox.setAttribute("id", "message");
  msgBox.setAttribute("aria-live", "polite");
  msgBox.setAttribute("rows", "4");
  controlBar.appendChild(msgBox);

}

function applyAutoZoomForMinVisibleWidth(minVisibleWorldWidth) {
  return;
  if (!objectManager || !objectManager.svg) return;
  const minWidth =
    Number.isFinite(minVisibleWorldWidth) && minVisibleWorldWidth > 0
      ? minVisibleWorldWidth
      : 800;

  const rect = objectManager.svg.getBoundingClientRect();
  if (!rect || rect.width <= 0 || rect.height <= 0) return;

  const baseW = objectManager.svgBaseViewWidth;
  const baseH = objectManager.svgBaseViewHeight;
  if (!Number.isFinite(baseW) || !Number.isFinite(baseH) || baseW <= 0 || baseH <= 0) {
    return;
  }

  // With preserveAspectRatio="... slice", the visible world width is:
  // visibleW(Z) = Z * min(baseW, rect.width * baseH / rect.height)
  // where Z is objectManager.svgZoom.
  const minTerm = Math.min(baseW, (rect.width * baseH) / rect.height);
  if (!Number.isFinite(minTerm) || minTerm <= 0) return;

  const requiredZoom = minWidth / minTerm;
  if (!Number.isFinite(requiredZoom) || requiredZoom <= 0) return;

  // Only zoom out (increase viewBox) when needed.
  if (requiredZoom <= objectManager.svgZoom) return;

  let chosenZoom = requiredZoom;
  const zoomSelect = getZoomSelect();
  if (zoomSelect && zoomSelect.options && zoomSelect.options.length > 0) {
    const optionValues = Array.from(zoomSelect.options)
      .map((o) => parseFloat(o.value))
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);

    if (optionValues.length > 0) {
      chosenZoom = optionValues.find((v) => v >= requiredZoom) ?? optionValues[optionValues.length - 1];
      zoomSelect.value = String(chosenZoom);
    }
  }

  setCookie(zoomCookieName, chosenZoom);
  objectManager.setZoom(chosenZoom);
}

function installKeyboardStepControls() {
  if (keyboardStepListenerInstalled) return;
  keyboardStepListenerInstalled = true;

  window.addEventListener("keydown", (e) => {
    if (e.defaultPrevented) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

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
  if (ctrlWheelZoomListenerInstalled) return;
  ctrlWheelZoomListenerInstalled = true;

  window.addEventListener(
    "wheel",
    (e) => {
      if (!e.ctrlKey) return;

      // Ctrl+wheel normally zooms the browser page; we override that to control
      // the visualization zoom selector.
      e.preventDefault();

      // In this UI, smaller numeric values (e.g., 0.5) mean "zoom in".
      // Scroll up (deltaY < 0) => zoom in => move forward in the option list.
      if (e.deltaY < 0) {
        pendingZoomFocusClient = { x: e.clientX, y: e.clientY };
        stepZoomSelect(+1);
      } else if (e.deltaY > 0) {
        pendingZoomFocusClient = { x: e.clientX, y: e.clientY };
        stepZoomSelect(-1);
      }
    },
    { passive: false },
  );
}

function installPinchZoomControls(targetEl) {
  if (pinchZoomListenerInstalled) return;
  pinchZoomListenerInstalled = true;

  let lastDistance = null;

  function touchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  const el = targetEl || window;

  // Only respond to two-finger touches (pinch). This avoids interfering with
  // one-finger drag logic on the SVG.
  el.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || e.touches.length !== 2) return;
      lastDistance = touchDistance(e.touches[0], e.touches[1]);
    },
    { passive: true },
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

      // Discrete zoom selector: step when pinch changes enough.
      const ZOOM_IN_THRESHOLD = 1.08;
      const ZOOM_OUT_THRESHOLD = 0.92;

      if (dist > lastDistance * ZOOM_IN_THRESHOLD) {
        pendingZoomFocusClient = { x: midX, y: midY };
        if (stepZoomSelect(+1)) {
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
    { passive: false },
  );

  el.addEventListener(
    "touchend",
    (e) => {
      if (!e.touches || e.touches.length < 2) {
        lastDistance = null;
      }
    },
    { passive: true },
  );
}

export function initAnimationManager(opts) {
  let canvas = opts.canvas || document.createElement("canvas");
  let targetElement = opts.target || null;
  let centered = opts.centered || false;
  let am = initCanvas(canvas, targetElement, opts.title, centered, opts);

  if(opts.zoom) {
    am.setZoom(opts.zoom);
  }

  let desiredHeight = opts.height || 350;

  if(opts.singleMode) {
    am.setSingleMode(true);
    desiredHeight = opts.heightSingleMode;
  }

  if(innerWidth < 450) {
    if(opts.singleMode)
      desiredHeight = opts.heightMobileSingle || opts.heightMobile || 400;
    else
      desiredHeight = opts.heightMobile || 400;
  }

  am.requestHeight(desiredHeight);

  return am;
}

export function initCanvas(canvas, targetElement=null, title="", centered = false, opts = null) {
  //Dynamically add css file
  let link = document.createElement('link')
  link.rel = 'stylesheet'
  let curURL = import.meta.url;
  link.href = curURL.slice(0, curURL.lastIndexOf('/')) + '/entry.css';
  document.head.appendChild(link)

  // Establish a logical coordinate system for the SVG viewBox.
  // ObjectManager uses canvas.width/height as the base viewBox size.
  const desiredViewWidth = (opts && Number.isFinite(opts.viewWidth) && opts.viewWidth > 0)
    ? opts.viewWidth
    : ((opts && Number.isFinite(opts.width) && opts.width > 0) ? opts.width : 800);
  const desiredViewHeight = (opts && Number.isFinite(opts.viewHeight) && opts.viewHeight > 0)
    ? opts.viewHeight
    : ((opts && Number.isFinite(opts.height) && opts.height > 0) ? opts.height : 400);

  if (!Number.isFinite(canvas.width) || canvas.width <= 0) {
    canvas.width = desiredViewWidth;
  }
  if (!Number.isFinite(canvas.height) || canvas.height <= 0) {
    canvas.height = desiredViewHeight;
  }

  canvas.style.width = canvas.width + "px";
  canvas.style.height = canvas.height + "px";

  objectManager = new ObjectManager(canvas, centered);
  
  animationManager = new AnimationManager(objectManager, canvas);
  animationManager.opts = opts || {};
  animationManager.accessibleTitle = title || "Interactive visualization";
  objectManager.setAccessibleText(animationManager.accessibleTitle);
  addGeneralControls(objectManager, targetElement, title, opts);

  var controlBar = document.getElementById("algoControlSection");
  var svgWrapper = document.createElement("div");
  svgWrapper.id = "animationViewport";
  svgWrapper.appendChild(objectManager.svg);
  controlBar.after(svgWrapper);

  // After layout, adjust initial zoom so at least 800 logical px are visible.
  // (This primarily helps narrow viewports where preserveAspectRatio="slice" crops width.)
  requestAnimationFrame(() => applyAutoZoomForMinVisibleWidth(800));

  animationManager.addListener("AnimationReady", this, animReady);
  animationManager.addListener("AnimationStarted", this, animStarted);
  animationManager.addListener("AnimationEnded", this, animEnded);
  animationManager.addListener("AnimationWaiting", this, animWaiting);
  animationManager.addListener(
    "AnimationUndoUnavailable",
    this,
    animUndoUnavailable,
  );
  animationManager.addListener(
    "AnimationAdvanceUnavailable",
    this,
    animAdvanceUnavailable,
  );

  skipBackButton.onclick = animationManager.skipBack.bind(animationManager);
  stepBackButton.onclick = animationManager.stepBack.bind(animationManager);
  stepForwardButton.onclick = animationManager.step.bind(animationManager);
  skipForwardButton.onclick =
    animationManager.skipForward.bind(animationManager);

  // Attach slider to manager and enable scrubbing
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

function AnimationManager(objectManager, canvas) {
  // Holder for all animated objects.
  // All animation is done by manipulating objects in\
  // this container
  this.animatedObjects = objectManager;
  this.canvas = canvas;
  this.opts = null;

  // Control variables for stopping / starting animation

  this.animationPaused = false;
  this.awaitingStep = false;
  this.currentlyAnimating = false;

  // Playing a single animation
  this.singleMode = false;

  // Array holding canonical animation blocks.
  // currentAnimation is an index into this array.
  this.AnimationSteps = [];
  this.currentAnimation = 0;

  // Scrub slider integration
  this.scrubSlider = null;
  this.totalBlocks = 0;
  this.currentBlockIndex = 0;

  this.previousAnimationSteps = [];

  // Control variables for where we are in the current animation block.
  //  currFrame holds the frame number of the current animation block,
  //  while animationBlockLength holds the length of the current animation
  //  block (in frame numbers).
  this.currFrame = 0;
  this.animationBlockLength = 0;

  // The number of frames per animation
  this.baseFramesPerAnimation = 10;

  //  The animation block that is currently running.  Array of singleAnimations
  this.currentBlock = null;

  /////////////////////////////////////
  // Variables for handling undo.
  ////////////////////////////////////
  //  A stack of UndoBlock objects (subclassed, UndoBlock is an abstract base class)
  //  each of which can undo a single animation element
  this.undoStack = [];
  this.doingUndo = false;

  // A stack containing the beginning of each animation block, as an index
  // into the AnimationSteps array
  this.undoAnimationStepIndices = [];
  this.undoAnimationStepIndicesStack = [];

  this.animationBlockLength = 10;

  this.lerp = function (from, to, percent) {
    return (to - from) * percent + from;
  };

  // Pause / unpause animation
  this.SetPaused = function (pausedValue) {
    this.animationPaused = pausedValue;
    paused = pausedValue;
    if (!this.animationPaused) {
      this.step();
    }
  };

  // Set the speed of the animation, from 0 (slow) to this.max_duration (fast)
  this.SetSpeed = function (newSpeed) {
    this.animationBlockLength = Math.max((this.baseFramesPerAnimation * newSpeed), 0);
  };
  
  this.requestHeight = function (newHeight) {
    // if(!window.frameElement) return;
    // const data = { subject: 'lti.frameResize', message_id: window.frameElement.id, height: newHeight }
    // window.parent.postMessage(data, '*')
  }

  this.setZoom = function (newZoom) {
    let zoomSelect = document.getElementById("zoomLevel");
    let opts = zoomSelect.options;
    for(let o of opts) {
      if (o.innerText == newZoom) {
        o.selected = true;
        objectManager.setZoom(o.value);
        break;
      }
    }
  }

  this.refreshDescribeButton = function () {
    this.refreshAccessibleDescription();
  };

  this.refreshAccessibleDescription = function () {
    if (!this.animatedObjects || typeof this.animatedObjects.setAccessibleText !== "function") {
      return;
    }

    this.animatedObjects.setAccessibleText(
      this.accessibleTitle,
      getStructureDescription(this),
    );
  };

  this.getPlaybackAnimationState = function () {
    return snapshotObjectManagerState(this.animatedObjects);
  };

  this.shift = function (deltaX = 0, deltaY = 0) {
    this.animatedObjects.shiftView(deltaX, deltaY);
  }

  this.parseBool = function (str) {
    return toBool(str);
  };

  this.parseColor = function (clr) {
    return toColor(clr);
  };

  this.executeAnimationStep = function (step, undoBlock) {
    let animated = false;

    if (step.type === "createCircle") {
      this.animatedObjects.addCircleObject(step.id, step.label);
      if (step.x != null && step.y != null) {
        this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      }
      undoBlock.push(new Undo.UndoCreate(step.id));
    } else if (step.type === "connect") {
      this.animatedObjects.connectEdge(
        step.from,
        step.to,
        step.color,
        step.curve,
        step.directed,
        step.label,
        step.connectionPoint,
      );
      undoBlock.push(new UndoConnect(step.from, step.to, false));
    } else if (step.type === "createRectangle") {
      this.animatedObjects.addRectangleObject(
        step.id,
        step.label,
        step.width,
        step.height,
        step.xJustify,
        step.yJustify,
        "#ffffff",
        "#000000",
      );
      if (step.x != null && step.y != null) {
        this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      }
      undoBlock.push(new Undo.UndoCreate(step.id));
    } else if (step.type === "move") {
      const nextAnim = new SingleAnimation(
        step.objectId,
        this.animatedObjects.getNodeX(step.objectId),
        this.animatedObjects.getNodeY(step.objectId),
        step.toX,
        step.toY,
      );
      this.currentBlock.push(nextAnim);
      undoBlock.push(
        new Undo.UndoMove(
          nextAnim.objectID,
          nextAnim.toX,
          nextAnim.toY,
          nextAnim.fromX,
          nextAnim.fromY,
        ),
      );
      animated = true;
    } else if (step.type === "moveToAlignRight") {
      const newXY = this.animatedObjects.getAlignRightPos(step.objectId, step.otherId);
      const nextAnim = new SingleAnimation(
        step.objectId,
        this.animatedObjects.getNodeX(step.objectId),
        this.animatedObjects.getNodeY(step.objectId),
        newXY[0],
        newXY[1],
      );
      this.currentBlock.push(nextAnim);
      undoBlock.push(
        new Undo.UndoMove(
          nextAnim.objectID,
          nextAnim.toX,
          nextAnim.toY,
          nextAnim.fromX,
          nextAnim.fromY,
        ),
      );
      animated = true;
    } else if (step.type === "setForegroundColor") {
      const oldColor = this.animatedObjects.foregroundColor(step.id);
      this.animatedObjects.setForegroundColor(step.id, step.color);
      undoBlock.push(new Undo.UndoSetForegroundColor(step.id, oldColor));
    } else if (step.type === "setBackgroundColor") {
      const oldColor = this.animatedObjects.backgroundColor(step.id);
      this.animatedObjects.setBackgroundColor(step.id, step.color);
      undoBlock.push(new Undo.UndoSetBackgroundColor(step.id, oldColor));
    } else if (step.type === "setHighlight") {
      const oldHighlight = this.animatedObjects.getHighlight(step.id);
      this.animatedObjects.setHighlight(step.id, step.value);
      undoBlock.push(new Undo.UndoHighlight(step.id, oldHighlight));
    } else if (step.type === "disconnect") {
      const undoConnect = this.animatedObjects.disconnect(step.from, step.to);
      if (undoConnect != null) {
        undoBlock.push(undoConnect);
      }
    } else if (step.type === "setAlpha") {
      const oldAlpha = this.animatedObjects.getAlpha(step.id);
      this.animatedObjects.setAlpha(step.id, step.alpha);
      undoBlock.push(new Undo.UndoSetAlpha(step.id, oldAlpha));
    } else if (step.type === "setMessage") {
      const oldText = document.getElementById("message").value;
      document.getElementById("message").value = step.message;
      if (oldText != undefined) {
        undoBlock.push(new Undo.UndoSetMessage(oldText));
      }
    } else if (step.type === "setText") {
      const oldText = this.animatedObjects.getText(step.id, step.index);
      this.animatedObjects.setText(step.id, step.text, step.index);
      if (step.id === 0) {
        document.getElementById("message").value = step.text;
      }
      if (oldText != undefined) {
        undoBlock.push(new Undo.UndoSetText(step.id, oldText, step.index));
      }
    } else if (step.type === "delete") {
      const removedEdges = this.animatedObjects.deleteIncident(step.id);
      if (removedEdges.length > 0) {
        undoBlock = undoBlock.concat(removedEdges);
      }
      const obj = this.animatedObjects.getObject(step.id);
      if (obj != null) {
        undoBlock.push(obj.createUndoDelete());
        this.animatedObjects.removeObject(step.id);
      }
    } else if (step.type === "createHighlightCircle") {
      this.animatedObjects.addHighlightCircleObject(step.id, step.color, step.radius);
      if (step.x != null && step.y != null) {
        this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      }
      undoBlock.push(new Undo.UndoCreate(step.id));
      this.animatedObjects.draw();
    } else if (step.type === "createLabel") {
      this.animatedObjects.addLabelObject(step.id, step.text, step.centered, step.fontSizePercent);
      if (step.x != null && step.y != null) {
        this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      }
      undoBlock.push(new Undo.UndoCreate(step.id));
    } else if (step.type === "setEdgeColor") {
      const oldColor = this.animatedObjects.setEdgeColor(step.from, step.to, step.color);
      undoBlock.push(new Undo.UndoSetEdgeColor(step.from, step.to, oldColor));
    } else if (step.type === "setEdgeAlpha") {
      const oldAlpha = this.animatedObjects.setEdgeAlpha(step.from, step.to, step.alpha);
      undoBlock.push(new Undo.UndoSetEdgeAlpha(step.from, step.to, oldAlpha));
    } else if (step.type === "setEdgeHighlight") {
      const oldHighlight = this.animatedObjects.setEdgeHighlight(step.from, step.to, step.value);
      undoBlock.push(new Undo.UndoHighlightEdge(step.from, step.to, oldHighlight));
    } else if (step.type === "setHeight") {
      const oldHeight = this.animatedObjects.getHeight(step.id);
      this.animatedObjects.setHeight(step.id, step.height);
      undoBlock.push(new Undo.UndoSetHeight(step.id, oldHeight));
    } else if (step.type === "setLayer") {
      this.animatedObjects.setLayer(step.id, step.layer);
    } else if (step.type === "createLinkedList") {
      this.animatedObjects.addLinkedListObject(
        step.id,
        step.label,
        step.width,
        step.height,
        step.linkPercent,
        step.vertical,
        step.linkAtEnd,
        step.numLabels,
        step.numLinks,
        step.backgroundColor,
        step.foregroundColor,
      );
      if (step.x != null && step.y != null) {
        this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      }
      undoBlock.push(new Undo.UndoCreate(step.id));
    } else if (step.type === "setNull") {
      const oldNull = this.animatedObjects.getNull(step.id, step.index);
      this.animatedObjects.setNull(step.id, step.value, step.index);
      undoBlock.push(new Undo.UndoSetNull(step.id, oldNull, step.index));
    } else if (step.type === "setTextColor") {
      const oldColor = this.animatedObjects.getTextColor(step.id, step.index);
      this.animatedObjects.setTextColor(step.id, step.color, step.index);
      undoBlock.push(new Undo.UndoSetTextColor(step.id, oldColor, step.index));
    } else if (step.type === "createBTreeNode") {
      this.animatedObjects.addBTreeNode(
        step.id,
        step.widthPerElement,
        step.height,
        step.numElems,
        step.backgroundColor,
        step.foregroundColor,
      );
      this.animatedObjects.setNodePosition(step.id, step.x, step.y);
      undoBlock.push(new Undo.UndoCreate(step.id));
    } else if (step.type === "setWidth") {
      const oldWidth = this.animatedObjects.getWidth(step.id);
      this.animatedObjects.setWidth(step.id, step.width);
      undoBlock.push(new Undo.UndoSetWidth(step.id, oldWidth));
    } else if (step.type === "setLineDash") {
      const oldLineDash = this.animatedObjects.getLineDash(step.id);
      this.animatedObjects.setLineDash(step.id, step.lineDash);
      undoBlock.push(new Undo.UndoSetLineDash(step.id, oldLineDash));
    } else if (step.type === "setNumElements") {
      const oldElem = this.animatedObjects.getObject(step.id);
      undoBlock.push(new Undo.UndoSetNumElements(oldElem, step.count));
      this.animatedObjects.setNumElements(step.id, step.count);
    } else if (step.type === "setPosition") {
      const oldX = this.animatedObjects.getNodeX(step.id);
      const oldY = this.animatedObjects.getNodeY(step.id);
      undoBlock.push(new Undo.UndoSetPosition(step.id, oldX, oldY));
      this.animatedObjects.setNodePosition(step.id, step.x, step.y);
    } else if (step.type === "alignRight") {
      const oldX = this.animatedObjects.getNodeX(step.id);
      const oldY = this.animatedObjects.getNodeY(step.id);
      undoBlock.push(new Undo.UndoSetPosition(step.id, oldX, oldY));
      this.animatedObjects.alignRight(step.id, step.otherId);
    } else if (step.type === "alignLeft") {
      const oldX = this.animatedObjects.getNodeX(step.id);
      const oldY = this.animatedObjects.getNodeY(step.id);
      undoBlock.push(new Undo.UndoSetPosition(step.id, oldX, oldY));
      this.animatedObjects.alignLeft(step.id, step.otherId);
    } else if (step.type === "alignTop") {
      const oldX = this.animatedObjects.getNodeX(step.id);
      const oldY = this.animatedObjects.getNodeY(step.id);
      undoBlock.push(new Undo.UndoSetPosition(step.id, oldX, oldY));
      this.animatedObjects.alignTop(step.id, step.otherId);
    } else if (step.type === "alignBottom") {
      const oldX = this.animatedObjects.getNodeX(step.id);
      const oldY = this.animatedObjects.getNodeY(step.id);
      undoBlock.push(new Undo.UndoSetPosition(step.id, oldX, oldY));
      this.animatedObjects.alignBottom(step.id, step.otherId);
    } else if (step.type === "setHighlightIndex") {
      const oldIndex = this.animatedObjects.getHighlightIndex(step.id);
      undoBlock.push(new Undo.UndoSetHighlightIndex(step.id, oldIndex));
      this.animatedObjects.setHighlightIndex(step.id, step.index);
    } else {
      throw new Error(`Unknown animation step type: ${step.type}`);
    }

    return { undoBlock, animated };
  };

  this.changeSize = function () {
    // var width = parseInt(widthEntry.value);
    // var height = parseInt(heightEntry.value);
    // if (width > 100) {
    //   this.canvas.width = width;
    //   this.animatedObjects.width = width;
    //   setCookie("VisualizationWidth", String(width), 30);
    // }
    // if (height > 100) {
    //   this.canvas.height = height;
    //   this.animatedObjects.height = height;
    //   setCookie("VisualizationHeight", String(height), 30);
    // }
    // widthEntry.value = this.canvas.width;
    // heightEntry.value = this.canvas.height;
    // this.animatedObjects.draw();
    // this.fireEvent("CanvasSizeChanged", {
    //   width: this.canvas.width,
    //   height: this.canvas.height,
    // });
  };

  this.startNextBlock = function () {
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
      // Update scrub slider at end
      this.currentBlockIndex = this.totalBlocks;
      this.updateScrubUI();
      this.refreshAccessibleDescription();
      return;
    }
    this.undoAnimationStepIndices.push(this.currentAnimation);

    var anyAnimations = false;
    const block = this.AnimationSteps[this.currentAnimation];
    for (const step of block.steps) {
      const result = this.executeAnimationStep(step, undoBlock);
      undoBlock = result.undoBlock;
      anyAnimations = anyAnimations || result.animated;
    }
    this.currentAnimation = this.currentAnimation + 1;
    this.currFrame = 0;

    // Hack:  If there are not any animations, and we are currently paused,
    // then set the current frame to the end of the anumation, so that we will
    // advance immediagely upon the next step button.  If we are not paused, then
    // animate as normal.

    if (
      (!anyAnimations && this.animationPaused) ||
      (!anyAnimations && this.currentAnimation == this.AnimationSteps.length)
    ) {
      this.currFrame = this.animationBlockLength;
    }

    // If this block had no animated movement, we still need to render the
    // effects of instantaneous commands (Create/Connect/SetMessage/etc.).
    // Otherwise, auto-stepping can advance past states the user never sees.
    if (!anyAnimations) {
      this.animatedObjects.draw();
    }

    this.undoStack.push(undoBlock);
    // Advance scrub slider to next block
    this.currentBlockIndex = Math.min(this.currentBlockIndex + 1, this.totalBlocks);
    this.updateScrubUI();
    this.refreshAccessibleDescription();
  };

  //  Start a new animation. The input can be legacy flat commands or canonical blocks.
  this.StartNewAnimation = function (commands) {
    clearTimeout(timer);
    if (this.AnimationSteps != null) {
      this.previousAnimationSteps.push(this.AnimationSteps);
      this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
    }
    this.AnimationSteps = normalizeAnimation(commands);
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

  // Step backwards one step.  A no-op if the animation is not currently paused
  this.stepBack = function () {
    if (
      this.awaitingStep &&
      this.undoStack != null &&
      this.undoStack.length != 0
    ) {
      //  TODO:  Get events working correctly!
      this.fireEvent("AnimationStarted", "NoData");
      clearTimeout(timer);

      this.awaitingStep = false;
      this.undoLastBlock();
      // Re-kick thie timer.  The timer may or may not be running at this point,
      // so to be safe we'll kill it and start it again.
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    } else if (
      !this.currentlyAnimating &&
      this.animationPaused &&
      this.undoAnimationStepIndices != null
    ) {
      this.fireEvent("AnimationStarted", "NoData");
      this.currentlyAnimating = true;
      this.undoLastBlock();
      // Re-kick thie timer.  The timer may or may not be running at this point,
      // so to be safe we'll kill it and start it again.
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    } else {
      this.fireEvent("AnimationReady", "NoData");
    }
  };
  // Step forwards one step.  A no-op if the animation is not currently paused
  this.step = function () {
    if (this.awaitingStep) {
      this.startNextBlock();
      this.fireEvent("AnimationStarted", "NoData");
      this.currentlyAnimating = true;
      // Re-kick thie timer.  The timer should be going now, but we've had some difficulty with
      // it timing itself out, so we'll be safe and kick it now.
      clearTimeout(timer);
      timer = setTimeout(timeoutFn, 30);
    }
  };

  /// WARNING:  Could be dangerous to call while an animation is running ...
  this.clearHistory = function () {
    this.undoStack = [];
    this.undoAnimationStepIndices = null;
    this.previousAnimationSteps = [];
    this.undoAnimationStepIndicesStack = [];
    this.AnimationSteps = null;
    this.fireEvent("AnimationUndoUnavailable", "NoData");
    clearTimeout(timer);
    this.animatedObjects.update();
    this.animatedObjects.draw();
    this.refreshAccessibleDescription();
      document.getElementById("message").value = "";
  };

  this.skipBack = function () {
    var keepUndoing =
      this.undoAnimationStepIndices != null &&
      this.undoAnimationStepIndices.length != 0;
    if (keepUndoing) {
      var i;
      for (
        i = 0;
        this.currentBlock != null && i < this.currentBlock.length;
        i++
      ) {
        var objectID = this.currentBlock[i].objectID;
        this.animatedObjects.setNodePosition(
          objectID,
          this.currentBlock[i].toX,
          this.currentBlock[i].toY,
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
            this.currentBlock[i].toY,
          );
        }
        keepUndoing = this.finishUndoBlock(this.undoStack.pop());
      }
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      if ((this.undoStack == null || this.undoStack.length == 0)) {
        if(!this.singleMode)
          this.fireEvent("AnimationUndoUnavailable", "NoData");
        else
          this.fireEvent("AnimationReady", "NoData");
      }
      this.currentBlockIndex = 0;
      this.updateScrubUI();
      this.refreshAccessibleDescription();
    }
  };

  this.resetAll = function () {
    this.clearHistory();
    this.animatedObjects.clearAllObjects();
    this.animatedObjects.draw();
    clearTimeout(timer);
  };

  this.skipForward = function () {
    if (this.currentlyAnimating) {
      this.animatedObjects.runFast = true;
      while (
        this.AnimationSteps != null &&
        this.currentAnimation < this.AnimationSteps.length
      ) {
        var i;
        for (
          i = 0;
          this.currentBlock != null && i < this.currentBlock.length;
          i++
        ) {
          var objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY,
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
            this.currentBlock[i].toY,
          );
        }
      }
      this.animatedObjects.update();
      this.currentlyAnimating = false;
      this.doingUndo = false;
      this.awaitingStep = false; //this.singleMode;

      this.animatedObjects.runFast = false;
      if(!this.singleMode)
        this.fireEvent("AnimationEnded", "NoData");
      else
        this.fireEvent("AnimationAdvanceUnavailable", "NoData");
      clearTimeout(timer);
      this.animatedObjects.update();
      this.animatedObjects.draw();
      this.currentBlockIndex = this.totalBlocks;
      this.updateScrubUI();
      this.refreshAccessibleDescription();
    }
  };

  this.finishUndoBlock = function (undoBlock) {
    for (var i = undoBlock.length - 1; i >= 0; i--) {
      undoBlock[i].undoInitialStep(this.animatedObjects);
    }
    this.doingUndo = false;

    // If we are at the final end of the animation ...
    if (this.undoAnimationStepIndices.length == 0) {
      //In single mode, never actually finish undoing
      if(this.singleMode) {
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

      // After full undo, reset scrub slider
      this.currentBlockIndex = 0;
      this.updateScrubUI();
      this.refreshAccessibleDescription();
      return false;
    }
    this.refreshAccessibleDescription();
    return true;
  };

  this.undoLastBlock = function () {
    if (this.undoAnimationStepIndices.length == 0) {
      // Nothing on the undo stack.  Return
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

      // Hack:  If there are not any animations, and we are currently paused,
      // then set the current frame to the end of the animation, so that we will
      // advance immediagely upon the next step button.  If we are not paused, then
      // animate as normal.
      if (!anyAnimations && this.animationPaused) {
        this.currFrame = this.animationBlockLength;
      }
      this.currentlyAnimating = true;
      // Move scrub position back one block (will be finalized on finish)
      this.currentBlockIndex = Math.max(this.currentBlockIndex - 1, 0);
      this.updateScrubUI();
    }
  };
  this.setLayer = function (shown, layers) {
    this.animatedObjects.setLayer(shown, layers);
    // Drop in an extra draw call here, just in case we are not
    // in the middle of an update loop when this changes
    this.animatedObjects.draw();
  };

  this.setAllLayers = function (layers) {
    this.animatedObjects.setAllLayers(layers);
    // Drop in an extra draw call here, just in case we are not
    // in the middle of an update loop when this changes
    this.animatedObjects.draw();
  };

  this.update = function () {
    if (this.currentlyAnimating) {
      this.currFrame = this.currFrame + 1;
      var i;
      for (i = 0; i < this.currentBlock.length; i++) {
        if (
          this.currFrame == this.animationBlockLength ||
          (this.currFrame == 1 && this.animationBlockLength == 0)
        ) {
          this.animatedObjects.setNodePosition(
            this.currentBlock[i].objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY,
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
            percent,
          );
          var newY = this.lerp(
            this.animatedObjects.getNodeY(objectID),
            this.currentBlock[i].toY,
            percent,
          );
          this.animatedObjects.setNodePosition(objectID, newX, newY);
        }

        objectManager.draw();
      }
      if (this.currFrame >= this.animationBlockLength) {
        if (this.doingUndo) {
          if (this.finishUndoBlock(this.undoStack.pop())) {
            this.awaitingStep = true;
            this.fireEvent("AnimationWaiting", "NoData");
            objectManager.draw();
            clearTimeout(timer);
          }
        } else {
          if (
            this.animationPaused &&
            this.currentAnimation < this.AnimationSteps.length
          ) {
            this.awaitingStep = true;
            this.fireEvent("AnimationWaiting", "NoData");
            this.currentBlock = [];
            objectManager.draw();
            clearTimeout(timer);
          } else {
            this.startNextBlock();
          }
        }
      }
      this.animatedObjects.update();
      // Keep scrub slider in sync while animating
      this.updateScrubUI();
    }
  };

  // --- Scrub slider helpers ---
  this.attachScrubSlider = function(sliderEl) {
    this.scrubSlider = sliderEl;
    this.updateScrubUI();
  };

  this.computeTotalBlocks = function() {
    if (!this.AnimationSteps || !Array.isArray(this.AnimationSteps)) return 0;
    return this.AnimationSteps.length;
  };

  this.updateScrubUI = function() {
    if (!this.scrubSlider) return;
    const hasAnim = Array.isArray(this.AnimationSteps) && this.AnimationSteps.length > 0;
    this.scrubSlider.disabled = !hasAnim;
    this.scrubSlider.max = String(this.totalBlocks);
    this.scrubSlider.value = String(Math.max(0, Math.min(this.currentBlockIndex, this.totalBlocks)));
  };

  this.finishCurrentBlockInstantly = function() {
    if (!this.currentBlock || this.currentBlock.length === 0) return;
    for (var i = 0; i < this.currentBlock.length; i++) {
      var objectID = this.currentBlock[i].objectID;
      this.animatedObjects.setNodePosition(
        objectID,
        this.currentBlock[i].toX,
        this.currentBlock[i].toY,
      );
    }
    this.currFrame = this.animationBlockLength;
    this.currentBlock = [];
    this.animatedObjects.update();
    this.animatedObjects.draw();
  };

  this.scrubToBlock = function(targetBlockIndex) {
    if (!Number.isFinite(targetBlockIndex)) return;
    targetBlockIndex = Math.max(0, Math.min(targetBlockIndex, this.totalBlocks));

    // If no animation loaded, nothing to do
    if (!this.AnimationSteps || this.AnimationSteps.length === 0) return;

    // Pause and stop timer to avoid race with update loop
    clearTimeout(timer);
    this.animationPaused = true;

    // If we are mid-animation, immediately finish in-flight movement so scrub
    // never starts from an interpolated partial state.
    if (this.currentlyAnimating) {
      this.finishCurrentBlockInstantly();
    }
    this.currentlyAnimating = false;
    this.doingUndo = false;

    if (targetBlockIndex === this.currentBlockIndex) {
      this.awaitingStep = targetBlockIndex < this.totalBlocks;
      this.updateScrubUI();
      this.refreshAccessibleDescription();
      this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
      return;
    }

    // Seek backwards by undoing blocks
    if (targetBlockIndex < this.currentBlockIndex) {
      while (this.currentBlockIndex > targetBlockIndex && this.undoAnimationStepIndices && this.undoAnimationStepIndices.length > 0) {
        this.undoLastBlock();
        // Apply undo movement instantly (same approach as skipBack) so
        // objects don't remain at stale positions while scrubbing backward.
        for (var i = 0; this.currentBlock != null && i < this.currentBlock.length; i++) {
          var objectID = this.currentBlock[i].objectID;
          this.animatedObjects.setNodePosition(
            objectID,
            this.currentBlock[i].toX,
            this.currentBlock[i].toY,
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
      this.refreshAccessibleDescription();
      this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
      return;
    }

    // Seek forwards by running blocks instantly
    // Run blocks until reaching targetBlockIndex
    while (this.currentBlockIndex < targetBlockIndex && this.currentAnimation < this.AnimationSteps.length) {
      // Start and immediately finalize the next block
      this.startNextBlock();
      // Instantly finish movement for the block
      this.finishCurrentBlockInstantly();
    }

    this.updateScrubUI();
    this.currentlyAnimating = false;
    this.doingUndo = false;
    this.awaitingStep = targetBlockIndex < this.totalBlocks;
    this.refreshAccessibleDescription();
    this.fireEvent(this.awaitingStep ? "AnimationWaiting" : "AnimationEnded", "NoData");
  };
}

AnimationManager.prototype = new EventListener();
AnimationManager.prototype.constructor = AnimationManager;

AnimationManager.prototype.setSingleMode = function () {
  this.singleMode = true;
  let parent = document.getElementById("AlgorithmSpecificControls");
  parent.style.display = 'none';
}

export function SingleAnimation(id, fromX, fromY, toX, toY) {
  this.objectID = id;
  this.fromX = fromX;
  this.fromY = fromY;
  this.toX = toX;
  this.toY = toY;
}
