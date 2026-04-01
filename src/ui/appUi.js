/**
 * 역할:
 * - 루트 App과 props-only 자식 컴포넌트를 정의합니다.
 * - 브라우저 우측 inspector 패널 렌더링도 함께 맡아, 과제 발표 시 한 파일에서 UI 구조를 읽을 수 있게 합니다.
 */

import { renderChild } from "../core/component.js";
import { useEffect, useMemo, useState } from "../core/hooks.js";
import { h } from "../core/vdom.js";
import { frameworkHighlights } from "../sampleMarkup.js";
import { FILTER_OPTIONS } from "../state/store.js";

const FILTER_LABELS = {
  all: "전체",
  active: "진행 중",
  completed: "완료",
};

export function App({ store }) {
  const [state, setState] = useState(() => store.getInitialState());

  const actions = useMemo(() => createActions(setState), []);
  const filteredTasks = useMemo(
    () => selectVisibleTasks(state.tasks, state.search, state.filter),
    [state.tasks, state.search, state.filter],
  );
  const stats = useMemo(
    () => buildStats(state.tasks, filteredTasks.length),
    [state.tasks, filteredTasks.length],
  );

  useEffect(() => {
    store.persistState(state);
  }, [store, state.tasks]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousTitle = document.title;
    document.title = `${stats.remaining}개 남음 | Week5 Mini React`;

    return () => {
      document.title = previousTitle;
    };
  }, [stats.remaining, stats.total]);

  return h("div", { class: "task-app" }, [
    renderChild(Header, {
      total: stats.total,
      remaining: stats.remaining,
      visibleCount: stats.visibleCount,
      activeFilter: state.filter,
    }),

    h("div", { class: "task-grid" }, [
      h("section", { class: "task-card task-card--main" }, [
        renderChild(TaskInput, {
          draftTitle: state.draftTitle,
          onInput: actions.handleDraftInput,
          onSubmit: actions.handleAddSubmit,
        }),
        renderChild(SearchBar, {
          search: state.search,
          onInput: actions.handleSearchInput,
          onClear: actions.handleClearSearch,
        }),
        renderChild(FilterTabs, {
          activeFilter: state.filter,
          stats,
          onSelect: actions.handleFilterSelect,
        }),
        renderChild(TaskList, {
          tasks: filteredTasks,
          search: state.search,
          onToggle: actions.handleTaskToggle,
          onRemove: actions.handleTaskRemove,
        }),
      ]),

      h("aside", { class: "task-card task-card--side" }, [
        renderChild(StatsPanel, {
          stats,
          activeFilter: state.filter,
          search: state.search,
        }),
        renderChild(FrameworkPanel, {}),
      ]),
    ]),
  ]);
}

export function getInspectorElements(scope = document) {
  const renderCount = scope.getElementById("runtime-render-count");

  if (!renderCount) {
    return null;
  }

  return {
    renderCount,
    changeCount: scope.getElementById("runtime-change-count"),
    completedCount: scope.getElementById("runtime-completed-count"),
    memoCacheHits: scope.getElementById("runtime-memo-cache-hits"),
    summary: scope.getElementById("runtime-summary"),
    stateSnapshot: scope.getElementById("runtime-state"),
    hookSnapshot: scope.getElementById("runtime-hooks"),
    changeLog: scope.getElementById("runtime-changes"),
  };
}

export function renderRuntimeInspector(elements, commit) {
  if (!elements || !commit) {
    return;
  }

  const memoCacheHits = (commit.hooks ?? [])
    .filter((hook) => hook.kind === "memo")
    .reduce((total, hook) => total + Number(hook.cacheHits ?? 0), 0);
  const completedCount = commit.stateSnapshot?.tasks?.filter?.((task) => task.completed).length ?? 0;

  elements.renderCount.textContent = String(commit.renderCount ?? 0);
  elements.changeCount.textContent = String(commit.changeCount ?? 0);
  elements.completedCount.textContent = String(completedCount);
  elements.memoCacheHits.textContent = String(memoCacheHits);
  elements.summary.textContent = formatSummary(commit.changeSummary);
  elements.stateSnapshot.textContent = JSON.stringify(compactState(commit.stateSnapshot), null, 2);
  elements.hookSnapshot.textContent = JSON.stringify(commit.hooks ?? [], null, 2);
  elements.changeLog.textContent =
    commit.changes?.length > 0
      ? JSON.stringify(commit.changes, null, 2)
      : "// 마지막 렌더에서 실제 DOM patch가 필요하지 않았습니다.";
}

