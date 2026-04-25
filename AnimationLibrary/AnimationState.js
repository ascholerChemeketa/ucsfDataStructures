import { normalizeAnimation } from "./AnimationSchema.js";

function edgeKey(from, to) {
  return `${from}->${to}`;
}

function createEmptyAnimationState() {
  return {
    objects: new Map(),
    edges: new Map(),
    message: "",
    blocksApplied: 0,
    history: [],
  };
}

function replayAnimation(rawAnimation, options = {}) {
  const animation = normalizeAnimation(rawAnimation);
  const state = createEmptyAnimationState();
  const upToBlockIndex =
    Number.isFinite(options.upToBlockIndex) ? options.upToBlockIndex : animation.length - 1;

  for (let i = 0; i < animation.length && i <= upToBlockIndex; i++) {
    replayBlock(state, animation[i]);
  }

  return state;
}

function replayBlock(state, block) {
  for (const step of block.steps) {
    replayStep(state, step);
  }
  state.blocksApplied += 1;
  state.history.push({
    ...(block.label ? { label: block.label } : {}),
    ...(block.meta ? { meta: block.meta } : {}),
  });
  return state;
}

function replayStep(state, step) {
  switch (step.type) {
    case "createCircle":
      state.objects.set(step.id, {
        id: step.id,
        kind: "circle",
        text: step.label,
        ...(step.x != null ? { x: step.x } : {}),
        ...(step.y != null ? { y: step.y } : {}),
      });
      break;
    case "createRectangle":
      state.objects.set(step.id, {
        id: step.id,
        kind: "rectangle",
        text: step.label,
        width: step.width,
        height: step.height,
        ...(step.x != null ? { x: step.x } : {}),
        ...(step.y != null ? { y: step.y } : {}),
        xJustify: step.xJustify,
        yJustify: step.yJustify,
      });
      break;
    case "createLabel":
      state.objects.set(step.id, {
        id: step.id,
        kind: "label",
        text: step.text,
        ...(step.x != null ? { x: step.x } : {}),
        ...(step.y != null ? { y: step.y } : {}),
        centered: step.centered,
        ...(step.fontSizePercent != null ? { fontSizePercent: step.fontSizePercent } : {}),
      });
      break;
    case "createHighlightCircle":
      state.objects.set(step.id, {
        id: step.id,
        kind: "highlightCircle",
        color: step.color,
        radius: step.radius,
        ...(step.x != null ? { x: step.x } : {}),
        ...(step.y != null ? { y: step.y } : {}),
      });
      break;
    case "createLinkedList":
      state.objects.set(step.id, {
        id: step.id,
        kind: "linkedList",
        text: step.label,
        width: step.width,
        height: step.height,
        linkPercent: step.linkPercent,
        vertical: step.vertical,
        linkAtEnd: step.linkAtEnd,
        numLabels: step.numLabels,
        numLinks: step.numLinks,
        backgroundColor: step.backgroundColor,
        foregroundColor: step.foregroundColor,
        ...(step.x != null ? { x: step.x } : {}),
        ...(step.y != null ? { y: step.y } : {}),
      });
      break;
    case "createBTreeNode":
      state.objects.set(step.id, {
        id: step.id,
        kind: "btreeNode",
        widthPerElement: step.widthPerElement,
        height: step.height,
        numElements: step.numElems,
        x: step.x,
        y: step.y,
        backgroundColor: step.backgroundColor,
        foregroundColor: step.foregroundColor,
      });
      break;
    case "connect":
      state.edges.set(edgeKey(step.from, step.to), { ...step });
      break;
    case "disconnect":
      state.edges.delete(edgeKey(step.from, step.to));
      break;
    case "move":
      mergeObject(state, step.objectId, { x: step.toX, y: step.toY });
      break;
    case "moveToAlignRight":
      mergeObject(state, step.objectId, { alignedRightOf: step.otherId });
      break;
    case "setPosition":
      mergeObject(state, step.id, { x: step.x, y: step.y });
      break;
    case "alignRight":
      mergeObject(state, step.id, { alignedRightOf: step.otherId });
      break;
    case "alignLeft":
      mergeObject(state, step.id, { alignedLeftOf: step.otherId });
      break;
    case "alignTop":
      mergeObject(state, step.id, { alignedTopOf: step.otherId });
      break;
    case "alignBottom":
      mergeObject(state, step.id, { alignedBottomOf: step.otherId });
      break;
    case "setForegroundColor":
      mergeObject(state, step.id, { foregroundColor: step.color });
      break;
    case "setBackgroundColor":
      mergeObject(state, step.id, { backgroundColor: step.color });
      break;
    case "setTextColor":
      mergeIndexedObjectField(state, step.id, "textColor", step.index, step.color);
      break;
    case "setEdgeColor":
      mergeEdge(state, step.from, step.to, { color: step.color });
      break;
    case "setEdgeAlpha":
      mergeEdge(state, step.from, step.to, { alpha: step.alpha });
      break;
    case "setEdgeHighlight":
      mergeEdge(state, step.from, step.to, { highlighted: step.value });
      break;
    case "setHighlight":
      mergeObject(state, step.id, { highlighted: step.value });
      break;
    case "setHighlightIndex":
      mergeObject(state, step.id, { highlightIndex: step.index });
      break;
    case "setAlpha":
      mergeObject(state, step.id, { alpha: step.alpha });
      break;
    case "setText":
      mergeIndexedObjectField(state, step.id, "text", step.index, step.text);
      if (step.id === 0) {
        state.message = step.text;
      }
      break;
    case "setMessage":
      state.message = step.message;
      break;
    case "delete":
      state.objects.delete(step.id);
      removeIncidentEdges(state, step.id);
      break;
    case "setHeight":
      mergeObject(state, step.id, { height: step.height });
      break;
    case "setWidth":
      mergeObject(state, step.id, { width: step.width });
      break;
    case "setLayer":
      mergeObject(state, step.id, { layer: step.layer });
      break;
    case "setNull":
      mergeIndexedObjectField(state, step.id, "nullFlags", step.index, step.value);
      break;
    case "setNumElements":
      mergeObject(state, step.id, { numElements: step.count });
      break;
    default:
      throw new Error(`Replay does not support animation step type: ${step.type}`);
  }
  return state;
}

function mergeObject(state, id, patch) {
  const previous = state.objects.get(id) || { id, kind: "unknown" };
  state.objects.set(id, { ...previous, ...patch });
}

function mergeEdge(state, from, to, patch) {
  const key = edgeKey(from, to);
  const previous =
    state.edges.get(key) || {
      from,
      to,
      color: "#000000",
      curve: 0,
      directed: true,
      label: "",
      connectionPoint: 0,
    };
  state.edges.set(key, { ...previous, ...patch });
}

function mergeIndexedObjectField(state, id, field, index, value) {
  const previous = state.objects.get(id) || { id, kind: "unknown" };
  const priorField = previous[field];
  const nextField =
    priorField && typeof priorField === "object" && !Array.isArray(priorField)
      ? { ...priorField }
      : {};
  nextField[index] = value;
  state.objects.set(id, { ...previous, [field]: nextField });
}

function removeIncidentEdges(state, id) {
  for (const key of state.edges.keys()) {
    if (key.startsWith(`${id}->`) || key.endsWith(`->${id}`)) {
      state.edges.delete(key);
    }
  }
}

export {
  createEmptyAnimationState,
  replayAnimation,
  replayBlock,
  replayStep,
};
