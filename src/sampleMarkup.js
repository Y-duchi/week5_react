/**
 * 역할:
 * - Week5 데모 앱이 시작할 때 사용할 샘플 task 데이터와 발표 포인트를 보관합니다.
 * - 파일 이름은 유지해서 "기존 sample 리소스를 확장했다"는 연결점을 남깁니다.
 */

export const sampleTasks = [
  {
    id: 1,
    title: "vdom.js에 h()와 이벤트 속성 동기화 추가",
    category: "Core",
    completed: false,
    createdAt: "2026-03-28",
  },
  {
    id: 2,
    title: "FunctionComponent에서 render -> diff -> patch 흐름 연결",
    category: "Runtime",
    completed: true,
    createdAt: "2026-03-29",
  },
  {
    id: 3,
    title: "useMemo로 검색/필터 결과 캐싱",
    category: "Hooks",
    completed: false,
    createdAt: "2026-03-30",
  },
];

export const frameworkHighlights = [
  "루트 App만 hooks를 사용하고, 자식은 props-only pure function으로 유지합니다.",
  "state 변경은 FunctionComponent.update()를 거쳐 새로운 VDOM을 만들고 diff/patch로 실제 DOM에 반영됩니다.",
  "useMemo는 filteredTasks, stats, stable action 객체를 캐싱합니다.",
  "useEffect는 localStorage 저장과 document.title 동기화를 DOM patch 이후에 실행합니다.",
];
