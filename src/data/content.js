export const studentProfile = {
  name: "황선호",
  email: "hikkcom40@gmail.com",
  course: "SW-AI 12기",
  stage: "컴퓨팅 사고로의 전환",
  event: "수요 코딩회 (수요일)",
};

export const requirementCards = [
  {
    id: "component",
    title: "Component",
    summary: "모든 UI를 함수형 컴포넌트로 분리했습니다.",
    bullets: [
      "루트는 FunctionComponent가 감싸는 App입니다.",
      "자식 컴포넌트는 props만 받는 순수 함수입니다.",
      "mount()와 update()는 src/runtime/component.js에 직접 구현했습니다.",
    ],
  },
  {
    id: "state",
    title: "State",
    summary: "가변 데이터는 전부 루트 App에만 있습니다.",
    bullets: [
      "draftTitle, tasks, filter, selectedTaskId, nextTaskId, actionLog, effectMessage가 루트 state입니다.",
      "입력과 클릭은 모두 루트 state setter를 호출합니다.",
      "자식 컴포넌트는 state가 없고 props만 렌더링합니다.",
    ],
  },
  {
    id: "hooks",
    title: "Hooks",
    summary: "useState, useMemo, useEffect를 모두 사용합니다.",
    bullets: [
      "useState로 입력값, 작업 목록, 필터, 선택 상태를 관리합니다.",
      "useMemo로 보이는 작업 목록과 통계값을 계산합니다.",
      "useEffect로 제목과 effect 메시지를 동기화합니다.",
      "자식 컴포넌트에서 hook을 호출하면 에러가 나도록 막았습니다.",
    ],
  },
  {
    id: "vdom",
    title: "Virtual DOM",
    summary: "state 변경 후 diff와 patch가 실제로 일어납니다.",
    bullets: [
      "새 Virtual DOM 생성",
      "이전 트리와 diff 계산",
      "바뀐 DOM만 patch",
    ],
  },
  {
    id: "test-page",
    title: "Test Page",
    summary: "입력과 클릭으로 바로 확인할 수 있는 브라우저 페이지입니다.",
    bullets: [
      "할 일 추가",
      "완료 토글 및 필터 변경",
      "선택한 항목 메모 수정",
    ],
  },
];

export const initialTasks = [
  {
    id: 1,
    title: "FunctionComponent class 구현",
    category: "component",
    done: false,
    note: "mount(), update(), hooks 배열을 직접 설명할 수 있어야 한다.",
  },
  {
    id: 2,
    title: "useState / useEffect / useMemo 연결",
    category: "hooks",
    done: false,
    note: "함수가 다시 실행돼도 hook index로 상태가 유지된다는 점을 시연한다.",
  },
  {
    id: 3,
    title: "diff / patch 로그 확인",
    category: "vdom",
    done: true,
    note: "오른쪽 런타임 패널에서 변경 수와 최근 diff 로그를 설명한다.",
  },
];

export const filterOptions = [
  { id: "all", label: "전체" },
  { id: "open", label: "미완료" },
  { id: "done", label: "완료" },
];

export const childComponentNames = [
  "HeaderPanel",
  "RequirementGrid",
  "ComposerPanel",
  "FilterBar",
  "TaskListPanel",
  "TaskEditorPanel",
  "EngineInspector",
  "RuntimePanelShell",
];

export const pipelineSteps = [
  "1. 이벤트가 root state setter를 호출한다.",
  "2. App 함수가 다시 실행되어 새 Virtual DOM을 만든다.",
  "3. diffTrees()가 이전/다음 트리를 비교한다.",
  "4. patchDom()이 바뀐 실제 DOM만 수정한다.",
  "5. useEffect가 렌더 후 동기화 작업을 실행한다.",
];
