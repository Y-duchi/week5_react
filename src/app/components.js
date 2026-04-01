import { h } from "../runtime/h.js";

function statChip(label, value) {
  return h(
    "article",
    { className: "stat-chip" },
    h("span", { className: "stat-label" }, label),
    h("strong", { className: "stat-value" }, value),
  );
}

function statePill(label, value) {
  return h(
    "article",
    { className: "state-pill" },
    h("span", { className: "state-pill-label" }, label),
    h("strong", { className: "state-pill-value" }, value),
  );
}

function sectionGuide(number, title, text) {
  return h(
    "section",
    { className: "workspace-guide" },
    h("span", { className: "workspace-guide-number" }, number),
    h(
      "div",
      { className: "workspace-guide-copy" },
      h("h2", { className: "workspace-guide-title" }, title),
      h("p", { className: "workspace-guide-text" }, text),
    ),
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
      h("h1", { className: "hero-title" }, "클릭해서 설명하는 Mini React"),
      h(
        "p",
        { className: "hero-text" },
        "왼쪽에서 작업을 추가하거나 완료 처리하면, 오른쪽에서 root state, hooks, diff / patch가 같이 바뀌는 모습을 바로 설명할 수 있습니다.",
      ),
      h(
        "div",
        { className: "hero-check-row" },
        h("span", { className: "identity-chip" }, "루트만 state"),
        h("span", { className: "identity-chip" }, "자식은 props only"),
        h("span", { className: "identity-chip" }, "hooks는 루트 전용"),
        h("span", { className: "identity-chip" }, "diff / patch 실시간 확인"),
      ),
      h(
        "div",
        { className: "hero-steps" },
        h(
          "article",
          { className: "hero-step-card" },
          h("span", { className: "hero-step-number" }, "1"),
          h("strong", { className: "hero-step-title" }, "작업 추가"),
          h("p", { className: "hero-step-text" }, "input 값이 root state에 들어갑니다."),
        ),
        h(
          "article",
          { className: "hero-step-card" },
          h("span", { className: "hero-step-number" }, "2"),
          h("strong", { className: "hero-step-title" }, "완료 토글"),
          h("p", { className: "hero-step-text" }, "tasks state가 바뀌고 visibleTasks가 다시 계산됩니다."),
        ),
        h(
          "article",
          { className: "hero-step-card" },
          h("span", { className: "hero-step-number" }, "3"),
          h("strong", { className: "hero-step-title" }, "오른쪽 확인"),
          h("p", { className: "hero-step-text" }, "hooks 배열과 diff / patch 로그를 바로 설명합니다."),
        ),
      ),
    ),
    h(
      "div",
      { className: "hero-stats" },
      statChip("전체 작업", String(totalTasks)),
      statChip("완료 작업", String(completedTasks)),
      statChip("발표 포인트", "state / hooks / vdom"),
    ),
  );
}

export function FlowSnapshotPanel({ latestAction, stateFacts, computedFacts, effectMessage }) {
  return h(
    "section",
    { className: "flow-panel" },
    h("p", { className: "eyebrow" }, "지금 이 화면에서 설명할 것"),
    h("h2", { className: "section-title" }, "클릭 -> state -> 계산 -> 반영"),
    h(
      "div",
      { className: "flow-grid" },
      h(
        "article",
        { className: "flow-card" },
        h("span", { className: "flow-number" }, "1"),
        h("strong", { className: "flow-title" }, "방금 한 행동"),
        h("p", { className: "flow-text" }, latestAction),
      ),
      h(
        "article",
        { className: "flow-card" },
        h("span", { className: "flow-number" }, "2"),
        h("strong", { className: "flow-title" }, "바뀐 root state"),
        h(
          "div",
          { className: "pill-row" },
          ...stateFacts.map((fact) => statePill(fact.label, fact.value)),
        ),
      ),
      h(
        "article",
        { className: "flow-card" },
        h("span", { className: "flow-number" }, "3"),
        h("strong", { className: "flow-title" }, "다시 계산된 값"),
        h(
          "div",
          { className: "pill-row" },
          ...computedFacts.map((fact) => statePill(fact.label, fact.value)),
        ),
      ),
      h(
        "article",
        { className: "flow-card" },
        h("span", { className: "flow-number" }, "4"),
        h("strong", { className: "flow-title" }, "render 후 effect"),
        h("p", { className: "flow-text" }, effectMessage),
      ),
    ),
  );
}

