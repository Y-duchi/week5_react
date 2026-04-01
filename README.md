# Week 5 Mini React Demo

## 한 줄 소개

Week 3의 Virtual DOM / Diff / Patch를 바탕으로, Week 5 요구사항인 `FunctionComponent`, `useState`, `useEffect`, `useMemo`, 루트 전용 state 관리를 직접 구현한 Mini React 데모입니다.

이 저장소의 목표는 "예쁜 화면"보다 "사용자가 직접 입력하거나 버튼을 눌렀을 때 state, hooks, diff / patch가 옆에서 어떻게 바뀌는지 바로 설명할 수 있는 화면"입니다.

## 이 데모에서 바로 설명할 수 있는 것

- 루트 `App`만 state를 가집니다.
- 자식 컴포넌트는 모두 props만 받는 순수 함수입니다.
- `FunctionComponent` 클래스가 `hooks` 배열, `mount()`, `update()`를 직접 관리합니다.
- `setState`가 호출되면 새 Virtual DOM 생성 -> diff -> patch -> effect 순서로 진행됩니다.
- 오른쪽 패널에서 root state, hook slots, effect 메시지, diff / patch 결과를 실시간으로 볼 수 있습니다.

## 화면 구성

### 1. 실제 동작 앱

왼쪽에서 바로 시연할 수 있습니다.

- input 입력
- 작업 추가
- 카드 선택
- 완료 토글
- 필터 변경
- 메모 수정
- 초기화

### 2. 변화 요약 패널

오른쪽 맨 위에서 바로 확인할 수 있습니다.

- 방금 어떤 행동을 했는지
- 어떤 state가 `before -> after`로 바뀌었는지
- 어떤 hook 슬롯이 `before -> after`로 바뀌었는지

### 3. 내부 동작 패널

- Component
- State
- Hooks
- Virtual DOM
- Test Page

- Root state snapshot
- hooks 배열 슬롯
- `useMemo` 계산값
- `useEffect` 결과 메시지
- 최근 action log
- diff / patch 통계와 현재 VDOM HTML

### 4. 요구사항 대응 리스트

각 항목마다 "무엇을 구현했고 어디에 있는지"를 한 줄씩 확인할 수 있습니다.

즉, 화면은 이렇게 설명하면 됩니다.

1. 왼쪽에서 input이나 버튼을 직접 누릅니다.
2. 오른쪽 요약 패널에서 바뀐 state와 hook 슬롯을 바로 보여줍니다.
3. 그 아래 패널에서 현재 root state와 전체 hooks 배열을 봅니다.
4. 마지막으로 runtime 패널에서 diff / patch와 실제 hook delta를 설명합니다.

## 요구사항 대응

### Component

- `src/runtime/component.js`
- `FunctionComponent` 클래스 구현
- `hooks` 배열 보관
- `mount()` / `update()` 직접 구현

### State

- 루트 `App`만 state를 가집니다.
- 상태는 `draftTitle`, `tasks`, `filter`, `selectedTaskId`, `nextTaskId`, `actionLog`, `effectMessage`입니다.
- 자식 컴포넌트는 모두 props만 렌더링합니다.

### Hooks

- `src/runtime/hooks.js`
- `useState`
- `useEffect`
- `useMemo`
- 자식 컴포넌트에서 hook을 호출하면 에러가 나도록 막았습니다.

### Virtual DOM + Diff + Patch

- `src/core/vdom.js`
- `src/core/diff.js`
- `src/core/patch.js`

동작 순서:

1. 이벤트가 root setter를 호출합니다.
2. `App()`이 다시 실행됩니다.
3. 새 Virtual DOM을 만듭니다.
4. 이전 트리와 diff를 계산합니다.
5. 바뀐 DOM만 patch 합니다.
6. render 후 `useEffect`가 실행됩니다.

## 실행 방법

```bash
npm install
npm test
python3 -m http.server 8000
```

- 앱: `http://localhost:8000/`
- 브라우저 테스트: `http://localhost:8000/tests.html`

## 테스트

### 로직 테스트

- diff가 텍스트 / 속성 변화를 감지하는지
- child component가 순수 함수로 렌더되는지
- child component의 hook 호출을 막는지
- `useState`가 rerender 사이에서 유지되는지
- `useMemo`가 deps가 바뀔 때만 다시 계산되는지
- `useEffect` cleanup 순서가 맞는지
- update batching이 동작하는지

### DOM 스모크 테스트

- 입력 후 `draftTitle` 변화 표시
- 작업 추가 후 `tasks` hook 변화 표시
- 항목 선택 / 메모 수정 반영
- 완료 토글 / 필터 변경 후 runtime hook delta 반영
