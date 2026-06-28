function formatList(items) {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatKeyList(keys) {
  if (keys.length === 0) {
    return "no keys";
  }
  if (keys.length === 1) {
    return `key ${keys[0]}`;
  }
  return `keys ${formatList(keys.map(String))}`;
}

function formatNodeValue(value) {
  return `${String(value)} node`;
}

function formatNullableNodeValue(value) {
  return value == null ? "null" : formatNodeValue(value);
}

export function getReplayObjectText(object, preferredIndex = 0) {
  if (!object) {
    return null;
  }
  if (typeof object.text === "string" || typeof object.text === "number") {
    return String(object.text);
  }
  if (object.text && typeof object.text === "object") {
    if (Object.prototype.hasOwnProperty.call(object.text, preferredIndex)) {
      return String(object.text[preferredIndex]);
    }
    const keys = Object.keys(object.text).sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) {
      return String(object.text[keys[0]]);
    }
  }
  return null;
}

export function compareReplayObjectsByValue(a, b) {
  const aText = getReplayObjectText(a?.object ?? a);
  const bText = getReplayObjectText(b?.object ?? b);
  const aNumber = Number(aText);
  const bNumber = Number(bText);

  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
    return aNumber - bNumber;
  }

  return String(aText ?? "").localeCompare(String(bText ?? ""));
}

export function classifySingleReplayChildByValue(parentObject, childObject) {
  const parentText = getReplayObjectText(parentObject);
  const childText = getReplayObjectText(childObject);
  const parentNumber = Number(parentText);
  const childNumber = Number(childText);

  if (Number.isFinite(parentNumber) && Number.isFinite(childNumber)) {
    return childNumber < parentNumber ? "left" : "right";
  }

  return String(childText ?? "").localeCompare(String(parentText ?? "")) < 0
    ? "left"
    : "right";
}

export function describeBinaryTree(root, options = {}) {
  const {
    emptyText = "Tree is empty.",
    getValue = (node) => node.data,
    getDetails = () => [],
    getLeft = (node) => node.left,
    getRight = (node) => node.right,
    shouldInclude = (node) => node != null,
  } = options;

  if (!root || !shouldInclude(root)) {
    return emptyText;
  }

  const sentences = [];

  const summarizeNode = (node) => {
    const value = getValue(node);
    const details = getDetails(node).filter(Boolean);
    return details.length > 0
      ? `${value} (${details.join(", ")})`
      : String(value);
  };

  const summarizeChild = (node) => String(getValue(node));

  const visit = (node, isRoot = false) => {
    if (!node || !shouldInclude(node)) {
      return;
    }

    const left = getLeft(node);
    const right = getRight(node);
    const hasLeft = left != null && shouldInclude(left);
    const hasRight = right != null && shouldInclude(right);
    const subject = isRoot ? `Root is ${summarizeNode(node)}` : summarizeNode(node);

    let relationship;
    if (hasLeft && hasRight) {
      relationship = `has a left child ${summarizeChild(left)} and right child ${summarizeChild(right)}.`;
    } else if (hasLeft) {
      relationship = `has a left child ${summarizeChild(left)}.`;
    } else if (hasRight) {
      relationship = `has a right child ${summarizeChild(right)}.`;
    } else {
      relationship = "has no children.";
    }

    sentences.push(`${subject} ${relationship}`);
    visit(left);
    visit(right);
  };

  visit(root, true);
  return sentences.join(" ");
}

