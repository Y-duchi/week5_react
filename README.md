# Week 5 React-like Engine Dashboard

## 프로젝트 소개

이 프로젝트는 `5giran/Virtual-DOM` 메인 브랜치의 핵심 Virtual DOM / Diff / Patch 코드를 기반으로,
Week 5 요구사항에 맞춰 `FunctionComponent`, `useState`, `useEffect`, `useMemo`를 직접 얹은
React-like 엔진과 데모 페이지를 구현한 결과물입니다.

페이지 주제는 "수요 코딩회 과제 브리프 대시보드"입니다.

- 과제의 목적, 요구사항, 중점 포인트, 품질, 결과물 발표 내용을 한 화면에 정리했습니다.
- 검색, 탭 전환, 체크리스트, 메모, 테마 변경 등 입력/클릭에 따라 화면이 바뀝니다.
- 루트 컴포넌트만 state를 가지고, 자식 컴포넌트는 props만 받는 순수 함수로 구성했습니다.
- 런타임 패널에서 diff 변경 수, patch 반영 수, hook 슬롯 수를 바로 확인할 수 있습니다.

## 요구사항 대응

### 1. Component

- `src/runtime/component.js`에 `FunctionComponent` 클래스를 구현했습니다.
- 이 클래스는 다음을 가집니다.
  - `hooks` 배열
  - `mount()`
  - `update()`
  - `scheduleUpdate()` batching
- 루트 컴포넌트 `App`만 hooks를 사용합니다.
- 자식 컴포넌트는 `src/app/components.js`에 있는 stateless pure function입니다.

### 2. State

- 모든 가변 상태는 `src/app/App.js` 루트 컴포넌트의 hooks에서만 관리합니다.
- 예시 상태:
  - 활성 섹션
  - 검색어
  - 체크리스트 완료 항목
  - 테마
  - 메모
  - 출석 체크 여부
- 자식 컴포넌트는 state를 갖지 않고 props만 받아 렌더링합니다.

### 3. Hooks

- `src/runtime/hooks.js`
  - `useState`
  - `useEffect`
  - `useMemo`
- hooks는 루트 `FunctionComponent`의 `hooks` 배열과 `hookCursor` 인덱스로 상태를 유지합니다.
- `useEffect`는 commit 이후 실행되며 cleanup도 지원합니다.
- `useMemo`는 deps가 바뀌지 않으면 계산을 재사용합니다.

### 4. Virtual DOM + Diff + Patch

- 참고 저장소의 코어를 `src/core`에 유지했습니다.
  - `src/core/vdom.js`
  - `src/core/diff.js`
  - `src/core/patch.js`
- `FunctionComponent.update()` 흐름
  1. 루트 컴포넌트 재실행
  2. 새 Virtual DOM 생성
  3. 이전 Virtual DOM과 diff 계산
  4. patch로 실제 DOM 일부만 갱신
  5. effect 실행

## 파일 구조

```text
react2/
├── public/
│   ├── index.html
│   └── tests.html
├── styles/
│   └── main.css
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── vdom.js
│   │   ├── diff.js
│   │   └── patch.js
│   ├── runtime/
│   │   ├── h.js
│   │   ├── hooks.js
│   │   └── component.js
│   ├── data/
│   │   └── content.js
│   └── app/
│       ├── App.js
│       └── components.js
├── tests/
│   ├── logic-tests.js
│   └── browser-tests.js
├── styles/main.css
├── package.json
└── README.md
```

## 실행 방법

```bash
npm test
python3 -m http.server 8000
```

브라우저에서 아래 경로를 열면 됩니다.

- 앱: `http://localhost:8000/public/index.html`
- 브라우저 테스트 페이지: `http://localhost:8000/public/tests.html`

## 테스트

### 단위 테스트

`tests/logic-tests.js`

- diff가 텍스트와 속성 변화를 감지하는지
- 순수 함수형 자식 컴포넌트가 VDOM에 반영되는지
- `useState`가 rerender 사이에서 상태를 유지하는지
- `useMemo`가 deps가 바뀔 때만 다시 계산되는지
- `useEffect` cleanup 순서가 맞는지
- batching이 한 tick에서 한 번만 update를 예약하는지

### 기능 테스트

`tests/browser-tests.js`

- 초기 섹션이 목적 섹션인지
- 탭 클릭으로 다른 섹션을 볼 수 있는지
- 검색 입력으로 카드가 필터링되는지
- 체크리스트 토글이 완료 수치에 반영되는지
- 런타임 패널에 렌더 횟수가 표시되는지

## 발표 포인트

- 왜 state를 루트에만 두었는가
- hooks 배열과 hook index로 상태가 어떻게 유지되는가
- setState 이후 rerender -> diff -> patch -> effect가 어떻게 이어지는가
- 실제 React와 비교하면 어떤 기능이 단순화되었는가
- Virtual DOM 코어를 어떻게 재사용하고 확장했는가
