import { formatPath } from "./core/diff.js";
import { App, getAppActions } from "./app/App.js";
import { FunctionComponent } from "./runtime/component.js";

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

function syncRuntimePanel(container, commit, instance) {
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
  const htmlPreview = container.querySelector("#runtime-html-preview");

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
      case "set-section":
        actions.setSection?.(target.dataset.section);
        break;
      case "toggle-important":
        actions.toggleImportant?.();
        break;
      case "next-step":
        actions.nextStep?.();
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
      case "search-query":
        actions.searchQuery?.(target.value);
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
  const removeListeners = bindDelegatedEvents(container, getAppActions);
  const instance = new FunctionComponent(App, {}, {
    onCommit(commit, component) {
      syncRuntimePanel(container, commit, component);
    },
  });

  instance.mount(container);
  syncRuntimePanel(container, instance.lastCommit, instance);

  return {
    instance,
    destroy() {
      removeListeners();
      instance.destroy();
    },
  };
}

if (typeof document !== "undefined") {
  const root = document.querySelector("#app");

  if (root) {
    mountApplication(root);
  }
}
