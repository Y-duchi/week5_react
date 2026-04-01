import {
  childComponentNames,
  filterOptions,
  initialTasks,
  pipelineSteps,
  presentationSteps,
  presentationTaskSeed,
  requirementCards,
  studentProfile,
} from "../data/content.js";
import { fragment, h } from "../runtime/h.js";
import { useEffect, useMemo, useState } from "../runtime/hooks.js";
import {
  ComposerPanel,
  DemoColumnIntro,
  EngineInspector,
  FilterBar,
  FlowSnapshotPanel,
  HeaderPanel,
  InspectorColumnIntro,
  PresentationPanel,
  RequirementGrid,
  RuntimePanelShell,
  TaskEditorPanel,
  TaskListPanel,
} from "./components.js";

let appActions = {};

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
  const [presentationStep, setPresentationStep] = useState(0);
  const [presentationTaskId, setPresentationTaskId] = useState(null);
  const [actionLog, setActionLog] = useState([formatLog("mount(): 초기 렌더링 완료")]);
  const [effectMessage, setEffectMessage] = useState("useEffect가 아직 실행되지 않았습니다.");

  const visibleTasks = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const stats = useMemo(() => buildTaskStats(tasks, filter), [tasks, filter]);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );
  const latestAction = useMemo(() => {
    const current = actionLog[0] ?? "아직 상호작용이 없습니다.";
    const parts = current.split(" - ");

    return parts.length > 1 ? parts.slice(1).join(" - ") : current;
  }, [actionLog]);
  const activePresentation = useMemo(
    () => presentationSteps[presentationStep] ?? presentationSteps[0],
    [presentationStep],
  );
  const stateSnapshot = useMemo(
    () =>
      JSON.stringify(
        {
          draftTitle,
          filter,
          selectedTaskId,
          nextTaskId,
          presentationStep,
          presentationTaskId,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((task) => task.done).length,
          logEntries: actionLog.length,
        },
        null,
        2,
      ),
    [
      draftTitle,
      filter,
      selectedTaskId,
      nextTaskId,
      presentationStep,
      presentationTaskId,
      tasks,
      actionLog.length,
    ],
  );
  const stateFacts = useMemo(
    () => [
      { label: "filter", value: filter },
      { label: "selected", value: selectedTask?.title ?? "없음" },
      { label: "tasks", value: `${tasks.length}개` },
      { label: "done", value: `${stats.completed}개` },
      { label: "step", value: activePresentation.title },
    ],
    [filter, selectedTask?.title, tasks.length, stats.completed, activePresentation.title],
  );
  const computedFacts = useMemo(
    () => [
      { label: "visibleTasks", value: `${stats.visible}개` },
      { label: "progress", value: `${stats.progress}%` },
      { label: "openTasks", value: `${stats.open}개` },
      { label: "draft", value: draftTitle || "(비어 있음)" },
    ],
    [draftTitle, stats.visible, stats.progress, stats.open],
  );
  const hookSlots = useMemo(
    () => [
      { index: 0, name: "draftTitle", value: draftTitle || "(빈 문자열)" },
      { index: 1, name: "tasks", value: `${tasks.length} items` },
      { index: 2, name: "filter", value: filter },
      { index: 3, name: "selectedTaskId", value: String(selectedTaskId ?? "null") },
      { index: 4, name: "nextTaskId", value: String(nextTaskId) },
      { index: 5, name: "presentationStep", value: String(presentationStep) },
      { index: 6, name: "presentationTaskId", value: String(presentationTaskId ?? "null") },
      { index: 7, name: "actionLog", value: `${actionLog.length} entries` },
      { index: 8, name: "effectMessage", value: effectMessage },
    ],
    [
      draftTitle,
      tasks.length,
      filter,
      selectedTaskId,
      nextTaskId,
      presentationStep,
      presentationTaskId,
      actionLog.length,
      effectMessage,
    ],
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

  function resetBoard(logMessage = "resetDemo(): 여러 root state를 한 번에 초기화했습니다.") {
    setDraftTitle("");
    setTasks(initialTasks);
    setFilter("all");
    setSelectedTaskId(initialTasks[0]?.id ?? null);
    setNextTaskId(initialTasks.length + 1);
    setPresentationStep(0);
    setPresentationTaskId(null);
    setActionLog([formatLog(logMessage)]);
  }

  function runPresentationStep() {
    const focusId = presentationTaskId;

    switch (presentationStep) {
      case 0:
        setDraftTitle(presentationTaskSeed.title);
        setPresentationStep(1);
        appendLog("시연 1단계: input 값이 draftTitle state에 저장되었습니다.");
        return;
      case 1: {
        const createdId = nextTaskId;
        const title = draftTitle.trim() || presentationTaskSeed.title;
        const nextTask = {
          id: createdId,
          title,
          category: "demo",
          done: false,
          note: presentationTaskSeed.note,
        };

        setTasks((currentTasks) => [...currentTasks, nextTask]);
        setSelectedTaskId(createdId);
        setNextTaskId(createdId + 1);
        setPresentationTaskId(createdId);
        setDraftTitle("");
        setPresentationStep(2);
        appendLog("시연 2단계: tasks state에 새 작업이 추가되었습니다.");
        return;
      }
      case 2:
        if (focusId != null) {
          setSelectedTaskId(focusId);
          appendLog("시연 3단계: selectedTaskId가 바뀌면서 설명 패널이 교체됩니다.");
        }
        setPresentationStep(3);
        return;
      case 3:
        if (focusId != null) {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === focusId ? { ...task, note: presentationTaskSeed.updatedNote } : task,
            ),
          );
          appendLog("시연 4단계: tasks 안의 note 값이 바뀌었습니다.");
        }
        setPresentationStep(4);
        return;
      case 4:
        if (focusId != null) {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task.id === focusId ? { ...task, done: true } : task,
            ),
          );
          setSelectedTaskId(focusId);
          setFilter("done");
          appendLog("시연 5단계: 완료 처리 후 done 필터를 적용했습니다.");
        }
        setPresentationStep(5);
        return;
      default:
        appendLog("시연 마지막 단계입니다. 처음부터 버튼으로 다시 보여줄 수 있습니다.");
    }
  }

  appActions = {
    updateDraftTitle(value) {
      setDraftTitle(value);
    },
    addTask(rawTitle) {
      const title = (rawTitle ?? draftTitle).trim();

      if (!title) {
        appendLog("빈 작업은 추가하지 않았습니다.");
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
      appendLog(`"${title}" 작업을 추가했습니다.`);
    },
    setFilter(filterId) {
      setFilter(filterId);
      appendLog(`필터를 ${filterId}로 변경했습니다.`);
    },
    selectTask(taskId) {
      const numericId = Number(taskId);
      const found = tasks.find((task) => task.id === numericId);

      setSelectedTaskId(numericId);
      appendLog(`"${found?.title ?? numericId}" 작업을 선택했습니다.`);
    },
    toggleTask(taskId) {
      const numericId = Number(taskId);
      const found = tasks.find((task) => task.id === numericId);

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === numericId ? { ...task, done: !task.done } : task,
        ),
      );
      appendLog(`"${found?.title ?? numericId}" 완료 상태를 변경했습니다.`);
    },
    removeTask(taskId) {
      const numericId = Number(taskId);
      const nextTasks = tasks.filter((task) => task.id !== numericId);
      const removed = tasks.find((task) => task.id === numericId);

      setTasks(nextTasks);

      if (selectedTaskId === numericId) {
        setSelectedTaskId(nextTasks[0]?.id ?? null);
      }

      appendLog(`"${removed?.title ?? numericId}" 작업을 삭제했습니다.`);
    },
    updateTaskNote(value) {
      if (selectedTaskId == null) {
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === selectedTaskId ? { ...task, note: value } : task,
        ),
      );
    },
    resetDemo() {
      resetBoard();
    },
    advancePresentation() {
      runPresentationStep();
    },
    restartPresentation() {
      resetBoard("시연 모드를 처음 상태로 되돌렸습니다.");
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
      h(PresentationPanel, {
        steps: presentationSteps,
        currentStep: presentationStep,
      }),
      h(FlowSnapshotPanel, {
        latestAction,
        stateFacts,
        computedFacts,
        effectMessage,
      }),
      h(RequirementGrid, {
        cards: requirementCards,
      }),
      h(
        "div",
        { className: "workspace-layout" },
        h(
          "div",
          { className: "demo-stack" },
          h(DemoColumnIntro),
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
          h(InspectorColumnIntro),
          h(EngineInspector, {
            childComponentNames,
            hookSlots,
            memoValues: stats,
            effectMessage,
            actionLog,
            stateFacts,
            stateSnapshot,
            pipelineSteps,
          }),
          h(RuntimePanelShell),
        ),
      ),
    ),
  );
}
