import { mountApplication } from "../src/main.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function addResult(output, label, status, detail = "") {
  const row = document.createElement("div");
  row.className = status === "PASS" ? "test-result is-pass" : "test-result is-fail";
  row.innerHTML = `<strong>${status}</strong><span>${label}</span><small>${detail}</small>`;
  output.append(row);
}

export function runBrowserTests(output) {
  const sandbox = document.createElement("div");
  sandbox.className = "browser-test-sandbox";
  document.body.append(sandbox);

  const controller = mountApplication(sandbox);

  const tests = [
    {
      name: "초기 섹션은 목적이다",
      run() {
        const title = sandbox.querySelector('[data-role="section-title"]');
        assert(title?.textContent === "목적", "초기 섹션이 목적이어야 합니다.");
      },
    },
    {
      name: "탭 클릭으로 요구사항 섹션으로 이동한다",
      run() {
        sandbox
          .querySelector('[data-action="set-section"][data-section="requirements"]')
          ?.click();

        const title = sandbox.querySelector('[data-role="section-title"]');
        assert(title?.textContent === "요구사항", "요구사항 탭으로 이동해야 합니다.");
      },
    },
    {
      name: "검색어 hooks로 문서가 필터링된다",
      run() {
        const input = sandbox.querySelector('[data-action="search-query"]');
        input.value = "hooks";
        input.dispatchEvent(new Event("input", { bubbles: true }));

        const text = sandbox.querySelector(".document-panel")?.textContent ?? "";
        assert(text.toLowerCase().includes("hooks"), "검색 결과에 hooks 문구가 남아야 합니다.");
      },
    },
    {
      name: "핵심만 보기 토글이 동작한다",
      run() {
        const button = sandbox.querySelector('[data-action="toggle-important"]');
        button?.click();

        assert(
          button?.getAttribute("aria-pressed") === "true",
          "핵심만 보기 버튼이 활성화 상태여야 합니다.",
        );
      },
    },
    {
      name: "렌더 단계 넘기기가 파이프라인 제목을 바꾼다",
      run() {
        sandbox.querySelector('[data-action="next-step"]')?.click();

        const stepTitle = sandbox.querySelector("#pipeline-current-title");
        assert(
          stepTitle?.textContent?.includes("2. render + Virtual DOM 생성"),
          "다음 단계로 넘어가야 합니다.",
        );
      },
    },
    {
      name: "런타임 패널에 렌더 횟수가 표시된다",
      run() {
        const renderCount = Number(sandbox.querySelector("#runtime-render-count")?.textContent ?? "0");
        assert(renderCount >= 4, "상호작용 후 렌더 횟수가 증가해야 합니다.");
      },
    },
  ];

  try {
    tests.forEach((test) => {
      test.run();
      addResult(output, test.name, "PASS");
    });
  } catch (error) {
    addResult(output, "브라우저 테스트", "FAIL", error.message);
  } finally {
    controller.destroy();
    sandbox.remove();
  }
}
