export const studentProfile = {
  name: "황선호",
  email: "hikkcom40@gmail.com",
  stage: "컴퓨팅 사고로의 전환",
  event: "수요 코딩회 (수요일)",
};

export const courseTrail = [
  "SW-AI 12기",
  "본과정",
  "출석 체크",
  "내 학습",
  "START",
  "크래프톤 정글 안내",
  "ALWAYS",
  "정글 공부 키워드",
  "Weekly Guide",
  "학습 루틴 & 그라운드 룰",
  "팀 매칭 정보",
  "WEEK1 정글 입성",
  "WEEK2 컴퓨팅 사고로의 전환",
  "WEEK3 컴퓨팅 사고로의 전환",
  "WEEK4 컴퓨팅 사고로의 전환",
  "WEEK5 컴퓨팅 사고로의 전환",
  "문제 풀이 과제 (금 ~ 화요일)",
  "코어타임 코딩 테스트 (토 ~ 화요일)",
  "수요 코딩회 (수요일)",
  "커뮤니티",
  "포럼",
  "버그 제보",
];

export const themeOptions = [
  { id: "citrus", label: "Citrus Glow" },
  { id: "forest", label: "Forest Code" },
  { id: "nightfall", label: "Nightfall Grid" },
];

export const lensOptions = [
  { id: "all", label: "전체" },
  { id: "engine", label: "엔진" },
  { id: "ux", label: "UX" },
  { id: "demo", label: "발표" },
];