export function buildBinaryTreeFromState(state, rootPointerId, options = {}) {
  const {
    childPredicate = (object) => object && object.kind === "circle",
    shouldIncludeObject = () => true,
    getValueFromObject = (object) => getReplayObjectText(object),
    sortChildren = (a, b) =>
      (a.object.x ?? 0) - (b.object.x ?? 0) ||
      (a.object.y ?? 0) - (b.object.y ?? 0) ||
      a.id - b.id,
    classifySingleChild = null,
  } = options;

  const childrenFor = (id) => {
    const children = [];
    for (const edge of state.edges.values()) {
      if (edge.from !== id) {
        continue;
      }
      const object = state.objects.get(edge.to);
      if (!object || !childPredicate(object) || !shouldIncludeObject(object)) {
        continue;
      }
      children.push({
        id: edge.to,
        object,
      });
    }
    children.sort(sortChildren);
    return children.map((child) => child.id);
  };

  const findImplicitRootId = () => {
    const incoming = new Set();
    const candidates = [];

    for (const edge of state.edges.values()) {
      const fromObject = state.objects.get(edge.from);
      const toObject = state.objects.get(edge.to);
      if (
        !fromObject ||
        !toObject ||
        !childPredicate(fromObject) ||
        !childPredicate(toObject) ||
        !shouldIncludeObject(fromObject) ||
        !shouldIncludeObject(toObject)
      ) {
        continue;
      }
      incoming.add(edge.to);
    }

    for (const [id, object] of state.objects.entries()) {
      if (!childPredicate(object) || !shouldIncludeObject(object)) {
        continue;
      }
      if (!incoming.has(id)) {
        candidates.push({ id, object });
      }
    }

    candidates.sort(
      (a, b) =>
        (a.object.y ?? 0) - (b.object.y ?? 0) ||
        (a.object.x ?? 0) - (b.object.x ?? 0) ||
        a.id - b.id,
    );

    return candidates[0]?.id ?? null;
  };

  const rootId =
    rootPointerId == null ? findImplicitRootId() : childrenFor(rootPointerId)[0] ?? findImplicitRootId();
  if (rootId == null) {
    return null;
  }

  const visited = new Set();
  const build = (id) => {
    if (id == null || visited.has(id)) {
      return null;
    }
    const object = state.objects.get(id);
    if (!object || !childPredicate(object) || !shouldIncludeObject(object)) {
      return null;
    }

    visited.add(id);
    const childIds = childrenFor(id);

    const leftId = childIds[0] ?? null;
    const rightId = childIds[1] ?? null;
    let resolvedLeftId = leftId;
    let resolvedRightId = rightId;

    if (childIds.length === 1 && typeof classifySingleChild === "function") {
      const onlyChildObject = state.objects.get(childIds[0]);
      const side = classifySingleChild(object, onlyChildObject, state);
      if (side === "right") {
        resolvedLeftId = null;
        resolvedRightId = childIds[0];
      }
    }

    return {
      id,
      data: getValueFromObject(object, id, state),
      object,
      left: build(resolvedLeftId),
      right: build(resolvedRightId),
    };
  };

  return build(rootId);
}

export function describeBinaryTreeFromState(state, rootPointerId, options = {}) {
  const root = buildBinaryTreeFromState(state, rootPointerId, options);
  return describeBinaryTree(root, {
    emptyText: options.emptyText,
    getValue: (node) => node.data,
    getDetails: options.getDetails || (() => []),
    shouldInclude: options.shouldIncludeNode || ((node) => node != null),
  });
}

function getReplayOutgoingObjects(state, fromId, predicate = () => true) {
  const outgoing = [];
  for (const edge of state.edges.values()) {
    if (edge.from !== fromId) {
      continue;
    }
    const object = state.objects.get(edge.to);
    if (!object || !predicate(object, edge)) {
      continue;
    }
    outgoing.push({ id: edge.to, object, edge });
  }
  return outgoing;
}

function chooseReplayForwardNode(currentObject, candidates) {
  if (candidates.length === 0) {
    return null;
  }

  const currentX = currentObject?.x ?? 0;
  const currentY = currentObject?.y ?? 0;
  const sorted = [...candidates].sort(
    (a, b) =>
      (a.object.y ?? 0) - (b.object.y ?? 0) ||
      (a.object.x ?? 0) - (b.object.x ?? 0) ||
      a.id - b.id,
  );
  const forward = sorted.filter(
    (candidate) =>
      (candidate.object.y ?? 0) > currentY + 1 ||
      (Math.abs((candidate.object.y ?? 0) - currentY) <= 1 &&
        (candidate.object.x ?? 0) > currentX + 1),
  );
  return (forward[0] ?? sorted[0])?.id ?? null;
}