function Header({ total, remaining, visibleCount, activeFilter }) {
  return h("header", { class: "task-hero" }, [
    h("div", { class: "task-hero__copy" }, [
      h("p", { class: "eyebrow" }, "Week 5 · React-like Mini Framework"),
      h("h1", {}, "Task Manager / Todo Dashboard"),
      h(
        "p",
        { class: "hero-copy" },
        "루트 App이 모든 state와 hooks를 관리하고, 자식 컴포넌트는 props만 받아 렌더링하는 구조입니다.",
      ),
    ]),
    h("div", { class: "hero-badges" }, [
      h("span", { class: "hero-badge" }, `총 ${total}개`),
      h("span", { class: "hero-badge hero-badge--accent" }, `남은 일 ${remaining}개`),
      h("span", { class: "hero-badge" }, `현재 보기 ${FILTER_LABELS[activeFilter]} · ${visibleCount}개`),
    ]),
  ]);
}

function TaskInput({ draftTitle, onInput, onSubmit }) {
  const isDisabled = draftTitle.trim().length === 0;

  return h("section", { class: "composer" }, [
    h("div", { class: "section-head" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Add Task"), h("h2", {}, "새 작업 추가")]),
      h("span", { class: "section-chip" }, "루트 state 업데이트"),
    ]),
    h("form", { class: "composer-form", onSubmit }, [
      h("input", {
        id: "task-title-input",
        class: "field-input",
        type: "text",
        value: draftTitle,
        placeholder: "예: useEffect cleanup 테스트 정리",
        onInput,
      }),
      h(
        "button",
        {
          id: "task-add-button",
          class: "primary-button",
          type: "submit",
          disabled: isDisabled,
        },
        "추가",
      ),
    ]),
  ]);
}

function SearchBar({ search, onInput, onClear }) {
  return h("section", { class: "toolbar-block" }, [
    h("div", { class: "section-head section-head--compact" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Search"), h("h2", {}, "검색")]),
      h(
        "button",
        {
          id: "task-search-clear",
          class: "ghost-button",
          type: "button",
          onClick: onClear,
          disabled: search.length === 0,
        },
        "초기화",
      ),
    ]),
    h("input", {
      id: "task-search-input",
      class: "field-input field-input--search",
      type: "search",
      value: search,
      placeholder: "제목이나 카테고리 검색",
      onInput,
    }),
  ]);
}

function FilterTabs({ activeFilter, stats, onSelect }) {
  return h("section", { class: "toolbar-block" }, [
    h("div", { class: "section-head section-head--compact" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Filter"), h("h2", {}, "상태 필터")]),
    ]),
    h(
      "div",
      { class: "filter-row" },
      FILTER_OPTIONS.map((filter) =>
        h(
          "button",
          {
            id: `filter-${filter}`,
            class: filter === activeFilter ? "filter-pill is-active" : "filter-pill",
            type: "button",
            "data-filter": filter,
            onClick: onSelect,
          },
          `${FILTER_LABELS[filter]} ${
            filter === "all"
              ? stats.total
              : filter === "active"
                ? stats.remaining
                : stats.completed
          }`,
        ),
      ),
    ),
  ]);
}

function TaskList({ tasks, search, onToggle, onRemove }) {
  if (tasks.length === 0) {
    return renderChild(EmptyState, { search });
  }

  return h("section", { class: "task-list-section" }, [
    h("div", { class: "section-head section-head--compact" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Tasks"), h("h2", {}, "할 일 목록")]),
      h("span", { class: "section-chip section-chip--soft" }, "keyed diff 사용"),
    ]),
    h(
      "ul",
      { class: "task-list" },
      tasks.map((task) => renderChild(TaskItem, { task, onToggle, onRemove })),
    ),
  ]);
}

function TaskItem({ task, onToggle, onRemove }) {
  return h("li", { class: task.completed ? "task-item is-complete" : "task-item", "data-key": String(task.id) }, [
    h("label", { class: "task-check" }, [
      h("input", {
        type: "checkbox",
        checked: task.completed,
        "data-task-id": String(task.id),
        onChange: onToggle,
      }),
      h("span", { class: "task-check__visual" }, task.completed ? "Done" : "Todo"),
    ]),
    h("div", { class: "task-copy" }, [
      h("strong", { class: "task-title" }, task.title),
      h("div", { class: "task-meta" }, [
        h("span", { class: "task-tag" }, task.category),
        h("span", { class: "task-tag task-tag--muted" }, task.createdAt),
      ]),
    ]),
    h(
      "button",
      {
        class: "icon-button",
        type: "button",
        "data-task-id": String(task.id),
        onClick: onRemove,
      },
      "삭제",
    ),
  ]);
}

function EmptyState({ search }) {
  return h("section", { class: "empty-card" }, [
    h("p", { class: "section-kicker" }, "No Results"),
    h("h2", {}, "조건에 맞는 작업이 없습니다."),
    h(
      "p",
      { class: "empty-copy" },
      search
        ? `검색어 "${search}"와 일치하는 task가 없습니다.`
        : "필터 결과가 비어 있습니다. 다른 상태 탭을 눌러보세요.",
    ),
  ]);
}

