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

  function flush() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  const tests = [
    {
      name: "초기 화면에 작업 목록이 보인다",
      async run() {
        const title = sandbox.querySelector(".task-title");
        assert(title?.textContent?.includes("FunctionComponent"), "초기 작업 카드가 보여야 합니다.");
      },
    },
    {
      name: "입력 후 작업 추가가 된다",
      async run() {
        const input = sandbox.querySelector('[data-action="update-draft-title"]');
        input.value = "브라우저 테스트 발표 준비";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        sandbox.querySelector('[data-action="add-task"]')?.click();
        await flush();

        const text = sandbox.querySelector(".task-grid")?.textContent ?? "";
        assert(text.includes("브라우저 테스트 발표 준비"), "새 작업이 목록에 추가되어야 합니다.");
      },
    },
    {
      name: "완료 필터가 동작한다",
      async run() {
        sandbox.querySelector('[data-action="set-filter"][data-filter="done"]')?.click();
        await flush();

        const text = sandbox.querySelector(".task-grid")?.textContent ?? "";
        assert(text.includes("diff / patch 로그 확인"), "완료 작업 카드가 보여야 합니다.");
      },
    },
    {
      name: "작업 선택 후 메모 수정이 된다",
      async run() {
        sandbox.querySelector('[data-action="set-filter"][data-filter="all"]')?.click();
        sandbox.querySelector('[data-action="select-task"][data-id="1"]')?.click();
        await flush();

        const textarea = sandbox.querySelector('[data-action="update-task-note"]');
        textarea.value = "mount 와 update 설명을 먼저 한다.";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();

        assert(
          sandbox.querySelector('[data-action="update-task-note"]')?.value.includes("mount 와 update 설명을 먼저 한다."),
          "메모가 수정되어야 합니다.",
        );
      },
    },
    {
      name: "런타임 패널에 렌더 횟수가 보인다",
      async run() {
        const renderCount = Number(sandbox.querySelector("#runtime-render-count")?.textContent ?? "0");
        assert(renderCount >= 4, "상호작용 후 렌더 횟수가 증가해야 합니다.");
      },
    },
  ];

  (async () => {
    try {
      for (const test of tests) {
        await test.run();
        addResult(output, test.name, "PASS");
      }
    } catch (error) {
      addResult(output, "브라우저 테스트", "FAIL", error.message);
    } finally {
      controller.destroy();
      sandbox.remove();
    }
  })();
}
