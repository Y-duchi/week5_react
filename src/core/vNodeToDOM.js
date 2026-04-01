import { TEXT_NODE_TYPE } from "./types.js";

const EVENT_PREFIX = "on";
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

function isEventProp(name) {
  return typeof name === "string" && name.startsWith(EVENT_PREFIX);
}

function getListenerStore(node) {
  node.__simEventListeners = node.__simEventListeners || {};
  return node.__simEventListeners;
}

function removeEvent(node, key, existing) {
  const eventName = key.slice(2).toLowerCase();
  node.removeEventListener(eventName, existing);
}

function bindEvent(node, key, value) {
  const eventName = key.slice(2).toLowerCase();
  if (!eventName || typeof value !== "function") return;
  const store = getListenerStore(node);
  const existing = store[key];
  if (existing) {
    removeEvent(node, key, existing);
  }
  node.addEventListener(eventName, value);
  store[key] = value;
}

function setProps(domNode, props = {}) {
  for (const [name, value] of Object.entries(props)) {
    if (name === "nodeValue") {
      continue;
    }
    if (isEventProp(name)) {
      bindEvent(domNode, name, value);
      continue;
    }

    if (BOOLEAN_DOM_PROPS.has(name)) {
      if (value === true) {
        domNode[name] = true;
        continue;
      }

      if (value === false || typeof value === "undefined" || value === null) {
        domNode[name] = false;
        continue;
      }

      continue;
    }

    const attributeName = name === "className" ? "class" : name;
    if (value === false || typeof value === "undefined" || value === null) {
      domNode.removeAttribute(attributeName);
      continue;
    }
    domNode.setAttribute(attributeName, String(value));
  }
}

/**
 * Builds a real DOM node from a VNode.
 */
export function vNodeToDOM(vnode) {
  if (!vnode) {
    return null;
  }

  if (vnode.type === TEXT_NODE_TYPE) {
    return document.createTextNode(vnode.props?.nodeValue ?? "");
  }

  const domNode = document.createElement(vnode.type);
  const props = vnode.props || {};
  const children = Array.isArray(vnode.children) ? vnode.children : [];

  setProps(domNode, props);

  for (const child of children) {
    const childNode = vNodeToDOM(child);

    if (childNode) {
      domNode.appendChild(childNode);
    }
  }

  return domNode;
}
