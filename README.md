# Week5 Mini React Demo

## 한 줄 소개
React를 쓰지 않고 `Component`, `State`, `Hooks`, `Virtual DOM + Diff + Patch`를 직접 구현하고, 그 엔진이 실제로 동작하는 과정을 대시보드형 데모로 시연한 프로젝트입니다.

## 발표용 요약
이 프로젝트의 핵심은 예쁜 UI 자체가 아니라, 우리가 직접 만든 mini React 엔진이 실제 입력에 반응해서 어떻게 상태를 저장하고, 어떤 부분만 다시 렌더링하는지 보여주는 것입니다.

현재 데모는 크게 2개 영역으로 나뉩니다.

- 왼쪽: 사용자가 직접 상호작용하는 작업 보드
- 오른쪽: 우리 엔진의 내부 동작을 보여주는 `Engine Inspector`

즉, 왼쪽에서 액션을 발생시키고 오른쪽에서 `state`, `hooks`, `diff/patch 결과`를 바로 확인할 수 있게 구성했습니다.

---

## 1. 프로젝트 목표

이번 과제에서 집중한 목표는 아래 4가지입니다.

1. 함수형 컴포넌트를 감싸는 `FunctionComponent` 클래스를 직접 구현하기
2. `useState`, `useEffect`, `useMemo`를 hook index 기반으로 직접 구현하기
3. state 변경 시 `render -> diff -> patch -> effect` 흐름이 실제로 동작하도록 만들기
4. 이 과정을 브라우저 데모와 테스트 코드로 검증하기

---

## 2. UI를 어떻게 Component로 나눴는가

루트 컴포넌트는 `App` 하나이고, 나머지는 전부 props-only 자식 컴포넌트입니다.

- `App`
- `WorkspaceHeader`
- `TaskInput`
- `SearchBar`
- `FilterTabs`
- `TaskList`
- `TaskItem`

분리 기준은 “역할”입니다.

- 입력은 입력 컴포넌트
- 검색은 검색 컴포넌트
- 필터는 필터 컴포넌트
- 리스트는 리스트 컴포넌트
- 개별 항목은 item 컴포넌트

중요한 점은 자식 컴포넌트는 state를 가지지 않고, 전부 부모가 내려준 props만 사용한다는 것입니다.

즉,

- 루트는 상태 관리
- 자식은 화면 조각 렌더링

으로 역할을 나눴습니다.

---

## 3. State는 어디에 두었는가

이번 과제 제약에 맞춰 state는 전부 루트 `App`에만 두었습니다.

현재 루트 state에는 아래 값들이 들어 있습니다.

- `tasks`
- `draftTitle`
- `search`
- `filter`
- `nextId`
- `lastAction`
- `recentTaskId`

자식 컴포넌트는 state를 직접 가지지 않고,

- 현재 값
- 이벤트 핸들러

만 props로 받아서 사용합니다.

이 구조를 선택한 이유는 과제의 핵심 제약인 `Lifting State Up`을 분명하게 보여주기 위해서입니다.

---

## 4. Hook은 어떻게 구현했는가

### useState

`useState`는 함수 안에 값을 저장하지 않고, `FunctionComponent.hooks[index]`에 값을 저장합니다.

렌더할 때마다 hook 호출 순서를 다시 따라가고, 같은 순서의 hook는 같은 index를 재사용합니다.

즉,

- 함수는 다시 실행되지만
- 상태는 `hooks 배열` 안에 남아 있어서
- 이전 값을 계속 유지할 수 있습니다.

그리고 `setState`는 값만 바꾸는 것이 아니라 `requestUpdate()`도 호출해서 다시 렌더를 예약합니다.

### useEffect

`useEffect`는 이전 deps와 현재 deps를 비교해서,

- 처음 렌더면 실행
- deps가 바뀌면 cleanup 후 다시 실행
- deps가 안 바뀌면 실행 안 함

으로 동작하게 만들었습니다.

또 effect는 바로 실행하지 않고, DOM patch가 끝난 뒤 `flushEffects()`에서 실행되도록 구성했습니다.

