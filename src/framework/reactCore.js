import { cloneWithVNodeMetadata } from "../core/identity.js";
import { createTextVNode, createVNode } from "../core/types.js";
import { diff } from "../core/diff.js";
import { vNodeToDOM } from "../core/vNodeToDOM.js";
import { applyPatches } from "../core/patch.js";

const TEXT_TYPE = "TEXT";

let currentComponent = null;
let componentRenderStackDepth = 0;

function isFunctionComponent(type) {
  return typeof type === "function";
}

function normalizeTextChild(child) {
  if (child === false || child === true || child === null || typeof child === "undefined") {
    return null;
  }

  if (Array.isArray(child)) {
    return child.filter((item) => item !== null && typeof item !== "boolean");
  }

  if (typeof child === "string" || typeof child === "number" || typeof child === "bigint") {
    return createTextVNode(String(child));
  }

  if (typeof child === "function") {
    return null;
  }

  return child;
}

function flattenChildren(children) {
  const result = [];
  for (const child of children) {
    const normalized = normalizeTextChild(child);

    if (Array.isArray(normalized)) {
      result.push(...normalized.flat());
      continue;
    }

    if (normalized === null) {
      continue;
    }

    result.push(normalized);
  }

  return result;
}

function normalizeRootNode(node) {
  if (node == null) {
    return createVNode("div", { className: "empty-root" }, []);
  }

  if (node.type === TEXT_TYPE) {
    return createVNode("span", {}, [node]);
  }

  return node;
}

function getHook(component, index) {
  const hooks = component.__hooks;
  if (hooks[index] === undefined) {
    hooks[index] = {};
  }
  return hooks[index];
}

function areDepsEqual(oldDeps, newDeps) {
  if (!oldDeps || !newDeps) return false;
  if (oldDeps.length !== newDeps.length) return false;

  for (let index = 0; index < oldDeps.length; index += 1) {
    if (Object.is(oldDeps[index], newDeps[index])) continue;
    return false;
  }

  return true;
}

function assertHookContext(hookName) {
  if (!currentComponent || componentRenderStackDepth !== 1) {
    throw new Error(`${hookName} can only be used while a FunctionComponent is rendering.`);
  }
}

function enqueueUpdate(component) {
  if (component.__updateScheduled) return;
  component.__updateScheduled = true;
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      component.__updateScheduled = false;
      component.update();
    });
    return;
  }

  queueMicrotask(() => {
    component.__updateScheduled = false;
    component.update();
  });
}

export function useState(initialValue) {
  assertHookContext("useState");
  const component = currentComponent;
  const hookIndex = component.__hookIndex;
  const stateHook = getHook(component, hookIndex);
  component.__hookIndex += 1;

  if (!stateHook.__init) {
    stateHook.type = "state";
    stateHook.state =
      typeof initialValue === "function" ? initialValue() : initialValue;
    stateHook.__init = true;
  }

  if (!stateHook.setState) {
    stateHook.setState = (nextValueOrUpdater) => {
      const nextValue =
        typeof nextValueOrUpdater === "function"
          ? nextValueOrUpdater(stateHook.state)
          : nextValueOrUpdater;
      if (Object.is(stateHook.state, nextValue)) {
        return;
      }
      stateHook.state = nextValue;
      enqueueUpdate(component);
    };
  }

  return [stateHook.state, stateHook.setState];
}

export function useMemo(factory, deps) {
  assertHookContext("useMemo");
  const component = currentComponent;
  const hookIndex = component.__hookIndex;
  const memoHook = getHook(component, hookIndex);
  component.__hookIndex += 1;

  const nextDeps = Array.isArray(deps) ? deps : [];
  if (memoHook.__init && areDepsEqual(memoHook.deps, nextDeps)) {
    return memoHook.value;
  }

  const nextValue = typeof factory === "function" ? factory() : factory;
  memoHook.type = "memo";
  memoHook.value = nextValue;
  memoHook.deps = nextDeps;
  memoHook.__init = true;
  return nextValue;
}

