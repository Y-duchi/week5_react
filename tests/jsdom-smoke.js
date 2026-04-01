import { JSDOM } from "jsdom";

const dom = new JSDOM(
  `<!doctype html><html lang="ko"><body><div id="app"></div></body></html>`,
  {
    url: "http://localhost/",
    pretendToBeVisual: true,
  },
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
globalThis.HTMLOptionElement = dom.window.HTMLOptionElement;
globalThis.HTMLDetailsElement = dom.window.HTMLDetailsElement;
globalThis.DocumentFragment = dom.window.DocumentFragment;
globalThis.queueMicrotask = queueMicrotask;

const { mountApplication } = await import("../src/main.js");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function click(selector) {
  const node = document.querySelector(selector);

  if (!node) {
    throw new Error(`Missing node for selector: ${selector}`);
  }

  node.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

function type(selector, value) {
  const node = document.querySelector(selector);

  if (!node) {
    throw new Error(`Missing node for selector: ${selector}`);
  }

  node.value = value;
  node.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}

const root = document.querySelector("#app");
const controller = mountApplication(root);

type('[data-action="update-draft-title"]', "QA 답변 정리");
click('[data-action="add-task"]');
await new Promise((resolve) => setTimeout(resolve, 0));
click('[data-action="select-task"][data-id="4"]');
type('[data-action="update-task-note"]', "실제 React와의 차이점도 같이 설명한다.");
click('[data-action="toggle-task"][data-id="4"]');
click('[data-action="set-filter"][data-filter="done"]');

await new Promise((resolve) => setTimeout(resolve, 0));

assert(
  document.body.textContent?.includes("QA 답변 정리"),
  "새 작업 텍스트가 화면에 보여야 합니다.",
);
assert(
  document.body.textContent?.includes("실제 React와의 차이점도 같이 설명한다."),
  "수정한 메모가 보여야 합니다.",
);
assert(
  Number(document.querySelector("#runtime-render-count")?.textContent ?? "0") >= 4,
  "렌더 횟수가 증가해야 합니다.",
);
assert(
  document.querySelector("#root-state-json")?.textContent?.includes('"filter": "done"'),
  "root state snapshot에 filter 상태가 보여야 합니다.",
);

console.log("PASS jsdom smoke");

controller.destroy();
