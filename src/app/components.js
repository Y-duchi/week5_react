import { h } from "../runtime/h.js";

function statChip(label, value) {
  return h(
    "article",
    { className: "stat-chip" },
    h("span", { className: "stat-label" }, label),
    h("strong", { className: "stat-value" }, value),
  );
}

function changeRow(change, prefix = "") {
  return h(
    "li",
    { className: "change-row" },
    h("strong", { className: "change-name" }, prefix ? `${prefix}${change.label}` : change.label),
    h("code", { className: "change-value before" }, change.before),
    h("span", { className: "change-arrow" }, "->"),
    h("code", { className: "change-value after" }, change.after),
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
      h("h1", { className: "hero-title" }, "사용자 행동 옆에서 React 내부 변화 보기"),
      h(
        "p",
        { className: "hero-text" },
        "왼쪽에서 직접 입력하고 클릭하면, 오른쪽에서 root state, hooks, diff / patch가 어떻게 바뀌는지 즉시 확인할 수 있습니다.",
      ),
      h(
        "div",
        { className: "hero-points" },
        h("span", { className: "hero-point" }, "1. 사용자가 직접 입력"),
        h("span", { className: "hero-point" }, "2. state가 바뀜"),
        h("span", { className: "hero-point" }, "3. hook 슬롯 변화 확인"),
        h("span", { className: "hero-point" }, "4. diff / patch 확인"),
      ),
    ),
    h(
      "div",
      { className: "hero-stats" },
      statChip("전체 작업", String(totalTasks)),
      statChip("완료 작업", String(completedTasks)),
      statChip("핵심 시연", "state / hooks / diff"),
    ),
  );
}

export function DemoGuidePanel() {
  return h(
    "section",
    { className: "guide-panel" },
    h("p", { className: "eyebrow" }, "시연 방법"),
    h("h2", { className: "section-title" }, "왼쪽을 조작하고 오른쪽을 설명하면 됩니다"),
    h(
      "div",
      { className: "guide-grid" },
      h(
        "article",
        { className: "guide-card" },
        h("span", { className: "guide-number" }, "1"),
        h("strong", { className: "guide-title" }, "input 입력"),
        h("p", { className: "guide-text" }, "draftTitle state가 바뀌는지 봅니다."),
      ),
      h(
        "article",
        { className: "guide-card" },
        h("span", { className: "guide-number" }, "2"),
        h("strong", { className: "guide-title" }, "버튼 클릭"),
        h("p", { className: "guide-text" }, "tasks, filter, selectedTaskId 변화가 생깁니다."),
      ),
      h(
        "article",
        { className: "guide-card" },
        h("span", { className: "guide-number" }, "3"),
        h("strong", { className: "guide-title" }, "오른쪽 확인"),
        h("p", { className: "guide-text" }, "변한 state, hook 슬롯, diff / patch를 바로 설명합니다."),
      ),
    ),
  );
}

