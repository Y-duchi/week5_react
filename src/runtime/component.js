import { diffTrees, summarizeChanges } from "../core/diff.js";
import { cloneVdom, renderVdom, serializeVdom } from "../core/vdom.js";
import { patchDom } from "../core/patch.js";
import { fragment } from "./h.js";
import { runWithHooks } from "./hooks.js";

function defaultScheduler(task) {
  queueMicrotask(task);
}

function ensureTree(node) {
  return node?.type ? node : fragment();
}

function countNodes(vnode) {
  if (!vnode) {
    return 0;
  }

  if (vnode.type === "fragment") {
    return vnode.children.reduce((count, child) => count + countNodes(child), 0);
  }

  if (vnode.type === "text") {
    return 1;
  }

  return 1 + (vnode.children ?? []).reduce((count, child) => count + countNodes(child), 0);
}

export class FunctionComponent {
  constructor(renderFn, props = {}, options = {}) {
    this.renderFn = renderFn;
    this.props = props;
    this.container = options.container ?? null;
    this.hooks = [];
    this.hookCursor = 0;
    this.pendingEffects = [];
    this.currentTree = null;
    this.isMounted = false;
    this.isUpdateScheduled = false;
    this.renderCount = 0;
    this.lastCommit = null;
    this.onCommit = options.onCommit ?? null;
    this.scheduler = options.scheduler ?? defaultScheduler;
    this.mountRenderer = options.mountRenderer ?? ((container, tree) => renderVdom(container, tree));
    this.patchRenderer =
      options.patchRenderer ?? ((container, previousTree, nextTree) => patchDom(container, previousTree, nextTree));
  }

  mount(container = this.container) {
    if (!container) {
      throw new Error("FunctionComponent.mount requires a container.");
    }

    this.container = container;
    const nextTree = this.renderTree();
    this.mountRenderer(container, nextTree);

    this.currentTree = cloneVdom(nextTree);
    this.isMounted = true;

    const commit = this.createCommit("mount", [], {
      mutationCount: countNodes(nextTree),
      movedCount: 0,
    });

    this.lastCommit = commit;
    this.flushEffects();
    this.onCommit?.(commit, this);

    return commit;
  }

  update() {
    if (!this.isMounted) {
      return this.mount(this.container);
    }

    const previousTree = cloneVdom(this.currentTree);
    const nextTree = this.renderTree();
    const changes = diffTrees(previousTree, nextTree);
    const patchMeta = this.patchRenderer(this.container, previousTree, nextTree) ?? {
      mutationCount: changes.length,
      movedCount: 0,
    };

    this.currentTree = cloneVdom(nextTree);

    const commit = this.createCommit("update", changes, patchMeta);
    this.lastCommit = commit;
    this.flushEffects();
    this.onCommit?.(commit, this);

    return commit;
  }

  scheduleUpdate() {
    if (this.isUpdateScheduled) {
      return;
    }

    this.isUpdateScheduled = true;
    this.scheduler(() => {
      this.isUpdateScheduled = false;
      this.update();
    });
  }

  destroy() {
    this.hooks.forEach((hook) => {
      if (hook?.type === "effect" && typeof hook.cleanup === "function") {
        hook.cleanup();
      }
    });

    this.pendingEffects = [];
    this.isMounted = false;
  }

  renderTree() {
    this.renderCount += 1;

    return ensureTree(
      runWithHooks(this, () => this.renderFn(this.props)),
    );
  }

  flushEffects() {
    const queue = [...this.pendingEffects];
    this.pendingEffects = [];

    queue.forEach(({ hookIndex, effect }) => {
      const hook = this.hooks[hookIndex];

      if (!hook) {
        return;
      }

      if (typeof hook.cleanup === "function") {
        hook.cleanup();
      }

      const cleanup = effect();
      hook.cleanup = typeof cleanup === "function" ? cleanup : null;
    });
  }

  createCommit(phase, changes, patchMeta) {
    return {
      phase,
      timestamp: new Date().toISOString(),
      changes,
      summary: summarizeChanges(changes),
      patchMeta,
      hookCount: this.hooks.length,
      html: serializeVdom(this.currentTree ?? fragment()),
    };
  }
}
