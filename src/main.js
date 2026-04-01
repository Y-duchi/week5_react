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
      case "set-lens":
        actions.setLens?.(target.dataset.lens);
        break;
      case "set-theme":
        actions.setTheme?.(target.dataset.theme);
        break;
      case "toggle-attendance":
        actions.toggleAttendance?.();
        break;
      case "toggle-checklist":
        actions.toggleChecklist?.(target.dataset.id);
        break;
      case "next-question":
        actions.nextQuestion?.();
        break;
      case "reset-board":
        actions.resetBoard?.();
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
      case "update-note":
        actions.updateNote?.(target.value);
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
