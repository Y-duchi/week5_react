import {
  assignmentSections,
  engineHighlights,
  learningTrail,
  pipelineSteps,
  studentProfile,
} from "../data/content.js";
import { fragment, h } from "../runtime/h.js";
import { useEffect, useMemo, useState } from "../runtime/hooks.js";
import {
  AssignmentDocument,
  ControlPanel,
  EnginePanel,
  HeaderPanel,
  RuntimePanelShell,
} from "./components.js";

let appActions = {};

function countNodes(nodes) {
  return nodes.reduce(
    (count, node) => count + 1 + countNodes(node.children ?? []),
    0,
  );
}

function countImportantNodes(nodes) {
  return nodes.reduce(
    (count, node) => count + (node.important ? 1 : 0) + countImportantNodes(node.children ?? []),
    0,
  );
}

function matchesQuery(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

function filterNodes(nodes, query, importantOnly) {
  return nodes.reduce((filtered, node) => {
    const children = filterNodes(node.children ?? [], query, importantOnly);
    const queryMatch = !query || matchesQuery(node.text, query);
    const importantMatch = !importantOnly || node.important;
    const keepSelf = queryMatch && importantMatch;
    const visibleChildren = query && queryMatch && !importantOnly ? node.children ?? [] : children;

    if (keepSelf || visibleChildren.length > 0) {
      filtered.push({
        ...node,
        children: visibleChildren,
      });
    }

    return filtered;
  }, []);
}

export function buildDocumentView(section, query, importantOnly) {
  const visibleNodes = filterNodes(section.nodes, query.trim(), importantOnly);

  return {
    ...section,
    visibleNodes,
    visibleCount: countNodes(visibleNodes),
    totalCount: countNodes(section.nodes),
    visibleImportantCount: countImportantNodes(visibleNodes),
  };
}

function findSection(sectionId) {
  return assignmentSections.find((section) => section.id === sectionId) ?? assignmentSections[0];
}

function createLog(message) {
  return `${new Date().toLocaleTimeString("ko-KR")} - ${message}`;
}

export function getAppActions() {
  return appActions;
}

export function App() {
  const [activeSection, setActiveSection] = useState(assignmentSections[0].id);
  const [query, setQuery] = useState("");
  const [importantOnly, setImportantOnly] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [actionLog, setActionLog] = useState([createLog("앱이 mount 되었습니다.")]);
  const [effectMessage, setEffectMessage] = useState("useEffect가 아직 실행되지 않았습니다.");

  const section = useMemo(() => findSection(activeSection), [activeSection]);
  const documentView = useMemo(
    () => buildDocumentView(section, query, importantOnly),
    [section, query, importantOnly],
  );
  const currentStep = useMemo(
    () => pipelineSteps[stepIndex % pipelineSteps.length],
    [stepIndex],
  );
  const hookSlots = useMemo(
    () => [
      { index: 0, name: "activeSection", value: activeSection },
      { index: 1, name: "query", value: query || "(빈 문자열)" },
      { index: 2, name: "importantOnly", value: String(importantOnly) },
      { index: 3, name: "stepIndex", value: currentStep.title },
      { index: 4, name: "actionLog", value: `${actionLog.length} entries` },
      { index: 5, name: "effectMessage", value: effectMessage },
    ],
    [activeSection, query, importantOnly, currentStep.title, actionLog.length, effectMessage],
  );

  useEffect(() => {
    const nextMessage = `useEffect 실행 완료: 섹션=${section.title}, 검색=${query || "없음"}, 핵심만=${importantOnly}, 단계=${currentStep.title}`;
    setEffectMessage(nextMessage);

    if (typeof document !== "undefined") {
      document.title = `${section.title} | Week5 React-like`;
    }

    return undefined;
  }, [section.title, currentStep.title, query, importantOnly]);

  function appendLog(message) {
    setActionLog((logs) => [createLog(message), ...logs].slice(0, 8));
  }

  appActions = {
    setSection(sectionId) {
      setActiveSection(sectionId);
      appendLog(`${findSection(sectionId).title} 섹션으로 이동했습니다.`);
    },
    searchQuery(value) {
      setQuery(value);
      appendLog(`검색어를 "${value || "없음"}"으로 바꿨습니다.`);
    },
    toggleImportant() {
      setImportantOnly((value) => !value);
      appendLog("핵심만 보기 상태를 변경했습니다.");
    },
    nextStep() {
      setStepIndex((index) => (index + 1) % pipelineSteps.length);
      appendLog("렌더 파이프라인 설명 단계를 다음으로 넘겼습니다.");
    },
    resetDemo() {
      setActiveSection(assignmentSections[0].id);
      setQuery("");
      setImportantOnly(false);
      setStepIndex(0);
      setActionLog([createLog("reset 버튼으로 여러 state를 한 tick에서 함께 변경했습니다.")]);
    },
  };

  return fragment(
    h(
      "div",
      { className: "page-scene" },
      h(HeaderPanel, {
        trail: learningTrail,
        profile: studentProfile,
        activeTitle: section.title,
        visibleCount: documentView.visibleCount,
        totalCount: documentView.totalCount,
      }),
      h(ControlPanel, {
        sections: assignmentSections,
        activeSection,
        query,
        importantOnly,
        currentStep,
      }),
      h(
        "div",
        { className: "content-layout" },
        h(
          "div",
          { className: "document-column" },
          h(AssignmentDocument, {
            section: documentView,
            query,
            visibleCount: documentView.visibleCount,
            totalCount: documentView.totalCount,
          }),
        ),
        h(
          "div",
          { className: "engine-column" },
          h(EnginePanel, {
            hookSlots,
            currentStep,
            steps: pipelineSteps,
            effectMessage,
            actionLog,
            highlights: engineHighlights,
          }),
          h(RuntimePanelShell),
          h(
            "section",
            { className: "summary-panel" },
            h("p", { className: "eyebrow" }, "useMemo 결과"),
            h("h2", { className: "side-title" }, "지금 화면에서 계산된 값"),
            h(
              "div",
              { className: "summary-grid" },
              h("article", { className: "summary-box" }, h("span", {}, "보이는 항목"), h("strong", {}, String(documentView.visibleCount))),
              h("article", { className: "summary-box" }, h("span", {}, "핵심 항목"), h("strong", {}, String(documentView.visibleImportantCount))),
              h("article", { className: "summary-box" }, h("span", {}, "전체 항목"), h("strong", {}, String(documentView.totalCount))),
            ),
          ),
        ),
      ),
    ),
  );
}
