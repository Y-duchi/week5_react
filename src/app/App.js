import {
  childComponentNames,
  filterOptions,
  initialTasks,
  pipelineSteps,
  requirementCards,
  studentProfile,
} from "../data/content.js";
import { fragment, h } from "../runtime/h.js";
import { useEffect, useMemo, useState } from "../runtime/hooks.js";
import {
  ChangeSummaryPanel,
  ComposerPanel,
  DemoGuidePanel,
  EngineInspector,
  FilterBar,
  HeaderPanel,
  RequirementGrid,
  RuntimePanelShell,
  TaskEditorPanel,
  TaskListPanel,
} from "./components.js";

let appActions = {};

const EMPTY_INTERACTION = {
  title: "아직 사용자 상호작용이 없습니다.",
  description: "왼쪽에서 입력하거나 버튼을 눌러 보세요. 오른쪽에서 state와 hook 변화가 바로 보입니다.",
  changedStates: [],
  changedHooks: [],
};

function formatValue(value) {
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
    return `${value.length}개`;
  }

  return JSON.stringify(value);
}

function stateChange(label, before, after) {
  return {
    label,
    before: formatValue(before),
    after: formatValue(after),
  };
}

function hookChange(slot, label, before, after) {
  return {
    slot,
    label,
    before: formatValue(before),
    after: formatValue(after),
  };
}

function buildInteraction(title, description, changedStates, changedHooks) {
  return {
    title,
    description,
    changedStates,
    changedHooks,
  };
}

