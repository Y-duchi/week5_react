import { h } from "../runtime/h.js";

function metric(label, value, tone = "default") {
  return h(
    "article",
    {
      className: `metric-card metric-card--${tone}`,
    },
    h("span", { className: "metric-label" }, label),
    h("strong", { className: "metric-value" }, value),
  );
}

function lensText(card) {
  return card.lenses
    .filter((lens) => lens !== "all")
    .map((lens) => lens.toUpperCase())
    .join(" · ");
}

export function HeroPanel({ courseTrail, profile, progress, themeLabel }) {
  return h(
    "section",
    { className: "hero-card" },
    h(
      "div",
      { className: "hero-copy" },
      h("p", { className: "eyebrow" }, "SW-AI 12기 | WEEK5 | 수요 코딩회"),
      h("h1", { className: "hero-title" }, "직접 만든 React-like 엔진으로 읽는 과제 브리프"),
      h(
        "p",
        { className: "hero-text" },
        "Week 3의 Virtual DOM 코어를 유지하면서 FunctionComponent, useState, useEffect, useMemo를 직접 얹어 과제 요구사항을 한 화면에 담았습니다.",
      ),
      h(
        "div",
        { className: "trail-ribbon" },
        ...courseTrail.map((item) =>
          h(
            "span",
            {
              className: item.includes("WEEK5") || item.includes("수요 코딩회")
                ? "trail-chip trail-chip--current"
                : "trail-chip",
            },
            item,
          ),
        ),
      ),
    ),
    h(
      "div",
      { className: "hero-side" },
      h(
        "article",
        { className: "profile-card" },
        h("span", { className: "profile-label" }, "학생 정보"),
        h("strong", { className: "profile-name" }, profile.name),
        h("p", { className: "profile-email" }, profile.email),
        h("p", { className: "profile-stage" }, `${profile.stage} · ${profile.event}`),
        h("span", { className: "profile-theme" }, `현재 테마: ${themeLabel}`),
      ),
      h(
        "div",
        { className: "metric-grid" },
        metric("완료 체크", `${progress.completedCount}/${progress.totalChecklist}`, "warm"),
        metric("노출 카드", `${progress.visibleCardCount}/${progress.totalCardCount}`, "cool"),
        metric("인터랙션", String(progress.interactionCount), "plain"),
      ),
    ),
  );
}

