import { h } from "../runtime/h.js";

function highlightText(text, query) {
  if (!query) {
    return [text];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts = [];
  let cursor = 0;

  while (cursor < text.length) {
    const index = lowerText.indexOf(lowerQuery, cursor);

    if (index === -1) {
      parts.push(text.slice(cursor));
      break;
    }

    if (index > cursor) {
      parts.push(text.slice(cursor, index));
    }

    parts.push(h("mark", { className: "inline-highlight" }, text.slice(index, index + query.length)));
    cursor = index + query.length;
  }

  return parts;
}

function renderNodes(nodes, query, depth = 0) {
  return h(
    "ul",
    {
      className: depth === 0 ? "bullet-list" : "bullet-list bullet-list--nested",
    },
    ...nodes.map((node) =>
      h(
        "li",
        {
          className: node.important ? "bullet-item is-important" : "bullet-item",
        },
        h(
          "div",
          {
            className: "bullet-line",
          },
          h("span", { className: "bullet-dot" }, "•"),
          h(
            "div",
            { className: "bullet-copy" },
            h(
              "p",
              { className: "bullet-text" },
              ...highlightText(node.text, query),
            ),
            node.important ? h("span", { className: "important-chip" }, "핵심") : null,
          ),
        ),
        node.children?.length ? renderNodes(node.children, query, depth + 1) : null,
      ),
    ),
  );
}

function metric(label, value) {
  return h(
    "article",
    { className: "metric-box" },
    h("span", { className: "metric-label" }, label),
    h("strong", { className: "metric-value" }, value),
  );
}

export function HeaderPanel({ trail, profile, activeTitle, visibleCount, totalCount }) {
  return h(
    "section",
    { className: "hero-panel" },
    h(
      "div",
      { className: "hero-copy" },
      h("p", { className: "eyebrow" }, trail.join(" / ")),
      h("h1", { className: "hero-title" }, "수요 코딩회 (수요일)"),
      h(
        "p",
        { className: "hero-text" },
        "과제 조건을 그대로 읽으면서, 오른쪽 패널에서 내가 만든 React-like 엔진이 실제로 어떤 state와 hooks를 가지고 움직이는지 바로 확인할 수 있게 정리한 페이지입니다.",
      ),
      h(
        "div",
        { className: "profile-row" },
        h("span", { className: "profile-chip" }, profile.name),
        h("span", { className: "profile-chip" }, profile.email),
        h("span", { className: "profile-chip" }, `${profile.track} / ${profile.stage}`),
      ),
    ),
    h(
      "div",
      { className: "hero-metrics" },
      metric("현재 섹션", activeTitle),
      metric("보이는 항목", `${visibleCount} / ${totalCount}`),
    ),
  );
}

export function ControlPanel({
  sections,
  activeSection,
  query,
  importantOnly,
  currentStep,
}) {
  return h(
    "section",
    { className: "control-panel" },
    h(
      "div",
      { className: "section-tab-row" },
      ...sections.map((section) =>
        h(
          "button",
          {
            type: "button",
            className: activeSection === section.id ? "tab-button is-active" : "tab-button",
            "data-action": "set-section",
            "data-section": section.id,
            "aria-pressed": activeSection === section.id,
          },
          section.title,
        ),
      ),
    ),
    h(
      "div",
      { className: "toolbar-row" },
      h(
        "label",
        { className: "field" },
        h("span", { className: "field-label" }, "검색"),
        h("input", {
          type: "text",
          value: query,
          placeholder: "예: hooks, patch, 테스트",
          "data-action": "search-query",
          "aria-label": "현재 섹션 검색",
        }),
      ),
      h(
        "div",
        { className: "toolbar-actions" },
        h(
          "button",
          {
            type: "button",
            className: importantOnly ? "toggle-button is-active" : "toggle-button",
            "data-action": "toggle-important",
            "aria-pressed": importantOnly,
          },
          importantOnly ? "핵심만 보기 ON" : "핵심만 보기",
        ),
        h(
          "button",
          {
            type: "button",
            className: "toggle-button",
            "data-action": "next-step",
          },
          "렌더 단계 넘기기",
        ),
        h(
          "button",
          {
            type: "button",
            className: "toggle-button",
            "data-action": "reset-demo",
          },
          "데모 초기화",
        ),
      ),
    ),
    h(
      "p",
      { className: "step-caption" },
      "현재 설명 단계: ",
      h("strong", { id: "pipeline-current-title" }, currentStep.title),
    ),
  );
}

export function AssignmentDocument({ section, query, visibleCount, totalCount }) {
  return h(
    "section",
    { className: "document-panel" },
    h(
      "header",
      { className: "panel-header" },
      h("p", { className: "eyebrow" }, "과제 원문 기반"),
      h("h2", { "data-role": "section-title" }, section.title),
      h("span", { className: "panel-badge", id: "document-count" }, `${visibleCount} / ${totalCount}`),
    ),
    section.visibleNodes.length
      ? renderNodes(section.visibleNodes, query)
      : h(
          "div",
          { className: "empty-panel" },
          h("strong", {}, "조건에 맞는 항목이 없습니다."),
          h("p", {}, "검색어를 바꾸거나 '핵심만 보기'를 해제해 보세요."),
        ),
  );
}

export function EnginePanel({
  hookSlots,
  currentStep,
  steps,
  effectMessage,
  actionLog,
  highlights,
}) {
  return h(
    "aside",
    { className: "engine-panel" },
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "왜 이렇게 만들었나"),
      h("h2", { className: "side-title" }, "작동 원리 한눈에 보기"),
      h(
        "ul",
        { className: "plain-list" },
        ...highlights.map((text) => h("li", {}, text)),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "루트 hooks 배열"),
      h("h2", { className: "side-title" }, "지금 저장된 state"),
      h(
        "div",
        { className: "hook-grid" },
        ...hookSlots.map((slot) =>
          h(
            "article",
            { className: "hook-box" },
            h("span", { className: "hook-index" }, `Hook[${slot.index}]`),
            h("strong", { className: "hook-name" }, slot.name),
            h("code", { className: "hook-value" }, slot.value),
          ),
        ),
      ),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "렌더 파이프라인"),
      h("h2", { className: "side-title" }, currentStep.title),
      h("p", { className: "side-text" }, currentStep.detail),
      h(
        "ol",
        { className: "step-list" },
        ...steps.map((step) =>
          h(
            "li",
            {
              className: step.title === currentStep.title ? "step-item is-active" : "step-item",
            },
            h("strong", {}, step.title),
            h("p", {}, step.detail),
          ),
        ),
      ),
      h("p", { className: "effect-message" }, effectMessage),
    ),
    h(
      "section",
      { className: "side-card" },
      h("p", { className: "eyebrow" }, "최근 상호작용"),
      h("h2", { className: "side-title" }, "state 변경 기록"),
      h(
        "ul",
        { className: "plain-list plain-list--log" },
        ...actionLog.map((entry) => h("li", {}, entry)),
      ),
    ),
  );
}