function readReplayLinearChainValues(state, pointerId, options = {}) {
  const {
    nodePredicate = (object) => object.kind === "linkedList",
    skipNode = () => false,
  } = options;
  const pointerTargets = getReplayOutgoingObjects(
    state,
    pointerId,
    (object) => nodePredicate(object),
  ).sort(
    (a, b) =>
      (a.object.y ?? 0) - (b.object.y ?? 0) ||
      (a.object.x ?? 0) - (b.object.x ?? 0) ||
      a.id - b.id,
  );

  let currentId = pointerTargets[0]?.id ?? null;
  const visited = new Set();
  const values = [];

  while (currentId != null && !visited.has(currentId)) {
    visited.add(currentId);
    const currentObject = state.objects.get(currentId);
    if (!currentObject || !nodePredicate(currentObject)) {
      break;
    }

    if (!skipNode(currentObject, currentId, state)) {
      values.push(getReplayObjectText(currentObject));
    }

    const nextCandidates = getReplayOutgoingObjects(
      state,
      currentId,
      (object) => nodePredicate(object),
    ).filter((candidate) => !visited.has(candidate.id));

    currentId = chooseReplayForwardNode(currentObject, nextCandidates);
  }

  return values.filter((value) => value != null && value !== "");
}

function readReplayArrayValues(state, arrayIds) {
  return arrayIds.map((id) => getReplayObjectText(state.objects.get(id)));
}

function parseReplayNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getReplayIndexedTexts(object, count = null) {
  if (!object || object.text == null) {
    return [];
  }
  if (typeof object.text === "string" || typeof object.text === "number") {
    return [String(object.text)];
  }

  const indices = Object.keys(object.text)
    .map((key) => Number(key))
    .filter((index) => Number.isFinite(index))
    .sort((a, b) => a - b);
  const limit = count == null ? indices.length : Math.min(indices.length, count);
  const values = [];
  for (let i = 0; i < limit; i++) {
    values.push(String(object.text[indices[i]]));
  }
  return values;
}

function findImplicitReplayRootId(state, predicate, edgeFilter = () => true) {
  const incoming = new Set();
  const candidates = [];

  for (const edge of state.edges.values()) {
    const fromObject = state.objects.get(edge.from);
    const toObject = state.objects.get(edge.to);
    if (!fromObject || !toObject || !predicate(fromObject) || !predicate(toObject)) {
      continue;
    }
    if (!edgeFilter(fromObject, toObject, edge)) {
      continue;
    }
    incoming.add(edge.to);
  }

  for (const [id, object] of state.objects.entries()) {
    if (!predicate(object) || incoming.has(id)) {
      continue;
    }
    candidates.push({ id, object });
  }

  candidates.sort(
    (a, b) =>
      (a.object.y ?? 0) - (b.object.y ?? 0) ||
      (a.object.x ?? 0) - (b.object.x ?? 0) ||
      a.id - b.id,
  );

  return candidates[0]?.id ?? null;
}

export function describeSinglyLinkedChainFromState(state, pointerId, options = {}) {
  const values = readReplayLinearChainValues(state, pointerId, options);
  return describeSinglyLinkedChain(values, {
    emptyText: options.emptyText,
    headLabel: options.headLabel,
    tailLabel: options.tailLabel,
  });
}

export function describeDoublyLinkedChainFromState(state, pointerId, options = {}) {
  const values = readReplayLinearChainValues(state, pointerId, {
    nodePredicate: options.nodePredicate,
    skipNode: options.skipNode,
  });
  return describeDoublyLinkedChain(values, {
    emptyText: options.emptyText,
    headLabel: options.headLabel,
    tailLabel: options.tailLabel,
  });
}

export function describeIndexedArrayFromState(state, arrayIds, options = {}) {
  const values = readReplayArrayValues(state, arrayIds).filter(
    (value) => value != null && value !== "",
  );
  return describeIndexedArray(values, options);
}

export function describeStackArrayFromState(state, arrayIds, topId) {
  const values = readReplayArrayValues(state, arrayIds);
  const top = parseReplayNumber(getReplayObjectText(state.objects.get(topId)), 0);
  return describeStackArray(values, top);
}