export const sections = [
  {
    id: "purpose",
    title: "목적",
    eyebrow: "Purpose",
    summary:
      "AI를 빠르게 활용하되, 생성된 결과를 설명할 수 있을 만큼 구조를 이해하는 것이 이번 과제의 핵심입니다.",
    tags: ["AI 활용", "Top-down", "설명 가능성"],
    cards: [
      {
        id: "purpose-immersion",
        title: "단 하루 집중 프로젝트",
        detail: "단 하루 동안 AI를 도구 삼아 팀 프로젝트에 깊게 몰입하고 결과를 만들어냅니다.",
        lenses: ["all", "demo"],
      },
      {
        id: "purpose-ownership",
        title: "코드를 내 것으로 소화하기",
        detail: "AI가 만든 코드라도 흐름과 원리를 직접 설명할 수 있어야 하며, 이해 없는 복붙은 인정되지 않습니다.",
        lenses: ["engine", "demo"],
      },
      {
        id: "purpose-agility",
        title: "학습 민첩성 극대화",
        detail: "낯선 기능도 Top-down으로 분해해 빠르게 구현해 보며 현업 감각을 익히는 것이 목표입니다.",
        lenses: ["ux", "demo"],
      },
    ],
  },
  {
    id: "requirements",
    title: "요구사항",
    eyebrow: "Requirements",
    summary:
      "Component, State, Hooks, Virtual DOM + Diff + Patch를 직접 구현하고 사용자 상호작용이 있는 페이지로 연결해야 합니다.",
    tags: ["FunctionComponent", "Hooks", "Virtual DOM"],
    cards: [
      {
        id: "requirements-component",
        title: "FunctionComponent 클래스",
        detail:
          "함수형 컴포넌트를 감싸는 FunctionComponent 클래스를 만들고 hooks 배열, mount(), update()를 직접 구현해야 합니다.",
        lenses: ["engine"],
      },
      {
        id: "requirements-state",
        title: "루트 컴포넌트 단일 상태 관리",
        detail:
          "State는 최상위 루트 컴포넌트에서만 관리하고, 자식 컴포넌트는 props만 받는 순수 함수여야 합니다.",
        lenses: ["engine"],
      },
      {
        id: "requirements-hooks",
        title: "useState / useEffect / useMemo",
        detail:
          "함수는 매번 새로 실행되더라도 hooks 배열과 인덱스를 이용해 상태와 메모, 이펙트를 유지해야 합니다.",
        lenses: ["engine"],
      },
      {
        id: "requirements-vdom",
        title: "Virtual DOM + Diff + Patch",
        detail:
          "Week 3의 Virtual DOM 구현을 활용해 이전 VDOM과 다음 VDOM을 비교하고, 변경된 부분만 실제 DOM에 패치해야 합니다.",
        lenses: ["engine", "demo"],
      },
      {
        id: "requirements-ui",
        title: "상호작용이 있는 테스트 페이지",
        detail:
          "클릭, 입력 등 사용자 액션에 따라 화면이 즉시 바뀌는 실제 웹 페이지를 만들어야 합니다.",
        lenses: ["ux", "demo"],
      },
      {
        id: "requirements-tech",
        title: "기술 제한 준수",
        detail:
          "JavaScript, HTML, CSS만 사용하고 React, Vue 같은 외부 프레임워크는 사용할 수 없습니다.",
        lenses: ["all"],
      },
    ],
  },
  {
    id: "focus",
    title: "중점 포인트",
    eyebrow: "Focus",
    summary:
      "컴포넌트 분리, 상태 배치, setState 이후 해야 할 일, batching 가능성, 실제 React와의 차이를 스스로 설명할 수 있어야 합니다.",
    tags: ["State Lifting", "Batching", "React 차이점"],
    cards: [
      {
        id: "focus-component-split",
        title: "UI를 어떻게 나눌 것인가",
        detail:
          "Hero, 필터 바, 섹션 탭, 체크리스트, 질문 카드처럼 역할에 따라 컴포넌트를 분리하고 루트가 props로만 데이터를 전달합니다.",
        lenses: ["ux", "engine"],
      },
      {
        id: "focus-state-location",
        title: "상태는 어디에 둘 것인가",
        detail:
          "활성 섹션, 검색어, 완료 체크, 메모, 테마 등 모든 가변 상태를 루트 컴포넌트 훅에서만 관리합니다.",
        lenses: ["engine"],
      },
      {
        id: "focus-setstate",
        title: "setState 이후 해야 할 일",
        detail:
          "상태값만 바꾸는 것으로 끝나지 않고, 루트 컴포넌트 재실행, 새 VDOM 생성, diff 계산, patch 적용, effect 실행이 이어집니다.",
        lenses: ["engine", "demo"],
      },
      {
        id: "focus-batching",
        title: "여러 상태 변경 묶기",
        detail:
          "queueMicrotask 기반 scheduleUpdate로 같은 이벤트 루프 안의 여러 setState를 한 번의 update로 합치는 batching을 적용했습니다.",
        lenses: ["engine"],
      },
      {
        id: "focus-react-gap",
        title: "실제 React와의 차이점",
        detail:
          "Fiber, concurrent rendering, synthetic event, 정교한 dependency 비교는 없지만 핵심 아이디어를 작게 압축해 직접 구현했습니다.",
        lenses: ["demo"],
      },
    ],
  },
  {
    id: "quality",
    title: "품질",
    eyebrow: "Quality",
    summary:
      "단위 테스트와 기능 테스트, 엣지 케이스 고려, README 기반 발표 준비까지 포함해 포트폴리오 수준으로 마감해야 합니다.",
    tags: ["Unit Test", "기능 테스트", "Portfolio"],
    cards: [
      {
        id: "quality-unit",
        title: "단위 테스트",
        detail:
          "diff 알고리즘, hooks 상태 유지, memo 캐싱, effect cleanup, batching을 Node 테스트로 검증합니다.",
        lenses: ["engine"],
      },
      {
        id: "quality-functional",
        title: "기능 테스트",
        detail:
          "브라우저에서 실제 앱을 마운트한 뒤 탭 이동, 검색, 체크리스트 토글을 확인하는 테스트 페이지를 제공합니다.",
        lenses: ["ux", "demo"],
      },
      {
        id: "quality-edge",
        title: "엣지 케이스",
        detail:
          "같은 값 재설정 무시, 의존성 없는 effect 재실행, 검색 결과 없음, 초기화 동작 같은 경계 상황도 고려합니다.",
        lenses: ["engine"],
      },
      {
        id: "quality-readme",
        title: "README 발표 문서화",
        detail:
          "발표 자료는 따로 만들지 않고 README로 설명해야 하므로, 구조와 구현 포인트를 문서에 명확히 남겨야 합니다.",
        lenses: ["demo"],
      },
    ],
  },
  {
    id: "presentation",
    title: "결과물 발표",
    eyebrow: "Presentation",
    summary:
      "목요일 오전 발표에서 4분 데모와 1분 QnA를 진행하므로, 구현 결과와 검증 과정을 빠르게 설명할 수 있어야 합니다.",
    tags: ["4분 데모", "QnA", "README 중심"],
    cards: [
      {
        id: "presentation-demo",
        title: "짧고 선명한 데모 시나리오",
        detail:
          "테마 변경, 섹션 이동, 검색, 체크리스트 토글, 런타임 패널을 차례로 보여주며 React-like 엔진의 흐름을 설명합니다.",
        lenses: ["demo", "ux"],
      },
      {
        id: "presentation-proof",
        title: "검증 과정 포함",
        detail:
          "AI를 활용해 빠르게 만들었더라도 테스트 케이스와 검증 과정을 함께 보여줘야 신뢰도가 올라갑니다.",
        lenses: ["demo"],
      },
      {
        id: "presentation-qa",
        title: "QnA 대비 포인트",
        detail:
          "왜 state를 루트에만 두었는지, hooks가 어떻게 상태를 유지하는지, 실제 React와 차이가 무엇인지 준비합니다.",
        lenses: ["demo", "engine"],
      },
    ],
  },
];

