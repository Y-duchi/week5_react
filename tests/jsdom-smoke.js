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

const root = document.querySelector("#app");
const controller = mountApplication(root);

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

click('[data-action="set-section"][data-section="requirements"]');
type('[data-action="search-query"]', "hooks");
click('[data-action="toggle-important"]');
click('[data-action="next-step"]');

await new Promise((resolve) => setTimeout(resolve, 0));

assert(
  document.querySelector('[data-role="section-title"]')?.textContent === "요구사항",
  "요구사항 섹션으로 이동하지 않았습니다.",
);
assert(
  document.querySelector("#pipeline-current-title")?.textContent === "3. diff + patch",
  "렌더 단계가 기대값과 다릅니다.",
);
assert(
  Number(document.querySelector("#runtime-render-count")?.textContent ?? "0") >= 3,
  "렌더 횟수가 증가하지 않았습니다.",
);
assert(
  document.body.textContent?.toLowerCase().includes("hooks"),
  "검색 결과에 hooks 문구가 남지 않았습니다.",
);

console.log("PASS jsdom smoke");

controller.destroy();