export function filterTasks(tasks, filter) {
  if (filter === "open") {
    return tasks.filter((task) => !task.done);
  }

  if (filter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

export function buildTaskStats(tasks, filter) {
  const visibleTasks = filterTasks(tasks, filter);
  const completed = tasks.filter((task) => task.done).length;
  const open = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return {
    total: tasks.length,
    completed,
    open,
    visible: visibleTasks.length,
    progress,
  };
}

function formatLog(message) {
  return `${new Date().toLocaleTimeString("ko-KR")} - ${message}`;
}

export function getAppActions() {
  return appActions;
}

export function App() {
  const [draftTitle, setDraftTitle] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState(initialTasks[0]?.id ?? null);
  const [nextTaskId, setNextTaskId] = useState(initialTasks.length + 1);
  const [effectMessage, setEffectMessage] = useState("useEffect가 아직 실행되지 않았습니다.");
  const [actionLog, setActionLog] = useState([formatLog("mount(): 초기 렌더링 완료")]);
  const [lastInteraction, setLastInteraction] = useState(EMPTY_INTERACTION);

  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const stats = useMemo(() => buildTaskStats(tasks, filter), [tasks, filter]);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );
  const stateSnapshot = useMemo(
    () =>
      JSON.stringify(
        {
          draftTitle,
          filter,
          selectedTaskId,
          nextTaskId,
          totalTasks: tasks.length,
          completedTasks: stats.completed,
          lastInteraction: lastInteraction.title,
        },
        null,
        2,
      ),
    [
      draftTitle,
      filter,
      selectedTaskId,
      nextTaskId,
      tasks.length,
      stats.completed,
      lastInteraction.title,
    ],
  );
  const stateFacts = useMemo(
    () => [
      { label: "draftTitle", value: draftTitle || "(빈 문자열)" },
      { label: "filter", value: filter },
      { label: "selected", value: selectedTask?.title ?? "없음" },
      { label: "tasks", value: `${tasks.length}개` },
      { label: "done", value: `${stats.completed}개` },
    ],
    [draftTitle, filter, selectedTask?.title, tasks.length, stats.completed],
  );
  const hookSlots = useMemo(
    () => [
      { slot: 0, name: "draftTitle", value: draftTitle || "(빈 문자열)" },
      { slot: 1, name: "tasks", value: `${tasks.length} items` },
      { slot: 2, name: "filter", value: filter },
      { slot: 3, name: "selectedTaskId", value: String(selectedTaskId ?? "null") },
      { slot: 4, name: "nextTaskId", value: String(nextTaskId) },
      { slot: 5, name: "effectMessage", value: effectMessage },
    ],
    [draftTitle, tasks.length, filter, selectedTaskId, nextTaskId, effectMessage],
  );
  const changedStateLabels = useMemo(
    () => new Set(lastInteraction.changedStates.map((item) => item.label)),
    [lastInteraction.changedStates],
  );
  const changedHookSlots = useMemo(
    () => new Set(lastInteraction.changedHooks.map((item) => item.slot)),
    [lastInteraction.changedHooks],
  );

  useEffect(() => {
    const selectedName = selectedTask?.title ?? "선택 없음";
    const nextMessage = `useEffect: filter=${filter}, selected=${selectedName}, visible=${stats.visible}, progress=${stats.progress}%`;

    setEffectMessage(nextMessage);

    if (typeof document !== "undefined") {
      document.title = `${stats.completed}/${stats.total} 완료 - ${selectedName}`;
    }

    return undefined;
  }, [filter, selectedTask?.title, stats.visible, stats.progress, stats.completed, stats.total]);

  function appendLog(message) {
    setActionLog((logs) => [formatLog(message), ...logs].slice(0, 8));
  }

  function recordInteraction(interaction, logMessage) {
    setLastInteraction(interaction);

    if (logMessage) {
      appendLog(logMessage);
    }
  }

  function buildResetInteraction() {
    return buildInteraction(
      "초기화 버튼 클릭",
      "루트 state들을 초기 상태로 되돌렸습니다.",
      [
        stateChange("draftTitle", draftTitle, ""),
        stateChange("filter", filter, "all"),
        stateChange("selectedTaskId", selectedTaskId, initialTasks[0]?.id ?? null),
        stateChange("tasks", `${tasks.length}개`, `${initialTasks.length}개`),
      ],
      [
        hookChange(0, "draftTitle", draftTitle, ""),
        hookChange(1, "tasks", `${tasks.length} items`, `${initialTasks.length} items`),
        hookChange(2, "filter", filter, "all"),
        hookChange(3, "selectedTaskId", selectedTaskId, initialTasks[0]?.id ?? null),
      ],
    );
  }

  appActions = {
    updateDraftTitle(value) {
      setDraftTitle(value);
      recordInteraction(
        buildInteraction(
          "input 입력",
          "사용자가 입력창에 값을 넣어서 draftTitle state가 바뀌었습니다.",
          [stateChange("draftTitle", draftTitle, value)],
          [hookChange(0, "draftTitle", draftTitle, value)],
        ),
        `draftTitle 입력값을 "${value}"로 변경했습니다.`,
      );
    },
    addTask(rawTitle) {
      const title = (rawTitle ?? draftTitle).trim();

      if (!title) {
        recordInteraction(
          buildInteraction(
            "작업 추가 버튼 클릭",
            "입력값이 비어 있어서 tasks state는 바뀌지 않았습니다.",
            [],
            [],
          ),
          "빈 작업은 추가하지 않았습니다.",
        );
        return;
      }

      const nextTask = {
        id: nextTaskId,
        title,
        category: "custom",
        done: false,
        note: "새로 추가된 작업입니다. 발표할 포인트를 적어 보세요.",
      };

      setTasks((currentTasks) => [...currentTasks, nextTask]);
      setSelectedTaskId(nextTask.id);
      setNextTaskId(nextTaskId + 1);
      setDraftTitle("");
      recordInteraction(
        buildInteraction(
          "작업 추가 버튼 클릭",
          `"${title}" 작업이 추가되면서 tasks, selectedTaskId, nextTaskId, draftTitle가 함께 바뀌었습니다.`,
          [
            stateChange("draftTitle", draftTitle, ""),
            stateChange("tasks", `${tasks.length}개`, `${tasks.length + 1}개`),
            stateChange("selectedTaskId", selectedTaskId, nextTask.id),
            stateChange("nextTaskId", nextTaskId, nextTaskId + 1),
          ],
          [
            hookChange(0, "draftTitle", draftTitle, ""),
            hookChange(1, "tasks", `${tasks.length} items`, `${tasks.length + 1} items`),
            hookChange(3, "selectedTaskId", selectedTaskId, nextTask.id),
            hookChange(4, "nextTaskId", nextTaskId, nextTaskId + 1),
          ],
        ),
        `"${title}" 작업을 추가했습니다.`,
      );
    },
    setFilter(filterId) {
      setFilter(filterId);
      recordInteraction(
        buildInteraction(
          "필터 버튼 클릭",
          `filter state가 ${filterId}로 바뀌면서 보이는 목록과 통계값이 다시 계산됩니다.`,
          [stateChange("filter", filter, filterId)],
          [hookChange(2, "filter", filter, filterId)],
        ),
        `필터를 ${filterId}로 변경했습니다.`,
      );
    },
    selectTask(taskId) {
      const numericId = Number(taskId);
      const found = tasks.find((task) => task.id === numericId);

      setSelectedTaskId(numericId);
      recordInteraction(
        buildInteraction(
          "작업 카드 선택",
          `selectedTaskId가 ${numericId}로 바뀌면서 오른쪽 설명 영역이 새 작업으로 바뀝니다.`,
          [stateChange("selectedTaskId", selectedTaskId, numericId)],
          [hookChange(3, "selectedTaskId", selectedTaskId, numericId)],
        ),
        `"${found?.title ?? numericId}" 작업을 선택했습니다.`,
      );
    },
    toggleTask(taskId) {
      const numericId = Number(taskId);
      const found = tasks.find((task) => task.id === numericId);
      const nextDone = !found?.done;

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === numericId ? { ...task, done: !task.done } : task,
        ),
      );
      recordInteraction(
        buildInteraction(
          "완료 상태 토글",
          `"${found?.title ?? numericId}"의 done 값이 ${String(nextDone)}로 바뀌었습니다.`,
          [
            stateChange("tasks", `${tasks.length}개`, `${tasks.length}개 (done changed)`),
            stateChange(`tasks[${numericId}].done`, found?.done, nextDone),
          ],
          [
            hookChange(1, "tasks", `${tasks.length} items`, `${tasks.length} items (done changed)`),
          ],
        ),
        `"${found?.title ?? numericId}" 완료 상태를 변경했습니다.`,
      );
    },
    removeTask(taskId) {
      const numericId = Number(taskId);
      const nextTasks = tasks.filter((task) => task.id !== numericId);
      const removed = tasks.find((task) => task.id === numericId);
      const nextSelectedId =
        selectedTaskId === numericId ? (nextTasks[0]?.id ?? null) : selectedTaskId;

      setTasks(nextTasks);

      if (selectedTaskId === numericId) {
        setSelectedTaskId(nextSelectedId);
      }

      recordInteraction(
        buildInteraction(
          "삭제 버튼 클릭",
          `"${removed?.title ?? numericId}"가 제거되면서 tasks 길이가 줄었습니다.`,
          [
            stateChange("tasks", `${tasks.length}개`, `${nextTasks.length}개`),
            stateChange("selectedTaskId", selectedTaskId, nextSelectedId),
          ],
          [
            hookChange(1, "tasks", `${tasks.length} items`, `${nextTasks.length} items`),
            hookChange(3, "selectedTaskId", selectedTaskId, nextSelectedId),
          ],
        ),
        `"${removed?.title ?? numericId}" 작업을 삭제했습니다.`,
      );
    },
    updateTaskNote(value) {
      if (selectedTaskId == null) {
        return;
      }

      const beforeNote = selectedTask?.note ?? "";

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === selectedTaskId ? { ...task, note: value } : task,
        ),
      );
      recordInteraction(
        buildInteraction(
          "메모 입력",
          "선택한 작업의 note가 바뀌면서 tasks state 내부 값이 갱신되었습니다.",
          [
            stateChange("tasks", `${tasks.length}개`, `${tasks.length}개 (note changed)`),
            stateChange(`tasks[${selectedTaskId}].note`, beforeNote, value),
          ],
          [hookChange(1, "tasks", beforeNote, value)],
        ),
        `선택한 작업의 메모를 수정했습니다.`,
      );
    },
    resetDemo() {
      setDraftTitle("");
      setTasks(initialTasks);
      setFilter("all");
      setSelectedTaskId(initialTasks[0]?.id ?? null);
      setNextTaskId(initialTasks.length + 1);
      setEffectMessage("useEffect가 아직 실행되지 않았습니다.");
      setActionLog([formatLog("resetDemo(): 여러 root state를 한 번에 초기화했습니다.")]);
      setLastInteraction(buildResetInteraction());
    },
  };

  return fragment(
    h(
      "div",
      { className: "page-scene" },
      h(HeaderPanel, {
        profile: studentProfile,
        totalTasks: stats.total,
        completedTasks: stats.completed,
      }),
      h(
        "div",
        { className: "workspace-layout" },
        h(
          "div",
          { className: "demo-stack" },
          h(DemoGuidePanel),
          h(ComposerPanel, {
            draftTitle,
          }),
          h(FilterBar, {
            options: filterOptions,
            activeFilter: filter,
            stats,
          }),
          h(TaskListPanel, {
            tasks: visibleTasks,
            selectedTaskId,
          }),
          h(TaskEditorPanel, {
            task: selectedTask,
          }),
        ),
        h(
          "div",
          { className: "inspector-column" },
          h(ChangeSummaryPanel, {
            interaction: lastInteraction,
          }),
          h(EngineInspector, {
            childComponentNames,
            hookSlots,
            memoValues: stats,
            effectMessage,
            actionLog,
            stateFacts,
            stateSnapshot,
            pipelineSteps,
            changedStateLabels,
            changedHookSlots,
          }),
          h(RuntimePanelShell),
        ),
      ),
      h(RequirementGrid, {
        cards: requirementCards,
      }),
    ),
  );
}
