# Week 5 React-like Document Viewer

## 한 줄 소개

Week 3의 Virtual DOM / Diff / Patch 코어를 바탕으로, Week 5 요구사항인
`FunctionComponent`, `useState`, `useEffect`, `useMemo`, 루트 state 관리 구조를 직접 붙여 만든
React-like 엔진과 과제 설명 페이지입니다.

이번 버전은 "예쁘게 꾸민 대시보드"가 아니라,
과제 문구를 거의 그대로 읽으면서 오른쪽에서 엔진 동작을 이해할 수 있도록 구성하는 데 집중했습니다.

## 페이지 구성

왼쪽 문서 패널:

- `목적`
- `요구사항`
- `중점 포인트`
- `품질`
- `결과물 발표`

위 5개 섹션을 탭으로 이동하며 읽을 수 있습니다.
검색과 `핵심만 보기` 토글로 현재 섹션 문서를 필터링할 수 있습니다.

오른쪽 엔진 패널:

- 루트 hooks 배열에 어떤 state가 들어있는지 표시
- `state 변경 -> render -> diff -> patch -> effect` 흐름 설명
- 최근 상호작용 로그 표시
- 실제 diff / patch 결과와 현재 VDOM HTML 미리보기 표시

## 요구사항 대응

### Component

- `src/runtime/component.js`
- `FunctionComponent` 클래스 구현
- 내부에 `hooks` 배열 보관
- `mount()` 와 `update()` 직접 구현

### State

- 모든 state는 루트 `App` 컴포넌트에만 있습니다.
- 자식 컴포넌트는 `src/app/components.js`의 순수 함수입니다.
- 자식은 props만 받아 렌더링하고 hooks를 사용하지 않습니다.

### Hooks

- `src/runtime/hooks.js`
- `useState`
- `useEffect`
- `useMemo`

hooks는 루트 `FunctionComponent`의 `hooks` 배열과 `hookCursor` 인덱스로 상태를 유지합니다.

### Virtual DOM + Diff + Patch

- `src/core/vdom.js`
- `src/core/diff.js`
- `src/core/patch.js`

루트 state가 바뀌면:

1. 컴포넌트 함수 재실행
2. 새 Virtual DOM 생성
3. 이전 Virtual DOM과 diff 계산
4. patch로 실제 DOM 일부만 갱신
5. effect 실행

## 상호작용 예시

- 섹션 탭 클릭
- 검색어 입력
- `핵심만 보기` 토글
- `렌더 단계 넘기기`
- `데모 초기화`

이 동작들은 모두 루트 state를 바꾸고, 화면이 다시 렌더링되도록 설계했습니다.

## 실행 방법

```bash
node tests/logic-tests.js
python3 -m http.server 8000
```

브라우저 경로:

- 앱: `http://localhost:8000/public/index.html`
- 브라우저 테스트: `http://localhost:8000/public/tests.html`

## 테스트

### 로직 테스트

`tests/logic-tests.js`

- diff가 텍스트와 속성 변화를 감지하는지
- 문서 필터가 중첩 항목까지 잘 찾는지
- 순수 함수형 자식 컴포넌트가 렌더되는지
- `useState`가 rerender 사이에서 상태를 유지하는지
- `useMemo`가 deps가 바뀔 때만 다시 계산되는지
- `useEffect` cleanup 순서가 맞는지
- batching이 한 tick에서 한 번만 update를 예약하는지

### 브라우저 테스트

`tests/browser-tests.js`

- 초기 섹션이 `목적`인지
- 탭 클릭으로 `요구사항` 섹션으로 이동하는지
- 검색 입력으로 문서가 필터링되는지
- `핵심만 보기` 토글이 동작하는지
- 렌더 단계 넘기기가 단계 제목을 바꾸는지
- 런타임 패널에 렌더 횟수가 표시되는지
