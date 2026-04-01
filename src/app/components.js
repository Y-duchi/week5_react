import { h } from "../runtime/h.js";

function statChip(label, value) {
  return h(
    "article",
    { className: "stat-chip" },
    h("span", { className: "stat-label" }, label),
    h("strong", { className: "stat-value" }, value),
  );
}

export function HeaderPanel({ profile, totalTasks, completedTasks }) {
  return h(
    "section",
    { className: "hero-panel" },
    h(
      "div",
      { className: "hero-copy" },
      h("p", { className: "eyebrow" }, `${profile.course} / ${profile.stage} / ${profile.event}`),
      h("h1", { className: "hero-title" }, "Mini React 구현 데모"),
      h(
        "p",
        { className: "hero-text" },
        "이 페이지는 문서를 읽기 위한 화면이 아니라, 우리가 직접 구현한 React-like 엔진이 실제로 state, hooks, diff, patch로 동작한다는 걸 보여주는 데모입니다.",
      ),
      h(
        "p",
        { className: "hero-guide" },
        "보는 순서: 1) 작업 추가 2) 완료 토글 3) 메모 수정 4) 오른쪽 패널에서 root state, hooks 배열, diff / patch 로그 확인",
      ),
      h(
        "div",
        { className: "identity-row" },
        h("span", { className: "identity-chip" }, profile.name),
        h("span", { className: "identity-chip" }, profile.email),
        h("span", { className: "identity-chip" }, "Root-only hooks"),
        h("span", { className: "identity-chip" }, "Stateless children"),
      ),
    ),
    h(
      "div",
      { className: "hero-stats" },
      statChip("전체 작업", String(totalTasks)),
      statChip("완료 작업", String(completedTasks)),
    ),
  );
}

export function RequirementGrid({ cards }) {
  return h(
    "section",
    { className: "requirement-panel" },
    h("p", { className: "eyebrow" }, "요구사항 체크"),
    h("h2", { className: "section-title" }, "이 앱이 과제 조건을 만족하는 이유"),
    h(
      "div",
      { className: "requirement-grid" },
      ...cards.map((card) =>
        h(
          "article",
          { className: "requirement-card" },
          h("h3", { className: "card-title" }, card.title),
          h("p", { className: "card-summary" }, card.summary),
          h(
            "ul",
            { className: "card-list" },
            ...card.bullets.map((bullet) => h("li", {}, bullet)),
          ),
        ),
      ),
    ),
  );
}

export function ComposerPanel({ draftTitle }) {
  return h(
    "section",
    { className: "demo-card" },
    h("p", { className: "eyebrow" }, "실제 동작 앱"),
    h("h2", { className: "section-title" }, "Jungle Weekly Build Board"),
    h(
      "div",
      { className: "composer-row" },
      h(
        "label",
        { className: "field grow" },
        h("span", { className: "field-label" }, "새 작업"),
        h("input", {
          type: "text",
          value: draftTitle,
          placeholder: "예: 테스트 페이지 발표 흐름 정리",
          "data-action": "update-draft-title",
          "aria-label": "새 작업 입력",
        }),
      ),
      h(
        "button",
        {
          type: "button",
          className: "primary-button",
          "data-action": "add-task",
        },
        "작업 추가",
      ),
      h(
        "button",
        {
          type: "button",
          className: "ghost-button",
          "data-action": "reset-demo",
        },
        "초기화",
      ),
    ),
  );
}

export function FilterBar({ options, activeFilter, stats }) {
  return h(
    "section",
    { className: "demo-card" },
    h(
      "div",
      { className: "filter-row" },
      h(
        "div",
        { className: "button-row" },
        ...options.map((option) =>
          h(
            "button",
            {
              type: "button",
              className: activeFilter === option.id ? "filter-button is-active" : "filter-button",
              "data-action": "set-filter",
              "data-filter": option.id,
              "aria-pressed": activeFilter === option.id,
            },
            option.label,
          ),
        ),
      ),
      h(
        "div",
        { className: "summary-row" },
        statChip("보이는 작업", String(stats.visible)),
        statChip("남은 작업", String(stats.open)),
        statChip("진행률", `${stats.progress}%`),
      ),
    ),
  );
}

export function TaskListPanel({ tasks, selectedTaskId }) {
  return h(
    "section",
    { className: "demo-card" },
    h("h2", { className: "section-title" }, "작업 목록"),
    tasks.length
      ? h(
          "div",
          { className: "task-grid" },
          ...tasks.map((task) =>
            h(
              "article",
              {
                className: selectedTaskId === task.id ? "task-card is-selected" : "task-card",
              },
              h(
                "div",
                { className: "task-head" },
                h("span", { className: "task-category" }, task.category),
                h("span", { className: task.done ? "task-state is-done" : "task-state" }, task.done ? "DONE" : "TODO"),
              ),
              h("h3", { className: "task-title" }, task.title),
              h("p", { className: "task-note-preview" }, task.note || "메모 없음"),
              h(
                "div",
                { className: "task-actions" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "ghost-button",
                    "data-action": "select-task",
                    "data-id": String(task.id),
                  },
                  selectedTaskId === task.id ? "선택됨" : "선택",
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "ghost-button",
                    "data-action": "toggle-task",
                    "data-id": String(task.id),
                  },
                  task.done ? "미완료로" : "완료로",
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "danger-button",
                    "data-action": "remove-task",
                    "data-id": String(task.id),
                  },
                  "삭제",
                ),
              ),
            ),
          ),
        )
      : h("p", { className: "empty-text" }, "조건에 맞는 작업이 없습니다."),
  );
}

