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
    index: "01",
    title: "Component",
    summary: "모든 UI를 함수형 컴포넌트로 나눴습니다.",
    proof: "루트는 FunctionComponent가 감싸는 App이고, mount() / update()를 직접 구현했습니다.",
    location: "src/runtime/component.js",
  },
  {
    id: "state",
    index: "02",
    title: "State",
    summary: "가변 데이터는 전부 루트 App 하나에만 있습니다.",
    proof: "draftTitle, tasks, filter, selectedTaskId, nextTaskId, actionLog, effectMessage가 모두 루트 state입니다.",
    location: "src/app/App.js",
  },
  {
    id: "hooks",
    index: "03",
    title: "Hooks",
    summary: "useState, useMemo, useEffect를 직접 구현해서 사용합니다.",
    proof: "자식 컴포넌트에서 hook을 호출하면 에러가 나도록 막아서 '루트 전용 hook' 제약도 보이게 했습니다.",
    location: "src/runtime/hooks.js",
  },
  {
    id: "vdom",
    index: "04",
    title: "Virtual DOM",
    summary: "state 변경 뒤 새 Virtual DOM을 만들고 diff / patch를 수행합니다.",
    proof: "오른쪽 런타임 패널에서 diff 수, patch 수, 최근 변경 로그를 바로 확인할 수 있습니다.",
    location: "src/core/diff.js / src/core/patch.js",
  },
  {
    id: "test-page",
    index: "05",
    title: "Test Page",
    summary: "입력과 클릭으로 과제 핵심 기능을 바로 시연하는 페이지입니다.",
    proof: "작업 추가, 완료 토글, 필터 변경, 메모 수정으로 화면이 실제로 변합니다.",
    location: "src/app/components.js",
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

export const presentationSteps = [
  {
    id: 0,
    title: "시작",
    summary: "초기 화면입니다. 아직 아무것도 바꾸지 않았습니다.",
  },
  {
    id: 1,
    title: "입력값 저장",
    summary: "input에 쓴 값이 draftTitle root state에 저장됩니다.",
  },
  {
    id: 2,
    title: "작업 추가",
    summary: "tasks state에 새 항목이 추가되고 선택 상태도 같이 바뀝니다.",
  },
  {
    id: 3,
    title: "선택 상태 변경",
    summary: "selectedTaskId가 바뀌면서 오른쪽 설명 패널이 교체됩니다.",
  },
  {
    id: 4,
    title: "메모 수정",
    summary: "tasks 내부 note 값이 바뀌고 카드 미리보기까지 함께 갱신됩니다.",
  },
  {
    id: 5,
    title: "완료 + 필터 적용",
    summary: "done 상태와 filter가 같이 바뀌면서 보이는 목록이 달라집니다.",
  },
];

export const presentationTaskSeed = {
  title: "발표 시연 순서 정리",
  note: "오른쪽 패널에서 state, hooks, diff / patch 순서로 설명한다.",
  updatedNote: "입력 -> state -> rerender -> diff -> patch -> effect 순서로 발표한다.",
};

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
