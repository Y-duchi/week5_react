import { formatPath } from "./core/diff.js";
import { App, getAppActions } from "./app/App.js";
import { FunctionComponent } from "./runtime/component.js";

const HOOK_DEBUG_LABELS = [
  "draftTitle",
  "tasks",
  "filter",
  "selectedTaskId",
  "nextTaskId",
  "effectMessage",
];

function setPanelText(container, id, value) {
  const node = container.querySelector(`#${id}`);

  if (node) {
    node.textContent = value;
  }
}

function summarizeByType(byType) {
  const labels = {
    CREATE_NODE: "create",
    REMOVE_NODE: "remove",
    REPLACE_NODE: "replace",
    UPDATE_TEXT: "text",
    SET_ATTRIBUTE: "set-attr",
    REMOVE_ATTRIBUTE: "remove-attr",
    MOVE_CHILD: "move",
  };
  const entries = Object.entries(byType);

  if (entries.length === 0) {
    return "초기 mount";
  }

  return entries
    .map(([type, count]) => `${labels[type] ?? type.toLowerCase()} ${count}`)
    .join(" · ");
}

function describeChange(change) {
  const path = formatPath(change.path ?? []);

  switch (change.type) {
    case "CREATE_NODE":
      return `${path}: 새 노드 생성`;
    case "REMOVE_NODE":
      return `${path}: 노드 제거`;
    case "REPLACE_NODE":
      return `${path}: 노드 교체`;
    case "UPDATE_TEXT":
      return `${path}: 텍스트 변경`;
    case "SET_ATTRIBUTE":
      return `${path}: ${change.attribute} 속성 설정`;
    case "REMOVE_ATTRIBUTE":
      return `${path}: ${change.attribute} 속성 제거`;
    case "MOVE_CHILD":
      return `${path}: 자식 노드 순서 이동`;
    default:
      return `${path}: ${change.type}`;
  }
}

