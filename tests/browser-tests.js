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
        assert(title?.textContent === "목적", "첫 섹션 제목이 목적이어야 합니다.");
      },
    },
    {
      name: "탭 클릭으로 다른 섹션을 보여준다",
      run() {
        sandbox
          .querySelector('[data-action="set-section"][data-section="quality"]')
          ?.click();

        const title = sandbox.querySelector('[data-role="section-title"]');
        assert(title?.textContent === "품질", "품질 탭으로 이동해야 합니다.");
      },
    },
    {
      name: "검색 입력으로 카드가 필터링된다",
      run() {
        sandbox
          .querySelector('[data-action="set-section"][data-section="requirements"]')
          ?.click();

        const search = sandbox.querySelector('[data-action="search-query"]');
        search.value = "hooks";
        search.dispatchEvent(new Event("input", { bubbles: true }));

        const cards = [...sandbox.querySelectorAll(".detail-card")].map((node) => node.textContent);
        assert(cards.some((text) => text.includes("useState")), "hooks 관련 카드가 남아야 합니다.");
      },
    },
    {
      name: "체크리스트 토글이 완료 수치를 갱신한다",
      run() {
        sandbox
          .querySelector('[data-action="toggle-checklist"][data-id="hooks"]')
          ?.click();

        const completed = sandbox.querySelector("#metric-completed");
        assert(completed?.textContent === "1", "완료 체크 수가 1이어야 합니다.");
      },
    },
    {
      name: "런타임 패널이 렌더 횟수를 보여준다",
      run() {
        const renderCount = Number(sandbox.querySelector("#runtime-render-count")?.textContent ?? "0");
        assert(renderCount >= 4, "여러 상호작용 후 렌더 횟수가 증가해야 합니다.");
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