function StatsPanel({ stats, activeFilter, search }) {
  return h("section", { class: "side-block" }, [
    h("div", { class: "section-head" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Stats"), h("h2", {}, "진행 현황")]),
      h("span", { class: "section-chip" }, `필터: ${FILTER_LABELS[activeFilter]}`),
    ]),
    h("div", { class: "stats-grid" }, [
      h("article", { class: "mini-stat" }, [h("span", {}, "전체"), h("strong", {}, String(stats.total))]),
      h("article", { class: "mini-stat" }, [h("span", {}, "남은 일"), h("strong", {}, String(stats.remaining))]),
      h("article", { class: "mini-stat" }, [h("span", {}, "완료"), h("strong", {}, String(stats.completed))]),
      h("article", { class: "mini-stat" }, [h("span", {}, "현재 보기"), h("strong", {}, String(stats.visibleCount))]),
    ]),
    h("div", { class: "progress-block" }, [
      h("div", { class: "progress-head" }, [
        h("span", {}, "완료율"),
        h("strong", {}, `${stats.completionRate}%`),
      ]),
      h("div", { class: "progress-rail" }, [
        h("span", {
          class: "progress-fill",
          style: { width: `${stats.completionRate}%` },
        }),
      ]),
    ]),
    h(
      "p",
      { class: "side-note" },
      search
        ? `검색어 "${search}"가 filteredTasks useMemo의 의존성에 포함됩니다.`
        : "검색어가 비어 있으면 이전 memo 계산 결과를 재사용할 수 있습니다.",
    ),
  ]);
}

function FrameworkPanel() {
  return h("section", { class: "side-block side-block--accent" }, [
    h("div", { class: "section-head" }, [
      h("div", {}, [h("p", { class: "section-kicker" }, "Framework"), h("h2", {}, "발표 포인트")]),
      h("span", { class: "section-chip section-chip--soft" }, "Week4 확장"),
    ]),
    h(
      "ul",
      { class: "note-list" },
      frameworkHighlights.map((item) => h("li", {}, item)),
    ),
  ]);
}

function createActions(setState) {
  return {
    handleDraftInput(event) {
      setState((previousState) => ({
        ...previousState,
        draftTitle: event.target.value,
      }));
    },

    handleSearchInput(event) {
      setState((previousState) => ({
        ...previousState,
        search: event.target.value,
      }));
    },

    handleClearSearch() {
      setState((previousState) => ({
        ...previousState,
        search: "",
      }));
    },

    handleFilterSelect(event) {
      const nextFilter = event.currentTarget.dataset.filter;

      if (!FILTER_OPTIONS.includes(nextFilter)) {
        return;
      }

      setState((previousState) => {
        if (previousState.filter === nextFilter) {
          return previousState;
        }

        return {
          ...previousState,
          filter: nextFilter,
        };
      });
    },

    handleAddSubmit(event) {
      event.preventDefault();

      setState((previousState) => {
        const title = previousState.draftTitle.trim();

        if (!title) {
          return previousState;
        }

        const nextTask = {
          id: previousState.nextId,
          title,
          category: classifyTask(title),
          completed: false,
          createdAt: new Date().toISOString().slice(0, 10),
        };

        return {
          ...previousState,
          draftTitle: "",
          nextId: previousState.nextId + 1,
          tasks: [nextTask, ...previousState.tasks],
        };
      });
    },

    handleTaskToggle(event) {
      const taskId = Number.parseInt(event.currentTarget.dataset.taskId ?? "", 10);

      if (!Number.isFinite(taskId)) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        tasks: previousState.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      }));
    },

    handleTaskRemove(event) {
      const taskId = Number.parseInt(event.currentTarget.dataset.taskId ?? "", 10);

      if (!Number.isFinite(taskId)) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        tasks: previousState.tasks.filter((task) => task.id !== taskId),
      }));
    },
  };
}

function selectVisibleTasks(tasks, search, filter) {
  const normalizedSearch = search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.category.toLowerCase().includes(normalizedSearch);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !task.completed) ||
      (filter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });
}

function buildStats(tasks, visibleCount) {
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const remaining = total - completed;

  return {
    total,
    completed,
    remaining,
    visibleCount,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

function classifyTask(title) {
  if (/memo|hook/i.test(title)) {
    return "Hooks";
  }

  if (/patch|diff|dom/i.test(title)) {
    return "Core";
  }

  return "UI";
}

function compactState(state) {
  if (!state) {
    return null;
  }

  return {
    draftTitle: state.draftTitle,
    search: state.search,
    filter: state.filter,
    nextId: state.nextId,
    tasks: state.tasks?.map((task) => ({
      id: task.id,
      title: task.title,
      category: task.category,
      completed: task.completed,
    })),
  };
}

function formatSummary(changeSummary) {
  if (!changeSummary || changeSummary.total === 0) {
    return "마지막 렌더에서는 변경된 DOM 노드가 없었습니다.";
  }

  const byType = Object.entries(changeSummary.byType ?? {})
    .map(([type, count]) => `${type}: ${count}`)
    .join(" / ");

  return `총 ${changeSummary.total}개의 변경을 patch했습니다. (${byType})`;
}
