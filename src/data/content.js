function item(text, children = [], options = {}) {
  return {
    text,
    children,
    important: options.important ?? false,
  };
}

export const studentProfile = {
  name: "황선호",
  email: "hikkcom40@gmail.com",
  track: "내 학습",
  stage: "컴퓨팅 사고로의 전환",
  event: "수요 코딩회 (수요일)",
};

export const learningTrail = [
  "SW-AI 12기",
  "본과정",
  "출석 체크",
  "내 학습",
  "컴퓨팅 사고로의 전환",
  "수요 코딩회 (수요일)",
];

export const assignmentSections = [
  {
    id: "purpose",
    title: "목적",
    nodes: [
      item("단 하루, AI를 도구 삼아 팀별 프로젝트에 몰입합니다."),
      item(
        "결과물뿐만 아니라 과정도 중요합니다. AI가 작성한 코드를 완벽히 내 것으로 소화해 그 원리를 설명할 수 있어야 합니다.",
        [],
        { important: true },
      ),
      item("낯선 기능도 Top-down으로 빠르게 풀어내며 '학습 민첩성'을 극대화하고, 현업 레벨의 기술을 직접 부딪쳐보며 실무 감각을 깨우쳐 보세요."),
    ],
  },
  {
    id: "requirements",
    title: "요구사항",
    nodes: [
      item(
        "이번 주 과제는 기존 React의 핵심 기능인 Component · State · Hooks를 직접 구현하고 이를 활용하여 동작하는 웹 페이지를 만들어 보는 것입니다.",
        [],
        { important: true },
      ),
      item("Component(컴포넌트)", [
        item("Component는 UI를 나누는 작은 단위입니다."),
        item("각각의 Component는 자신만의 로직과 렌더링을 담당합니다."),
        item("반드시 함수형 컴포넌트로 구현합니다.", [], { important: true }),
        item("구현 방식", [
          item("함수형 컴포넌트를 감싸는 FunctionComponent 클래스를 직접 만듭니다.", [], {
            important: true,
          }),
          item("이 클래스에는 아래 기능이 필요합니다.", [
            item("hooks 배열 (상태 저장용)", [], { important: true }),
            item("mount(): 처음 렌더링", [], { important: true }),
            item("update(): 상태 변경 후 다시 렌더링", [], { important: true }),
          ]),
        ]),
        item("제약조건(중요)", [
          item("Hook은 최상위 컴포넌트에서만 사용 가능합니다.", [], { important: true }),
          item("State(상태)는 최상위 컴포넌트(루트 컴포넌트)에서만 관리합니다.", [], {
            important: true,
          }),
          item(
            "자식 컴포넌트는 state를 가지지 않고, 부모로부터 전달받은 props만 사용합니다. (Lifting State Up 패턴)",
            [],
            { important: true },
          ),
          item("즉, 자식 컴포넌트는 상태 없이 props만 받아서 사용하는 순수 함수로 구현합니다.", [], {
            important: true,
          }),
        ]),
      ]),
      item("State (상태)", [
        item("State는 값이 변경될 수 있는 동적 데이터입니다."),
        item("State가 바뀌면 화면이 자동으로 다시 그려져야 합니다.", [], { important: true }),
      ]),
      item("Hooks", [
        item("함수형 컴포넌트에서도 상태와 생명주기를 사용할 수 있게 해주는 기능입니다."),
        item("최소 구현 대상", [
          item("useState", [], { important: true }),
          item("useEffect", [], { important: true }),
          item("useMemo", [], { important: true }),
        ]),
        item(
          "핵심질문: 함수는 매번 새로 실행되는데, 상태는 어떻게 유지할까? 이 문제를 해결하는 것이 Hooks의 핵심입니다.",
          [],
          { important: true },
        ),
      ]),
      item("Virtual DOM + Diff + Patch", [
        item("Week 3에서 만든 Virtual DOM을 활용합니다.", [], { important: true }),
        item("동작 흐름", [
          item("Virtual DOM 생성", [], { important: true }),
          item("이전 Virtual DOM과 비교 (Diff)", [], { important: true }),
          item("바뀐 부분만 실제 DOM에 반영 (Patch)", [], { important: true }),
        ]),
        item("목표: 전체를 다시 그리지 않고 필요한 부분만 업데이트", [], { important: true }),
      ]),
      item("테스트 페이지 개발", [
        item("Week 3과 Week 4에서 구현한 내용을 활용하여 브라우저에서 동작하는 웹 페이지를 구현합니다."),
        item("어떤 주제라도 상관 없습니다. 다만, 반드시 사용자의 입력/클릭 등에 따라 화면이 변경되어야 합니다.", [], {
          important: true,
        }),
      ]),
      item("기술 제한", [
        item("Javascript(or Typescript)", [], { important: true }),
        item("HTML, CSS", [], { important: true }),
        item("외부 프레임워크(React, Vue 등) 사용 금지", [], { important: true }),
      ]),
      item("학습보다는 구현이 우선입니다. AI 등을 적극적으로 활용하여 결과물을 만들어내는 것이 최우선 목표입니다.", [], {
        important: true,
      }),
      item("다만, 만들어진 결과물 중 핵심 로직에 대해서는 이해하고 설명할 수 있어야 합니다.", [], {
        important: true,
      }),
      item("코드를 직접 작성하기 어려운 경우, 전체 코드를 AI를 통해 생성해도 괜찮습니다. 다만, 생성된 코드를 반드시 학습하고 그 원리를 이해해야 합니다."),
      item("추가적으로, 다른 팀과의 차별점을 둘 수 있는 추가 구현 요소에 대해서도 함께 고민해 보시기 바랍니다."),
    ],
  },
  {
    id: "focus",
    title: "중점 포인트",
    nodes: [
      item("UI를 어떻게 Component로 나눌 것인가?", [], { important: true }),
      item("State(상태)는 어디에 두는 것이 좋은가?", [], { important: true }),
      item("setState는 상태 변경 외에 무엇을 해야 할까?", [], { important: true }),
      item("여러 상태 변경을 한 번에 처리하는 방법은?", [
        item("Batching 방법을 고민해 보세요. 단 선택 과제입니다."),
      ], { important: true }),
      item("이번 주에 구현한 React와 실제 React의 차이점에 대해서 공부해 보세요."),
    ],
  },
  {
    id: "quality",
    title: "품질",
    nodes: [
      item("단위 테스트를 통해 각 모듈을 검증합니다.", [], { important: true }),
      item("기능 테스트를 통해 화면이 제대로 동작하는지 확인합니다.", [], { important: true }),
      item("엣지 케이스를 최대한 고려합니다."),
      item("이력서와 포트폴리오에 포함할 수 있을 만큼 완성도 높은 수준으로 구현합니다.", [], {
        important: true,
      }),
    ],
  },
  {
    id: "presentation",
    title: "결과물 발표",
    nodes: [
      item("목요일 오전", [
        item("각 팀이 발표를 통해 프로젝트를 서로 공유하는 시간을 갖습니다."),
        item("본인 팀에서 만든 프로젝트를 간단히 데모 합니다."),
        item("발표자료는 따로 만들지 않고, 깃헙 레포지토리의 README.md를 기준으로 설명합니다.", [], {
          important: true,
        }),
        item(
          "AI를 활용해 빠르게 구현하는 것만큼, 생성된 코드에 대한 철저한 검증과 테스트도 중요합니다. 반드시 테스트 케이스를 작성하고 검증 과정을 수행 후에, 그 내용을 데모 발표에도 포함해 보세요.",
          [],
          { important: true },
        ),
        item("발표시간 4분, QnA 시간 1분", [], { important: true }),
      ]),
    ],
  },
];

export const pipelineSteps = [
  {
    title: "1. state 변경",
    detail: "버튼 클릭이나 입력 이벤트가 루트 FunctionComponent의 useState setter를 호출합니다.",
  },
  {
    title: "2. render + Virtual DOM 생성",
    detail: "루트 컴포넌트 함수가 다시 실행되고 새로운 Virtual DOM 트리가 만들어집니다.",
  },
  {
    title: "3. diff + patch",
    detail: "이전 VDOM과 새 VDOM을 비교하고 바뀐 실제 DOM만 부분 갱신합니다.",
  },
  {
    title: "4. effect 실행",
    detail: "렌더가 끝난 뒤 useEffect가 실행되어 제목이나 부가 상태를 동기화합니다.",
  },
];

export const engineHighlights = [
  "hooks는 루트 FunctionComponent에서만 사용합니다.",
  "자식 컴포넌트는 props만 받는 순수 함수입니다.",
  "setState 이후 update() -> diff() -> patchDom() -> useEffect 순서로 흐릅니다.",
  "reset 버튼은 여러 setState를 한 tick에서 묶어 batching 예시를 보여줍니다.",
];
