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
- 깨진 JSON 저장 데이터 복구
- storage 읽기 실패 시 seed 데이터로 복구
- tasks 필드가 없는 저장 payload 복구
- localStorage에 저장된 잘못된 task id 복구
- localStorage에 저장된 중복 task id 정규화
- localStorage에 저장된 malformed task entry 복구
- localStorage에 저장된 빈 task title 복구
- localStorage에 저장된 빈 category / createdAt 복구
- localStorage에 저장된 object 형태 문자열 필드 복구
- 존재하지 않는 task target 이벤트 무시
- localStorage 저장 실패 시 앱 계속 동작
- destroy 이후 예약된 update 무시

브라우저 테스트에서는 아래를 검증합니다.

- patch 실제 DOM 반영
- 항목 추가
- 완료 토글
- 필터 변경
- 검색 반영
- localStorage 저장
- memoized 계산 재평가

## 이번에 찾은 엣지 케이스

### localStorage JSON 자체가 깨진 경우

저장된 문자열이 아예 JSON 형식이 아니면 파싱 단계에서 바로 실패할 수 있습니다.

현재는 이런 경우 저장 데이터를 버리고, 앱이 기본 seed 데이터로 다시 시작하도록 처리되어 있습니다.

### localStorage 읽기 자체가 실패하는 경우

브라우저 환경이나 보안 제약 때문에 `getItem()` 호출 자체가 실패할 수도 있습니다.

이 경우에도 앱이 죽지 않고, 기본 seed 데이터로 복구되도록 되어 있습니다.

### localStorage payload에 tasks 필드가 없는 경우

저장 데이터는 읽혔지만 정작 `tasks` 필드가 없으면 앱 입장에서는 복원할 작업 목록이 없습니다.

현재는 이런 경우도 깨진 payload로 보고, seed 데이터로 되돌아가도록 처리되어 있습니다.

### localStorage에 잘못된 task id가 들어온 경우

실사용 환경에서는 storage payload가 항상 정상이라고 가정할 수 없습니다. 이전 버전 데이터, 수동 수정, 잘못된 마이그레이션 때문에 `task.id`가 숫자가 아닌 문자열로 들어올 수 있습니다.

이 경우 기존 구현에서는 아래 문제가 연쇄적으로 발생했습니다.

- `Number("bad-id")`가 `NaN`이 되어 기존 task id가 깨짐
- `nextId` 계산도 `NaN`이 되어 이후 추가되는 새 task id도 함께 깨짐
- keyed diff / recentTaskId / 저장 데이터 일관성이 모두 흔들릴 수 있음

현재는 hydration 단계에서 잘못된 id를 안전한 숫자 id로 보정하고, 회귀 테스트로 아래 시나리오를 검증합니다.

1. 잘못된 id를 가진 저장 데이터를 읽는다.
2. 초기 state가 숫자 id로 복구되는지 확인한다.
3. 새 task를 추가했을 때 다음 id가 정상적으로 증가하는지 확인한다.

### localStorage에 중복된 task id가 들어온 경우

id가 숫자여도 중복되면 keyed diff와 task 토글/삭제 로직이 흔들릴 수 있습니다. 실제로 기존 구현에서는 같은 id를 가진 두 항목이 있으면 한 항목을 토글했을 때 두 항목이 같이 바뀌는 문제가 재현됐습니다.

현재는 hydration 단계에서 id를 순회하며 중복을 제거하고, 이미 사용된 id와 충돌하지 않는 새 숫자 id를 다시 부여합니다.

### localStorage의 task 배열 안에 malformed entry가 섞인 경우

`tasks` 배열 안에 `null`, 숫자 같은 원시값, shape가 깨진 객체가 섞여 있으면 기존 구현에서는 hydration 도중 바로 크래시가 났습니다.

현재는 각 entry를 안전한 객체 형태로 보정한 뒤 기본값을 채우도록 처리했습니다. 덕분에 일부 데이터가 깨져 있어도 앱은 뜨고, 복구 가능한 범위 안에서 task 목록을 유지할 수 있습니다.

### localStorage에 빈 task title이 들어온 경우

데이터 shape는 맞더라도 `title`이 빈 문자열이거나 공백만 들어오면, 화면에는 내용 없는 task가 렌더링됩니다. 앱이 죽지는 않지만 사용자는 왜 빈 항목이 보이는지 이해하기 어렵고, 검색/검토 흐름도 나빠집니다.

현재는 trim 이후 title이 비어 있으면 `Task n` 형식의 기본 라벨로 복구하도록 처리했습니다.

### localStorage에 빈 category나 createdAt이 들어온 경우

task는 보여도 카테고리 뱃지나 날짜가 비어 있으면 화면 품질이 많이 떨어집니다.

현재는 category가 비어 있으면 `General`, createdAt이 비어 있으면 기본 날짜로 복구하도록 처리했습니다.

### localStorage에 object 형태 값이 문자열 필드에 들어온 경우

title, category, createdAt 자리에 객체가 들어오면 화면에는 `[object Object]` 같은 이상한 문자열이 보일 수 있습니다.

현재는 문자열/숫자/불리언만 허용하고, 그 외 값은 기본 라벨로 복구하도록 처리했습니다.

### 존재하지 않는 task target으로 이벤트가 들어온 경우

삭제 버튼이나 체크박스 이벤트가 비정상 `taskId`를 들고 들어오면, 실제 task 목록은 바뀌지 않아도 `lastAction` 같은 디버그 상태가 오염될 수 있습니다.

현재는 target task를 찾지 못하면 toggle/remove를 no-op으로 처리해서, 리스트와 inspector 상태가 함께 일관되게 유지되도록 했습니다.

### localStorage 저장이 실패하는 경우

브라우저의 저장 용량 초과, private mode 제약, 보안 정책 등으로 `storage.setItem()`이 실패할 수 있습니다. 기존 구현에서는 이 예외가 그대로 전파되어 앱 전체 흐름이 끊어졌습니다.

현재는 persistence 실패를 삼키고 in-memory state 흐름은 유지하도록 처리했습니다. 즉, 저장은 실패하더라도 입력, 토글, 필터 같은 UI 상호작용은 계속 가능합니다.

### destroy 이후 예약된 update가 남아 있는 경우

batched update가 예약된 뒤 컴포넌트가 먼저 `destroy()`되면, 이미 큐에 들어간 update가 나중에 다시 실행될 수 있습니다. 기존 구현에서는 destroy 이후에도 renderCount가 증가하고 컴포넌트가 다시 mounted 상태로 돌아오는 문제가 있었습니다.

현재는 destroyed 상태를 추적해서, destroy 이후의 `update()`와 commit은 무시되도록 막았습니다.

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

### 1. storage payload 스키마 검증 범위

현재는 `task.id` 중심으로 복구 로직을 넣었지만, title/category/createdAt까지 포함한 전체 schema validation은 아직 단순한 편입니다.

### 2. 브라우저 기반 회귀 테스트 확장

지금 추가한 edge case 대부분은 Node 로직 테스트로 검증하고 있습니다. storage 실패나 destroy 이후 update 같은 흐름은 브라우저 상호작용 기반 시나리오로도 확장해볼 수 있습니다.

## 참고

데모 시에는 왼쪽에서 액션을 발생시킨 뒤, 오른쪽 Inspector에서 상태 변화와 hook / diff 로그를 함께 보는 방식으로 흐름을 설명하기 좋습니다.