export function useEffect(effect, deps = []) {
  assertHookContext("useEffect");
  const component = currentComponent;
  const hookIndex = component.__hookIndex;
  const effectHook = getHook(component, hookIndex);
  component.__hookIndex += 1;

  const nextDeps = Array.isArray(deps) ? deps : [];
  const changed = !effectHook.__init || !areDepsEqual(effectHook.deps, nextDeps);

  effectHook.type = "effect";
  effectHook.effect = effect;
  effectHook.deps = nextDeps;
  effectHook.changed = changed;
  effectHook.__init = true;

  if (changed) {
    component.__pendingEffects.push(effectHook);
  }
}

function runPendingEffects(component) {
  const toRun = component.__pendingEffects;
  component.__pendingEffects = [];

  for (const hook of toRun) {
    if (hook.cleanup) {
      hook.cleanup();
      hook.cleanup = null;
    }

    const result = hook.effect?.();
    if (typeof result === "function") {
      hook.cleanup = result;
    }
  }
}

export function createElement(type, props, ...children) {
  const nextProps = props ? { ...props } : {};
  const normalizedChildren = flattenChildren(children);

  if (isFunctionComponent(type)) {
    if (componentRenderStackDepth > 1) {
      return normalizeRootNode(type({ ...nextProps, children: normalizedChildren }));
    }

    const previousComponent = currentComponent;
    const previousDepth = componentRenderStackDepth;
    currentComponent = null;
    componentRenderStackDepth += 1;
    const childNode = type({ ...nextProps, children: normalizedChildren });
    currentComponent = previousComponent;
    componentRenderStackDepth = previousDepth;
    return normalizeRootNode(childNode);
  }

  return createVNode(type, nextProps, normalizedChildren);
}

export class FunctionComponent {
  constructor(componentFn, name = "RootComponent") {
    this.type = componentFn;
    this.name = name;
    this.__hooks = [];
    this.__hookIndex = 0;
    this.__pendingEffects = [];
    this.__updateScheduled = false;
    this.__vnode = null;
    this.__container = null;
    this.props = {};
  }

  mount(container, props = {}) {
    this.__container = container;
    this.props = props;
    const firstVNode = this.render();
    this.__vnode = firstVNode;
    const rootNode = vNodeToDOM(firstVNode);

    this.__container.replaceChildren();
    if (rootNode) {
      this.__container.appendChild(rootNode);
    }
    runPendingEffects(this);
    return rootNode;
  }

  render() {
    const prevComponent = currentComponent;
    const previousDepth = componentRenderStackDepth;
    currentComponent = this;
    componentRenderStackDepth += 1;
    this.__hookIndex = 0;
    this.__pendingEffects = [];

    let nextVNode;
    try {
      nextVNode = this.type(this.props);
    } finally {
      componentRenderStackDepth = previousDepth;
      currentComponent = prevComponent;
    }

    nextVNode = normalizeRootNode(nextVNode);
    nextVNode = cloneWithVNodeMetadata(nextVNode);
    return nextVNode;
  }

  update(props) {
    if (props) {
      this.props = props;
    }

    const nextVNode = this.render();
    const previousVNode = this.__vnode;
    const patches = previousVNode ? diff(previousVNode, nextVNode, { skipIdentityPrep: true }) : [];

    if (previousVNode) {
      if (patches.length > 0) {
        applyPatches(this.__container, patches);
      }
    } else {
      const rootNode = vNodeToDOM(nextVNode);
      this.__container.replaceChildren();
      if (rootNode) this.__container.appendChild(rootNode);
    }

    this.__vnode = nextVNode;
    runPendingEffects(this);
    return patches;
  }

  forceRender() {
    return this.update();
  }
}

export function createRoot(Component, container, props = {}) {
  const app = new FunctionComponent(Component, Component.name || "RootComponent");
  app.mount(container, props);
  return app;
}