export const implementationChecklist = [
  {
    id: "function-component",
    label: "FunctionComponent mount/update",
    note: "루트 컴포넌트가 hooks 배열과 update 루프를 직접 가집니다.",
  },
  {
    id: "lifting-state",
    label: "루트 상태 집중 관리",
    note: "자식은 stateless props-only 함수로 유지합니다.",
  },
  {
    id: "hooks",
    label: "useState, useEffect, useMemo",
    note: "상태, 이펙트, 메모가 hooks 인덱스로 복원됩니다.",
  },
  {
    id: "diff-patch",
    label: "Virtual DOM diff + patch",
    note: "참고 저장소 코어를 유지하면서 실제 DOM만 부분 갱신합니다.",
  },
  {
    id: "interactive-ui",
    label: "입력/클릭 기반 인터랙션",
    note: "검색, 섹션 탭, 체크리스트, 메모, 테마 변경을 제공합니다.",
  },
  {
    id: "tests",
    label: "단위 테스트 + 기능 테스트",
    note: "Node 로직 테스트와 브라우저 테스트 페이지를 같이 둡니다.",
  },
  {
    id: "readme",
    label: "README 발표 준비",
    note: "README만 보고도 데모 흐름과 구조를 설명할 수 있게 정리합니다.",
  },
];

export const focusQuestions = [
  "함수는 매번 다시 실행되는데 hooks 배열은 왜 이전 상태를 기억할 수 있을까?",
  "루트에서만 state를 관리하면 어떤 props 흐름이 생기고 어떤 장점이 있을까?",
  "setState 호출 뒤에 rerender, diff, patch, effect는 어떤 순서로 이어질까?",
  "내 구현과 실제 React Fiber 구조의 가장 큰 차이는 무엇일까?",
];

export const defaultReflection =
  "오늘 발표에서 반드시 설명할 핵심 구현 포인트를 여기에 정리하세요. 예: hooks 인덱스 유지, 루트 상태 집중, diff 후 patch.";
