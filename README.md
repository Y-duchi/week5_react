# Week5 Mini React

## 소개

이 프로젝트는 React를 사용하지 않고, `Component`, `State`, `Hooks`, `Virtual DOM + Diff + Patch`를 직접 구현한 mini React 실습 프로젝트입니다.

브라우저 데모에서는 사용자의 입력과 클릭에 따라 루트 컴포넌트가 다시 실행되고, 새로운 Virtual DOM을 만든 뒤 이전 결과와 비교해서 바뀐 부분만 실제 DOM에 반영합니다. 오른쪽 Inspector 패널에서는 이 과정을 상태 스냅샷, hook 정보, 변경 로그로 확인할 수 있습니다.

## 핵심 구현 내용

### FunctionComponent

함수형 컴포넌트를 감싸는 `FunctionComponent` 클래스를 직접 구현했습니다.

포함된 주요 요소:

- `hooks` 배열
- `mount()`
- `update()`
- `render()`
- `flushEffects()`

이 클래스를 중심으로 `render -> diff -> patch -> effect` 흐름이 연결됩니다.

관련 파일:

- [`src/core/component.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/component.js)

### Hooks

직접 구현한 hook는 아래 3가지입니다.

- `useState`
- `useEffect`
- `useMemo`

hook는 호출 순서를 기반으로 `hooks[index]`를 재사용합니다. 이 방식으로 함수형 컴포넌트가 다시 실행되어도 이전 상태를 유지할 수 있습니다.

관련 파일:

- [`src/core/hooks.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/hooks.js)

### Root-only state 구조

과제 제약에 맞춰 state는 루트 `App`에서만 관리합니다.

현재 루트 state 예시:

- `tasks`
- `draftTitle`
- `search`
- `filter`
- `nextId`
- `lastAction`
- `recentTaskId`

자식 컴포넌트는 state를 가지지 않고, props만 받아서 렌더링합니다.

관련 파일:

- [`src/ui/appUi.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/ui/appUi.js)

### Virtual DOM + Diff + Patch

상태가 바뀌면 새로운 Virtual DOM을 만들고, 이전 Virtual DOM과 비교하여 실제 DOM에는 바뀐 부분만 반영합니다.

관련 파일:

- [`src/core/vdom.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/vdom.js)
- [`src/core/diff.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/diff.js)
- [`src/core/patch.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/patch.js)

### 간단한 batching

같은 마이크로태스크 안에서 발생한 여러 업데이트를 한 번의 `update()`로 처리하도록 간단한 batching을 구현했습니다.

관련 파일:

- [`src/core/scheduler.js`](/C:/Users/KJ/codex/mini_react/week5_react/src/core/scheduler.js)

## 데모 UI 구성

데모 화면은 크게 3개 영역으로 나뉩니다.

- 메인 작업 영역
- 워크아이템 보드
- Engine Inspector

메인 작업 영역에서는 항목 등록, 검색, 필터 전환을 할 수 있고, 워크아이템 보드에서는 체크박스와 삭제 버튼으로 상태를 바꿀 수 있습니다. Inspector에서는 아래 정보를 확인할 수 있습니다.

- Render Count
- Patch Count
- Memo Cache Hits
- 상태 스냅샷
- HOOK 디버그
- 변경 로그

## 프로젝트 구조

```text
week5_react/
├── public/
│   ├── index.html
│   └── tests.html
├── styles/
│   └── main.css
├── src/
│   ├── main.js
│   ├── sampleMarkup.js
│   ├── core/
│   │   ├── component.js
│   │   ├── diff.js
│   │   ├── hooks.js
│   │   ├── patch.js
│   │   ├── scheduler.js
│   │   └── vdom.js
│   ├── state/
│   │   └── store.js
│   └── ui/
│       └── appUi.js
├── tests/
│   ├── node-logic-tests.js
│   └── runTests.js
├── package.json
└── README.md
```

## 실행 방법

### 1. 로직 테스트 실행

```bash
npm run test:logic
```

### 2. 브라우저에서 데모 실행

```bash
python -m http.server 8000
```

브라우저에서 아래 주소를 엽니다.

- 메인 데모: [http://localhost:8000/public/index.html](http://localhost:8000/public/index.html)
- 브라우저 테스트: [http://localhost:8000/public/tests.html](http://localhost:8000/public/tests.html)

## 테스트 항목

현재 Node 로직 테스트에서는 아래를 검증합니다.

- useState 상태 유지
- batched setState
- useEffect deps / cleanup
- useMemo 캐시 재사용
- child component에서 hook 사용 금지
- keyed diff 동작
- localStorage에 저장된 빈 task 배열 유지

브라우저 테스트에서는 아래를 검증합니다.

- patch 실제 DOM 반영
- 항목 추가
- 완료 토글
- 필터 변경
- 검색 반영
- localStorage 저장
- memoized 계산 재평가

## 구현 포인트 정리

### UI를 어떻게 Component로 나눴는가

UI는 역할 기준으로 분리했습니다.

- `App`: 전체 상태와 흐름 관리
- `TaskInput`: 입력 영역
- `SearchBar`: 검색 영역
- `FilterTabs`: 필터 전환
- `TaskList`: 리스트 영역
- `TaskItem`: 개별 항목

루트는 상태를 관리하고, 자식은 화면 조각을 렌더링하는 구조입니다.

### State는 어디에 두는 것이 좋은가

이번 과제에서는 state를 루트 `App`에만 두었습니다. 자식 컴포넌트는 props만 사용합니다. 이렇게 하면 상태 변경 흐름이 단순해지고, 어떤 입력이든 최종 상태 변경이 루트에서만 일어나도록 통제할 수 있습니다.

### setState는 상태 변경 외에 무엇을 해야 하는가

이 프로젝트에서 `setState`는 상태를 바꾸는 것에서 끝나지 않습니다. 상태가 바뀐 뒤 반드시 `requestUpdate()`를 호출해서 다시 렌더를 예약해야 합니다.

실제 역할은 아래와 같습니다.

1. 새로운 state 저장
2. update 예약
3. 이후 `render -> diff -> patch -> effect` 흐름 연결

### 여러 상태 변경을 한 번에 처리하는 방법

여러 `setState`를 바로바로 렌더하지 않고 scheduler에 모아 한 번만 `update()`되도록 구성했습니다. 이 부분은 선택 과제였던 batching 아이디어를 간단하게 반영한 구현입니다.

### 실제 React와의 차이

이번 구현은 React의 핵심 아이디어를 단순화한 버전입니다.

차이점:

- Fiber 없음
- concurrent rendering 없음
- hook 사용 범위를 루트로 제한
- reconciliation이 매우 단순함
- context, ref, synthetic event 등의 기능 없음

## 현재 남아 있는 이슈

다음 항목들은 아직 남아 있는 개선 포인트입니다.

### 1. localStorage 저장 실패 예외 처리 부족

`storage.setItem()`이 실패하는 환경에서는 예외가 그대로 전파될 수 있습니다.

### 2. destroy 이후 예약된 update 처리

`destroy()` 이후에도 이미 예약된 update가 실행될 수 있습니다. 현재 scheduler는 destroy 상태를 별도로 확인하지 않습니다.

## 참고

데모 시에는 왼쪽에서 액션을 발생시킨 뒤, 오른쪽 Inspector에서 상태 변화와 hook / diff 로그를 함께 보는 방식으로 흐름을 설명하기 좋습니다.
