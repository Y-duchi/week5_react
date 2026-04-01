/**
 * 역할:
 * - 함수형 컴포넌트를 감싸는 FunctionComponent 클래스를 제공합니다.
 * - mount/update에서 render -> diff -> patch -> effect 흐름을 명확하게 연결합니다.
 *
 * 관련 파일:
 * - hooks.js: 현재 렌더 중인 루트 컴포넌트를 참조해 hooks 상태를 유지합니다.
 * - renderer는 별도 파일로 나누지 않고 여기서 직접 diff/patch와 이어집니다.
 */

import { diffTrees, summarizeChanges } from "./diff.js";
import { patchDom } from "./patch.js";
import { scheduleComponentUpdate } from "./scheduler.js";
import { cloneVdom, normalizeRootVdom, renderVdom } from "./vdom.js";

let activeComponent = null;
let componentDepth = 0;

export class FunctionComponent {
  constructor(renderFn, options = {}) {
    this.renderFn = renderFn;
    this.props = options.props ?? {};
    this.container = options.container ?? null;
    this.store = options.store ?? null;
    this.onCommit = options.onCommit ?? null;
    this.hooks = [];
    this.hookCursor = 0;
    this.pendingEffects = [];
    this.currentVdom = normalizeRootVdom(null);
    this.renderCount = 0;
    this.isMounted = false;

    if (this.store?.attachRoot) {
      this.store.attachRoot(this);
    }
  }

  mount(container = this.container) {
    this.container = container ?? this.container;
    return this.performCommit();
  }

  update(nextProps = this.props) {
    this.props = nextProps;
    return this.performCommit();
  }

  requestUpdate() {
    return scheduleComponentUpdate(this);
  }

  queueEffect(entry) {
    this.pendingEffects.push(entry);
  }

  getStateSnapshot() {
    const stateHooks = this.hooks.filter((hook) => hook?.kind === "state");

    if (stateHooks.length === 0) {
      return null;
    }

    if (stateHooks.length === 1) {
      return cloneDebugValue(stateHooks[0].value);
    }

    return stateHooks.map((hook) => cloneDebugValue(hook.value));
  }

  getHookDebugInfo() {
    return this.hooks.map((hook, index) => summarizeHook(hook, index));
  }

  destroy() {
    for (const hook of this.hooks) {
      if (hook?.kind === "effect" && typeof hook.cleanup === "function") {
        hook.cleanup();
      }
    }

    this.pendingEffects = [];
    this.isMounted = false;
  }

  performCommit() {
    const previousVdom = cloneVdom(this.currentVdom);
    const nextVdom = this.render();
    const changes = diffTrees(previousVdom, nextVdom);

    if (this.container && typeof document !== "undefined") {
      if (!this.isMounted) {
        renderVdom(this.container, nextVdom);
      } else {
        patchDom(this.container, previousVdom, nextVdom);
      }
    }

    this.currentVdom = cloneVdom(nextVdom);
    this.renderCount += 1;
    this.isMounted = true;
    this.flushEffects();

    const commitInfo = {
      renderCount: this.renderCount,
      hookCount: this.hooks.length,
      stateSnapshot: this.getStateSnapshot(),
      hooks: this.getHookDebugInfo(),
      changes,
      changeSummary: summarizeChanges(changes),
    };

    this.store?.recordCommit?.(commitInfo);
    this.onCommit?.(commitInfo);

    return nextVdom;
  }

  render() {
    const previousActiveComponent = activeComponent;
    const previousDepth = componentDepth;

    activeComponent = this;
    componentDepth = 0;
    this.hookCursor = 0;
    this.pendingEffects = [];

    try {
      return normalizeRootVdom(this.renderFn(this.props));
    } finally {
      activeComponent = previousActiveComponent;
      componentDepth = previousDepth;
    }
  }

  flushEffects() {
    for (const pending of this.pendingEffects) {
      const hook = this.hooks[pending.index];

      if (typeof hook.cleanup === "function") {
        hook.cleanup();
      }

      const cleanup = pending.effect();
      hook.cleanup = typeof cleanup === "function" ? cleanup : null;
      hook.deps = pending.deps;
      hook.runCount = (hook.runCount ?? 0) + 1;
    }

    this.pendingEffects = [];
  }
}

export function getActiveComponent() {
  return activeComponent;
}

export function assertRootHookUsage(hookName) {
  if (!activeComponent) {
    throw new Error(`${hookName} must be called during FunctionComponent rendering.`);
  }

  if (componentDepth > 0) {
    throw new Error(`${hookName} is only allowed in the root component of this project.`);
  }

  return activeComponent;
}

export function renderChild(componentFn, props = {}) {
  const previousDepth = componentDepth;
  componentDepth += 1;

  try {
    return componentFn(props);
  } finally {
    componentDepth = previousDepth;
  }
}

function summarizeHook(hook, index) {
  if (!hook) {
    return { index, kind: "empty" };
  }

  if (hook.kind === "state") {
    return {
      index,
      kind: "state",
      value: summarizeValue(hook.value),
    };
  }

  if (hook.kind === "memo") {
    return {
      index,
      kind: "memo",
      deps: summarizeValue(hook.deps ?? []),
      value: summarizeValue(hook.value),
      recomputeCount: hook.recomputeCount ?? 0,
      cacheHits: hook.cacheHits ?? 0,
    };
  }

  if (hook.kind === "effect") {
    return {
      index,
      kind: "effect",
      deps: summarizeValue(hook.deps ?? hook.nextDeps ?? []),
      runCount: hook.runCount ?? 0,
      hasCleanup: typeof hook.cleanup === "function",
    };
  }

  return {
    index,
    kind: hook.kind ?? "unknown",
  };
}

function summarizeValue(value, depth = 0) {
  if (value == null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.length > 60 ? `${value.slice(0, 57)}...` : value;
  }

  if (typeof value === "function") {
    return `[Function ${value.name || "anonymous"}]`;
  }

  if (Array.isArray(value)) {
    if (depth >= 2) {
      return `[Array(${value.length})]`;
    }

    return value.slice(0, 4).map((item) => summarizeValue(item, depth + 1));
  }

  if (depth >= 2) {
    return "[Object]";
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 6)
      .map(([key, item]) => [key, summarizeValue(item, depth + 1)]),
  );
}

function cloneDebugValue(value) {
  if (value == null || typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneDebugValue(item));
  }

  if (typeof value === "function") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneDebugValue(item)]),
  );
}