### useMemo

`useMemo`는 의존성이 바뀌지 않으면 이전 계산 결과를 재사용합니다.

현재 데모에서는 아래 3개에 사용했습니다.

- 액션 함수 묶음
- 필터링된 task 목록
- 통계값

즉, 매 렌더마다 모든 계산을 다시 하지 않고 필요한 계산만 다시 하도록 만들었습니다.

---

## 5. setState는 상태 변경 외에 무엇을 해야 하는가

이 프로젝트에서 `setState`는 단순히 값만 바꾸는 함수가 아닙니다.

`setState`가 해야 할 일은 2가지입니다.

1. root state를 새로운 값으로 교체
2. 화면을 다시 그리도록 update를 예약

이후 실제 흐름은 이렇게 이어집니다.

`setState -> scheduler -> update -> render -> diff -> patch -> effect`

즉, 상태 변경은 항상 다시 렌더링과 연결되어야 합니다.

---

## 6. 여러 상태 변경을 한 번에 처리하는 방법

여러 `setState`를 바로바로 렌더하지 않고, 같은 마이크로태스크 안에서는 한 번의 update로 묶는 간단한 batching을 구현했습니다.

구현 방식은:

- 업데이트 대상 컴포넌트를 `Set`에 모으고
- `Promise.resolve().then(...)` 시점에
- 한 번만 `update()` 실행

입니다.

이 방식 덕분에 같은 타이밍의 여러 상태 변경이 있어도 불필요한 중복 렌더를 줄일 수 있습니다.

---

## 7. 체크박스를 클릭하면 어떤 일이 일어나는가

이 부분이 데모에서 가장 설명하기 좋습니다.

1. 사용자가 체크박스를 클릭한다.
2. `handleTaskToggle()`이 실행된다.
3. `useState`가 root state의 `tasks`를 바꾼다.
4. `setState`가 update를 예약한다.
5. `App()`이 다시 실행된다.
6. `useMemo`가 필요한 값만 다시 계산한다.
7. 새 VDOM과 이전 VDOM을 비교한다.
8. 바뀐 부분만 patch한다.
9. 마지막으로 `useEffect`가 실행된다.

이때 오른쪽 Inspector에서 바로 볼 수 있는 것은:

- 상태 스냅샷 변화
- hook 정보
- 변경 로그

입니다.

---

## 8. 왜 오른쪽 Inspector가 중요한가

이 데모는 왼쪽 화면만 보면 그냥 간단한 작업 보드처럼 보일 수 있습니다.

그래서 오른쪽에 `Engine Inspector`를 따로 두었습니다.

오른쪽 패널에서는 아래 4가지를 확인할 수 있습니다.

- Render Count
- HOOK 디버그
- 변경 로그
- 상태 스냅샷

특히 데모할 때는 아래 순서로 보면 좋습니다.

1. 왼쪽에서 `등록`
2. 오른쪽에서 `HOOK 디버그`
3. 오른쪽에서 `변경 로그`
4. 마지막으로 `상태 스냅샷`

이 흐름으로 보면 “우리가 만든 엔진이 실제로 동작하고 있다”는 점을 한눈에 보여줄 수 있습니다.

---

## 9. 실제 React와의 차이점

이번 구현은 React의 핵심 개념만 직접 구현한 최소 버전입니다.

실제 React와의 주요 차이점은 아래와 같습니다.

- Fiber가 없습니다.
- concurrent rendering이 없습니다.
- hook 사용을 루트 컴포넌트로 제한했습니다.
- reconciliation이 훨씬 단순합니다.
- context, ref, synthetic event 같은 기능이 없습니다.
- `useMemo`, `useEffect`도 최소 구현만 다룹니다.

즉, 이번 구현은 “React 전체”가 아니라 React의 핵심 아이디어를 이해하고 구현하는 데 목적이 있습니다.

---

## 10. 테스트

### Node 로직 테스트

```bash
npm run test:logic
```

현재 검증 항목:

- useState 상태 유지
- batched setState
- useEffect deps / cleanup
- useMemo 캐시 재사용
- child component에서 hook 사용 금지
- keyed diff 동작
- localStorage에 저장된 빈 task 배열 유지

### 브라우저 테스트

```bash
python -m http.server 8000
```

테스트 페이지:

- 메인 데모: `http://localhost:8000/public/index.html`
- 브라우저 테스트: `http://localhost:8000/public/tests.html`

브라우저 테스트 항목:

- patch 실제 DOM 반영
- 항목 추가
- 완료 토글
- 필터 변경
- 검색 반영
- localStorage 저장
- memoized 계산 재평가

---

## 11. 4분 발표용 흐름

### 시작

안녕하세요. 저희는 React를 직접 쓰지 않고, 이번 주 과제의 핵심인 `Component`, `State`, `Hooks`, 그리고 `Virtual DOM + Diff + Patch`를 직접 구현한 mini React 엔진을 만들었습니다.

이번 데모의 핵심은 단순히 화면이 바뀌는 것이 아니라, 상태가 바뀐 뒤 엔진 내부에서 어떤 일이 일어나는지를 같이 보여주는 것입니다.

### 구조 설명

화면은 크게 2개 영역입니다.

- 왼쪽은 사용자가 직접 조작하는 작업 보드
- 오른쪽은 엔진 내부를 보여주는 Inspector

그리고 state는 전부 루트 `App`에만 두고, 자식 컴포넌트는 props만 받는 구조로 설계했습니다.

### 데모 1: 등록

먼저 새 워크아이템을 하나 등록해 보겠습니다.

이때 일어나는 일은:

1. 입력창 값이 root state에 저장되고
2. 등록 버튼을 누르면 `setState`가 실행되고
3. update가 예약되고
4. `App()`이 다시 실행되고
5. diff / patch를 통해 바뀐 부분만 실제 DOM에 반영됩니다.

오른쪽에서 보면

- HOOK 디버그
- 변경 로그
- 상태 스냅샷

이 같이 바뀌는 것을 볼 수 있습니다.

### 데모 2: 체크박스 클릭

다음으로 체크박스를 클릭해 보겠습니다.

이때는 `useState`가 `tasks`의 완료 여부를 바꾸고,
`useMemo`가 통계와 리스트를 다시 계산하고,
마지막으로 `useEffect`가 localStorage 저장 같은 후처리를 수행합니다.

즉,

`useState -> useMemo -> diff/patch -> useEffect`

흐름이 한 번에 보이게 됩니다.

### 데모 3: 검색 / 필터

검색어를 입력하거나 필터를 바꾸면,
전체를 무조건 다시 만드는 것이 아니라
의존성이 바뀐 계산만 다시 수행되도록 `useMemo`를 사용했습니다.

이 부분은 오른쪽 `HOOK 디버그`에서 재계산 여부를 설명하기 좋습니다.

### 마무리

정리하면 저희는

- 함수형 컴포넌트를 감싸는 `FunctionComponent`
- root-only state 구조
- 직접 구현한 `useState`, `useEffect`, `useMemo`
- `render -> diff -> patch`

까지 연결해서, React의 핵심 원리를 직접 구현하고 실제 화면으로 검증했습니다.

그리고 테스트 코드까지 작성해서 로직과 동작을 함께 검증했습니다.

감사합니다.

---

## 12. 질의응답 대비 포인트

### 왜 state를 루트에만 두었는가?

이번 과제 제약이 root-only state 구조였고, 상태 흐름을 단순하게 보여주기 위해서입니다.

### 왜 자식에서 hook를 막았는가?

과제 조건을 강제하고, hook index 관리 흐름을 단순하게 보여주기 위해서입니다.

### batching은 어떻게 했는가?

여러 update를 scheduler에 모아 같은 마이크로태스크 안에서는 한 번만 update되도록 구현했습니다.

### 실제 React와 가장 큰 차이는?

Fiber와 concurrent rendering이 없고, hook 사용 범위와 reconciliation이 훨씬 단순합니다.
