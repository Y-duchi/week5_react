# Week5 Mini React Task Manager

## 프로젝트 소개

이 프로젝트는 Week4의 **Virtual DOM + Diff + Patch playground**를 버리지 않고,
그 위에 **Component / State / Hooks**를 직접 구현해서
작동하는 React-like mini framework로 확장한 결과물입니다.

핵심 흐름은 그대로 유지됩니다.

1. 루트 함수형 컴포넌트 실행
2. 새로운 Virtual DOM 생성
3. 이전 VDOM과 diff 계산
4. patch로 실제 DOM의 변경된 부분만 반영
5. DOM patch 이후 useEffect 실행

## Week4에서 Week5로 확장된 점

- Week4: DOM -> VDOM 변환, diff, patch, 상태 스냅샷 확인
- Week5: 루트 `FunctionComponent`와 hooks를 얹어 상태 기반 UI를 자동 렌더링
- 결과: 사용자가 입력/클릭하면 `setState -> update -> diff -> patch` 흐름이 실제 화면에서 동작

## 프로젝트 구조

```text
virtualDOM/
├── public/
│   ├── index.html
│   └── tests.html
├── styles/
│   └── main.css
├── src/
│   ├── main.js
│   ├── sampleMarkup.js
│   ├── core/
│   │   ├── README.md
│   │   ├── vdom.js
│   │   ├── diff.js
│   │   ├── patch.js
│   │   ├── component.js
│   │   ├── hooks.js
│   │   └── scheduler.js
│   ├── state/
│   │   ├── README.md
│   │   └── store.js
│   └── ui/
│       ├── README.md
│       └── appUi.js
├── tests/
│   ├── node-logic-tests.js
│   └── runTests.js
├── package.json
└── README.md
```

## Component 구조

- `App`
  - 루트 컴포넌트
  - `useState`, `useMemo`, `useEffect`를 모두 사용
  - 전체 state를 한 곳에서 관리
- `Header`
- `TaskInput`
- `SearchBar`
- `FilterTabs`
- `TaskList`
- `TaskItem`
- `StatsPanel`
- `FrameworkPanel`

중요한 제약은 코드에서 그대로 지켰습니다.

- hooks는 `App` 같은 루트 컴포넌트에서만 사용
- 자식 컴포넌트는 hooks를 쓰지 않음
- 자식 컴포넌트는 props만 받아 렌더링하는 stateless function
- `renderChild()`를 통해 자식 컴포넌트를 호출해서 root-only hook 규칙을 강제

## 왜 state를 루트에만 두었는가

이번 과제의 핵심 제약이 **Lifting State Up**이기 때문입니다.

- `App`이 `tasks`, `draftTitle`, `search`, `filter`, `nextId`를 한 번에 관리
- 자식은 현재 값과 이벤트 핸들러만 props로 전달받음
- 어떤 버튼을 눌러도 최종 상태 변경은 항상 루트 `setState`에서만 발생

이렇게 하면 발표할 때도
"상태는 루트 한 곳에서만 바뀌고, 자식은 화면 조각만 담당한다"
라고 명확하게 설명할 수 있습니다.

## Hook 구현 방식

### useState

- `FunctionComponent.hooks[index]`에 상태 저장
- 렌더링할 때마다 `hookCursor`를 0부터 다시 순회
- 같은 순서의 hook 호출이 같은 index를 재사용
- `setState`는 값만 바꾸는 것이 아니라 `requestUpdate()`도 호출
- `scheduler.js`가 여러 setState를 한 번의 업데이트로 batching

### useEffect

- 이전 deps와 다음 deps를 비교
- 최초 렌더 후 실행
- deps가 바뀌면 cleanup 실행 후 effect 재실행
- effect는 DOM patch 이후 `flushEffects()`에서 실행

### useMemo

- deps가 같으면 이전 계산값 재사용
- deps가 바뀌면 factory 재실행
- 이번 데모에서는 아래에 사용
  - `filteredTasks`
  - `stats`
  - stable action 객체

## Virtual DOM + Hooks 연결 방식

핵심 연결 지점은 [`src/core/component.js`](/Users/yeoduchi/Documents/react_project/Virtual-DOM/src/core/component.js) 입니다.

