const STEP_BREAK = Symbol("animation-step-break");

function toInt(value, fallback = undefined) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toFloat(value, fallback = undefined) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toBool(value) {
  if (typeof value === "boolean") {
    return value;
  }
  const uppercase = String(value ?? "").trim().toUpperCase();
  return !(
    uppercase === "FALSE" ||
    uppercase === "F" ||
    uppercase === "0" ||
    uppercase === ""
  );
}

function toColor(value, fallback = undefined) {
  if (value == null || value === "") {
    return fallback;
  }
  const str = String(value);
  if (str.charAt(0) === "#") {
    return str;
  }
  if (str.substring(0, 2).toLowerCase() === "0x") {
    return `#${str.substring(2)}`;
  }
  return str;
}

function normalizeMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return undefined;
  }
  const normalized = {};
  if (meta.source != null) normalized.source = String(meta.source);
  if (meta.operation != null) normalized.operation = String(meta.operation);
  if (meta.focusNodeId != null) normalized.focusNodeId = toInt(meta.focusNodeId);
  if (Array.isArray(meta.tags)) {
    normalized.tags = meta.tags.map((tag) => String(tag));
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeBlock(rawBlock) {
  const steps = [];
  const label =
    rawBlock && rawBlock.label != null && rawBlock.label !== ""
      ? String(rawBlock.label)
      : undefined;
  const meta = normalizeMeta(rawBlock ? rawBlock.meta : undefined);
  const rawSteps = Array.isArray(rawBlock && rawBlock.steps) ? rawBlock.steps : [];
  for (const rawStep of rawSteps) {
    const step = normalizeAnimationStep(rawStep);
    if (step !== STEP_BREAK) {
      steps.push(step);
    }
  }
  return {
    ...(label ? { label } : {}),
    ...(meta ? { meta } : {}),
    steps,
  };
}

function normalizeAnimation(animation) {
  if (!Array.isArray(animation) || animation.length === 0) {
    return [{ steps: [] }];
  }

  const blocks = [];
  let currentBlock = { steps: [] };

  for (const item of animation) {
    if (isAnimationBlock(item)) {
      if (currentBlock.steps.length > 0 || currentBlock.label || currentBlock.meta) {
        blocks.push(currentBlock);
      }
      const normalizedBlock = normalizeBlock(item);
      if (normalizedBlock.steps.length > 0 || normalizedBlock.label || normalizedBlock.meta) {
        blocks.push(normalizedBlock);
      }
      currentBlock = { steps: [] };
      continue;
    }

    const rawStep = item;
    const step = normalizeAnimationStep(rawStep);
    if (step === STEP_BREAK) {
      if (currentBlock.steps.length > 0 || currentBlock.label || currentBlock.meta) {
        blocks.push(currentBlock);
      }
      currentBlock = { steps: [] };
      continue;
    }
    currentBlock.steps.push(step);
  }

  if (currentBlock.steps.length > 0 || currentBlock.label || currentBlock.meta) {
    blocks.push(currentBlock);
  }

  return blocks.length > 0 ? blocks : [{ steps: [] }];
}

function isAnimationBlock(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Array.isArray(value.steps);
}

function normalizeAnimationStep(rawStep) {
  if (typeof rawStep === "string") {
    return parseLegacyCommand(rawStep);
  }
  if (!rawStep || typeof rawStep !== "object" || Array.isArray(rawStep)) {
    throw new Error(`Unsupported animation step: ${String(rawStep)}`);
  }

  const type = String(rawStep.type ?? "").trim();
  if (type === "") {
    throw new Error("Animation step is missing a type");
  }
  if (type.toLowerCase() === "step") {
    return STEP_BREAK;
  }

  switch (type.toLowerCase()) {
    case "createcircle":
      return {
        type: "createCircle",
        id: toInt(rawStep.id ?? rawStep.objectId),
        label: String(rawStep.label ?? rawStep.text ?? ""),
        ...(rawStep.x != null ? { x: toFloat(rawStep.x) } : {}),
        ...(rawStep.y != null ? { y: toFloat(rawStep.y) } : {}),
      };
    case "connect":
      return {
        type: "connect",
        from: toInt(rawStep.from),
        to: toInt(rawStep.to),
        color: toColor(rawStep.color, "#000000"),
        curve: toFloat(rawStep.curve, 0),
        directed: rawStep.directed == null ? true : toBool(rawStep.directed),
        label: rawStep.label == null ? "" : String(rawStep.label),
        connectionPoint: toInt(rawStep.connectionPoint, 0),
      };
    case "createrectangle":
      return {
        type: "createRectangle",
        id: toInt(rawStep.id ?? rawStep.objectId),
        label: String(rawStep.label ?? rawStep.text ?? ""),
        width: toInt(rawStep.width),
        height: toInt(rawStep.height),
        ...(rawStep.x != null ? { x: toFloat(rawStep.x) } : {}),
        ...(rawStep.y != null ? { y: toFloat(rawStep.y) } : {}),
        xJustify: rawStep.xJustify == null ? "center" : String(rawStep.xJustify),
        yJustify: rawStep.yJustify == null ? "center" : String(rawStep.yJustify),
      };
    case "move":
      return {
        type: "move",
        objectId: toInt(rawStep.objectId ?? rawStep.id),
        toX: toFloat(rawStep.toX ?? rawStep.x),
        toY: toFloat(rawStep.toY ?? rawStep.y),
      };
    case "movetoalignright":
      return {
        type: "moveToAlignRight",
        objectId: toInt(rawStep.objectId ?? rawStep.id),
        otherId: toInt(rawStep.otherId),
      };
    case "setforegroundcolor":
      return {
        type: "setForegroundColor",
        id: toInt(rawStep.id),
        color: toColor(rawStep.color),
      };
    case "setbackgroundcolor":
      return {
        type: "setBackgroundColor",
        id: toInt(rawStep.id),
        color: toColor(rawStep.color),
      };
    case "sethighlight":
      return {
        type: "setHighlight",
        id: toInt(rawStep.id),
        value: toBool(rawStep.value),
      };
    case "disconnect":
      return {
        type: "disconnect",
        from: toInt(rawStep.from),
        to: toInt(rawStep.to),
      };
    case "setalpha":
      return {
        type: "setAlpha",
        id: toInt(rawStep.id),
        alpha: toFloat(rawStep.alpha),
      };
    case "setmessage":
      return {
        type: "setMessage",
        message: String(rawStep.message ?? ""),
      };
    case "settext":
      return {
        type: "setText",
        id: toInt(rawStep.id),
        text: String(rawStep.text ?? ""),
        index: toInt(rawStep.index, 0),
      };
    case "delete":
      return {
        type: "delete",
        id: toInt(rawStep.id),
      };
    case "createhighlightcircle":
      return {
        type: "createHighlightCircle",
        id: toInt(rawStep.id),
        color: toColor(rawStep.color),
        ...(rawStep.x != null ? { x: toFloat(rawStep.x) } : {}),
        ...(rawStep.y != null ? { y: toFloat(rawStep.y) } : {}),
        radius: toFloat(rawStep.radius, 20),
      };
    case "createlabel":
      return {
        type: "createLabel",
        id: toInt(rawStep.id),
        text: String(rawStep.text ?? rawStep.label ?? ""),
        ...(rawStep.x != null ? { x: toFloat(rawStep.x) } : {}),
        ...(rawStep.y != null ? { y: toFloat(rawStep.y) } : {}),
        centered: rawStep.centered == null ? true : toBool(rawStep.centered),
        ...(rawStep.fontSizePercent != null
          ? { fontSizePercent: toFloat(rawStep.fontSizePercent) }
          : {}),
      };
    case "setedgecolor":
      return {
        type: "setEdgeColor",
        from: toInt(rawStep.from),
        to: toInt(rawStep.to),
        color: toColor(rawStep.color),
      };
    case "setedgealpha":
      return {
        type: "setEdgeAlpha",
        from: toInt(rawStep.from),
        to: toInt(rawStep.to),
        alpha: toFloat(rawStep.alpha),
      };
    case "setedgehighlight":
      return {
        type: "setEdgeHighlight",
        from: toInt(rawStep.from),
        to: toInt(rawStep.to),
        value: toBool(rawStep.value),
      };
    case "setheight":
      return {
        type: "setHeight",
        id: toInt(rawStep.id),
        height: toInt(rawStep.height),
      };
    case "setlayer":
      return {
        type: "setLayer",
        id: toInt(rawStep.id),
        layer: toInt(rawStep.layer),
      };
    case "createlinkedlist":
      return {
        type: "createLinkedList",
        id: toInt(rawStep.id),
        label: String(rawStep.label ?? ""),
        width: toInt(rawStep.width),
        height: toInt(rawStep.height),
        ...(rawStep.x != null ? { x: toFloat(rawStep.x) } : {}),
        ...(rawStep.y != null ? { y: toFloat(rawStep.y) } : {}),
        linkPercent: toFloat(rawStep.linkPercent, 0.25),
        vertical: rawStep.vertical == null ? true : toBool(rawStep.vertical),
        linkAtEnd: rawStep.linkAtEnd == null ? false : toBool(rawStep.linkAtEnd),
        numLabels: toInt(rawStep.numLabels, 1),
        numLinks: toInt(rawStep.numLinks, 1),
        backgroundColor: toColor(rawStep.backgroundColor, "#FFFFFF"),
        foregroundColor: toColor(rawStep.foregroundColor, "#000000"),
      };
    case "setnull":
      return {
        type: "setNull",
        id: toInt(rawStep.id),
        value: toBool(rawStep.value),
        index: toInt(rawStep.index, 0),
      };
    case "settextcolor":
      return {
        type: "setTextColor",
        id: toInt(rawStep.id),
        color: toColor(rawStep.color),
        index: toInt(rawStep.index, 0),
      };
    case "createbtreenode":
      return {
        type: "createBTreeNode",
        id: toInt(rawStep.id),
        widthPerElement: toFloat(rawStep.widthPerElement),
        height: toFloat(rawStep.height),
        numElems: toInt(rawStep.numElems),
        x: toFloat(rawStep.x),
        y: toFloat(rawStep.y),
        backgroundColor: toColor(rawStep.backgroundColor),
        foregroundColor: toColor(rawStep.foregroundColor),
      };
    case "setwidth":
      return {
        type: "setWidth",
        id: toInt(rawStep.id),
        width: toInt(rawStep.width),
      };
    case "setlinedash":
      return {
        type: "setLineDash",
        id: toInt(rawStep.id),
        lineDash: String(rawStep.lineDash ?? rawStep.dash ?? ""),
      };
    case "setnumelements":
      return {
        type: "setNumElements",
        id: toInt(rawStep.id),
        count: toInt(rawStep.count ?? rawStep.numElements),
      };
    case "setposition":
      return {
        type: "setPosition",
        id: toInt(rawStep.id),
        x: toFloat(rawStep.x),
        y: toFloat(rawStep.y),
      };
    case "alignright":
      return {
        type: "alignRight",
        id: toInt(rawStep.id),
        otherId: toInt(rawStep.otherId),
      };
    case "alignleft":
      return {
        type: "alignLeft",
        id: toInt(rawStep.id),
        otherId: toInt(rawStep.otherId),
      };
    case "aligntop":
      return {
        type: "alignTop",
        id: toInt(rawStep.id),
        otherId: toInt(rawStep.otherId),
      };
    case "alignbottom":
      return {
        type: "alignBottom",
        id: toInt(rawStep.id),
        otherId: toInt(rawStep.otherId),
      };
    case "sethighlightindex":
      return {
        type: "setHighlightIndex",
        id: toInt(rawStep.id),
        index: toInt(rawStep.index),
      };
    default:
      throw new Error(`Unknown animation step type: ${type}`);
  }
}

function parseLegacyCommand(rawCommand) {
  const parts = String(rawCommand).split("<;>");
  const command = String(parts[0] ?? "").trim().toUpperCase();

  switch (command) {
    case "STEP":
      return STEP_BREAK;
    case "CREATECIRCLE":
      return normalizeAnimationStep({
        type: "createCircle",
        id: parts[1],
        label: parts[2],
        x: parts[3],
        y: parts[4],
      });
    case "CONNECT":
      return normalizeAnimationStep({
        type: "connect",
        from: parts[1],
        to: parts[2],
        color: parts[3],
        curve: parts[4],
        directed: parts[5],
        label: parts[6],
        connectionPoint: parts[7],
      });
    case "CREATERECTANGLE":
      return normalizeAnimationStep({
        type: "createRectangle",
        id: parts[1],
        label: parts[2],
        width: parts[3],
        height: parts[4],
        x: parts[5],
        y: parts[6],
        xJustify: parts[7],
        yJustify: parts[8],
      });
    case "MOVE":
      return normalizeAnimationStep({
        type: "move",
        objectId: parts[1],
        toX: parts[2],
        toY: parts[3],
      });
    case "MOVETOALIGNRIGHT":
      return normalizeAnimationStep({
        type: "moveToAlignRight",
        objectId: parts[1],
        otherId: parts[2],
      });
    case "SETFOREGROUNDCOLOR":
      return normalizeAnimationStep({ type: "setForegroundColor", id: parts[1], color: parts[2] });
    case "SETBACKGROUNDCOLOR":
      return normalizeAnimationStep({ type: "setBackgroundColor", id: parts[1], color: parts[2] });
    case "SETHIGHLIGHT":
      return normalizeAnimationStep({ type: "setHighlight", id: parts[1], value: parts[2] });
    case "DISCONNECT":
      return normalizeAnimationStep({ type: "disconnect", from: parts[1], to: parts[2] });
    case "SETALPHA":
      return normalizeAnimationStep({ type: "setAlpha", id: parts[1], alpha: parts[2] });
    case "SETMESSAGE":
      return normalizeAnimationStep({ type: "setMessage", message: parts[1] });
    case "SETTEXT":
      return normalizeAnimationStep({ type: "setText", id: parts[1], text: parts[2], index: parts[3] });
    case "DELETE":
      return normalizeAnimationStep({ type: "delete", id: parts[1] });
    case "CREATEHIGHLIGHTCIRCLE":
      return normalizeAnimationStep({
        type: "createHighlightCircle",
        id: parts[1],
        color: parts[2],
        x: parts[3],
        y: parts[4],
        radius: parts[5],
      });
    case "CREATELABEL":
      return normalizeAnimationStep({
        type: "createLabel",
        id: parts[1],
        text: parts[2],
        x: parts[3],
        y: parts[4],
        centered: parts[5],
        fontSizePercent: parts[6],
      });
    case "SETEDGECOLOR":
      return normalizeAnimationStep({ type: "setEdgeColor", from: parts[1], to: parts[2], color: parts[3] });
    case "SETEDGEALPHA":
      return normalizeAnimationStep({ type: "setEdgeAlpha", from: parts[1], to: parts[2], alpha: parts[3] });
    case "SETEDGEHIGHLIGHT":
      return normalizeAnimationStep({ type: "setEdgeHighlight", from: parts[1], to: parts[2], value: parts[3] });
    case "SETHEIGHT":
      return normalizeAnimationStep({ type: "setHeight", id: parts[1], height: parts[2] });
    case "SETLAYER":
      return normalizeAnimationStep({ type: "setLayer", id: parts[1], layer: parts[2] });
    case "CREATELINKEDLIST":
      return normalizeAnimationStep({
        type: "createLinkedList",
        id: parts[1],
        label: parts[2],
        width: parts[3],
        height: parts[4],
        x: parts[5],
        y: parts[6],
        linkPercent: parts[7],
        vertical: parts[8],
        linkAtEnd: parts[9],
        numLabels: parts[10],
        numLinks: parts[11],
      });
    case "SETNULL":
      return normalizeAnimationStep({ type: "setNull", id: parts[1], value: parts[2], index: parts[3] });
    case "SETTEXTCOLOR":
      return normalizeAnimationStep({ type: "setTextColor", id: parts[1], color: parts[2], index: parts[3] });
    case "CREATEBTREENODE":
      return normalizeAnimationStep({
        type: "createBTreeNode",
        id: parts[1],
        widthPerElement: parts[2],
        height: parts[3],
        numElems: parts[4],
        x: parts[5],
        y: parts[6],
        backgroundColor: parts[7],
        foregroundColor: parts[8],
      });
    case "SETWIDTH":
      return normalizeAnimationStep({ type: "setWidth", id: parts[1], width: parts[2] });
    case "SETNUMELEMENTS":
      return normalizeAnimationStep({ type: "setNumElements", id: parts[1], count: parts[2] });
    case "SETPOSITION":
      return normalizeAnimationStep({ type: "setPosition", id: parts[1], x: parts[2], y: parts[3] });
    case "ALIGNRIGHT":
      return normalizeAnimationStep({ type: "alignRight", id: parts[1], otherId: parts[2] });
    case "ALIGNLEFT":
      return normalizeAnimationStep({ type: "alignLeft", id: parts[1], otherId: parts[2] });
    case "ALIGNTOP":
      return normalizeAnimationStep({ type: "alignTop", id: parts[1], otherId: parts[2] });
    case "ALIGNBOTTOM":
      return normalizeAnimationStep({ type: "alignBottom", id: parts[1], otherId: parts[2] });
    case "SETHIGHLIGHTINDEX":
      return normalizeAnimationStep({ type: "setHighlightIndex", id: parts[1], index: parts[2] });
    default:
      throw new Error(`Unknown legacy animation command: ${command}`);
  }
}

export {
  STEP_BREAK,
  isAnimationBlock,
  normalizeAnimation,
  normalizeAnimationStep,
  parseLegacyCommand,
  toBool,
  toColor,
  toFloat,
  toInt,
};