export function RuntimePanelShell() {
  return h(
    "section",
    { className: "runtime-panel" },
    h("p", { className: "eyebrow" }, "엔진 런타임"),
    h("h2", { className: "side-title" }, "diff / patch 실제 결과"),
    h(
      "div",
      { className: "runtime-metrics" },
      metric("렌더 횟수", h("span", { id: "runtime-render-count" }, "0")),
      metric("diff 변경 수", h("span", { id: "runtime-change-count" }, "0")),
      metric("patch 반영 수", h("span", { id: "runtime-patch-count" }, "0")),
      metric("hook 슬롯 수", h("span", { id: "runtime-hook-count" }, "0")),
    ),
    h(
      "div",
      { className: "runtime-meta" },
      h("p", {}, h("strong", {}, "최근 phase"), " ", h("span", { id: "runtime-phase" }, "mount")),
      h("p", {}, h("strong", {}, "요약"), " ", h("span", { id: "runtime-summary" }, "초기 mount")),
      h("p", {}, h("strong", {}, "업데이트 시각"), " ", h("span", { id: "runtime-updated-at" }, "-")),
      h("p", {}, h("strong", {}, "HTML 길이"), " ", h("span", { id: "runtime-html-size" }, "0 chars")),
    ),
    h("h3", { className: "runtime-subtitle" }, "최근 diff 로그"),
    h("pre", { className: "runtime-code", id: "runtime-change-log" }, "초기 mount"),
    h("h3", { className: "runtime-subtitle" }, "현재 VDOM HTML 미리보기"),
    h("pre", { className: "runtime-code", id: "runtime-html-preview" }, ""),
  );
}