루트 `FunctionComponent`의 동작 순서:

1. 함수형 컴포넌트 실행
2. 새로운 VDOM 생성
3. `diffTrees(previousVdom, nextVdom)`
4. `patchDom(container, previousVdom, nextVdom)`
5. `useEffect` 실행

즉, hooks는 상태를 유지하고,
week4에서 만든 diff/patch는 실제 DOM 갱신을 담당합니다.

## 데모 앱 기능

- 할 일 추가
- 완료 토글
- 삭제
- 검색
- 상태 필터 (`all / active / completed`)
- 통계 표시
- 남은 개수 / 완료 개수 / 현재 보기 개수
- `useMemo` 기반 filtered list / stats 캐싱
- `useEffect` 기반 localStorage 저장
- `useEffect` 기반 `document.title` 갱신
- 우측 inspector에서 root state / hooks / diff 결과 확인

## 실제 React와의 차이점

- Fiber가 없습니다.
- concurrent rendering이 없습니다.
- hooks는 루트 컴포넌트에서만 허용합니다.
- reconciliation이 훨씬 단순합니다.
- 클래스 컴포넌트, context, ref, synthetic event 시스템이 없습니다.
- `useMemo`와 `useEffect`도 최소 구현만 다룹니다.

## 테스트

### Node 로직 테스트

```bash
npm run test:logic
```

검증 항목:

- useState 상태 유지
- batched setState
- useEffect deps / cleanup
- useMemo 캐시 재사용
- child component에서 hook 사용 금지
- keyed diff 동작
- localStorage에 저장된 빈 task 배열 유지

### 브라우저 테스트

1. 서버 실행

```bash
npm run serve
```

2. 아래 페이지 열기

- 메인 데모: `http://localhost:8000/public/index.html`
- 브라우저 테스트: `http://localhost:8000/public/tests.html`

브라우저 테스트 항목:

- patch 실제 DOM 반영
- 할 일 추가
- 완료 토글
- 필터 변경
- 검색 반영
- localStorage 저장
- memoized 계산 재평가

## 발표 시연 포인트

1. 새 task를 추가해서 `data-key` 기반 리스트 patch를 보여주기
2. 검색어를 입력해 `filteredTasks` useMemo 의존성 변화를 설명하기
3. 완료 체크 후 우측 inspector에서 diff 결과와 hook 상태 확인하기
4. localStorage를 새로고침 뒤에도 유지되는 useEffect 예시로 설명하기
5. `FunctionComponent`의 `mount()` / `update()`를 중심으로 전체 흐름 설명하기

## 테스트 중 발견된 이슈

아래 이슈들은 엣지 케이스 점검 중 확인된 잔여 과제입니다.

### 1. localStorage 저장 실패 시 앱이 예외로 중단될 수 있음

- 재현 방식:
  1. `storage.setItem()`이 quota exceeded 같은 예외를 던지는 환경을 가정한다.
  2. `store.persistState()`를 호출한다.
- 현재 결과:
  - 예외가 그대로 바깥으로 전파된다.
- 원인:
  - `src/state/store.js`의 `persistState()`에 `try/catch`가 없다.
- 영향:
  - 브라우저 저장소 제한, private mode 제약, 권한 문제 상황에서 앱 전체가 깨질 수 있다.

### 2. update가 예약된 뒤 destroy()를 호출해도 예약된 렌더가 계속 실행됨

- 재현 방식:
  1. `setState()`를 호출해 scheduler 큐에 update를 예약한다.
  2. flush 전에 `root.destroy()`를 호출한다.
  3. 예약된 update를 flush 한다.
- 현재 결과:
  - destroy 이후에도 `item.update()`가 실행되어 renderCount가 증가한다.
  - 즉, 이미 파괴된 컴포넌트가 다시 렌더될 수 있다.
- 원인:
  - `src/core/scheduler.js`는 큐에서 컴포넌트를 꺼낼 때 destroy 상태를 확인하지 않는다.
  - `src/core/component.js`의 `destroy()`도 예약된 update를 취소하지 않는다.
- 영향:
  - unmount 직후 비동기 업데이트가 남아 있으면 메모리 누수나 예기치 않은 재렌더링이 발생할 수 있다.