export function RequirementGrid({ cards }) {
  return h(
    "section",
    { className: "requirement-panel" },
    h("p", { className: "eyebrow" }, "요구사항 대응"),
    h("h2", { className: "section-title" }, "과제 조건을 어떻게 만족하는지 한 줄씩 확인"),
    h(
      "div",
      { className: "requirement-list" },
      ...cards.map((card) =>
        h(
          "article",
          { className: "requirement-row" },
          h("span", { className: "requirement-index" }, card.index),
          h(
            "div",
            { className: "requirement-copy" },
            h("h3", { className: "card-title" }, card.title),
            h("p", { className: "card-summary" }, card.summary),
            h("p", { className: "requirement-proof" }, card.proof),
          ),
          h(
            "div",
            { className: "requirement-meta" },
            h("span", { className: "requirement-label" }, "구현 위치"),
            h("code", { className: "requirement-location" }, card.location),
          ),
        ),
      ),
    ),
  );
}

export function DemoColumnIntro() {
  return sectionGuide(
    "1",
    "왼쪽은 직접 눌러보는 영역",
    "입력, 클릭, 선택으로 state를 바꾸고 화면이 다시 그려지는 걸 확인합니다.",
  );
}

export function InspectorColumnIntro() {
  return sectionGuide(
    "2",
    "오른쪽은 내부에서 벌어지는 일",
    "같은 순간에 root state, hooks 배열, render 파이프라인, diff / patch가 어떻게 바뀌는지 보여줍니다.",
  );
}

export function ComposerPanel({ draftTitle }) {
  return h(
    "section",
    { className: "demo-card" },
    h("p", { className: "eyebrow" }, "첫 번째 시연"),
    h("h2", { className: "section-title" }, "작업을 하나 추가해 보세요"),
    h("p", { className: "demo-hint" }, "입력값은 draftTitle state에 들어가고, 추가 버튼을 누르면 tasks state가 늘어납니다."),
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
          placeholder: "예: 발표 시연 순서 정리",
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
    h("p", { className: "eyebrow" }, "두 번째 시연"),
    h("h2", { className: "section-title" }, "완료 상태와 필터를 바꿔보세요"),
    h("p", { className: "demo-hint" }, "필터를 바꾸면 visibleTasks와 통계값(useMemo)이 다시 계산됩니다."),
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
    h("p", { className: "eyebrow" }, "세 번째 시연"),
    h("h2", { className: "section-title" }, "카드를 선택하거나 완료 처리해 보세요"),
    h("p", { className: "demo-hint" }, "선택한 카드와 완료 상태가 바뀌면 selectedTaskId, tasks state가 함께 변합니다."),
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
                h(
                  "span",
                  { className: task.done ? "task-state is-done" : "task-state" },
                  task.done ? "DONE" : "TODO",
                ),
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
    h("p", { className: "eyebrow" }, "네 번째 시연"),
    h("h2", { className: "section-title" }, "선택한 작업의 메모를 수정해 보세요"),
    task
      ? h(
          "div",
          { className: "editor-wrap" },
          h("p", { className: "editor-title" }, task.title),
          h("p", { className: "editor-hint" }, "textarea를 수정하면 루트 tasks state가 바뀌고 다시 렌더됩니다."),
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
  stateFacts,
  stateSnapshot,
  pipelineSteps,
}) {
  return h(
    "div",
    { className: "inspector-stack" },
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "핵심 제약"),
      h("h2", { className: "section-title" }, "이 데모가 보여주는 구조"),
      h(
        "div",
        { className: "pill-row" },
        statePill("루트", "App 하나만 state 보유"),
        statePill("자식", "모두 stateless"),
        statePill("Hook", "루트에서만 허용"),
      ),
      h(
        "ul",
        { className: "plain-list plain-list--compact" },
        h("li", {}, `Root: App -> ${childComponentNames.join(", ")}`),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "1. root state"),
      h("h2", { className: "section-title" }, "한눈에 보는 현재 상태"),
      h(
        "div",
        { className: "pill-row" },
        ...stateFacts.map((fact) => statePill(fact.label, fact.value)),
      ),
      h("pre", { className: "code-panel", id: "root-state-json" }, stateSnapshot),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "2. hooks 배열"),
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
      h("p", { className: "eyebrow" }, "3. useMemo / useEffect"),
      h("h2", { className: "section-title" }, "계산된 값과 effect"),
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
      h("p", { className: "eyebrow" }, "4. rerender 순서"),
      h("h2", { className: "section-title" }, "setState 뒤에 무슨 일이 생기나"),
      h(
        "ol",
        { className: "plain-list plain-list--ordered" },
        ...pipelineSteps.map((step) => h("li", {}, step)),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "최근 액션"),
      h("h2", { className: "section-title" }, "Action Log"),
      h(
        "ul",
        { className: "plain-list plain-list--compact" },
        ...actionLog.map((entry) => h("li", {}, entry)),
      ),
    ),
  );
}

export function RuntimePanelShell() {
  return h(
    "section",
    { className: "side-card runtime-card" },
    h("p", { className: "eyebrow" }, "5. Virtual DOM Runtime"),
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