export function ControlBar({
  query,
  selectedLens,
  lensOptions,
  activeTheme,
  themeOptions,
  attendanceChecked,
}) {
  return h(
    "section",
    { className: "control-card" },
    h(
      "div",
      { className: "control-row" },
      h(
        "label",
        { className: "field search-field" },
        h("span", { className: "field-label" }, "빠른 검색"),
        h("input", {
          type: "text",
          value: query,
          placeholder: "예: hooks, diff, 발표",
          "data-action": "search-query",
          "aria-label": "요구사항 검색",
        }),
      ),
      h(
        "div",
        { className: "field field--buttons" },
        h("span", { className: "field-label" }, "보기 관점"),
        h(
          "div",
          { className: "pill-row" },
          ...lensOptions.map((option) =>
            h(
              "button",
              {
                type: "button",
                className: selectedLens === option.id ? "pill-button is-active" : "pill-button",
                "aria-pressed": selectedLens === option.id,
                "data-action": "set-lens",
                "data-lens": option.id,
              },
              option.label,
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { className: "control-row control-row--secondary" },
      h(
        "div",
        { className: "field field--buttons" },
        h("span", { className: "field-label" }, "테마"),
        h(
          "div",
          { className: "pill-row" },
          ...themeOptions.map((option) =>
            h(
              "button",
              {
                type: "button",
                className: activeTheme === option.id ? "ghost-button is-active" : "ghost-button",
                "aria-pressed": activeTheme === option.id,
                "data-action": "set-theme",
                "data-theme": option.id,
              },
              option.label,
            ),
          ),
        ),
      ),
      h(
        "div",
        { className: "control-actions" },
        h(
          "button",
          {
            type: "button",
            className: attendanceChecked ? "status-button is-complete" : "status-button",
            "aria-pressed": attendanceChecked,
            "data-action": "toggle-attendance",
          },
          attendanceChecked ? "출석 체크 완료" : "출석 체크",
        ),
        h(
          "button",
          {
            type: "button",
            className: "ghost-button",
            "data-action": "reset-board",
          },
          "보드 초기화",
        ),
      ),
    ),
  );
}

export function SectionTabs({ sections, activeSection }) {
  return h(
    "section",
    { className: "tab-strip" },
    ...sections.map((section) =>
      h(
        "button",
        {
          type: "button",
          className: activeSection === section.id ? "tab-button is-active" : "tab-button",
          "aria-pressed": activeSection === section.id,
          "data-action": "set-section",
          "data-section": section.id,
        },
        h("span", { className: "tab-label" }, section.title),
        h("span", { className: "tab-count" }, `${section.visibleCards.length} cards`),
      ),
    ),
  );
}

export function SectionShowcase({ section, query }) {
  return h(
    "section",
    { className: "content-card" },
    h(
      "header",
      { className: "section-head" },
      h("div", {}, h("p", { className: "eyebrow" }, section.eyebrow), h("h2", { "data-role": "section-title" }, section.title)),
      h("strong", { className: "section-badge" }, `${section.visibleCards.length}개 노출`),
    ),
    h("p", { className: "section-summary" }, section.summary),
    h(
      "div",
      { className: "tag-row" },
      ...section.tags.map((tag) => h("span", { className: "tag-chip" }, tag)),
    ),
    section.visibleCards.length > 0
      ? h(
          "div",
          { className: "detail-grid" },
          ...section.visibleCards.map((card) =>
            h(
              "article",
              { className: "detail-card" },
              h("span", { className: "detail-lens" }, lensText(card) || "ALL"),
              h("h3", { className: "detail-title" }, card.title),
              h("p", { className: "detail-copy" }, card.detail),
            ),
          ),
        )
      : h(
          "div",
          { className: "empty-card" },
          h("strong", {}, "검색 결과가 없습니다."),
          h(
            "p",
            {},
            query
              ? `"${query}"에 맞는 카드가 현재 섹션에는 없어요. 다른 탭으로 이동하거나 검색어를 바꿔 보세요.`
              : "현재 필터에서 보여줄 카드가 없습니다.",
          ),
        ),
  );
}

export function ChecklistPanel({ checklist, completedIds }) {
  return h(
    "section",
    { className: "side-card" },
    h("p", { className: "eyebrow" }, "Implementation"),
    h("h2", { className: "side-title" }, "구현 체크리스트"),
    h(
      "div",
      { className: "checklist" },
      ...checklist.map((item) => {
        const isDone = completedIds.includes(item.id);

        return h(
          "button",
          {
            type: "button",
            className: isDone ? "check-item is-done" : "check-item",
            "aria-pressed": isDone,
            "data-action": "toggle-checklist",
            "data-id": item.id,
          },
          h("span", { className: "check-state" }, isDone ? "DONE" : "TODO"),
          h(
            "span",
            { className: "check-copy" },
            h("strong", {}, item.label),
            h("small", {}, item.note),
          ),
        );
      }),
    ),
  );
}

export function QuestionPanel({ question, index, total }) {
  return h(
    "section",
    { className: "side-card" },
    h("p", { className: "eyebrow" }, "Key Question"),
    h("h2", { className: "side-title" }, "설명 준비 포인트"),
    h("blockquote", { className: "question-card" }, question),
    h(
      "div",
      { className: "question-foot" },
      h("span", { className: "question-index" }, `${index + 1} / ${total}`),
      h(
        "button",
        {
          type: "button",
          className: "ghost-button",
          "data-action": "next-question",
        },
        "다음 질문",
      ),
    ),
  );
}

export function ReflectionPanel({ note }) {
  return h(
    "section",
    { className: "side-card" },
    h("p", { className: "eyebrow" }, "Reflection"),
    h("h2", { className: "side-title" }, "발표 메모"),
    h("textarea", {
      className: "note-area",
      rows: 8,
      value: note,
      "data-action": "update-note",
      "aria-label": "발표 메모",
    }),
  );
}

export function RuntimePanelShell() {
  return h(
    "section",
    { className: "side-card runtime-card" },
    h("p", { className: "eyebrow" }, "Runtime"),
    h("h2", { className: "side-title" }, "Diff / Patch 인사이트"),
    h(
      "div",
      { className: "runtime-grid" },
      metric("렌더 횟수", h("span", { id: "runtime-render-count" }, "0"), "plain"),
      metric("Diff 변경 수", h("span", { id: "runtime-change-count" }, "0"), "warm"),
      metric("Patch 반영 수", h("span", { id: "runtime-patch-count" }, "0"), "cool"),
      metric("Hook 슬롯", h("span", { id: "runtime-hook-count" }, "0"), "plain"),
    ),
    h(
      "div",
      { className: "runtime-list" },
      h("p", {}, h("strong", {}, "최근 phase"), " ", h("span", { id: "runtime-phase" }, "mount")),
      h("p", {}, h("strong", {}, "요약"), " ", h("span", { id: "runtime-summary" }, "초기 mount")),
      h("p", {}, h("strong", {}, "HTML 길이"), " ", h("span", { id: "runtime-html-size" }, "0 chars")),
      h("p", {}, h("strong", {}, "최근 갱신"), " ", h("span", { id: "runtime-updated-at" }, "-")),
    ),
  );
}

export function FooterBar({ progress, activeSectionTitle }) {
  return h(
    "footer",
    { className: "footer-bar" },
    h(
      "p",
      { className: "footer-copy" },
      `${activeSectionTitle} 섹션을 보고 있습니다. 현재 ${progress.matchingSectionCount}개 섹션에서 ${progress.visibleCardCount}개의 카드가 검색 조건에 맞습니다.`,
    ),
    h(
      "div",
      { className: "footer-metrics" },
      h("strong", { id: "metric-completed" }, String(progress.completedCount)),
      h("span", {}, "items done"),
    ),
  );
}