export function describeQueueArrayFromState(state, arrayIds, headId, tailId) {
  const values = readReplayArrayValues(state, arrayIds);
  const head = parseReplayNumber(getReplayObjectText(state.objects.get(headId)), 0);
  const tail = parseReplayNumber(getReplayObjectText(state.objects.get(tailId)), 0);
  return describeQueueArray(values, head, tail, arrayIds.length);
}

export function describeMultiwayTree(root, options = {}) {
  const {
    emptyText = "Tree is empty.",
    getKeys = (node) => node.keys.slice(0, node.numKeys),
    getChildren = (node) => node.children.slice(0, node.numKeys + 1).filter(Boolean),
    isLeaf = (node) => node.isLeaf,
    nodeLabel = "node",
  } = options;

  if (!root) {
    return emptyText;
  }

  const sentences = [];

  const visit = (node, isRoot = false) => {
    if (!node) {
      return;
    }

    const keys = getKeys(node).map(String);
    const children = getChildren(node);
    const subject = isRoot ? "Root node" : `Node with ${formatKeyList(keys)}`;

    if (isLeaf(node)) {
      sentences.push(`${subject} has ${formatKeyList(keys)} and is a leaf.`);
    } else if (children.length === 1) {
      sentences.push(`${subject} has ${formatKeyList(keys)} and 1 child.`);
    } else {
      sentences.push(`${subject} has ${formatKeyList(keys)} and ${children.length} children.`);
    }

    for (const child of children) {
      visit(child);
    }
  };

  visit(root, true);
  return sentences.join(" ");
}

export function describeSinglyLinkedChain(values, options = {}) {
  const {
    emptyText = "List is empty.",
    headLabel = "Head",
    tailLabel = null,
  } = options;

  if (values.length === 0) {
    return emptyText;
  }

  const sentences = [];

  if (headLabel) {
    sentences.push(`${headLabel} points to ${formatNodeValue(values[0])}.`);
  }
  if (tailLabel) {
    sentences.push(
      `${tailLabel} points to ${formatNodeValue(values[values.length - 1])}.`,
    );
  }

  for (let i = 0; i < values.length; i++) {
    const nextValue = i + 1 < values.length ? values[i + 1] : null;
    sentences.push(
      `${formatNodeValue(values[i])}'s next points to ${formatNullableNodeValue(nextValue)}.`,
    );
  }

  return sentences.join(" ");
}

export function describeDoublyLinkedChain(values, options = {}) {
  const {
    emptyText = "List is empty.",
    headLabel = "Head",
    tailLabel = "Tail",
  } = options;

  if (values.length === 0) {
    return emptyText;
  }

  const sentences = [];

  if (headLabel) {
    sentences.push(`${headLabel} points to ${formatNodeValue(values[0])}.`);
  }
  if (tailLabel) {
    sentences.push(
      `${tailLabel} points to ${formatNodeValue(values[values.length - 1])}.`,
    );
  }

  for (let i = 0; i < values.length; i++) {
    const nextValue = i + 1 < values.length ? values[i + 1] : null;
    const prevValue = i > 0 ? values[i - 1] : null;
    sentences.push(
      `${formatNodeValue(values[i])}'s next points at ${formatNullableNodeValue(nextValue)} and prev points at ${formatNullableNodeValue(prevValue)}.`,
    );
  }

  return sentences.join(" ");
}

export function describeIndexedArray(values, options = {}) {
  const {
    emptyText = "Array is empty.",
    label = "Array",
  } = options;

  if (values.length === 0) {
    return emptyText;
  }

  const sentences = [`${label} has ${values.length} value${values.length === 1 ? "" : "s"}.`];
  for (let i = 0; i < values.length; i++) {
    sentences.push(`Index ${i} stores ${values[i]}.`);
  }
  return sentences.join(" ");
}

export function describeStackArray(values, top) {
  if (top === 0) {
    return "Stack is empty. Top is 0.";
  }

  const sentences = [`Top is ${top}.`];
  for (let i = 0; i < top; i++) {
    sentences.push(`Index ${i} stores ${values[i]}.`);
  }
  return sentences.join(" ");
}