export function TaskEditorPanel({ task }) {
  return h(
    "section",
    { className: "demo-card" },
    h("h2", { className: "section-title" }, "선택한 작업 설명"),
    task
      ? h(
          "div",
          { className: "editor-wrap" },
          h("p", { className: "editor-title" }, task.title),
          h("p", { className: "editor-hint" }, "이 메모를 수정하면 루트 tasks state가 바뀌고 다시 렌더됩니다."),
          h("textarea", {
            rows: 6,
            className: "note-field",
            value: task.note,
            "data-action": "update-task-note",
            "aria-label": "작업 메모",
          }),
        )
      : h("p", { className: "empty-text" }, "선택된 작업이 없습니다."),
  );
}

export function EngineInspector({
  childComponentNames,
  hookSlots,
  memoValues,
  effectMessage,
  actionLog,
  stateSnapshot,
  pipelineSteps,
}) {
  return h(
    "div",
    { className: "inspector-stack" },
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "컴포넌트 구조"),
      h("h2", { className: "section-title" }, "자식은 모두 순수 함수"),
      h(
        "ul",
        { className: "plain-list" },
        h("li", {}, "Root: App (FunctionComponent가 감쌉니다.)"),
        ...childComponentNames.map((name) => h("li", {}, name)),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "루트 state"),
      h("h2", { className: "section-title" }, "State Snapshot"),
      h("pre", { className: "code-panel", id: "root-state-json" }, stateSnapshot),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "hooks 배열"),
      h("h2", { className: "section-title" }, "Hook Slots"),
      h(
        "div",
        { className: "hook-grid" },
        ...hookSlots.map((slot) =>
          h(
            "article",
            { className: "hook-card" },
            h("span", { className: "hook-label" }, `Hook[${slot.index}]`),
            h("strong", { className: "hook-name" }, slot.name),
            h("code", { className: "hook-value" }, slot.value),
          ),
        ),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "useMemo / useEffect"),
      h("h2", { className: "section-title" }, "계산값과 effect"),
      h(
        "div",
        { className: "memo-grid" },
        statChip("전체", String(memoValues.total)),
        statChip("완료", String(memoValues.completed)),
        statChip("보이는 수", String(memoValues.visible)),
        statChip("진행률", `${memoValues.progress}%`),
      ),
      h("p", { className: "effect-box", id: "effect-message" }, effectMessage),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "setState 후 순서"),
      h("h2", { className: "section-title" }, "렌더 파이프라인"),
      h(
        "ol",
        { className: "plain-list plain-list--ordered" },
        ...pipelineSteps.map((step) => h("li", {}, step)),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "최근 상호작용"),
      h("h2", { className: "section-title" }, "Action Log"),
      h(
        "ul",
        { className: "plain-list" },
        ...actionLog.map((entry) => h("li", {}, entry)),
      ),
    ),
  );
}

export function RuntimePanelShell() {
  return h(
    "section",
    { className: "side-card runtime-card" },
    h("p", { className: "eyebrow" }, "Virtual DOM Runtime"),
    h("h2", { className: "section-title" }, "diff / patch 결과"),
    h(
      "div",
      { className: "memo-grid" },
      statChip("렌더 수", h("span", { id: "runtime-render-count" }, "0")),
      statChip("diff 수", h("span", { id: "runtime-change-count" }, "0")),
      statChip("patch 수", h("span", { id: "runtime-patch-count" }, "0")),
      statChip("hook 수", h("span", { id: "runtime-hook-count" }, "0")),
    ),
    h(
      "div",
      { className: "runtime-meta" },
      h("p", {}, h("strong", {}, "phase"), " ", h("span", { id: "runtime-phase" }, "mount")),
      h("p", {}, h("strong", {}, "요약"), " ", h("span", { id: "runtime-summary" }, "초기 mount")),
      h("p", {}, h("strong", {}, "시각"), " ", h("span", { id: "runtime-updated-at" }, "-")),
      h("p", {}, h("strong", {}, "HTML 길이"), " ", h("span", { id: "runtime-html-size" }, "0 chars")),
    ),
    h("h3", { className: "runtime-subtitle" }, "최근 diff"),
    h("pre", { className: "code-panel", id: "runtime-change-log" }, "초기 mount"),
    h("h3", { className: "runtime-subtitle" }, "현재 VDOM HTML"),
    h("pre", { className: "code-panel", id: "runtime-html-preview" }, ""),
  );
}
