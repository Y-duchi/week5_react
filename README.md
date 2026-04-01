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
