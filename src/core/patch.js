const EVENT_PREFIX = "on";
const TEXT_KIND = "TEXT";
const TEXT_PROP = "nodeValue";
const BOOLEAN_DOM_PROPS = new Set([
  "checked",
  "selected",
  "disabled",
  "multiple",
  "required",
  "autofocus",
  "controls",
  "loop",
  "muted",
  "readonly",
  "open",
  "reversed",
]);

function toAttributeName(key) {
  return key === "className" ? "class" : key;
}

function isEventProp(key) {
  return typeof key === "string" && key.startsWith(EVENT_PREFIX);
}

function getEventName(key) {
  return key.slice(2).toLowerCase();
}

function getListenerStore(node) {
  if (!node) return null;
  node.__simEventListeners = node.__simEventListeners || {};
  return node.__simEventListeners;
}

function removeEventListener(node, key) {
  const store = node?.__simEventListeners;
  if (!store) return;
  const existing = store[key];
  if (typeof existing === "function") {
    const eventName = getEventName(key);
    if (eventName) {
      node.removeEventListener(eventName, existing);
    }
  }
  delete store[key];
}

function attachEventListener(node, key, value) {
  if (typeof value !== "function") {
    removeEventListener(node, key);
    return;
  }
  const eventName = getEventName(key);
  if (!eventName) return;

  const store = getListenerStore(node);
  const existing = store[key];
  if (typeof existing === "function") {
    node.removeEventListener(eventName, existing);
  }
  node.addEventListener(eventName, value);
  store[key] = value;
}

function normalizeEventValue(value) {
  return typeof value === "function" ? value : null;
}

function isValidPath(path) {
  return (
    Array.isArray(path) &&
    path.every((index) => Number.isInteger(index) && index >= 0)
  );
}

function createDOMNodeFromVNode(vnode) {
  if (!vnode || typeof vnode !== "object") {
    return document.createTextNode("");
  }

  const type = String(vnode.type ?? "");
  const props = vnode.props && typeof vnode.props === "object" ? vnode.props : {};
  const children = Array.isArray(vnode.children) ? vnode.children : [];

  if (type === TEXT_KIND) {
    return document.createTextNode(String(props.nodeValue ?? ""));
  }

  const element = document.createElement(type);

  for (const [key, value] of Object.entries(props)) {
  if (key === TEXT_PROP) continue;
  if (isEventProp(key)) {
    if (typeof value === "function") {
      attachEventListener(element, key, value);
    }
    continue;
  }

    if (BOOLEAN_DOM_PROPS.has(key)) {
      if (value === true) {
        element[key] = true;
        continue;
      }

      if (value === false || typeof value === "undefined" || value === null) {
        element[key] = false;
        continue;
      }

      continue;
    }

    if (typeof value === "undefined" || value === null) continue;
    element.setAttribute(toAttributeName(key), String(value));
  }

  for (const child of children) {
    element.appendChild(createDOMNodeFromVNode(child));
  }

  return element;
}

export function getDOMNodeByPath(rootEl, path) {
  if (!rootEl || !isValidPath(path)) return null;

  if (path.length === 0) {
    return rootEl.firstChild;
  }

  let current = rootEl.firstChild;
  for (const index of path) {
    if (!current || !current.childNodes || index >= current.childNodes.length) return null;
    current = current.childNodes[index];
  }

  return current;
}

function getParentNodeByPath(rootEl, path) {
  if (!rootEl || !isValidPath(path)) return null;
  if (path.length === 0) return rootEl;
  return getDOMNodeByPath(rootEl, path.slice(0, -1));
}

function applyCreatePatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  if (!patch.node || typeof patch.node !== "object") return;

  const path = patch.path;
  const vnode = patch.node;

  const newNode = createDOMNodeFromVNode(vnode);

  if (path.length === 0) {
    if (rootEl.childNodes?.length && typeof rootEl.insertBefore === "function") {
      rootEl.insertBefore(newNode, rootEl.childNodes[0]);
    } else if (typeof rootEl.appendChild === "function") {
      rootEl.appendChild(newNode);
    }
    return;
  }

  const parent = getParentNodeByPath(rootEl, path);
  if (!parent || !parent.childNodes || typeof parent.appendChild !== "function") return;

  const index = path[path.length - 1];
  const referenceNode = parent.childNodes[index] ?? null;
  if (referenceNode && typeof parent.insertBefore === "function") {
    parent.insertBefore(newNode, referenceNode);
  } else {
    parent.appendChild(newNode);
  }
}

function applyRemovePatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  if (patch.path.length === 0) {
    if (rootEl.firstChild) {
      rootEl.removeChild(rootEl.firstChild);
    }
    return;
  }

  const target = getDOMNodeByPath(rootEl, patch.path);
  if (target && target.parentNode) {
    target.parentNode.removeChild(target);
  }
}

function applyReplacePatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  if (!patch.node || typeof patch.node !== "object") return;

  const path = patch.path;
  const vnode = patch.node;
  const newNode = createDOMNodeFromVNode(vnode);

  if (path.length === 0) {
    const current = rootEl.firstChild;
    if (current && typeof current.replaceWith === "function") {
      current.replaceWith(newNode);
    } else {
      rootEl.appendChild(newNode);
    }
    return;
  }

  const target = getDOMNodeByPath(rootEl, path);
  if (target && typeof target.replaceWith === "function") {
    target.replaceWith(newNode);
  }
}

function applyTextPatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  const target = getDOMNodeByPath(rootEl, patch.path);
  if (!target) return;

  const nextText = patch.text == null ? "" : String(patch.text);
  if (target.nodeType === 3) {
    target.nodeValue = nextText;
  } else {
    target.textContent = nextText;
  }
}

function applySetPropPatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  const target = getDOMNodeByPath(rootEl, patch.path);
  if (!target || target.nodeType !== 1) return;

  const key = patch.key;
  const value = patch.value;
  if (typeof key !== "string") return;
  if (isEventProp(key)) {
    const handler = normalizeEventValue(value);
    if (handler) {
      attachEventListener(target, key, handler);
    } else {
      removeEventListener(target, key);
    }
    return;
  }

  if (BOOLEAN_DOM_PROPS.has(key)) {
    if (value === true) {
      target[key] = true;
      return;
    }

    if (value === false || typeof value === "undefined" || value === null) {
      target[key] = false;
      return;
    }

    return;
  }

  if (typeof value === "undefined" || value === null) {
    target.removeAttribute(toAttributeName(key));
    return;
  }

  target.setAttribute(toAttributeName(key), String(value));
}

function applyRemovePropPatch(rootEl, patch) {
  if (!isValidPath(patch.path)) return;
  const target = getDOMNodeByPath(rootEl, patch.path);
  if (!target || target.nodeType !== 1) return;

  const key = patch.key;
  if (typeof key !== "string") return;
  if (isEventProp(key)) {
    removeEventListener(target, key);
    return;
  }

  if (BOOLEAN_DOM_PROPS.has(key)) {
    target[key] = false;
    return;
  }

  target.removeAttribute(toAttributeName(key));
}

export function applyPatches(rootEl, patches) {
  if (!rootEl || !Array.isArray(patches)) return;

  const removePatches = [];
  const restPatches = [];

  for (const patch of patches) {
    if (!patch || typeof patch !== "object" || typeof patch.kind !== "string") continue;
    if (patch.kind === "REMOVE") {
      removePatches.push(patch);
      continue;
    }

    restPatches.push(patch);
  }

  removePatches.sort((a, b) => comparePathDesc(a.path, b.path));
  const normalizedPatches = [...removePatches, ...restPatches];

  for (const patch of normalizedPatches) {
    switch (patch.kind) {
      case "CREATE":
        applyCreatePatch(rootEl, patch);
        break;
      case "REMOVE":
        applyRemovePatch(rootEl, patch);
        break;
      case "REPLACE":
        applyReplacePatch(rootEl, patch);
        break;
      case "TEXT":
        applyTextPatch(rootEl, patch);
        break;
      case "SET_PROP":
        applySetPropPatch(rootEl, patch);
        break;
      case "REMOVE_PROP":
        applyRemovePropPatch(rootEl, patch);
        break;
      default:
        break;
    }
  }
}

function comparePathDesc(leftPath, rightPath) {
  const left = Array.isArray(leftPath) ? leftPath : [];
  const right = Array.isArray(rightPath) ? rightPath : [];

  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const leftIndex = left[i] ?? -1;
    const rightIndex = right[i] ?? -1;
    if (leftIndex !== rightIndex) {
      return rightIndex - leftIndex;
    }
  }

  return right.length - left.length;
}

export default applyPatches;
