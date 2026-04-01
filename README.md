
# Week5 Mini React

React 없이 **Component**, **Hooks**, **State**, **Virtual DOM + Diff + Patch**의 핵심 흐름을 직접 구현한 Mini React 프로젝트입니다.

## 핵심 목표

이 프로젝트의 목적은 Todo UI를 만드는 것보다,
**상태 변경이 발생했을 때 내부 엔진이 어떻게 동작하는지 직접 구현하고 확인하는 것**입니다.

사용자 입력이 발생하면 루트 컴포넌트가 다시 실행되고,
새로운 Virtual DOM을 만든 뒤 이전 Virtual DOM과 비교합니다.
이후 바뀐 부분만 실제 DOM에 반영합니다.

즉, 이 프로젝트는 **render -> diff -> patch -> effect** 흐름을 학습하기 위한 실습 프로젝트입니다.

---

## 주요 구현 내용
<img width="1408" height="768" alt="image" src="https://github.com/user-attachments/assets/5b7dc604-c358-4c4b-8a99-8d6b66e8672d" />

### 1. FunctionComponent
함수형 컴포넌트를 감싸는 `FunctionComponent` 클래스를 직접 구현했습니다.

포함 기능:
- `hooks` 배열
- `mount()`
- `update()`
- `render()`
- `flushEffects()`

관련 파일:
- `src/core/component.js`

### 2. Hooks
직접 구현한 Hook:
- `useState`
- `useEffect`
- `useMemo`

Hook은 호출 순서를 기준으로 `hooks[index]`를 재사용하여 상태를 유지합니다.

관련 파일:
- `src/core/hooks.js`

### 3. Root-only state 구조
과제 조건에 맞춰 state는 루트 `App`에서만 관리합니다.

예시 state:
- `tasks`
- `draftTitle`
- `search`
- `filter`
- `nextId`

자식 컴포넌트는 state 없이 props만 받아 렌더링합니다.

관련 파일:
- `src/ui/appUi.js`

### 4. Virtual DOM + Diff + Patch
상태가 바뀌면 새로운 Virtual DOM을 만들고,
이전 Virtual DOM과 비교하여 바뀐 부분만 실제 DOM에 반영합니다.

관련 파일:
- `src/core/vdom.js`
- `src/core/diff.js`
- `src/core/patch.js`

---

## 데모 UI

- 실행방법

  ```npm run serve```
  
  메인 데모: http://localhost:8000/public/index.html

데모 화면은 아래 3개 영역으로 구성됩니다.

- 메인 작업 영역
- 워크아이템 보드
- Engine Inspector

Inspector에서 확인 가능한 정보:
- Render Count
- Patch Count
- Memo Cache Hits
- 상태 스냅샷
- Hook 디버그
- 변경 로그

---
## 테스트 케이스
## 테스트 실행 결과

### 1. 단위 테스트

| 구분 | 실행 명령 | 검증 내용 | 결과 |
| --- | --- | --- | --- |
| Hook 상태 유지 | `node tests/node-logic-tests.js` | `useState`가 렌더 사이에서 상태를 유지하는지 확인 | PASS |
| 상태 업데이트 배치 | `node tests/node-logic-tests.js` | 여러 `setState` 호출이 1번의 추가 업데이트로 배치되는지 확인 | PASS |
| Effect 동작 | `node tests/node-logic-tests.js` | `useEffect`가 deps 변경 시 cleanup 후 다시 실행되는지 확인 | PASS |
| Memo 캐시 | `node tests/node-logic-tests.js` | `useMemo`가 deps 불변 시 캐시를 재사용하는지 확인 | PASS |
| Hook 제한 규칙 | `node tests/node-logic-tests.js` | 자식 컴포넌트에서 hook 사용이 차단되는지 확인 | PASS |
| Diff 동작 | `node tests/node-logic-tests.js` | keyed insert, text update, child move가 감지되는지 확인 | PASS |
| 저장소 복구 로직 | `node tests/node-logic-tests.js` | 빈 값, 손상된 JSON, 누락 필드, 잘못된 id 등을 안전하게 복구하는지 확인 | PASS |
| 액션 안정성 | `node tests/node-logic-tests.js` | 존재하지 않는 task 대상 조작이 상태를 오염시키지 않는지 확인 | PASS |
| 편집 중 memo 최적화 | `node tests/node-logic-tests.js` | draft 수정 중에는 memo 재계산이 일어나지 않고 저장 시에만 반영되는지 확인 | PASS |
| destroy 이후 업데이트 무시 | `node tests/node-logic-tests.js` | 언마운트 후 예약된 업데이트가 렌더를 다시 발생시키지 않는지 확인 | PASS |

**단위 테스트 총 결과:** `20 / 20 PASS`

---

### 2. 기능 테스트

| 구분 | 실행 방식 | 검증 내용 | 결과 |
| --- | --- | --- | --- |
| DOM patch 반영 | `public/tests.html` 브라우저 실행 | 변경된 DOM 노드만 올바르게 갱신되는지 확인 | PASS |
| Todo 추가 | `public/tests.html` 브라우저 실행 | 새 작업이 목록 상단에 추가되는지 확인 | PASS |
| 완료 토글 | `public/tests.html` 브라우저 실행 | 체크박스 변경 시 완료 상태 스타일이 반영되는지 확인 | PASS |
| 완료 필터 | `public/tests.html` 브라우저 실행 | 완료된 작업만 필터링되어 표시되는지 확인 | PASS |
| 검색 필터 | `public/tests.html` 브라우저 실행 | 검색어 입력 시 일치하는 작업만 보이는지 확인 | PASS |
| localStorage 저장 | `public/tests.html` 브라우저 실행 | `useEffect`를 통해 작업 목록이 저장소에 반영되는지 확인 | PASS |
| 작업 수정 흐름 | `public/tests.html` 브라우저 실행 | 수정 모드에서 저장 후 제목 변경과 memo 재계산이 정상 동작하는지 확인 | PASS |
| memo 재계산 최적화 | `public/tests.html` 브라우저 실행 | 의존성이 바뀔 때만 filtered list memo가 재계산되는지 확인 | PASS |

**기능 테스트 총 결과:** `8 / 8 PASS`

---

### 3. 최종 테스트 요약

| 테스트 종류 | 결과 |
| --- | --- |
| 단위 테스트 | `20 / 20 PASS` |
| 기능 테스트 | `8 / 8 PASS` |
| 전체 | `28 / 28 PASS` |

> 참고: 브라우저 실행 중 `favicon.ico` 404가 1건 있었지만 테스트 로직과 기능 결과에는 영향이 없었습니다.

---

## 프로젝트 구조

```text
week5_react/
├── public/
│   ├── index.html
│   └── tests.html
├── styles/
│   └── main.css
├── src/
│   ├── main.js
│   ├── sampleMarkup.js
│   ├── core/
│   │   ├── component.js
│   │   ├── diff.js
│   │   ├── hooks.js
│   │   ├── patch.js
│   │   ├── scheduler.js
│   │   └── vdom.js
│   ├── state/
│   │   └── store.js
│   └── ui/
│       └── appUi.js
├── tests/
│   ├── node-logic-tests.js
│   └── runTests.js
├── package.json
└── README.md


