/**
 * 역할:
 * - 루트 컴포넌트가 사용할 초기 상태, localStorage persistence, 마지막 commit 메타데이터를 관리합니다.
 * - setState 이후 update 트리거는 FunctionComponent에 위임하되, store가 루트와 연결되는 구조를 명확히 보여줍니다.
 */

import { sampleTasks } from "../sampleMarkup.js";

export const APP_STORAGE_KEY = "virtual-dom:week5:task-manager";
export const FILTER_OPTIONS = ["all", "active", "completed"];

export function createAppStore(options = {}) {
  const storage = options.storage ?? resolveStorage();
  const storageKey = options.storageKey ?? APP_STORAGE_KEY;
  const initialState = createInitialAppState({
    storage,
    storageKey,
    seedTasks: options.seedTasks ?? sampleTasks,
  });

  let rootComponent = null;
  let lastPersistedState = cloneState(initialState);
  let lastCommit = createEmptyCommit();

  return {
    attachRoot(component) {
      rootComponent = component;
    },

    getInitialState() {
      return cloneState(initialState);
    },

    requestUpdate() {
      return rootComponent?.requestUpdate?.() ?? rootComponent?.update?.();
    },

    persistState(nextState) {
      lastPersistedState = sanitizeState(nextState);

      storage.setItem(
        storageKey,
        JSON.stringify({
          tasks: lastPersistedState.tasks,
        }),
      );
    },

    recordCommit(commit) {
      lastCommit = {
        renderCount: commit.renderCount ?? 0,
        hookCount: commit.hookCount ?? 0,
        changeCount: commit.changeSummary?.total ?? 0,
        changeSummary: cloneSerializable(commit.changeSummary ?? { total: 0, byType: {} }),
        stateSnapshot: cloneSerializable(commit.stateSnapshot),
        hooks: cloneSerializable(commit.hooks ?? []),
        changes: (commit.changes ?? []).map((change) => summarizeChange(change)),
      };
    },

    getLastCommit() {
      return cloneSerializable(lastCommit);
    },

    getStorageKey() {
      return storageKey;
    },
  };
}

export function createInitialAppState({ storage, storageKey = APP_STORAGE_KEY, seedTasks = sampleTasks } = {}) {
  const storedPayload = readStoredState(storage, storageKey);
  const tasks = sanitizeTasks(storedPayload?.tasks?.length ? storedPayload.tasks : seedTasks);

  return {
    tasks,
    draftTitle: "",
    search: "",
    filter: "all",
    nextId: deriveNextId(tasks),
  };
}

export function createMemoryStorage(initialEntries = {}) {
  const memory = new Map(Object.entries(initialEntries));

  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },

    setItem(key, value) {
      memory.set(key, String(value));
    },

    removeItem(key) {
      memory.delete(key);
    },

    clear() {
      memory.clear();
    },
  };
}

function resolveStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return createMemoryStorage();
  }

  try {
    const probeKey = "__mini-react-storage-probe__";
    window.localStorage.setItem(probeKey, "ok");
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

function readStoredState(storage, storageKey) {
  if (!storage?.getItem) {
    return null;
  }

  try {
    const raw = storage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sanitizeState(state) {
  const tasks = sanitizeTasks(state?.tasks ?? sampleTasks);

  return {
    tasks,
    draftTitle: String(state?.draftTitle ?? ""),
    search: String(state?.search ?? ""),
    filter: FILTER_OPTIONS.includes(state?.filter) ? state.filter : "all",
    nextId: Math.max(Number(state?.nextId ?? 0), deriveNextId(tasks)),
  };
}

function sanitizeTasks(tasks) {
  return tasks.map((task, index) => ({
    id: Number(task.id ?? index + 1),
    title: String(task.title ?? `Task ${index + 1}`).trim(),
    category: String(task.category ?? "General"),
    completed: Boolean(task.completed),
    createdAt: String(task.createdAt ?? "2026-04-01"),
  }));
}

function deriveNextId(tasks) {
  const maxId = tasks.reduce((currentMax, task) => Math.max(currentMax, Number(task.id ?? 0)), 0);
  return maxId + 1;
}

function summarizeChange(change) {
  const summarized = {
    type: change.type,
    path: [...(change.path ?? [])],
  };

  if ("attribute" in change) {
    summarized.attribute = change.attribute;
  }

  if ("prevValue" in change && typeof change.prevValue !== "function") {
    summarized.prevValue = change.prevValue;
  }

  if ("nextValue" in change && typeof change.nextValue !== "function") {
    summarized.nextValue = change.nextValue;
  }

  if ("from" in change) {
    summarized.from = change.from;
  }

  if ("to" in change) {
    summarized.to = change.to;
  }

  if ("key" in change) {
    summarized.key = change.key;
  }

  if ("prevNode" in change) {
    summarized.prevNode = summarizeNode(change.prevNode);
  }

  if ("nextNode" in change) {
    summarized.nextNode = summarizeNode(change.nextNode);
  }

  return summarized;
}

function summarizeNode(node) {
  if (!node) {
    return null;
  }

  if (node.type === "text") {
    return {
      type: "text",
      value: node.value,
    };
  }

  if (node.type === "fragment") {
    return {
      type: "fragment",
      childCount: node.children?.length ?? 0,
    };
  }

  return {
    type: "element",
    tagName: node.tagName,
    attrs: Object.fromEntries(
      Object.entries(node.attrs ?? {}).filter(([, value]) => typeof value !== "function"),
    ),
    childCount: node.children?.length ?? 0,
  };
}

function createEmptyCommit() {
  return {
    renderCount: 0,
    hookCount: 0,
    changeCount: 0,
    changeSummary: { total: 0, byType: {} },
    stateSnapshot: null,
    hooks: [],
    changes: [],
  };
}

function cloneState(state) {
  return cloneSerializable(state);
}

function cloneSerializable(value) {
  if (value == null || typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneSerializable(item));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneSerializable(item)]),
  );
}
