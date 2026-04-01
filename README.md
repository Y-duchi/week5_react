# React-like Todo / Task Manager

React 없이 `Component`, `State`, `Hook`, `Virtual DOM`, `Diff`, `Patch`를 직접 구현한 학습용 프로젝트입니다.  
가장 중요한 목표는 "처음 읽는 사람이 전체 흐름을 따라갈 수 있게 만드는 것"입니다.

## 먼저 이것부터 보세요

이 버전은 파일 수를 줄였습니다.

1. [`src/core/runtime.js`](./src/core/runtime.js)
   - `h`
   - `useState`
   - `useEffect`
   - `useMemo`
   - `diff`
   - `patch`
   - `FunctionComponent`
2. [`src/app/App.js`](./src/app/App.js)
   - 루트 state
   - Todo 앱 로직
   - stateless child component
3. [`tests/integration/todo-app.test.js`](./tests/integration/todo-app.test.js)
   - 실제 사용 흐름 테스트

핵심은 이 두 줄입니다.

- "엔진은 `runtime.js` 한 파일에 모았다."
- "앱은 `App.js` 한 파일에 모았다."

## 폴더 구조

```text
week5_react/
├─ index.html
├─ package.json
├─ src/
│  ├─ main.js
│  ├─ styles.css
│  ├─ app/
│  │  └─ App.js
│  └─ core/
│     └─ runtime.js
├─ tests/
│  ├─ helpers/
│  │  └─ testUtils.js
│  ├─ integration/
│  │  └─ todo-app.test.js
│  └─ unit/
│     ├─ component.test.js
│     ├─ diff-patch.test.js
│     ├─ h.test.js
│     └─ hooks.test.js
└─ README.md
```

## 과제 요구사항과 구현 매핑

| 요구사항 | 구현 위치 |
| --- | --- |
| `h(type, props, ...children)` | `src/core/runtime.js` |
| `FunctionComponent` 클래스 | `src/core/runtime.js` |
| `hooks` 배열 | `src/core/runtime.js` |
| `mount()` / `update()` | `src/core/runtime.js` |
| `useState` | `src/core/runtime.js` |
| `useEffect` | `src/core/runtime.js` |
| `useMemo` | `src/core/runtime.js` |
| Virtual DOM 생성 | `src/core/runtime.js` |
| Diff | `src/core/runtime.js` |
| Patch | `src/core/runtime.js` |
| 루트 state only Todo 앱 | `src/app/App.js` |
| 테스트 | `tests/` |

## 아주 짧은 구조 설명

### 1. 루트 state는 `App`만 가진다

```js
const [todos, setTodos] = useState(() => loadTodosFromStorage());
const [draftText, setDraftText] = useState('');
const [filter, setFilter] = useState('all');
const [sort, setSort] = useState('created-desc');
```

### 2. 자식은 모두 순수 함수다

- state 없음
- Hook 없음
- props만 사용

### 3. 상태가 바뀌면 이렇게 흐른다

1. `setState`
2. `update()`
3. 새 Virtual DOM 생성
4. 이전 Virtual DOM과 `diff`
5. 필요한 DOM만 `patch`
6. 마지막에 `useEffect` 실행

## runtime.js 안에서 무엇을 보면 되나

### `h`
- 화면을 VNode로 만든다.

### `useState`
- `hooks[index]`에 상태를 저장한다.

### `useEffect`
- 렌더가 끝난 뒤 실행할 작업을 예약한다.

### `useMemo`
- 파생 계산 결과를 재사용한다.

### `diffTrees`
- 이전 트리와 새 트리를 비교한다.

### `patchDom`
- 바뀐 DOM만 수정한다.

### `FunctionComponent`
- 루트 함수형 컴포넌트를 감싸고
- `hooks`, `hookIndex`, `mount`, `update`를 관리한다.

## App.js 안에서 무엇을 보면 되나

### 위쪽
- storage 함수
- Todo 생성 함수
- 필터/정렬 함수

### 가운데
- `AppHeader`, `TodoComposer`, `ControlPanel`, `StatsPanel`, `TodoList`
- 모두 stateless child component

### 아래쪽
- 실제 루트 컴포넌트 `App`
- state, memo, effect, event handler가 모두 모여 있다

## 실제 React와 다른 점

이 프로젝트는 학습용 단순화 버전입니다.

- Hook은 루트 컴포넌트에서만 사용 가능
- child state 없음
- batching 없음
- fiber / scheduler 없음
- context / ref / suspense 없음

즉, "원리를 이해하기 위한 최소 React-like 엔진"이라고 보면 됩니다.

## 테스트

### 단위 테스트

- `h`가 VNode를 제대로 만드는지
- `FunctionComponent`가 mount/update를 제대로 하는지
- `useState`, `useEffect`, `useMemo`가 제대로 동작하는지
- `diff`와 `patch`가 제대로 동작하는지

### 통합 테스트

- Todo 추가
- 빈 문자열 방지
- 완료 토글
- 삭제
- 필터
- 정렬
- 통계 반영
- localStorage / document.title 동기화

## 실행 방법

반드시 이 폴더 안에서 실행합니다.

```bash
cd C:\Users\KJ\codex\mini_react\week5_react
npm install
npm run dev
```

## 테스트 실행

```bash
npm run test:run
```

## 발표할 때 이렇게 말하면 됩니다

- "`runtime.js` 한 파일에 React의 핵심 개념을 직접 모아 구현했습니다."
- "상태와 Hook은 루트 `App`에만 두고, 자식은 모두 props-only 순수 함수로 제한했습니다."
- "상태가 바뀌면 새 Virtual DOM을 만들고, diff 후 patch 해서 필요한 DOM만 갱신합니다."
- "`useMemo`는 파생값 캐시, `useEffect`는 localStorage와 title 동기화에 사용했습니다."