function formatHookValue(label, value) {
  if (label === "tasks" && Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (typeof value === "string") {
    return value || "(빈 문자열)";
  }

  if (value == null) {
    return "null";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  return JSON.stringify(value);
}

function createHookSnapshot(instance) {
  return HOOK_DEBUG_LABELS.map((label, slot) => ({
    slot,
    label,
    value: formatHookValue(label, instance.hooks[slot]?.value),
  }));
}

function summarizeHookDelta(previousSnapshot, nextSnapshot, phase) {
  if (phase === "mount") {
    return nextSnapshot.map((item) => `Hook[${item.slot}] ${item.label}: ${item.value}`);
  }

  return nextSnapshot.flatMap((item) => {
    const previous = previousSnapshot[item.slot];

    if (!previous || previous.value !== item.value) {
      return [`Hook[${item.slot}] ${item.label}: ${previous?.value ?? "(없음)"} -> ${item.value}`];
    }

    return [];
  });
}

function syncRuntimePanel(
  container,
  commit,
  instance,
  previousHookSnapshot,
  nextHookSnapshot,
  hookDeltaHistory,
) {
  const summary = commit?.summary ?? { total: 0, byType: {} };
  const patchMeta = commit?.patchMeta ?? { mutationCount: 0 };
  const updatedAt = commit?.timestamp
    ? new Date(commit.timestamp).toLocaleTimeString("ko-KR")
    : "-";

  setPanelText(container, "runtime-render-count", String(instance.renderCount));
  setPanelText(container, "runtime-change-count", String(summary.total));
  setPanelText(container, "runtime-patch-count", String(patchMeta.mutationCount ?? 0));
  setPanelText(container, "runtime-hook-count", String(commit?.hookCount ?? 0));
  setPanelText(container, "runtime-phase", commit?.phase ?? "mount");
  setPanelText(container, "runtime-summary", summarizeByType(summary.byType));
  setPanelText(container, "runtime-html-size", `${commit?.html?.length ?? 0} chars`);
  setPanelText(container, "runtime-updated-at", updatedAt);

  const changeLog = container.querySelector("#runtime-change-log");
  const hookDelta = container.querySelector("#runtime-hook-delta");
  const htmlPreview = container.querySelector("#runtime-html-preview");

  if (hookDelta) {
    hookDelta.textContent = hookDeltaHistory.length
      ? hookDeltaHistory.join("\n")
      : "최근 커밋에서 바뀐 핵심 hook 슬롯이 없습니다.";
  }

  if (changeLog) {
    changeLog.textContent = commit?.changes?.length
      ? commit.changes.slice(0, 12).map(describeChange).join("\n")
      : "변경 없음 (mount 또는 같은 값으로 재렌더)";
  }

  if (htmlPreview) {
    htmlPreview.textContent = commit?.html?.slice(0, 1200) ?? "";
  }
}

function bindDelegatedEvents(container, getActions) {
  function onClick(event) {
    const target = event.target.closest("[data-action]");

    if (!target || !container.contains(target)) {
      return;
    }

    const actions = getActions();

    switch (target.dataset.action) {
      case "add-task":
        actions.addTask?.(container.querySelector('[data-action="update-draft-title"]')?.value ?? "");
        break;
      case "set-filter":
        actions.setFilter?.(target.dataset.filter);
        break;
      case "select-task":
        actions.selectTask?.(target.dataset.id);
        break;
      case "toggle-task":
        actions.toggleTask?.(target.dataset.id);
        break;
      case "remove-task":
        actions.removeTask?.(target.dataset.id);
        break;
      case "reset-demo":
        actions.resetDemo?.();
        break;
      default:
        break;
    }
  }

  function onInput(event) {
    const target = event.target.closest("[data-action]");

    if (!target || !container.contains(target)) {
      return;
    }

    const actions = getActions();

    switch (target.dataset.action) {
      case "update-draft-title":
        actions.updateDraftTitle?.(target.value);
        break;
      case "update-task-note":
        actions.updateTaskNote?.(target.value);
        break;
      default:
        break;
    }
  }

  container.addEventListener("click", onClick);
  container.addEventListener("input", onInput);

  return () => {
    container.removeEventListener("click", onClick);
    container.removeEventListener("input", onInput);
  };
}

export function mountApplication(container) {
  const existingController = container.__miniReactController;

  if (existingController) {
    existingController.destroy();
  }

  const removeListeners = bindDelegatedEvents(container, getAppActions);
  let previousHookSnapshot = [];
  let hookDeltaHistory = [];
  const instance = new FunctionComponent(App, {}, {
    onCommit(commit, component) {
      const nextHookSnapshot = createHookSnapshot(component);
      const deltaLines = summarizeHookDelta(
        previousHookSnapshot,
        nextHookSnapshot,
        commit?.phase ?? "mount",
      );

      if (deltaLines.length) {
        hookDeltaHistory = [...deltaLines, ...hookDeltaHistory].slice(0, 12);
      }

      syncRuntimePanel(
        container,
        commit,
        component,
        previousHookSnapshot,
        nextHookSnapshot,
        hookDeltaHistory,
      );
      previousHookSnapshot = nextHookSnapshot;
    },
  });

  instance.mount(container);
  const mountedHookSnapshot = createHookSnapshot(instance);
  syncRuntimePanel(container, instance.lastCommit, instance, [], mountedHookSnapshot, hookDeltaHistory);
  previousHookSnapshot = mountedHookSnapshot;

  const controller = {
    instance,
    destroy() {
      removeListeners();
      instance.destroy();

      if (container.__miniReactController === controller) {
        delete container.__miniReactController;
      }
    },
  };

  container.__miniReactController = controller;

  return controller;
}

if (typeof document !== "undefined") {
  const root = document.querySelector("#app");

  if (root) {
    mountApplication(root);
  }
}