export function describeQueueArray(values, head, tail, size) {
  if (head === tail) {
    return `Queue is empty. Start is ${head}. End is ${tail}.`;
  }

  const sentences = [`Start is ${head}. End is ${tail}.`];
  let index = head;
  while (index !== tail) {
    sentences.push(`Index ${index} stores ${values[index]}.`);
    index = (index + 1) % size;
  }
  return sentences.join(" ");
}

export function describeBinaryHeap(values, size, options = {}) {
  const {
    emptyText = "Heap is empty.",
    heapLabel = "Heap",
  } = options;

  if (size === 0) {
    return emptyText;
  }

  const sentences = [`${heapLabel} has ${size} value${size === 1 ? "" : "s"}.`, `Root is ${values[0]}.`];

  for (let i = 0; i < size; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    const hasLeft = left < size;
    const hasRight = right < size;

    let relationship;
    if (hasLeft && hasRight) {
      relationship = `with left child ${values[left]} and right child ${values[right]}.`;
    } else if (hasLeft) {
      relationship = `with left child ${values[left]}.`;
    } else if (hasRight) {
      relationship = `with right child ${values[right]}.`;
    } else {
      relationship = "with no children.";
    }

    sentences.push(`Index ${i} stores ${values[i]} ${relationship}`);
  }

  return sentences.join(" ");
}

export function describeBinaryHeapFromState(state, arrayIds, options = {}) {
  const {
    emptyText = "Heap is empty.",
    heapLabel = "Heap",
    size = null,
    activeNodeIds = null,
  } = options;

  const values = readReplayArrayValues(state, arrayIds);
  let resolvedSize = size;

  if (!Number.isFinite(resolvedSize)) {
    if (Array.isArray(activeNodeIds)) {
      resolvedSize = activeNodeIds.filter((id) => {
        const object = state.objects.get(id);
        const text = getReplayObjectText(object);
        return object != null && text != null && text !== "";
      }).length;
    } else {
      resolvedSize = 0;
      while (resolvedSize < values.length && values[resolvedSize] != null && values[resolvedSize] !== "") {
        resolvedSize += 1;
      }
    }
  }

  return describeBinaryHeap(values, resolvedSize, {
    emptyText,
    heapLabel,
  });
}

export function describeClosedHashTable(slots, options = {}) {
  const {
    tableSize = slots.length,
    collisionStrategy = "linear probing",
  } = options;

  const sentences = [
    `Table size is ${tableSize}.`,
    `Collision strategy is ${collisionStrategy}.`,
  ];

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot === null) {
      sentences.push(`Index ${i} is empty.`);
    } else if (slot === "<deleted>") {
      sentences.push(`Index ${i} is deleted.`);
    } else {
      sentences.push(`Index ${i} stores ${slot}.`);
    }
  }

  return sentences.join(" ");
}

export function describeClosedHashTableFromState(state, slotIds, options = {}) {
  const slots = slotIds.map((id) => {
    const value = getReplayObjectText(state.objects.get(id));
    if (value == null || value === "") {
      return null;
    }
    if (value === "<deleted>") {
      return "<deleted>";
    }
    return value;
  });

  return describeClosedHashTable(slots, options);
}

export function describeOpenHashTable(buckets, options = {}) {
  const {
    tableSize = buckets.length,
  } = options;

  const sentences = [`Table size is ${tableSize}.`];

  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];
    if (bucket.length === 0) {
      sentences.push(`Bucket ${i} is empty.`);
    } else if (bucket.length === 1) {
      sentences.push(`Bucket ${i} contains ${bucket[0]}.`);
    } else {
      sentences.push(`Bucket ${i} contains ${bucket.join(", then ")}.`);
    }
  }

  return sentences.join(" ");
}

export function describeOpenHashTableFromState(state, bucketPointerIds, options = {}) {
  const buckets = bucketPointerIds.map((pointerId) =>
    readReplayLinearChainValues(state, pointerId, {
      nodePredicate: (object) => object.kind === "linkedList",
    }),
  );

  return describeOpenHashTable(buckets, options);
}