export function ComposerPanel({ draftTitle }) {
  return h(
    "section",
    { className: "demo-card" },
    h("p", { className: "eyebrow" }, "사용자 행동 1"),
    h("h2", { className: "section-title" }, "입력하고 작업 추가"),
    h("p", { className: "demo-hint" }, "입력창은 draftTitle state, 추가 버튼은 tasks state를 바꿉니다."),
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
          placeholder: "예: 발표용 시연 순서 정리",
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
    h("p", { className: "eyebrow" }, "사용자 행동 2"),
    h("h2", { className: "section-title" }, "필터를 바꾸고 완료 상태를 보세요"),
    h("p", { className: "demo-hint" }, "filter가 바뀌면 visibleTasks와 진행률이 다시 계산됩니다."),
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
    h("p", { className: "eyebrow" }, "사용자 행동 3"),
    h("h2", { className: "section-title" }, "카드 선택 / 완료 / 삭제"),
    h("p", { className: "demo-hint" }, "이 세 버튼으로 selectedTaskId와 tasks state를 눈에 띄게 바꿀 수 있습니다."),
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
    h("p", { className: "eyebrow" }, "사용자 행동 4"),
    h("h2", { className: "section-title" }, "선택한 작업의 메모 수정"),
    task
      ? h(
          "div",
          { className: "editor-wrap" },
          h("p", { className: "editor-title" }, task.title),
          h("p", { className: "editor-hint" }, "textarea를 수정하면 tasks state 안의 note 값이 바뀝니다."),
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

export function ChangeSummaryPanel({ interaction }) {
  return h(
    "section",
    { className: "side-card summary-card" },
    h("p", { className: "eyebrow" }, "방금 한 행동"),
    h("h2", { className: "section-title", id: "interaction-title" }, interaction.title),
    h("p", { className: "summary-text", id: "interaction-description" }, interaction.description),
    h(
      "div",
      { className: "summary-columns" },
      h(
        "div",
        { className: "summary-box" },
        h("h3", { className: "summary-subtitle" }, "바뀐 state"),
        interaction.changedStates.length
          ? h(
              "ul",
              { className: "change-list", id: "interaction-state-changes" },
              ...interaction.changedStates.map((change) => changeRow(change)),
            )
          : h("p", { className: "empty-text", id: "interaction-state-changes" }, "이번 행동에서 바뀐 state가 없습니다."),
      ),
      h(
        "div",
        { className: "summary-box" },
        h("h3", { className: "summary-subtitle" }, "바뀐 hook 슬롯"),
        interaction.changedHooks.length
          ? h(
              "ul",
              { className: "change-list", id: "interaction-hook-changes" },
              ...interaction.changedHooks.map((change) =>
                changeRow(change, `Hook[${change.slot}] `),
              ),
            )
          : h("p", { className: "empty-text", id: "interaction-hook-changes" }, "이번 행동에서 바뀐 hook 슬롯이 없습니다."),
      ),
    ),
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
  changedStateLabels,
  changedHookSlots,
}) {
  return h(
    "div",
    { className: "inspector-stack" },
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "현재 root state"),
      h("h2", { className: "section-title" }, "지금 값이 어떻게 생겼는지"),
      h(
        "div",
        { className: "state-grid" },
        ...stateFacts.map((fact) =>
          h(
            "article",
            {
              className: changedStateLabels.has(fact.label) ? "state-card is-changed" : "state-card",
            },
            h("span", { className: "state-card-label" }, fact.label),
            h("strong", { className: "state-card-value" }, fact.value),
          ),
        ),
      ),
      h("pre", { className: "code-panel", id: "root-state-json" }, stateSnapshot),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "hooks 배열"),
      h("h2", { className: "section-title" }, "어느 슬롯이 바뀌었는지"),
      h(
        "div",
        { className: "hook-grid" },
        ...hookSlots.map((slot) =>
          h(
            "article",
            {
              className: changedHookSlots.has(slot.slot) ? "hook-card is-changed" : "hook-card",
            },
            h("span", { className: "hook-label" }, `Hook[${slot.slot}]`),
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
      h("p", { className: "eyebrow" }, "setState 이후"),
      h("h2", { className: "section-title" }, "렌더 파이프라인"),
      h(
        "ol",
        { className: "plain-list plain-list--ordered" },
        ...pipelineSteps.map((step) => h("li", {}, step)),
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
      h("p", { className: "eyebrow" }, "최근 기록"),
      h("h2", { className: "section-title" }, "Action Log"),
      h(
        "ul",
        { className: "plain-list plain-list--compact" },
        ...actionLog.map((entry) => h("li", {}, entry)),
      ),
    ),
  );
}

export function RequirementGrid({ cards }) {
  return h(
    "section",
    { className: "requirement-panel" },
    h("p", { className: "eyebrow" }, "과제 조건 체크"),
    h("h2", { className: "section-title" }, "이 화면이 요구사항을 만족하는 이유"),
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

export function RuntimePanelShell() {
  return h(
    "section",
    { className: "side-card runtime-card" },
    h("p", { className: "eyebrow" }, "실제 runtime"),
    h("h2", { className: "section-title" }, "diff / patch + 실제 hook diff"),
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
    h("h3", { className: "runtime-subtitle" }, "이번 커밋에서 바뀐 hook"),
    h("pre", { className: "code-panel", id: "runtime-hook-delta" }, "초기 mount"),
    h("h3", { className: "runtime-subtitle" }, "최근 diff"),
    h("pre", { className: "code-panel", id: "runtime-change-log" }, "초기 mount"),
    h("h3", { className: "runtime-subtitle" }, "현재 VDOM HTML"),
    h("pre", { className: "code-panel", id: "runtime-html-preview" }, ""),
  );
}
