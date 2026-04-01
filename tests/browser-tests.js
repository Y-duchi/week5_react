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
      name: "입력하면 상호작용 패널에 draftTitle 변화가 보인다",
      async run() {
        const input = sandbox.querySelector('[data-action="update-draft-title"]');
        input.value = "브라우저 테스트 발표 준비";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();

        const title = sandbox.querySelector("#interaction-title")?.textContent ?? "";
        const changes = sandbox.querySelector("#interaction-state-changes")?.textContent ?? "";

        assert(title.includes("input"), "상호작용 제목이 input 입력으로 바뀌어야 합니다.");
        assert(changes.includes("draftTitle"), "draftTitle 변화가 보여야 합니다.");
      },
    },
    {
      name: "작업 추가 후 tasks hook 변화가 보인다",
      async run() {
        sandbox.querySelector('[data-action="add-task"]')?.click();
        await flush();

        const text = sandbox.querySelector(".task-grid")?.textContent ?? "";
        const hooks = sandbox.querySelector("#interaction-hook-changes")?.textContent ?? "";
        assert(text.includes("브라우저 테스트 발표 준비"), "새 작업이 목록에 추가되어야 합니다.");
        assert(hooks.includes("Hook[1]"), "tasks hook 변화가 보여야 합니다.");
      },
    },
    {
      name: "작업 선택 후 메모 수정이 된다",
      async run() {
        sandbox.querySelector('[data-action="select-task"][data-id="4"]')?.click();
        await flush();

        const textarea = sandbox.querySelector('[data-action="update-task-note"]');
        textarea.value = "mount 와 update 설명을 먼저 한다.";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        await flush();

        const changes = sandbox.querySelector("#interaction-state-changes")?.textContent ?? "";
        assert(
          sandbox.querySelector('[data-action="update-task-note"]')?.value.includes("mount 와 update 설명을 먼저 한다."),
          "메모가 수정되어야 합니다.",
        );
        assert(changes.includes("note"), "note 변화가 요약 패널에 보여야 합니다.");
      },
    },
    {
      name: "필터 변경 후 runtime hook delta가 보인다",
      async run() {
        sandbox.querySelector('[data-action="toggle-task"][data-id="4"]')?.click();
        sandbox.querySelector('[data-action="set-filter"][data-filter="done"]')?.click();
        await flush();

        const runtimeHookDelta = sandbox.querySelector("#runtime-hook-delta")?.textContent ?? "";
        const renderCount = Number(sandbox.querySelector("#runtime-render-count")?.textContent ?? "0");
        assert(runtimeHookDelta.includes("filter"), "runtime hook delta에 filter 변화가 보여야 합니다.");
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