export function describePrefixTreeFromState(state, options = {}) {
  const {
    emptyText = "Tree is empty.",
    nodePredicate = (object) => object.kind === "circle",
    edgeFilter = () => true,
    getStoredValue = (object) => getReplayObjectText(object) ?? "",
    isWord = () => false,
  } = options;

  const rootId = findImplicitReplayRootId(state, nodePredicate, edgeFilter);
  if (rootId == null) {
    return emptyText;
  }

  const sentences = [];
  const visited = new Set();

  const visit = (id, isRoot = false) => {
    if (id == null || visited.has(id)) {
      return;
    }
    const object = state.objects.get(id);
    if (!object || !nodePredicate(object)) {
      return;
    }

    visited.add(id);
    const storedValue = getStoredValue(object, id, state);
    const children = getReplayOutgoingObjects(
      state,
      id,
      (childObject, edge) => nodePredicate(childObject) && edgeFilter(object, childObject, edge),
    ).sort(
      (a, b) =>
        String(getStoredValue(a.object, a.id, state)).localeCompare(
          String(getStoredValue(b.object, b.id, state)),
        ) ||
        (a.object.x ?? 0) - (b.object.x ?? 0) ||
        a.id - b.id,
    );

    const stored =
      storedValue === "" ? "an empty prefix" : `prefix ${storedValue}`;
    const wordState = isWord(object, id, state)
      ? "marks a complete word"
      : "does not mark a complete word";

    let childText;
    if (children.length === 0) {
      childText = "has no children.";
    } else if (children.length === 1) {
      childText = `has child ${getStoredValue(children[0].object, children[0].id, state)}.`;
    } else {
      const labels = children.map((child) => getStoredValue(child.object, child.id, state));
      childText = `has children ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}.`;
    }

    const subject = isRoot ? "Root node" : `Node ${storedValue || "<root>"}`;
    sentences.push(`${subject} stores ${stored}, ${wordState}, and ${childText}`);

    for (const child of children) {
      visit(child.id, false);
    }
  };

  visit(rootId, true);
  return sentences.join(" ");
}

export function describeMultiwayTreeFromState(state, options = {}) {
  const {
    emptyText = "Tree is empty.",
    nodePredicate = (object) => object.kind === "btreeNode",
    edgeFilter = (fromObject, toObject) => (toObject.y ?? 0) > (fromObject.y ?? 0),
    getKeysFromObject = (object) =>
      getReplayIndexedTexts(object, object.numElements ?? null),
  } = options;

  const rootId = findImplicitReplayRootId(state, nodePredicate, edgeFilter);
  if (rootId == null) {
    return emptyText;
  }

  const sentences = [];
  const visited = new Set();

  const visit = (id, isRoot = false) => {
    if (id == null || visited.has(id)) {
      return;
    }
    const object = state.objects.get(id);
    if (!object || !nodePredicate(object)) {
      return;
    }

    visited.add(id);
    const keys = getKeysFromObject(object, id, state).map(String);
    const children = getReplayOutgoingObjects(
      state,
      id,
      (childObject, edge) => nodePredicate(childObject) && edgeFilter(object, childObject, edge),
    ).sort(
      (a, b) =>
        (a.object.x ?? 0) - (b.object.x ?? 0) ||
        (a.object.y ?? 0) - (b.object.y ?? 0) ||
        a.id - b.id,
    );

    const subject = isRoot ? "Root node" : `Node with ${formatKeyList(keys)}`;
    if (children.length === 0) {
      sentences.push(`${subject} has ${formatKeyList(keys)} and is a leaf.`);
    } else if (children.length === 1) {
      sentences.push(`${subject} has ${formatKeyList(keys)} and 1 child.`);
    } else {
      sentences.push(`${subject} has ${formatKeyList(keys)} and ${children.length} children.`);
    }

    for (const child of children) {
      visit(child.id, false);
    }
  };

  visit(rootId, true);
  return sentences.join(" ");
}
